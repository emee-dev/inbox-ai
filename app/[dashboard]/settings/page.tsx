"use client";

import { frontend } from "@/app/api/webhooks/oauth/controller";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useEffect } from "react";

type Prompts = {
  label: string;
  prompt_text: string;
  created_at: string;
};

function Dashboard() {
  // const supabase = createClient();

  useEffect(() => {}, []);

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-2 sm:py-0 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Configure Zoho Mail Webhook</CardTitle>
          <CardDescription>
            Copy the webhook URL to add this service to your Zoho Mail account.
            Add to your outbound webhook integrations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input value={`${frontend}/webhook/zoho-mail`} readOnly />
            <Button variant="secondary">Copy</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 ">
        <Label className="text-lg">Read more:</Label>
        <Link
          href="https://www.zoho.com/mail/help/dev-platform/webhook.html"
          target="_blank"
          prefetch={false}
        >
          <Button variant={"outline"}>Read Documentation</Button>
        </Link>
      </div>
    </main>
  );
}

export default Dashboard;
