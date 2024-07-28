import axios from "axios";
import { createClient } from "@/utils/supabase/server";
import fs from "node:fs/promises";
import { AccountData, ApiKey, clientId, clientSecret, frontend, GetZohoAccountDetails, redirectUri, scope } from "./controller";
import { NextResponse } from "next/server";

let api_key: ApiKey = {
  access_token:
    "1000.747df1fc7470309bec579f937bf3156e.185cf622e9aaf10e251d6677d2f111be",
  refresh_token:
    "1000.9e1fba6fee2d23f04d9e7a3b6fba6524.92126ee7f2918b91e36e7f92c5473e1c",
  scope: "ZohoMail.messages.ALL ZohoMail.accounts.ALL",
  api_domain: "https://www.zohoapis.com",
  token_type: "Bearer",
  expires_in: 3600,
};

// mailboxaddress, primaryemailaddress, zoho_zuid, accountid, firstname, lastname

// let getZohoAccountDetails: AccountData = {
//   status: {
//     code: 200,
//     description: "success",
//   },
//   data: [
//     {
//       country: "ng",
//       lastLogin: 1722113564885,
//       mxStatus: true,
//       activeSyncEnabled: false,
//       incomingBlocked: false,
//       language: "en",
//       type: "ZOHO_ACCOUNT",
//       extraStorage: {},
//       incomingUserName: "emee-dev@zohomail.com",
//       emailAddress: [
//         {
//           isAlias: false,
//           isPrimary: false,
//           mailId: "emee-dev@zohomail.com",
//           isConfirmed: true,
//         },
//         {
//           isAlias: false,
//           isPrimary: true,
//           mailId: "emmanuelajike2000@gmail.com",
//           isConfirmed: true,
//         },
//       ],
//       mailboxStatus: "enabled",
//       popBlocked: false,
//       usedStorage: 210,
//       spamcheckEnabled: true,
//       imapAccessEnabled: false,
//       timeZone: "Africa/Lagos",
//       accountCreationTime: 1669930365197,
//       zuid: 797009692,
//       webBlocked: false,
//       planStorage: 5,
//       firstName: "Emmanuel",
//       accountId: "639307000000008002",
//       sequence: 1,
//       mailboxAddress: "emee-dev@zohomail.com",
//       lastPasswordReset: -1,
//       tfaEnabled: false,
//       iamStatus: 1,
//       status: false,
//       lastName: "Ajike",
//       accountDisplayName: "emee-dev",
//       role: "member",
//       gender: "MALE",
//       accountName: "zohomail",
//       displayName: "emee-dev",
//       isLogoExist: true,
//       URI: "https://mail.zoho.com/api/accounts/639307000000008002",
//       primaryEmailAddress: "emmanuelajike2000@gmail.com",
//       enabled: true,
//       mailboxCreationTime: 1720247909888,
//       basicStorage: "free",
//       lastClient: "WEB_ZM",
//       allowedStorage: 5242880,
//       sendMailDetails: [
//         {
//           sendMailId: "639307000000008004",
//           displayName: "Emmanuel Ajike",
//           serverName: "smtpout.mail.zoho.com",
//           signatureId: "639307000000008030",
//           serverPort: 25,
//           userName: "emee-dev@zohomail.com",
//           connectionType: "plain",
//           mode: "mailbox",
//           validated: false,
//           fromAddress: "emee-dev@zohomail.com",
//           smtpConnection: 0,
//           validationRequired: true,
//           validationState: 0,
//           status: true,
//         },
//       ],
//       popFetchTime: -1,
//       address: {},
//       planType: 0,
//       userExpiry: -1,
//       popAccessEnabled: false,
//       imapBlocked: false,
//       iamUserRole: "member",
//       outgoingBlocked: false,
//       policyId: {
//         zoid: -1,
//         "1082700000000623001": "Zoho Mail Policy",
//       },
//       smtpStatus: true,
//       extraEDiscoveryStorage: {},
//     },
//   ],
// };

// POST http://localhost:3000/api/webhooks/oauth
// POST https://xxzbrx9p-3000.uks1.devtunnels.ms/api/webhooks/oauth

export async function GET(req: Request) {
  const supabase = createClient();

  let url = new URL(req.url);

  let code = url.searchParams.get("code");

  if (!code || typeof code !== "string") {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("redirect_uri", redirectUri);
  params.append("scope", scope);
  params.append("code", code);

  try {
    const url = "https://accounts.zoho.com/oauth/v2/token?" + params.toString();

    let config = {
      method: "POST",
      maxBodyLength: Infinity,
      url: url,
      headers: {},
    };

    const response = await axios.request(config);

    const { access_token } = response.data;
    // console.log("oauth token", response.data);

    if (!access_token) {
      throw new Error("No token was returned");
    }

    // Fetch the user's email using the access token
    const getAllAccountsOfAUser = await axios.get(
      "https://mail.zoho.com/api/accounts",
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${access_token}`,
          Accept: "application/json",
        },
      }
    );

    let tokenData: ApiKey = response.data;
    let allAccountsResponse: GetZohoAccountDetails = getAllAccountsOfAUser.data;
    let allAccounts: AccountData = allAccountsResponse.data[0];

    // console.log("token response", response.data);
    // console.log("getAllAccountsOfAUser", allAccounts);

    // Find the user if it exists
    const findUser = await supabase
      .from("users")
      .select("*")
      .eq("email", allAccounts.mailboxAddress)
      .eq("primaryemailaddress", allAccounts.primaryEmailAddress);

    if (findUser.error) {
      console.log(findUser.error.message);
      throw findUser.error;
    }

    if (findUser.data) {
      console.log("found user", findUser.data);
    }
    //   Add new user
    const newUser = await supabase
      .from("users")
      .insert([
        {
          firstname: allAccounts.firstName,
          lastname: allAccounts.lastName,
          primaryemailaddress: allAccounts.primaryEmailAddress,
          email: allAccounts.mailboxAddress,
          zoho_zuid: allAccounts.zuid,
          accountid: allAccounts.accountId,
          passwordhash: "hashedpassword123",
        },
      ])
      .select();

    if (newUser.error) {
      console.log(newUser.error.message);
      throw newUser.error;
    }

    if (!newUser.data || newUser.data.length === 0) {
      console.log("Could not add newUser to database");
      return;
    }

    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
    //   Add the token
    const token = await supabase
      .from("user_tokens")
      .insert([
        {
          user_id: newUser.data[0].id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_in: expiresAt,
        },
      ])
      .select();

    if (token.error) {
      throw token.error;
    }

    return NextResponse.redirect(
      new URL(`${frontend}/dashboard?email=${allAccounts.mailboxAddress}`)
    );
  } catch (error: any) {
    console.error("Error fetching tokens from Zoho", error.message);

    let err = handleAxiosError(error);
    return Response.json({ message: "Error fetching tokens from Zoho", err });
  }
}

function handleAxiosError(error: any) {
  // Check if it's an Axios error
  if (axios.isAxiosError(error)) {
    const serverErrorMessage = error.response?.data || "No response data";
    const statusCode = error.response?.status || "No status code";
    console.error("Server error message:", serverErrorMessage);
    console.error("Status code:", statusCode);

    return {
      message: "Error fetching tokens from Zoho",
      error: serverErrorMessage,
      status: statusCode,
    };
  } else {
    // Handle non-Axios errors
    console.error("Non-Axios error:", error);
    return {
      message: "Non-Axios error",
      error: error.message,
    };
  }
}
