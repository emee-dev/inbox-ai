import { inngest } from "@/inngest";
import { ZohoWebhookEmail } from "@/inngest/utils";
import { z } from "zod";

const zohoMailIncomingRequestSchema = z.object({
  summary: z.string(),
  sentDateInGMT: z.number(),
  subject: z.string(),
  Mode: z.number(),
  messageId: z.number(),
  toAddress: z.string(),
  folderId: z.number(),
  zuid: z.number(),
  size: z.number(),
  sender: z.string(),
  receivedTime: z.number(),
  fromAddress: z.string(),
  html: z.string(),
  messageIdString: z.string(),
  IntegIdList: z.string(),
});

export const GET = async (req: Request) => {
  return Response.json({ message: "Webhook is good to go." });
};

export const POST = async (req: Request, _: Response) => {
  try {
    let json = (await req.json()) as ZohoWebhookEmail;

    if (!json) {
      return Response.json({ message: "Invalid payload" }, { status: 404 });
    }

    let { success, error } = zohoMailIncomingRequestSchema.safeParse(json);

    if (!success) {
      return Response.json({ message: "Invalid payload" }, { status: 404 });
    }

    await inngest.send({
      name: "app/email.recieved", // This matches the event used in `createFunction`
      data: {
        email: json,
      },
    });

    return Response.json({ message: "Email was recieved sucessfully." });
  } catch (error: any) {
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
};
