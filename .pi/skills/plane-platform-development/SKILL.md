---
name: "plane-platform-development"
description: "Interact with the kra-platform-development Plane project for kra-platform — find spec/feature work items, file new work, and close the loop when done. Use for any Plane lookup, work item creation, or work item status update in this repo."
version: 1
created: "2026-09-23"
updated: "2026-09-23"
---

## When to Use

Any time work in this repo touches Plane: checking the kra-platform-development project for spec/feature work items before starting work, filing newly-discovered work, looking up an item referenced in a branch/commit (`KRA-NN`), or updating item status when work completes. Also when the user mentions Plane, a work item number (`KRA-NN`), or \"the project board\". Any agent starting implementation work on a Plane work item must follow the Ticket Lifecycle below.

## Ticket Lifecycle (mandatory)

These rules are standing instructions from the repository owner and apply to **all** implementation work driven by a Plane work item in this repo. An agent that starts a Plane item without following them is out of compliance.

1. **In Progress on start.** The moment you begin implementing a work item, move it to `In Progress`:
   `mcp({ tool: "plane_workitem", args: { action: "update", project_id: PROJECT_ID, workitem_id: <uuid>, state: IN_PROGRESS_UUID } })`.
2. **Post the plan before implementing.** Before touching any code, comment on the item with the implementation plan (summary, files/approach, verification steps):
   `mcp({ tool: "plane_workitem_comment", args: { action: "create", project_id: PROJECT_ID, workitem_id: <uuid>, comment_html: "<p>...</p>" } })`.
   The posted plan is the source of truth that reviewers and later agents diff against.
3. **Log deviations and learnings as they occur.** Any deviation from the posted plan — or important information gained while working (root causes, discovered drift, constraints, follow-up work) — becomes a comment on the item as it is discovered, not batched into a single end-of-task comment.
4. **In Review once committed.** When the work is complete and committed/pushed to GitHub, move the item to `In Review` and comment with the commit SHA / PR link and verification evidence:
   `workitem update` with `state: IN_REVIEW_UUID` + `workitem_comment create`.
5. **Done only on human instruction.** Never transition an item to `Done` on your own initiative — not even when CI, deploys, and verification all pass. `Done` happens only when a human operator explicitly says so.

## Constants (verified live 2026-09-23)

- Workspace: `kevin-ryan-associates` (slug — the OAuth connection is bound to it)
- Project: `kra-platform-development` — project_id `98a0fada-1048-499b-a869-64c422fd26bb`, work item identifier prefix `KRA`
- States (name → UUID, group):
  - Backlog → `cb3a9bed-5c7d-4d75-a6fc-4b39c4ec84e3` (backlog, default)
  - Todo → `aed6ec5f-5708-4370-a6c9-4143da98ae52` (unstarted)
  - In Progress → `1cb8a484-1ca0-46a7-9c26-acfe918057af` (started)
  - In Review → `5143a65a-2628-42d9-8c07-b22582a3819a` (started — custom state created 2026-09-23 for this lifecycle)
  - Done → `468f6292-b286-4185-8c3a-de55424c1697` (completed)
  - Cancelled → `b482efe9-f972-4b2a-a5dc-691269027466` (cancelled)

## Procedure

