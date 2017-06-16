# Code reviews for Angular Material

* Before any coding begins on new, large, or breaking work, a design discussion should take place.
* All code changes require a review and approval.
* All behaviors should be covered by unit tests in the same PR.
* Large changes should be accompanied by corresponding e2e tests in the same PR. 
* Authors should attempt to keep PRs to 200 - 300 line changes.
 
## Workflow
1. The code author sends a PR for review. This request should include:
  * A mention of the intended reviewer(s) (e.g., `@jelbourn`)
  * A high-level description of the change being made.
  * Links to any relevant issues.
  * Screenshots (for visual changes or new additions)
2. Reviews provide comments and the author responds / makes changes. Repeat until LGTM.
3. One or more of the reviewers applies the "LGTM" label.
4. Once the LGTM label is applied, either the author or the reviewer can add the "merge-ready"
   label to indicate that the PR is ready to be merged.
5. The party responsible for merging PRs will do so.

## How PRs are merged
The team has a weekly rotation for the "caretaker" who is responsible for merging PRs. Before being
merged, the caretaker runs PRs through Google's internal presubmit system. This process helps
greatly in keeping the library stable by running against the tests of many applications inside of
Google. Due to the volume of tests involved, this process means that there can be some delay
between a PR being approved and it being merged.

The "merge safe" label means that the change doesn't affect the library itself (or the demo-app),
and thus can be merged without this extra presubmit.

The "presubmit failure" label means that the PR has encountered some failure during presubmit and
needs further investigation by the team.
