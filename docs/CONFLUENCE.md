# Confluence – Source of Truth

These pages are the canonical references for coding conventions, PR guidelines, and project context:

- Project SSOT: [Mat och -sovklocka - Project SSOT](https://elizazadura.atlassian.net/wiki/spaces/ECS/pages/2588673/Mat+och+-sovklocka+-+Project+SSOT?atlOrigin=eyJpIjoiOGZiMjEzMDY5ZGFiNGU4MjgyNjg3NTljMDFiOTdkYmYiLCJwIjoiYyJ9)
- Space Overview: [ECS Space Overview](https://elizazadura.atlassian.net/wiki/spaces/ECS/overview)

If a policy in this repository conflicts with the Confluence SSOT, prefer the Confluence version and open a PR to align the repository.

## Table of contents
- [Confluence – Source of Truth](#confluence--source-of-truth)
  - [Table of contents](#table-of-contents)
- [Code Guidelines](#code-guidelines)
  - [Core Now](#core-now)
    - [Formatting \& Editor Config](#formatting--editor-config)
    - [Git \& Branching](#git--branching)
    - [Pull Requests](#pull-requests)
    - [Project Structure](#project-structure)
    - [API Rules](#api-rules)
    - [Security \& Secrets](#security--secrets)
    - [Testing](#testing)
  - [Optional Later](#optional-later)
    - [Logging \& Error Handling](#logging--error-handling)
    - [Database \& Migrations](#database--migrations)
    - [CI/CD](#cicd)
    - [Dependencies](#dependencies)
    - [IP \& Attribution](#ip--attribution)
    - [Review Etiquette](#review-etiquette)
- [install Git, then:](#install-git-then)
- [Examples](#examples)
- [push again:](#push-again)
  - [External links (Confluence; restricted)](#external-links-confluence-restricted)

# Code Guidelines

This document distinguishes between Core Now (must-have from day one) and Optional Later (useful if project grows).

## Core Now

### Formatting & Editor Config

    Use .editorconfig (2 spaces, LF, UTF-8, trailing newline) - ?

    TypeScript: Prettier + ESLint (strict mode).

### Git & Branching

    Default branch: main.  

    Feature branches: feat/<short-name>  

    Bugfix: fix/<short-name>  

    Keep branches short-lived; rebase before PR.  

Commits: Conventional style (e.g., feat: add login endpoint).  
### Pull Requests

    Small PRs (< ~300 lines).  

    Checklist:  

        [ ] Builds/tests pass locally  

        [ ] No secrets in code/logs  

        [ ] Linked Jira/Ticket (if relevant)  

### Project Structure

Backend (Spring Boot)  
src/main/java/com/org/app/
  config/
  domain/
  dto/
  repo/
  service/
  web/

Frontend (React + TS) - ?  
src/
  components/
  features/<domain>/
  hooks/
  types/
### API Rules

    Prefix endpoints: /api/v1/...  

    Explicit DTOs, no raw entities over wire.  

    Errors follow a standard shape:  

{ "status": 400, "error": "Bad Request", "message": "email must be valid" }
### Security & Secrets

    Never commit secrets (use env vars).  

    Backend: secure by default (denyAll → allowList).  

    Frontend: no secrets in bundle; use .env.local.

### Testing

    Backend: unit + a few integration tests.  

    Frontend: React Testing Library for key flows.

## Optional Later
### Logging & Error Handling

    Structured logs (key=value or JSON).  

    Levels: INFO (milestones), WARN (anomalies), ERROR (failures).  

### Database & Migrations

    Flyway for schema changes (immutable migrations).

### CI/CD

    PR build: lint + test. Block merge on failure.  

### Dependencies

    Keep them few; add with intent.  

    Backend: pin via BOM.  

    Frontend: audit occasionally.  

### IP & Attribution

    Source files carry header.  

    Third-party code/assets documented in THIRD_PARTY.md.  

### Review Etiquette

    Review the diff, not the person.  

    Ask/clarify/propose — keep it constructive. 

    ---



You won’t break the repo. Your flow is:

(First, make sure your local branches are in sync with the remote branches.)

Pull main

Create a branch

Make a change → commit

Push → open PR

Get 1 approval → squash-merge

Delete branch (GitHub offers a button)

Delete your local branch

If anything feels stuck: push your branch and ask for eyes. That’s the point of PRs.



Small-Team Workflow (3 ppl)

0) One-time setup

# install Git, then:
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"
git config --global pull.rebase false   # safer default for beginners


Create a GitHub account, enable 2FA.

Get added to the repo with “Write” access.

Install VS Code Git extension (built-in) or GitHub Desktop if terminal feels heavy.

1) Branch model

main: always deployable. Protected.

feature/{short-name}: one branch per task (issue/Story).

fix/{short-name}: small fixes.

release/{version} (optional): only if you need staged releases.

Naming: feature/jira-123-login-form (keep it short and human).

2) Daily loop (the 5 moves)

Sync

git switch main
git pull


Branch off

git switch -c feature/jira-123-login-form


Make small commits

git add -A
git commit -m "JIRA-123: add basic login form and route"


Push

git push -u origin feature/jira-123-login-form


Open PR on GitHub → request review from 1 teammate.

Rinse/repeat until PR is approved.

3) Commit messages (tiny & clear)

<JIRA-ID>: <verb> <object>
# Examples
JIRA-045: fix null check in meal parser
JIRA-101: add reminders API client (create/get)
docs: add SSOT scaffold diagram


Present tense, ~50 chars in the title.

Optional body: “Why” and notable tradeoffs.

4) Pull Requests (PRs)

Keep PRs small (100–300 lines changed if possible).

Checklist in the PR description:

Builds locally

Tests pass (if any)

Screens/CLI example for reviewers

Docs updated (if needed)

Review rule: 1 approval → squash-merge to main.
Use “Squash and merge” so main has clean, single-line history per PR.

5) Keeping a branch fresh (without drama)

If main moved ahead while you coded:

git switch feature/jira-123-login-form
git fetch origin
git merge origin/main    # resolves conflicts in files; commit the merge
# push again:
git push


(Merge is easier for beginners than rebase. We can teach rebase later.)

6) Hotfix on main

Branch from main: fix/typo-in-readme

Small change → PR → squash-merge.

If it can’t wait for review, pair quickly or self-merge and post a note in Confluence/Teams with the diff.

7) Releases (if/when needed)

Tag deploy points:

git switch main
git pull
git tag -a v0.1.0 -m "First demo"
git push origin v0.1.0


8) Common commands (cheat sheet)

See `docs/guides/dev-cheatsheet.md` for a concise, team-friendly command reference.

9) Typical “oops” and quick fixes

Accidentally committed to main:
Create branch from that commit → open PR → squash-merge; or revert commit on main:

git revert <commit-sha>


Merge conflict appears:
VS Code shows <<<<<<< markers. Keep the correct lines, delete markers, save, then:

git add -A
git commit    # completes the merge


Forgot to pull before branching:
Pull on main, then merge origin/main into your feature branch (see section 5).

10) .gitignore starter (drop in repo root)

See `docs/guides/dev-cheatsheet.md` → “.gitignore starter”.

Branching strategy

A simple branch strategy that works well in a two-person setup (keeps things clean, avoids surprises):

1. Create a branch locally

git checkout -b feat/my-feature


2. Push it to GitHub with an upstream link

(so you don’t have to spell out the remote every time):

git push -u origin feat/my-feature


After that, plain git push / git pull will work.

3. Keep it synced

Regularly git fetch --prune to clear out remote branches that got deleted.

Rebase on main before you open a PR:

git checkout feat/my-feature
git fetch origin
git rebase origin/main


4. Delete branches when merged

On GitHub: delete branch after merge.

Locally:

git branch -d feat/my-feature     # safe (if merged)
git branch -D feat/my-feature     # force (if abandoned)


5. Config tweaks (set once)

git config --global fetch.prune true   # auto remove deleted remote branches
git config --global pull.rebase true   # prefer rebase over merge


That’s the minimal flow:

checkout -b to start

push -u once

fetch --prune to stay tidy

rebase before merge to keep history clean

## External links (Confluence; restricted)
- Repository structure: https://elizazadura.atlassian.net/wiki/spaces/ECS/pages/3604481/Repository+structure?atlOrigin=eyJpIjoiYTI0OTkxMzU5ODQwNGI1N2JkYzNiNjZjZGY1YzI1NjMiLCJwIjoiYyJ9
- Stashing changes: https://elizazadura.atlassian.net/wiki/spaces/ECS/pages/14024705/Stashing+changes?atlOrigin=eyJpIjoiYWQzMzFjZmM5NTgxNGU5NGJkYmIxODRlNTE5YzJmMmUiLCJwIjoiYyJ9
- Syncing local: https://elizazadura.atlassian.net/wiki/spaces/ECS/pages/26607617/Syncing+local?atlOrigin=eyJpIjoiY2EyNzkwMGMxOTZjNGJkMTljNDM0M2YzNjMzZTBlY2IiLCJwIjoiYyJ9
