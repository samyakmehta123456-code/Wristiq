# MDP

This is the MDP project. Instructions to push to GitHub:

1. Install Git: https://git-scm.com/downloads
2. (Optional) Install GitHub CLI: https://cli.github.com/

Commands to run from the project root (PowerShell):

```powershell
# initialize repo if needed
git init

# stage files
git add .

# commit
git commit -m "Initial commit"

# create remote (replace <your-repo-url>)
git remote add origin <your-repo-url>

git branch -M main

# push
git push -u origin main
```

Or using GitHub CLI (after logging in):

```powershell
gh repo create <username>/<repo-name> --public --source=. --remote=origin --push
```

If you want, install Git and tell me and I'll finish initialization and push for you (or provide the repo URL and I'll set the remote and push).