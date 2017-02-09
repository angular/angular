# Material Design for Angular
[![npm version](https://badge.fury.io/js/%40angular%2Fmaterial.svg)](https://www.npmjs.com/package/%40angular%2Fmaterial)
[![Build Status](https://travis-ci.org/angular/material2.svg?branch=master)](https://travis-ci.org/angular/material2)
[![Gitter](https://badges.gitter.im/angular/material2.svg)](https://gitter.im/angular/material2?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

This is the home for the Angular team's Material Design components built on top of Angular.

#### Quick links
[Google group](https://groups.google.com/forum/#!forum/angular-material2),
[Contributing](https://github.com/angular/material2/blob/master/CONTRIBUTING.md),
[Plunker Template](http://plnkr.co/edit/o077B6uEiiIgkC0S06dd?p=preview)

### Installation

The latest release of Angular Material can be installed from npm

`npm install --save @angular/material`

Playing with the latest changes from [master](https://github.com/angular/material2/tree/master) is also possible

`npm install --save https://github.com/angular/material2-builds.git`

### Getting started

See our [Getting Started Guide][getting-started]
if you're building your first project with Angular Material.

### Project status
Angular Material is currently in beta and under active development.
During beta, new features will be added regularly and APIs will evolve based on user feedback.

Check out our [directory of design documents](https://github.com/angular/material2/wiki/Design-doc-directory)
for more insight into our process.

If you'd like to contribute, you must follow our [contributing guidelines](https://github.com/angular/material2/blob/master/CONTRIBUTING.md).
You can look through the issues (which should be up-to-date on who is working on which features
and which pieces are blocked) and make a comment.
Also see our [`Good for community contribution`](https://github.com/angular/material2/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+for+community+contribution%22)
label.

High level items planned for January 2017:

* Initial version of md-autocomplete
* Prototyping for data-table
* Improvements to https://material.angular.io
* Continued expanding e2e test coverage
* More work on scroll / resize handling for overlays
* Screenshot tests
* Better development automation


#### Feature status:

| Feature          | Status                              | Docs         | Issue          |
|------------------|-------------------------------------|--------------|----------------|
| button           |                           Available | [README][1]  |              - |
| cards            |                           Available | [README][2]  |              - |
| checkbox         |                           Available | [README][3]  |              - |
| radio            |                           Available | [README][4]  |              - |
| input            |                           Available | [README][5]  |              - |
| sidenav          |                           Available | [README][6]  |              - |
| toolbar          |                           Available | [README][7]  |              - |
| list             |                           Available | [README][8]  |   [#107][0107] |
| grid-list        |                           Available | [README][9]  |              - |
| icon             |                           Available | [README][10] |              - |
| progress-spinner |                           Available | [README][11] |              - |
| progress-bar     |                           Available | [README][12] |              - |
| tabs             |                           Available | [README][13] |              - |
| slide-toggle     |                           Available | [README][14] |              - |
| button-toggle    |                           Available | [README][15] |              - |
| slider           |                           Available | [README][16] |              - |
| menu             |                           Available | [README][17] |   [#119][0119] |
| tooltip          |                           Available | [README][18] |              - |
| ripples          |                           Available | [README][19] |   [#108][0108] |
| dialog           |                           Available | [README][22] |   [#114][0114] |
| snackbar / toast |                           Available | [README][21] |   [#115][0115] |
| select           |                           Available | [README][23] |   [#118][0118] |
| textarea         |                           Available | [README][5]  |              - |
| autocomplete     |                         In-progress |           -  |   [#117][0117] |
| chips            |  Initial version, features evolving |           -  |   [#120][0120] |
| theming          |   Available, need guidance overlays | [Guide][20]  |              - |
| docs site        |   UX design and tooling in progress |           -  |              - |
| typography       |                         Not started |           -  |   [#205][0205] |
| fab speed-dial   |                         Not started |           -  |   [#860][0860] |
| fab toolbar      |                         Not started |           -  |              - |
| bottom-sheet     |                         Not started |           -  |              - |
| bottom-nav       |                         Not started |           -  |   [#408][0408] |
| virtual-repeat   |                         Not started |           -  |   [#823][0823] |
| datepicker       |                         Not started |           -  |   [#675][0675] |
| data-table       |                  Design in-progress |           -  |   [#581][0581] |
| stepper          |                         Not started |           -  |   [#508][0508] |
| layout           |   See [angular/flex-layout][lay_rp] | [Wiki][0]    |              - |

 [lay_rp]:  https://github.com/angular/flex-layout
 [0]: https://github.com/angular/flex-layout/wiki
 [1]: https://github.com/angular/material2/blob/master/src/lib/button/README.md
 [2]: https://github.com/angular/material2/blob/master/src/lib/card/README.md
 [3]: https://github.com/angular/material2/blob/master/src/lib/checkbox/README.md
 [4]: https://github.com/angular/material2/blob/master/src/lib/radio/README.md
 [5]: https://github.com/angular/material2/blob/master/src/lib/input/README.md
 [6]: https://github.com/angular/material2/blob/master/src/lib/sidenav/README.md
 [7]: https://github.com/angular/material2/blob/master/src/lib/toolbar/README.md
 [8]: https://github.com/angular/material2/blob/master/src/lib/list/README.md
 [9]: https://github.com/angular/material2/blob/master/src/lib/grid-list/README.md
[10]: https://github.com/angular/material2/blob/master/src/lib/icon/README.md
[11]: https://github.com/angular/material2/blob/master/src/lib/progress-spinner/README.md
[12]: https://github.com/angular/material2/blob/master/src/lib/progress-bar/README.md
[13]: https://github.com/angular/material2/blob/master/src/lib/tabs/README.md
[14]: https://github.com/angular/material2/blob/master/src/lib/slide-toggle/README.md
[15]: https://github.com/angular/material2/blob/master/src/lib/button-toggle/README.md
[16]: https://github.com/angular/material2/blob/master/src/lib/slider/README.md
[17]: https://github.com/angular/material2/blob/master/src/lib/menu/README.md
[18]: https://github.com/angular/material2/blob/master/src/lib/tooltip/README.md
[19]: https://github.com/angular/material2/blob/master/src/lib/core/ripple/README.md
[20]: https://github.com/angular/material2/blob/master/guides/theming.md
[21]: https://github.com/angular/material2/blob/master/src/lib/snack-bar/README.md
[22]: https://github.com/angular/material2/blob/master/src/lib/dialog/README.md
[23]: https://github.com/angular/material2/blob/master/src/lib/select/README.md

[0107]: https://github.com/angular/material2/issues/107
[0119]: https://github.com/angular/material2/issues/119
[0108]: https://github.com/angular/material2/issues/108
[0114]: https://github.com/angular/material2/issues/114
[0115]: https://github.com/angular/material2/issues/115
[0118]: https://github.com/angular/material2/issues/118
[0546]: https://github.com/angular/material2/issues/546
[0117]: https://github.com/angular/material2/issues/117
[0120]: https://github.com/angular/material2/issues/120
[0123]: https://github.com/angular/material2/issues/123
[0205]: https://github.com/angular/material2/issues/205
[0860]: https://github.com/angular/material2/issues/860
[0408]: https://github.com/angular/material2/issues/408
[0508]: https://github.com/angular/material2/issues/508
[0823]: https://github.com/angular/material2/issues/823
[0675]: https://github.com/angular/material2/issues/675
[0581]: https://github.com/angular/material2/issues/581

[getting-started]: https://github.com/angular/material2/blob/master/guides/getting-started.md
[theming]: https://github.com/angular/material2/blob/master/guides/theming.md


"Available" means that the components or feature is published and available for use, but may still
be missing some behaviors or polish.

## The goal of Angular Material
Our goal is to build a set of high-quality UI components built with Angular and TypeScript,
following the Material Design spec. These
components will serve as an example of how to write Angular code following best practices.

### What do we mean by "high-quality"?
* Internationalized and accessible so that all users can use them.
* Straightforward APIs that don't confuse developers.
* Behave as expected across a wide variety of use-cases without bugs.
* Behavior is well-tested with both unit and integration tests.
* Customizable within the bounds of the Material Design specification.
* Performance cost is minimized.
* Code is clean and well-documented to serve as an example for Angular devs.

## Browser and screen reader support
Angular Material supports the most recent two versions of all major browsers:
Chrome (including Android), Firefox, Safari (including iOS), and IE11 / Edge

We also aim for great user experience with the following screen readers:
* NVDA and JAWS with IE / FF / Chrome (on Windows).
* VoiceOver with Safari on iOS and Safari / Chrome on OSX.
* TalkBack with Chrome on Android.
