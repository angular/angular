# Triage Process and GitHub Labels for Angular

This document describes how the Angular team uses labels and milestones to triage issues on github.
The basic idea of the process is that caretaker only assigns a component (`comp: *`) label.
The owner of the component is then responsible for the secondary / component-level triage.


## Label Types

### Components

The caretaker should be able to determine which component the issue belongs to.
The components have a clear piece of source code associated with it within the `/packages/` folder of this repo.

* `comp: docs-infra` - the angular.io application
* `comp: animations`
* `comp: bazel` - @angular/bazel rules
* `comp: benchpress`
* `comp: common` - this includes core components / pipes
* `comp: common/http` - this includes core components / pipes
* `comp: core & compiler` - because core, compiler, compiler-cli and
  browser-platforms are very intertwined, we will be treating them as one
* `comp: ivy` - a subset of core representing the new Ivy renderer.
* `comp: elements`
* `comp: forms`
* `comp: http`
* `comp: i18n`
* `comp: language-service`
* `comp: metadata-extractor`
* `comp: router`
* `comp: server`
* `comp: service-worker`
* `comp: testing`
* `comp: upgrade`
* `comp: web-worker`
* `comp: zones`

There are few components which are cross-cutting.
They don't have a clear location in the source tree.
We will treat them as a component even thought no specific source tree is associated with them.

