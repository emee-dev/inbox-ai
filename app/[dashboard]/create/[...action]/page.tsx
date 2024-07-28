"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormControl, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { CircleHelp } from "lucide-react";
import { useRef, useState } from "react";

type Action = {
  type: "archive" | "spam" | "send-email" | "reply-email";
  args: string;
};

// type ActionTypeOfLabel = Pick<Action, "type"> & {
//   label_text: string;
// };

type ActionTypeOfSpam = Pick<Action, "type"> & {
  mark_as_spam: boolean;
};

type ActionTypeOfArchive = Pick<Action, "type"> & {
  archive_email: boolean;
};
type ActionTypeOfSendEmail = Pick<Action, "type"> & {
  toAddress: string;
  ccAddress?: string | null;
  bccAddress?: string | null;
  subject: string;
  content: string;
};
type ActionTypeOfReplyEmail = Pick<Action, "type"> & {
  ccAddress?: string | null;
  bccAddress?: string | null;
  subject: string;
  content: string;
};

type User = {
  accountid: null;
  created_at: "2024-07-25T12:00:00";
  email: "john.doe@example.com";
  firstname: null;
  id: "b1a72a0d-18d6-4c8d-b27d-5f95c2b1d5c6";
  lastname: null;
  password_hash: "hashedpassword123";
  primaryemailaddress: null;
  zoho_zuid: null;
};

