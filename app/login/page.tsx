"use client";

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
import { clientId, redirectUri, scope } from "../api/webhooks/oauth/controller";
import { useRouter } from "next/navigation";

function LoginForm() {
  const router = useRouter();

  const handleSubmit = (e: any) => {
    const baseUrl = "https://accounts.zoho.com/oauth/v2/auth";

    console.log({ clientId, redirectUri, scope });

    const params = new URLSearchParams({
      scope: scope,
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      access_type: "offline",
      prompt: "consent",
    });

    const authorizationUrl = `${baseUrl}?${params.toString()}`;

    e.preventDefault();
    router.push(authorizationUrl);
  };

  return (
    <section className="flex items-center justify-center h-screen">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={(e) => handleSubmit(e)}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your zoho personal email"
                autoComplete="off"
                // required
              />
            </div>

            <Button type="submit" className="w-full">
              Link Zoho Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

/* 

By continuing you agree to allow *APP* to send your emails to Google Gemini for processing. Gemini does not use the submitted data to train or improve their AI models.

*APP*'s use and transfer of information received from Zoho APIs to any other app will adhere to Zoho API Services User Data Policy, including the Limited Use requirements.

*/

export default LoginForm;
