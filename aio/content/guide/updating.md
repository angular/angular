# Updating to the latest version of Angular

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

{@a planning}
## Update planning



The [Angular release schedule](https://github.com/angular/angular/blob/master/docs/RELEASE_SCHEDULE.md "Angular release schedule") contains a record of past Angular releases and the future release schedule.

{@a announce}
## Getting notified about new releases

To get notified when new releases are available, follow [@angular](https://twitter.com/angular "@angular on Twitter") on Twitter or  subscribe to the [Angular blog](https://blog.angular.io "Angular blog"). 

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

The most recent stable released version of Angular appears in the [Angular documentation](https://angular.io/docs "Angular documentation") at the bottom of the left side navigation. For example, `stable (v5.2.9)`.

You can also find the move current version of Angular by using the CLI command `ng update`. By default, the CLI command `ng update` (without additional arguments) lists the updates that are available to you.  


{@a updating}
## Updating your app

To update your app, use the [CLI command `ng update`](https://github.com/angular/angular-cli/wiki/update "Angular CLI update documentation"). Without additional arguments, `ng update` lists the updates that are available to you and provides you with recommended steps to update your application to the most current version. For simple updates, `ng update` is all you need. 

If you are updating to a new major version or want to make sure you understand any optional update steps, see the interactive [Angular Update Guide](https://update.angular.io "Angular Update Guide"). 

The Angular Update Guide provides customized update instructions, based on the current and target versions that you specify. It includes basic and advanced update paths, to match the complexity of your applications. It includes troubleshooting information and any recommended manual changes to help you get the most out of the new release. 


{@a resources}
## Resources

* Release announcements: [Angular blog announcements about recent releases](https://blog.angular.io/search?q=version "Angular blog announcements about recent releases")

* Release announcements (older): [Angular blog announcements about releases prior to August 2017](https://blog.angularjs.org/search?q=available&by-date=true "Angular blog announcements about releases prior to August 2017")

* Release information: [Angular change log](https://github.com/angular/angular/blob/master/CHANGELOG.md "Angular change log")

* Update instructions: [Angular Update Guide](https://angular-update-guide.firebaseapp.com/ "Angular Update Guide")

* Update command reference: [Angular CLI update documentation](https://github.com/angular/angular-cli/wiki/update "Angular CLI update documentation")

* Versioning and deprecation practices by the Angular team: [Angular announcement "Versioning and Releasing Angular" (September 2016)](https://blog.angularjs.org/2016/10/versioning-and-releasing-angular.html "Versioning and Releasing Angular")  and [follow-on clarification (December 2016)](https://blog.angularjs.org/2016/12/ok-let-me-explain-its-going-to-be.html "Ok... let me explain: it's going to be Angular 4.0, or just Angular")

* Previous and upcoming release dates: [Angular release schedule](https://github.com/angular/angular/blob/master/docs/RELEASE_SCHEDULE.md "Angular release schedule")
