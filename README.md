## Project Structure

```text
project-root/
|
├── frontend/               # UI app (React/Next/Vue/etc.)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
|
├── backend/                # API server (Express/FastAPI/Django/etc.)
│   ├── src/
│   ├── tests/
│   ├── pom.xml             # or package.json if Node
│   └── ...
|
├── docs/                   # shared docs, diagrams, design notes
│   └── api-contract.md     # simple API doc (endpoints, payloads)
|
├── .gitignore
├── README.md               # root readme: describes both apps
└── docker-compose.yml      # optional: spin up frontend+backend together
