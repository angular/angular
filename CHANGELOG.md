<a name="2.0.0-alpha.5"></a>
# [2.0.0-alpha.5 granite-gouda](https://github.com/angular/material2/compare/2.0.0-alpha.4...v2.0.0-alpha.5) (2016-05-25)


### Bug Fixes

* **checkbox:** change event should now fire on first change([7a9df1e](https://github.com/angular/material2/commit/7a9df1e)), closes [#481](https://github.com/angular/material2/issues/481)
* **gestures:** ensure default gestures are not overwritten by custom gestures([523929c](https://github.com/angular/material2/commit/523929c))
* **gestures:** export gesture config as part of core ([#488](https://github.com/angular/material2/issues/488))([0d04e01](https://github.com/angular/material2/commit/0d04e01))
* **input:** adds blur and focus event support ([#449](https://github.com/angular/material2/issues/449))([f6f5af3](https://github.com/angular/material2/commit/f6f5af3)), closes [#337](https://github.com/angular/material2/issues/337)
* **input:** adds support for name property for input element ([#452](https://github.com/angular/material2/issues/452))([f53ffdb](https://github.com/angular/material2/commit/f53ffdb)), closes [#446](https://github.com/angular/material2/issues/446)
* **input:** input element should have a different id from outer element ([#450](https://github.com/angular/material2/issues/450))([be5e93a](https://github.com/angular/material2/commit/be5e93a)), closes [#320](https://github.com/angular/material2/issues/320)
* **input:** inputs now work in IE11 ([#469](https://github.com/angular/material2/issues/469))([de2a9f2](https://github.com/angular/material2/commit/de2a9f2)), closes [#336](https://github.com/angular/material2/issues/336)
* **input:** make native input background transparent ([#468](https://github.com/angular/material2/issues/468))([d2c6cb8](https://github.com/angular/material2/commit/d2c6cb8)), closes [#277](https://github.com/angular/material2/issues/277)
* **input:** undo firefox invalid style, fix maxlength in IE ([#393](https://github.com/angular/material2/issues/393))([dfe683b](https://github.com/angular/material2/commit/dfe683b)), closes [#393](https://github.com/issues/393) [#342](https://github.com/angular/material2/issues/342) [#388](https://github.com/angular/material2/issues/388)
* **input:** use the right ID for the label. ([#515](https://github.com/angular/material2/issues/515))([06aa3f1](https://github.com/angular/material2/commit/06aa3f1)), closes [#512](https://github.com/angular/material2/issues/512)
* **list:** adds focus state for nav-list items ([#502](https://github.com/angular/material2/issues/502))([34b210c](https://github.com/angular/material2/commit/34b210c)), closes [#323](https://github.com/angular/material2/issues/323)
* **list:** removes outline from focus state ([#511](https://github.com/angular/material2/issues/511))([91ad1c8](https://github.com/angular/material2/commit/91ad1c8))
* **progress-circle:** support IE11 ([#375](https://github.com/angular/material2/issues/375))([f22fa86](https://github.com/angular/material2/commit/f22fa86)), closes [#295](https://github.com/angular/material2/issues/295)
* **radio:** refactor tests and fix ngModel ([#443](https://github.com/angular/material2/issues/443))([a25a8da](https://github.com/angular/material2/commit/a25a8da)), closes [#443](https://github.com/issues/443)
* **radio:** remove event global so radio works in node([c32b06d](https://github.com/angular/material2/commit/c32b06d)), closes [#425](https://github.com/angular/material2/issues/425)
* **radio:** unsetting the model will deselect all radio buttons ([#441](https://github.com/angular/material2/issues/441))([8af16e8](https://github.com/angular/material2/commit/8af16e8)), closes [#327](https://github.com/angular/material2/issues/327)
* **sidenav:** add scrolling style to enable momentum scroll([c566242](https://github.com/angular/material2/commit/c566242))
* **sidenav:** fixes sidenav RTL listening for side mode ([#465](https://github.com/angular/material2/issues/465))([4e1d85e](https://github.com/angular/material2/commit/4e1d85e)), closes [#465](https://github.com/issues/465) [#411](https://github.com/angular/material2/issues/411)
* **sidenav:** removes margin transitions ([#460](https://github.com/angular/material2/issues/460))([4b488e1](https://github.com/angular/material2/commit/4b488e1)), closes [#404](https://github.com/angular/material2/issues/404)
* **sidenav:** switches to `translate3d()` for content positioning ([#484](https://github.com/angular/material2/issues/484))([357ee4c](https://github.com/angular/material2/commit/357ee4c))
* **sidenav:** treat `opened` as boolean attribute. ([#444](https://github.com/angular/material2/issues/444))([e977984](https://github.com/angular/material2/commit/e977984)), closes [#300](https://github.com/angular/material2/issues/300)
* **misc:** adds directive constants to all components ([#514](https://github.com/angular/material2/issues/514))([fb89d4f](https://github.com/angular/material2/commit/fb89d4f)), closes [#513](https://github.com/angular/material2/issues/513)
* **misc:** correct access-level on many APIs ([#437](https://github.com/angular/material2/issues/437))([358af3b](https://github.com/angular/material2/commit/358af3b))
* **misc:** ensure custom error messages are set([4a25b7f](https://github.com/angular/material2/commit/4a25b7f))

### Features

* **tabs:** adds the `md-tab-group` component ([#376](https://github.com/angular/material2/issues/376))([ada285c](https://github.com/angular/material2/commit/ada285c))
* **grid-list:** add grid-list component([0f89b8d](https://github.com/angular/material2/commit/0f89b8d))
* **slide-toggle** add slide-toggle component. ([#362](https://github.com/angular/material2/issues/362))([e09a5bf](https://github.com/angular/material2/commit/e09a5bf))
* **checkbox:** drive component with native checkbox ([#415](https://github.com/angular/material2/issues/415))([10ac2be](https://github.com/angular/material2/commit/10ac2be)), closes [#250](https://github.com/angular/material2/issues/250)
* **input:** add focus function on host element ([#407](https://github.com/angular/material2/issues/407))([0323844](https://github.com/angular/material2/commit/0323844))
* **input:** add support for more input attributes ([#447](https://github.com/angular/material2/issues/447))([911bfae](https://github.com/angular/material2/commit/911bfae))
* **overlay:** add connected position strategy ([#335](https://github.com/angular/material2/issues/335))([7f3b1bd](https://github.com/angular/material2/commit/7f3b1bd))


<a name="2.0.0-alpha.4"></a>
# [2.0.0-alpha.4 mahogany-tambourine](https://github.com/angular/material2/compare/2.0.0-alpha.3...v2.0.0-alpha.4) (2016-05-04)


### Bug Fixes

* **button:** cleaned up button theming([0672356](https://github.com/angular/material2/commit/0672356))
* **checkbox:** fix horizontal spacing between checkboxes and radio buttons([f4a7266](https://github.com/angular/material2/commit/f4a7266))
* **sidenav:** add min width for empty navs([dbe3cc5](https://github.com/angular/material2/commit/dbe3cc5))
* **sidenav:** prevent content from scrolling when sidenav is open([fea5923](https://github.com/angular/material2/commit/fea5923))
* **theme:** new, more delightful default theme([2f3e9db](https://github.com/angular/material2/commit/2f3e9db))
* update to @angular 2.0.0-rc.0 ([#384](https://github.com/angular/material2/issues/384))([04c8a1f](https://github.com/angular/material2/commit/04c8a1f))


### Features

* **icon:** initial md-icon implementation ([#281](https://github.com/angular/material2/issues/281))([a094a33](https://github.com/angular/material2/commit/a094a33))
* **card:** add alignment shortcuts for md-card-actions([77be2df](https://github.com/angular/material2/commit/77be2df))
* **grid-list:** basic scaffold for grid list (unreleased)([a9e1fa5](https://github.com/angular/material2/commit/a9e1fa5))
* **list:** add icon support([7b3698c](https://github.com/angular/material2/commit/7b3698c))
* **sidenav:** add fullscreen mode([aa6c740](https://github.com/angular/material2/commit/aa6c740))



<a name="2.0.0-alpha.3"></a>
# [2.0.0-alpha.3 cotton-candelabrum](https://github.com/angular/material2/compare/2.0.0-alpha.2...v2.0.0-alpha.3) (2016-04-21)


### Bug Fixes

* **button:** remove ref to Event global (for node) ([76e4f56](https://github.com/angular/material2/commit/76e4f56))
* **input:** convert values entered based on the type input ([e7611ce](https://github.com/angular/material2/commit/e7611ce))
* **progress-circle:** actually render on Firefox & Edge (#283) ([d24a5b3](https://github.com/angular/material2/commit/d24a5b3))
* **sidenav:** do not throw when there's no sidenav. (#270) ([cc2b223](https://github.com/angular/material2/commit/cc2b223)), closes [#269](https://github.com/angular/material2/issues/269)

### Features

* **progress-bar:** initial progress-bar impl. (#130) ([c640f0c](https://github.com/angular/material2/commit/c640f0c)), closes [#40](https://github.com/angular/material2/issues/40)
* **gestures:** add basic gesture demos ([d4a3cde](https://github.com/angular/material2/commit/d4a3cde))
* **input:** add support for spellcheck attribute (#316) ([dfee018](https://github.com/angular/material2/commit/dfee018))
* **list:** add nav list styles ([22c1ea3](https://github.com/angular/material2/commit/22c1ea3))
* **list:** syntactic sugar for simple nav lists ([c21c336](https://github.com/angular/material2/commit/c21c336))
* **a11y:** live-announcer supports using a provided live element (#273) ([1a33a5b](https://github.com/angular/material2/commit/1a33a5b)), closes [#267](https://github.com/angular/material2/issues/267)



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
# [2.0.0-alpha.0 titanium-octopus](https://github.com/angular/material2/releases/tag/2.0.0-alpha.0) (2016-03-15)

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
