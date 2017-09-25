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

## Tentative Schedule Until September 2017

<!--
The table below is formatted so that it's easy to read and edit in both markdown and rendered html form.

In order to deal with undesirable line breaks, two special characters are occasionally used:

- non-breaking hyphen: "‑" http://www.fileformat.info/info/unicode/char/2011/index.htm
- non-breaking space: " " http://www.fileformat.info/info/unicode/char/00a0/index.htm

If you see undesirable wrapping issues in the rendered form, please copy&paste the quoted characters and use them in the table below where needed.
-->

Week Of       | Stable Release<br>(@latest npm tag) | Beta/RC Release<br>(@next npm tag) | Note
------------- | ----------------------------------- | ---------------------------------- | ---------------------
2017‑05‑01	  | 4.1.1                               | 4.2.0‑beta.0                       |
2017‑05‑08	  | 4.1.2                               | 4.2.0‑beta.1                       |
2017‑05‑15	  | 4.1.3                               | 4.2.0‑rc.0                         |
2017‑05‑26	  | ‑                                   | 4.2.0‑rc.1                         |
2017‑06‑01    | ‑                                   | 4.2.0‑rc.2                         |
2017‑06‑05	  | 4.2.0                               | ‑                                  | Minor Version Release
*2017‑06‑09*  | 4.2.1                               | ‑                                  | *Regression Patch Release*
2017-06-12    | 4.2.2                               | ‑                                  |
*2017-06-16*  | 4.2.3                               | ‑                                  | *Regression Patch Release*
2017‑06‑19	  | 4.2.4                               | 4.3.0‑beta.0                       |
2017‑06‑26	  | 4.2.5                               | 4.3.0‑beta.1                       |
2017‑07‑03	  | 4.2.6                               | 4.3.0‑rc.0                         |
2017‑07‑10	  | 4.3.0                               | -                                  | Minor Version Release
2017‑07‑17	  | 4.3.1                               | 5.0.0‑beta.0                       |
2017‑07‑24	  | 4.3.2                               | 5.0.0‑beta.1                       |
2017‑07‑31	  | 4.3.3                               | 5.0.0‑beta.2                       |
2017‑08‑07	  | 4.3.4                               | 5.0.0‑beta.3                       |
2017‑08‑14    | 4.3.5                               | 5.0.0‑beta.4                       |
2017‑08‑21	  | 4.3.6                               | -                                  |
2017‑08‑28	  | -                                   | 5.0.0‑beta.5                       |
2017‑09‑04	  | -                                   | 5.0.0‑beta.6                       |
2017‑09‑11	  | 4.4.0                               | 5.0.0-beta.7                       |
2017‑09‑18	  | 4.4.1                               | 5.0.0‑beta.8                       |
2017‑09‑25	  | 4.4.2                               | 5.0.0‑rc.0                         |
2017‑10‑02	  | 4.4.3                               | 5.0.0‑rc.1                         |
2017‑10‑09	  | 4.4.4                               | 5.0.0‑rc.2                         |
2017‑10‑16    | 4.4.5                               | 5.0.0‑rc.3                         |
2017‑10‑23    | 5.0.0                               | ‑                                  | Major Version Release

## Tentative Schedule After September 2017

 Date                   | Stable Release | Compatibility`*`
 ---------------------- | -------------- | ----------------
 March/April 2018       | 6.0.0          | ^5.0.0
 September/October 2018 | 7.0.0          | ^6.0.0

 `*` The primary goal of the backwards compatibility promise is to ensure that changes in the core framework and tooling don't break the existing ecosystem of components and applications and don't put undue upgrade/migration burden on Angular application and component authors.

## Long-Term Supported (LTS) Versions

 Version     | LTS Start Date | LTS End Date
 ----------- | -------------- | ------------
 ^4.0.0      | October 2017   | October 2018

In the long-term support state, only the critical fixes and security patches will be merged and released.

## More Info & Resources

In [September 2016 we announced](http://angularjs.blogspot.com/2016/10/versioning-and-releasing-angular.html) that Angular is fully adopting [semantic versioning](http://semver.org/) and that we'll be releasing patch versions on a weekly basis (~50 per year), minor versions monthly for 3 months following a major version release, and every 6 months we'll release a major version that will be backwards compatible with the previous release for most developers, but might remove APIs that have been deprecated two major versions ago (6 or more months ago).

In [December 2016 we clarified this message](http://angularjs.blogspot.com/2016/12/ok-let-me-explain-its-going-to-be.html), and provided additional details about the plans to release Angular 4.0.0 in March 2017.
This document contains updates to the schedule that happened since then.
