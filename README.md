<<<<<<< HEAD
# mos - "Mat- och sovklocka" - Repository structure:

---

project-root/
│
├── frontend/               # UI app (React/Next/Vue/whatever)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/                # API server (Express/FastAPI/Django/etc.)
│   ├── src/
│   ├── tests/
│   ├── pom.xml    # or package.json if Node
│   └── ...
│
├── docs/                   # shared docs, diagrams, design notes
│   └── api-contract.md     # simple API doc (endpoints, payloads)
│
├── .gitignore
├── README.md               # root readme: describes both apps, how to run them
└── docker-compose.yml      # optional: spin up frontend+backend together
Conventions to keep it clean

    Separate package managers: frontend/ has its own package.json; backend uses its own (Java/Maven/Spring Boot pom.xml  / Node package.json). Don’t mix dependencies.

    Readme pointers: Root README.md links to /frontend/README.md and /backend/README.md. Each side documents its own setup.

    API contract: keep a single docs/api-contract.md. Even just a Markdown table of endpoints, params, responses. That’s your handshake between the two halves.

    Branches/PRs: name them with a prefix:

        fe/feature-login-page

        be/fix-auth-bug

    Build/test scripts: in CI (if you add it later), run them separately: cd frontend && npm test, cd backend && mvn spring-boot:run.

Optional:

Use a docker-compose.yml at root so devs can spin up both with one command:

version: "3"
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
