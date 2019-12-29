# Frequently Asked Questions

## Do Angular CDK and Angular Material support Shadow DOM?

While we don't _officially_ support Shadow DOM, we make a "best effort" to keep the components
working in applications that do use Shadow DOM. This may change in the future based on the evolving
browser landscape.

## What do the project labels mean?

Some labels are hopefully obvious, such as "feature" and "a11y". Other issues should all have
descriptions on GitHub that outline how they're used. See our [labels page][labels] for the full
descriptions.

## Are there any updates on issue _X_?

Any issue updates will appear on the issue. Due to the large volume of issues and feature requests
received by the team, we aren't able to regularly comment on all open issues and PRs.

## Why hasn't PR _X_ been merged?

For every pull request, we run a presubmit against Google's internal test suite. This includes tests
for all of the projects that use Angular CDK and Angular Material inside Google. As you might
imagine, this process can be slow. Once this presubmit passes, PRs can generally be merged quickly.
When tests fail, however, the team has to spend time investigating before the PR can be merged.
[Google uses a single monolithic code repository for its code, which everything at head][monorepo].
Because of this, we cannot merge any PRs that would break an existing project. If a PR has extensive
failures, it may be put on the backburner until the team can schedule time to debug the full extent
of the issue. If a PR seems ready to merge, but has been inactive, it has very likely
encountered some test failures inside Google that must be resolved first.

## Why aren't you working on _X_?

Like any software team, we have limited time and resources. On top of the work we do in this repo,
our team builds and maintains a smaller suite of Google-internal UI components and provides support
to product teams inside Google using our components. We do our best to balance our time between bug
fixes, support, and new feature work, but ultimately there will always be requests low on the
priority queue.

## Can you help debug my app?

We can generally answer quick or straightforward questions. However, our team doesn't have the
resources to provide more hands-on support. We recommend using [StackOverflow][] and [Gitter][] for
more help.

## Why doesn't this repository provide support for application layouts?

Our team is focused on UI components and has decided to be agnostic to how those components are
laid out. We suggest looking at existing layout systems in the front-end ecosystem, as well as
using native CSS Flexbox and CSS Grid. For an Angular-oriented layout library,
[`angular/flex-layout`][flex-layout] is a community-maintained project under the Angular umbrella.

## What's your relationship to [MDC Web][]?

MDC Web and Angular Material were created independently by two different teams inside Google.
The Angular team is now working with the MDC team to share more code to reduce duplication. To that
end, we are developing new, API-compatible versions of the Angular Material components backed by
MDC Web. [See @jelbourn's 2019 ng-conf talk](https://youtu.be/4EXQKP-Sihw?t=891) for more details.


[flex-layout]: https://github.com/angular/flex-layout/
[StackOverflow]: https://stackoverflow.com
[Gitter]: https://gitter.im/angular/material2
[labels]: https://github.com/angular/components/labels
[monorepo]: https://ai.google/research/pubs/pub45424/
[MDC Web]: https://github.com/material-components/material-components-web/
