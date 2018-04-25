# Planning for Angular updates: Our commitment to you

We recognize that you need stability from the Angular framework. Stability ensures that reusable components and libraries, tutorials, tools, and learned practices don’t become obsolete unexpectedly. Stability is essential for the ecosystem around Angular to thrive.

We also share with you the desire for Angular to keep evolving. Just like Web and the entire web ecosystem, Angular is continuously improving. You rely on Angular to help you create apps that delight your users. 

This document contains the practices that we follow to provide you with a leading-edge app development platform, balanced with stability. We strive to ensure that future changes are always introduced in a predictable way. We want everyone who depends on Angular to know when and how new features are added, and to be well-prepared when obsolete ones removed.

These are our commitments to you. 


<div class="l-sub-section">

The practices described in this document apply to Angular 2.0 and later. If you are currently using AngularJS, see [Upgrading from AngularJS](guide/upgrade "Upgrading from Angular JS"). _AngularJS_ is the name for all v1.x versions of Angular.

</div>


{@a angular-versioning-releases}
## Angular versioning and releases

Angular version numbers indicate the level of changes that are introduced by the release. This use of [semantic versioning](https://semver.org/ "Semantic Versioning Specification") helps you understand the potential impact of updating to a new version. 

Angular version numbers have three parts: `major.minor.patch`. For example, version 5.2.9 indicates major version 5, minor version 2, and patch version 9. 

The version number is incremented based on the level of change included in the release. 

* Major releases contain significant new features, some but minimal developer assistance is expected during the update. When updating to a new major release, you may need to run update scripts, refactor code, run additional tests, and learn new APIs. 

* Minor releases contain new smaller features. Minor releases are fully backward-compatible; no developer assistance is expected during update. 

* Patch releases are low risk, bug fix releases. No developer assistance is expected during update. 

If you are updating within the same major version, then you can skip any intermediate versions and update directly to the targeted version. For example, if you want to update from 5.0.0 to 5.2.9, then you can update directly; you do not need to update from 5.0.0 to 5.1.0 before updating to 5.2.9. 

If you are updating from one major version to another, then we recommend that you don't skip major versions. Follow the instructions to incrementally update to the next major version, testing and validating at each step. For example, if you want to update from version 4.x.x to version 6.x.x, we recommend that you update to the latest 5.x.x release first. After successfully updating to 5.x.x, you can then update to 6.x.x. 

{@a schedule}
## Release schedule

We work toward a regular schedule of releases, so that you can plan and coordinate your updates with the continuing evolution of Angular.

In general, you can expect the following release cycle:

* A major release every 6 months

* About 3 minor releases for each major release

* A patch release every week

We bake quality into our releases&mdash;and let you preview what's coming next&mdash;by providing Beta releases and release candidates (RCs) for each major and minor release.

This cadence of releases gives you access to new beta features as soon as they are ready, while maintaining the stability and reliability of the platform for production users.

The [Angular release schedule](https://github.com/angular/angular/blob/master/docs/RELEASE_SCHEDULE.md "Angular release schedule") contains a record of past Angular releases and the future release schedule.


{@ deprecation}
## Deprecation practices

Breaking changes are disruptive, but can be necessary to innovate and stay current with new best practices, changing dependencies, or changes in the (web) platform itself. 

To make these transitions more predictable, we make two commitments to you:

* We work hard to minimize the number of breaking changes in Angular, and to provide migration tools when possible. 

* We follow a published deprecation policy, so you have time to update your apps to the latest APIs and best practices.

To ensure that developers have plenty of time and a clear path to update:

* When we announce a deprecation, we also announce the recommended an update path.

* We support existing use of a stable API (i.e. your code will keep working) during the deprecation period, and you’ll always have more than 6 months (two major releases) to update.

* We only make any peer dependency updates that might require changes to your apps in a major release. For example, we only change the Typescript dependency at major releases.


{@a public-api}
## Public API surface

Angular is a collection of many packages, sub-projects, and tools. To prevent accidental use of private APIs&mdash;and so that you can clearly understand what is covered by the practices described here&mdash;we document what is and is not considered our public API surface. For details, see [Supported Public API Surface of Angular](https://github.com/angular/angular/blob/master/docs/PUBLIC_API "Supported Public API Surface of Angular").


{@a stable-experimental}
## Stable and experimental APIs

In our documemtation, we mark some of our APIs as experimental. We feel that experimental APIs are solid enough to be in production, but they require field-testing to validate that they work well for a variety of community use cases.

Experimental APIs follow the versioning practice described above, but they do not follow our deprecation policy. If you use an experimental API, you should expect changes, some of which might not have a deprecation path. We try to minimize disruptions for those of you using experimental APIs, and we will document any API changes.

As experimental APIs mature, we move them from the experimental to stable category.

None of the core use cases require the use of experimental APIs. 




{@a resources}
## Update resources

See [Keeping Angular up-to-date](guide/updating "Keeping Angular up-to-date") for information about how to keep current and update Angular:

* Getting notified when new releases become available

* Learning about what's new and changed

* Updating your environment and apps


