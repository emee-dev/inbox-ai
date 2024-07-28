import { createClient } from "@/utils/supabase/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";
import { inngest } from "./client";
import {
  archiveMessage,
  markAsSpam,
  refreshAccessToken,
  replyToEmail,
  Rules,
  sendEmail,
  stringifyEmail,
  ZohoWebhookEmail,
} from "./utils";
import { NonRetriableError } from "inngest";

type UserToken = {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  created_at: string;
};

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { event, body: "Hello, World!", boy: "yes" };
  }
);

export const AIHandler = inngest.createFunction(
  { id: "on-new-emails" },
  { event: "app/email.recieved" },
  async ({ event, step }) => {
    let { email, user }: { email: ZohoWebhookEmail; user: string } = event.data;

    const supabase = createClient();

    let getUser = await step
      .run("get-user-from-db", async () => {
        // let resData = {
        //   id: "b1a72a0d-18d6-4c8d-b27d-5f95c2b1d5c6",
        //   email: "john.doe@example.com",
        //   prompts: [
        //     {
        //       id: "e7b7cfd3-8a35-4f8c-9a36-9e5d7350e0bb",
        //       label: "Important Emails",
        //       user_id: "b1a72a0d-18d6-4c8d-b27d-5f95c2b1d5c6",
        //       created_at: "2024-07-25T12:10:00",
        //       prompt_text: 'Label all emails from "example.com" as important',
        //     },
        //   ],
        // };

        let { data, error, status } = await supabase
          .from("users")
          .select(
            `
          id,
          email,
          accountid,
          prompts (*),
          user_tokens (*)
        `
          )
          .eq("email", email)
          .maybeSingle();

        if (error) {
          let err = new Error(error.message);
          err.name = "SupabaseError";
          throw err;
        }

        if (!data) {
          let error = new Error("Could not find user");
          error.name = "SupabaseUserDataNotFound";
          throw error;
        }

        let user = {
          id: data.id,
          email: data.email,
          accountId: data.accountid,
        };
        let prompts = data.prompts;

        if (!prompts) {
          let error = new Error("Prompts not found");
          error.name = "NoPromptsNotFound";
          throw error;
        }

        console.log(data);
        return { user, prompts };
      })
      .catch((err) => {
        if (err.name === "SupabaseError") {
          throw new NonRetriableError(err.message);
        }

        if (err.name === "SupabaseUserDataNotFound") {
          throw new NonRetriableError(err.message);
        }
        if (err.name === "NoPromptsNotFound") {
          throw new NonRetriableError(err.message);
        }
      });

    let getUserToken = await step
      .run("get-user-access-token", async () => {
        if (!getUser) return;
        let userId = getUser.user.id;

        // Fetch the user's token from the database
        const { data, error } = await supabase
          .from("user_tokens")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (error) {
          console.error("Error fetching user tokens", error);
          let err = new Error("Failed to fetch user tokens");
          err.name = "SupabaseFetchToken";
          throw err;
        }

        if (!data) {
          console.error("User token not found", error);
          let err = new Error("Failed to find tokens");
          err.name = "UserTokenNotFoundError";
          throw err;
        }

        const userToken: UserToken = data;

        // Check if the access token is expired
        const expiresAt = new Date(userToken.expires_at).getTime();
        const now = Date.now();

        if (expiresAt > now) {
          // Token is still valid
          return userToken.access_token;
        } else {
          // Token is expired, refresh it
          const newTokens = await refreshAccessToken(userToken.refresh_token);

          // Update the tokens in the database
          const updatedExpiresAt = new Date(
            Date.now() + newTokens.expires_in * 1000
          ).toISOString();

          const { error: updateError } = await supabase
            .from("user_tokens")
            .update({
              access_token: newTokens.access_token,
              refresh_token: newTokens.refresh_token,
              expires_at: updatedExpiresAt,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

          if (updateError) {
            console.error("Error updating user tokens", updateError);
            let err = new Error("Failed to update user tokens");
            err.name = "SupabaseUpdateTokenError";
            throw err;
          }

          return newTokens.access_token as string;
        }
      })
      .catch((err) => {
        if (err.name === "UserTokenNotFoundError") {
          throw new NonRetriableError(err.message);
        }
      });

    let response = {};

    if (getUser && getUserToken) {
      response = await step.run("execute-rule-using-llm", async () => {
        let userData = getUser;

        // if (!userData) {
        //   let error = new Error("User data was not found");
        //   error.name = "UserDataIsUndefined";
        //   throw error;
        // }

        // if (!getUserToken) {
        //   let error = new Error(
        //     "User Token was not found or could not be renewed."
        //   );
        //   error.name = "UserTokenUndefined";
        //   throw error;
        // }

        let token = getUserToken;
        let accountId = userData.user.accountId;

        const system = `
          You are an AI assistant that helps people manage their emails.
          Do nothing if you don't know how or what to do.
  
          These are the rules you can select from:
          ${userData.prompts
            .map((rule, i) => `${i + 1}. ${rule.prompt_text}`)
            .join("\n")}
        `;

        const prompt = `
          This email was received for processing. Select a rule to apply to it.
          Respond with a JSON object with the following fields:
          "rule" - the number of the rule you want to apply
          "reason" - the reason you chose that rule
  
          The email:
  
          ${stringifyEmail(
            {
              toAddress: email.toAddress,
              fromAddress: email.fromAddress,
              subject: email.subject,
              summary: email.summary,
              senderName: email.sender || undefined,
            },
            500
          )}
  
          Email meta if necessary:
          messageId: ${email.messageId}
          zuid: ${email.zuid}
        `;

        const result = await generateText({
          model: google("models/gemini-pro"),
          prompt,
          system,
          tools: {
            markEmailAsSpam: {
              description:
                "Use this function to mark an email as spam, extract addition arguments from the email meta",
              parameters: z.object({
                messageId: z
                  .string()
                  .describe("the messageId of the current email"),
              }),
              execute: async ({ messageId }) => {
                let response = await markAsSpam({
                  accountId,
                  token,
                  messageId,
                });
                return { response };
              },
            },
            archiveEmail: {
              description:
                "Use this function to archive an email, extract addition arguments from the email meta",
              parameters: z.object({
                messageId: z
                  .string()
                  .describe("the messageId of the current email"),
              }),
              execute: async ({ messageId }) => {
                let response = await archiveMessage({
                  accountId,
                  token,
                  messageId,
                });
                return { response };
              },
            },
            sendAnEmail: {
              description:
                "Use this function to send an email to an address, extract addition arguments from the email meta",
              parameters: z.object({
                fromAddress: z
                  .string()
                  .describe("Email address of the sender."),
                toAddress: z.string().describe("Email address of reciepient."),
                ccAddress: z.string().describe("ccAddress for the email"),
                bccAddress: z.string().describe("bccAddress for the email"),
                subject: z
                  .string()
                  .describe("the subject of the email to send"),
                content: z
                  .string()
                  .describe("The content of the email to send"),
              }),
              execute: async ({
                fromAddress,
                toAddress,
                ccAddress,
                bccAddress,
                subject,
                content,
              }) => {
                let response = await sendEmail({
                  token,
                  accountId,
                  fromAddress,
                  toAddress,
                  ccAddress,
                  bccAddress,
                  subject,
                  content,
                });
                return { response };
              },
            },
            replyToEmail: {
              description:
                "Use this function to reply to an email, extract addition arguments from the email meta",
              parameters: z.object({
                messageId: z
                  .string()
                  .describe("the messageId of the current email"),
                fromAddress: z
                  .string()
                  .describe("Email address of the sender."),
                toAddress: z.string().describe("Email address of reciepient."),
                ccAddress: z.string().describe("ccAddress for the email"),
                bccAddress: z.string().describe("bccAddress for the email"),
                subject: z
                  .string()
                  .describe("the subject of the email to send"),
                content: z
                  .string()
                  .describe("The content of the email to send"),
              }),
              execute: async ({
                messageId,
                fromAddress,
                toAddress,
                ccAddress,
                bccAddress,
                subject,
                content,
              }) => {
                let response = await replyToEmail({
                  token,
                  accountId,
                  messageId,
                  fromAddress,
                  toAddress,
                  ccAddress,
                  bccAddress,
                  subject,
                  content,
                });

                return { response };
              },
            },
          },
        });

        return {
          finishReason: result.finishReason,
          warnings: result.warnings,
          toolCalls: result.toolCalls,
          usage: result.usage,
        };
      });
    }

    // return { event, body: "Hello, World!", };
    return { event, ...response };
  }
);

/* 

Subject: Boost Testing Efficiency with AI (Quick Question)

Hi [Name],

Are you spending too much time on manual testing?

We help companies like yours automate tests with AI, saving significant time and resources.

Interested in a free consultation?

Best,
[Your Name]

*/
