# Triage Process and Github Labels for Angular 2

This document describes how the Angular team uses labels and milestones 
to triage issues on github. The basic idea of the new process is that 
caretaker only assigns a component and type (bug, feature) label. The 
owner of the component than is in full control of how the issues should 
be triaged further.

Once this process is implemented and in use, we will revisit it to see 
if further labeling is needed.

## Components

A caretaker should be able to determine which component the issue 
belongs to. The components have a clear piece of source code associated
with it.

* `comp: animations`: `@matsko`
* `comp: benchpress`: `@tbosch`
* `comp: build/ci`: `@IgorMinar` -- All build and CI scripts 
* `comp: common`: `@mhevery`  -- This includes core components / pipes.
* `comp: core/compiler`: `@tbosch` -- Because core and compiler are very 
  intertwined, we will be treating them as one.
* `comp: forms`: `@kara`
* `comp: http`: `@jeffbcross`
* `comp: i18n`: `@vicb`
* `comp: metadata-extractor`: `@chuckjaz`
* `comp: router`: `@vsavkin`
* `comp: testing`: `@juliemr`
* `comp: upgrade`: `@mhevery`
* `comp: web-worker`: `@vicb`
* `comp: zone`: `@mhevery`

There are few components which are cross-cutting. They don't have
a clear location in the source tree. We will treat them as a component
even thought no specific source tree is associated with them.

* `comp: documentation`: `@naomiblack`
* `comp: packaging`: `@mhevery`
* `comp: performance`: `@tbosch`
* `comp: security`: `@IgorMinar`


## Type
What kind of problem is this?

* `type: RFC / discussion / question`
* `type: bug`
* `type: chore`
* `type: feature`
* `type: performance`
* `type: refactor`

## Caretaker Triage Process

It is the caretaker's responsibility to assign `comp:  *` and `type: *`
to each new issue as they come in. The reason why we limit the 
responsibility of the caretaker to these two labels is that it is 
unlikely that without domain knowledge the caretaker could add any 
additional labels of value.


## Component's owner Triage Process

At this point we are leaving each component owner to determine their own
process for their component.

It will be up to the component owner to determine the order in which the
issues within the component will be resolved.

### Assigning Issues to Milestones

Any issue that is being worked on must have:

* An `assignee`: The person doing the work.
* A `Milestone`: When we expect to complete this work.

We aim to only have at most three milestones open at a time:

* Closing Milestone: A milestone with a very small number of issues, about to release. 
* Current Milestone: Work that we plan to complete within one week.
* Next Milestone: Work that is > 1 week but current for the team.

The [backlog](https://github.com/angular/angular/issues?q=is%3Aopen+is%3Aissue+no%3Amilestone) 
consists of all issues that have been triaged but do not have an assignee or milestone.  

## Triaged vs Untrained PRs

PRs should also be label with a `comp: *` so that it is clear which 
primary area the PR effects.

Because of the cumulative pain associated with rebasing PRs, we triage PRs daily, and 
closing or reviewing PRs is a top priority ahead of other ongoing work. 

Every triaged PR must have a `pr_action` label assigned to it and an assignee:
 
* `pr_action: review` -- work is complete and comment is needed from the assignee.
* `pr_action: cleanup` -- more work is needed from the current assignee. 
* `pr_action: discuss` -- discussion is needed, to be led by the current assignee.
* `pr_action: merge` -- the PR should be merged. Add this to a PR when you would like to 
  trigger automatic merging following a successful build. This is described in [COMMITTER.md](COMMITTER.md).

In addition, PRs can have the following states:

* `pr_state: LGTM` -- PR may have outstanding changes but does not require further review.
* `pr_state: WIP` -- PR is experimental or rapidly changing. Not ready for review or triage.
* `pr_state: blocked` -- PR is blocked on an issue or other PR. Not ready for review or triage.

Note that an LGTM state does not mean a PR is ready to merge: for example, a reviewer might set the
LGTM state but request a minor tweak that doesn't need further review, e.g., a rebase or small 
uncontroversial change.

PRs do not need to be assigned to milestones, unless a milestone release should be held for that 
PR to land.


## Special Labels

### action:design
More active discussion is needed before the issue can be worked on further. Typically used for 
`type: feature` or `type: RFC/discussion/question`

[See all issues that need discussion](https://github.com/angular/angular/labels/action:%20Design)

### cla
Managed by googlebot. Indicates whether a PR has a CLA on file for its author(s). Only issues with 
`cla:yes` should be merged into master.

### WORKS_AS_INTENDED

Only used on closed issues, to indicate to the reporter why we closed it.
