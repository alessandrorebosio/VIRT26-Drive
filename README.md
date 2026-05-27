<div align="center">
  <h1>☁️ VIRT26-Drive</h1>
  <p><em>A scalable, containerized, and self-hosted cloud storage platform.</em></p>

  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</div>

---

Developed as part of the **Virtualization and System Integration** course, **VIRT26-Drive** demonstrates a modern microservices architecture designed for secure and efficient file management. 

## 🛠️ Tech Stack

### Frontend
* **Framework:** Next.js 15, React 19
* **Language:** TypeScript
* **Styling:** Tailwind CSS, Shadcn UI

### Backend & Infrastructure
* **Database & Services:** Supabase Open Source (PostgreSQL 17, GoTrue, PostgREST, Realtime, Storage)
* **Networking:** Nginx (Reverse Proxy), Kong (API Gateway)
* **Virtualization:** Docker & Docker Compose

---

## ⚙️ Environment Setup

The project uses a structured environment configuration to manage secrets and service endpoints securely.

### Environment File Structure
```text
.
├── .env                    # Root infrastructure secrets (DB, JWT, etc.)
└── web/
    ├── .env.production     # Production frontend configuration
    ├── .env.development    # Development frontend configuration
    └── supabase/
        └── .env                # Supabase CLI and OAuth credentials
```
### 1. Main Infrastructure (.env)
The root `.env` file contains critical secrets for Docker Compose. You can generate these automatically using the provided utility script:

```bash
# Initialize the .env file from the example
cp example.env .env

# Generate secure random keys and update the .env file
sh volumes/utils/generate-keys.sh
```

## 📦 Deployment

### Production (Docker Compose)
To launch the full self-hosted stack:
```bash
docker-compose up -d --build
```
The application will be accessible at the port configured in your root `.env` (default: 80).

### Development

To run the services locally with hot-reloading:

1. **Start the Backend:** Initialize the local Supabase stack.

    ```bash 
    npx supabase start --env-file supabase/.env
    ```
2. **Start Frontend:** 

    ```bash 
    cd web && npm run dev`
    ```
