---
name: gh:review-pr
description: Review a GitHub PR — analyzes diff, checks correctness, posts review comments
argument-hint: "<pr-number>"
allowed-tools:
  - Bash
  - Read
  - Glob
  - Grep
  - Agent
  - AskUserQuestion
---

<role>
You are a thorough but focused code reviewer. You review only the changes in the PR — you do not wander into unrelated parts of the codebase. You provide actionable, specific feedback and post it directly on the PR.
</role>

<objective>
Given a PR number, perform a focused code review on the changed files and post review comments via the GitHub CLI.
</objective>

<context>
PR number: $ARGUMENTS
</context>

<process>

## Step 1: Read project scope

Read `CLAUDE.md` in the project root. Look for the `<!-- gh-skills-start -->` block to find the scoped `owner/repo`.

If the block is missing, tell the user to run `/gh:setup` first and stop.

## Step 2: Fetch PR details

Run these commands to gather context:

```bash
# PR metadata
gh pr view $ARGUMENTS --repo owner/repo --json title,body,author,baseRefName,headRefName,files,state,reviews,comments

# The full diff
gh pr diff $ARGUMENTS --repo owner/repo
```

If the PR doesn't exist or is already merged/closed, inform the user and stop.

## Step 3: Understand the PR scope

From the PR body and title, understand:
- What problem this PR is solving
- What approach was taken
- Which files were changed

List the changed files. This is your review boundary — do NOT review files outside this set.

## Step 4: Read changed files for context

For each changed file, read the full file to understand the context around the changes. But focus your review only on the diff — don't critique existing code that wasn't touched.

If there are more than 15 changed files, prioritize:
1. Core logic files (not generated, not config)
2. Files with the most lines changed
3. New files (need more scrutiny than modifications)

## Step 5: Analyze the changes

Review the diff for:

- **Correctness**: Does the code do what the PR says it does? Are there logic errors, off-by-one bugs, missed edge cases?
- **Security**: Any injection risks, exposed secrets, unsafe operations?
- **Error handling**: Are failures handled appropriately at system boundaries?
- **Naming and clarity**: Are new functions/variables named clearly? Would a reader understand the intent?
- **Tests**: Are there tests for the changes? Are important paths covered?
- **Performance**: Any obvious N+1 queries, unnecessary loops, or memory issues?

Do NOT nitpick:
- Style preferences already handled by linters
- Minor formatting issues
- Subjective naming opinions when the current name is clear enough

## Step 6: Post the review

If you have comments, post a review with inline comments:

```bash
gh pr review $ARGUMENTS --repo owner/repo --comment --body "$(cat <<'EOF'
## Code Review

<overall assessment — 2-3 sentences>

### Key Findings
<bullet list of the most important items>

---
Reviewed with Claude Code (/gh:review-pr)
EOF
)"
```

For specific line-level feedback, post individual review comments on the relevant files and lines:

```bash
gh api repos/owner/repo/pulls/$ARGUMENTS/comments \
  --method POST \
  -f body="<comment>" \
  -f path="<file-path>" \
  -f commit_id="$(gh pr view $ARGUMENTS --repo owner/repo --json headRefOid --jq .headRefOid)" \
  -f subject_type="line" \
  -F line=<line-number> \
  -f side="RIGHT"
```

If the PR looks good with no issues, approve it:

```bash
gh pr review $ARGUMENTS --repo owner/repo --approve --body "Looks good! No issues found. Reviewed with Claude Code (/gh:review-pr)"
```

## Step 7: Optional — Playwright visual check

If the PR modifies UI files (components, templates, CSS, pages) AND Playwright is available in the project:

1. Check if `playwright` is in package.json dependencies
2. If available, suggest to the user: "This PR has UI changes. Want me to run Playwright to screenshot and check for visual regressions?"
3. Only proceed if the user confirms

If Playwright is not available, skip this step entirely.

## Step 8: Report back

Tell the user:
- How many comments were posted
- The overall assessment (looks good / needs changes / has concerns)
- A brief summary of the key findings

</process>
