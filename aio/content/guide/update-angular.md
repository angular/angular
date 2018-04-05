# Updating to the latest version of Angular

Angular is continually improving. Keeping your Angular app up-to-date enables you to take advantage of the most recent bug fixes, changes, and new features. 

This document contains general information and resources to help you keep your Angular apps and libraries up-to-date. 


<div class="l-sub-section">

If you are currently using AngularJS, see [Upgrading from AngularJS](guide/upgrade "Upgrading from Angular JS"). _AngularJS_ is the name for all v1.x versions of Angular.

</div>


{@a angular-versioning-releases}
## Angular versioning and releases

Angular version numbers indicate the level of changes that are introduced by the release. This use of [semantic versioning](https://semver.org/ "Semantic Versioning 2.0.0") helps you understand the potential impact of updating to a new version. 

Angular version numbers have three parts: `major.minor.patch`. For example, version 5.2.9 indicates major version 5, minor version 2, and patch version 9. 

The version number is incremented based on the level of change included in the release. 

* Major releases contain significant changes to Angular. A major release may contain breaking changes. A breaking change happens whenever you as a developer and consumer of a library may need to adjust your code after a version update. A major release will be backwards compatible with the previous major release for most developers, but might remove APIs that have been deprecated two major versions ago. 

* Minor releases contain new features, changes, and bug fixes that are  backward-compatible. 

* Patch releases contain bug fixes. They do not change the functionality. They are backward-compatible and non-breaking. 

Angular supports updating within a major version, such as from 5.1.0 to 5.2.9. Angular also supports updating from one major version to the next, such as from any 4.x version to the most current 5.x version. If you are updating from a version prior to the previous major version (such as from Angular 2.x to 5.x), we recommend updating incrementally. 

The [Angular release schedule](https://github.com/angular/angular/blob/master/docs/RELEASE_SCHEDULE.md "Angular release schedule") contains a record of past Angular releases and the future release schedule.

{@a announce}
## Getting notified about new releases

The best way get notified about new releases is to subscribe to the [Angular blog](https://blog.angular.io "Angular blog"). 

{@a learn}
## Learning about new releases

What's new? What's changed? We share the most important things you need to know in our release announcements:

* [Angular blog announcements about recent releases](https://blog.angular.io/search?q=version "Angular blog announcements about recent releases")

* [Angular blog announcements about releases prior to August 2017](https://blog.angularjs.org/search?q=available&by-date=true "Angular blog announcements about releases prior to August 2017")

If you want to review a complete list of changes, organized by version, see the [Angular change log](https://github.com/angular/angular/blob/master/CHANGELOG.md "Angular change log").


{@a checking-version-app}
## Checking your version of Angular

To check your app's version of Angular: From within your project directory, use the `ng --version` command or look in the `package.json` file. 
 

{@a checking-version-angular}
## Finding the current version of Angular

<!-- 
The most recent version and its dependencies are listed in [`package.json`](https://github.com/angular/angular/blob/master/package.json "package.json"). 
-->

The most recent stable released version of Angular appears in the [Angular documentation](https://angular.io/docs "Angular documentation") at the bottom of the left side navigation. For example, `stable (v5.2.9)`.

By default, the CLI command `ng update` updates your project to the most recent version of Angular. You don't need to specify a version.


{@a updating}
## Updating your app

To update your app or library, follow the instructions in the interactive [Angular Update Guide](https://angular-update-guide.firebaseapp.com/ "Angular Update Guide"). The Angular Update Guide provides customized update instructions, based on the current and target versions that you specify.


{@a resources}
## Resources

* Release announcements: [Angular blog announcements about recent releases](https://blog.angular.io/search?q=version "Angular blog announcements about recent releases")

* Release announcements (older): [Angular blog announcements about releases prior to August 2017](https://blog.angularjs.org/search?q=available&by-date=true "Angular blog announcements about releases prior to August 2017")

* Release information: [Angular change log](https://github.com/angular/angular/blob/master/CHANGELOG.md "Angular change log")

* Update instructions: [Angular Update Guide](https://angular-update-guide.firebaseapp.com/ "Angular Update Guide")

* Update command reference: [Angular CLI update documentation](https://github.com/angular/angular-cli/wiki/update "Angular CLI update documentation")

* Versioning and deprecation practices by the Angular team: [Angular announcement "Versioning and Releasing Angular" (September 2016)](https://blog.angularjs.org/2016/10/versioning-and-releasing-angular.html "Versioning and Releasing Angular")  and [follow-on clarification (December 2016)](https://blog.angularjs.org/2016/12/ok-let-me-explain-its-going-to-be.html "Ok... let me explain: it's going to be Angular 4.0, or just Angular")

* Previous and upcoming release dates: [Angular release schedule](https://github.com/angular/angular/blob/master/docs/RELEASE_SCHEDULE.md "Angular release schedule")
