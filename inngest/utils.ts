export type User = {
  id: string;
  email: string;
  prompts: {
    id: string;
    label: string;
    user_id: string;
    created_at: string;
    prompt_text: string;
  }[];
};
// export type Rules = Pick<User, "prompts">;
export type Rules = User["prompts"];

export type ZohoWebhookEmail = {
  summary: string;
  sentDateInGMT: number;
  subject: string;
  Mode: number;
  messageId: number;
  toAddress: string;
  folderId: number;
  zuid: number;
  size: number;
  sender: string;
  receivedTime: number;
  fromAddress: string;
  html: string;
  messageIdString: string;
  IntegIdList: string;
};

export type EmailForLLM = {
  toAddress: string;
  fromAddress: string;
  senderName?: string;
  subject: string;
  summary: string;
  // messageId: string;
  // zuid: string;
};

export function stringifyEmail(email: EmailForLLM, maxLength: number) {
  return (
    `From: ${email.fromAddress}` +
    `\nSubject: ${email.subject}` +
    `\nBody: ${truncate(email.summary, maxLength)}` +
    `${email.toAddress ? `\nTo: ${email.toAddress}` : ""}` +
    `${email.senderName ? `\nSender-Name: ${email.subject}` : ""}`
  );
}

export function truncate(str: string, length: number) {
  return str.length > length ? str.slice(0, length) + "..." : str;
}

/**
 *
 * @param input
 * Extracts the email from the angle brackets
 *
 * `<emee-dev@zohomail.com>` -> `emee-dev@zohomail.com`
 */
export function extractEmail(input: string): string | null {
  const emailRegex = /<([^>]+)>/;
  const match = input.match(emailRegex);
  return match ? match[1] : null;
}

import { clientId, clientSecret } from "@/app/api/webhooks/oauth/controller";
import axios, { AxiosRequestConfig } from "axios";

type UpdateMessageParams = {
  accountId: string;
  token: string;
  messageId: number;
};

type ArchiveMessageParams = {
  accountId: string;
  token: string;
  messageId: number;
};

export type SendEmailParams = {
  accountId: string;
  token: string;
  fromAddress: string;
  toAddress: string;
  ccAddress?: string;
  bccAddress?: string;
  subject: string;
  content: string;
  askReceipt?: string;
};

export async function markAsSpam({
  accountId,
  token,
  messageId,
}: UpdateMessageParams): Promise<any> {
  const url = `https://mail.zoho.com/api/accounts/${accountId}/updatemessage`;
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Zoho-oauthtoken ${token}`,
  };
  const data = {
    mode: "moveToSpam",
    messageId: [messageId],
  };

  const config: AxiosRequestConfig = {
    headers,
  };

  try {
    const response = await axios.put(url, data, config);
    return response.data;
  } catch (error: any) {
    console.error(error);
    return error.message;
  }
}

export async function archiveMessage({
  accountId,
  token,
  messageId,
}: ArchiveMessageParams): Promise<any> {
  const url = `https://mail.zoho.com/api/accounts/${accountId}/updatemessage`;
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Zoho-oauthtoken ${token}`,
  };
  const data = {
    mode: "archiveMails",
    messageId: [messageId],
  };

  const config: AxiosRequestConfig = {
    headers,
  };

  try {
    const response = await axios.put(url, data, config);
    return response.data;
  } catch (error: any) {
    console.error(error);
    return error.message;
  }
}

export async function sendEmail({
  token,
  accountId,
  fromAddress,
  toAddress,
  ccAddress,
  bccAddress,
  subject,
  content,
  askReceipt = "no",
}: SendEmailParams): Promise<any> {
  const url = `https://mail.zoho.com/api/accounts/${accountId}/messages`;
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Zoho-oauthtoken ${token}`,
  };
  const data = {
    fromAddress,
    toAddress,
    ccAddress,
    bccAddress,
    subject,
    content,
    askReceipt,
  };

  const config: AxiosRequestConfig = {
    headers,
  };

  try {
    const response = await axios.post(url, data, config);
    return response.data;
  } catch (error: any) {
    console.error(error);
    return error.message;
  }
}

type ReplyEmailParams = {
  token: string;
  accountId: string;
  messageId: string;
  fromAddress: string;
  toAddress: string;
  ccAddress?: string;
  bccAddress?: string;
  subject: string;
  content: string;
  askReceipt?: string;
};

export async function replyToEmail({
  accountId,
  token,
  messageId,
  fromAddress,
  toAddress,
  ccAddress,
  bccAddress,
  subject,
  content,
  askReceipt = "no",
}: ReplyEmailParams): Promise<any> {
  const url = `https://mail.zoho.com/api/accounts/${accountId}/messages/${messageId}`;
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Zoho-oauthtoken ${token}`,
  };
  const data = {
    fromAddress,
    toAddress,
    ccAddress,
    bccAddress,
    subject,
    content,
    askReceipt,
    action: "reply",
  };

  const config: AxiosRequestConfig = {
    headers,
  };

  try {
    const response = await axios.post(url, data, config);
    return response.data;
  } catch (error: any) {
    console.error(error);
    return error.message;
  }
}

export async function refreshAccessToken(refreshToken: string) {
  const params = new URLSearchParams();
  params.append("refresh_token", refreshToken);
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("grant_type", "refresh_token");

  try {
    const response = await axios.post(
      "https://accounts.zoho.com/oauth/v2/token",
      params
    );
    return response.data;
  } catch (error) {
    console.error("Error refreshing access token", error);
    return null;
  }
}
