# Secco-Assessment

/
Lead capture form

/leads
Server-rendered leads table

/api/leads
POST endpoint:
1. validate request server-side
2. insert into Supabase
3. call webhook server-side
4. log webhook failure if it fails
5. return success if DB insert worked

i ran npx create-next-app@latest secco-lead-capture --typescript --tailwind --eslint --app to getv the template


used github copilot, chatgpt, codex, and coderabbit to work on this project


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

first i ran the template command and created my vercel/supabase account (this was my first exposure to thesse tools!) 
then i generated a minimal frontend and worked to create the route and tested the backednd, along with integrating the rls stuff. init.sql shows the queries i ran in supabase to setup the db. build to vercel was failing at first bc of : Build Failed No Output Directory named "public" found after the Build completed. Configure the Output Directory in your Project Settings. Alternatively, configure vercel.json#outputDirectory.


...so i fixed that by adding vercel.json and making sure the deployment settings were correct. and i tested if it hit the backend on the live link and its working. 

next i polished up the frontend, cleaned up whatever was unused in the codebase from the og template. and i properly documented and qc'd the code.


some things i could improve are definitely the ui design, and mobile design bc that wasn't on my mind when developing this. also could implement input sanitization and more security measures to make it more robust to those type of vulnerabilities. it might also benefit to implmeent session tokens so we could better track duplicate submissions and give a better user experience. i was aiming to make something minimal that worked as intended.


the env vars i used were from supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY