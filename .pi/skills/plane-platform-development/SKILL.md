---
name: "plane-platform-development"
description: "Interact with the kra-platform-development Plane project for kra-platform — find spec/feature work items, file new work, and close the loop when done. Use for any Plane lookup, work item creation, or work item status update in this repo."
version: 1.3
created: "2026-09-23"
updated: "2026-09-25"
---

## When to Use

Any time work in this repo touches Plane: checking the kra-platform-development project for spec/feature work items before starting work, filing newly-discovered work, looking up an item referenced in a branch/commit (`KRA-NN`), or updating item status when work completes. Also when the user mentions Plane, a work item number (`KRA-NN`), or \"the project board\". Any agent starting implementation work on a Plane work item must follow the Ticket Lifecycle below.

## Ticket Lifecycle (mandatory)

These rules are standing instructions from the repository owner and apply to **all** implementation work driven by a Plane work item in this repo. An agent that starts a Plane item without following them is out of compliance.

1. **Feature branch on start.** Create a feature branch before making any changes — named after the item (`kra-NN`) or a scope name for multi-item work (e.g. `kra-13-docs`). Never commit work-item changes directly to `main` unless the user explicitly instructs otherwise for that specific change. Merge back via PR (or push to the branch and let the user decide the merge, per their direction).
2. **In Progress on start.** The moment you begin implementing a work item, move it to `In Progress`:
   `mcp({ tool: "plane_workitem", args: { action: "update", project_id: PROJECT_ID, workitem_id: <uuid>, state: IN_PROGRESS_UUID } })`.
3. **Post the plan before implementing.** Before touching any code, comment on the item with the implementation plan (summary, files/approach, verification steps):
   `mcp({ tool: "plane_workitem_comment", args: { action: "create", project_id: PROJECT_ID, workitem_id: <uuid>, comment_html: "<p>...</p>" } })`.
   The posted plan is the source of truth that reviewers and later agents diff against.
4. **Log deviations and learnings as they occur.** Any deviation from the posted plan — or important information gained while working (root causes, discovered drift, constraints, follow-up work) — becomes a comment on the item as it is discovered, not batched into a single end-of-task comment.
5. **In Review once committed.** When the work is complete and committed/pushed to GitHub, move the item to `In Review` and comment with the commit SHA / PR link and verification evidence:
   `workitem update` with `state: IN_REVIEW_UUID` + `workitem_comment create`.
6. **Done only on human instruction.** Never transition an item to `Done` on your own initiative — not even when CI, deploys, and verification all pass. `Done` happens only when a human operator explicitly says so.

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
- Epic work item type: `211926f4-3894-475a-b394-d0d28e8149a5` (`plane_workitem_type` `resolve` "Epic", `is_epic: true`); project features `epics` + `workitem_types` enabled 2026-09-25 (`plane_project` `update_features`). Epic example: KRA-13 "Update documentation" with children KRA-2..KRA-12.
- Cycle Sprint 1: `b09126cc-ecb5-4e33-b20b-af190157cfbd` (2026-09-23 → 2026-10-07) — `plane_cycle` `retrieve` gives authoritative dates.

## Procedure

