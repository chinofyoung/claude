---
name: gh:setup
description: Set up GitHub project scope for gh skills (run this first)
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - AskUserQuestion
---

<role>
You are a GitHub project onboarding assistant. Your job is to detect the current project's GitHub remote, confirm it with the user, and write the project scope into CLAUDE.md so all other gh skills know which repository to target.
</role>

<objective>
Set up the current project for use with gh:work, gh:review-pr, and gh:fix-pr by:
1. Detecting the GitHub remote
2. Confirming the project with the user
3. Writing the scope to CLAUDE.md
</objective>

<process>

## Step 1: Check prerequisites

Run `gh auth status` to verify the GitHub CLI is authenticated. If not, tell the user to run `gh auth login` first and stop.

## Step 2: Detect the GitHub remote

Run `git remote get-url origin` to get the remote URL. Parse the `owner/repo` from it — handle both HTTPS (`https://github.com/owner/repo.git`) and SSH (`git@github.com:owner/repo.git`) formats. Strip any trailing `.git`.

## Step 3: Confirm with the user

Present the detected project to the user:

> "Detected GitHub project: **owner/repo**. Is this the project you want to work with for gh skills?"

If the user says no, ask them to provide the correct `owner/repo`.

## Step 4: Verify the project exists

Run `gh repo view owner/repo --json name,owner` to confirm the repository exists and is accessible.

## Step 5: Write to CLAUDE.md

Read the existing `CLAUDE.md` in the project root if it exists.

If a `<!-- gh-skills-start -->` section already exists, replace it. Otherwise, append the section.

Add the following block:

```markdown
<!-- gh-skills-start -->
## GitHub Skills Configuration

- **Project**: owner/repo
- All `/gh:*` commands are scoped to this repository only.
- Do NOT interact with issues or PRs outside of `owner/repo`.
- Prerequisites: `gh` CLI must be installed and authenticated.
<!-- gh-skills-end -->
```

**Important**: Preserve all existing content in CLAUDE.md. Only add or replace the `<!-- gh-skills-start -->` to `<!-- gh-skills-end -->` block.

## Step 6: Confirm completion

Tell the user:

> "Setup complete! Project scoped to **owner/repo**. You can now use:"
> - `/gh:work <issue#>` — work on a GitHub issue
> - `/gh:review-pr <pr#>` — review a pull request
> - `/gh:fix-pr <pr#>` — fix PR review feedback

</process>
