# Material Design for Angular
[![npm version](https://badge.fury.io/js/%40angular%2Fmaterial.svg)](https://www.npmjs.com/package/%40angular%2Fmaterial)
[![Build status](https://circleci.com/gh/angular/material2.svg?style=svg)](https://circleci.com/gh/angular/material2)
[![Gitter](https://badges.gitter.im/angular/material2.svg)](https://gitter.im/angular/material2?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

This is the home for the Angular team's Material Design components built for and with Angular.

#### Quick links
[Documentation, demos, and guides][aio] |
[Google group](https://groups.google.com/forum/#!forum/angular-material2) |
[Contributing](https://github.com/angular/material2/blob/master/CONTRIBUTING.md) |
[Plunker Template](https://goo.gl/uDmqyY) |
[StackBlitz Template](https://goo.gl/wwnhMV)

### Getting started

See our [Getting Started Guide][getting-started]
if you're building your first project with Angular Material.

Check out our [directory of design documents](https://github.com/angular/material2/wiki/Design-doc-directory)
for more insight into our process.

If you'd like to contribute, you must follow our [contributing guidelines](https://github.com/angular/material2/blob/master/CONTRIBUTING.md).
You can look through the issues (which should be up-to-date on who is working on which features
and which pieces are blocked) and make a comment.
Also see our [`help wanted`](https://github.com/angular/material2/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)
label.

#### High level stuff planned for Q1 → Q2 2019 (January - June):
* Most of the Angular Material team is on loan to the framework team
  helping with [Ivy](https://blog.angular.io/a-plan-for-version-8-0-and-ivy-b3318dfc19f7).
  We've been using the Angular CDK and Angular Material tests to validate code paths as well
  as helping debug issues in switching Google applications to the new rendering pipeline.
* We're also working with the Material Design team on a strategy to collaborate more deeply.
  We'll have more to share on this once our plans are further along.
* Assorted bugfixes and minor feature improvements.
* Design for API enhancements to the tree component to improve ergonomics.


#### Available features

| Feature          | Notes                                                  | Docs         |
|------------------|--------------------------------------------------------|--------------|
| autocomplete     |                                                        |   [Docs][24] |
| badge            |                                                        |   [Docs][37] |
| bottom-sheet     |                                                        |   [Docs][38] |
| button           |                                                        |   [Docs][1]  |
| button-toggle    |                                                        |   [Docs][15] |
| cards            |                                                        |   [Docs][2]  |
| checkbox         |                                                        |   [Docs][3]  |
| chips            |                                                        |   [Docs][26] |
| data-table       |                                                        |   [Docs][28] |
| datepicker       |                                                        |   [Docs][25] |
| dialog           |                                                        |   [Docs][22] |
| divider          |                                                        |   [Docs][35] |
| drag-drop        |                                                        |   [Docs][39] |
| expansion-panel  |                                                        |   [Docs][32] |
| grid-list        |                                                        |   [Docs][9]  |
| icon             |                                                        |   [Docs][10] |
| input            |                                                        |   [Docs][5]  |
| list             |                                                        |   [Docs][8]  |
| menu             |                                                        |   [Docs][17] |
| paginator        |                                                        |   [Docs][29] |
| progress-bar     |                                                        |   [Docs][12] |
| progress-spinner |                                                        |   [Docs][11] |
| radio            |                                                        |   [Docs][4]  |
| ripples          |                                                        |   [Docs][19] |
| select           |                                                        |   [Docs][23] |
| sidenav          |                                                        |   [Docs][6]  |
| slide-toggle     |                                                        |   [Docs][14] |
| slider           |                                                        |   [Docs][16] |
| snackbar / toast |                                                        |   [Docs][21] |
| sort-header      |                                                        |   [Docs][30] |
| stepper          |                                                        |   [Docs][33] |
| tabs             |                                                        |   [Docs][13] |
| textarea         |                                                        |   [Docs][5]  |
| toolbar          |                                                        |   [Docs][7]  |
| tooltip          |                                                        |   [Docs][18] |
| tree             |                                                        |   [Docs][36] |
| virtual-scroll   |                                                        |   [Docs][40] |
| ---------------- | ------------------------------------------------------ | ------------ |
| theming          |                                                        |  [Guide][20] |
| typography       |                                                        |  [Guide][27] |
| layout           |                      See [angular/flex-layout][lay_rp] |  [Wiki][0]   |
| cdk              |                                                        |   [Docs][34] |


#### In progress, planned, and non-planned features

| Feature          | Status                              | Docs         | Issue          |
|------------------|-------------------------------------|--------------|----------------|
| fab speed-dial   |            Not started, not planned |           -  |   [#860][0860] |
| fab toolbar      |            Not started, not planned |           -  |              - |
| bottom-nav       |            Not started, not planned |           -  |   [#408][0408] |

 [0]: https://github.com/angular/flex-layout/wiki
 [1]: https://material.angular.io/components/button/overview
 [2]: https://material.angular.io/components/card/overview
 [3]: https://material.angular.io/components/checkbox/overview
 [4]: https://material.angular.io/components/radio/overview
 [5]: https://material.angular.io/components/input/overview
 [6]: https://material.angular.io/components/sidenav/overview
 [7]: https://material.angular.io/components/toolbar/overview
 [8]: https://material.angular.io/components/list/overview
 [9]: https://material.angular.io/components/grid-list/overview
[10]: https://material.angular.io/components/icon/overview
[11]: https://material.angular.io/components/progress-spinner/overview
[12]: https://material.angular.io/components/progress-bar/overview
[13]: https://material.angular.io/components/tabs/overview
[14]: https://material.angular.io/components/slide-toggle/overview
[15]: https://material.angular.io/components/button-toggle/overview
[16]: https://material.angular.io/components/slider/overview
[17]: https://material.angular.io/components/menu/overview
[18]: https://material.angular.io/components/tooltip/overview
[19]: https://github.com/angular/material2/blob/master/src/lib/core/ripple/ripple.md
[20]: https://material.angular.io/guide/theming
[21]: https://material.angular.io/components/snack-bar/overview
[22]: https://material.angular.io/components/dialog/overview
[23]: https://material.angular.io/components/select/overview
[24]: https://material.angular.io/components/autocomplete/overview
[25]: https://material.angular.io/components/datepicker/overview
[26]: https://material.angular.io/components/chips/overview
[27]: https://material.angular.io/guide/typography
[28]: https://material.angular.io/components/table/overview
[29]: https://material.angular.io/components/paginator/overview
[30]: https://material.angular.io/components/sort/overview
[31]: https://tina-material-tree.firebaseapp.com/simple-tree
[32]: https://material.angular.io/components/expansion/overview
[33]: https://material.angular.io/components/stepper/overview
[34]: https://material.angular.io/cdk/categories
[35]: https://material.angular.io/components/divider/overview
[36]: https://material.angular.io/components/tree/overview
[37]: https://material.angular.io/components/badge/overview
[38]: https://material.angular.io/components/bottom-sheet/overview
[39]: https://material.angular.io/cdk/drag-drop/overview
[40]: https://material.angular.io/cdk/scrolling/overview#virtual-scrolling

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
[0581]: https://github.com/angular/material2/issues/581
[4191]: https://github.com/angular/material2/pull/4191
[0995]: https://github.com/angular/material2/pull/995
[0474]: https://github.com/angular/material2/pull/474

[aio]: https://material.angular.io
[getting-started]: https://material.angular.io/guide/getting-started
[lay_rp]:  https://github.com/angular/flex-layout


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
