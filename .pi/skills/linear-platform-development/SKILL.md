---
name: "linear-platform-development"
description: "Interact with the Platform Development Linear project for kra-platform — find spec/feature issues, file new work, and close the loop when done. Use for any Linear lookup, issue creation, or issue status update in this repo."
version: 3
created: "2026-09-21"
updated: "2026-09-21"
---

## When to Use

Any time work in this repo touches Linear: checking the Platform Development project for spec/feature issues before starting work, filing newly-discovered work as issues, looking up an issue referenced in a branch/commit, or updating issue status when work completes. Also when the user mentions Linear, an issue number (KRA-NN), or \"the project board\". Any agent starting implementation work on a Linear issue must follow the Ticket Lifecycle below.

## Ticket Lifecycle (mandatory)

These rules are standing instructions from the repository owner and apply to **all** implementation work driven by a Linear issue in this repo. An agent that starts a Linear issue without following them is out of compliance.

1. **In Progress on start.** The moment you begin implementing an issue, move it to `In Progress`:
   `mcp({ tool: "linear_save_issue", args: { id: <issue-id>, state: "In Progress" } })`.
2. **Post the plan before implementing.** Before touching any code, comment on the issue with the implementation plan (summary, files/approach, verification steps):
   `mcp({ tool: "linear_save_comment", args: { issueId: <issue-id>, body: "..." } })`.
   The posted plan is the source of truth that reviewers and later agents diff against.
3. **Log deviations and learnings as they occur.** Any deviation from the posted plan — or important information gained while working (root causes, discovered drift, constraints, follow-up work) — becomes a comment on the issue as it is discovered, not batched into a single end-of-task comment.
4. **In Review once committed.** When the work is complete and committed/pushed to GitHub, move the issue to `In Review` and comment with the commit SHA / PR link and verification evidence:
   `mcp({ tool: "linear_save_issue", args: { id: <issue-id>, state: "In Review" } })` + `linear_save_comment`.
5. **Done only on human instruction.** Never transition an issue to `Done` on your own initiative — not even when CI, deploys, and verification all pass. `Done` happens only when a human operator explicitly says so.

## Procedure

1. Verify the server is live: `mcp({})` should show `linear` connected. If not listed, the session predates `.mcp.json` — ask the user to run `/reload`. First tool call on a lazy connection takes a few seconds.
2. Find the project's issues: `mcp({ tool: "linear_list_issues", args: { project: "fe85bfeb-01f9-4bed-ba44-ccba4ae9fd03" } })` — filters directly by project ID, no need to resolve the project first. Add `query` for keyword search, `state` for status filtering.
3. Read full scope before working: `mcp({ tool: "linear_get_issue", args: { id: <issue-id-or-identifier> } })` — the issue description is the source of truth for scope and acceptance criteria.
4. Create a new issue: `mcp({ tool: "linear_save_issue", args: { team: "KRA", project: "fe85bfeb-01f9-4bed-ba44-ccba4ae9fd03", title: "...", description: "..." } })` — `team` is required on create; use `assignee` (accepts "me"), never `assigneeId`; `state` accepts a status name.
5. Reference the issue identifier (e.g. `KRA-42`, from the issue's `identifier` field) in branch names and commit messages.
6. Before starting implementation, follow the Ticket Lifecycle: move the issue to `In Progress` and post the plan as a comment (`linear_save_comment` with `issueId` + `body`).
7. Close the loop per the Ticket Lifecycle: comment deviations/learnings as they occur; when the work is committed to GitHub, move the issue to `In Review` and comment with the commit SHA and verification evidence; move to `Done` only when a human operator explicitly instructs it.

## Pitfalls

- The linear MCP server is lazy — first call after connect can take several seconds; don't assume failure.
- Read and write tools have different key shapes on this server: `linear_get_project` takes `query` (name, ID, identifier, or slug), NOT `id`; `linear_save_project` updates via `id`. `linear_get_issue`/`linear_save_issue` do take `id`.
- Issue identifier (KRA-42) and issue UUID are different fields — `linear_save_issue`/`linear_get_issue` accept either, but branch/commit references use the identifier.
- On create, `team` is required or the call fails; attaching to the project requires `project` set explicitly.
- Use `assignee`, not `assigneeId` — `assigneeId` is silently wrong on this server's create/update shape.
- The linear server is read-write — check-first applies to reads. For writes: the Ticket Lifecycle above is pre-authorized standing instruction from the repository owner; anything beyond it (reassigning, re-prioritizing, archiving, deleting) needs the user's direction first.
- Never move an issue to `Done` autonomously — the transition requires an explicit human operator instruction, even when CI, deploys, and verification all pass.
- Don't batch deviations/learnings into one end-of-task comment — post them on the issue as they are discovered.
- Comments go through `linear_save_comment` (`issueId` + `body`), not `linear_save_issue`. `linear_list_comments` reads them back when resuming an issue.
- Exact KRA workflow status names (verified 2026-09-21 via `linear_list_issue_statuses`): `Todo`, `In Progress`, `In Review`, `Done`, `Canceled`, `Backlog`, `Duplicate` — `state` accepts these names directly.
- Tokens are OAuth in the OS keychain — if auth fails, the fix is `/mcp-auth linear` in the TUI, not any config change in the repo.

## Verification

1. `mcp({})` lists linear as connected.
2. A `linear_list_issues` call with the project filter returns the project's issues (currently may be empty — an empty result with hasNextPage false is success).
3. For created issues, the returned object includes the project and team fields, and the identifier follows the KRA-NN pattern.
4. An issue the agent starts work on shows state `In Progress` and a plan comment (via `linear_list_comments`) before any code edit is made.
5. On completion, the issue is `In Review` with a commit-SHA/evidence comment; `Done` appears only after a human operator explicitly requests it.
