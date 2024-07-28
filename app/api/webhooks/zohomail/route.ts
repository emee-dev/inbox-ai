import { inngest } from "@/inngest";

export const GET = async (req: Request, res: Response) => {
  // let json = await req.json();
  // console.log("reqwest body", json);

  await inngest.send({
    name: "app/user.created", // This matches the event used in `createFunction`
    data: {
      email: "test@example.com",
      // any data you want to send
    },
  });

  return Response.json({ message: "This is get request." });
};

export const POST = async (req: Request, res: Response) => {
  let json = await req.json();
  console.log("reqwest body", json);

  return Response.json({ message: "This is good." });
};

let zohoMailIncomingRequest = {
  summary:
    "Hi this is good On Sat, Jul 20, 2024 at 6:40 PM Emmanuel Ajike &lt;emmanuelajike2000@gmail.com&gt; wrote:",
  sentDateInGMT: 1721623981000,
  subject: "Re: Testing initial mail",
  Mode: 0,
  messageId: 1721598796226130400,
  toAddress: "<emee-dev@zohomail.com>",
  folderId: 639307000000008100,
  zuid: 797009692,
  size: 936,
  sender: "Emmanuel Ajike",
  receivedTime: 1721598796216,
  fromAddress: "emmanuelajike2000@gmail.com",
  html:
    '<div><div dir="ltr">Hi this is good</div><br /><div class="x_1930489695gmail_quote"><div dir="ltr" class="x_1930489695gmail_attr">On Sat, Jul 20, 2024 at 6:40 PM Emmanuel Ajike &lt;<a href="mailto:emmanuelajike2000@gmail.com" target="_blank">emmanuelajike2000@gmail.com</a>&gt; wrote:<br /></div><blockquote class="x_1930489695gmail_quote" style="margin: 0px 0px 0px 0.8ex; border-left: 1px solid rgb(204, 204, 204); padding-left: 1ex"><div dir="ltr">This is a mail from Gmail to Zoho mail</div>\r\n' +
    "</blockquote></div>\r\n" +
    "</div>",
  messageIdString: "1721598796226130500",
  IntegIdList: "1721598696152114200,",
};

let webhookTest = {
  summary: "This is a sample mail for testing purposes, do not reply to it.",
  sentDateInGMT: 1721624481000,
  subject: "Webhook Integration Test",
  Mode: 0,
  messageId: 1721599296645130500,
  toAddress: "<emee-dev@zohomail.com>",
  folderId: 639307000000008100,
  zuid: 797009692,
  size: 186906,
  sender: "Emmanuel Ajike",
  receivedTime: 1721599296622,
  fromAddress: "emmanuelajike2000@gmail.com",
  html:
    '<div><div dir="ltr">This is a sample mail for testing purposes, do not reply to it.<div><img src="/zm/ImageDisplay?f=1.png&amp;mode=inline&amp;cid=ii_lyw3r63s0&amp;" alt="Screenshot (6).png" width="452" height="283" /><br /></div></div>\r\n' +
    "</div>",
  messageIdString: "1721599296645130500",
  IntegIdList: "1721598696152114200,",
};
