# Git Troubleshooting Quick Reference

## Common Scenarios & Quick Fixes

### 🔄 **Pulling Latest Changes to Your Branch**

**Scenario:** You're on a feature branch but need the latest changes from main.

```bash
# Option 1: Merge (creates merge commit)
git checkout your-branch
git pull origin main

# Option 2: Rebase (cleaner history)
git checkout your-branch
git rebase origin/main

# Option 3: Fetch first, then merge/rebase
git fetch origin
git merge origin/main
# OR
git rebase origin/main

# List remote tracking branchess
git branch -r

# List local branches
git branch

# List all branches (local and remote)
git branch -a

# List all branches (local and remote)
git branch -av

#fetch remote branches
git fetch origin
```

### ⚡ **Quick Branch Switch (Keep Local Changes)**

**Scenario:** You have uncommitted changes but need to switch branches.

```bash
# Stash changes, switch, then pop
git stash
git checkout other-branch
git stash pop

# Or create a new branch with your changes
git checkout -b new-branch-name
```

### 🔀 **Merge Conflicts Resolution**

**Scenario:** You have merge conflicts after pulling/merging.

```bash
# 1. See which files have conflicts
git status

# 2. Edit the conflicted files (look for <<<<<<< markers)
# 3. After fixing conflicts:
git add .
git commit -m "Resolve merge conflicts"

# 4. Continue if you were rebasing:
git rebase --continue
```

### 🚫 **Undo Last Commit (Keep Changes)**

**Scenario:** You committed too early or want to modify the last commit.

```bash
# Undo commit, keep changes staged
git reset --soft HEAD~1

# Undo commit, unstage changes
git reset HEAD~1

# Undo commit, lose all changes
git reset --hard HEAD~1
```

### 📁 **Restore Deleted File from Previous Commit**

**Scenario:** You accidentally deleted a file and need to restore it.

```bash
# Find the commit where file existed
git log --oneline -- path/to/file

# Restore from specific commit
git checkout <commit-hash> -- path/to/file

# Or restore from HEAD~1 (previous commit)
git checkout HEAD~1 -- path/to/file
```

### 🔧 **Fix Wrong Upstream Branch**

**Scenario:** You set the wrong upstream branch with `git push -u`.

```bash
# Check current upstream
git branch -vv

# Set correct upstream
git branch --set-upstream-to=origin/correct-branch

# Or push with correct upstream
git push -u origin correct-branch
```

### 🧹 **Clean Up After Messy Merge**

**Scenario:** You have a messy merge history and want to clean it up.

```bash
# Interactive rebase to squash/clean commits
git rebase -i HEAD~3  # Last 3 commits

# Force push (only if you're sure!)
git push --force-with-lease

# Force-push pushes only if the remote branch tip is exactly what your local thinks it is.
# If someone else pushed new commits you don’t have, it refuses instead of overwriting them.
# Use after a rebase of your feature branch, to update the remote without creating merge commits. Typical flow:
git fetch origin
git rebase origin/main
git push --force-with-lease
```

### 🎯 **Quick Status Check**

**Scenario:** You're not sure what state your repo is in.

```bash
# See current status
git status

# See branch info
git branch -vv

# See what's different from main
git diff HEAD origin/main --name-only

# See recent commits
git log --oneline -5

# See recent commits including merges
git log --oneline --graph -10

# See what you merged recently
git log --merges --oneline -5

# See the actual diff of your recent merge
git show HEAD --name-only

# See what's different on remote main (what you're missing)
git diff origin/main HEAD --name-only

# See the actual diff of what's on main that you don't have
git diff HEAD origin/main

# See just the file names
git diff HEAD origin/main --name-only
```

### 🚨 **Emergency: Get Out of Messy State**

**Scenario:** You're in a rebase/merge mess and want to start over.

```bash
# Abort current rebase
git rebase --abort

# Abort current merge
git merge --abort

# Reset to last known good state
git reset --hard origin/your-branch
```

### 📋 **Docker + Git Workflow**

**Scenario:** You're working with Docker and need to pull changes.

```bash
# If running frontend locally:
docker-compose up --build db backend

# If running everything in Docker:
docker-compose down
git pull
docker-compose up --build
```

## 🎯 **Pro Tips**

- **Always check `git status` first** - it tells you exactly what's happening
- **Use `git stash` liberally** - it's your safety net for uncommitted changes
- **`--force-with-lease` is safer than `--force`** - it checks if someone else pushed
- **When in doubt, ask before force-pushing** - especially on shared branches
- **Use `git log --oneline` to see recent history** - helps understand what happened
- **Always delete local branches after merging `git branch -d your-branch`** - it's a good practice to keep your local repository clean

## 🆘 **When All Else Fails**

```bash
# Nuclear option: Reset to remote state
git fetch origin
git reset --hard origin/your-branch

# Or start fresh from main
git checkout main
git pull
git checkout -b new-branch-name
```

---

*Remember: Git is designed to never lose data. Even "destructive" commands usually have ways to recover. When in doubt, ask for help before doing anything drastic!*
