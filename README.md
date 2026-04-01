# claude-github-skills

[![npm version](https://img.shields.io/npm/v/claude-github-skills)](https://www.npmjs.com/package/claude-github-skills)
[![license](https://img.shields.io/npm/l/claude-github-skills)](https://github.com/chinofyoung/claude/blob/main/LICENSE)

GitHub-focused skills for Claude Code. Work on issues, review PRs, and fix review feedback — all scoped to a single project.

## Install

```bash
npx claude-github-skills@latest
```

This copies the skill commands to `~/.claude/commands/gh/` (global install). For project-local install:

```bash
npx claude-github-skills@latest --local
```

Project-local install copies commands to `.claude/commands/gh/` in your current working directory, so the skills are only available when working in that project.

## Prerequisites

- [Claude Code](https://claude.ai/code) installed
- [GitHub CLI (`gh`)](https://cli.github.com/) installed and authenticated (`gh auth login`)
- [Node.js](https://nodejs.org/) >= 18.0.0

## Quick Start

1. Install the skills: `npx claude-github-skills@latest`
2. Open your project in Claude Code
3. Run `/gh:setup` to scope the skills to your repository
4. Start using `/gh:work`, `/gh:review-pr`, `/gh:fix-pr`, or `/gh:list`

## Commands

### `/gh:setup` — Onboarding (run this first)

Detects your project's GitHub remote, confirms it with you, and writes the scope to `CLAUDE.md`. All other commands read this scope to know which repo to target.

```
/gh:setup
```

What it does:
1. Verifies `gh` CLI is authenticated (`gh auth status`)
2. Detects the GitHub remote from `git remote get-url origin` (supports both HTTPS and SSH URLs)
3. Confirms the detected `owner/repo` with you
4. Verifies the repository exists and is accessible
5. Writes a `<!-- gh-skills-start -->` configuration block to your project's `CLAUDE.md` (creates the file if it doesn't exist, preserves existing content if it does)

The configuration block scopes all `/gh:*` commands to that single repository, preventing accidental interaction with other repos.

### `/gh:work <issue#>` — Work on an issue

Fetches the issue, creates a feature branch, implements the solution, and opens a draft PR.

```
/gh:work 27
```

What it does:
1. Reads issue #27 (title, body, labels, assignees, comments, state)
2. Creates branch `feat/27-<slug>` (e.g., `feat/27-add-user-auth`) — if the branch already exists, it checks it out so you can resume work
3. Explores the codebase, summarizes a 3–5 bullet implementation plan, then implements
4. Makes focused, incremental commits — each referencing the issue (e.g., `Add auth middleware (#27)`)
5. Pushes and creates a draft PR with a summary, change list, and `Closes #27` link

### `/gh:review-pr <pr#>` — Review a PR

Performs a focused code review on the PR's changed files and posts comments directly on GitHub.

```
/gh:review-pr 42
```

What it does:
1. Fetches the PR diff, metadata, and existing reviews
2. Reads full changed files for context, but reviews only the diff — does not critique untouched code
3. Checks for: correctness, security, error handling, naming clarity, test coverage, and performance issues
4. Skips nitpicks already handled by linters (style, formatting, subjective naming)
5. Posts a review summary with key findings and inline comments on specific lines
6. Approves the PR if no issues are found
7. For PRs with 15+ changed files, prioritizes core logic, largest diffs, and new files
8. Optionally offers to run Playwright for visual regression checks on UI changes (only if Playwright is in the project)

### `/gh:list [priority]` — List issues by priority

Displays all open issues sorted by priority (critical → high → medium → low), with optional filtering.

```
/gh:list
/gh:list critical
```

What it does:
1. Reads project scope from `CLAUDE.md`
2. Fetches open issues with priority labels (`priority:critical`, `priority:high`, `priority:medium`, `priority:low`)
3. Groups and displays them in priority order with a formatted table (issue number, title, assignees, created date)
4. Shows a summary count at the end
5. Supports filtering to a single priority level — `/gh:list high` shows only high-priority issues
6. Shows a helpful error for invalid priority arguments

### `/gh:fix-pr <pr#>` — Fix review feedback

Reads all review comments on a PR and addresses each one.

```
/gh:fix-pr 42
```

What it does:
1. Fetches all inline review comments, conversation comments, and review threads
2. Filters to unresolved, actionable comments — skips resolved threads, acknowledgments, and already-answered questions
3. Presents a numbered list of items to address (with file, line, and requested change)
4. Checks out the PR branch and fixes each item
5. Groups related fixes into logical commits with descriptive messages
6. Pushes the fixes
7. Replies to each addressed comment on GitHub with a link to the fixing commit (e.g., `Fixed in abc1234`)
8. Reports any skipped comments with reasons (disagreement, out of scope, needs discussion)

## How It Works

- **Project scoping**: All commands read `CLAUDE.md` for the `<!-- gh-skills-start -->` block to find the scoped `owner/repo`. They refuse to run without it — run `/gh:setup` first.
- **GitHub CLI only**: Uses `gh` CLI exclusively. No API tokens needed beyond what `gh auth` provides.
- **Respects your setup**: Works alongside your existing Claude Code skills, plugins, and `CLAUDE.md` conventions.
- **Namespaced**: Commands live under `/gh:*` to avoid collisions with other skills.
- **No destructive actions**: Commands create branches and PRs but never force-push, delete branches, or merge without your approval.

## File Structure

```
claude-github-skills/
├── bin/
│   └── install.js          # Installer — copies commands to ~/.claude or ./.claude
├── commands/
│   └── gh/
│       ├── setup.md        # /gh:setup skill definition
│       ├── work.md         # /gh:work skill definition
│       ├── review-pr.md    # /gh:review-pr skill definition
│       ├── fix-pr.md       # /gh:fix-pr skill definition
│       └── list.md         # /gh:list skill definition
├── package.json
└── README.md
```

## Uninstall

Remove the command files:

```bash
# Global install
rm -rf ~/.claude/commands/gh

# Project-local install
rm -rf .claude/commands/gh
```

And optionally remove the `<!-- gh-skills-start -->` to `<!-- gh-skills-end -->` block from your project's `CLAUDE.md`.

## Links

- [npm package](https://www.npmjs.com/package/claude-github-skills)
- [GitHub repository](https://github.com/chinofyoung/claude)
- [Report issues](https://github.com/chinofyoung/claude/issues)

## License

MIT