* `comp: build & ci` - build and CI infrastructure for the angular/angular repo
* `comp: docs` - documentation, including API docs, guides, tutorial
* `comp: packaging` - packaging format of @angular/* npm packages
* `comp: performance`
* `comp: security`

Sometimes, especially in the case of cross-cutting issues or PRs, these PRs or issues belong to multiple components.
In these cases, all applicable component labels should be used to triage the issue or PR.


### Type

What kind of problem is this?

* `type: RFC / discussion / question`
* `type: bug`
* `type: docs`
* `type: feature`
* `type: performance`
* `type: refactor`


## Caretaker Triage Process (Primary Triage)

It is the caretaker's responsibility to assign `comp:  *` to each new issue as they come in.
Issues that haven't been triaged can be found by selecting the issues with no milestone.

If it's obvious that the issue or PR is related to a release regression, the caretaker is also responsible for assigning the `severity(5): regression` label to make the issue or PR highly visible.

The primary triage should be done on a daily basis so that the issues become available for secondary triage without much of delay.

The reason why we limit the responsibility of the caretaker to this one label is that it is likely that without domain knowledge the caretaker could mislabel issues or lack knowledge of duplicate issues.

Once the primary triage is done, the ng-bot automatically adds the milestone `needsTriage`.


## Component's owner Triage Process

The component owner is responsible for assigning one of the labels from each of these categories to the issues that have the milestone `needsTriage`:

- `type: *`
- `frequency: *`
- `severity: *`

We've adopted the issue categorization based on [user pain](http://www.lostgarden.com/2008/05/improving-bug-triage-with-user-pain.html) used by AngularJS. In this system every issue is assigned frequency and severity based on which the total user pain score is calculated.

The issues with type `type: feature`, `type: refactor` and `type: RFC / Discussion / question` do not require a frequency and severity.

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

This score can then be used to estimate the impact of the issue which helps with prioritization.

Once the component's owner triage is done, the ng-bot automatically changes the milestone from `needsTriage` to `Backlog`.


## Triaging PRs

Triaging PRs is the same as triaging issues, except that the labels `frequency: *` and `severity: *` are replaced by:
- `effort*`
- `risk: *`

PRs also have additional label categories that should be used to signal their state.

Every triaged PR must have a `PR action` label assigned to it:

* `PR action: discuss`: Discussion is needed, to be led by the author.
  * _**Who adds it:** Typically the PR author._
  * _**Who removes it:** Whoever added it._
* `PR action: review` (optional): One or more reviews are pending. The label is optional, since the review status can be derived from GitHub's Reviewers interface.
  * _**Who adds it:** Any team member. The caretaker can use it to differentiate PRs pending review from merge-ready PRs._
  * _**Who removes it:** Whoever added it or the reviewer adding the last missing review._
* `PR action: cleanup`: More work is needed from the author.
  * _**Who adds it:** The reviewer requesting changes to the PR._
  * _**Who removes it:** Either the author (after implementing the requested changes) or the reviewer (after confirming the requested changes have been implemented)._
* `PR action: merge`: The PR author is ready for the changes to be merged by the caretaker as soon as the PR is green (or merge-assistance label is applied and caretaker has deemed it acceptable manually). In other words, this label indicates to "auto submit when ready".
  * _**Who adds it:** Typically the PR author._
  * _**Who removes it:** Whoever added it._


In addition, PRs can have the following states:

* `PR state: WIP`: PR is experimental or rapidly changing. Not ready for review or triage.
  * _**Who adds it:** The PR author._
  * _**Who removes it:** Whoever added it._
* `PR state: blocked`: PR is blocked on an issue or other PR. Not ready for merge.
  * _**Who adds it:** Any team member._
  * _**Who removes it:** Any team member._

When a PR is ready for review, a review should be requested using the Reviewers interface in Github.


## PR Target

In our git workflow, we merge changes either to the `master` branch, the active patch branch (e.g. `5.0.x`), or to both.

The decision about the target must be done by the PR author and/or reviewer.
This decision is then honored when the PR is being merged by the caretaker.

To communicate the target we use the following labels:

* `PR target: master & patch`: the PR should me merged into the master branch and cherry-picked into the most recent patch branch. All PRs with fixes, docs and refactorings should use this target.
* `PR target: master-only`: the PR should be merged only into the `master` branch. All PRs with new features, API changes or high-risk changes should use this target.
* `PR target: patch-only`: the PR should be merged only into the most recent patch branch (e.g. 5.0.x). This target is useful if a `master & patch` PR can't be cleanly cherry-picked into the stable branch and a new PR is needed.
* `PR target: LTS-only`: the PR should be merged only into the active LTS branch(es). Only security and critical fixes are allowed in these branches. Always send a new PR targeting just the LTS branch and request review approval from @IgorMinar.
* `PR target: TBD`: the target is yet to be determined.

If a PR is missing the `PR target: *` label, or if the label is set to "TBD" when the PR is sent to the caretaker, the caretaker should reject the PR and request the appropriate target label to be applied before the PR is merged.


## PR Approvals

Before a PR can be merged it must be approved by the appropriate reviewer(s).

To ensure that the right people review each change, we configured [GitHub CODEOWNERS](https://help.github.com/articles/about-codeowners/) (via `.github/CODEOWNERS`) and require that each PR has at least one approval from the appropriate code owner.

Note that approved state does not mean a PR is ready to be merged.
For example, a reviewer might approve the PR but request a minor tweak that doesn't need further review, e.g., a rebase or small uncontroversial change.
Only the `PR action: merge` label means that the PR is ready for merging.


## Special Labels

### `cla: yes`, `cla: no`
* _**Who adds it:** @googlebot, or a Googler manually overriding the status in case the bot got it wrong._
* _**Who removes it:** @googlebot._

Managed by googlebot.
Indicates whether a PR has a CLA on file for its author(s).
Only issues with `cla:yes` should be merged into master.

### `aio: preview`
* _**Who adds it:** Any team member. (Typically the author or a reviewer.)_
* _**Who removes it:** Any team member. (Typically, whoever added it.)_

Applying this label to a PR makes the angular.io preview available regardless of the author. [More info](../aio/aio-builds-setup/docs/overview--security-model.md)

### `PR action: merge-assistance`
* _**Who adds it:** Any team member._
* _**Who removes it:** Any team member._

This label can be added to let the caretaker know that the PR needs special attention.
There should always be a comment added to the PR to explain why the caretaker's assistance is needed.
The comment should be formatted like this: `merge-assistance: <explain what kind of assistance you need, and if not obvious why>`

For example, the PR owner might not be a Googler and needs help to run g3sync; or one of the checks is failing due to external causes and the PR should still be merged.

### `PR action: rerun CI at HEAD`
* _**Who adds it:** Any team member._
* _**Who removes it:** The Angular Bot, once it triggers the CI rerun._

This label can be added to instruct the Angular Bot to rerun the CI jobs for the PR at latest HEAD of the branch it targets.
