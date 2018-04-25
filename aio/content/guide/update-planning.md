# Planning for Angular updates: Our commitment to you

Just like Web and the entire web ecosystem, Angular is continuously improving. Angular balances continuous improvement with a strong focus on stability and making updates easy. Keeping your Angular app up-to-date enables you to take advantage of leading-edge new features, as well as optimizations and bug fixes. 

This document contains general information and resources to help you keep your Angular apps and libraries up-to-date. 


<div class="l-sub-section">

If you are currently using AngularJS, see [Upgrading from AngularJS](guide/upgrade "Upgrading from Angular JS"). _AngularJS_ is the name for all v1.x versions of Angular.

</div>


{@a angular-versioning-releases}
## Angular versioning and releases

Angular version numbers indicate the level of changes that are introduced by the release. This use of [semantic versioning](https://semver.org/ "Semantic Versioning Specification") helps you understand the potential impact of updating to a new version. 

Angular version numbers have three parts: `major.minor.patch`. For example, version 5.2.9 indicates major version 5, minor version 2, and patch version 9. 

The version number is incremented based on the level of change included in the release. 

* Major releases contain significant new features, some but minimal developer assistance expected during the update. When updating to a new major release you may need to run update scripts, refactor code, run additional tests, learn new APIs. 

* Minor releases contain new smaller features. Minor releases are fully backward-compatible; no developer assistance during update is expected. 


* Patch releases are low risk, bug fix releases. No developer assistance is expected during update. 


If you are updating within the same major version, then you can skip any intermediate versions and update directly to the targeted version. For example, if you want to update from 5.0.0 to 5.2.9, then you can update directly; you do not need to update from 5.0.0 to 5.1.0 before updating to 5.2.9. 

If you are updating from one major version to another, then we recommend that you don't skip major versions. For example, if you want to update from version 4.x.x to version 6.x.x, we recommend that you update to the latest 5.x.x release first. Follow the instructions to incrementally update to the next major version, testing and validating at each step. After successfully updating to 5.x.x, you can then update to 6.x.x. 

{@a schedule}
## Release schedule



The [Angular release schedule](https://github.com/angular/angular/blob/master/docs/RELEASE_SCHEDULE.md "Angular release schedule") contains a record of past Angular releases and the future release schedule.


{@a resources}
## Update resources

See [Keeping Angular up-to-date](guide/updating "Keeping Angular up-to-date") for information about how to keep current and update Angular:

* Getting notified when new releases become available

* Learning about what's new and changed

* Updating your environment and apps


