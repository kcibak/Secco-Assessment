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