1. Verify the server is live: `mcp({})` should show `plane` connected (30 tools, all prefixed `plane_`). If not listed, the session predates `.mcp.json` — ask the user to run `/reload`. If auth fails, the fix is `/mcp-auth plane` in the TUI — tokens are OAuth in the OS keychain, never in this repo.
2. Find the project's work items: `mcp({ tool: "plane_workitem", args: { action: "list", project_id: PROJECT_ID } })`. Add `pql` for filtering (UUID-backed fields need UUIDs — resolve names first); call `plane_get_pql_reference` for PQL syntax. `action: "search"` with `query` searches the whole workspace.
3. Read full scope before working: `mcp({ tool: "plane_workitem", args: { action: "retrieve_by_identifier", workitem_identifier: "KRA-NN" } })` — no `project_id` needed; the description is the source of truth for scope and acceptance criteria.
4. Create a new work item: `mcp({ tool: "plane_workitem", args: { action: "create", project_id: PROJECT_ID, name: "...", description_stripped: "...", priority: "medium" } })` — `priority` is one of `urgent | high | medium | low | none`; `description_stripped` is plain text (wrapped into HTML on save; `description_html` wins if both are given).
5. Reference the item identifier (e.g. `KRA-42`) in branch names and commit messages.
6. Before starting implementation, follow the Ticket Lifecycle: create the feature branch, move the item to `In Progress`, and post the plan as a comment (`workitem_comment create`).
7. Close the loop per the Ticket Lifecycle: comment deviations/learnings as they occur; when the work is committed to GitHub, move the item to `In Review` and comment with the commit SHA and verification evidence; move to `Done` only when a human operator explicitly instructs it.

## Pitfalls

