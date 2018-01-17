# Angular Release Schedule

This document contains historic record of past Angular releases and future release schedule.

The purpose of this document is to assist coordination among the Angular team, Angular contributors, Angular application teams, and Angular community projects.

We'll keep this doc up to date when unplanned releases or other schedule changes occur.


## Schedule Caveats and Exceptions

The dates listed here are approximate – last minute issues, team or community events, etc. can cause us to release a few days sooner or later.

This page contains only planned and past unplanned releases.
Due to serious regressions or other important reasons we reserve the right to release an unplanned patch or minor release.
In such case, we'll update this document accordingly.

The dates are just a guidance and might be adjusted slightly if necessary.

## Tentative Schedule Until April 2018

<!--
The table below is formatted so that it's easy to read and edit in both markdown and rendered html form.

In order to deal with undesirable line breaks, two special characters are occasionally used:

- non-breaking hyphen: "‑" http://www.fileformat.info/info/unicode/char/2011/index.htm
- non-breaking space: " " http://www.fileformat.info/info/unicode/char/00a0/index.htm

If you see undesirable wrapping issues in the rendered form, please copy&paste the quoted characters and use them in the table below where needed.
-->

Week Of       | Stable Release<br>(@latest npm tag) | Beta/RC Release<br>(@next npm tag) | Note
------------- | ----------------------------------- | ---------------------------------- | ---------------------
2018-01-10	  | 5.2.0                               | -                                  |
2018-01-17	  | 5.2.1                               | 6.0.0‑beta.0                       |
2018-01-24	  | 5.2.2                               | 6.0.0‑beta.1                       |
2018-01-31	  | 5.2.3                               | 6.0.0‑beta.2                       |
2018-02-07	  | 5.2.4                               | 6.0.0‑beta.3                       |
2018-02-14	  | 5.2.5                               | 6.0.0‑beta.4                       |
2018-02-21	  | 5.2.6                               | 6.0.0‑beta.5                       |
2018-02-28	  | 5.2.7                               | 6.0.0‑beta.6                       |
2018-03-07	  | 5.2.8                               | 6.0.0‑rc.0                         |
2018-03-14	  | 5.2.9                               | 6.0.0‑rc.1                         |
2018-03-21	  | 5.2.10                              | 6.0.0‑rc.2                         |
2018-03-28	  | 6.0.0                               | -                                  | Major Release
2018-04-04	  | 6.0.1                               | -                                  |
2018-04-11	  | 6.0.2                               | -                                  |
2018-04-18	  | -                                   | -                                  | [ng-conf](https://www.ng-conf.org/)

## Tentative Schedule After April 2018

 Date                   | Stable Release | Compatibility`*`
 ---------------------- | -------------- | ----------------
 September/October 2018 | 7.0.0          | ^6.0.0
 March/April 2019       | 8.0.0          | ^7.0.0

 `*` The primary goal of the backwards compatibility promise is to ensure that changes in the core framework and tooling don't break the existing ecosystem of components and applications and don't put undue upgrade/migration burden on Angular application and component authors.

## Long-Term Supported (LTS) Versions

 Version     | LTS Start Date | LTS End Date
 ----------- | -------------- | ------------
 ^4.0.0      | October 2017   | October 2018
 ^6.0.0      | October 2018   | October 2019

In the long-term support state, only the critical fixes and security patches will be merged and released.

## More Info & Resources

In [September 2016 we announced](http://angularjs.blogspot.com/2016/10/versioning-and-releasing-angular.html) that Angular is fully adopting [semantic versioning](http://semver.org/) and that we'll be releasing patch versions on a weekly basis (~50 per year), minor versions monthly for 3 months following a major version release, and every 6 months we'll release a major version that will be backwards compatible with the previous release for most developers, but might remove APIs that have been deprecated two major versions ago (6 or more months ago).

In [December 2016 we clarified this message](http://angularjs.blogspot.com/2016/12/ok-let-me-explain-its-going-to-be.html), and provided additional details about the plans to release Angular 4.0.0 in March 2017.
This document contains updates to the schedule that happened since then.
