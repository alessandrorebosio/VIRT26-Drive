# Supabase Local Development
This directory contains the Supabase configuration and migrations for the project.

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) installed and running.
- [Node.js](https://nodejs.org/) installed.

### Setup Environment
Before starting the Supabase local environment, ensure you have a `.env` file in this directory. You can use the provided `example.env` as a template:

```bash
cp supabase/example.env supabase/.env
```

Fill in the required credentials (e.g., `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`) in the `.env` file.

### Start Supabase
To start the local Supabase environment with your environment variables, run:

```bash
npx supabase start --env-file supabase/.env
```

### Other Useful Commands
- **Stop Supabase**: `npx supabase stop`
- **Reset Database**: `npx supabase db reset`
- **Database Status**: `npx supabase status`
- **Generate Types**: `npx supabase gen types typescript --local > ../src/lib/database.types.ts`
