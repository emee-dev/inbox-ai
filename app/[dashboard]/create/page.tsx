import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

const actions = [
  {
    label: "Forward receipts",
    prompt: "forward receipts to alice@accountant.com",
  },
  {
    label: "Label founder pitch decks",
    prompt: "Label founder pitch decks as 'Pitch'",
  },
  {
    label: "Archive and label newsletters",
    prompt: "Archive newsletters and label them as 'Newsletter'",
  },
  {
    label: "Respond to common question",
    prompt:
      "if someone asks how much the premium plan is, respond: 'Our premium plan is $10 per month'",
  },
];

function CreateAutomation(props: any) {
  console.log("props", props);
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Start from Example</CardTitle>
          <CardDescription>
            Automations are the rules that will be applied to your incoming
            emails.
          </CardDescription>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        {actions.map((item) => {
          return (
            <Link
              href="#"
              className="flex items-center rounded-lg bg-background p-3 shadow-md transition-transform duration-500 ease-in-out hover:-translate-y-1 hover:shadow-sm"
              prefetch={false}
              key={crypto.randomUUID()}
            >
              <InboxIcon className="mr-4 h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">{item.label}</h3>
                <p className="mt-2 text-muted-foreground">{item.prompt}</p>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="flex flex-col mt-5 gap-3">
        <span className="text-lg font-semibold">Step up rule by yourself</span>
        <Button variant={"outline"}>
          <Link href="/dashboard/create/rule" className="w-full h-full">
            Create rule
          </Link>
        </Button>
      </div>
    </>
  );
}

export default CreateAutomation;

function InboxIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}
