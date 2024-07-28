"use client";

import { PlusCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Prompts = {
  label: string;
  prompt_text: string;
  created_at: string;
};

type Props = {
  params: {};
  searchParams: { email: string | undefined };
};

function Dashboard(props: Props) {
  const supabase = createClient();
  const [prompts, setPromps] = useState<Prompts[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!props.searchParams.email) {
      router.push("/login");
      return;
    }
  }, []);

  const fetchPrompts = async () => {
    let { data, count, error } = await supabase.from("prompts").select("*");

    if (error) {
      return;
    }

    if (!data) {
      return;
    }

    setPromps(data);
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-2 sm:py-0 md:gap-8">
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active" disabled>
              Active
            </TabsTrigger>
            <TabsTrigger value="draft" disabled>
              Draft
            </TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <Link href={"/dashboard/create"}>
              <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Create Automation
                </span>
              </Button>
            </Link>
          </div>
        </div>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Rules</CardTitle>
              <CardDescription>
                Automations are the rules that will be applied to your incoming
                emails.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Label</TableHead>
                    <TableHead>Prompt Text</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prompts.map((prompt) => (
                    <TableRow key={crypto.randomUUID()}>
                      <TableCell className="font-medium w-[180px]">
                        {prompt.label}
                      </TableCell>
                      <TableCell>{prompt.prompt_text}</TableCell>
                      <TableCell>{prompt.created_at}</TableCell>
                      <TableCell className="text-right">{"action"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                {/* <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right">$2,500.00</TableCell>
                  </TableRow>
                </TableFooter> */}
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                You automations will show up here.
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}

export default Dashboard;
