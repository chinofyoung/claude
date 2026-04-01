---
name: gh:list
description: List issues sorted by priority (critical → low), optionally filtered by priority level
argument-hint: "[priority]"
allowed-tools:
  - Bash
  - Read
---

<role>
You are a project manager displaying GitHub issues organized by priority. You fetch issues from the scoped repository and present them in a clear, priority-ordered format.
</role>

<objective>
Display all open issues sorted by priority (critical → high → medium → low), or filter to a single priority level if specified.
</objective>

<context>
Priority argument: $ARGUMENTS
</context>

<process>

## Step 1: Read project scope

Read `CLAUDE.md` in the project root. Look for the `<!-- gh-skills-start -->` block to find the scoped `owner/repo`.

If the block is missing, tell the user to run `/gh:setup` first and stop.

## Step 2: Validate arguments

The valid priority levels are: `critical`, `high`, `medium`, `low`.

- If `$ARGUMENTS` is empty, proceed to fetch all priorities.
- If `$ARGUMENTS` is one of the valid priority levels (case-insensitive), proceed to fetch only that priority.
- If `$ARGUMENTS` is anything else, show this error and stop:

> **Invalid priority: `$ARGUMENTS`**
>
> Supported levels: `critical`, `high`, `medium`, `low`
>
> Usage:
> - `/gh:list` — all issues by priority
> - `/gh:list critical` — only critical issues

## Step 3: Fetch issues

Use the GitHub CLI to fetch open issues with priority labels.

Priority labels follow the format: `priority:critical`, `priority:high`, `priority:medium`, `priority:low`.

**If a specific priority was requested**, fetch only that level:

```bash
gh issue list --repo owner/repo --label "priority:<level>" --state open --json number,title,labels,assignees,createdAt --limit 100
```

**If no priority was specified**, fetch all four levels. Run four separate commands (one per priority level) to keep them grouped:

```bash
gh issue list --repo owner/repo --label "priority:critical" --state open --json number,title,labels,assignees,createdAt --limit 100
gh issue list --repo owner/repo --label "priority:high" --state open --json number,title,labels,assignees,createdAt --limit 100
gh issue list --repo owner/repo --label "priority:medium" --state open --json number,title,labels,assignees,createdAt --limit 100
gh issue list --repo owner/repo --label "priority:low" --state open --json number,title,labels,assignees,createdAt --limit 100
```

## Step 4: Format and display

Present the issues in a clear, readable format grouped by priority level. Use this structure:

```
## 🔴 Critical
| # | Title | Assignees | Created |
|---|-------|-----------|---------|
| 12 | Fix auth bypass | @alice | 2025-03-01 |

## 🟠 High
| # | Title | Assignees | Created |
|---|-------|-----------|---------|
| 8 | Add rate limiting | — | 2025-03-05 |

## 🟡 Medium
(no issues)

## 🟢 Low
| # | Title | Assignees | Created |
|---|-------|-----------|---------|
| 3 | Update README links | @bob | 2025-02-20 |
```

Rules:
- Always show the priority header, even if there are no issues at that level — display "(no issues)" under it.
- If filtering by a single priority, only show that one section.
- If there are no issues at all, say: "No open issues found with priority labels."
- Show assignee logins prefixed with `@`, or `—` if unassigned.
- Format dates as `YYYY-MM-DD`.
- At the end, show a summary line: `**Total: X issues** (Y critical, Z high, ...)`

## Step 5: Suggest next steps

After displaying the list, suggest:

> Use `/gh:work <issue#>` to start working on an issue.

If no issues have priority labels at all, also suggest:

> Add priority labels (`priority:critical`, `priority:high`, `priority:medium`, `priority:low`) to your issues to use this command effectively.

</process>
