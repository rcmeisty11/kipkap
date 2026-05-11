# KipKap Badge

A one-stop reflection and development hub for K-12 teachers and leaders. Teachers track student data, group assignments by standard, build focus groups, and reflect on action steps — all in one place.

## Features

- **Clever Roster Sync** — Import districts, schools, teachers, sections, and students from Clever
- **Illuminate Assessment Import** — Pull assignments and scores from Renaissance Illuminate
- **Editable Data Grid** — Inline score editing, notes, ML/DL badges, and focus group filters
- **Assignment Grouping** — Drag-and-drop assignments by standard or group by date
- **Standard Performance** — Expandable rows showing per-standard breakdown by student
- **Summary Statistics** — % pass and average score per assignment, with per-group breakdowns
- **PowerSchool Export** — Download gradebook-ready CSV files
- **Focus Groups** — Drag-and-drop students into tiered groups based on results
- **Leader Rollup Dashboards** — Aggregated data across teachers and schools
- **Action Step Rubrics** — Leaders create rubrics and give teachers scored feedback
- **Teacher Reflections** — Teachers reflect against their action steps and feedback

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Data Grid | TanStack Table v8 |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Charts | Recharts |
| State | Zustand + TanStack Query |
| Backend | FastAPI, Python, SQLAlchemy 2.0 async, Alembic |
| Database | PostgreSQL 15 |
| Auth | Clever OAuth 2.0, JWT (python-jose) |
| Deploy | AWS (S3 + CloudFront, EC2, RDS) |

## Project Structure

```
kipkapbadge/
├── frontend/
│   └── src/
│       ├── components/        # UI and feature components
│       │   ├── assignments/   # AssignmentGrid, ScoreCell, StandardExpandRow
│       │   ├── standards/     # StandardGroupBoard (dnd-kit kanban)
│       │   ├── focus-groups/  # FocusGroupBuilder (dnd-kit)
│       │   ├── leader/        # RollupDashboard, RubricEditor, FeedbackForm
│       │   ├── action-steps/  # ActionStepCard, ReflectionForm
│       │   └── ui/            # shadcn/ui components
│       ├── pages/             # Route page components
│       ├── hooks/             # TanStack Query hooks
│       ├── store/             # Zustand stores (auth, ui)
│       ├── lib/               # Axios client, utilities
│       └── types/             # TypeScript interfaces
├── backend/
│   └── app/
│       ├── api/               # FastAPI route handlers
│       ├── models/            # SQLAlchemy ORM models
│       ├── schemas/           # Pydantic request/response schemas
│       ├── services/          # Clever, Illuminate, Export logic
│       ├── config.py          # Pydantic Settings (env vars)
│       ├── db.py              # Async SQLAlchemy engine
│       └── main.py            # FastAPI app entry point
├── infrastructure/
│   ├── setup-ec2.sh           # EC2 bootstrap script
│   ├── nginx.conf             # Reverse proxy config
│   ├── kipkap.service         # systemd unit for uvicorn
│   ├── deploy-backend.sh      # Backend deploy script
│   └── deploy-frontend.sh     # Frontend deploy script
└── .github/workflows/         # CI/CD for frontend and backend
```

## Local Development Setup

### Prerequisites

- Node.js 18+
- Python 3.9+
- PostgreSQL 15

### Backend

```bash
cd backend

# Create virtual environment and install dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
DATABASE_URL=postgresql+asyncpg://$(whoami)@localhost:5432/kipkap
JWT_SECRET_KEY=dev-secret-change-in-production
CORS_ORIGINS=http://localhost:5173
FRONTEND_URL=http://localhost:5173
EOF

# Create database and run migrations
createdb kipkap
PYTHONPATH=. alembic upgrade head

# Start the server
PYTHONPATH=. uvicorn app.main:app --reload
```

The backend runs at `http://localhost:8000`. Health check: `GET /health`.

### Frontend

