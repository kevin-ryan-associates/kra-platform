---
name: "linear-platform-development"
description: "Interact with the Platform Development Linear project for kra-platform — find spec/feature issues, file new work, and close the loop when done. Use for any Linear lookup, issue creation, or issue status update in this repo."
version: 1
created: "2026-09-21"
updated: "2026-09-21"
---

## When to Use

Any time work in this repo touches Linear: checking the Platform Development project for spec/feature issues before starting work, filing newly-discovered work as issues, looking up an issue referenced in a branch/commit, or updating issue status when work completes. Also when the user mentions Linear, an issue number (KRA-NN), or \"the project board\".

## Procedure

1. Verify the server is live: `mcp({})` should show `linear` connected. If not listed, the session predates `.mcp.json` — ask the user to run `/reload`. First tool call on a lazy connection takes a few seconds.
2. Find the project's issues: `mcp({ tool: "linear_list_issues", args: { project: "fe85bfeb-01f9-4bed-ba44-ccba4ae9fd03" } })` — filters directly by project ID, no need to resolve the project first. Add `query` for keyword search, `state` for status filtering.
3. Read full scope before working: `mcp({ tool: "linear_get_issue", args: { id: <issue-id-or-identifier> } })` — the issue description is the source of truth for scope and acceptance criteria.
4. Create a new issue: `mcp({ tool: "linear_save_issue", args: { team: "KRA", project: "fe85bfeb-01f9-4bed-ba44-ccba4ae9fd03", title: "...", description: "..." } })` — `team` is required on create; use `assignee` (accepts "me"), never `assigneeId`; `state` accepts a status name.
5. Reference the issue identifier (e.g. `KRA-42`, from the issue's `identifier` field) in branch names and commit messages.
6. Close the loop when work lands: `mcp({ tool: "linear_save_issue", args: { id: <issue-id>, state: "Done" } })` and/or add a comment with the commit SHA and verification evidence.

## Pitfalls

- The linear MCP server is lazy — first call after connect can take several seconds; don't assume failure.
- Issue identifier (KRA-42) and issue UUID are different fields — `linear_save_issue`/`linear_get_issue` accept either, but branch/commit references use the identifier.
- On create, `team` is required or the call fails; attaching to the project requires `project` set explicitly.
- Use `assignee`, not `assigneeId` — `assigneeId` is silently wrong on this server's create/update shape.
- The linear server is read-write — never move/update issues without the user's direction; check-first applies to reads, ask-before-write to mutations beyond what the user requested.
- Tokens are OAuth in the OS keychain — if auth fails, the fix is `/mcp-auth linear` in the TUI, not any config change in the repo.

## Verification

1. `mcp({})` lists linear as connected.
2. A `linear_list_issues` call with the project filter returns the project's issues (currently may be empty — an empty result with hasNextPage false is success).
3. For created issues, the returned object includes the project and team fields, and the identifier follows the KRA-NN pattern.
