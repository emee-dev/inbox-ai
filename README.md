## README

# Email Automation Service

This project is an email automation service using Supabase, Next.js, Inngest, Gemini API, and Zoho Mail. The service receives incoming emails via Zoho webhooks, processes them using the Gemini API, and performs actions such as labeling emails or tagging them as spam. Inngest is used for handling background jobs, making the system more resilient and asynchronous.

## Table of Contents

- [Email Automation Service](#email-automation-service)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Supabase Table Setup](#supabase-table-setup)
  - [Running the Project](#running-the-project)
  - [External Documentation](#external-documentation)

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/emee-dev/inbox-ai
   cd inbox-ai
   ```

2. Install the dependencies:

   ```sh
   pnpm install
   ```

3. Create a `.env.local` file in the root of the project and add the following environment variables:

   ```env
   # .env.local
   INNGEST_DEV=1
   INNGEST_API_KEY=""

   NEXT_PUBLIC_URL=""

   # https://api-console.zoho.com
   NEXT_PUBLIC_ZOHO_CLIENT_ID=""
   NEXT_PUBLIC_ZOHO_OAUTH_SCOPE="ZohoMail.messages.ALL,ZohoMail.accounts.ALL"
   NEXT_PUBLIC_ZOHO_REDIRECT_URL=""
   ZOHO_CLIENT_SECRET=""

   # Supabase credentials
   NEXT_PUBLIC_SUPABASE_URL=""
   NEXT_PUBLIC_SUPABASE_ANON_KEY=""

   # Gemini Api
   # https://ai.google.dev/
   GOOGLE_GENERATIVE_AI_API_KEY=""

   ```

## Supabase Table Setup

1. Log in to your [Supabase](https://supabase.io) account and navigate to your project.

2. Create the following tables:

- **Users**

  ```sql
  create table
  users (
  id uuid not null default gen_random_uuid (),
  email character varying(255) null,
  password_hash character varying(255) not null,
  created_at timestamp without time zone null default current_timestamp,
  firstname character varying null,
  lastname character varying null,
  primaryemailaddress character varying null,
  zoho_zuid bigint null,
  accountid character varying null,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email)
  ) tablespace pg_default;
  ```

- **User_tokens**

  ```sql
  create table
  user_tokens (
  id serial,
  user_id uuid not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone null default current_timestamp,
  updated_at timestamp with time zone null default current_timestamp,
  constraint user_tokens_pkey primary key (id),
  constraint fk_user foreign key (user_id) references users (id) on delete cascade
  ) tablespace pg_default;

  create index if not exists idx_user_id on public.user_tokens using btree (user_id) tablespace pg_default;
  ```

- **Prompts**

  ```sql
  create table
  prompts (
    id uuid not null default gen_random_uuid (),
    user_id uuid null,
    prompt_text text not null,
    label character varying(255) null,
    created_at timestamp without time zone null default current_timestamp,
    prompt_extra_info text null,
    constraint prompts_pkey primary key (id),
    constraint prompts_user_id_fkey foreign key (user_id) references users (id) on delete cascade
  ) tablespace pg_default;
  ```

- **Logs**
  ```sql
  create table
  automation_history (
    id uuid not null default gen_random_uuid (),
    user_id uuid null,
    prompt_id uuid null,
    email_subject character varying(255) null,
    email_body text null,
    action_performed character varying(255) null,
    created_at timestamp without time zone null default current_timestamp,
    constraint automation_history_pkey primary key (id),
    constraint automation_history_prompt_id_fkey foreign key (prompt_id) references prompts (id) on delete set null,
    constraint automation_history_user_id_fkey foreign key (user_id) references users (id) on delete cascade
  ) tablespace pg_default;
  ```

## Running the Project

1. Start the development server:

   ```sh
   pnpm dev
   ```

2. Your application should now be running on `http://localhost:3000`.

## External Documentation

- [Inngest Documentation](https://www.inngest.com/docs/guides/background-jobs)
- [Supabase Documentation](https://supabase.io/docs/)
- [Zoho Mail OAuth Integration](https://www.zoho.com/mail/help/api/using-oauth-2.html)
- [Configure Zoho Mail Outbound Webhooks](https://www.zoho.com/mail/help/dev-platform/webhook.html)
- [Vercel AI SDK](https://sdk.vercel.ai/docs/introduction)

For any issues or contributions, please open an issue or submit a pull request on [GitHub](https://github.com/emee-dev/inbox-ai).
