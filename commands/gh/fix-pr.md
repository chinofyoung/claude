---
name: gh:fix-pr
description: Fix PR review feedback — reads review comments and addresses each one
argument-hint: "<pr-number>"
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
You are a developer addressing PR review feedback. You read every review comment, understand what's being asked, and make the fixes. You're methodical — you address each comment one by one and don't miss any.
</role>

<objective>
Given a PR number, read all review comments and conversation comments, then fix every actionable item.
</objective>

<context>
PR number: $ARGUMENTS
</context>

<process>

## Step 1: Read project scope

Read `CLAUDE.md` in the project root. Look for the `<!-- gh-skills-start -->` block to find the scoped `owner/repo`.

If the block is missing, tell the user to run `/gh:setup` first and stop.

## Step 2: Fetch PR and review comments

Gather all feedback:

```bash
# PR details and conversation comments
gh pr view $ARGUMENTS --repo owner/repo --json title,body,headRefName,comments,reviews

# Inline review comments (file-level and line-level)
gh api repos/owner/repo/pulls/$ARGUMENTS/comments --paginate

# Review threads (to see which are resolved vs unresolved)
gh api repos/owner/repo/pulls/$ARGUMENTS/reviews --paginate
```

## Step 3: Check out the PR branch

```bash
gh pr checkout $ARGUMENTS --repo owner/repo
```

If already on the branch, just make sure it's up to date:
```bash
git pull origin $(gh pr view $ARGUMENTS --repo owner/repo --json headRefName --jq .headRefName)
```

## Step 4: Catalog all feedback

Parse all comments and create a list of actionable items. For each comment, note:
- The file and line it references (if inline)
- What change is being requested
- Whether it's resolved or unresolved

Focus on **unresolved** comments. Skip:
- Already resolved threads
- Comments that are just acknowledgments ("looks good", "thanks")
- Questions that were already answered in the thread

Present the list to the user:
> "Found **N** actionable review comments:"
> 1. `file.ts:42` — "Should handle the null case here"
> 2. `utils.ts:15` — "This function name is misleading"
> ...

## Step 5: Address each comment

For each actionable item:

1. Read the relevant file and understand the context
2. Make the fix
3. After fixing, move to the next item

Group related fixes into logical commits:

```bash
git add <files>
git commit -m "Address review feedback: <summary>

- <fix 1>
- <fix 2>
"
```

If a comment is unclear or you disagree with it, ask the user for guidance rather than guessing.

## Step 6: Push the fixes

```bash
git push
```

## Step 7: Reply to comments (optional)

For each addressed comment, post a reply indicating it's been fixed:

```bash
gh api repos/owner/repo/pulls/$ARGUMENTS/comments/<comment-id>/replies \
  --method POST \
  -f body="Fixed in $(git rev-parse --short HEAD)"
```

If a comment was not addressed (disagreement, needs discussion, out of scope), post a reply explaining why.

## Step 8: Report back

Tell the user:
- How many comments were addressed
- What commits were created
- Any comments that were skipped and why
- Remind them to re-request review if needed

</process>
