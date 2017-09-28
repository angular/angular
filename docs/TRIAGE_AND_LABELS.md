# Triage Process and GitHub Labels for Angular

This document describes how the Angular team uses labels and milestones
to triage issues on github. The basic idea of the process is that
caretaker only assigns a component and type (bug, feature) label. The
owner of the component than is in full control of how the issues should
be triaged further.

Once this process is implemented and in use, we will revisit it to see
if further labeling is needed.

## Label Types

### Components

A caretaker should be able to determine which component the issue
belongs to. The components have a clear piece of source code associated
with it within the `/packages/` folder of this repo.

* `comp: aio` - the angular.io application
* `comp: animations`
* `comp: bazel`
* `comp: benchpress`
* `comp: common` - this includes core components / pipes
* `comp: core, compiler` - because core, compiler, compiler-cli and
  browser-platforms are very intertwined, we will be treating them as one
* `comp: forms`
* `comp: http`
* `comp: i18n`
* `comp: language service`
* `comp: router`
* `comp: testing`
* `comp: upgrade`
* `comp: web-worker`
* `comp: zones`

There are few components which are cross-cutting. They don't have
a clear location in the source tree. We will treat them as a component
even thought no specific source tree is associated with them.

* `comp: build & ci` - all build and CI scripts
* `comp: docs` - documentation, including API docs, guides, tutorial
* `comp: packaging`
* `comp: performance`
* `comp: security`


### Type

What kind of problem is this?

* `type: RFC / discussion / question`
* `type: bug`
* `type: docs`
* `type: feature`
* `type: performance`
* `type: refactor`

## Caretaker Triage Process

It is the caretaker's responsibility to assign `comp:  *` to each new
issue as they come in. The reason why we limit the responsibility of the
caretaker to this one label is that it is likely that without domain
knowledge the caretaker could mislabel issues or lack knowledge of
duplicate issues.


## Component's owner Triage Process

At this point we are leaving each component owner to determine their own
process for their component.

It will be up to the component owner to determine the order in which the
issues within the component will be resolved.

Several owners have adopted the issue categorization based on
[user pain](http://www.lostgarden.com/2008/05/improving-bug-triage-with-user-pain.html)
used by AngularJS. In this system every issue is assigned frequency and
severity based on which the total user pain score is calculated.

Following is the definition of various frequency and severity levels:

1. `freq(score): *` – How often does this issue come up? How many developers does this affect?
    * low (1) - obscure issue affecting a handful of developers
    * moderate (2) - impacts auxiliary usage patterns, only small number of applications are affected
    * high (3) - impacts primary usage patterns, affecting most Angular apps
    * critical (4) - impacts all Angular apps
1. `severity(score): *` - How bad is the issue?
    * inconvenience (1) - causes ugly/boilerplate code in apps
    * confusing (2) - unexpected or inconsistent behavior; hard-to-debug
    * broken expected use (3) - it's hard or impossible for a developer using Angular to accomplish something that Angular should be able to do
    * memory leak (4)
    * regression (5) - functionality that used to work no longer works in a new release due to an unintentional change
    * security issue (6)


These criteria are then used to calculate a "user pain" score as follows:

`pain = severity × frequency`


## Triaged vs Untrained PRs

PRs should also be label with a `comp: *` so that it is clear which
primary area the PR effects.

Because of the cumulative pain associated with rebasing PRs, we triage PRs daily, and
closing or reviewing PRs is a top priority ahead of other ongoing work.

Every triaged PR must have a `pr_action` label assigned to it and an assignee:

* `PR action: review` - work is complete and comment is needed from the assignee.
* `PR action: cleanup` - more work is needed from the current assignee.
* `PR action: discuss` - discussion is needed, to be led by the current assignee.
* `PR action: merge` - the PR is ready to be merged by the caretaker.

In addition, PRs can have the following states:

* `PR state: WIP` - PR is experimental or rapidly changing. Not ready for review or triage.
* `PR state: blocked` - PR is blocked on an issue or other PR. Not ready for review or triage.


## PR Target

In our git workflow, we merge changes either to the `master` branch, the most recent patch branch (e.g. `4.3.x`), or to both.

The decision about the target must be done by the PR author and/or reviewer. This decision is then honored when the PR is being merged.

To communicate the target we use the following labels:

* `PR target: master-only`
* `PR target: patch-only`
* `PR target: master & patch`
* `PR target: TBD` - the target is yet to be determined

If a PR is missing the "PR target" label, or if the label is set to "TBD" when the PR is sent to the caretaker, the caretaker should reject the PR and request the appropriate target label to be applied before the PR is merged.


## PR Approvals

Before a PR can be merged it must be approved by the appropriate reviewer(s).

To ensure that there right people review each change, we configured [PullApprove bot](https://about.pullapprove.com/) via (`.pullapprove.yaml`) to provide aggregate approval state via the GitHub PR Status API.

Note that approved state does not mean a PR is ready to be merged. For example, a reviewer might
approve the PR but request a minor tweak that doesn't need further review, e.g., a rebase or small
uncontroversial change.


## Special Labels

### action:design
More active discussion is needed before the issue can be worked on further. Typically used for
`type: feature` or `type: RFC/discussion/question`

[See all issues that need discussion](https://github.com/angular/angular/labels/action:%20Design)

### cla: yes, cla: no
Managed by googlebot. Indicates whether a PR has a CLA on file for its author(s). Only issues with
`cla:yes` should be merged into master.

### WORKS_AS_INTENDED

Only used on closed issues, to indicate to the reporter why we closed it.
