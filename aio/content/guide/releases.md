# Angular versioning and releases

We recognize that you need stability from the Angular framework. Stability ensures that reusable components and libraries, tutorials, tools, and learned practices don't become obsolete unexpectedly. Stability is essential for the ecosystem around Angular to thrive.

We also share with you the desire for Angular to keep evolving. We strive to ensure that the foundation on top of which you are building is continuously improving and enabling you to stay up-to-date with the rest of the web ecosystem and your user needs.

This document contains the practices that we follow to provide you with a leading-edge app development platform, balanced with stability. We strive to ensure that future changes are always introduced in a predictable way. We want everyone who depends on Angular to know when and how new features are added, and to be well-prepared when obsolete ones are removed.

See [Updating your projects](guide/updating "Updating your projects") for information about how to update your apps and libraries to the latest version of Angular.

<div class="alert is-helpful">

The practices described in this document apply to Angular 2.0 and later. If you are currently using AngularJS, see [Upgrading from AngularJS](guide/upgrade "Upgrading from Angular JS"). _AngularJS_ is the name for all v1.x versions of Angular.

</div>


{@a angular-versioning}
## Angular versioning

Angular version numbers indicate the level of changes that are introduced by the release. This use of [semantic versioning](https://semver.org/ "Semantic Versioning Specification") helps you understand the potential impact of updating to a new version. 

Angular version numbers have three parts: `major.minor.patch`. For example, version 5.2.9 indicates major version 5, minor version 2, and patch version 9. 

The version number is incremented based on the level of change included in the release. 

* Major releases contain significant new features, some but minimal developer assistance is expected during the update. When updating to a new major release, you may need to run update scripts, refactor code, run additional tests, and learn new APIs. 

* Minor releases contain new smaller features. Minor releases are fully backward-compatible; no developer assistance is expected during update, but you can optionally modify your apps and libraries to begin using new APIs, features, and capabilities that were added in the release. We update peer dependencies in minor versions by expanding the supported versions, but we do not require projects to update these dependencies. 

* Patch releases are low risk, bug fix releases. No developer assistance is expected during update.

If you are updating within the same major version, then you can skip any intermediate versions and update directly to the targeted version. For example, if you want to update from 5.0.0 to 5.2.9, then you can update directly; you do not need to update from 5.0.0 to 5.1.0 before updating to 5.2.9. 

If you are updating from one major version to another, then we recommend that you don't skip major versions. Follow the instructions to incrementally update to the next major version, testing and validating at each step. For example, if you want to update from version 4.x.x to version 6.x.x, we recommend that you update to the latest 5.x.x release first. After successfully updating to 5.x.x, you can then update to 6.x.x. 

Pre-release previews&mdash;such as Beta and Release Candidate versions&mdash;are indicated by appending a dash and a beta or rc identifier, such as version 5.2.9-rc.3.

{@a frequency}
## Release frequency

We work toward a regular schedule of releases, so that you can plan and coordinate your updates with the continuing evolution of Angular.

In general, you can expect the following release cycle:

* A major release every 6 months

* 1-3 minor releases for each major release

* A patch release almost every week

We bake quality into our releases&mdash;and let you preview what's coming next&mdash;by providing Beta releases and release candidates (RCs) for each major and minor release.

This cadence of releases gives you access to new beta features as soon as they are ready, while maintaining the stability and reliability of the platform for production users.


{@a schedule}
## Release schedule

<div class="alert is-helpful">

Disclaimer: The dates are offered as general guidance and may be adjusted by us when necessary to ensure delivery of a high-quality platform. 

</div>

The following table contains our current target release dates for the next two major versions of Angular: 

 Date                   | Stable Release | Compatibility 
 ---------------------- | -------------- | -------------
 March/April 2019       | 8.0.0          | ^7.0.0
 September/October 2019 | 9.0.0          | ^8.0.0

 Compatibility note: The primary goal of the backward compatibility promise is to ensure that changes in the core framework and tooling don't break the existing ecosystem of components and applications and don't put undue upgrade/migration burden on Angular application and component authors.


{@a lts}
{@a support}
## Support policy and schedule

All of our major releases are supported for 18 months. 

* 6 months of *active support*, during which regularly-scheduled updates and patches are released.

* 12 months of *long-term support (LTS)*, during which only critical fixes and security patches are released.

The following table provides the support status and key dates for Angular version 5.0.0 and higher. 


Version | Status | Released     | Active Ends  | LTS Ends
------- | ------ | ------------ | ------------ | ------------ 
^7.0.0  | Active | Oct 18, 2018 | Apr 18, 2019 | Apr 18, 2020
^6.0.0  | LTS    | May 3, 2018  | Nov 3, 2018  | Nov 3, 2019
^5.0.0  | LTS    | Nov 1, 2017  | May 1, 2018  | May 1, 2019

LTS for Angular version ^4.0.0 ended on September 23, 2018.


{@a deprecation}
## Deprecation practices

Sometimes &quot;breaking changes&quot;, such as the removal of support for select APIs and features, are necessary to innovate and stay current with new best practices, changing dependencies, or changes in the (web) platform itself. 

To make these transitions as easy as possible, we make two commitments to you:

* We work hard to minimize the number of breaking changes and to provide migration tools when possible. 

* We follow the deprecation policy described here, so you have time to update your apps to the latest APIs and best practices.

To help ensure that you have sufficient time and a clear path to update, this is our deprecation policy:

* We announce deprecated features in the [change log](https://github.com/angular/angular/blob/master/CHANGELOG.md "Angular change log").

* When we announce a deprecation, we also announce a recommended update path.

* We support existing use of a stable API during the deprecation period, so  your code will keep working during that period. 

* We support each deprecated API for at least two subsequent major releases, which means at least 12 months after deprecation.

* We only make peer dependency updates that require changes to your apps in a major release. In minor releases, we update peer dependencies by expanding the supported versions, but we do not require projects to update these dependencies until a future major version. 


{@a public-api}
## Public API surface

Angular is a collection of many packages, sub-projects, and tools. To prevent accidental use of private APIs&mdash;and so that you can clearly understand what is covered by the practices described here&mdash;we document what is and is not considered our public API surface. For details, see [Supported Public API Surface of Angular](https://github.com/angular/angular/blob/master/docs/PUBLIC_API.md "Supported Public API Surface of Angular").

Any changes to the public API surface will be done using the versioning, support, and depreciation policies describe above.

{@a labs}
## Angular Labs

Angular Labs is an initiative to cultivate new features and iterate on them quickly. Angular Labs provides a safe place for exploration and experimentation by the Angular team.

Angular Labs projects are not ready for production use, and no commitment is made to bring them to production. The policies and practices that are described in this document do not apply to Angular Labs projects.
