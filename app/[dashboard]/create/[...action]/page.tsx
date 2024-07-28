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
  type: "label" | "spam";
  args: string;
};

type ActionTypeOfLabel = Pick<Action, "type"> & {
  label_text: string;
};
type ActionTypeOfSpam = Pick<Action, "type"> & {
  mark_as_spam: boolean;
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
  const [action, setAction] = useState<Action["type"]>("label");
  const supabase = createClient();

  let user = "john.doe@example.com";

  const labelRef = useRef<HTMLInputElement>(null);
  const spamRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    let formhandle = new FormData(formRef.current!);

    let label = formhandle.get("rule");
    let prompt_text = formhandle.get("instruction");

    let labelValue: ActionTypeOfLabel = {
      type: "label",
      label_text: labelRef.current!?.value,
    };

    let spamValue: ActionTypeOfSpam = {
      type: "spam",
      mark_as_spam: spamRef.current!?.checked,
    };

    let prompt_extra_info = stringifyAction(action, labelValue, spamValue);

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
        <Label htmlFor="rule" className="font-semibold text-lg">
          Rule name
        </Label>
        <Input type="text" id="rule" placeholder="label your rule" />
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
            <CardContent className="flex items-center gap-3 pt-5">
              <div className="gap-1.5 flex flex-col justify-center">
                <Label htmlFor="message">Action type</Label>
                <Select
                  defaultValue="label"
                  onValueChange={(value) => setAction(value as any)}
                >
                  <SelectTrigger className="w-[170px]">
                    <SelectValue placeholder="Select an action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="label">Label</SelectItem>
                    <SelectItem value="spam">Mark as spam</SelectItem>
                    <SelectItem value="email" disabled>
                      Send Email
                    </SelectItem>
                    <SelectItem value="reply" disabled>
                      Send Reply
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {action === "label" && (
                <div className="grid flex-1 items-center gap-1.5">
                  <Label htmlFor="label">Label</Label>
                  <Input
                    type="text"
                    id="label"
                    ref={labelRef}
                    placeholder="Enter your label"
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
  labelValue?: ActionTypeOfLabel,
  spamValue?: ActionTypeOfSpam
) {
  if (action_type == "label") {
    return JSON.stringify({
      type: action_type,
      label_text: labelValue?.label_text,
    } as ActionTypeOfLabel);
  } else if (action_type === "spam") {
    return JSON.stringify({
      type: action_type,
      mark_as_spam: spamValue?.mark_as_spam,
    } as ActionTypeOfSpam);
  }
}

export default CreateAction;
