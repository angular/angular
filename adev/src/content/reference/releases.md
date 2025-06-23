# Angular versioning and releases

We recognize that you need stability from the Angular framework.
Stability ensures that reusable components and libraries, tutorials, tools, and learned practices don't become obsolete unexpectedly.
Stability is essential for the ecosystem around Angular to thrive.

We also share with you the need for Angular to keep evolving.
We strive to ensure that the foundation on top of which you are building is continuously improving and enabling you to stay up-to-date with the rest of the web ecosystem and your user needs.

This document contains the practices that we follow to provide you with a leading-edge application development platform, balanced with stability.
We strive to ensure that future changes are always introduced in a predictable way.
We want everyone who depends on Angular to know when and how new features are added, and to be well-prepared when obsolete ones are removed.

Sometimes *breaking changes*, such as the removal of APIs or features, are necessary to innovate and stay current with evolving best practices, changing dependencies, or shifts in the web platform. These breaking changes go through a deprecation process explained in our [deprecation policy](#deprecation-policy).

To make these transitions as straightforward as possible, the Angular team makes these commitments:

* We work hard to minimize the number of breaking changes and to provide migration tools when possible
* We follow the deprecation policy described here, so you have time to update your applications to the latest APIs and best practices

HELPFUL: The practices described in this document apply to Angular 2.0 and later.
If you are currently using AngularJS, see [Upgrading from AngularJS](https://angular.io/guide/upgrade "Upgrading from Angular JS").
*AngularJS* is the name for all v1.x versions of Angular.

## Angular versioning

Angular version numbers indicate the level of changes that are introduced by the release.
This use of [semantic versioning](https://semver.org/ "Semantic Versioning Specification") helps you understand the potential impact of updating to a new version.

Angular version numbers have three parts: `major.minor.patch`.
For example, version 7.2.11 indicates major version 7, minor version 2, and patch level 11.

The version number is incremented based on the level of change included in the release.

| Level of change | Details |
|:---             |:---     |
| Major release   | Contains significant new features, some but minimal developer assistance is expected during the update. When updating to a new major release, you might need to run update scripts, refactor code, run additional tests, and learn new APIs.                                                                                                                                                                                      |
| Minor release   | Contains new smaller features. Minor releases are fully backward-compatible; no developer assistance is expected during update, but you can optionally modify your applications and libraries to begin using new APIs, features, and capabilities that were added in the release. We update peer dependencies in minor versions by expanding the supported versions, but we do not require projects to update these dependencies. |
| Patch release   | Low risk, bug fix release. No developer assistance is expected during update.                                                                                                                                                                                                                                                                                                                                                     |

HELPFUL: As of Angular version 7, the major versions of Angular core and the CLI are aligned.
This means that in order to use the CLI as you develop an Angular app, the version of `@angular/core` and the CLI need to be the same.

### Preview releases

We let you preview what's coming by providing "Next" and Release Candidates \(`rc`\) pre-releases for each major and minor release:

| Pre-release type  | Details |
|:---               |:---     |
| Next              | The release that is under active development and testing. The next release is indicated by a release tag appended with the `-next` identifier, such as  `8.1.0-next.0`.      |
| Release candidate | A release that is feature complete and in final testing. A release candidate is indicated by a release tag appended with the `-rc` identifier, such as version `8.1.0-rc.0`. |

The latest `next` or `rc` pre-release version of the documentation is available at [next.angular.dev](https://next.angular.dev).

## Release frequency

We work toward a regular schedule of releases, so that you can plan and coordinate your updates with the continuing evolution of Angular.

HELPFUL: Dates are offered as general guidance and are subject to change.

In general, expect the following release cycle:

* A major release every 6 months
* 1-3 minor releases for each major release
* A patch release and pre-release \(`next` or `rc`\) build almost every week

This cadence of releases gives eager developers access to new features as soon as they are fully developed and pass through our code review and integration testing processes, while maintaining the stability and reliability of the platform for production users that prefer to receive features after they have been validated by Google and other developers that use the pre-release builds.

## Support policy and schedule

HELPFUL: Approximate dates are offered as general guidance and are subject to change.

### Release schedule

| Version | Date               |
|:--------|:-------------------|
| v20.1   | Week of 2025-07-07 |
| v20.2   | Week of 2025-08-18 |
| v21.0   | Week of 2025-11-17 |

### Support window

All major releases are typically supported for 18 months.

| Support stage     | Support Timing | Details |
|:---               |:---            |:---     |
| Active            | 6 months       | Regularly-scheduled updates and patches are released                |
| Long-term \(LTS\) | 12 months      | Only [critical fixes and security patches](#lts-fixes) are released |

### Actively supported versions

The following table provides the status for Angular versions under support.

| Version | Status | Released   | Active ends | LTS ends   |
|:--------|:-------|:-----------|:------------|:-----------|
| ^20.0.0 | Active | 2025-05-28 | 2025-11-21  | 2026-11-21 |
| ^19.0.0 | LTS    | 2024-11-19 | 2025-05-28  | 2026-05-19 |
| ^18.0.0 | LTS    | 2024-05-22 | 2024-11-19  | 2025-11-21 |

Angular versions v2 to v17 are no longer supported.

### LTS fixes

As a general rule, a fix is considered for an LTS version if it resolves one of:

* A newly identified security vulnerability,
* A regression, since the start of LTS, caused by a 3rd party change, such as a new browser version.

## Deprecation policy

When the Angular team intends to remove an API or feature, it will be marked as *deprecated*. This occurs when an API is obsolete, superseded by another API, or otherwise discontinued. Deprecated API remain available through their deprecated phase, which lasts a minimum two major versions (approximately one year).

To help ensure that you have sufficient time and a clear path to update, this is our deprecation policy:

| Deprecation stages | Details |
|:---                |:---     |
| Announcement       | We announce deprecated APIs and features in the [change log](https://github.com/angular/angular/blob/main/CHANGELOG.md "Angular change log"). Deprecated APIs appear in the [documentation](api?status=deprecated) with ~~strikethrough~~. When we announce a deprecation, we also announce a recommended update path. Additionally, all deprecated APIs are annotated with `@deprecated` in the corresponding documentation, which enables text editors and IDEs to provide hints if your project depends on them.                            |
| Deprecation period | When an API or a feature is deprecated, it is still present in at least the next two major releases (period of at least 12 months). After that, deprecated APIs and features are candidates for removal. A deprecation can be announced in any release, but the removal of a deprecated API or feature happens only in major release. Until a deprecated API or feature is removed, it is maintained according to the LTS support policy, meaning that only critical and security issues are fixed. |
| npm dependencies   | We only make npm dependency updates that require changes to your applications in a major release. In minor releases, we update peer dependencies by expanding the supported versions, but we do not require projects to update these dependencies until a future major version. This means that during minor Angular releases, npm dependency updates within Angular applications and libraries are optional.                                               |

## Compatibility policy

Angular is a collection of many packages, subprojects, and tools.
To prevent accidental use of private APIs and so that you can clearly understand what is covered by the practices described here — we document what is and is not considered our public API surface.
For details, see [Supported Public API Surface of Angular](https://github.com/angular/angular/blob/main/contributing-docs/public-api-surface.md "Supported Public API Surface of Angular").

To guarantee backward compatibility of Angular we run a series of checks before we merge any change:

* Unit tests and integration tests
* Comparing the type definitions of the public API surface before and after the change
* Running the tests of all the applications at Google that depend on Angular

Any changes to the public API surface are made in accordance with the versioning, support, and depreciation policies previously described. In exceptional cases, such as critical security patches, fixes may introduce backwards incompatible changes. Such exceptional cases are accompanied by explicit notice on the framework's official communication channels.

## Breaking change policy and update paths

Breaking change requires you to do work because the state after it is not backward compatible with the state before it. You can find the rare exceptions from this rule in the [Compatibility policy](#compatibility-policy). Examples of breaking changes are the removal of public APIs or other changes of the type definition of Angular, changing the timing of calls, or updating to a new version of a dependency of Angular, which includes breaking changes itself.

To support you in case of breaking changes in Angular:

* We follow our [deprecation policy](#deprecation-policy) before we remove a public API
* Support update automation via the `ng update` command. It provides code transformations which we often have tested ahead of time over hundreds of thousands of projects at Google
* Step by step instructions how to update from one major version to another at the ["Angular Update Guide"](update-guide)

You can `ng update` to any version of Angular, provided that the following criteria are met:

* The version you want to update *to* is supported.
* The version you want to update *from* is within one major version of the version you want to
    upgrade to.

For example, you can update from version 11 to version 12, provided that version 12 is still supported.
If you want to update across multiple major versions, perform each update one major version at a time.
For example, to update from version 10 to version 12:

1. Update from version 10 to version 11.
1. Update from version 11 to version 12.

## Developer Preview

Occasionally we introduce new APIs under the label of "Developer Preview". These are APIs that are fully functional and polished, but that we are not ready to stabilize under our normal deprecation policy.

This may be because we want to gather feedback from real applications before stabilization, or because the associated documentation or migration tooling is not fully complete. Feedback can be provided via a [GitHub issue](https://github.com/angular/angular/issues), where developers can share their experiences, report bugs, or suggest improvements to help refine the feature.

The policies and practices that are described in this document do not apply to APIs marked as Developer Preview. Such APIs can change at any time, even in new patch versions of the framework. Teams should decide for themselves whether the benefits of using Developer Preview APIs are worth the risk of breaking changes outside of our normal use of semantic versioning.



## Experimental

These APIs might not become stable at all or have significant changes before becoming stable.

The policies and practices that are described in this document do not apply to APIs marked as experimental. Such APIs can change at any time, even in new patch versions of the framework. Teams should decide for themselves whether the benefits of using experimental APIs are worth the risk of breaking changes outside of our normal use of semantic versioning.