- One tool per resource, selected by an `action` parameter — there are no per-operation tool names (no `plane_create_issue`; it is `plane_workitem` with `action: "create"`). Key tools: `plane_workitem`, `plane_workitem_comment`, `plane_state`, `plane_project`, `plane_member`, `plane_label`, `plane_cycle`, `plane_module`, `plane_work_log`, `plane_get_pql_reference`.
- UUID-backed parameters (`state`, `assignees`, `labels`, `parent`, `type_id`) take UUIDs, never names — resolve them first. The state UUIDs are in Constants above; re-verify with `plane_state list` if a state was ever recreated. For `assignees`, the member UUID comes from `plane_member` `action: "me"` (see the `plane_member` pitfall below) — `created_by` on any existing work item is also Kevin's UUID.
- `plane_project` `update` can return `HTTP 400: Bad Request: Please provide valid detail` **even when the write succeeded** (observed changing the project identifier — a follow-up `retrieve` showed it landed). Verify project/state writes with a follow-up read; do not trust the error echo.
- `plane_state` `create` ignored the requested `sequence` (In Review landed at 70000 instead of 40000; fixed via `state update`) — verify ordering after creating a state.
- `comment_html` is HTML — wrap prose in `<p>…</p>`. Mentions are `@[<user uuid>]` inline (a bare `@name` is plain text and notifies nobody).
- On `workitem update`, only the fields you pass are changed. To clear a field: `assignees: []` or `labels: []`, `start_date: null` / `target_date: null`.
- `workitem archive` only works on completed or cancelled items; use `workitem delete` for scratch items. Full round-trip (create → comment → update state → retrieve_by_identifier → delete) verified live on `KRA-1` 2026-09-23.
- List actions are paginated — follow `next_cursor` or pass `per_page`.
- Plane has no teams (Linear's `KRA` team maps to the project itself) and no built-in `In Review` state — the custom one in Constants exists for this lifecycle; do not create a duplicate.
- Identifier mismatch with Linear history: all 11 Linear issues were migrated on 2026-09-23 (open KRA-71…KRA-81 → Plane KRA-2…KRA-10; the two pre-migration Done items KRA-74/KRA-76 → Plane KRA-11/KRA-12), but Plane renumbered them consecutively — the numbers do not correspond. Every migrated item carries a Linear backlink (`workitem_link`) and a provenance line in its description; use those, not the number, to correlate. Pre-2026-09-23 `kra-NN` references (git history, old PRs) mean the Linear issue.
- The plane server is read-write — check-first applies to reads. For writes: the Ticket Lifecycle above is pre-authorized standing instruction from the repository owner; anything beyond it (reassigning, re-prioritizing, deleting non-scratch items, workflow/state changes) needs the user's direction first.
- Never move an item to `Done` autonomously — the transition requires an explicit human operator instruction, even when CI, deploys, and verification all pass.
- `plane_member` has **no** `list` action — its actions are `me | list_workspace | list_project | list_roles | retrieve_role`. Use `action: "me"` to get your own member UUID (`id` field) when assigning yourself to items (verified 2026-09-23 assigning KRA-2…KRA-8 in one mcpScript pass).
- Through `mcpScript`, `plane_workitem list` output exceeds the response size limit: the result is replaced by an `omitted: true` summary and the full JSON is written to a temp file (`fullResultPath`). Do **not** treat that as an empty project. Options: run `list` via the direct `mcp` tool (full result comes back inline), narrow the list with `pql`, or parse the `fullResultPath` temp file. Per-item calls (`retrieve_by_identifier`) are small and fit fine — when only IDs are needed, `retrieve_by_identifier` each item instead of `list`.
- In `mcpScript`, `tools.call` resolves to `{ok, data: {structuredContent: …}}` (sometimes with a further `.result` inside) — unwrap `.data.structuredContent` (and `.result` if present) before reading fields. A wrong unwrap makes *successful* writes look like failures (observed 2026-09-23: assignee updates landed but a broken unwrap reported `NOT ASSIGNED`). Always verify writes with a follow-up read of the actual field — for assignees, `assignees` contains the UUID and `min_assignee_first_name` shows the resolved name.
- State-update responses can echo stale `state_group` (moving KRA-9 to Done returned `state_group: "started"` while `state` was the Done UUID and `completed_at` was set). Trust `state` + `completed_at`, or confirm with `retrieve_by_identifier` (`state_group` showed `completed` on the follow-up read).
- `workitem update` silently ignores `sort_order`: the call returns ok, but `updated_at` stays unchanged and a follow-up read shows the old value (verified 2026-09-23 setting kanban order on KRA-2…KRA-9). Plane's public API does not persist manual kanban ordering via PATCH, and the server exposes no reorder tool. Within-column board order can only be set by dragging cards in the Plane UI, or indirectly by sorting the board by `priority` (which the API does control). Always verify `sort_order` writes with a follow-up `retrieve` — do not trust the ok response.
- Epics: enable via `plane_project` `update_features` (`epics: true`, `workitem_types: true`) before the Epic type is usable; then `plane_workitem_type` `resolve` (find-or-create, never duplicates). Epics carry no `state_group` (null) — child progress rolls up instead; an epic can still be added to a cycle. Give the epic `start_date`/`target_date` matching the cycle's dates.
- `plane_cycle` `manage_workitems` `add_ids`/`remove_ids` take a **comma-separated string, not a JSON array** (pydantic rejects lists) and return `null` — verify with `cycle` `list_workitems` afterwards.
- Work item reads (`list`, `retrieve_by_identifier`, `update` responses) show `cycle_id: null` for **cycle members too** (observed 2026-09-25: every Sprint 1 item, incl. ones confirmed in the cycle, reads back `cycle_id: null`) — `cycle_id` on a work item read is not evidence of cycle membership either way. Verify membership only via `plane_cycle` `list_workitems`.
- PQL cannot filter on `parent` (rejected: "Filtering on field 'parent' is not allowed") — use the relation function `childOf("KRA-13")` instead. `parent` also does not come back in `workitem list` sparse fieldsets — verify `parent` writes with `retrieve_by_identifier`, not with `list` + `fields`.
- Don't batch deviations/learnings into one end-of-task comment — post them on the item as they are discovered.
- Comments go through `workitem_comment` (`create`/`list` with `project_id` + `workitem_id`), not `workitem`. `workitem_comment list` reads them back when resuming an item.

## Verification

1. `mcp({})` lists plane as connected.
2. A `plane_workitem list` call with the project filter returns the project's items (an empty result is success — the project was empty at migration).
3. For created items, the returned object includes `sequence_id`, and `retrieve_by_identifier` round-trips the `KRA-NN` identifier.
4. An item the agent starts work on shows state `In Progress` and a plan comment (via `workitem_comment list`) before any code edit is made.
5. On completion, the item is `In Review` with a commit-SHA/evidence comment; `Done` appears only after a human operator explicitly requests it.