const CreateAction = (props: any) => {
  console.log("props", props);
  const [action, setAction] = useState<Action["type"]>("send-email");
  const supabase = createClient();

  let user = "john.doe@example.com";

  const labelRef = useRef<HTMLInputElement>(null);
  const spamRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const sendEmailsubjectRef = useRef<HTMLInputElement>(null);
  const sendEmailtoAddressRef = useRef<HTMLInputElement>(null);
  const sendEmailccAddressRef = useRef<HTMLInputElement>(null);
  const sendEmailbccAddressRef = useRef<HTMLInputElement>(null);
  const sendEmailcontentRef = useRef<HTMLTextAreaElement>(null);

  const replyEmailsubjectRef = useRef<HTMLInputElement>(null);
  //   const replyEmailtoAddressRef = useRef<HTMLInputElement>(null);
  const replyEmailccAddressRef = useRef<HTMLInputElement>(null);
  const replyEmailbccAddressRef = useRef<HTMLInputElement>(null);
  const replyEmailcontentRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    let formhandle = new FormData(formRef.current!);

    let label = formhandle.get("label");
    let prompt_text = formhandle.get("instruction");

    let spamValue: ActionTypeOfSpam = {
      type: "spam",
      mark_as_spam: spamRef.current!?.checked,
    };

    let archiveValue: ActionTypeOfArchive = {
      type: "archive",
      archive_email: spamRef.current!?.checked,
    };

    let sendEmailValue: ActionTypeOfSendEmail = {
      type: "archive",
      content: sendEmailcontentRef.current!?.value,
      subject: sendEmailsubjectRef.current!?.value,
      bccAddress: sendEmailbccAddressRef.current!?.value,
      toAddress: sendEmailtoAddressRef.current!?.value,
      ccAddress: sendEmailccAddressRef.current!?.value,
    };

    let replyEmailValue: ActionTypeOfReplyEmail = {
      type: "reply-email",
      content: replyEmailcontentRef.current!?.value,
      subject: replyEmailsubjectRef.current!?.value,
      bccAddress: replyEmailbccAddressRef.current!?.value || null,
      ccAddress: replyEmailccAddressRef.current!?.value || null,
    };

    let prompt_extra_info = stringifyAction(
      action,
      archiveValue,
      spamValue,
      replyEmailValue,
      sendEmailValue
    );

    // console.log({ label, prompt_text, prompt_extra_info });

    let {
      data: userDetails,
      error: userError,
    }: { data: User | null; error: any } = await supabase
      .from("users")
      .select("*")
      .eq("email", user)
      .maybeSingle();

    // console.log(userDetails);

    if (userError) {
      console.warn(userError?.message);
      return;
    }

    if (!userDetails) {
      console.warn("User with email does not exist");
      return;
    }

    let { data, error } = await supabase.from("prompts").insert({
      label,
      user_id: userDetails.id,
      prompt_text,
      prompt_extra_info,
    });
  };

  return (
    <form
      className="flex flex-col w-full"
      ref={formRef}
      onSubmit={(e) => handleSubmit(e)}
    >
      <div className="grid w-full  items-center gap-1.5">
        <Label htmlFor="label" className="font-semibold text-lg">
          Rule name
        </Label>
        <Input
          type="text"
          id="label"
          name="label"
          placeholder="label your rule"
        />
      </div>

      <div className="mt-5">
        <Label className="font-semibold text-lg mb-4">Conditions</Label>
        <Tabs defaultValue="ai" className="mb-10">
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="ai">AI</TabsTrigger>
            <TabsTrigger value="group">Group</TabsTrigger>
          </TabsList>
          <TabsContent value="ai">
            <div className="pt-4">
              <Label htmlFor="instruction" className="flex items-center mb-3">
                Instructions <CircleHelp className="ml-3" size="1.1rem" />
              </Label>
              <Textarea
                placeholder="Type your message here."
                name="instruction"
                id="instruction"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div>
          <Label className="font-semibold text-lg mb-4">Actions</Label>
          <Card>
            <CardContent className="flex gap-3 pt-5">
              <div className="gap-1.5 flex flex-col">
                <Label htmlFor="message">Action type</Label>
                <Select
                  defaultValue="send-email"
                  onValueChange={(value) => setAction(value as any)}
                >
                  <SelectTrigger className="w-[170px]">
                    <SelectValue placeholder="Select an action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="archive">Archive email</SelectItem>
                    <SelectItem value="spam">Mark as spam</SelectItem>
                    <SelectItem value="send-email">Send Email</SelectItem>
                    <SelectItem value="reply-email">Send Reply</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {action === "archive" && (
                <div className="hidden flex-1 items-center gap-1.5">
                  <Label htmlFor="label">Label</Label>
                  <Input
                    type="checkbox"
                    id="archive"
                    checked
                    readOnly
                    ref={spamRef}
                  />
                </div>
              )}

              {action === "spam" && (
                <div className="hidden flex-1 items-center gap-1.5">
                  <Label htmlFor="label">Label</Label>
                  <Input
                    type="checkbox"
                    id="spam"
                    checked
                    readOnly
                    ref={spamRef}
                  />
                </div>
              )}

              {action === "send-email" && (
                <div className="flex flex-col flex-1 gap-y-4">
                  <div className="grid flex-1 items-center gap-1.5">
                    <Label htmlFor="send-email-subject">Subject</Label>
                    <Input
                      type="text"
                      id="send-email-subject"
                      name="send-email-subject"
                      ref={sendEmailsubjectRef}
                      placeholder="Enter your label"
                    />
                  </div>
                  <div className="grid flex-1 items-center gap-1.5">
                    <Label htmlFor="email-email-to">To</Label>
                    <Input
                      type="text"
                      id="email-email-to"
                      name="email-email-to"
                      ref={sendEmailtoAddressRef}
                      placeholder="Email address of Recipient"
                    />
                  </div>
                  <div className="grid flex-1 items-center gap-1.5">
                    <Label htmlFor="send-email-cc">CC</Label>
                    <Input
                      type="text"
                      id="send-email-cc"
                      name="send-email-cc"
                      ref={sendEmailccAddressRef}
                      placeholder="Email address of CC"
                    />
                  </div>
                  <div className="grid flex-1 items-center gap-1.5">
                    <Label htmlFor="send-email-bcc">BCC</Label>
                    <Input
                      type="text"
                      id="send-email-bcc"
                      name="send-email-bcc"
                      ref={sendEmailbccAddressRef}
                      placeholder="Email address of BCC"
                    />
                  </div>
                  <div className="grid flex-1 items-center gap-1.5">
                    <Label htmlFor="send-email-content">Content</Label>
                    <Textarea
                      placeholder="Type your message here."
                      id="send-email-content"
                      name="send-email-content"
                      ref={sendEmailcontentRef}
                    />
                  </div>
                </div>
              )}

              {action === "reply-email" && (
                <div className="flex flex-col flex-1 gap-y-4">
                  <div className="grid flex-1 items-center gap-1.5">
                    <Label htmlFor="reply-email-subject">Subject</Label>
                    <Input
                      type="text"
                      id="reply-email-subject"
                      name="reply-email-subject"
                      ref={replyEmailsubjectRef}
                      placeholder="Enter email subject"
                    />
                  </div>
                  {/* <div className="grid flex-1 items-center gap-1.5">
                    <Label htmlFor="reply-email-to">To</Label>
                    <Input
                      type="text"
                      id="reply-email-to"
                      name="reply-email-to"
                      ref={replyEmailtoAddressRef}
                      placeholder="Enter your label"
                    />
                  </div> */}
                  <div className="grid flex-1 items-center gap-1.5">
                    <Label htmlFor="reply-email-cc">CC</Label>
                    <Input
                      type="text"
                      id="reply-email-cc"
                      name="reply-email-cc"
                      ref={replyEmailccAddressRef}
                      placeholder="Enter your label"
                    />
                  </div>
                  <div className="grid flex-1 items-center gap-1.5">
                    <Label htmlFor="reply-email-bcc">BCC</Label>
                    <Input
                      type="text"
                      id="reply-email-bcc"
                      name="reply-email-bcc"
                      ref={replyEmailbccAddressRef}
                      placeholder="Enter your label"
                    />
                  </div>
                  <div className="grid flex-1 items-center gap-1.5">
                    <Label htmlFor="reply-email-content">Content</Label>
                    <Textarea
                      placeholder="Type your message here."
                      id="reply-email-content"
                      name="reply-email-content"
                      ref={replyEmailcontentRef}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="w-full flex mt-5">
          <Button className="ml-auto">Create</Button>
        </div>
      </div>
    </form>
  );
};

function stringifyAction(
  action_type: Action["type"],
  archiveValue?: ActionTypeOfArchive,
  spamValue?: ActionTypeOfSpam,
  replyEmailValue?: ActionTypeOfReplyEmail,
  sendEmailValue?: ActionTypeOfSendEmail
) {
  if (action_type == "archive") {
    return JSON.stringify({
      type: action_type,
      archive_email: archiveValue?.archive_email,
    } as ActionTypeOfArchive);
  } else if (action_type === "spam") {
    return JSON.stringify({
      type: action_type,
      mark_as_spam: spamValue?.mark_as_spam,
    } as ActionTypeOfSpam);
  } else if (action_type === "reply-email") {
    return JSON.stringify({
      type: action_type,
      content: replyEmailValue?.content,
      subject: replyEmailValue?.subject,
      bccAddress: replyEmailValue?.bccAddress,
      ccAddress: replyEmailValue?.ccAddress!,
    } as ActionTypeOfReplyEmail);
  } else if (action_type === "send-email") {
    return JSON.stringify({
      type: action_type,
      content: sendEmailValue?.content,
      subject: sendEmailValue?.subject,
      bccAddress: sendEmailValue?.bccAddress,
      toAddress: sendEmailValue?.toAddress,
      ccAddress: sendEmailValue?.ccAddress,
    } as ActionTypeOfSendEmail);
  }
}

export default CreateAction;