1. Verify the server is live: `mcp({})` should show `plane` connected (30 tools, all prefixed `plane_`). If not listed, the session predates `.mcp.json` — ask the user to run `/reload`. If auth fails, the fix is `/mcp-auth plane` in the TUI — tokens are OAuth in the OS keychain, never in this repo.
2. Find the project's work items: `mcp({ tool: "plane_workitem", args: { action: "list", project_id: PROJECT_ID } })`. Add `pql` for filtering (UUID-backed fields need UUIDs — resolve names first); call `plane_get_pql_reference` for PQL syntax. `action: "search"` with `query` searches the whole workspace.
3. Read full scope before working: `mcp({ tool: "plane_workitem", args: { action: "retrieve_by_identifier", workitem_identifier: "KRA-NN" } })` — no `project_id` needed; the description is the source of truth for scope and acceptance criteria.
4. Create a new work item: `mcp({ tool: "plane_workitem", args: { action: "create", project_id: PROJECT_ID, name: "...", description_stripped: "...", priority: "medium" } })` — `priority` is one of `urgent | high | medium | low | none`; `description_stripped` is plain text (wrapped into HTML on save; `description_html` wins if both are given).
5. Reference the item identifier (e.g. `KRA-42`) in branch names and commit messages.
6. Before starting implementation, follow the Ticket Lifecycle: move the item to `In Progress` and post the plan as a comment (`workitem_comment create`).
7. Close the loop per the Ticket Lifecycle: comment deviations/learnings as they occur; when the work is committed to GitHub, move the item to `In Review` and comment with the commit SHA and verification evidence; move to `Done` only when a human operator explicitly instructs it.

## Pitfalls

- One tool per resource, selected by an `action` parameter — there are no per-operation tool names (no `plane_create_issue`; it is `plane_workitem` with `action: "create"`). Key tools: `plane_workitem`, `plane_workitem_comment`, `plane_state`, `plane_project`, `plane_member`, `plane_label`, `plane_cycle`, `plane_module`, `plane_work_log`, `plane_get_pql_reference`.
- UUID-backed parameters (`state`, `assignees`, `labels`, `parent`, `type_id`) take UUIDs, never names — list the resource first. The state UUIDs are in Constants above; re-verify with `plane_state list` if a state was ever recreated.
- `plane_project` `update` can return `HTTP 400: Bad Request: Please provide valid detail` **even when the write succeeded** (observed changing the project identifier — a follow-up `retrieve` showed it landed). Verify project/state writes with a follow-up read; do not trust the error echo.
- `plane_state` `create` ignored the requested `sequence` (In Review landed at 70000 instead of 40000; fixed via `state update`) — verify ordering after creating a state.
- `comment_html` is HTML — wrap prose in `<p>…</p>`. Mentions are `@[<user uuid>]` inline (a bare `@name` is plain text and notifies nobody).
- On `workitem update`, only the fields you pass are changed. To clear a field: `assignees: []` or `labels: []`, `start_date: null` / `target_date: null`.
- `workitem archive` only works on completed or cancelled items; use `workitem delete` for scratch items. Full round-trip (create → comment → update state → retrieve_by_identifier → delete) verified live on `KRA-1` 2026-09-23.
- List actions are paginated — follow `next_cursor` or pass `per_page`.
- Plane has no teams (Linear's `KRA` team maps to the project itself) and no built-in `In Review` state — the custom one in Constants exists for this lifecycle; do not create a duplicate.
- Identifier collision by date: Plane numbering restarts at `KRA-1` while Linear's historical record also used `KRA-NN` (through `KRA-81`). Identifiers alone are ambiguous — pre-2026-09-23 references are Linear, later ones are Plane.
- The plane server is read-write — check-first applies to reads. For writes: the Ticket Lifecycle above is pre-authorized standing instruction from the repository owner; anything beyond it (reassigning, re-prioritizing, deleting non-scratch items, workflow/state changes) needs the user's direction first.
- Never move an item to `Done` autonomously — the transition requires an explicit human operator instruction, even when CI, deploys, and verification all pass.
- Don't batch deviations/learnings into one end-of-task comment — post them on the item as they are discovered.
- Comments go through `workitem_comment` (`create`/`list` with `project_id` + `workitem_id`), not `workitem`. `workitem_comment list` reads them back when resuming an item.

## Verification

1. `mcp({})` lists plane as connected.
2. A `plane_workitem list` call with the project filter returns the project's items (an empty result is success — the project was empty at migration).
3. For created items, the returned object includes `sequence_id`, and `retrieve_by_identifier` round-trips the `KRA-NN` identifier.
4. An item the agent starts work on shows state `In Progress` and a plan comment (via `workitem_comment list`) before any code edit is made.
5. On completion, the item is `In Review` with a commit-SHA/evidence comment; `Done` appears only after a human operator explicitly requests it.
