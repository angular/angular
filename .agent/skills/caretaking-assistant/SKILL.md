---
name: Caretaking Assistant
description: Guidelines and workflow for assisting the Angular caretaker with daily operations, build monitoring, and Merge Queue management.
---

# Caretaking Assistant Guidelines

## 1. Merge Queue Management

A PR is considered ready for merge if it has all the reviews and required checks passing. Notably:

- PR has all approvals and no pending code reviews
- All required checks are passing
- It merges cleanly (no merge conflicts)

Inspect the open PRs waiting in the Merge Queue.

- Fetch all open PRs with the `action: merge` label (e.g., using GitHub search `repo:angular/angular is:pr is:open label:"action: merge"`).
- Sort the PRs by age (oldest first).
- Group the fetched PRs into the following categories and present them to the caretaker:

### A. Low-Risk PRs ready for merge

Identify PRs that are inherently low-risk AND ready to merge. Do not include PRs that are blocked by failing checks.

- **Criteria for Low-Risk**:
  - Documentation changes (PR description/title typically starts with `docs:` or `docs(...)`)
  - Build/CI changes (PR description/title typically starts with `build:` or `build(...)`)
  - PRs where the `google-internal-tests` check is "Does not affect Google"
- **Action**: List these PRs clearly for the caretaker.

### B. High-Coverage / G3 PRs (Batching)

Identify PRs that affect Google's internal codebase (G3) AND ready to merge. Do not include PRs that are blocked by failing checks.

- **Criteria**: Look for the `google-internal-tests` status check. It must have a `PASSING` (success) state.
- **Action**: Propose a **merging plan** by batching these PRs into "G3 sync" groups.
- **Batching Rules**:
  1. Group PRs from _very different_ areas of the framework. This ensures that if a G3 sync breaks, the culprit is easily identifiable.
  2. Always place PRs affecting the `router` (`packages/router`) into their own separate batch to isolate routing breakages.

### C. Extra Mile: Approval Opportunities

Identify which of the pending low-risk PRs the current caretaker can approve themselves to unblock the queue.

- **Action**:
  1. Fetch the files modified by the pending PRs.
  2. Inspect the `.pullapprove.yml` rules in the repository root.
  3. Map the modified files to the corresponding review groups to see if the caretaker's username or team is listed as a valid reviewer for those groups (pay attention to robotic overrides, e.g., `angular-robot` bypassing `dev-infra` to `renovate-changes`).
  4. Inform the caretaker which specific PRs they possess the rights to approve and move forward.

### D. Extra Mile: G3 Presubmit Failures or Pending

Identify PRs that affect Google's internal codebase (G3) AND have failing or pending presubmit checks.

- **Criteria**: Look for the `google-internal-tests` status check. It must have a `FAILED` (failure) or `PENDING` (pending) state.
- **Action**: Inform the caretaker about these PRs and suggest actions (inspecting presubmit or starting one).

Respond in markdown format. When you mention PRs make sure to include a link to the PR. When listing PRs include both their number and title.
