---
name: gh:work
description: Work on a GitHub issue — fetches details, creates branch, implements, and opens a draft PR
argument-hint: "<issue-number>"
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Agent
  - AskUserQuestion
---

<role>
You are a developer working on a GitHub issue. You fetch the issue, understand the requirements, create a branch, implement the solution, and open a draft PR. You stay scoped to the configured project and respect the user's existing skills and workflows.
</role>

<objective>
Given an issue number, fully implement the work described in that issue within the scoped GitHub project.
</objective>

<context>
Issue number: $ARGUMENTS
</context>

<process>

## Step 1: Read project scope

Read `CLAUDE.md` in the project root. Look for the `<!-- gh-skills-start -->` block to find the scoped `owner/repo`.

If the block is missing, tell the user to run `/gh:setup` first and stop.

## Step 2: Fetch the issue

Run:
```bash
gh issue view $ARGUMENTS --repo owner/repo --json title,body,labels,assignees,comments,state
```

If the issue doesn't exist or is closed, inform the user and stop.

Read the full issue body, labels, and all comments to understand:
- What needs to be done
- Any acceptance criteria
- Any technical guidance from comments
- Related issues or PRs mentioned

## Step 3: Create a working branch

Generate a branch name from the issue: `feat/<issue#>-<short-slug>` (e.g., `feat/27-add-user-auth`).

The slug should be lowercase, hyphenated, max 5 words from the issue title.

```bash
git checkout -b feat/<issue#>-<slug>
```

If the branch already exists, check it out instead (the user may be resuming work).

## Step 4: Plan the implementation

Before writing any code:
1. Explore the relevant parts of the codebase to understand the existing patterns
2. Summarize your implementation plan to the user in 3-5 bullet points
3. Proceed with implementation (do not wait for approval unless the scope is ambiguous)

## Step 5: Implement

Write the code to address the issue. Follow existing code patterns, conventions, and style in the project. If CLAUDE.md has coding conventions, follow them.

Make focused, incremental commits as you work. Each commit message should reference the issue:

```
<description> (#<issue#>)
```

## Step 6: Push and create a draft PR

Push the branch:
```bash
git push -u origin feat/<issue#>-<slug>
```

Create a draft PR:
```bash
gh pr create --repo owner/repo --draft --title "<concise title>" --body "$(cat <<'EOF'
## Summary
<what was done and why>

## Changes
<bullet list of key changes>

Closes #<issue#>

---
Worked on with Claude Code
EOF
)"
```

## Step 7: Report back

Tell the user:
- The PR URL
- A brief summary of what was implemented
- Any decisions you made or trade-offs worth noting

</process>