```bash
cd frontend

npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies API requests to the backend.

### Demo Login

With both servers running, visit `http://localhost:5173`. Click **Demo Login** to sign in as a leader user without Clever credentials. This creates a demo user in the database and returns a JWT.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string (asyncpg) | `postgresql+asyncpg://postgres:postgres@localhost:5432/kipkap` |
| `CLEVER_CLIENT_ID` | Clever OAuth client ID | `""` |
| `CLEVER_CLIENT_SECRET` | Clever OAuth client secret | `""` |
| `CLEVER_REDIRECT_URI` | OAuth callback URL | `http://localhost:8000/auth/callback` |
| `JWT_SECRET_KEY` | Secret for signing JWTs | `dev-secret-change-in-production` |
| `JWT_EXPIRY_HOURS` | Token lifetime in hours | `24` |
| `ILLUMINATE_API_KEY` | Renaissance Illuminate API key | `""` |
| `ILLUMINATE_BASE_URL` | Illuminate API base URL | `https://api.renaissance.com` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173` |
| `FRONTEND_URL` | Frontend URL for OAuth redirects | `http://localhost:5173` |

### Frontend (build-time via Vite)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL (set in CI/CD) |
| `VITE_CLEVER_CLIENT_ID` | Clever client ID for frontend redirects |

## Deployment (AWS)

The app is designed to deploy on AWS:

- **Frontend** → S3 bucket + CloudFront CDN
- **Backend** → EC2 instance (Ubuntu, nginx, uvicorn, systemd)
- **Database** → RDS PostgreSQL 15

See `infrastructure/` for setup scripts and configs. CI/CD is handled by GitHub Actions (`.github/workflows/`).

### Quick Deploy

```bash
# Frontend: build and push to S3
./infrastructure/deploy-frontend.sh

# Backend: SSH to EC2 and pull latest
./infrastructure/deploy-backend.sh
```

## Integrations

### Clever

**What you need from your Clever district admin:**
1. Approve your app in the Clever district dashboard to share roster data
2. Enable data sharing for: districts, schools, teachers, sections, students, enrollments
3. Ensure SIS IDs flow through from your SIS (needed for Illuminate matching)
4. Optionally map ELL/IEP status to `is_ml` and `is_dl` extended properties

**What you set up as a developer:**
1. Create an app at [clever.com/developers](https://clever.com/developers) to get your Client ID and Client Secret
2. Set your redirect URI in the Clever dashboard
3. Add credentials to `backend/.env`

**Auth flow:** User clicks "Sign in with Clever" → Clever OAuth → callback exchanges code for token → app issues JWT → user is redirected to dashboard.

### Renaissance Illuminate

1. Obtain an API key from your Renaissance/Illuminate admin
2. Add it to `backend/.env` as `ILLUMINATE_API_KEY`
3. Use the Import Wizard in the app to select assessments, map to sections, and import scores
4. Students are matched by `sis_id` — SIS IDs must be present in both Clever and Illuminate

### PowerSchool Export

The export generates CSV files formatted for PowerSchool gradebook import:

```
Student_Number, Assignment_Name, Category, Points_Earned, Points_Possible, Date, Assignment_ID
```

Select a section and assignments in the Export page, then download the CSV.

## API Endpoints

| Prefix | Description |
|---|---|
| `GET /health` | Health check |
| `/auth/*` | Clever OAuth, callback, `/me`, demo login |
| `/sync/*` | Trigger Clever roster sync |
| `/assignments/*` | Assignment CRUD, score editing |
| `/standards/*` | Standards CRUD, assignment groups |
| `/students/*` | Student roster, ML/DL flags |
| `/focus-groups/*` | Focus group CRUD, membership |
| `/export/*` | PowerSchool CSV download |
| `/import/*` | Illuminate assessment import |
| `/leader/*` | Rollup dashboard, rubrics, feedback, reflections |

## License

TBD
