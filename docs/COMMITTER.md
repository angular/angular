# Pushing changes into the Angular tree

Please see [Using git with Angular repositories](https://docs.google.com/document/d/1h8nijFSaa1jG_UE8v4WP7glh5qOUXnYtAtJh_gwOQHI/edit)
for details about how we maintain a linear commit history and the rules for committing.

As a contributor, see the instructions in [CONTRIBUTING.md](../CONTRIBUTING.md).

# Change approvals

Change approvals in our monorepo are managed via [PullApprove](https://docs.pullapprove.com/) and are configured via the [`.pullapprove.yml`](../.pullapprove.yml) file.

# Merging

Once a change has all of the required approvals, either the last approver or the PR author (if PR author has the project collaborator status)
should mark the PR with the `action: merge` label and the correct [target label](https://github.com/angular/angular/blob/main/docs/TRIAGE_AND_LABELS.md#pr-target).
This signals to the caretaker that the PR should be merged. See [merge instructions](CARETAKER.md).

# Who is the Caretaker?

See [this explanation](https://twitter.com/IgorMinar/status/799365744806854656).
