<a name="2.0.0-alpha.2"></a>
# [2.0.0-alpha.2 diamond-haircut](https://github.com/angular/material2/compare/2.0.0-alpha.1...v2.0.0-alpha.2) (2016-04-06)


### Bug Fixes

* **button:** apply color classes correctly. ([62265cc](https://github.com/angular/material2/commit/62265cc)), closes [#75](https://github.com/angular/material2/issues/75) [#89](https://github.com/angular/material2/issues/89) [#195](https://github.com/angular/material2/issues/195)
* **checkbox:** Cancel spacebar keydown events when component focused ([6db3511](https://github.com/angular/material2/commit/6db3511)), closes [#162](https://github.com/angular/material2/issues/162) [#181](https://github.com/angular/material2/issues/181)
* **checkbox:** Ensure consistent mixedmark rendering across browsers ([666cdba](https://github.com/angular/material2/commit/666cdba)), closes [#174](https://github.com/angular/material2/issues/174) [#190](https://github.com/angular/material2/issues/190)
* **checkbox:** Handle transition when unset checkbox is interacted with ([dde9359](https://github.com/angular/material2/commit/dde9359)), closes [#183](https://github.com/angular/material2/issues/183) [#227](https://github.com/angular/material2/issues/227)
* **checkbox:** Reduce $md-checkbox-transition-duration to 90ms ([87e3a32](https://github.com/angular/material2/commit/87e3a32)), closes [#226](https://github.com/angular/material2/issues/226) [#230](https://github.com/angular/material2/issues/230)
* **checkbox:** Remove GPU layer promotion for mark elements ([82a22a7](https://github.com/angular/material2/commit/82a22a7))
* **sidenav:** Remove deprecated @View ([a61e2e9](https://github.com/angular/material2/commit/a61e2e9)), closes [#213](https://github.com/angular/material2/issues/213)
* **radio:** export the dispatcher in radio.ts ([64cc406](https://github.com/angular/material2/commit/64cc406))

### Features

* **input:** add new input component ([74d9bc0](https://github.com/angular/material2/commit/74d9bc0))
* **input:** README.md improvements and autofill support. ([b711c2b](https://github.com/angular/material2/commit/b711c2b))
* **list:** add list component ([fb71eb1](https://github.com/angular/material2/commit/fb71eb1))
* **list:** add dividers to lists ([915dd9b](https://github.com/angular/material2/commit/915dd9b))
* **list:** support subheaders in lists ([0a9c169](https://github.com/angular/material2/commit/0a9c169))
* **elevation:** Add elevation core styles ([3e34f7a](https://github.com/angular/material2/commit/3e34f7a)), closes [#222](https://github.com/angular/material2/issues/222)
* **button:** add md-icon-button styling. ([208cd65](https://github.com/angular/material2/commit/208cd65)), closes [#188](https://github.com/angular/material2/issues/188) [#206](https://github.com/angular/material2/issues/206)
* **overlay:** add basic core of overlay ([f0e1273](https://github.com/angular/material2/commit/f0e1273))
* **overlay:** add global position strategy ([c8f87a4](https://github.com/angular/material2/commit/c8f87a4))
* **overlay:** add overlay container & styles ([74e3edf](https://github.com/angular/material2/commit/74e3edf))
* **portal:** add DomPortalHost ([358d923](https://github.com/angular/material2/commit/358d923))
* **radio:** support ngModel on md-radio-group ([6aff4cc](https://github.com/angular/material2/commit/6aff4cc)), closes [#209](https://github.com/angular/material2/issues/209)
* **a11y:** add aria live announcer ([e99da66](https://github.com/angular/material2/commit/e99da66)), closes [#106](https://github.com/angular/material2/issues/106)



<a name="2.0.0-alpha.1"></a>
# [2.0.0-alpha.1 nylon-hyperdrive](https://github.com/angular/material2/compare/2.0.0-alpha.0...v2.0.0-alpha.1) (2016-03-16)


### Features

* **radio:** Radio button component. ([d76465b](https://github.com/angular/material2/commit/d76465b)), closes [#125](https://github.com/angular/material2/issues/125)



<a name="2.0.0-alpha.0"></a>
# 2.0.0-alpha.0 titanium-octopus (2016-03-15)

### First release of angular2-material!

This inaugural release includes 6 components:
* [md-button](src/components/button) (buttons and anchors)
* [md-card](src/components/card)
* [md-toolbar](src/components/toolbar)
* [md-sidenav](src/components/sidenav)
* [md-checkbox](src/components/checkbox) 
* [md-progress-circle and md-spinner](src/components/progress-circle)

As the alpha process continues, these components will continue to evolve. There *will* be
breaking changes between alpha releases; the alpha releases are here for people that want an
early look or who like to live on the edge and are very tolerant of breaking API and behavior 
changes.
