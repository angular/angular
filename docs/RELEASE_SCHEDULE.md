# Angular Release Schedule

This document contains historic record of past Angular releases and future release schedule.

The purpose of this document is to assist coordination among the Angular team, Angular contributors, Angular application teams, and Angular community projects.

We'll keep this doc up to date when unplanned releases or other schedule changes occur.


## Schedule Caveats and Exceptions

The dates listed here are approximate – last minute issues, team or community events, etc. can cause us to release a few days sooner or later.

This page contains only planned and past unplanned releases.
Due to serious regressions or other important reasons we reserve the right to release an unplanned patch or minor release.
In such case, we'll update this document accordingly.

The dates past March 2017 are just a guidance and might be adjusted slightly if necessary.


## Tentative Schedule Until March 2017

<!--
The table below is formatted so that it's easy to read and edit in both markdown and rendered html form.

In order to deal with undesirable line breaks, two special characters are occasionally used:

- non-breaking hyphen: "‑" http://www.fileformat.info/info/unicode/char/2011/index.htm
- non-breaking space: " " http://www.fileformat.info/info/unicode/char/00a0/index.htm

If you see undesirable wrapping issues in the rendered form, please copy&paste the quoted characters and use them in the table below where needed.
-->

Week Of       | Stable Release<br>(@latest npm tag) | Beta/RC Release<br>(@next npm tag) | Note
------------- | ----------------------------------- | ---------------------------------- | ---------------------
2016-09-14    | 2.0.0                               | -                                  | Major Version Release
2016-09-21    | 2.0.1                               | 2.1.0-beta.0                       |
2016‑09‑28    | -                                   | -                                  | Angular Connect
2016-10-05    | 2.0.2                               | 2.1.0-rc.0                         |
2016-10-12    | 2.1.0                               | -                                  | Minor Version Release
2016-10-19    | 2.1.1                               | 2.2.0-beta.0                       |
2016-10-26    | 2.1.2                               | 2.2.0-beta.1                       |
2016-11-02    | 2.1.3                               | 2.2.0-rc.0                         |
2016-11-09    | 2.2.0                               | -                                  | Minor Version Release
2016-11-16    | 2.2.1                               | 2.3.0-beta.0                       |
2016-11-23    | 2.2.2                               | 2.3.0-beta.1                       |
*2016-11-23*  | *2.2.3*                             | -                                  | *Unplanned Patch Release to fix regressions*
2016-11-30    | 2.2.4                               | 2.3.0-rc.0                         |
2016-12-07    | 2.3.0                               | -                                  | Minor Version Release
2016-12-14    | 2.3.1                               | 4.0.0-beta.0                       |
*2016-12-21*  | *2.4.0*                             | -                                  | *Unplanned Minor Release due to release of RxJS 5.0.0*
2016-12-21    | 2.4.1                               | 4.0.0-beta.1                       |
2016-12-28    | -                                   | -                                  | Holiday Break
2017-01-04    | 2.4.2                               | 4.0.0-beta.2                       |
2017-01-11    | 2.4.3                               | 4.0.0-beta.3                       |
2017-01-18    | 2.4.4                               | 4.0.0-beta.4                       |
2017-01-25    | 2.4.5                               | 4.0.0-beta.5                       |
2017-02-01    | 2.4.6                               | 4.0.0-beta.6                       |
2017-02-08    | 2.4.7                               | 4.0.0-beta.7                       |
2017-02-15    | 2.4.8                               | 4.0.0-beta.8                       |
*2017-02-22*  |                                     | *4.0.0-rc.0*                       | *Unplanned release: bad rebase*
2017-02-22    |                                     | 4.0.0-rc.1                         | No stable release - we were too busy with the RC
2017-03-01    | 2.4.9                               | 4.0.0-rc.2                         |
2017-03-08    | 2.4.10                              | 4.0.0-rc.3                         |
2017-03-15    | 2.4.11                              | 4.0.0-rc.4                         |
*2017-03-17*  |                                     | *4.0.0-rc.5*                       | *Unplanned release to fix compiler-cli dependency version*
2017-03-22    | 4.0.0 + 2.4.12                      | -                                  | Major Version Release


## Tentative Schedule After March 2017

 Date                   | Stable Release | Compatibility`*`
 ---------------------- | -------------- | ----------------
 September/October 2017 | 5.0.0          | ^4.0.0
 March 2018             | 6.0.0          | ^5.0.0
 September/October 2018 | 7.0.0          | ^6.0.0

 `*` The goal of the backwards compatibility promise, is to ensure that changes in the core framework and tooling don't break the existing ecosystem of components and applications and don't put undue upgrade/migration burden on Angular application and component authors.


## More Info & Resources

In [September 2016 we announced](http://angularjs.blogspot.com/2016/10/versioning-and-releasing-angular.html) that Angular is fully adopting [semantic versioning](http://semver.org/) and that we'll be releasing patch versions on a weekly basis (~50 per year), minor versions monthly for 3 months following a major version release, and every 6 months we'll release a major version that will be backwards compatible with the previous release for most developers, but might remove APIs that have been deprecated two major versions ago (6 or more months ago).

In [December 2016 we clarified this message](http://angularjs.blogspot.com/2016/12/ok-let-me-explain-its-going-to-be.html), and provided additional details about the plans to release Angular 4.0.0 in March 2017.
This document contains updates to the schedule that happened since then.
