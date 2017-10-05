<a name="2.0.0-beta.12"></a>
# [2.0.0-beta.12 marble-mustache](https://github.com/angular/material2/compare/2.0.0-beta.11...2.0.0-beta.12) (2017-10-05)

### Highlights

* Progress spinner is now entirely css-based. 
* Fixed sidenav: the sidenav can now be configured to use fixed positioning. This resolves a longstanding issue where sidenav-container would always introduce a scrolling region.
* `mat-select` is now used inside `mat-form-field`. This makes all of the existing form-field features available with `mat-select`, including hints, errors, prefixes, and suffixes. This also ensures that `mat-select` and `matInput` have a consistent presentation.

```html
<mat-form-field>
  <mat-select placeholder="State">
    <mat-option *ngFor="let state of states" [value]="state">{{ state }}</mat-option>
  </mat-select>
</mat-form-field>
```


### Breaking Changes

* Previously the `ScrollDispatcher.scrolled` subscription would react both on scroll events and on window resize events. Now it only reacts to scroll events. To react to resize events, subscribe to the `ViewportRuler.change()` stream.
* `UniqueSelectionDispatcher`, `UniqueSelectionDispatcherListener` and `UNIQUE_SELECTION_DISPATCHER_PROVIDER` are no longer
available from @angular/material and instead must be imported from @angular/cdk/collections
* `isFocusTrapEnabled` is now properly marked internal.
* The `OverlayRef.getState` method has been renamed to `OverlayRef.getConfig`.
* `defaultErrorStateMatcher` has been replaced by `ErrorStateMatcher`. For more info, see the [input docs](https://github.com/angular/material2/blob/master/src/lib/input/input.md#custom-error-matcher).

### Features

* **autocomplete:** add md-autocomplete classes to overlay panel ([#7176](https://github.com/angular/material2/issues/7176)) ([f8cd790](https://github.com/angular/material2/commit/f8cd790)), closes [#4196](https://github.com/angular/material2/issues/4196)
* **dialog:** add datepicker dialog and popup classes for easy styling ([#7013](https://github.com/angular/material2/issues/7013)) ([0ff8d5d](https://github.com/angular/material2/commit/0ff8d5d))
* **menu:** support typeahead focus ([#7385](https://github.com/angular/material2/issues/7385)) ([f0d20ca](https://github.com/angular/material2/commit/f0d20ca))
* **nav-tabs:** add `mat-tab-label-active` class to active nav tab labels ([#7508](https://github.com/angular/material2/issues/7508)) ([00e9338](https://github.com/angular/material2/commit/00e9338))
* **progress-spinner:** switch to css-based animation ([#6551](https://github.com/angular/material2/issues/6551)) ([630dfad](https://github.com/angular/material2/commit/630dfad))
* **select:** add support for custom error state matcher ([#7443](https://github.com/angular/material2/issues/7443)) ([a774688](https://github.com/angular/material2/commit/a774688)), closes [#7419](https://github.com/angular/material2/issues/7419)
* **select:** make select work inside form-field ([#6488](https://github.com/angular/material2/issues/6488)) ([d914cc4](https://github.com/angular/material2/commit/d914cc4))
* **selection-model:** de/select multiple values at the same time ([#7001](https://github.com/angular/material2/issues/7001)) ([e52beeb](https://github.com/angular/material2/commit/e52beeb))
* **sidenav:** Add support for fixed sidenavs ([#6712](https://github.com/angular/material2/issues/6712)) ([61579bc](https://github.com/angular/material2/commit/61579bc))
* **sort:** add enter and leave arrow animations ([#7180](https://github.com/angular/material2/issues/7180)) ([2d350a0](https://github.com/angular/material2/commit/2d350a0))
* **table:** add row when predicate ([#6795](https://github.com/angular/material2/issues/6795)) ([0875b85](https://github.com/angular/material2/commit/0875b85))
* **viewport-ruler:** add common window resize handler ([#7113](https://github.com/angular/material2/issues/7113)) ([3b0915a](https://github.com/angular/material2/commit/3b0915a))

### Bug Fixes

* add exportAs to missing components ([#7392](https://github.com/angular/material2/issues/7392)) ([31e9775](https://github.com/angular/material2/commit/31e9775)), closes [#7361](https://github.com/angular/material2/issues/7361)
* remove all md prefixes ([#7241](https://github.com/angular/material2/issues/7241)) ([20a23f1](https://github.com/angular/material2/commit/20a23f1))
* **slide-toggle:** report change to model before firing a change event ([#7076](https://github.com/angular/material2/issues/7076)) ([c82fca8](https://github.com/angular/material2/commit/c82fca8)), closes [#7074](https://github.com/angular/material2/issues/7074)
* remove cdk re-exports from [@angular](https://github.com/angular)/material ([#7112](https://github.com/angular/material2/issues/7112)) ([f9b5ccd](https://github.com/angular/material2/commit/f9b5ccd))
* **autocomplete:** don't open panel for readonly inputs ([#7271](https://github.com/angular/material2/issues/7271)) ([5f8615f](https://github.com/angular/material2/commit/5f8615f)), closes [#7269](https://github.com/angular/material2/issues/7269)
* **autocomplete:** emit closing action for escape keydown event ([#6250](https://github.com/angular/material2/issues/6250)) ([f4673a5](https://github.com/angular/material2/commit/f4673a5))
* **autocomplete:** empty not cleaning up on tab ([#7270](https://github.com/angular/material2/issues/7270)) ([6be0462](https://github.com/angular/material2/commit/6be0462)), closes [#7268](https://github.com/angular/material2/issues/7268)
* **autocomplete:** error if panel is added asynchronously ([#7078](https://github.com/angular/material2/issues/7078)) ([504ba70](https://github.com/angular/material2/commit/504ba70)), closes [#7069](https://github.com/angular/material2/issues/7069)
* **autocomplete:** remove invalid aria markup ([#7107](https://github.com/angular/material2/issues/7107)) ([6bd6b9f](https://github.com/angular/material2/commit/6bd6b9f)), closes [#7100](https://github.com/angular/material2/issues/7100)
* **button:** allow for elevation to be overwritten ([#7305](https://github.com/angular/material2/issues/7305)) ([92a868e](https://github.com/angular/material2/commit/92a868e)), closes [#7264](https://github.com/angular/material2/issues/7264)
* **calendar:** not reacting to min/max boundary changes ([#7234](https://github.com/angular/material2/issues/7234)) ([eb012cc](https://github.com/angular/material2/commit/eb012cc)), closes [#7202](https://github.com/angular/material2/issues/7202)
* **checkbox:** defaulting to invalid name and value attributes ([#7130](https://github.com/angular/material2/issues/7130)) ([26788f1](https://github.com/angular/material2/commit/26788f1))
* **checkbox:** support native tabindex attribute ([#6793](https://github.com/angular/material2/issues/6793)) ([0270cf5](https://github.com/angular/material2/commit/0270cf5))
* **chips:** do not set chips value if there's no ngControl or value ([#7285](https://github.com/angular/material2/issues/7285)) ([d9ba13f](https://github.com/angular/material2/commit/d9ba13f))
* **chips:** fix chip list focus and keyboard behaviors ([#7319](https://github.com/angular/material2/issues/7319)) ([f166468](https://github.com/angular/material2/commit/f166468))
* **common:** don't log doctype warning when rendering server-side ([#6833](https://github.com/angular/material2/issues/6833)) ([f8ed442](https://github.com/angular/material2/commit/f8ed442))
* **common-module:** check if computed styles are available ([#7003](https://github.com/angular/material2/issues/7003)) ([5da9e64](https://github.com/angular/material2/commit/5da9e64)), closes [#7000](https://github.com/angular/material2/issues/7000)
* **datepicker:** make sure _datepickerInput exists before accessing its ([#7033](https://github.com/angular/material2/issues/7033)) ([2129b7a](https://github.com/angular/material2/commit/2129b7a))
* **dialog:** directionality not injected into child components ([#7111](https://github.com/angular/material2/issues/7111)) ([daa3880](https://github.com/angular/material2/commit/daa3880))
* **drawer:** backdrop not transitioning on close ([#6651](https://github.com/angular/material2/issues/6651)) ([80310a5](https://github.com/angular/material2/commit/80310a5))
* **drawer:** drawer container animating when open by default ([#7129](https://github.com/angular/material2/issues/7129)) ([4d278dd](https://github.com/angular/material2/commit/4d278dd)), closes [#7007](https://github.com/angular/material2/issues/7007)
* **drawer:** drawer container not reacting to drawer removal ([#7060](https://github.com/angular/material2/issues/7060)) ([b0b91f4](https://github.com/angular/material2/commit/b0b91f4)), closes [#6271](https://github.com/angular/material2/issues/6271)
* **drawer:** open event not firing on init ([#7214](https://github.com/angular/material2/issues/7214)) ([ba5653d](https://github.com/angular/material2/commit/ba5653d)), closes [#7208](https://github.com/angular/material2/issues/7208)
* **input:** apply readonly attribute when readonly ([#7439](https://github.com/angular/material2/issues/7439)) ([01622b1](https://github.com/angular/material2/commit/01622b1))
* **input:** don't highlight container when readonly input is focused ([#7273](https://github.com/angular/material2/issues/7273)) ([f076390](https://github.com/angular/material2/commit/f076390))
* **input:** make autosize work inside tabs & stepper ([#7341](https://github.com/angular/material2/issues/7341)) ([c6824d5](https://github.com/angular/material2/commit/c6824d5))
* **list-key-manager:** align matching logic with native listbox ([#7212](https://github.com/angular/material2/issues/7212)) ([846cc13](https://github.com/angular/material2/commit/846cc13))
* **list-key-manager:** don't focus disabled items in typeahead mode ([#7382](https://github.com/angular/material2/issues/7382)) ([1823b2f](https://github.com/angular/material2/commit/1823b2f))
* **menu:** multiple close events for a single close ([#7037](https://github.com/angular/material2/issues/7037)) ([2dcb76c](https://github.com/angular/material2/commit/2dcb76c))
* **menu:** nested menu error when items are rendered in a repeater ([#6766](https://github.com/angular/material2/issues/6766)) ([7a96570](https://github.com/angular/material2/commit/7a96570)), closes [#6765](https://github.com/angular/material2/issues/6765)
* **overlay:** detach method returns undefined ([#7449](https://github.com/angular/material2/issues/7449)) ([0584cdf](https://github.com/angular/material2/commit/0584cdf)), closes [#7408](https://github.com/angular/material2/issues/7408)
* **paginator:** page size selector not working ([#7263](https://github.com/angular/material2/issues/7263)) ([2b3d795](https://github.com/angular/material2/commit/2b3d795))
* **radio:** defaulting to invalid name attribute ([#7131](https://github.com/angular/material2/issues/7131)) ([c5e162b](https://github.com/angular/material2/commit/c5e162b))
* **ripple:** handle touch events ([#7299](https://github.com/angular/material2/issues/7299)) ([fe0864b](https://github.com/angular/material2/commit/fe0864b)), closes [#7062](https://github.com/angular/material2/issues/7062)
* **ripple:** remove unused ScrollDispatchModule ([#7528](https://github.com/angular/material2/issues/7528)) ([4a1a68d](https://github.com/angular/material2/commit/4a1a68d))
* **ripple:** use element coordinates instead of page coordinates ([#7446](https://github.com/angular/material2/issues/7446)) ([7714a5c](https://github.com/angular/material2/commit/7714a5c)), closes [#7436](https://github.com/angular/material2/issues/7436)
* **select:** losing focus when selecting values through binding ([#7296](https://github.com/angular/material2/issues/7296)) ([86bea91](https://github.com/angular/material2/commit/86bea91)), closes [#7092](https://github.com/angular/material2/issues/7092)
* **select:** multiple change events emitted when changing options of a closed select ([#7232](https://github.com/angular/material2/issues/7232)) ([c7ab828](https://github.com/angular/material2/commit/c7ab828)), closes [#7227](https://github.com/angular/material2/issues/7227)
* **select:** prevent nbsp from getting butchered in AOT ([#7363](https://github.com/angular/material2/issues/7363)) ([2e71cac](https://github.com/angular/material2/commit/2e71cac))
* **select:** theme not being transferred to the panel ([#7342](https://github.com/angular/material2/issues/7342)) ([6b70ca6](https://github.com/angular/material2/commit/6b70ca6))
* **selection-list:** model not updated when option is selected programmatically ([#7334](https://github.com/angular/material2/issues/7334)) ([f40a7cc](https://github.com/angular/material2/commit/f40a7cc)), closes [#7318](https://github.com/angular/material2/issues/7318)
* **selection-list:** restore focus if active item is destroyed ([#7125](https://github.com/angular/material2/issues/7125)) ([e05f939](https://github.com/angular/material2/commit/e05f939))
* **selection-list:** tabIndex should respect disabled state ([#7039](https://github.com/angular/material2/issues/7039)) ([c2a9516](https://github.com/angular/material2/commit/c2a9516))
* **sidenav:** change content from md- to mat- ([#7307](https://github.com/angular/material2/issues/7307)) ([d05dcfa](https://github.com/angular/material2/commit/d05dcfa))
* **slider:** change event is not being emitted ([#7278](https://github.com/angular/material2/issues/7278)) ([39543a3](https://github.com/angular/material2/commit/39543a3)), closes [#7207](https://github.com/angular/material2/issues/7207)
* **snack-bar:** positioned snack bar animation not starting off-screen ([#7453](https://github.com/angular/material2/issues/7453)) ([58d3bb8](https://github.com/angular/material2/commit/58d3bb8))
* **snack-bar:** subsequent snack bars not opening; animation issues ([#7086](https://github.com/angular/material2/issues/7086)) ([8e77261](https://github.com/angular/material2/commit/8e77261)), closes [#7063](https://github.com/angular/material2/issues/7063)
* **sort:** fix incorrect conditional grouping ([#7427](https://github.com/angular/material2/issues/7427)) ([f5e916d](https://github.com/angular/material2/commit/f5e916d))
* **sort:** style changes to fix IE ([#7375](https://github.com/angular/material2/issues/7375)) ([75f26e8](https://github.com/angular/material2/commit/75f26e8))
* **sort:** throw error on invalid direction ([#7378](https://github.com/angular/material2/issues/7378)) ([cc6f39e](https://github.com/angular/material2/commit/cc6f39e))
* **stepper:** align appearance with spec ([#7279](https://github.com/angular/material2/issues/7279)) ([4122ae2](https://github.com/angular/material2/commit/4122ae2)), closes [#7260](https://github.com/angular/material2/issues/7260)
* **stepper:** avoid blurry content on IE ([#6992](https://github.com/angular/material2/issues/6992)) ([6f48710](https://github.com/angular/material2/commit/6f48710))
* **stepper:** selected is always undefined ([#7213](https://github.com/angular/material2/issues/7213)) ([217840c](https://github.com/angular/material2/commit/217840c))
* **stepper:** switch to OnPush change detection ([#7119](https://github.com/angular/material2/issues/7119)) ([c2c6e04](https://github.com/angular/material2/commit/c2c6e04))
* **stepper:** unable to internationalize labels ([#7122](https://github.com/angular/material2/issues/7122)) ([6e3bbcb](https://github.com/angular/material2/commit/6e3bbcb))
* **tabs:** blurry content in IE ([#6954](https://github.com/angular/material2/issues/6954)) ([7a354a0](https://github.com/angular/material2/commit/7a354a0)), closes [#6944](https://github.com/angular/material2/issues/6944)
* **tabs:** update tab output names  ([#7134](https://github.com/angular/material2/issues/7134)) ([38268d3](https://github.com/angular/material2/commit/38268d3))
* **theming:** incorrect green-500 contrast color ([#7492](https://github.com/angular/material2/issues/7492)) ([c1f6ea1](https://github.com/angular/material2/commit/c1f6ea1)), closes [#7490](https://github.com/angular/material2/issues/7490)
* **tooltip:** ensure tooltip stays within viewport ([#6659](https://github.com/angular/material2/issues/6659)) ([c8ddd39](https://github.com/angular/material2/commit/c8ddd39)), closes [#5428](https://github.com/angular/material2/issues/5428)
* **tooltip:** minification issue ([#7430](https://github.com/angular/material2/issues/7430)) ([b121e32](https://github.com/angular/material2/commit/b121e32))

<a name="2.0.0-beta.11"></a>
# [2.0.0-beta.11 carapace-parapet](https://github.com/angular/material2/compare/2.0.0-beta.10...2.0.0-beta.11) (2017-09-21)


### Highlights
* Each `@angular/material` component is now bundled into its own javascript file. This will allow
tools like webpack to more easily load _only_ the components being used in an application.
* New stepper component! The base behavior lives in `@angular/cdk` with Material Design flavors in
`@angular/material`.


### Breaking changes

* Angular Material now requires **Angular 4.4.3 or greater**
* `MaterialModule` has been removed. ([cf1ece0](https://github.com/angular/material2/commit/cf1ece0)) (#6803)
[See the deprecation notice from beta.3 for more information](https://github.com/angular/material2/blob/master/CHANGELOG.md#materialmodule).
* `MdCoreModule` has been removed. Most of its functionality has been moved to `@angular/cdk` over
the last few releases.
* `FocusOriginMonitor` has been renamed to `FocusMonitor` and moved to `@angular/cdk`.
* **chip-list:**  The outputs `select` and `deselect` have been removed in favor of a single
  `onSelectionChange` output.
* **overlay:** OverlayState has been renamed to OverlayConfig
* **overlay:** Now that the Overlay is part of the cdk rather than Angular Material directly,
the `themeClass` property has been removed. To add a class to the
overlay for theming, you can do
```ts
overlayContainer.getContainerElement().classList.add('my-theme-class');
```
* DateAdapter method `getISODateString` has been renamed to `toIso8601` and a new method
`fromIso8601` has been added.
* **sort:** The sort-change stream `mdSortChange` has been renamed to `sortChange`.

### Deprecation of "md" prefix.

In earlier betas, we've had a compatibility mode that allowed people to use either "md" or "mat"
as the selector for Angular Material components. This was created so that these components could
live side-by-side with [AngularJS Material](https://material.angularjs.org) without CSS from
the two libraries colliding.

For beta.11, we've made the decision to deprecate the "md" prefix completely and use "mat" moving
forward. This affects all class names, properties, inputs, outputs, and selectors (CSS classes were
changed back in February). The "md" prefixes will be removed in the next beta release.

[You can automatically update your projects with the angular-material-prefix-updater tool.](https://www.npmjs.com/package/angular-material-prefix-updater)
Check out the tool's page for instructions on how to run.

#### Why are we doing this?
We like the "md" prefix too! We added compatibility mode in order to keep "md" around, but over
time we found that there were too many downsides to continue supporting both prefixes at the same
time:
* Many users found the fact that the CSS used "mat" while templates used "md" confusing.
* Users in compatibility mode found that having "mat" in their templates while TypeScript class
names remained "Md" to be unfriendly.
* Making both prefixes available consistently through templates required [adding many
getters/setters that aliased the "true" property](https://github.com/angular/material2/blob/1cfce8d9ab047d447465bd4e233fd26893830328/src/lib/tooltip/tooltip.ts#L171-L198).
This ends up increasing payload size and complexity of the source code.
* Compatiblity mode itself used [broad directive selectors](https://github.com/angular/material2/blob/87318bc7c83d249036837376609ea099e5aea2d9/src/lib/core/compatibility/compatibility.ts#L107-L187)
to enforce that only one prefix was used at a time. This causes a problem where this broad selector
prevents Angular from throwing an error if an application uses a component without importing its
`NgModule`.

#### Why not change the styles in AngularJS Material?
We explored this option early on (before creating compatibility mode). We found that changing the
library's styles such that they wouldn't affect the Angular Material components would increase
the specificity. This would have been a significant breaking change, as it would have potentially
broken countless custom styles that relied on a particular specificity working.

### Other deprecations
* `StyleModule` is deprecated. `FocusOriginMonitor` (the only thing it contained) has been renamed
to `FocusMonitor` and moved to `@angular/cdk/a11y` (`A11yModule`).


### Bug Fixes

* **autocomplete,select:** inconsistent disabled option coloring ([#6640](https://github.com/angular/material2/issues/6640)) ([454781d](https://github.com/angular/material2/commit/454781d)), closes [#6638](https://github.com/angular/material2/issues/6638)
* **autosize:** not resizing on programmatic changes ([#6654](https://github.com/angular/material2/issues/6654)) ([89fea50](https://github.com/angular/material2/commit/89fea50)), closes [#5247](https://github.com/angular/material2/issues/5247)
* **button-toggle:** border radius ignored if option is selected ([#6699](https://github.com/angular/material2/issues/6699)) ([82e14f8](https://github.com/angular/material2/commit/82e14f8)), closes [#6689](https://github.com/angular/material2/issues/6689)
* **checkbox:** label content should not wrap ([#6674](https://github.com/angular/material2/issues/6674)) ([9acab86](https://github.com/angular/material2/commit/9acab86)), closes [#6671](https://github.com/angular/material2/issues/6671)
* **chips:** set appropriate aria-orientation ([#6464](https://github.com/angular/material2/issues/6464)) ([a37aa6a](https://github.com/angular/material2/commit/a37aa6a))
* **datepicker:** allow date or datetime strings in fromIso8601 ([#7220](https://github.com/angular/material2/issues/7220)) ([8436f8c](https://github.com/angular/material2/commit/8436f8c))
* **datepicker:** allow ISO 8601 strings as inputs ([#7091](https://github.com/angular/material2/issues/7091)) ([d2ceb2c](https://github.com/angular/material2/commit/d2ceb2c))
* **datepicker:** backdrop class should be mat- ([#7056](https://github.com/angular/material2/issues/7056)) ([2b61eb6](https://github.com/angular/material2/commit/2b61eb6))
* **datepicker:** Create a new injection token to avoid overriding LOCALE_ID ([#6708](https://github.com/angular/material2/issues/6708)) ([2635cad](https://github.com/angular/material2/commit/2635cad))
* **datepicker:** fix wrong datepicker-input value for non MM/DD/YYYY locales ([#6798](https://github.com/angular/material2/issues/6798)) ([29399b8](https://github.com/angular/material2/commit/29399b8))
* **datepicker:** makes sure the datepickerInput is registered ([#7049](https://github.com/angular/material2/issues/7049)) ([e4d48d7](https://github.com/angular/material2/commit/e4d48d7))
* **datepicker:** toggle not reacting to disabled state changes in datepicker or input ([#6964](https://github.com/angular/material2/issues/6964)) ([85993d3](https://github.com/angular/material2/commit/85993d3))
* **expansion-panel:** dark theme header hover color ([#6616](https://github.com/angular/material2/issues/6616)) ([21c68ad](https://github.com/angular/material2/commit/21c68ad))
* **form-field:** add aria-owns to label element ([#6683](https://github.com/angular/material2/issues/6683)) ([4191b4d](https://github.com/angular/material2/commit/4191b4d))
* **form-field:** placeholder not floating if autofilled ([#6839](https://github.com/angular/material2/issues/6839)) ([602a861](https://github.com/angular/material2/commit/602a861)), closes [#6837](https://github.com/angular/material2/issues/6837)
* **grid-list:** avoid unnecessary calc declarations ([#6745](https://github.com/angular/material2/issues/6745)) ([255611b](https://github.com/angular/material2/commit/255611b))
* **grid-list:** styles not cleared when switching to a different styling mode ([#6660](https://github.com/angular/material2/issues/6660)) ([87d607e](https://github.com/angular/material2/commit/87d607e)), closes [#4047](https://github.com/angular/material2/issues/4047)
* **input:** remove resize handle from non-textarea inputs ([#6768](https://github.com/angular/material2/issues/6768)) ([1272f03](https://github.com/angular/material2/commit/1272f03)), closes [#6757](https://github.com/angular/material2/issues/6757)
* **list:** subheader margin being overwritten by typography ([#6735](https://github.com/angular/material2/issues/6735)) ([efe483a](https://github.com/angular/material2/commit/efe483a))
* **menu:** multiple close events for a single close ([#6961](https://github.com/angular/material2/issues/6961)) ([1cccd4b](https://github.com/angular/material2/commit/1cccd4b))
* **menu:** nested menu hover not working when trigger is added lazily ([#6807](https://github.com/angular/material2/issues/6807)) ([6b5100b](https://github.com/angular/material2/commit/6b5100b)), closes [#6731](https://github.com/angular/material2/issues/6731)
* **menu:** nested trigger staying highlighted after click ([#6853](https://github.com/angular/material2/issues/6853)) ([04bf3d1](https://github.com/angular/material2/commit/04bf3d1)), closes [#6838](https://github.com/angular/material2/issues/6838)
* **overlay:** rename OverlayState to OverlayConfig ([#6972](https://github.com/angular/material2/issues/6972)) ([1cfce8d](https://github.com/angular/material2/commit/1cfce8d))
* **progress-bar:** query mode not reversing direction in rtl ([#6922](https://github.com/angular/material2/issues/6922)) ([8a21881](https://github.com/angular/material2/commit/8a21881))
* **select:** extra whitespace around placeholder ([#6955](https://github.com/angular/material2/issues/6955)) ([9fe6386](https://github.com/angular/material2/commit/9fe6386)), closes [#6923](https://github.com/angular/material2/issues/6923)
* **selection-list:** do not coerece option value to boolean ([#6983](https://github.com/angular/material2/issues/6983)) ([dfe01f2](https://github.com/angular/material2/commit/dfe01f2))
* **selection-list:** proper style for disabled options ([#6829](https://github.com/angular/material2/issues/6829)) ([547d11f](https://github.com/angular/material2/commit/547d11f))
* **slide-toggle:** remove side-margin if slide-toggle label is empty ([#6881](https://github.com/angular/material2/issues/6881)) ([a1ec81a](https://github.com/angular/material2/commit/a1ec81a)), closes [#6868](https://github.com/angular/material2/issues/6868)
* **slide-toggle:** support native tabindex attribute ([#6613](https://github.com/angular/material2/issues/6613)) ([8f9f3c8](https://github.com/angular/material2/commit/8f9f3c8))
* **slider:** thumb disappearing on disabled element with thumb label ([#6641](https://github.com/angular/material2/issues/6641)) ([8243b16](https://github.com/angular/material2/commit/8243b16)), closes [#6631](https://github.com/angular/material2/issues/6631)
* **slider:** update styles when focus and dir change ([#6700](https://github.com/angular/material2/issues/6700)) ([8c49422](https://github.com/angular/material2/commit/8c49422))
* **slider, drawer:** unsubscribe from directionaly change subject ([#6907](https://github.com/angular/material2/issues/6907)) ([a7ce31e](https://github.com/angular/material2/commit/a7ce31e)), closes [#6892](https://github.com/angular/material2/issues/6892) [#6903](https://github.com/angular/material2/issues/6903)
* **snack-bar:** animation not starting for subsequent snack bars ([#6649](https://github.com/angular/material2/issues/6649)) ([730e7ae](https://github.com/angular/material2/commit/730e7ae)), closes [#6222](https://github.com/angular/material2/issues/6222)
* **sort:** reverse directions and better animation ([#6802](https://github.com/angular/material2/issues/6802)) ([6fa9e6f](https://github.com/angular/material2/commit/6fa9e6f))
* **table:** gracefully handle undefined/null columns ([#6862](https://github.com/angular/material2/issues/6862)) ([3ddf65b](https://github.com/angular/material2/commit/3ddf65b))
* **tabs:** fix infinite tab loop ([#6663](https://github.com/angular/material2/issues/6663)) ([67e02b0](https://github.com/angular/material2/commit/67e02b0)), closes [#4639](https://github.com/angular/material2/issues/4639)
* **tabs:** tab spacing on desktop incorrect ([#6681](https://github.com/angular/material2/issues/6681)) ([b678119](https://github.com/angular/material2/commit/b678119)), closes [#3347](https://github.com/angular/material2/issues/3347)
* **tooltip:** closing immediately when triggered on click ([#6590](https://github.com/angular/material2/issues/6590)) ([bcd026f](https://github.com/angular/material2/commit/bcd026f))
* **tooltip:** ensure tooltip never passes undefined message to ([#7018](https://github.com/angular/material2/issues/7018)) ([f6d1078](https://github.com/angular/material2/commit/f6d1078))
* add `mat` exportAs and class aliases ([#7106](https://github.com/angular/material2/issues/7106)) ([a96b545](https://github.com/angular/material2/commit/a96b545))
* **tooltip:** error on trigger escape presses while closed ([#7028](https://github.com/angular/material2/issues/7028)) ([dcf3b27](https://github.com/angular/material2/commit/dcf3b27)), closes [#7009](https://github.com/angular/material2/issues/7009)

### Features

* **chip-list:** implement FormFieldControl and ControlValueAccessor ([#6686](https://github.com/angular/material2/issues/6686)) ([7a42706](https://github.com/angular/material2/commit/7a42706))
* **datepicker:** Add Moment.js adapter ([#6860](https://github.com/angular/material2/issues/6860)) ([9545427](https://github.com/angular/material2/commit/9545427))
* **dialog:** add afterOpen to MdDialogRef ([#6887](https://github.com/angular/material2/issues/6887)) ([27cbe47](https://github.com/angular/material2/commit/27cbe47))
* **expansion-panel:** allow for the panel header height to be customized ([#6643](https://github.com/angular/material2/issues/6643)) ([11e2239](https://github.com/angular/material2/commit/11e2239)), closes [#5641](https://github.com/angular/material2/issues/5641)
* **overlay:** replace OverlayContainer themeClass w/ addClass/removeClass methods ([#6975](https://github.com/angular/material2/issues/6975)) ([a944f6e](https://github.com/angular/material2/commit/a944f6e))
* **selection-list:** add selectAll and deselectAll functions ([#6971](https://github.com/angular/material2/issues/6971)) ([dc9679d](https://github.com/angular/material2/commit/dc9679d)), closes [#6969](https://github.com/angular/material2/issues/6969)
* **sort:** add sorting indicator animation ([#5831](https://github.com/angular/material2/issues/5831)) ([70bd5fc](https://github.com/angular/material2/commit/70bd5fc))
* **stepper:** Add e2e test ([#6776](https://github.com/angular/material2/issues/6776)) ([bef6271](https://github.com/angular/material2/commit/bef6271))
* **stepper:** add moduleId to components ([#6780](https://github.com/angular/material2/issues/6780)) ([f375f92](https://github.com/angular/material2/commit/f375f92))
* **stepper:** Address previous comments + add directionality support ([#6775](https://github.com/angular/material2/issues/6775)) ([c396596](https://github.com/angular/material2/commit/c396596))
* **stepper:** initial version of stepper ([#6594](https://github.com/angular/material2/issues/6594)) ([87318bc](https://github.com/angular/material2/commit/87318bc))
* **viewport-ruler:** add common window resize handler ([#6680](https://github.com/angular/material2/issues/6680)) ([881630f](https://github.com/angular/material2/commit/881630f))
* add `preserveWhitespaces: false` to all components ([#7115](https://github.com/angular/material2/issues/7115)) ([2b0315d](https://github.com/angular/material2/commit/2b0315d))
* move FocusMonitor into cdk ([#6921](https://github.com/angular/material2/issues/6921)) ([6cfe5c4](https://github.com/angular/material2/commit/6cfe5c4))


### Performance Improvements

* **dialog:** avoid repaintin dialog content element on scroll ([#6890](https://github.com/angular/material2/issues/6890)) ([51396d0](https://github.com/angular/material2/commit/51396d0)), closes [#6878](https://github.com/angular/material2/issues/6878)
* memory leak when subscribing to zone events ([#6918](https://github.com/angular/material2/issues/6918)) ([f6c9172](https://github.com/angular/material2/commit/f6c9172)), closes [#6905](https://github.com/angular/material2/issues/6905)


<a name="2.0.0-beta.10"></a>
# [2.0.0-beta.10 découpage-panjandrum](https://github.com/angular/material2/compare/2.0.0-beta.8...2.0.0-beta.10) (2017-08-29)

### Highlights
* Over 140 bug fixes
* Nested menus
  * Nested menus
    * Nested menus!
* Autocomplete supports `md-optgroup`
* `Overlay` moved to `@angular/cdk`
* New component `MdSelectionList`
* `md-input-container` renamed to `md-form-field` (while still being backwards compatible)
* Almost all components now use `OnPush` change detection (dialog being the exception)
* You can now get back the `EmbeddedViewRef` when attaching a `TemplatePortal`
* `MdSidenav` has been split into `MdSidenav` and `MdDrawer`. The `MdSidenav` is now meant to be
used for top-level application navigation, while the drawer is meant to be used for more local
split views. While there are no differences introduced between the two in this release, future
releases will see different features added to each

### Breaking changes
* Imports from `@angular/cdk` are now scoped to a specific sub-package. For example, if you
previously had:
```ts
import {LiveAnnouncer, Overlay, Directionality} from '@angular/cdk';
```
You will now need to write:
```ts
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {Overlay} from '@angular/cdk/overlay';
```

This helps ensure you're only pulling in the pieces of the cdk being used as well as providing more
context about what an imported symbol is being used for.

The current set of public `@angular/cdk` subpackages are:
a11y, bidi, coercion, collections, keycodes, observers, overlay, platform, portal, rxjs,
scrolling, table.

If you are using SystemJS, each package you use must be added to the SystemJS configuration. 
* All `Overlay` code has been moved from `@angular/material` to `@angular/cdk`. The symbols are
still re-exported through `@angular/material`, but these re-exports will be removed in a
subsequent release.
* `cdkScrollable`, `ScrollDispatcher`, and `ViewportRuler` have been moved from overlay into its
own `scrolling` subpackage in `@angular/cdk`. 
* **input:** Inputs have a width of `200px` by default (similar to native input elements). The
width can be overridden by via the `mat-form-field` css class.
* **input:** CSS classes have changed from `mat-input-container-` to `mat-form-field-`. 
* **input:** `md-prefix` and `md-suffix` are now `mdPrefix` and `mdSuffix`.
* **portal:** `TemplatePortal` now requires a generic type (C) to align with `TemplateRef`.
This will usually be `any`.
* **portal:** Attaching a template portal will now return an `EmbeddedViewRef<C>` instead of an
empty `Map`.
* **observe-content:** `ObserveContentModule` has been renamed to `ObserversModule`
* **overlay:** `PositionStrategy` now has an `attach` method and no longer passes the overlay
DOM element to `apply`.
* **datepicker:** You must now use a date object (of whatever type your DateAdapter uses) rather
than a string when setting the value of the datepicker programmatically (through value, ngModel,
or formControl).
* **datepicker:** `mdDatepickerToggle` is now an element `<md-datepicker-toggle>` with a `for`
property that points to the `MdDatepicker` instance
* **datepicker:** `NativeDateAdapter` will now use Angular's LOCALE_ID instead of the browser's
locale.
* **sidenav:** CSS classes have changed from `mat-sidenav-` to `mat-drawer-`
* **theming:** The nonstandard `0` and `1000` hues have been removed from the `mat-gray` palette
* **chips:** The `selectable` property of the `md-chip-list` has
now been moved to `md-chip` to maintain consistency with the new
`removable` option.

If you used the following code,

```html
<md-chip-list [selectable]="selectable">
  <md-chip>My Chip</md-chip>
</md-chip-list>
```

you should switch it to

```html
<md-chip-list>
  <md-chip [selectable]="selectable">My Chip</md-chip>
</md-chip-list>
```

### Deprecations
* All dash-case `@Directive` selectors are deprecated in favor of the camelCase equivalent. The
dash-case selectors will be removed in a subsequent release. Some examples include:

| Old              | New          |
|------------------|--------------|
| md-line          | mdLine       |
| md-tab-link      | mdTabLink    |
| md-tab-label     | mdTabLabel   |
| md-card-avatar   | mdCardAvatar |

* `md-input-container` has been renamed to `md-form-field`. The old selector will be removed in a
subsequent release. This is in preparation to making `md-select` a child of `md-form-field`
such that both select and input share the same features and appearance.
* For camelCased directives, each corresponding `@Input()` is now also prefixed. For example,
`cdkConnectedOverlay` now has inputs for
`cdkConnectedOverlayOrigin`, `cdkConnectedOverlayPositions`, etc. The class members themselves are
unchanged. The unprefixed inputs will be removed in a subsequent release. Affected directives are
`cdkPortalHost`, `cdkConnectedOverlay`, `mdTooltip`, `mdTextareaAutosize`, and `mdMenuTriggerFor`.
* `MdCoreModule` is deprecated and will be removed in a subsequent release now that most of its
functionality has been moved to `@angular/cdk`
* Reminder that `MaterialModule` is deprecated and will be removed in a subsequent release (see
changelog from beta.3 for more information).


### Features

* **autocomplete:** emit event when an option is selected ([#4187](https://github.com/angular/material2/issues/4187)) ([2dd5c7c](https://github.com/angular/material2/commit/2dd5c7c)), closes [#4094](https://github.com/angular/material2/issues/4094) [#3645](https://github.com/angular/material2/issues/3645)
* **autocomplete:** support for md-optgroup ([#5604](https://github.com/angular/material2/issues/5604)) ([e41d0f3](https://github.com/angular/material2/commit/e41d0f3)), closes [#5581](https://github.com/angular/material2/issues/5581)
* **cdk:** move cdkScrollable, ScrollDispatcher, and ViewportRuler out of overlay ([#6547](https://github.com/angular/material2/issues/6547)) ([0f6a2ec](https://github.com/angular/material2/commit/0f6a2ec))
* **cdk:** move overlay into cdk ([#6100](https://github.com/angular/material2/issues/6100)) ([4d82f83](https://github.com/angular/material2/commit/4d82f83))
* **chip:** add aria-selected to chip ([#5920](https://github.com/angular/material2/issues/5920)) ([281de25](https://github.com/angular/material2/commit/281de25))
* **chips:** Add removal functionality/styling. ([#4912](https://github.com/angular/material2/issues/4912)) ([c82aca9](https://github.com/angular/material2/commit/c82aca9)), closes [#3143](https://github.com/angular/material2/issues/3143)
* **chips:** add user defined tab index to chip list ([#6073](https://github.com/angular/material2/issues/6073)) ([9eb9ddf](https://github.com/angular/material2/commit/9eb9ddf))
* **datepicker:** close calendar after choose the same date again ([#6323](https://github.com/angular/material2/issues/6323)) ([9ba5d84](https://github.com/angular/material2/commit/9ba5d84))
* **datepicker:** export unexported components for potential extension ([#6314](https://github.com/angular/material2/issues/6314)) ([7bc648b](https://github.com/angular/material2/commit/7bc648b))
* **dialog:** add beforeClose method ([#6377](https://github.com/angular/material2/issues/6377)) ([cdbf305](https://github.com/angular/material2/commit/cdbf305))
* **dialog:** expose backdrop clicks ([#6511](https://github.com/angular/material2/issues/6511)) ([df28c3d](https://github.com/angular/material2/commit/df28c3d))
* **dialog:** open dialog API improvements ([#6289](https://github.com/angular/material2/issues/6289)) ([8b54715](https://github.com/angular/material2/commit/8b54715)), closes [#6272](https://github.com/angular/material2/issues/6272)
* **expansion-panel:** add the ability to disable an expansion panel ([#6529](https://github.com/angular/material2/issues/6529)) ([921432a](https://github.com/angular/material2/commit/921432a)), closes [#6521](https://github.com/angular/material2/issues/6521)
* **focus-trap:** return whether shifting focus was successful ([#6279](https://github.com/angular/material2/issues/6279)) ([7626c51](https://github.com/angular/material2/commit/7626c51))
* **menu:** add indicator to menu items that trigger a sub-menu ([#5995](https://github.com/angular/material2/issues/5995)) ([a51f82f](https://github.com/angular/material2/commit/a51f82f))
* **menu:** add injection token for overriding the default options ([#5483](https://github.com/angular/material2/issues/5483)) ([3cb3945](https://github.com/angular/material2/commit/3cb3945)), closes [#5479](https://github.com/angular/material2/issues/5479)
* **menu:** add nested menu functionality ([#5493](https://github.com/angular/material2/issues/5493)) ([1e0c1fc](https://github.com/angular/material2/commit/1e0c1fc))
* **menu:** increase nested menu elevation based on depth ([#5937](https://github.com/angular/material2/issues/5937)) ([91f7bf7](https://github.com/angular/material2/commit/91f7bf7))
* **native-date-adapter:** use default locale from LOCALE_ID ([#5419](https://github.com/angular/material2/issues/5419)) ([c09e8a7](https://github.com/angular/material2/commit/c09e8a7)), closes [#5393](https://github.com/angular/material2/issues/5393)
* **option:** support for disableRipple binding ([#5915](https://github.com/angular/material2/issues/5915)) ([addf1ce](https://github.com/angular/material2/commit/addf1ce))
* **overlay:** add maxWidth and maxHeight ([#6508](https://github.com/angular/material2/issues/6508)) ([9904e56](https://github.com/angular/material2/commit/9904e56))
* **overlay:** add providers for overriding the scroll strategies per component ([#5134](https://github.com/angular/material2/issues/5134)) ([184a6e4](https://github.com/angular/material2/commit/184a6e4)), closes [#4093](https://github.com/angular/material2/issues/4093)
* **overlay:** support setting multiple panel classes ([#6326](https://github.com/angular/material2/issues/6326)) ([a190de7](https://github.com/angular/material2/commit/a190de7)), closes [#6318](https://github.com/angular/material2/issues/6318)
* **paginator:** default page size to first option ([#5822](https://github.com/angular/material2/issues/5822)) ([42c50b6](https://github.com/angular/material2/commit/42c50b6))
* **portal:** support context in TemplatePortal ([#6408](https://github.com/angular/material2/issues/6408)) ([90a6ac9](https://github.com/angular/material2/commit/90a6ac9))
* **radio:** add required attribute to radio-group ([#5751](https://github.com/angular/material2/issues/5751)) ([f06fe11](https://github.com/angular/material2/commit/f06fe11))
* **select:** add ability to customize the select trigger ([#3341](https://github.com/angular/material2/issues/3341)) ([72c5d39](https://github.com/angular/material2/commit/72c5d39)), closes [#2275](https://github.com/angular/material2/issues/2275)
* **select:** allow disabling ripples for options ([#5967](https://github.com/angular/material2/issues/5967)) ([34ec068](https://github.com/angular/material2/commit/34ec068))
* **select:** allow focusing items by typing ([#2907](https://github.com/angular/material2/issues/2907)) ([5ebca5e](https://github.com/angular/material2/commit/5ebca5e)), closes [#2668](https://github.com/angular/material2/issues/2668)
* **select:** implement compareWith for custom comparison ([#4540](https://github.com/angular/material2/issues/4540)) ([054ea4d](https://github.com/angular/material2/commit/054ea4d)), closes [#2250](https://github.com/angular/material2/issues/2250) [#2785](https://github.com/angular/material2/issues/2785)
* **select:** support basic usage without [@angular](https://github.com/angular)/forms ([#5871](https://github.com/angular/material2/issues/5871)) ([9a90eaf](https://github.com/angular/material2/commit/9a90eaf))
* **selection-list:** Selection-list initial version ([#5562](https://github.com/angular/material2/issues/5562)) ([dccce1c](https://github.com/angular/material2/commit/dccce1c))
* **snack-bar:** inject data and MdSnackBarRef into custom snack-bar component ([#5383](https://github.com/angular/material2/issues/5383)) ([baba6ef](https://github.com/angular/material2/commit/baba6ef)), closes [#5371](https://github.com/angular/material2/issues/5371)
* **tab-nav-bar:** allow disabling ripples for links ([#6273](https://github.com/angular/material2/issues/6273)) ([4ae1b0f](https://github.com/angular/material2/commit/4ae1b0f)), closes [#6245](https://github.com/angular/material2/issues/6245)
* **table:** support dynamic column definitions ([#5545](https://github.com/angular/material2/issues/5545)) ([66e222f](https://github.com/angular/material2/commit/66e222f))
* **tabs:** add isActive flag on the individual tabs ([#6424](https://github.com/angular/material2/issues/6424)) ([4d36ee0](https://github.com/angular/material2/commit/4d36ee0)), closes [#6422](https://github.com/angular/material2/issues/6422)
* add change emitters to the Intl providers ([#5867](https://github.com/angular/material2/issues/5867)) ([0a5489f](https://github.com/angular/material2/commit/0a5489f)), closes [#5738](https://github.com/angular/material2/issues/5738)
* **tabs:** add theming and ability to set background color ([#5287](https://github.com/angular/material2/issues/5287)) ([374aaff](https://github.com/angular/material2/commit/374aaff))
* **typography:** allow font-family to be set per typography level ([#5905](https://github.com/angular/material2/issues/5905)) ([3b41c0c](https://github.com/angular/material2/commit/3b41c0c)), closes [#5563](https://github.com/angular/material2/issues/5563)
* **typography:** allow typography config to be passed via mat-core ([#5625](https://github.com/angular/material2/issues/5625)) ([72148c0](https://github.com/angular/material2/commit/72148c0)), closes [#5589](https://github.com/angular/material2/issues/5589)
* expose version object in releases ([#4962](https://github.com/angular/material2/issues/4962)) ([3bfe7f0](https://github.com/angular/material2/commit/3bfe7f0))
* rename cdk/keyboard -> keycodes & cdk/observe-content -> observers ([#6039](https://github.com/angular/material2/issues/6039)) ([9df292f](https://github.com/angular/material2/commit/9df292f))
* update to Angular 4.3 ([#6483](https://github.com/angular/material2/issues/6483)) ([66da597](https://github.com/angular/material2/commit/66da597))


### Bug Fixes

* **autocomplete:** attach overlay to a more accurate input element ([#6282](https://github.com/angular/material2/issues/6282)) ([667a4e4](https://github.com/angular/material2/commit/667a4e4))
* **autocomplete:** don't darken select option ([#6425](https://github.com/angular/material2/issues/6425)) ([67e91a3](https://github.com/angular/material2/commit/67e91a3)), closes [#6407](https://github.com/angular/material2/issues/6407)
* **autocomplete:** don't prevent default enter action if panel is closed ([#5977](https://github.com/angular/material2/issues/5977)) ([fdded66](https://github.com/angular/material2/commit/fdded66)), closes [#5976](https://github.com/angular/material2/issues/5976)
* **autocomplete:** error when closing destroyed panel ([#5446](https://github.com/angular/material2/issues/5446)) ([880e6d5](https://github.com/angular/material2/commit/880e6d5)), closes [#5413](https://github.com/angular/material2/issues/5413)
* **autocomplete:** highlighted option not reset when closed with escape or enter key ([#6403](https://github.com/angular/material2/issues/6403)) ([bf59468](https://github.com/angular/material2/commit/bf59468)), closes [#6258](https://github.com/angular/material2/issues/6258)
* **autocomplete:** panel not resetting properly in certain scenarios ([#5911](https://github.com/angular/material2/issues/5911)) ([ebb5e9e](https://github.com/angular/material2/commit/ebb5e9e)), closes [#5910](https://github.com/angular/material2/issues/5910)
* **autocomplete:** placeholder not animating on focus ([#3992](https://github.com/angular/material2/issues/3992)) ([ff54969](https://github.com/angular/material2/commit/ff54969)), closes [#5755](https://github.com/angular/material2/issues/5755)
* **autocomplete:** placeholder not resetting properly ([#6141](https://github.com/angular/material2/issues/6141)) ([e4e7ee9](https://github.com/angular/material2/commit/e4e7ee9))
* **autocomplete,datepicker,menu:** closing parent dialog by pressing escape ([#6226](https://github.com/angular/material2/issues/6226)) ([916d1f3](https://github.com/angular/material2/commit/916d1f3)), closes [#6223](https://github.com/angular/material2/issues/6223)
* **autosize:** properly detect line-height in firefox ([#6190](https://github.com/angular/material2/issues/6190)) ([3a766f1](https://github.com/angular/material2/commit/3a766f1)), closes [#6179](https://github.com/angular/material2/issues/6179)
* **bidi:** make `dir` and `changes` readonly ([#5645](https://github.com/angular/material2/issues/5645)) ([8c13325](https://github.com/angular/material2/commit/8c13325))
* **button-toggle:** add aria-label for button-toggle ([#5919](https://github.com/angular/material2/issues/5919)) ([eabe2cb](https://github.com/angular/material2/commit/eabe2cb))
* **button-toggle:** button-toggle module depends on forms module ([#5542](https://github.com/angular/material2/issues/5542)) ([9ab0c90](https://github.com/angular/material2/commit/9ab0c90))
* **button-toggle:** remove emit change event when value changes ([#6034](https://github.com/angular/material2/issues/6034)) ([f8c5be8](https://github.com/angular/material2/commit/f8c5be8))
* **card:** prevent content from overlapping footer ([#5583](https://github.com/angular/material2/issues/5583)) ([a394418](https://github.com/angular/material2/commit/a394418)), closes [#5486](https://github.com/angular/material2/issues/5486)
* **card:** unable to bind to align attribute ([#5495](https://github.com/angular/material2/issues/5495)) ([243b97d](https://github.com/angular/material2/commit/243b97d)), closes [#5490](https://github.com/angular/material2/issues/5490)
* **checkbox:** Add RequiredTrue validator for md-checkbox ([#6006](https://github.com/angular/material2/issues/6006)) ([59319d0](https://github.com/angular/material2/commit/59319d0))
* **checkbox:** remove checkmark from tab order ([#6137](https://github.com/angular/material2/issues/6137)) ([735ffb5](https://github.com/angular/material2/commit/735ffb5)), closes [#6125](https://github.com/angular/material2/issues/6125)
* **checkbox:** server-side rendering error when checking textContent ([#5470](https://github.com/angular/material2/issues/5470)) ([0314bd8](https://github.com/angular/material2/commit/0314bd8)), closes [#5453](https://github.com/angular/material2/issues/5453)
* **checkbox, radio:** setting id to null causes invalid id for input ([#5398](https://github.com/angular/material2/issues/5398)) ([bcf4826](https://github.com/angular/material2/commit/bcf4826)), closes [#5394](https://github.com/angular/material2/issues/5394)
* **chips:** add exportAs for chip and chip list ([#6084](https://github.com/angular/material2/issues/6084)) ([e7da1e4](https://github.com/angular/material2/commit/e7da1e4)), closes [#6070](https://github.com/angular/material2/issues/6070)
* **chips:** cursor on remove button and box-shadow transition ([#6019](https://github.com/angular/material2/issues/6019)) ([8253503](https://github.com/angular/material2/commit/8253503))
* **chips:** invalid aria-selected value for non-selectable chip ([#6544](https://github.com/angular/material2/issues/6544)) ([90fc300](https://github.com/angular/material2/commit/90fc300))
* **chips:** mark onFocus as internal ([#6519](https://github.com/angular/material2/issues/6519)) ([449ed19](https://github.com/angular/material2/commit/449ed19))
* **chips:** not visible in high contrast mode ([#5338](https://github.com/angular/material2/issues/5338)) ([a5a8ff2](https://github.com/angular/material2/commit/a5a8ff2))
* **chips:** remove background from unstyled chip ([#5777](https://github.com/angular/material2/issues/5777)) ([0f7be2e](https://github.com/angular/material2/commit/0f7be2e))
* **compat:** add camelCase selectors to tab label wrapper ([#5955](https://github.com/angular/material2/issues/5955)) ([a7e75da](https://github.com/angular/material2/commit/a7e75da))
* **compat:** add element selector for cdk-accordion ([#5954](https://github.com/angular/material2/issues/5954)) ([3c46001](https://github.com/angular/material2/commit/3c46001))
* **connected-position-strategy:** position change event not emitting for fallback positions ([#5978](https://github.com/angular/material2/issues/5978)) ([63505dc](https://github.com/angular/material2/commit/63505dc))
* **datepicker:** allow disabling calendar popup ([#5305](https://github.com/angular/material2/issues/5305)) ([2294ea2](https://github.com/angular/material2/commit/2294ea2))
* **datepicker:** better support for input and change events ([#4826](https://github.com/angular/material2/issues/4826)) ([35eb294](https://github.com/angular/material2/commit/35eb294))
* **datepicker:** center date text properly on android ([#5923](https://github.com/angular/material2/issues/5923)) ([bbadd01](https://github.com/angular/material2/commit/bbadd01))
* **datepicker:** deprecate selectedChanged output ([#6025](https://github.com/angular/material2/issues/6025)) ([ee73d2c](https://github.com/angular/material2/commit/ee73d2c)), closes [#6000](https://github.com/angular/material2/issues/6000)
* **datepicker:** fix error when selecting month with fewer days in year ([#6129](https://github.com/angular/material2/issues/6129)) ([9cff8c7](https://github.com/angular/material2/commit/9cff8c7))
* **datepicker:** force Intl.DateTimeFormat to use UTC time zone ... ([#5747](https://github.com/angular/material2/issues/5747)) ([76cc6f0](https://github.com/angular/material2/commit/76cc6f0))
* **datepicker:** make height of calendar constant in non-touch mode ([#5694](https://github.com/angular/material2/issues/5694)) ([5bcba85](https://github.com/angular/material2/commit/5bcba85))
* **datepicker:** make touch UI calendar use 80% of width in portrait ([#5943](https://github.com/angular/material2/issues/5943)) ([641a38f](https://github.com/angular/material2/commit/641a38f))
* **datepicker:** mark input tocuhed on calendar date selected ([#6007](https://github.com/angular/material2/issues/6007)) ([21e9768](https://github.com/angular/material2/commit/21e9768))
* **datepicker:** refactor datepicker toggle to support theming ([#5317](https://github.com/angular/material2/issues/5317)) ([4255476](https://github.com/angular/material2/commit/4255476))
* **datepicker:** remove aria-expanded on datepicker input ... ([#5746](https://github.com/angular/material2/issues/5746)) ([4ea4baa](https://github.com/angular/material2/commit/4ea4baa))
* **datepicker:** remove toggle icon from tab order on IE ([#6405](https://github.com/angular/material2/issues/6405)) ([ea17d3d](https://github.com/angular/material2/commit/ea17d3d))
* **datepicker:** use 3 rows to display months of year (consistent with internal mocks) ([#5427](https://github.com/angular/material2/issues/5427)) ([da1d1ca](https://github.com/angular/material2/commit/da1d1ca)), closes [#5202](https://github.com/angular/material2/issues/5202)
* **datepicker:** use correct viewContainerRef for dialog. ([#6026](https://github.com/angular/material2/issues/6026)) ([08037f9](https://github.com/angular/material2/commit/08037f9))
* **datepicker:** validate that input actually parses ([#5711](https://github.com/angular/material2/issues/5711)) ([8bb54ca](https://github.com/angular/material2/commit/8bb54ca))
* **dialog:** add config option for aria-describedby ([#5365](https://github.com/angular/material2/issues/5365)) ([68241a8](https://github.com/angular/material2/commit/68241a8))
* **dialog:** better handling of custom ViewContainerRef with OnPush change detection ([#6164](https://github.com/angular/material2/issues/6164)) ([5967f6e](https://github.com/angular/material2/commit/5967f6e))
* **dialog:** move focus into container if no focusable elements are found ([#6524](https://github.com/angular/material2/issues/6524)) ([4e12072](https://github.com/angular/material2/commit/4e12072)), closes [#6513](https://github.com/angular/material2/issues/6513)
* **dialog:** prevent dialog from opening while another dialog is animating ([#5769](https://github.com/angular/material2/issues/5769)) ([36f708c](https://github.com/angular/material2/commit/36f708c)), closes [#5713](https://github.com/angular/material2/issues/5713)
* **dialog:** set margin on buttons inside md-dialog-actions ([#5778](https://github.com/angular/material2/issues/5778)) ([643023d](https://github.com/angular/material2/commit/643023d))
* **dialog:** support passing in dialog result through all MdDialogClose selectors ([#6293](https://github.com/angular/material2/issues/6293)) ([4a1f10e](https://github.com/angular/material2/commit/4a1f10e)), closes [#6278](https://github.com/angular/material2/issues/6278)
* **expansion:** use correct expanded line-height ([#5744](https://github.com/angular/material2/issues/5744)) ([a921948](https://github.com/angular/material2/commit/a921948))
* **expansion:** animation not working in Angular 4.3 ([#6442](https://github.com/angular/material2/issues/6442)) ([f9bd5d4](https://github.com/angular/material2/commit/f9bd5d4))
* **expansion:** only highlight keyboard-focused panel headers ([#6148](https://github.com/angular/material2/issues/6148)) ([49a0d7b](https://github.com/angular/material2/commit/49a0d7b))
* **expansion:** remove closed panel contents from tab order ([#5441](https://github.com/angular/material2/issues/5441)) ([1efa594](https://github.com/angular/material2/commit/1efa594)), closes [#5432](https://github.com/angular/material2/issues/5432)
* **expansion:** remove margin from top and bottom panels in accordion ([#6546](https://github.com/angular/material2/issues/6546)) ([7f0e58e](https://github.com/angular/material2/commit/7f0e58e))
* **expansion:** set up typography styles ([#5739](https://github.com/angular/material2/issues/5739)) ([e21b64c](https://github.com/angular/material2/commit/e21b64c))
* **expansion:** standalone panel shouldn't override margins ([#5962](https://github.com/angular/material2/issues/5962)) ([81f1f97](https://github.com/angular/material2/commit/81f1f97)), closes [#5949](https://github.com/angular/material2/issues/5949)
* **expansion:** toggle not being updated when set programmatically ([#5650](https://github.com/angular/material2/issues/5650)) ([41c804b](https://github.com/angular/material2/commit/41c804b)), closes [#5549](https://github.com/angular/material2/issues/5549) [#5623](https://github.com/angular/material2/issues/5623)
* **expansion:** wrong margins in rtl ([#5800](https://github.com/angular/material2/issues/5800)) ([106ded4](https://github.com/angular/material2/commit/106ded4))
* **grid-list:** figure not expanding to full width ([#6578](https://github.com/angular/material2/issues/6578)) ([ea143a0](https://github.com/angular/material2/commit/ea143a0)), closes [#6586](https://github.com/angular/material2/issues/6586)
* **grid-list:** invalid inline styles when rendering server-side ([#6052](https://github.com/angular/material2/issues/6052)) ([22ce1da](https://github.com/angular/material2/commit/22ce1da)), closes [#6048](https://github.com/angular/material2/issues/6048)
* **icon:** error when toggling icon with binding in IE11 ([#6102](https://github.com/angular/material2/issues/6102)) ([0795432](https://github.com/angular/material2/commit/0795432)), closes [#6093](https://github.com/angular/material2/issues/6093)
* **icon:** icon element not removed when svgIcon is reset ([#6502](https://github.com/angular/material2/issues/6502)) ([5e3228f](https://github.com/angular/material2/commit/5e3228f)), closes [#6495](https://github.com/angular/material2/issues/6495)
* **input:** add overflow:hidden when calculating autosize height ([#5773](https://github.com/angular/material2/issues/5773)) ([e0fc526](https://github.com/angular/material2/commit/e0fc526))
* **input:** don't highlight container when readonly input is focused ([#5776](https://github.com/angular/material2/issues/5776)) ([349121d](https://github.com/angular/material2/commit/349121d)), closes [#5749](https://github.com/angular/material2/issues/5749)
* **input:** fix input/placeholder alignment on safari ([#6072](https://github.com/angular/material2/issues/6072)) ([9ac5d13](https://github.com/angular/material2/commit/9ac5d13))
* **input:** input module depends on forms module ([#5579](https://github.com/angular/material2/issues/5579)) ([44ca46a](https://github.com/angular/material2/commit/44ca46a))
* **input:** invalid font declaration ([#5154](https://github.com/angular/material2/issues/5154)) ([92d8368](https://github.com/angular/material2/commit/92d8368)), closes [#5262](https://github.com/angular/material2/issues/5262)
* **input:** make sure 1-line hint is fully contained by input container. ([#5912](https://github.com/angular/material2/issues/5912)) ([ca3a3b8](https://github.com/angular/material2/commit/ca3a3b8))
* **input:** placeholder covering value when using OnPush ([#5660](https://github.com/angular/material2/issues/5660)) ([219a8ae](https://github.com/angular/material2/commit/219a8ae))
* **input:** prevent input caret from sticking on iOS ([#6128](https://github.com/angular/material2/issues/6128)) ([94bf5e9](https://github.com/angular/material2/commit/94bf5e9))
* **input:** prevent textarea from resizing beyond input container ([#5333](https://github.com/angular/material2/issues/5333)) ([36dc75a](https://github.com/angular/material2/commit/36dc75a))
* **input:** required asterisk being read out by screen readers ([#6277](https://github.com/angular/material2/issues/6277)) ([0850981](https://github.com/angular/material2/commit/0850981))
* **input:** set default width of 200px on input-container ([#5833](https://github.com/angular/material2/issues/5833)) ([e9ab9b4](https://github.com/angular/material2/commit/e9ab9b4))
* **input:** set proper role on md-error ([#6259](https://github.com/angular/material2/issues/6259)) ([3df4d72](https://github.com/angular/material2/commit/3df4d72))
* **input:** underline should only be thicker if focused ([#6152](https://github.com/angular/material2/issues/6152)) ([68e2f46](https://github.com/angular/material2/commit/68e2f46))
* **input:** update aria-describedby to also include errors ([#6239](https://github.com/angular/material2/issues/6239)) ([2af284c](https://github.com/angular/material2/commit/2af284c))
* **input,select:** align colors with spec ([#5155](https://github.com/angular/material2/issues/5155)) ([266f237](https://github.com/angular/material2/commit/266f237)), closes [#5114](https://github.com/angular/material2/issues/5114)
* **list:** :empty selector did not catch in mat-list-text ([#6124](https://github.com/angular/material2/issues/6124)) ([846899d](https://github.com/angular/material2/commit/846899d))
* **list:** properly align contents in subheader ([#6221](https://github.com/angular/material2/issues/6221)) ([4e6e42e](https://github.com/angular/material2/commit/4e6e42e)), closes [#6214](https://github.com/angular/material2/issues/6214)
* **list:** subheader margin being overwritten by typography ([#5652](https://github.com/angular/material2/issues/5652)) ([5bc97ec](https://github.com/angular/material2/commit/5bc97ec)), closes [#5639](https://github.com/angular/material2/issues/5639)
* **list-key-manager:** increase typeahead range to include more characters ([#6543](https://github.com/angular/material2/issues/6543)) ([1f4a962](https://github.com/angular/material2/commit/1f4a962))
* **list-key-manager:** typehead not handling non-English input ([#6463](https://github.com/angular/material2/issues/6463)) ([08a6673](https://github.com/angular/material2/commit/08a6673))
* **live-announcer:** remove announcer element on destroy ([#5404](https://github.com/angular/material2/issues/5404)) ([b7efe48](https://github.com/angular/material2/commit/b7efe48))
* **menu:** align appearance with spec ([#5361](https://github.com/angular/material2/issues/5361)) ([c20bec8](https://github.com/angular/material2/commit/c20bec8))
* **menu:** close child menus when parent is closed programmatically ([#6329](https://github.com/angular/material2/issues/6329)) ([66b1ff5](https://github.com/angular/material2/commit/66b1ff5))
* **menu:** complete close stream on destroy ([#5368](https://github.com/angular/material2/issues/5368)) ([d810138](https://github.com/angular/material2/commit/d810138))
* **menu:** make it easier to override elevation ([#5873](https://github.com/angular/material2/issues/5873)) ([6f5dcd5](https://github.com/angular/material2/commit/6f5dcd5)), closes [#5870](https://github.com/angular/material2/issues/5870)
* **menu:** prevent user from accidentally opening a sub-menu while animating ([#5996](https://github.com/angular/material2/issues/5996)) ([eaa6099](https://github.com/angular/material2/commit/eaa6099))
* **menu:** wrong animation in Angular 4.2+ ([#5836](https://github.com/angular/material2/issues/5836)) ([39c3e42](https://github.com/angular/material2/commit/39c3e42))
* **overlay:** add prefixed inputs, deprecate old ones ([#5957](https://github.com/angular/material2/issues/5957)) ([2bf6b57](https://github.com/angular/material2/commit/2bf6b57))
* **overlay:** error when removing empty string theme ([#6306](https://github.com/angular/material2/issues/6306)) ([faa7601](https://github.com/angular/material2/commit/faa7601))
* **overlay:** remove overlay container on destroy ([#5378](https://github.com/angular/material2/issues/5378)) ([154bb55](https://github.com/angular/material2/commit/154bb55))
* **paginator:** add type button to next / prev buttons ([5bd655b](https://github.com/angular/material2/commit/5bd655b))
* **paginator:** expose MdPaginatorIntl ([#5716](https://github.com/angular/material2/issues/5716)) ([93789cf](https://github.com/angular/material2/commit/93789cf)), closes [#5715](https://github.com/angular/material2/issues/5715)
* **paginator:** remove dependency on [@angular](https://github.com/angular)/forms ([#6080](https://github.com/angular/material2/issues/6080)) ([953b38e](https://github.com/angular/material2/commit/953b38e)), closes [#5717](https://github.com/angular/material2/issues/5717)
* **paginator:** underlying select vertical alignment ([#6354](https://github.com/angular/material2/issues/6354)) ([0d2ea10](https://github.com/angular/material2/commit/0d2ea10)), closes [#6338](https://github.com/angular/material2/issues/6338)
* **progress-spinner:** prevent users from tabbing into underlying SVG on IE ([#6142](https://github.com/angular/material2/issues/6142)) ([235f664](https://github.com/angular/material2/commit/235f664))
* **radio:** animation looking off on IE ([#5620](https://github.com/angular/material2/issues/5620)) ([d263ca2](https://github.com/angular/material2/commit/d263ca2))
* **radio:** forward focus to native input ([#6274](https://github.com/angular/material2/issues/6274)) ([cea4d9f](https://github.com/angular/material2/commit/cea4d9f))
* **radio-group:** coerce disabled property ([#5837](https://github.com/angular/material2/issues/5837)) ([23ec30f](https://github.com/angular/material2/commit/23ec30f))
* **select:** bigger height for underline on focus ([#5510](https://github.com/angular/material2/issues/5510)) ([78f0cec](https://github.com/angular/material2/commit/78f0cec)), closes [#5499](https://github.com/angular/material2/issues/5499)
* **select:** consistent error behavior to md-input-container ([#4754](https://github.com/angular/material2/issues/4754)) ([6f73b35](https://github.com/angular/material2/commit/6f73b35)), closes [#4611](https://github.com/angular/material2/issues/4611)
* **select:** disabled select being set to touched state on click ([#5328](https://github.com/angular/material2/issues/5328)) ([6b4f9c8](https://github.com/angular/material2/commit/6b4f9c8))
* **select:** don't shift option focus when multi-select value is changed programmatically ([#5401](https://github.com/angular/material2/issues/5401)) ([6422640](https://github.com/angular/material2/commit/6422640)), closes [#5381](https://github.com/angular/material2/issues/5381)
* **select:** error if triggerValue is accessed from an empty select ([#6575](https://github.com/angular/material2/issues/6575)) ([0526689](https://github.com/angular/material2/commit/0526689))
* **select:** floating label overlapping elements above select ([#6228](https://github.com/angular/material2/issues/6228)) ([a780052](https://github.com/angular/material2/commit/a780052)), closes [#6171](https://github.com/angular/material2/issues/6171)
* **select:** lint issue ([#6497](https://github.com/angular/material2/issues/6497)) ([1807c5b](https://github.com/angular/material2/commit/1807c5b))
* **select:** required asterisk should use warn color ([#5498](https://github.com/angular/material2/issues/5498)) ([97494f7](https://github.com/angular/material2/commit/97494f7)), closes [#5496](https://github.com/angular/material2/issues/5496)
* **select:** server-side rendering error with preselected value ([#6049](https://github.com/angular/material2/issues/6049)) ([2388d91](https://github.com/angular/material2/commit/2388d91)), closes [#6045](https://github.com/angular/material2/issues/6045)
* **select:** set aria-multiselectable for multi-select ([#6110](https://github.com/angular/material2/issues/6110)) ([ce31113](https://github.com/angular/material2/commit/ce31113))
* **select:** throwing additional errors if ngModel fails to initialize ([#5405](https://github.com/angular/material2/issues/5405)) ([372549c](https://github.com/angular/material2/commit/372549c)), closes [#5402](https://github.com/angular/material2/issues/5402)
* **select:** wrong option amount being read out by NVDA ([#5181](https://github.com/angular/material2/issues/5181)) ([b8c900c](https://github.com/angular/material2/commit/b8c900c))
* **select,autocomplete:** darken selected option ([#6302](https://github.com/angular/material2/issues/6302)) ([504b5df](https://github.com/angular/material2/commit/504b5df)), closes [#6229](https://github.com/angular/material2/issues/6229)
* **sidenav:** container not reacting to changes to sidenavs added after init ([#6161](https://github.com/angular/material2/issues/6161)) ([0d80a77](https://github.com/angular/material2/commit/0d80a77)), closes [#6127](https://github.com/angular/material2/issues/6127)
* **sidenav:** first animation not working in Angular 4.2+ ([#5821](https://github.com/angular/material2/issues/5821)) ([804f4c0](https://github.com/angular/material2/commit/804f4c0)), closes [#5673](https://github.com/angular/material2/issues/5673)
* **slide-toggle:** invalid model change event ([#4220](https://github.com/angular/material2/issues/4220)) ([dfe10c3](https://github.com/angular/material2/commit/dfe10c3)), closes [#4124](https://github.com/angular/material2/issues/4124)
* **slide-toggle:** slide-toggle module depends on forms module ([#5523](https://github.com/angular/material2/issues/5523)) ([d716b00](https://github.com/angular/material2/commit/d716b00))
* **slider:** fix change & input emit logic. ([#6234](https://github.com/angular/material2/issues/6234)) ([9d3c405](https://github.com/angular/material2/commit/9d3c405))
* **slider:** set proper font family on label ([#5772](https://github.com/angular/material2/issues/5772)) ([1cba2dc](https://github.com/angular/material2/commit/1cba2dc))
* **slider:** slider module depends on forms module ([#5578](https://github.com/angular/material2/issues/5578)) ([c14978b](https://github.com/angular/material2/commit/c14978b))
* **slider:** work around slidestart event sometimes not firing on iOS ([#6009](https://github.com/angular/material2/issues/6009)) ([a87a000](https://github.com/angular/material2/commit/a87a000))
* **snack-bar:** align theming with spec ([#6506](https://github.com/angular/material2/issues/6506)) ([363562f](https://github.com/angular/material2/commit/363562f))
* **snackbar:** make closeWithAction public method ([#5686](https://github.com/angular/material2/issues/5686)) ([f4f64ac](https://github.com/angular/material2/commit/f4f64ac))
* **table:** column class names should be css friendly ([#6173](https://github.com/angular/material2/issues/6173)) ([1748397](https://github.com/angular/material2/commit/1748397))
* **table:** eliminate need for second change detection ([#5775](https://github.com/angular/material2/issues/5775)) ([388494f](https://github.com/angular/material2/commit/388494f))
* **table:** Fix change det issue with http example ([#6169](https://github.com/angular/material2/issues/6169)) ([4afcc0a](https://github.com/angular/material2/commit/4afcc0a))
* **table:** set font family ([#5741](https://github.com/angular/material2/issues/5741)) ([5d5ce83](https://github.com/angular/material2/commit/5d5ce83))
* **tabs:** add module dependency on MdCommonModule ([#5304](https://github.com/angular/material2/issues/5304)) ([738b6be](https://github.com/angular/material2/commit/738b6be))
* **tabs:** allow for tabs to be selected using the space key ([#6426](https://github.com/angular/material2/issues/6426)) ([b5f4caf](https://github.com/angular/material2/commit/b5f4caf)), closes [#6406](https://github.com/angular/material2/issues/6406)
* **tabs:** check if the subscription is defined before unsubscribe ([#5667](https://github.com/angular/material2/issues/5667)) ([0eedb5f](https://github.com/angular/material2/commit/0eedb5f))
* **tabs:** improved vertical alignment of tab label ([#5771](https://github.com/angular/material2/issues/5771)) ([b105039](https://github.com/angular/material2/commit/b105039))
* **tabs:** server-side rendering error when aligning ink bar ([#5455](https://github.com/angular/material2/issues/5455)) ([448db8b](https://github.com/angular/material2/commit/448db8b))
* add camelCase ng-content selectors ([#5953](https://github.com/angular/material2/issues/5953)) ([f52c7f4](https://github.com/angular/material2/commit/f52c7f4))
* **theming:** Light green 700 contrast should be white ([#6346](https://github.com/angular/material2/issues/6346)) ([b4e2488](https://github.com/angular/material2/commit/b4e2488))
* deprecate CoreModule ([#6588](https://github.com/angular/material2/issues/6588)) ([377a3bb](https://github.com/angular/material2/commit/377a3bb))
* improved key manager typings ([#6443](https://github.com/angular/material2/issues/6443)) ([18c6dec](https://github.com/angular/material2/commit/18c6dec))
* remove ripples in high contrast mode ([#6355](https://github.com/angular/material2/issues/6355)) ([fd5e5ff](https://github.com/angular/material2/commit/fd5e5ff))
* **textarea:** server-side rendering error when using mdTextareaAutosize ([#6050](https://github.com/angular/material2/issues/6050)) ([05ca4a7](https://github.com/angular/material2/commit/05ca4a7)), closes [#6047](https://github.com/angular/material2/issues/6047)
* **theming:** remove non-standard grey palette hues ([#6605](https://github.com/angular/material2/issues/6605)) ([3b46360](https://github.com/angular/material2/commit/3b46360))
* **tooltip:** panel element blocks hover effects ([#5514](https://github.com/angular/material2/issues/5514)) ([d04230c](https://github.com/angular/material2/commit/d04230c)), closes [#4691](https://github.com/angular/material2/issues/4691)
* **tooltip:** remove native event listener on component destroy ([#5144](https://github.com/angular/material2/issues/5144)) ([32db2ba](https://github.com/angular/material2/commit/32db2ba)), closes [#4499](https://github.com/angular/material2/issues/4499)
* **tooltip:** remove unnecessary tooltip whitespace ([#6531](https://github.com/angular/material2/issues/6531)) ([6cdbf36](https://github.com/angular/material2/commit/6cdbf36))
* **xxx-intl:** replace misused EventEmitter with Subject ([#6313](https://github.com/angular/material2/issues/6313)) ([c20bcf9](https://github.com/angular/material2/commit/c20bcf9))


### Performance Improvements

* **observe-content:** run outside Angular zone ([#6352](https://github.com/angular/material2/issues/6352)) ([5ccf25d](https://github.com/angular/material2/commit/5ccf25d))
* **sidenav:** avoid recalculating the inline styles while sidenav is open ([#6189](https://github.com/angular/material2/issues/6189)) ([57a2f29](https://github.com/angular/material2/commit/57a2f29))
* **table:** cell references not being cleaned up on destroy ([#5809](https://github.com/angular/material2/issues/5809)) ([df1ddee](https://github.com/angular/material2/commit/df1ddee))
* **tabs:** avoid extra resize handler and reflow ([#6434](https://github.com/angular/material2/issues/6434)) ([1df79e9](https://github.com/angular/material2/commit/1df79e9))


<a name="2.0.0-beta.8"></a>
# [2.0.0-beta.8 plasma-abacus](https://github.com/angular/material2/compare/2.0.0-beta.7...2.0.0-beta.8) (2017-07-06)


### Highlights
* This version marks the release of `@angular/cdk` (component dev kit)! This package contains
general building blocks for UI components decoupled from the visuals of Material Design. In the
initial release, code from Angular Material's `core/` have been moved for `a11y/`, `bidi/`,
`coercion/`, `observe-content/`, `platform/`, `portal/`. The `@angular/material` package now
re-exports these symbols, marked as deprecated. The re-exports will be removed in a subsequent
release.
* Initial version of data-table component. There is both a `<cdk-table>` (the core) and the
`<md-table>` (with Material Design styles). See the documentation on material.angular.io for more
information.
* Initial version of `<md-paginator>` and `<md-sort-header>` components, which can be used either
with `<md-table>` or any other table.
* Both `@angular/material` and `@angular/cdk` are now strict null compliant.


### Breaking changes
* `@angular/material` now depends on `@angular/cdk` as a peer dependency.
* Some types have expanded to include `| null` or `| undefined` for strict null compatibility. If
your application uses strict null checks, you may have to update the types in your app to match up
with the more accurate types coming from Angular Material.
* Angular Material no longer adds RxJS operators to the prototype of `Observable`. If your app
depended on these operators being added by Angular Material, you will need to import them
explicitly.


### Bug Fixes

* **autocomplete:** allow number zero as value ([#5364](https://github.com/angular/material2/issues/5364)) ([9137fd9](https://github.com/angular/material2/commit/9137fd9)), closes [#5363](https://github.com/angular/material2/issues/5363)
* **autocomplete:** don't scroll panel when option is visible ([#4905](https://github.com/angular/material2/issues/4905)) ([d3af57d](https://github.com/angular/material2/commit/d3af57d))
* **autocomplete:** not closing when tapping away on mobile ([#5260](https://github.com/angular/material2/issues/5260)) ([1dcaca7](https://github.com/angular/material2/commit/1dcaca7))
* **autocomplete:** reopening when clicking an option in IE ([#5172](https://github.com/angular/material2/issues/5172)) ([fe31210](https://github.com/angular/material2/commit/fe31210)), closes [#5165](https://github.com/angular/material2/issues/5165)
* **autosize:** resize when form value changes. Fixes [#4657](https://github.com/angular/material2/issues/4657) ([#5315](https://github.com/angular/material2/issues/5315)) ([8c9c11a](https://github.com/angular/material2/commit/8c9c11a))
* **button-toggle:** fix standalone button toggle style ([#5121](https://github.com/angular/material2/issues/5121)) ([3d8c833](https://github.com/angular/material2/commit/3d8c833))
* **datepicker:** pass layout direction to touchUi dialog ([#5052](https://github.com/angular/material2/issues/5052)) ([8b6efb1](https://github.com/angular/material2/commit/8b6efb1))
* **datepicker:** use theme foreground color ([#5290](https://github.com/angular/material2/issues/5290)) ([51bf26e](https://github.com/angular/material2/commit/51bf26e))
* **dialog:** set aria-labelledby based on the md-dialog-title ([#5178](https://github.com/angular/material2/issues/5178)) ([aee984a](https://github.com/angular/material2/commit/aee984a))
* **directionality:** error on platform-server ([#5234](https://github.com/angular/material2/issues/5234)) ([49dfe60](https://github.com/angular/material2/commit/49dfe60))
* **input:** theming mixin error ([#5254](https://github.com/angular/material2/issues/5254)) ([37efb54](https://github.com/angular/material2/commit/37efb54)), closes [#5232](https://github.com/angular/material2/issues/5232)
* **input:** underline showing at end if text-align is set ([#5280](https://github.com/angular/material2/issues/5280)) ([5c9391d](https://github.com/angular/material2/commit/5c9391d)), closes [#5272](https://github.com/angular/material2/issues/5272)
* **memory:** Unsubscribe event listeners when using Observable.fromEvent ([#5325](https://github.com/angular/material2/issues/5325)) ([1b351cd](https://github.com/angular/material2/commit/1b351cd))
* **menu:** role being set on the wrong element ([#5191](https://github.com/angular/material2/issues/5191)) ([2239668](https://github.com/angular/material2/commit/2239668))
* **overlay:** remove webkit tap highlight from backdrop ([#5258](https://github.com/angular/material2/issues/5258)) ([8feddd4](https://github.com/angular/material2/commit/8feddd4))
* **select:** align first option to trigger when it is inside a group ([#5153](https://github.com/angular/material2/issues/5153)) ([d39cb12](https://github.com/angular/material2/commit/d39cb12))
* **select:** expose focus method ([#5255](https://github.com/angular/material2/issues/5255)) ([7b2d4ae](https://github.com/angular/material2/commit/7b2d4ae)), closes [#5251](https://github.com/angular/material2/issues/5251)
* **select:** md-optgroup not using typography styles ([#5193](https://github.com/angular/material2/issues/5193)) ([b5bf6f5](https://github.com/angular/material2/commit/b5bf6f5))
* **select:** page scrolling down when selecting option with space ([#5192](https://github.com/angular/material2/issues/5192)) ([2361385](https://github.com/angular/material2/commit/2361385))
* **snackbar:** clear timeout upon dismiss ([#4860](https://github.com/angular/material2/issues/4860)) ([146160c](https://github.com/angular/material2/commit/146160c))
* **tabs:** server-side rendering error ([#5348](https://github.com/angular/material2/issues/5348)) ([0174377](https://github.com/angular/material2/commit/0174377))
* **unique-selection-dispatcher:** remove listeners on destroy ([#5164](https://github.com/angular/material2/issues/5164)) ([f9bbbe7](https://github.com/angular/material2/commit/f9bbbe7))


### Features

* **data-table:** initial version. Too many commits to list.
* **directionality:** a provider to get directionality ([#4044](https://github.com/angular/material2/issues/4044)) ([61d979e](https://github.com/angular/material2/commit/61d979e)), closes [#3600](https://github.com/angular/material2/issues/3600)
* **input:** add custom error state matcher ([#4750](https://github.com/angular/material2/issues/4750)) ([f73cc97](https://github.com/angular/material2/commit/f73cc97))
* **pagination:** initial pagination component ([#5156](https://github.com/angular/material2/issues/5156)) ([85fb00a](https://github.com/angular/material2/commit/85fb00a))
* **sort:** add ability to manage and display sorting ([#5307](https://github.com/angular/material2/issues/5307)) ([b328d36](https://github.com/angular/material2/commit/b328d36))
* **tab-nav-bar:** support disabling tab links ([#5257](https://github.com/angular/material2/issues/5257)) ([fc809ed](https://github.com/angular/material2/commit/fc809ed)), closes [#5208](https://github.com/angular/material2/issues/5208)
* add support for strict null checks ([#5094](https://github.com/angular/material2/issues/5094)) ([2bf7024](https://github.com/angular/material2/commit/2bf7024))
* remove uses of rxjs patch operators ([#5314](https://github.com/angular/material2/issues/5314)) ([e488e3f](https://github.com/angular/material2/commit/e488e3f)), closes [#2622](https://github.com/angular/material2/issues/2622)
* move a11y, bidi, platform, rxjs, and portal to cdk ([#5386](https://github.com/angular/material2/issues/5386)) ([fde35e4](https://github.com/angular/material2/commit/fde35e4))
* move observe-content to cdk ([#5438](https://github.com/angular/material2/issues/5438)) ([b00f838](https://github.com/angular/material2/commit/b00f838))



<a name="2.0.0-beta.7"></a>
# [2.0.0-beta.7 glass-delicatessen](https://github.com/angular/material2/compare/2.0.0-beta.6...2.0.0-beta.7) (2017-06-19)

### Highlights
* New md-expansion-panel and md-accordion components! Documentation for these will be coming soon.
* New typography extension to the theming API!
* Angular Material should generally work much better with @angular/platform-server. There are still
a few bugs, but things should mostly work.


### Bug Fixes

* **autocomplete:** handle escape key ([#4703](https://github.com/angular/material2/issues/4703)) ([9e2a66c](https://github.com/angular/material2/commit/9e2a66c))
* **autocomplete:** show hover style on selected options ([#4724](https://github.com/angular/material2/issues/4724)) ([b3b6fda](https://github.com/angular/material2/commit/b3b6fda))
* **autocomplete:** throw better error when autocomplete doesn't have a panel ([#4851](https://github.com/angular/material2/issues/4851)) ([70b31f1](https://github.com/angular/material2/commit/70b31f1)), closes [#4844](https://github.com/angular/material2/issues/4844)
* **button:** remove webkit tap highlight ([#4953](https://github.com/angular/material2/issues/4953)) ([3ad80e4](https://github.com/angular/material2/commit/3ad80e4))
* **button-toggle:** remove redundant blocking touchstart listener ([#4947](https://github.com/angular/material2/issues/4947)) ([1e92545](https://github.com/angular/material2/commit/1e92545)), closes [#4221](https://github.com/angular/material2/issues/4221)
* **button, tabs:** potential clash with typography styles ([#4915](https://github.com/angular/material2/issues/4915)) ([615fa2a](https://github.com/angular/material2/commit/615fa2a))
* **checkbox:** margin for empty checkboxes incorrectly added ([#4730](https://github.com/angular/material2/issues/4730)) ([8d9bbbf](https://github.com/angular/material2/commit/8d9bbbf)), closes [#4720](https://github.com/angular/material2/issues/4720)
* **checkbox, radio:** fix checkbox label not read in JAWS ([#4610](https://github.com/angular/material2/issues/4610)) ([5c48949](https://github.com/angular/material2/commit/5c48949))
* **datepicker:** focus trap not working inside popup ([#4839](https://github.com/angular/material2/issues/4839)) ([157bda1](https://github.com/angular/material2/commit/157bda1))
* **datepicker:** generate api docs ([#4756](https://github.com/angular/material2/issues/4756)) ([be8d3b2](https://github.com/angular/material2/commit/be8d3b2))
* **datepicker:** inert calendar arrow direction in rtl ([#4960](https://github.com/angular/material2/issues/4960)) ([22f0ea0](https://github.com/angular/material2/commit/22f0ea0))
* **datepicker:** minValidator & maxValidation false errors ([#4649](https://github.com/angular/material2/issues/4649)) ([b2c3ed0](https://github.com/angular/material2/commit/b2c3ed0))
* **datepicker:** restore focus to trigger element ([#4804](https://github.com/angular/material2/issues/4804)) ([8860090](https://github.com/angular/material2/commit/8860090))
* **datepicker:** switch to typography api ([#4950](https://github.com/angular/material2/issues/4950)) ([7f298f7](https://github.com/angular/material2/commit/7f298f7))
* **dialog:** add flex wrap to style ([#4846](https://github.com/angular/material2/issues/4846)) ([9d4a34a](https://github.com/angular/material2/commit/9d4a34a))
* **dialog:** blurry content and slow animation in IE ([#4809](https://github.com/angular/material2/issues/4809)) ([c8b1e20](https://github.com/angular/material2/commit/c8b1e20))
* **dialog:** componentInstance unavailable in afterClose ([#4827](https://github.com/angular/material2/issues/4827)) ([cedf219](https://github.com/angular/material2/commit/cedf219)), closes [#4815](https://github.com/angular/material2/issues/4815)
* **dialog:** invalid text color in dark themes ([#4849](https://github.com/angular/material2/issues/4849)) ([3e993b6](https://github.com/angular/material2/commit/3e993b6))
* **dialog:** partial keyframes animation error ([#5020](https://github.com/angular/material2/issues/5020)) ([9c45865](https://github.com/angular/material2/commit/9c45865)), closes [#5019](https://github.com/angular/material2/issues/5019)
* **focus-trap:** focus initial element when zone stabilizes ([#4867](https://github.com/angular/material2/issues/4867)) ([ce9d253](https://github.com/angular/material2/commit/ce9d253)), closes [#4864](https://github.com/angular/material2/issues/4864)
* **icon:** remove automatic aria labelling and add a11y guidance ([#4665](https://github.com/angular/material2/issues/4665)) ([657f0e8](https://github.com/angular/material2/commit/657f0e8))
* **input:** correct invalid colors ([#4771](https://github.com/angular/material2/issues/4771)) ([2103907](https://github.com/angular/material2/commit/2103907))
* **input:** IE always adding scrollbar to textarea ([#4917](https://github.com/angular/material2/issues/4917)) ([6aaddbf](https://github.com/angular/material2/commit/6aaddbf))
* **input:** make input spacing match spec ([#4788](https://github.com/angular/material2/issues/4788)) ([16b65e8](https://github.com/angular/material2/commit/16b65e8))
* **input:** set aria-invalid on mdInput element ([#4757](https://github.com/angular/material2/issues/4757)) ([0c03946](https://github.com/angular/material2/commit/0c03946))
* **input:** remove align input binding ([#5141](https://github.com/angular/material2/issues/5141)) ([0aaeb69](https://github.com/angular/material2/commit/0aaeb69)), closes [#5140](https://github.com/angular/material2/issues/5140)
* **input, cdk:** a couple of server-side rendering errors ([#5066](https://github.com/angular/material2/issues/5066)) ([97e35df](https://github.com/angular/material2/commit/97e35df))
* **list:** set aria attributes to md-divider ([#4925](https://github.com/angular/material2/issues/4925)) ([a240c9c](https://github.com/angular/material2/commit/a240c9c))
* **menu:** remove classes from inert element ([#4800](https://github.com/angular/material2/issues/4800)) ([93a21c7](https://github.com/angular/material2/commit/93a21c7)), closes [#4484](https://github.com/angular/material2/issues/4484)
* **navbar:** update ink bar when links change ([#4897](https://github.com/angular/material2/issues/4897)) ([41c43cc](https://github.com/angular/material2/commit/41c43cc))
* **overlay:** emit attach and detach at appropriate times ([#4880](https://github.com/angular/material2/issues/4880)) ([e98372e](https://github.com/angular/material2/commit/e98372e)), closes [#4871](https://github.com/angular/material2/issues/4871)
* **portal:** detect changes for portal hostview  while before attaching. ([#4370](https://github.com/angular/material2/issues/4370)) ([28d2ddd](https://github.com/angular/material2/commit/28d2ddd))
* **radio:** label vertical alignment ([#5120](https://github.com/angular/material2/issues/5120)) ([d3d6d26](https://github.com/angular/material2/commit/d3d6d26))
* **radio:** make MdRadioButton change detection strategy OnPush ([#2526](https://github.com/angular/material2/issues/2526)) ([97a9bdc](https://github.com/angular/material2/commit/97a9bdc))
* **select:** consider value changes via arrow keys on closed select as user actions ([#5112](https://github.com/angular/material2/issues/5112)) ([73aa43e](https://github.com/angular/material2/commit/73aa43e)), closes [#5084](https://github.com/angular/material2/issues/5084)
* **select:** panel in multiple mode not overlapping trigger ([#4952](https://github.com/angular/material2/issues/4952)) ([638a34a](https://github.com/angular/material2/commit/638a34a)), closes [#4943](https://github.com/angular/material2/issues/4943)
* **select:** unable to programmatically select falsy values ([#4868](https://github.com/angular/material2/issues/4868)) ([2e3910c](https://github.com/angular/material2/commit/2e3910c)), closes [#4854](https://github.com/angular/material2/issues/4854)
* **sidenav:** don't restore focus if focus isn't inside sidenav ([#4578](https://github.com/angular/material2/issues/4578)) ([3bc82f6](https://github.com/angular/material2/commit/3bc82f6))
* **slide-toggle:** switch typography level to body-1 ([#5000](https://github.com/angular/material2/issues/5000)) ([436858e](https://github.com/angular/material2/commit/436858e))
* **snack-bar:** test error in IE ([#5048](https://github.com/angular/material2/issues/5048)) ([79092bd](https://github.com/angular/material2/commit/79092bd))
* **tabs:** fix tab translation animation in IE 11 ([#4982](https://github.com/angular/material2/issues/4982)) ([#4986](https://github.com/angular/material2/issues/4986)) ([40f92c5](https://github.com/angular/material2/commit/40f92c5))
* **tooltip:** not rendering in IE and Edge without web animations polyfill ([#4937](https://github.com/angular/material2/issues/4937)) ([22746ce](https://github.com/angular/material2/commit/22746ce)), closes [#4935](https://github.com/angular/material2/issues/4935)
* make material work with noUnusedParameters ([#4946](https://github.com/angular/material2/issues/4946)) ([4b98f21](https://github.com/angular/material2/commit/4b98f21)), closes [#4443](https://github.com/angular/material2/issues/4443)


### Features

* **autocomplete:** extend selector to match textarea ([#4945](https://github.com/angular/material2/issues/4945)) ([223a27b](https://github.com/angular/material2/commit/223a27b))
* **datepicker:** popup positioning improvements ([#4696](https://github.com/angular/material2/issues/4696)) ([eadccc2](https://github.com/angular/material2/commit/eadccc2)), closes [#4406](https://github.com/angular/material2/issues/4406)
* **dialog:** allow disableClose option to be updated ([#4964](https://github.com/angular/material2/issues/4964)) ([66629cf](https://github.com/angular/material2/commit/66629cf)), closes [#3938](https://github.com/angular/material2/issues/3938)
* **dialog:** allow setting the layout direction ([#4778](https://github.com/angular/material2/issues/4778)) ([4658c85](https://github.com/angular/material2/commit/4658c85))
* **dialog:** custom class option [#4718](https://github.com/angular/material2/issues/4718) [#4012](https://github.com/angular/material2/issues/4012) ([#4722](https://github.com/angular/material2/issues/4722)) ([28c936f](https://github.com/angular/material2/commit/28c936f))
* **expansion-panel:** introduce expansion panel ([cac7610](https://github.com/angular/material2/commit/cac7610))
* **input:** autosize sets default amount of rows to one ([#4906](https://github.com/angular/material2/issues/4906)) ([1055720](https://github.com/angular/material2/commit/1055720)), closes [#4852](https://github.com/angular/material2/issues/4852)
* add camelCase selectors where they were missing ([#4901](https://github.com/angular/material2/issues/4901)) ([3eb0681](https://github.com/angular/material2/commit/3eb0681))
* integrate typography api into all components ([#4375](https://github.com/angular/material2/issues/4375)) ([e650b04](https://github.com/angular/material2/commit/e650b04))
* **overlay:** more flexible scroll strategy API and ability to define/override custom strategies ([#4855](https://github.com/angular/material2/issues/4855)) ([7e91270](https://github.com/angular/material2/commit/7e91270))
* **placeholder:** add global placeholder options ([#4681](https://github.com/angular/material2/issues/4681)) ([#4681](https://github.com/angular/material2/issues/4681)) ([d0d79fd](https://github.com/angular/material2/commit/d0d79fd)), closes [#4311](https://github.com/angular/material2/issues/4311)
* **radio:** support for color binding ([#5068](https://github.com/angular/material2/issues/5068)) ([82d752b](https://github.com/angular/material2/commit/82d752b)), closes [#4677](https://github.com/angular/material2/issues/4677)
* **select:** add input for adding classes to the panel ([#4629](https://github.com/angular/material2/issues/4629)) ([99293d9](https://github.com/angular/material2/commit/99293d9)), closes [#4485](https://github.com/angular/material2/issues/4485)
* **select:** add md-optgroup component ([#4432](https://github.com/angular/material2/issues/4432)) ([d09aa89](https://github.com/angular/material2/commit/d09aa89)), closes [#3182](https://github.com/angular/material2/issues/3182)
* **tooltip:** add mdTooltipClass for customizing ([#4893](https://github.com/angular/material2/issues/4893)) ([734eccc](https://github.com/angular/material2/commit/734eccc))


### BREAKING CHANGES

* **input:** The `align` input from the `<md-input-container>` component has been removed. Developers instead should use plain CSS to achieve the same effect (using `text-align: end` for example).



<a name="2.0.0-beta.6"></a>
# [2.0.0-beta.6 amber-ansible](https://github.com/angular/material2/compare/2.0.0-beta.5...2.0.0-beta.6) (2017-05-25)


### Bug Fixes

* **autocomplete:** error when clicking outside instance without mdInput ([#4573](https://github.com/angular/material2/issues/4573)) ([e6f7ace](https://github.com/angular/material2/commit/e6f7ace)), closes [#4555](https://github.com/angular/material2/issues/4555)
* **autocomplete:** restore focus to input when click on option ([#4702](https://github.com/angular/material2/issues/4702)) ([eecf897](https://github.com/angular/material2/commit/eecf897)), closes [#4645](https://github.com/angular/material2/issues/4645)
* **block-scroll-strategy:** collapsing root node when enabled ([#4638](https://github.com/angular/material2/issues/4638)) ([f11d46e](https://github.com/angular/material2/commit/f11d46e))
* **button:** complete ripple when button becomes disabled ([#4372](https://github.com/angular/material2/issues/4372)) ([fce2868](https://github.com/angular/material2/commit/fce2868))
* **button:** ripples blocking mouse events on user content ([#4526](https://github.com/angular/material2/issues/4526)) ([9c4d601](https://github.com/angular/material2/commit/9c4d601))
* **checkbox, radio:** make disabled label disabled match spec color ([#4507](https://github.com/angular/material2/issues/4507)) ([8159fcc](https://github.com/angular/material2/commit/8159fcc))
* **chips:** unable to tab out of chip list ([#4605](https://github.com/angular/material2/issues/4605)) ([07a82ed](https://github.com/angular/material2/commit/07a82ed)), closes [#4593](https://github.com/angular/material2/issues/4593)
* **datepicker:** calendar toggle submitting parent form ([#4531](https://github.com/angular/material2/issues/4531)) ([84ea8b2](https://github.com/angular/material2/commit/84ea8b2)), closes [#4530](https://github.com/angular/material2/issues/4530)
* **datepicker:** export MD_DATE_FORMATS and MD_NATIVE_DATE_FORMATS ([#4541](https://github.com/angular/material2/issues/4541)) ([58c252f](https://github.com/angular/material2/commit/58c252f)), closes [#4534](https://github.com/angular/material2/issues/4534)
* **datepicker:** make datepicker work in compatibility mode ([#4686](https://github.com/angular/material2/issues/4686)) ([b5b762a](https://github.com/angular/material2/commit/b5b762a))
* **datepicker:** set cursor on clickable elements ([#4542](https://github.com/angular/material2/issues/4542)) ([d2d67f5](https://github.com/angular/material2/commit/d2d67f5)), closes [#4533](https://github.com/angular/material2/issues/4533)
* **datepicker:** use default cursor on toggle when disabled ([#4604](https://github.com/angular/material2/issues/4604)) ([1319355](https://github.com/angular/material2/commit/1319355))
* **dialog:** enable smooth scrolling on md-dialog-content ([#4608](https://github.com/angular/material2/issues/4608)) ([3ae0dc6](https://github.com/angular/material2/commit/3ae0dc6))
* **focus-origin:** missing rxjs of operator ([#4497](https://github.com/angular/material2/issues/4497)) ([05dbb90](https://github.com/angular/material2/commit/05dbb90))
* **icon:** handle icons as <symbol> nodes ([#4699](https://github.com/angular/material2/issues/4699)) ([3212411](https://github.com/angular/material2/commit/3212411)), closes [#4680](https://github.com/angular/material2/issues/4680)
* **input:** continue checking for input child after initialization ([#4569](https://github.com/angular/material2/issues/4569)) ([73d6814](https://github.com/angular/material2/commit/73d6814)), closes [#4551](https://github.com/angular/material2/issues/4551)
* **input:** thicken underline in error state, add underline animation ([#4506](https://github.com/angular/material2/issues/4506)) ([0666207](https://github.com/angular/material2/commit/0666207))
* **list-key-manager:** remove handling for home and end keys ([#4544](https://github.com/angular/material2/issues/4544)) ([2d16345](https://github.com/angular/material2/commit/2d16345)), closes [#3496](https://github.com/angular/material2/issues/3496)
* **menu:** close menu panel on escape ([#4666](https://github.com/angular/material2/issues/4666)) ([210e57c](https://github.com/angular/material2/commit/210e57c)), closes [#3601](https://github.com/angular/material2/issues/3601)
* **overlay:** overlays potentially being rendered behind browser UI ([#4664](https://github.com/angular/material2/issues/4664)) ([96549e8](https://github.com/angular/material2/commit/96549e8)), closes [#4650](https://github.com/angular/material2/issues/4650)
* **platform:** don't shadow `window` ([#4622](https://github.com/angular/material2/issues/4622)) ([e8ab0da](https://github.com/angular/material2/commit/e8ab0da))
* **progress-bar:** buffer animation not working on user-generated themes ([#4525](https://github.com/angular/material2/issues/4525)) ([61f3987](https://github.com/angular/material2/commit/61f3987))
* **select:** allow option with undefined or null value to clear selection ([#3141](https://github.com/angular/material2/issues/3141)) ([13524c1](https://github.com/angular/material2/commit/13524c1)), closes [#3110](https://github.com/angular/material2/issues/3110) [#2634](https://github.com/angular/material2/issues/2634)
* **select:** deselect old options when programmatically setting value ([#4658](https://github.com/angular/material2/issues/4658)) ([db72b06](https://github.com/angular/material2/commit/db72b06))
* **select:** option text color blending in with background on dark theme ([#4568](https://github.com/angular/material2/issues/4568)) ([43e207c](https://github.com/angular/material2/commit/43e207c)), closes [#4560](https://github.com/angular/material2/issues/4560)
* **slider:** add aria-orientation ([#4602](https://github.com/angular/material2/issues/4602)) ([0b5b624](https://github.com/angular/material2/commit/0b5b624))
* **slider:** make slider work with dark themes ([#4489](https://github.com/angular/material2/issues/4489)) ([af48bb0](https://github.com/angular/material2/commit/af48bb0))
* **snack-bar:** remove text-transform uppercase ([#4567](https://github.com/angular/material2/issues/4567)) ([82e53c5](https://github.com/angular/material2/commit/82e53c5))
* **tabs:** dynamic tab scrollbar showing while animating ([#4524](https://github.com/angular/material2/issues/4524)) ([2a15cd7](https://github.com/angular/material2/commit/2a15cd7))
* **tooltip:** not using trigger's text direction ([#4413](https://github.com/angular/material2/issues/4413)) ([d8aeeaa](https://github.com/angular/material2/commit/d8aeeaa)), closes [#4411](https://github.com/angular/material2/issues/4411)
* **universal:** gate platform checks on being on browser ([#4635](https://github.com/angular/material2/issues/4635)) ([e4c7601](https://github.com/angular/material2/commit/e4c7601))


### Features

* **core:** expose ScrollDispatchModule ([#4501](https://github.com/angular/material2/issues/4501)) ([caee5a5](https://github.com/angular/material2/commit/caee5a5))
* **dialog:** add `result` to MdDialogClose directive ([#4332](https://github.com/angular/material2/issues/4332)) ([c45dee2](https://github.com/angular/material2/commit/c45dee2))
* **focus-trap:** allow setting initially focused element ([#4577](https://github.com/angular/material2/issues/4577)) ([c946631](https://github.com/angular/material2/commit/c946631))
* **overlay:** add scroll blocking strategy ([#4500](https://github.com/angular/material2/issues/4500)) ([6842046](https://github.com/angular/material2/commit/6842046))
* **snack-bar:** allow setting the layout direction ([#4726](https://github.com/angular/material2/issues/4726)) ([0e24345](https://github.com/angular/material2/commit/0e24345)), closes [#4721](https://github.com/angular/material2/issues/4721)



<a name="2.0.0-beta.5"></a>
# [2.0.0-beta.5 taffeta-admiral](https://github.com/angular/material2/compare/2.0.0-beta.4...2.0.0-beta.5) (2017-05-13)


### Bug Fixes

* **list, option:** fix ripples blocking mouse events on user content ([#4503](https://github.com/angular/material2/issues/4503)) ([c4b3625](https://github.com/angular/material2/commit/c4b3625)), closes [#4480](https://github.com/angular/material2/issues/4480)



<a name="2.0.0-beta.4"></a>
# [2.0.0-beta.4 unobtainium-sunglasses](https://github.com/angular/material2/compare/g3_v2_0...2.0.0-beta.4) (2017-05-12)

### Breaking Changes

* `MdIconModule` no longer imports `HttpModule`. If your application depended on `Http` being provided through `MdIconModule`, you should now directly import `HttpModule` into your application.
* The `forRoot` method on all Angular Material modules has been removed. It was previously deprecated and a no-op. Importing the modules directly will have the same effect.
* Angular Material now requires TypeScript 2.2, which adds support for mixins. 

### Highlights

* New datepicker component! This is still very new, so please try it out and file any issues you encounter on Github.
* You can now disable Material's global sanity checks (at your own risk). These checks include whether your theme file is included, that you have a doctype, and more. See the PR [here](https://github.com/angular/material2/pull/4178).
* Our support for Angular Universal should be much improved! Expect further improvements in subsequent releases.

### Bug Fixes

* **autocomplete:** not scrolling to active option when pressing home/end ([#3709](https://github.com/angular/material2/issues/3709)) ([8d0cd04](https://github.com/angular/material2/commit/8d0cd04))
* **autocomplete:** not updating the size while the panel is open ([#4346](https://github.com/angular/material2/issues/4346)) ([bfeb515](https://github.com/angular/material2/commit/bfeb515))
* **autocomplete:** panel not being shown with delay and OnPush change detection ([#3977](https://github.com/angular/material2/issues/3977)) ([efd3485](https://github.com/angular/material2/commit/efd3485)), closes [#3955](https://github.com/angular/material2/issues/3955)
* **autocomplete:** reposition panel on scroll ([#3745](https://github.com/angular/material2/issues/3745)) ([81a6f8d](https://github.com/angular/material2/commit/81a6f8d))
* **autocomplete:** unable to click to select items in IE ([#3188](https://github.com/angular/material2/issues/3188)) ([78985b7](https://github.com/angular/material2/commit/78985b7)), closes [#3351](https://github.com/angular/material2/issues/3351)
* **button:** ripple color for raised buttons ([#3829](https://github.com/angular/material2/issues/3829)) ([7f65f31](https://github.com/angular/material2/commit/7f65f31)), closes [#2901](https://github.com/angular/material2/issues/2901)
* **card:** update color property to use theme's text color. ([#3952](https://github.com/angular/material2/issues/3952)) ([5e7af26](https://github.com/angular/material2/commit/5e7af26))
* **cdk:** add camelCase selectors for cdk directives ([#4054](https://github.com/angular/material2/issues/4054)) ([cb98270](https://github.com/angular/material2/commit/cb98270))
* **checkbox:** do not set `indeterminate` when set `checked` programmatically ([#4024](https://github.com/angular/material2/issues/4024)) ([de8b97f](https://github.com/angular/material2/commit/de8b97f))
* **checkbox:** no side margin if label has no content ([#2121](https://github.com/angular/material2/issues/2121)) ([4e8d806](https://github.com/angular/material2/commit/4e8d806)), closes [#2011](https://github.com/angular/material2/issues/2011)
* **checkbox:** set pointer cursor for checkbox ([#4473](https://github.com/angular/material2/issues/4473)) ([b2f93b5](https://github.com/angular/material2/commit/b2f93b5)), closes [#4185](https://github.com/angular/material2/issues/4185)
* **checkbox:** support OnPush for disabled with forms module ([#4087](https://github.com/angular/material2/issues/4087)) ([efb39da](https://github.com/angular/material2/commit/efb39da))
* **checkbox, radio:** ripple error on focus event ([#3869](https://github.com/angular/material2/issues/3869)) ([e22b55e](https://github.com/angular/material2/commit/e22b55e)), closes [#3856](https://github.com/angular/material2/issues/3856)
* **chips:** wrong margin on single chip ([#4366](https://github.com/angular/material2/issues/4366)) ([5d03c1a](https://github.com/angular/material2/commit/5d03c1a)), closes [#4359](https://github.com/angular/material2/issues/4359)
* **compatibility:** error in theme check with angular universal ([#3872](https://github.com/angular/material2/issues/3872)) ([a65d2f4](https://github.com/angular/material2/commit/a65d2f4)), closes [#3870](https://github.com/angular/material2/issues/3870)
* **compatibility:** throw better error when wrong prefix is used ([#3871](https://github.com/angular/material2/issues/3871)) ([2d50044](https://github.com/angular/material2/commit/2d50044))
* **connected-overlay:** better handling of dynamic content ([#4250](https://github.com/angular/material2/issues/4250)) ([525ce1e](https://github.com/angular/material2/commit/525ce1e)), closes [#4155](https://github.com/angular/material2/issues/4155)
* **core:** remove deprecated forRoot functions ([#3539](https://github.com/angular/material2/issues/3539)) ([c94f471](https://github.com/angular/material2/commit/c94f471))
* **core:** export MdOptionSelectionChange ([#4285](https://github.com/angular/material2/issues/4285)) ([af978cd](https://github.com/angular/material2/commit/af978cd))
* **dialog:** capture previously focused element immediately ([#3875](https://github.com/angular/material2/issues/3875)) ([29968b8](https://github.com/angular/material2/commit/29968b8))
* **dialog:** close all dialogs on popstate/hashchange ([#2742](https://github.com/angular/material2/issues/2742)) ([85bc3a6](https://github.com/angular/material2/commit/85bc3a6)), closes [#2601](https://github.com/angular/material2/issues/2601)
* **dialog:** fire afterClosed callback after all dialog actions are done ([#3892](https://github.com/angular/material2/issues/3892)) ([ee1a5a7](https://github.com/angular/material2/commit/ee1a5a7))
* **dialog:** provide default value for MD_DIALOG_DATA token ([#4120](https://github.com/angular/material2/issues/4120)) ([d1128fe](https://github.com/angular/material2/commit/d1128fe)), closes [#4086](https://github.com/angular/material2/issues/4086)
* **dialog:** restoring focus too early ([#4329](https://github.com/angular/material2/issues/4329)) ([afaa2dc](https://github.com/angular/material2/commit/afaa2dc)), closes [#4287](https://github.com/angular/material2/issues/4287)
* **dialog:** unable to press escape to close in lazy-loaded module ([#3788](https://github.com/angular/material2/issues/3788)) ([3796f69](https://github.com/angular/material2/commit/3796f69)), closes [#3737](https://github.com/angular/material2/issues/3737)
* **focus-trap:** import rxjs first operator ([#4400](https://github.com/angular/material2/issues/4400)) ([2c8faf6](https://github.com/angular/material2/commit/2c8faf6))
* **grid-list:** export MdGridTile. Fixes [#2408](https://github.com/angular/material2/issues/2408) ([#4000](https://github.com/angular/material2/issues/4000)) ([9d719c5](https://github.com/angular/material2/commit/9d719c5))
* **input:** add back pointer-events none removed in [#3878](https://github.com/angular/material2/issues/3878) ([#4206](https://github.com/angular/material2/issues/4206)) ([fb1fabc](https://github.com/angular/material2/commit/fb1fabc))
* **input:** allow pointer events on placeholder ([#3878](https://github.com/angular/material2/issues/3878)) ([32b7426](https://github.com/angular/material2/commit/32b7426))
* **input:** incorrect height with autosize ([#4084](https://github.com/angular/material2/issues/4084)) ([21f8899](https://github.com/angular/material2/commit/21f8899)), closes [#4070](https://github.com/angular/material2/issues/4070)
* **input:** input placeholder not being hidden in IE under certain conditions ([#4478](https://github.com/angular/material2/issues/4478)) ([fc73a4b](https://github.com/angular/material2/commit/fc73a4b)), closes [#4464](https://github.com/angular/material2/issues/4464)
* **input:** make start and end hints interact well when their text needs to wrap ([#3979](https://github.com/angular/material2/issues/3979)) ([21cbf34](https://github.com/angular/material2/commit/21cbf34))
* **input:** placeholder not rendering in Chrome under certain conditions ([#4405](https://github.com/angular/material2/issues/4405)) ([5e349d9](https://github.com/angular/material2/commit/5e349d9))
* **input:** single-line hints overflowing the parent ([#4107](https://github.com/angular/material2/issues/4107)) ([0b9b582](https://github.com/angular/material2/commit/0b9b582)), closes [#4051](https://github.com/angular/material2/issues/4051)
* **input-container:** new attribute hideRequiredMarker ([#4237](https://github.com/angular/material2/issues/4237)) ([6c31adb](https://github.com/angular/material2/commit/6c31adb)), closes [#3681](https://github.com/angular/material2/issues/3681)
* **list:** fix padding for list items ([#4486](https://github.com/angular/material2/issues/4486)) ([d1d2e18](https://github.com/angular/material2/commit/d1d2e18))
* **list:** icon size in dense mode ([#3913](https://github.com/angular/material2/issues/3913)) ([f412499](https://github.com/angular/material2/commit/f412499)), closes [#3886](https://github.com/angular/material2/issues/3886)
* **list:** remove overflow hidden from content ([#4426](https://github.com/angular/material2/issues/4426)) ([078aa19](https://github.com/angular/material2/commit/078aa19))
* **list:** set explicit box-sizing on icon ([#3876](https://github.com/angular/material2/issues/3876)) ([e263fb7](https://github.com/angular/material2/commit/e263fb7)), closes [#3863](https://github.com/angular/material2/issues/3863)
* **menu:** incorrect panel max height ([#4214](https://github.com/angular/material2/issues/4214)) ([d3210e7](https://github.com/angular/material2/commit/d3210e7))
* **menu:** unable to bind to xPosition and yPosition ([#4213](https://github.com/angular/material2/issues/4213)) ([1fd50aa](https://github.com/angular/material2/commit/1fd50aa)), closes [#4169](https://github.com/angular/material2/issues/4169)
* **menu:** wrong icon margin in rtl ([#4225](https://github.com/angular/material2/issues/4225)) ([ba6b9bb](https://github.com/angular/material2/commit/ba6b9bb))
* **overlay:** no longer export internal type ([#4390](https://github.com/angular/material2/issues/4390)) ([136f7ff](https://github.com/angular/material2/commit/136f7ff))
* **overlay:** render the templates before placing them in the overlay. ([#2989](https://github.com/angular/material2/issues/2989)) ([da33c03](https://github.com/angular/material2/commit/da33c03))
* **progress-spinner:** not working with server-side rendering ([#4020](https://github.com/angular/material2/issues/4020)) ([aebbd8a](https://github.com/angular/material2/commit/aebbd8a)), closes [#3988](https://github.com/angular/material2/issues/3988)
* **ripple:** explicit type for global ripple options ([#4240](https://github.com/angular/material2/issues/4240)) ([115e901](https://github.com/angular/material2/commit/115e901))
* **ripple:** global ripple configuration on init ([#4238](https://github.com/angular/material2/issues/4238)) ([9a2c4d6](https://github.com/angular/material2/commit/9a2c4d6)), closes [#4235](https://github.com/angular/material2/issues/4235)
* **select:** missing rxjs filter import ([#4407](https://github.com/angular/material2/issues/4407)) ([1ec88e0](https://github.com/angular/material2/commit/1ec88e0))
* **select:** prevent the panel from going outside the viewport horizontally ([#3864](https://github.com/angular/material2/issues/3864)) ([e10bb18](https://github.com/angular/material2/commit/e10bb18)), closes [#3504](https://github.com/angular/material2/issues/3504) [#3831](https://github.com/angular/material2/issues/3831)
* **select:** reposition panel on scroll ([#3808](https://github.com/angular/material2/issues/3808)) ([5983a2b](https://github.com/angular/material2/commit/5983a2b))
* **select:** tab opening multiple select and space scrolling page ([#4210](https://github.com/angular/material2/issues/4210)) ([24a762f](https://github.com/angular/material2/commit/24a762f))
* **select:** unable to hide via visibility ([#4264](https://github.com/angular/material2/issues/4264)) ([f16affc](https://github.com/angular/material2/commit/f16affc)), closes [#4247](https://github.com/angular/material2/issues/4247)
* **select:** wrong panel width if element is hidden initially ([#3647](https://github.com/angular/material2/issues/3647)) ([eaf16c8](https://github.com/angular/material2/commit/eaf16c8)), closes [#3639](https://github.com/angular/material2/issues/3639) [#3244](https://github.com/angular/material2/issues/3244)
* **slide-toggle:** invalid model change event ([#4140](https://github.com/angular/material2/issues/4140)) ([317952a](https://github.com/angular/material2/commit/317952a)), closes [#4124](https://github.com/angular/material2/issues/4124)
* **slide-toggle:** remove unused mousedown listener ([#4184](https://github.com/angular/material2/issues/4184)) ([e82d0f1](https://github.com/angular/material2/commit/e82d0f1))
* **slider:** correct typo in MdSliderChange description ([#4216](https://github.com/angular/material2/issues/4216)) ([#4217](https://github.com/angular/material2/issues/4217)) ([4bdceed](https://github.com/angular/material2/commit/4bdceed))
* **slider,slide-toggle:** use the grab cursor ([#3821](https://github.com/angular/material2/issues/3821)) ([cc8f871](https://github.com/angular/material2/commit/cc8f871)), closes [#3778](https://github.com/angular/material2/issues/3778)
* **snack-bar:** allow multi-line text ([#3626](https://github.com/angular/material2/issues/3626)) ([eef57f6](https://github.com/angular/material2/commit/eef57f6)), closes [#1951](https://github.com/angular/material2/issues/1951)
* **snack-bar:** leaking object references ([#4403](https://github.com/angular/material2/issues/4403)) ([4ca16d7](https://github.com/angular/material2/commit/4ca16d7)), closes [#2942](https://github.com/angular/material2/issues/2942)
* **tabs:** animation error with nested tab groups ([#4315](https://github.com/angular/material2/issues/4315)) ([1766649](https://github.com/angular/material2/commit/1766649)), closes [#4277](https://github.com/angular/material2/issues/4277)
* **tabs:** apply dark theme to header font ([#4326](https://github.com/angular/material2/issues/4326)) ([c37a2de](https://github.com/angular/material2/commit/c37a2de)), closes [#4320](https://github.com/angular/material2/issues/4320)
* **tabs:** re-align the ink bar when the viewport size changes ([#3877](https://github.com/angular/material2/issues/3877)) ([7942948](https://github.com/angular/material2/commit/7942948)), closes [#3845](https://github.com/angular/material2/issues/3845) [#3044](https://github.com/angular/material2/issues/3044) [#2518](https://github.com/angular/material2/issues/2518) [#1231](https://github.com/angular/material2/issues/1231)
* **tabs:** remove forRoot that was missed ([#4328](https://github.com/angular/material2/issues/4328)) ([b4e8c7d](https://github.com/angular/material2/commit/b4e8c7d))
* **tabs:** unnecessary scrollbar if content has a margin ([#4062](https://github.com/angular/material2/issues/4062)) ([7336bdc](https://github.com/angular/material2/commit/7336bdc)), closes [#3162](https://github.com/angular/material2/issues/3162) [#4035](https://github.com/angular/material2/issues/4035)
* **textarea:** fix change detection error on autosize ([#4180](https://github.com/angular/material2/issues/4180)) ([bccf8d2](https://github.com/angular/material2/commit/bccf8d2))
* **theming:** fix broken sass expressions nested in theme classes ([#4145](https://github.com/angular/material2/issues/4145)) ([355f8b7](https://github.com/angular/material2/commit/355f8b7)), closes [#4077](https://github.com/angular/material2/issues/4077)
* **tooltip:** wrong position when using OnPush change detection ([#3671](https://github.com/angular/material2/issues/3671)) ([edf01c0](https://github.com/angular/material2/commit/edf01c0)), closes [#3497](https://github.com/angular/material2/issues/3497)
* **universal:** gate several browser-specific bits on being on the browser ([#4251](https://github.com/angular/material2/issues/4251)) ([f27df86](https://github.com/angular/material2/commit/f27df86))


### Features

* **datepicker:** add initial datepicker ([#4404](https://github.com/angular/material2/issues/4404)) ([123d7ec](https://github.com/angular/material2/commit/123d7ec))
* **card:** allow md-card-title and subtitle to be used as attributes ([#4122](https://github.com/angular/material2/issues/4122)) ([a200024](https://github.com/angular/material2/commit/a200024))
* **core:** allow users to disable the sanity checks ([#4178](https://github.com/angular/material2/issues/4178)) ([16bba72](https://github.com/angular/material2/commit/16bba72)), closes [#4125](https://github.com/angular/material2/issues/4125)
* **dialog:** add hasBackdrop and backdropClass options to dialog config ([#2822](https://github.com/angular/material2/issues/2822)) ([7428c49](https://github.com/angular/material2/commit/7428c49)), closes [#2806](https://github.com/angular/material2/issues/2806)
* **list:** option to disable ripples for all items ([#4159](https://github.com/angular/material2/issues/4159)) ([7f0f473](https://github.com/angular/material2/commit/7f0f473)), closes [#4149](https://github.com/angular/material2/issues/4149)
* **observe-content:** add debounce option and other improvements ([#2404](https://github.com/angular/material2/issues/2404)) ([244aece](https://github.com/angular/material2/commit/244aece))
* **overlay:** add scroll handling strategies ([#4293](https://github.com/angular/material2/issues/4293)) ([c8ec981](https://github.com/angular/material2/commit/c8ec981))
* **overlay:** expose interface for custom positions ([#4374](https://github.com/angular/material2/issues/4374)) ([ea8241a](https://github.com/angular/material2/commit/ea8241a))
* **progress-spinner:** add support for custom stroke-width ([#4113](https://github.com/angular/material2/issues/4113)) ([b846a27](https://github.com/angular/material2/commit/b846a27)), closes [#3934](https://github.com/angular/material2/issues/3934)
* **select:** add ability to cycle through options with arrow keys when closed ([#3313](https://github.com/angular/material2/issues/3313)) ([66e65c4](https://github.com/angular/material2/commit/66e65c4)), closes [#2990](https://github.com/angular/material2/issues/2990)
* **select:** allow setting the theme color ([#3928](https://github.com/angular/material2/issues/3928)) ([3a29d67](https://github.com/angular/material2/commit/3a29d67)), closes [#3923](https://github.com/angular/material2/issues/3923)
* **select:** close the panel when pressing escape ([#3879](https://github.com/angular/material2/issues/3879)) ([94a2855](https://github.com/angular/material2/commit/94a2855))
* add initial sass typography API ([#4162](https://github.com/angular/material2/issues/4162)) ([7de316f](https://github.com/angular/material2/commit/7de316f))
* remove hard dependency on [@angular](https://github.com/angular)/http ([#3792](https://github.com/angular/material2/issues/3792)) ([b011b45](https://github.com/angular/material2/commit/b011b45)), closes [#2616](https://github.com/angular/material2/issues/2616)
* **sidenav:** open all sidenavs from MdSidenavContainer ([#2870](https://github.com/angular/material2/issues/2870)) ([79306ad](https://github.com/angular/material2/commit/79306ad)), closes [#2591](https://github.com/angular/material2/issues/2591)
* **tabs:** allow disabling ripples ([#4466](https://github.com/angular/material2/issues/4466)) ([e4789c7](https://github.com/angular/material2/commit/e4789c7))


### Performance Improvements

* **dialog:** switch dialog animations to translate3d ([#3905](https://github.com/angular/material2/issues/3905)) ([857c217](https://github.com/angular/material2/commit/857c217))



<a name="2.0.0-beta.3"></a>
# [2.0.0-beta.3 cesium-cephalopod](https://github.com/angular/material2/compare/2.0.0-beta.2...2.0.0-beta.3) (2017-04-07)

### Breaking changes

#### Package structure
The package structure for Angular Material has changed to match that of Angular itself. This has
a few ramifications on applications consuming Angular Material:
* Deep imports will no longer work, e.g., `@angular/material/core/a11y`. All public symbols
should be imported directly from `@angular/material`. Deep imports have always been an anti-pattern,
but our previous package structure inadvertently allowed them.
* The imports for theming have changed.
** For prebuilt themes, you can now find the CSS files in the `prebuilt-themes/` directory in the
package root. For angular-cli projects, this will look something like
```scss
@import '~@angular/material/prebuilt-themes/deeppurple-amber.css';
```
** For custom themes, you can now import `theming.scss` directly from the package root. Again, with
angular-cli, this will look something like:
```scss
@import '~@angular/material/theming';
```

#### Removal of deprecated symbols
* The deprecated, `Md`-prefixed aliases for `LiveAnnouncer`, `Platform`, and
`UniqueSelectionDispacther` have been removed.

#### MaterialModule
* `MaterialModule` (and `MaterialRootModule`) have been marked as deprecated.

We've found that, with the current state of tree-shaking in the world,
that using an aggregate NgModule like `MaterialModule` leads to tools
not being able to eliminate code for components that aren't used.

In order to ensure that users end up with the smallest code size
possible, we're deprecating MaterialModule, to be removed in the a
subsequent release.

To replace `MaterialModule`, users can create their own "Material"
module within their application (e.g., `GmailMaterialModule`) that
imports only the set of components actually used in the application.

#### Angular 4
* Angular Material now depends on Angular 4.
* Now that animations have been refactored into a separate package, users of `@angular/material`
need to explicitly import `BrowserAnimationsModule` (or `NoopAnimationsModule`) from
`@angular/platform-browser/animations` as well as installing `@angular/animations`.

#### Other changes
* The `DomProjection` service was removed. This was an experimental, undocumented service that we 
ultimately found did not provide a good approach to composing components.
* The `config` property was removed from `MdDialogRef`. If you were using this to access the `data`
property, you can instead inject that value using the `MD_DIALOG_DATA` of the opened component.



### Bug Fixes

* **autocomplete:** "undefined" being displayed on empty control with ngModel ([#3535](https://github.com/angular/material2/issues/3535)) ([675c9df](https://github.com/angular/material2/commit/675c9df)), closes [#3529](https://github.com/angular/material2/issues/3529)
* **autocomplete:** aria-expanded should be updated when panel hides ([#3494](https://github.com/angular/material2/issues/3494)) ([932b4a0](https://github.com/angular/material2/commit/932b4a0))
* **autocomplete:** do not trigger submit on ENTER ([#3727](https://github.com/angular/material2/issues/3727)) ([bedf5a1](https://github.com/angular/material2/commit/bedf5a1)), closes [#3159](https://github.com/angular/material2/issues/3159)
* **autocomplete:** fix down arrow use with ngIf ([#3493](https://github.com/angular/material2/issues/3493)) ([a4e2de7](https://github.com/angular/material2/commit/a4e2de7))
* **autocomplete:** fix key manager instantiation ([#3274](https://github.com/angular/material2/issues/3274)) ([c21ff40](https://github.com/angular/material2/commit/c21ff40))
* **autocomplete:** not showing panel on first focus in certain cases ([#3775](https://github.com/angular/material2/issues/3775)) ([75996b5](https://github.com/angular/material2/commit/75996b5))
* **autocomplete:** prevent opening on load in IE ([#3190](https://github.com/angular/material2/issues/3190)) ([a4da08b](https://github.com/angular/material2/commit/a4da08b)), closes [#3183](https://github.com/angular/material2/issues/3183)
* **autocomplete:** remove max width for autocomplete panel ([#3297](https://github.com/angular/material2/issues/3297)) ([738e9bf](https://github.com/angular/material2/commit/738e9bf)), closes [#3198](https://github.com/angular/material2/issues/3198)
* **autocomplete:** update overlay ref width on menu trigger ([#3573](https://github.com/angular/material2/issues/3573)) ([6915e8a](https://github.com/angular/material2/commit/6915e8a))
* **button:** add transition to focus overlay ([#2850](https://github.com/angular/material2/issues/2850)) ([6cdd8db](https://github.com/angular/material2/commit/6cdd8db))
* **button:** persist theme color of button when leaving hover state ([#3629](https://github.com/angular/material2/issues/3629)) ([3ad6ff0](https://github.com/angular/material2/commit/3ad6ff0))
* **button:** square ripple in compatibility mode ([#3167](https://github.com/angular/material2/issues/3167)) ([ceb472b](https://github.com/angular/material2/commit/ceb472b)), closes [#3164](https://github.com/angular/material2/issues/3164)
* **button:** use FocusOriginMonitor for focus styles ([#3294](https://github.com/angular/material2/issues/3294)) ([5d6920d](https://github.com/angular/material2/commit/5d6920d))
* **button-toggle:** fix color for selected button toggle and selected disabled button toggle ([#3418](https://github.com/angular/material2/issues/3418)) ([be167c9](https://github.com/angular/material2/commit/be167c9)), closes [#3382](https://github.com/angular/material2/issues/3382)
* **button-toggle:** only show focus style when focused via keyboard ([#3232](https://github.com/angular/material2/issues/3232)) ([d744a5f](https://github.com/angular/material2/commit/d744a5f))
* **card:** removed header height ([#3450](https://github.com/angular/material2/issues/3450)) ([17bf5e5](https://github.com/angular/material2/commit/17bf5e5)), closes [#3288](https://github.com/angular/material2/issues/3288)
* **card:** unable to override elevation ([#3139](https://github.com/angular/material2/issues/3139)) ([4ee16a9](https://github.com/angular/material2/commit/4ee16a9)), closes [#3123](https://github.com/angular/material2/issues/3123)
* **checkbox:** add focus indication ([#3403](https://github.com/angular/material2/issues/3403)) ([01188d9](https://github.com/angular/material2/commit/01188d9)), closes [#3102](https://github.com/angular/material2/issues/3102)
* **checkbox:** create ripple on label mousedown ([#3206](https://github.com/angular/material2/issues/3206)) ([3edf105](https://github.com/angular/material2/commit/3edf105)), closes [#3030](https://github.com/angular/material2/issues/3030)
* **checkbox:** focus origin for focus method ([#3763](https://github.com/angular/material2/issues/3763)) ([7a60489](https://github.com/angular/material2/commit/7a60489))
* **checkbox:** show checkbox animation only if user click or indeterminate state ([#3137](https://github.com/angular/material2/issues/3137)) ([f4323b2](https://github.com/angular/material2/commit/f4323b2)), closes [#2783](https://github.com/angular/material2/issues/2783)
* **checkbox:** switch checkbox behaviors for click and change events ([#3146](https://github.com/angular/material2/issues/3146)) ([8aa9857](https://github.com/angular/material2/commit/8aa9857))
* **chips:** Fix adding new chips on demo page ([#3426](https://github.com/angular/material2/issues/3426)) ([2d16a24](https://github.com/angular/material2/commit/2d16a24))
* **compatibility:** remove ink bar from compatibility check ([#3267](https://github.com/angular/material2/issues/3267)) ([c203589](https://github.com/angular/material2/commit/c203589))
* **connected-overlay:** direction not being updated ([#3293](https://github.com/angular/material2/issues/3293)) ([817dcfd](https://github.com/angular/material2/commit/817dcfd)), closes [#3241](https://github.com/angular/material2/issues/3241)
* **connected-position:** error if none of the initial positions fit in viewport ([#3189](https://github.com/angular/material2/issues/3189)) ([a306a8e](https://github.com/angular/material2/commit/a306a8e))
* **core:** log warning if doctype is missing ([#2849](https://github.com/angular/material2/issues/2849)) ([22b0660](https://github.com/angular/material2/commit/22b0660)), closes [#2351](https://github.com/angular/material2/issues/2351)
* **demo:** remove input route from demo app ([#2922](https://github.com/angular/material2/issues/2922)) ([6bac315](https://github.com/angular/material2/commit/6bac315))
* **dialog:** delay focus until animation is done ([#3774](https://github.com/angular/material2/issues/3774)) ([d7d2b16](https://github.com/angular/material2/commit/d7d2b16)), closes [#3722](https://github.com/angular/material2/issues/3722)
* **dialog:** leaking component instance references ([#2875](https://github.com/angular/material2/issues/2875)) ([e120e8d](https://github.com/angular/material2/commit/e120e8d)), closes [#2734](https://github.com/angular/material2/issues/2734)
* **dialog:** leaking MdDialogContainer references ([#2944](https://github.com/angular/material2/issues/2944)) ([8e6720b](https://github.com/angular/material2/commit/8e6720b)), closes [#2876](https://github.com/angular/material2/issues/2876)
* **docs:** only rewrite relative links ([#3339](https://github.com/angular/material2/issues/3339)) ([cb57660](https://github.com/angular/material2/commit/cb57660)), closes [#3147](https://github.com/angular/material2/issues/3147)
* **focus-trap:** avoid closure compiler issues when adding anchors ([#3448](https://github.com/angular/material2/issues/3448)) ([8b2ae0d](https://github.com/angular/material2/commit/8b2ae0d))
* **focus-trap:** enabled property not being coerced ([#3417](https://github.com/angular/material2/issues/3417)) ([d81445b](https://github.com/angular/material2/commit/d81445b))
* **focus-trap:** exception when element contains SVG on IE ([#3432](https://github.com/angular/material2/issues/3432)) ([d06ad75](https://github.com/angular/material2/commit/d06ad75)), closes [#3410](https://github.com/angular/material2/issues/3410)
* **input:** baseline alignment on textarea ([#3714](https://github.com/angular/material2/issues/3714)) ([7cff349](https://github.com/angular/material2/commit/7cff349))
* **input:** change dividerColor to color ([#3726](https://github.com/angular/material2/issues/3726)) ([2ccf0ae](https://github.com/angular/material2/commit/2ccf0ae))
* **input:** don't add empty prefix & suffix wrappers ([#3724](https://github.com/angular/material2/issues/3724)) ([6d6c12d](https://github.com/angular/material2/commit/6d6c12d))
* **input:** don't animate label when value is set programmatically ([#3691](https://github.com/angular/material2/issues/3691)) ([dc5c869](https://github.com/angular/material2/commit/dc5c869))
* **input:** fix blank aria-describedBy ([#3713](https://github.com/angular/material2/issues/3713)) ([cb85eeb](https://github.com/angular/material2/commit/cb85eeb))
* **input:** fix chrome autofill style ([#3366](https://github.com/angular/material2/issues/3366)) ([f40b1b2](https://github.com/angular/material2/commit/f40b1b2))
* **input:** label animation shifting sibling labels ([#3568](https://github.com/angular/material2/issues/3568)) ([f8cdd92](https://github.com/angular/material2/commit/f8cdd92)), closes [#3541](https://github.com/angular/material2/issues/3541)
* **input:** make all icons in input containers the correct size ([#3489](https://github.com/angular/material2/issues/3489)) ([359c9bb](https://github.com/angular/material2/commit/359c9bb))
* **input:** make icons in prefix/suffix the right size ([#3342](https://github.com/angular/material2/issues/3342)) ([63d4359](https://github.com/angular/material2/commit/63d4359))
* **input:** make sure injected NgControl belongs to the input ([#3700](https://github.com/angular/material2/issues/3700)) ([220163e](https://github.com/angular/material2/commit/220163e))
* **input:** overflow-y scrollbar is displayed (IE) ([#3571](https://github.com/angular/material2/issues/3571)) ([7ffaf9e](https://github.com/angular/material2/commit/7ffaf9e)), closes [#3570](https://github.com/angular/material2/issues/3570)
* **input:** remove jitter that occurs on focus ([#3343](https://github.com/angular/material2/issues/3343)) ([eba7641](https://github.com/angular/material2/commit/eba7641))
* **interactivity-checker:** cast node name to lowercase for isInputElement function ([#3281](https://github.com/angular/material2/issues/3281)) ([8f76f96](https://github.com/angular/material2/commit/8f76f96))
* **list:** add font-family style to subheader ([#3056](https://github.com/angular/material2/issues/3056)) ([3464011](https://github.com/angular/material2/commit/3464011))
* **list-key-manager:** exception when no initial active item ([#3431](https://github.com/angular/material2/issues/3431)) ([842896b](https://github.com/angular/material2/commit/842896b)), closes [#3317](https://github.com/angular/material2/issues/3317)
* **menu:** incorrect text alignment in IE/Edge ([#3268](https://github.com/angular/material2/issues/3268)) ([5ef3084](https://github.com/angular/material2/commit/5ef3084)), closes [#3254](https://github.com/angular/material2/issues/3254)
* **menu:** not emitting close event when closing via the backdrop ([#3300](https://github.com/angular/material2/issues/3300)) ([0f28daf](https://github.com/angular/material2/commit/0f28daf)), closes [#3295](https://github.com/angular/material2/issues/3295)
* **menu,tooltip:** Ensure subscription exists before unsubscribing. ([#3078](https://github.com/angular/material2/issues/3078)) ([84b5c3b](https://github.com/angular/material2/commit/84b5c3b))
* aot runtime issues ([#3807](https://github.com/angular/material2/issues/3807)) ([f40296e](https://github.com/angular/material2/commit/f40296e))
* change selectors for MdCardXlImage and MdCardAvatar ([#3134](https://github.com/angular/material2/issues/3134)) ([6e1f50b](https://github.com/angular/material2/commit/6e1f50b))
* coverage issue with saucelabs ([#3540](https://github.com/angular/material2/issues/3540)) ([4d4a63e](https://github.com/angular/material2/commit/4d4a63e))
* **select:** allow custom aria-label ([#3765](https://github.com/angular/material2/issues/3765)) ([038a337](https://github.com/angular/material2/commit/038a337)), closes [#3762](https://github.com/angular/material2/issues/3762)
* deprecate MaterialModule ([#3840](https://github.com/angular/material2/issues/3840)) ([3f5894e](https://github.com/angular/material2/commit/3f5894e))
* **overlay:** ensure proper stacking order when attaching ([#3581](https://github.com/angular/material2/issues/3581)) ([aa5925b](https://github.com/angular/material2/commit/aa5925b)), closes [#3574](https://github.com/angular/material2/issues/3574)
* **package.json:** Fix failing `npm run api` command ([#3462](https://github.com/angular/material2/issues/3462)) ([bf2b615](https://github.com/angular/material2/commit/bf2b615))
* **portal-host:** unable to clear and portal reference not being set ([#3302](https://github.com/angular/material2/issues/3302)) ([7fcb93b](https://github.com/angular/material2/commit/7fcb93b))
* **progress-spinner:** not redrawing when changing modes ([#3672](https://github.com/angular/material2/issues/3672)) ([1ae81a4](https://github.com/angular/material2/commit/1ae81a4)), closes [#3648](https://github.com/angular/material2/issues/3648)
* **pseudo-checkbox:** alignment issue and border color ([#3144](https://github.com/angular/material2/issues/3144)) ([1f19ef0](https://github.com/angular/material2/commit/1f19ef0))
* **radio:** add focus indication ([#3402](https://github.com/angular/material2/issues/3402)) ([c934753](https://github.com/angular/material2/commit/c934753)), closes [#3102](https://github.com/angular/material2/issues/3102)
* **ripple:** different durations for ripple elements ([#3136](https://github.com/angular/material2/issues/3136)) ([5c7a96b](https://github.com/angular/material2/commit/5c7a96b)), closes [#3109](https://github.com/angular/material2/issues/3109)
* **ripple:** fade-out-all should hide all ripples ([#3400](https://github.com/angular/material2/issues/3400)) ([5cc50d2](https://github.com/angular/material2/commit/5cc50d2))
* **ripple:** fix ripple color in dark theme ([#3094](https://github.com/angular/material2/issues/3094)) ([a91ae72](https://github.com/angular/material2/commit/a91ae72))
* **ripple:** rename selector for the ripple ([#3482](https://github.com/angular/material2/issues/3482)) ([58c5d17](https://github.com/angular/material2/commit/58c5d17))
* **scripts:** change all paths in docs pushing script to relative paths ([#3091](https://github.com/angular/material2/issues/3091)) ([60aa9e9](https://github.com/angular/material2/commit/60aa9e9))
* **scroll-dispatcher:** unable to unsubscribe from global listener ([#3729](https://github.com/angular/material2/issues/3729)) ([68db6ba](https://github.com/angular/material2/commit/68db6ba))
* **scrollable:** check if scrollable exists before unregistering ([#3050](https://github.com/angular/material2/issues/3050)) ([b358c6c](https://github.com/angular/material2/commit/b358c6c))
* **select:** animation jump in Chrome and blurry text in IE ([#3328](https://github.com/angular/material2/issues/3328)) ([09c6386](https://github.com/angular/material2/commit/09c6386)), closes [#3327](https://github.com/angular/material2/issues/3327) [#1953](https://github.com/angular/material2/issues/1953)
* **select:** exception if selected value is accessed on init ([#3785](https://github.com/angular/material2/issues/3785)) ([e82457c](https://github.com/angular/material2/commit/e82457c)), closes [#3750](https://github.com/angular/material2/issues/3750)
* **select:** initial value not being displayed with FormControl and OnPush ([#3434](https://github.com/angular/material2/issues/3434)) ([819fa0b](https://github.com/angular/material2/commit/819fa0b))
* **select:** show focus indicator even with validation errors ([#3743](https://github.com/angular/material2/issues/3743)) ([e964734](https://github.com/angular/material2/commit/e964734)), closes [#3742](https://github.com/angular/material2/issues/3742)
* **select:** unable to set a tabindex ([#3479](https://github.com/angular/material2/issues/3479)) ([11dec36](https://github.com/angular/material2/commit/11dec36)), closes [#3474](https://github.com/angular/material2/issues/3474)
* **select:** wrong item order in label in rtl ([#3567](https://github.com/angular/material2/issues/3567)) ([52ea7a3](https://github.com/angular/material2/commit/52ea7a3))
* **sidenav:** throw error when sidenav has 2 sidenavs on the same side at the same time ([#3369](https://github.com/angular/material2/issues/3369)) ([324da5b](https://github.com/angular/material2/commit/324da5b))
* **sidenav:** use vw instead of percentage for sidenav min width ([#3046](https://github.com/angular/material2/issues/3046)) ([c638e20](https://github.com/angular/material2/commit/c638e20))
* **slide-toggle:** fix unavailable unmonitor call ([#3862](https://github.com/angular/material2/issues/3862)) ([904c71e](https://github.com/angular/material2/commit/904c71e))
* **slide-toggle:** input not updated after drag ([#3067](https://github.com/angular/material2/issues/3067)) ([5cdeb75](https://github.com/angular/material2/commit/5cdeb75))
* **slide-toggle:** invalid change events with no new value ([#3555](https://github.com/angular/material2/issues/3555)) ([5346353](https://github.com/angular/material2/commit/5346353)), closes [#3526](https://github.com/angular/material2/issues/3526)
* **slide-toggle:** occasional element jumping ([#3311](https://github.com/angular/material2/issues/3311)) ([beb0edf](https://github.com/angular/material2/commit/beb0edf))
* **slide-toggle:** remove host element margin ([#3761](https://github.com/angular/material2/issues/3761)) ([cd0b853](https://github.com/angular/material2/commit/cd0b853))
* **slide-toggle:** ripple fade-in too slow ([#3170](https://github.com/angular/material2/issues/3170)) ([369931e](https://github.com/angular/material2/commit/369931e))
* **slider:** unable to reset tickInterval after it has been set ([#3488](https://github.com/angular/material2/issues/3488)) ([b9b014a](https://github.com/angular/material2/commit/b9b014a)), closes [#3452](https://github.com/angular/material2/issues/3452)
* **tab:** use MD_RIPPLE_GLOBAL_OPTIONS in tab ([#3553](https://github.com/angular/material2/issues/3553)) ([ee853b9](https://github.com/angular/material2/commit/ee853b9))
* **tab-nav:** add constructor back for ripple ([#3537](https://github.com/angular/material2/issues/3537)) ([f27617a](https://github.com/angular/material2/commit/f27617a))
* **tabs:** change color for disabled tab label ([#3483](https://github.com/angular/material2/issues/3483)) ([290f710](https://github.com/angular/material2/commit/290f710)), closes [#3481](https://github.com/angular/material2/issues/3481)
* **tabs:** missing mat class on tab group ([#3038](https://github.com/angular/material2/issues/3038)) ([d97debe](https://github.com/angular/material2/commit/d97debe))
* **tabs:** re-align ink bar on direction change ([#3622](https://github.com/angular/material2/issues/3622)) ([07793a4](https://github.com/angular/material2/commit/07793a4)), closes [#3615](https://github.com/angular/material2/issues/3615)
* **tabs:** remove body and header from compatibility ([#3168](https://github.com/angular/material2/issues/3168)) ([b939cd8](https://github.com/angular/material2/commit/b939cd8))
* **tabs:** remove flex; bring ink into same parent as links ([#3331](https://github.com/angular/material2/issues/3331)) ([00de2d7](https://github.com/angular/material2/commit/00de2d7))
* **tabs:** set tab body content to 100% ([#3162](https://github.com/angular/material2/issues/3162)) ([cbd1ff9](https://github.com/angular/material2/commit/cbd1ff9)), closes [#3153](https://github.com/angular/material2/issues/3153)
* **toolbar:** incorrect height for soft-keyboards ([#3312](https://github.com/angular/material2/issues/3312)) ([d1abc9e](https://github.com/angular/material2/commit/d1abc9e)), closes [#3233](https://github.com/angular/material2/issues/3233)
* **tooltip:** avoid capturing the initial tap on mobile ([#2423](https://github.com/angular/material2/issues/2423)) ([85ba82a](https://github.com/angular/material2/commit/85ba82a)), closes [#2326](https://github.com/angular/material2/issues/2326)


### Features

* **autocomplete:** support static placeholders ([#3115](https://github.com/angular/material2/issues/3115)) ([8482bbf](https://github.com/angular/material2/commit/8482bbf))
* **button-toggle:** Add a focus overlay for button-toggle ([#3119](https://github.com/angular/material2/issues/3119)) ([0544deb](https://github.com/angular/material2/commit/0544deb))
* **checkbox:** add value attribute to md-checkbox ([#2701](https://github.com/angular/material2/issues/2701)) ([fb565c0](https://github.com/angular/material2/commit/fb565c0)), closes [#2583](https://github.com/angular/material2/issues/2583)
* **dialog:** add enter/exit animations ([#2825](https://github.com/angular/material2/issues/2825)) ([5492225](https://github.com/angular/material2/commit/5492225)), closes [#2665](https://github.com/angular/material2/issues/2665)
* **dialog:** allow for the dialog dimensions to be updated ([#2940](https://github.com/angular/material2/issues/2940)) ([a71a5af](https://github.com/angular/material2/commit/a71a5af)), closes [#2930](https://github.com/angular/material2/issues/2930)
* **FocusOriginMonitor:** support monitoring subtree focus as well as element ([#3113](https://github.com/angular/material2/issues/3113)) ([3b39bd2](https://github.com/angular/material2/commit/3b39bd2))
* **input:** add directive for displaying error messages ([#3560](https://github.com/angular/material2/issues/3560)) ([c29f8ca](https://github.com/angular/material2/commit/c29f8ca))
* **input:** add invalid state styling ([#3114](https://github.com/angular/material2/issues/3114)) ([bc9d25b](https://github.com/angular/material2/commit/bc9d25b))
* **list:** add ripples to list items that are links ([#930](https://github.com/angular/material2/issues/930)) ([aa3360a](https://github.com/angular/material2/commit/aa3360a))
* **overlay:** allow theming overlay-based components ([#2967](https://github.com/angular/material2/issues/2967)) ([cbd42f0](https://github.com/angular/material2/commit/cbd42f0)), closes [#2662](https://github.com/angular/material2/issues/2662)
* **ripple:** add option for persistent ripples ([#3315](https://github.com/angular/material2/issues/3315)) ([e3ba1e1](https://github.com/angular/material2/commit/e3ba1e1)), closes [#3169](https://github.com/angular/material2/issues/3169)
* **ripple:** add way to globally disable ripples ([#3383](https://github.com/angular/material2/issues/3383)) ([3ff383c](https://github.com/angular/material2/commit/3ff383c))
* **ripple:** expose ripple directive in template ([#3165](https://github.com/angular/material2/issues/3165)) ([6595ad8](https://github.com/angular/material2/commit/6595ad8))
* **ripple:** support for global ripple options ([#3463](https://github.com/angular/material2/issues/3463)) ([fb75a13](https://github.com/angular/material2/commit/fb75a13))
* **select:** add floatingPlaceholder option ([#2571](https://github.com/angular/material2/issues/2571)) ([bb2392f](https://github.com/angular/material2/commit/bb2392f)), closes [#2569](https://github.com/angular/material2/issues/2569) [#2963](https://github.com/angular/material2/issues/2963)
* **select:** add multiple selection mode ([#2722](https://github.com/angular/material2/issues/2722)) ([dcc8576](https://github.com/angular/material2/commit/dcc8576)), closes [#2412](https://github.com/angular/material2/issues/2412)
* **slide-toggle:** add option to disable ripple ([#3195](https://github.com/angular/material2/issues/3195)) ([f8fde13](https://github.com/angular/material2/commit/f8fde13))
* upgrade to angular 4 ([#3608](https://github.com/angular/material2/issues/3608)) ([cd55082](https://github.com/angular/material2/commit/cd55082)), closes [#3357](https://github.com/angular/material2/issues/3357) [#3336](https://github.com/angular/material2/issues/3336) [#3301](https://github.com/angular/material2/issues/3301)
* **slide-toggle:** add ripple focus indicator ([#3739](https://github.com/angular/material2/issues/3739)) ([c4ec662](https://github.com/angular/material2/commit/c4ec662))
* **slide-toggle:** use ripple service ([#3068](https://github.com/angular/material2/issues/3068)) ([8541f8e](https://github.com/angular/material2/commit/8541f8e)), closes [#2900](https://github.com/angular/material2/issues/2900)
* **slider:** add theme color support ([#3766](https://github.com/angular/material2/issues/3766)) ([28f1ec3](https://github.com/angular/material2/commit/28f1ec3))
* **slider:** differentiate sliders focused via keyboard vs other means ([#3487](https://github.com/angular/material2/issues/3487)) ([bcb16c6](https://github.com/angular/material2/commit/bcb16c6))
* **snack-bar:** add `dismiss` method to `MdSnackBar` service ([#3069](https://github.com/angular/material2/issues/3069)) ([83b5842](https://github.com/angular/material2/commit/83b5842))
* **theming:** log a warning if core theme isn't loaded ([#3781](https://github.com/angular/material2/issues/3781)) ([4282917](https://github.com/angular/material2/commit/4282917)), closes [#2828](https://github.com/angular/material2/issues/2828)
* **tooltip:** allow tooltip be disabled ([#3578](https://github.com/angular/material2/issues/3578)) ([4e38f69](https://github.com/angular/material2/commit/4e38f69))


### Performance Improvements

* **ripple:** avoid triggering change detection ([#3066](https://github.com/angular/material2/issues/3066)) ([1a67107](https://github.com/angular/material2/commit/1a67107))
* **scroll-dispatcher:** avoid triggering change detection on scroll ([#3687](https://github.com/angular/material2/issues/3687)) ([5c2b449](https://github.com/angular/material2/commit/5c2b449))
* **scroll-dispatcher:** lazily subscribe to global events ([#3270](https://github.com/angular/material2/issues/3270)) ([c1004cb](https://github.com/angular/material2/commit/c1004cb)), closes [#3237](https://github.com/angular/material2/issues/3237)



<a name="2.0.0-beta.2"></a>
# [2.0.0-beta.2 flannel-papaya](https://github.com/angular/material2/compare/2.0.0-beta.1...2.0.0-beta.2) (2017-02-15)

### Breaking changes from beta.1
* Styling is no longer prefixed by `md-`. All styling is now prefixed by `mat-` so that apps can upgrade from AngularJS Material to Angular Material without styling conflicts between the two library components.
See ([#2790](https://github.com/angular/material2/issues/2790)) for the details on the code change and some useful regular expressions that can help migrate styles.
* Checkbox tab index @Input has been changed from `tabindex` to `tabIndex`. ([#2953](https://github.com/angular/material2/issues/2953))
* Ripple no longer has the `mdRippleBackgroundColor` input to change the background color. ([#2859](https://github.com/angular/material2/issues/2859))
* The deprecated use of `<md-input>` and `<md-textarea>` has been removed. Use `mdInput` on an input or textarea within a `md-input-container`. `md-prefix` and `md-suffix` are now `mdPrefix` and `mdSuffix`. ([#2788](https://github.com/angular/material2/issues/2788))

  ```html
  <md-input-container>
    <input mdInput name="value" ngModel>
  </md-input-container>
  ```

* The deprecated use of `<md-sidenav-layout>` has been removed. Use `<md-sidenav-container>` instead. ([#2283](https://github.com/angular/material2/issues/2283))
* Input floating placeholder @Input has changed from a boolean (`true` and `false`) to a state (`always`, `never`, and `auto`) and was renamed from `floatingPlaceholder` to `floatPlaceholder`. For details on when to use which state, see  ([#2585](https://github.com/angular/material2/issues/2585))
* The use of Module `forRoot` has been deprecated and will be removed in the next release. Instead, just simply import MaterialModule directly:

 ```ts
 @NgModule({
     imports: [
         ...
         MaterialModule,
         ...
     ]
 ...
 });
 ```

### Bug Fixes

* **autocomplete:** add mat version of autocomplete [@Input](https://github.com/Input) ([#2928](https://github.com/angular/material2/issues/2928)) ([e5521a8](https://github.com/angular/material2/commit/e5521a8))
* **autocomplete:** allow basic use without forms directives ([#2958](https://github.com/angular/material2/issues/2958)) ([4ee2980](https://github.com/angular/material2/commit/4ee2980))
* **autocomplete:** close panel when options list is empty ([#2834](https://github.com/angular/material2/issues/2834)) ([8a3b6fd](https://github.com/angular/material2/commit/8a3b6fd))
* **autocomplete:** double-clicking input shouldnt close the panel ([#2835](https://github.com/angular/material2/issues/2835)) ([18969f4](https://github.com/angular/material2/commit/18969f4))
* **autocomplete:** hide instead of close when options empty ([#2997](https://github.com/angular/material2/issues/2997)) ([a022035](https://github.com/angular/material2/commit/a022035))
* **autocomplete:** placeholder should float while panel is open ([#2730](https://github.com/angular/material2/issues/2730)) ([eec4dc6](https://github.com/angular/material2/commit/eec4dc6))
* **autocomplete:** scroll options below fold into view ([#2728](https://github.com/angular/material2/issues/2728)) ([6c84603](https://github.com/angular/material2/commit/6c84603))
* **autocomplete:** support rtl ([#2648](https://github.com/angular/material2/issues/2648)) ([4f59ad0](https://github.com/angular/material2/commit/4f59ad0))
* **autocomplete:** up arrow should set last item active ([#2776](https://github.com/angular/material2/issues/2776)) ([fd5e4d9](https://github.com/angular/material2/commit/fd5e4d9))
* **autosize:** export md-autosize directive ([#2432](https://github.com/angular/material2/issues/2432)) ([f2d73da](https://github.com/angular/material2/commit/f2d73da)), closes [#2419](https://github.com/angular/material2/issues/2419)
* **button:** add default color for mat-raised-button ([#3052](https://github.com/angular/material2/issues/3052)) ([6fe1d9a](https://github.com/angular/material2/commit/6fe1d9a))
* **button:** only flat button and icon buttons should inherit the color ([#2561](https://github.com/angular/material2/issues/2561)) ([ac363df](https://github.com/angular/material2/commit/ac363df)), closes [#2539](https://github.com/angular/material2/issues/2539)
* **button:** raised buttons in dark theme ([#3070](https://github.com/angular/material2/issues/3070)) ([87ab712](https://github.com/angular/material2/commit/87ab712))
* **button:** reuse _getHostElement() to avoid redundant elementRef.nativeElement calls ([#2625](https://github.com/angular/material2/issues/2625)) ([c7d1c17](https://github.com/angular/material2/commit/c7d1c17))
* **button-toggle:** add the setDisabledState from ControlValueAccessor ([#2430](https://github.com/angular/material2/issues/2430)) ([fb750b4](https://github.com/angular/material2/commit/fb750b4))
* **button-toggle:** conflict with radio component ([#2343](https://github.com/angular/material2/issues/2343)) ([9e99374](https://github.com/angular/material2/commit/9e99374)), closes [#2274](https://github.com/angular/material2/issues/2274)
* **button-toggle:** make conform with design specs ([#2570](https://github.com/angular/material2/issues/2570)) ([fed5d7b](https://github.com/angular/material2/commit/fed5d7b))
* **card:** fix padding for md-card-actions in xs screens ([#2567](https://github.com/angular/material2/issues/2567)) ([ad0df31](https://github.com/angular/material2/commit/ad0df31))
* **checkbox:** Emit event when checkbox's indeterminate value changes ([#2130](https://github.com/angular/material2/issues/2130)) ([f11c5eb](https://github.com/angular/material2/commit/f11c5eb))
* **checkbox:** rename tabindex to tabIndex ([#2953](https://github.com/angular/material2/issues/2953)) ([b91964a](https://github.com/angular/material2/commit/b91964a))
* **checkbox:** ripple color does not change ([#2857](https://github.com/angular/material2/issues/2857)) ([7ac29f8](https://github.com/angular/material2/commit/7ac29f8))
* **checkbox, radio:** not using theme border color ([#2744](https://github.com/angular/material2/issues/2744)) ([07ec765](https://github.com/angular/material2/commit/07ec765))
* **compatibility:** add missing mat- selectors ([#2923](https://github.com/angular/material2/issues/2923)) ([f29f7ab](https://github.com/angular/material2/commit/f29f7ab))
* **connected-position-strategy:** wrong logic when determining whether element is on screen ([#2677](https://github.com/angular/material2/issues/2677)) ([e055d05](https://github.com/angular/material2/commit/e055d05)), closes [#2102](https://github.com/angular/material2/issues/2102) [#2658](https://github.com/angular/material2/issues/2658)
* **dialog:** escape key not working once element loses focus ([#3082](https://github.com/angular/material2/issues/3082)) ([a08dc55](https://github.com/angular/material2/commit/a08dc55)), closes [#3009](https://github.com/angular/material2/issues/3009)
* **dialog:** prevent error when restoring focus on IE ([#2771](https://github.com/angular/material2/issues/2771)) ([153fcd3](https://github.com/angular/material2/commit/153fcd3)), closes [#2760](https://github.com/angular/material2/issues/2760)
* **dialog:** prevent the close button from submitting forms ([#2659](https://github.com/angular/material2/issues/2659)) ([29f939a](https://github.com/angular/material2/commit/29f939a)), closes [#2599](https://github.com/angular/material2/issues/2599)
* **dialog:** use injector from viewContainerRef if provided ([#2655](https://github.com/angular/material2/issues/2655)) ([be0da09](https://github.com/angular/material2/commit/be0da09))
* **docs:** properly create links in guide files ([#2770](https://github.com/angular/material2/issues/2770)) ([60f03ed](https://github.com/angular/material2/commit/60f03ed))
* **icon:** add caching of md-icon aria-label ([#2649](https://github.com/angular/material2/issues/2649)) ([08e9d70](https://github.com/angular/material2/commit/08e9d70)), closes [#2642](https://github.com/angular/material2/issues/2642)
* **input:** add more padding so that the hint doesn't overflow the container ([#2246](https://github.com/angular/material2/issues/2246)) ([d7831d9](https://github.com/angular/material2/commit/d7831d9))
* **input:** camel-case md-prefix and md-suffix ([#2639](https://github.com/angular/material2/issues/2639)) ([7562322](https://github.com/angular/material2/commit/7562322)), closes [#2636](https://github.com/angular/material2/issues/2636)
* **input:** disable underline with reactive forms ([#2565](https://github.com/angular/material2/issues/2565)) ([f9dd34f](https://github.com/angular/material2/commit/f9dd34f)), closes [#2558](https://github.com/angular/material2/issues/2558)
* **input:** disabled inputs should be grayed out ([#2513](https://github.com/angular/material2/issues/2513)) ([ed3ffe0](https://github.com/angular/material2/commit/ed3ffe0))
* **input:** ensure that property bindings work ([#2431](https://github.com/angular/material2/issues/2431)) ([b4b4224](https://github.com/angular/material2/commit/b4b4224)), closes [#2428](https://github.com/angular/material2/issues/2428)
* **input:** fix chrome 56 warning ([#2906](https://github.com/angular/material2/issues/2906)) ([62189a3](https://github.com/angular/material2/commit/62189a3))
* **input:** fix placeholder for number input with bad input. ([#2362](https://github.com/angular/material2/issues/2362)) ([52aa715](https://github.com/angular/material2/commit/52aa715))
* **input:** hints not being read out by screen readers ([#2856](https://github.com/angular/material2/issues/2856)) ([f899b5f](https://github.com/angular/material2/commit/f899b5f)), closes [#2798](https://github.com/angular/material2/issues/2798)
* **input:** horizontal overflow in IE and Edge ([#2784](https://github.com/angular/material2/issues/2784)) ([e0fe635](https://github.com/angular/material2/commit/e0fe635))
* **input:** properly determine input value ([#2455](https://github.com/angular/material2/issues/2455)) ([3a11927](https://github.com/angular/material2/commit/3a11927)), closes [#2441](https://github.com/angular/material2/issues/2441) [#2363](https://github.com/angular/material2/issues/2363)
* **input:** remove md-input and md-textarea in favor of md-input-container ([#2788](https://github.com/angular/material2/issues/2788)) ([7b30fdc](https://github.com/angular/material2/commit/7b30fdc))
* **input:** vendor-prefix ::placeholder ([#2547](https://github.com/angular/material2/issues/2547)) ([3b16648](https://github.com/angular/material2/commit/3b16648))
* **input-container:** prefix and suffix stretching together with parent ([#2496](https://github.com/angular/material2/issues/2496)) ([64f6d1b](https://github.com/angular/material2/commit/64f6d1b)), closes [#2493](https://github.com/angular/material2/issues/2493) [#1881](https://github.com/angular/material2/issues/1881) [#1421](https://github.com/angular/material2/issues/1421)
* **input-container:** reduce redundancy when forwarding the NgControl classes ([#2442](https://github.com/angular/material2/issues/2442)) ([8c0eef2](https://github.com/angular/material2/commit/8c0eef2))
* **option:** revert duplicate prop ([#3051](https://github.com/angular/material2/issues/3051)) ([516720f](https://github.com/angular/material2/commit/516720f))
* **overlay:** disable pointer events if overlay is detached ([#2747](https://github.com/angular/material2/issues/2747)) ([453fa7f](https://github.com/angular/material2/commit/453fa7f)), closes [#2739](https://github.com/angular/material2/issues/2739)
* **overlay:** fix pointer events for ie11 ([#3023](https://github.com/angular/material2/issues/3023)) ([597e3de](https://github.com/angular/material2/commit/597e3de)), closes [#3022](https://github.com/angular/material2/issues/3022)
* **progress-bar:** buffer animation not working in IE ([#2941](https://github.com/angular/material2/issues/2941)) ([ab8f98f](https://github.com/angular/material2/commit/ab8f98f)), closes [#2881](https://github.com/angular/material2/issues/2881)
* **progress-bar:** unable to apply visibility in indeterminate mode and reduce CSS ([#2417](https://github.com/angular/material2/issues/2417)) ([eb96b0c](https://github.com/angular/material2/commit/eb96b0c)), closes [#2413](https://github.com/angular/material2/issues/2413)
* **progress-spinner:** fix color input on md-spinner ([#2396](https://github.com/angular/material2/issues/2396)) ([6cb6576](https://github.com/angular/material2/commit/6cb6576)), closes [#2393](https://github.com/angular/material2/issues/2393)
* **radio:** change radio button trigger element to input element ([#2838](https://github.com/angular/material2/issues/2838)) ([2f10a95](https://github.com/angular/material2/commit/2f10a95))
* **ripple:** camel-cased CSS classes ([#2340](https://github.com/angular/material2/issues/2340)) ([c67f4e5](https://github.com/angular/material2/commit/c67f4e5))
* **ripple:** make ripples conform with specs ([#2859](https://github.com/angular/material2/issues/2859)) ([6381948](https://github.com/angular/material2/commit/6381948))
* **select:** avoid going into infinite loop under certain conditions ([#2955](https://github.com/angular/material2/issues/2955)) ([998a583](https://github.com/angular/material2/commit/998a583)), closes [#2950](https://github.com/angular/material2/issues/2950)
* **select:** don't open menu if there are no options ([#2924](https://github.com/angular/material2/issues/2924)) ([cc77ef4](https://github.com/angular/material2/commit/cc77ef4))
* **select:** fix select panel animation ([#2699](https://github.com/angular/material2/issues/2699)) ([15eb33a](https://github.com/angular/material2/commit/15eb33a)), closes [#2695](https://github.com/angular/material2/issues/2695)
* **select:** fix selection color ([#2697](https://github.com/angular/material2/issues/2697)) ([4e94da4](https://github.com/angular/material2/commit/4e94da4)), closes [#2696](https://github.com/angular/material2/issues/2696)
* **select:** selected option not being highlighted when options are added asynchronously ([#2499](https://github.com/angular/material2/issues/2499)) ([7fc38b9](https://github.com/angular/material2/commit/7fc38b9)), closes [#2497](https://github.com/angular/material2/issues/2497)
* **select:** set default font size ([#2976](https://github.com/angular/material2/issues/2976)) ([40bc486](https://github.com/angular/material2/commit/40bc486))
* **select:** set select value to trigger height and center text ([#3021](https://github.com/angular/material2/issues/3021)) ([ac9c090](https://github.com/angular/material2/commit/ac9c090))
* **select:** support use inside a custom value accessor ([#2704](https://github.com/angular/material2/issues/2704)) ([651440f](https://github.com/angular/material2/commit/651440f)), closes [#2609](https://github.com/angular/material2/issues/2609)
* **select:** transparent background when overscrolling ([#2117](https://github.com/angular/material2/issues/2117)) ([d9b2d85](https://github.com/angular/material2/commit/d9b2d85))
* **select:** trim long labels inside md-option ([#2444](https://github.com/angular/material2/issues/2444)) ([416f56f](https://github.com/angular/material2/commit/416f56f)), closes [#2440](https://github.com/angular/material2/issues/2440)
* **select:** view not updating when using OnPush detection strategy ([#2894](https://github.com/angular/material2/issues/2894)) ([3bcb7c3](https://github.com/angular/material2/commit/3bcb7c3)), closes [#2663](https://github.com/angular/material2/issues/2663) [#2269](https://github.com/angular/material2/issues/2269)
* **select:** parent align affects placeholder ([#2572](https://github.com/angular/material2/issues/2572)) ([a1c90b3](https://github.com/angular/material2/commit/a1c90b3))
* **sidenav:** animate content resizing for side mode. ([#2486](https://github.com/angular/material2/issues/2486)) ([4d33449](https://github.com/angular/material2/commit/4d33449))
* **sidenav:** fix animation issue for initially open sidenav ([#3045](https://github.com/angular/material2/issues/3045)) ([37e4bad](https://github.com/angular/material2/commit/37e4bad))
* **slide-toggle:** consistent naming of aria attributes ([#2688](https://github.com/angular/material2/issues/2688)) ([10bd6da](https://github.com/angular/material2/commit/10bd6da))
* **slider:** fire change event on value change via keyboard. ([#2807](https://github.com/angular/material2/issues/2807)) ([7f50d11](https://github.com/angular/material2/commit/7f50d11))
* **slider:** hide ticks when slider is disabled ([#2687](https://github.com/angular/material2/issues/2687)) ([e9ec8ab](https://github.com/angular/material2/commit/e9ec8ab))
* apply font-family to text components ([#2821](https://github.com/angular/material2/issues/2821)) ([d11673a](https://github.com/angular/material2/commit/d11673a))
* **slider:** make disabled state look like mocks ([#2604](https://github.com/angular/material2/issues/2604)) ([8263ffb](https://github.com/angular/material2/commit/8263ffb))
* **slider:** make min value style match mocks ([#2641](https://github.com/angular/material2/issues/2641)) ([737b608](https://github.com/angular/material2/commit/737b608))
* **slider:** round decimals in the thumb label ([#2527](https://github.com/angular/material2/issues/2527)) ([987897c](https://github.com/angular/material2/commit/987897c)), closes [#2511](https://github.com/angular/material2/issues/2511)
* **snack-bar:** improper button styling and improved handling of long text ([#2991](https://github.com/angular/material2/issues/2991)) ([93937e6](https://github.com/angular/material2/commit/93937e6)), closes [#2979](https://github.com/angular/material2/issues/2979)
* **snack-bar:** prevent error when opening multiple snack bars in fast succession ([#2392](https://github.com/angular/material2/issues/2392)) ([161f319](https://github.com/angular/material2/commit/161f319)), closes [#2390](https://github.com/angular/material2/issues/2390)
* **snack-bar:** SimpleSnackBar not being exported ([#3016](https://github.com/angular/material2/issues/3016)) ([a7a3967](https://github.com/angular/material2/commit/a7a3967)), closes [#3010](https://github.com/angular/material2/issues/3010)
* **tabs:** crashing on chrome under certain conditions ([#2411](https://github.com/angular/material2/issues/2411)) ([727ce53](https://github.com/angular/material2/commit/727ce53)), closes [#2151](https://github.com/angular/material2/issues/2151)
* **tabs:** fix ink not showing on chrome 57 ([#3041](https://github.com/angular/material2/issues/3041)) ([f24832c](https://github.com/angular/material2/commit/f24832c))
* **tabs:** infinite loop when selectedIndex is set to NaN ([#2389](https://github.com/angular/material2/issues/2389)) ([f4cfc2d](https://github.com/angular/material2/commit/f4cfc2d))
* **toolbar:** add toolbar role to host element ([#2914](https://github.com/angular/material2/issues/2914)) ([67032ca](https://github.com/angular/material2/commit/67032ca)), closes [#2909](https://github.com/angular/material2/issues/2909)
* **toolbar:** correct font-weight ([#2485](https://github.com/angular/material2/issues/2485)) ([1b44880](https://github.com/angular/material2/commit/1b44880))
* **toolbar:** prevent content overflow and line-wrapping ([#2454](https://github.com/angular/material2/issues/2454)) ([e728771](https://github.com/angular/material2/commit/e728771)), closes [#2451](https://github.com/angular/material2/issues/2451)
* **tooltip:** better handling of multi-line text ([#2472](https://github.com/angular/material2/issues/2472)) ([7863e38](https://github.com/angular/material2/commit/7863e38)), closes [#2205](https://github.com/angular/material2/issues/2205)
* **tooltip:** not working properly with ChangeDetectionStrategy.OnPush ([#2721](https://github.com/angular/material2/issues/2721)) ([632b964](https://github.com/angular/material2/commit/632b964)), closes [#2713](https://github.com/angular/material2/issues/2713)
* **tooltip:** provide a maximum width ([#2678](https://github.com/angular/material2/issues/2678)) ([fb5e1d4](https://github.com/angular/material2/commit/fb5e1d4)), closes [#2671](https://github.com/angular/material2/issues/2671)


### Features

* **autocomplete:** add autocomplete panel toggling ([#2452](https://github.com/angular/material2/issues/2452)) ([d4ab3d3](https://github.com/angular/material2/commit/d4ab3d3))
* **autocomplete:** add fallback positions ([#2726](https://github.com/angular/material2/issues/2726)) ([8fc7706](https://github.com/angular/material2/commit/8fc7706))
* **autocomplete:** add keyboard events to autocomplete ([#2723](https://github.com/angular/material2/issues/2723)) ([fcea9d4](https://github.com/angular/material2/commit/fcea9d4))
* **autocomplete:** add screenreader support ([#2729](https://github.com/angular/material2/issues/2729)) ([bd7f240](https://github.com/angular/material2/commit/bd7f240))
* **autocomplete:** add value support ([#2516](https://github.com/angular/material2/issues/2516)) ([5def001](https://github.com/angular/material2/commit/5def001))
* **autocomplete:** allow use of obj values ([#2792](https://github.com/angular/material2/issues/2792)) ([55e1847](https://github.com/angular/material2/commit/55e1847))
* **button-toggle:** Show selected option when md-button-toggle is disabled ([#3012](https://github.com/angular/material2/issues/3012)) ([1547440](https://github.com/angular/material2/commit/1547440)), closes [#3007](https://github.com/angular/material2/issues/3007)
* **compatibility:** remove conflicts with material1 css styling ([#2790](https://github.com/angular/material2/issues/2790)) ([210ff02](https://github.com/angular/material2/commit/210ff02))
* **dialog:** add a config option for passing in data ([#2266](https://github.com/angular/material2/issues/2266)) ([29cbe61](https://github.com/angular/material2/commit/29cbe61)), closes [#2181](https://github.com/angular/material2/issues/2181)
* **dialog:** add events (observables) for open & closeAll ([#2522](https://github.com/angular/material2/issues/2522)) ([23ab152](https://github.com/angular/material2/commit/23ab152))
* **dialog:** add the ability to align the content of md-dialog-actions ([#2557](https://github.com/angular/material2/issues/2557)) ([e18ab5d](https://github.com/angular/material2/commit/e18ab5d)), closes [#2483](https://github.com/angular/material2/issues/2483)
* **dialog:** support open with TemplateRef ([#2910](https://github.com/angular/material2/issues/2910)) ([bf0f625](https://github.com/angular/material2/commit/bf0f625))
* **focus-classes:** expose focus origin changes through observable ([#2974](https://github.com/angular/material2/issues/2974)) ([d4ba648](https://github.com/angular/material2/commit/d4ba648))
* **FocusOriginMonitor:** add support for touch events  ([#3020](https://github.com/angular/material2/issues/3020)) ([ec7e2e4](https://github.com/angular/material2/commit/ec7e2e4))
* **input:** option to imperatively float placeholder ([#2585](https://github.com/angular/material2/issues/2585)) ([fb0cf8a](https://github.com/angular/material2/commit/fb0cf8a)), closes [#2466](https://github.com/angular/material2/issues/2466)
* **list-key-manager:** active descendant support ([#2606](https://github.com/angular/material2/issues/2606)) ([e2ad3a0](https://github.com/angular/material2/commit/e2ad3a0))
* **menu:** Added ability to show the menu overlay around the menu trigger ([#1771](https://github.com/angular/material2/issues/1771)) ([592f33f](https://github.com/angular/material2/commit/592f33f))
* **overlay:** add fullscreen-enabled overlay class ([#1949](https://github.com/angular/material2/issues/1949)) ([0640302](https://github.com/angular/material2/commit/0640302))
* **screenshot:** Add screenshot function to e2e test (button and checkbox) ([#2532](https://github.com/angular/material2/issues/2532)) ([8ba8deb](https://github.com/angular/material2/commit/8ba8deb))
* **scripts:** push generated docs to material assets repo ([#2720](https://github.com/angular/material2/issues/2720)) ([ba12f44](https://github.com/angular/material2/commit/ba12f44))
* **select:** emit change event ([#2458](https://github.com/angular/material2/issues/2458)) ([e5bd15c](https://github.com/angular/material2/commit/e5bd15c)), closes [#2248](https://github.com/angular/material2/issues/2248)
* **sidenav:** add disableClose option ([#2501](https://github.com/angular/material2/issues/2501)) ([52ade97](https://github.com/angular/material2/commit/52ade97)), closes [#2462](https://github.com/angular/material2/issues/2462)
* **slide-toggle:** add support for labelPosition ([#2836](https://github.com/angular/material2/issues/2836)) ([68a0c90](https://github.com/angular/material2/commit/68a0c90)), closes [#2820](https://github.com/angular/material2/issues/2820)
* **slider:** emit input event when slider thumb moves ([#2325](https://github.com/angular/material2/issues/2325)) ([99963c4](https://github.com/angular/material2/commit/99963c4)), closes [#2296](https://github.com/angular/material2/issues/2296)
* **snack-bar:** allow addition of extra css classes ([#2804](https://github.com/angular/material2/issues/2804)) ([e783494](https://github.com/angular/material2/commit/e783494)), closes [#2664](https://github.com/angular/material2/issues/2664)
* **style:** add directive to determine how elements were focused. ([#2646](https://github.com/angular/material2/issues/2646)) ([8a6d902](https://github.com/angular/material2/commit/8a6d902))
* **tabs:** add the ability to invert the header ([#2391](https://github.com/angular/material2/issues/2391)) ([a494c92](https://github.com/angular/material2/commit/a494c92)), closes [#2387](https://github.com/angular/material2/issues/2387)
* **theming:** provide a content wrapper attribute ([#2170](https://github.com/angular/material2/issues/2170)) ([4bf4b87](https://github.com/angular/material2/commit/4bf4b87)), closes [#1938](https://github.com/angular/material2/issues/1938) [#2106](https://github.com/angular/material2/issues/2106)
* **tooltip:** reposition on scroll ([#2703](https://github.com/angular/material2/issues/2703)) ([bc52298](https://github.com/angular/material2/commit/bc52298))
* **viewport-ruler:** cache document client rect ([#2538](https://github.com/angular/material2/issues/2538)) ([d0c8f18](https://github.com/angular/material2/commit/d0c8f18))
* add a common class to be used when dealing with selection logic ([#2562](https://github.com/angular/material2/issues/2562)) ([c295fa9](https://github.com/angular/material2/commit/c295fa9))
* add simplified checkbox component for usage in other components ([#2619](https://github.com/angular/material2/issues/2619)) ([3b6cab0](https://github.com/angular/material2/commit/3b6cab0))
* remove the need for forRoot on material NgModules ([#2556](https://github.com/angular/material2/issues/2556)) ([b49bfce](https://github.com/angular/material2/commit/b49bfce))


### Performance Improvements

* **tabs:** reduce amount of reflows when aligning the ink bar ([#2372](https://github.com/angular/material2/issues/2372)) ([dab742f](https://github.com/angular/material2/commit/dab742f))


<a name="2.0.0-beta.1"></a>
# [2.0.0-beta.1 rebar-teacup](https://github.com/angular/material2/compare/2.0.0-beta.0...2.0.0-beta.1) (2016-12-23)

### Bug Fixes
* Remove `MdAutocompleteModule` that was accidentally included in beta.0
* Correct path to umd bundle in package.json ([#2368](https://github.com/angular/material2/issues/2368)) ([d286e6d](https://github.com/angular/material2/commit/d286e6d6472910ab41b8437d405cd3e902c9c848)), closes [#2366](https://github.com/angular/material2/issues/2366)


<a name="2.0.0-beta.0"></a>
# [2.0.0-beta.0 velvet-pizza](https://github.com/angular/material2/compare/2.0.0-alpha.9...2.0.0-beta.0) (2016-12-22)

### Breaking changes from alpha.11
* The `svgSrc` propert of `<md-icon>` has been removed. All SVG URLs must now be explicitly marked
as trusted using Angular's `DomSanitizer` service.
* The `<md-input>` element is deprecated in favor of `<md-input-container>`. This new component
allows for direct access to the native input element.
* All `@Input` properties have been changed to use their camelCase names for binding. The old names
are still available as deprecated but will be removed in the next release.
* All `@Directive` selectors are now camelCase to be consistent with Angular core. For example, 
`[md-tooltip]` is now `[mdTooltip]` The old selectors are still available as deprecated but will 
be removed in the next release.
* `<md-progress-circle>` has been renamed to `<md-progress-spinner>`. The old selector and symbols
are still available as deprecated but will be removed in the next release.
* `<md-sidenav-layout>` has been renamed to `<md-sidenav-container>`. The old selector is still 
available as deprecated but will be removed in the next release.
* Several components in `core/`, such as Overlay, have had their prefix changed to `cdk-` (short 
for "component dev kit"). This signifies that these are general-purpose tools for building 
components that are not coupled to Material Design.The old selectors are still 
available as deprecated but will be removed in the next release. The CSS classes have been changed.
* The `align` property for `md-checkbox` and `md-radio-button` has been changed to `labelPosition`
with values `before` and `after`.
* `MdTooltip` properties are now prefixed, e.g., `mdTooltipPosition`, `mdTooltipHideDelay`, etc.

### Note on HammerJS
HammerJS is now optional. It is still necessary for gestures to work within certain components, but
should no longer throw an error if it is missing.

### Bug Fixes

* **a11y:** add all providers to forRoot ([#2222](https://github.com/angular/material2/issues/2222)) ([9272b4b](https://github.com/angular/material2/commit/9272b4b)), closes [#2189](https://github.com/angular/material2/issues/2189)
* add re-exports for symbols needed by Aot ([#2149](https://github.com/angular/material2/issues/2149)) ([c324142](https://github.com/angular/material2/commit/c324142))
* **icon:** remove svgSrc, only allow trusted urls ([#1933](https://github.com/angular/material2/issues/1933)) ([4571561](https://github.com/angular/material2/commit/4571561))
* **input:** copy input state classes to md-input-container ([#2191](https://github.com/angular/material2/issues/2191)) ([f0c4148](https://github.com/angular/material2/commit/f0c4148))
* **input:** fix underline color to match spec ([#2167](https://github.com/angular/material2/issues/2167)) ([b850fed](https://github.com/angular/material2/commit/b850fed)), closes [#2126](https://github.com/angular/material2/issues/2126)
* **input:** label alignment in rtl ([#2047](https://github.com/angular/material2/issues/2047)) ([7b3a059](https://github.com/angular/material2/commit/7b3a059)), closes [#2034](https://github.com/angular/material2/issues/2034)
* **input:** treat number 0 as non-empty ([#2245](https://github.com/angular/material2/issues/2245)) ([a818579](https://github.com/angular/material2/commit/a818579))
* **input:** unable to focus input in IE 11 ([#2233](https://github.com/angular/material2/issues/2233)) ([8ec3a19](https://github.com/angular/material2/commit/8ec3a19))
* **overlay:** proper backdrop stacking with multiple overlays ([#2276](https://github.com/angular/material2/issues/2276)) ([b16031a](https://github.com/angular/material2/commit/b16031a)), closes [#2272](https://github.com/angular/material2/issues/2272)
* **platform:** Remove assumption of `window' in MdPlatform ([#2221](https://github.com/angular/material2/issues/2221)) ([e436775](https://github.com/angular/material2/commit/e436775))
* **positioning:** fallback positions should work while scrolled ([#2193](https://github.com/angular/material2/issues/2193)) ([8df30db](https://github.com/angular/material2/commit/8df30db))
* **progress-circle, progress-bar:** bind color via [color] rather than [attr.color] ([#2299](https://github.com/angular/material2/issues/2299)) ([e4d2bef](https://github.com/angular/material2/commit/e4d2bef))
* **progress-spinner:** Rename ProgressCircle to ProgressSpinner ([#2300](https://github.com/angular/material2/issues/2300)) ([221c234](https://github.com/angular/material2/commit/221c234))
* **select:** clear select if no option matches value ([#2110](https://github.com/angular/material2/issues/2110)) ([2855cc3](https://github.com/angular/material2/commit/2855cc3)), closes [#2109](https://github.com/angular/material2/issues/2109)
* **select:** make invalid selector more specific ([#2166](https://github.com/angular/material2/issues/2166)) ([a7c88c5](https://github.com/angular/material2/commit/a7c88c5))
* **sidenav:** make `focus-trap` occupy full height of sidenav ([#2145](https://github.com/angular/material2/issues/2145)) ([13223df](https://github.com/angular/material2/commit/13223df))
* **sidenav:** Rename md-sidenav-layout to md-sidenav-container. ([#2183](https://github.com/angular/material2/issues/2183)) ([8f1c5a9](https://github.com/angular/material2/commit/8f1c5a9))
* **slider:** prevent thumb from getting stuck on Mobile Safari ([#2142](https://github.com/angular/material2/issues/2142)) ([4adee46](https://github.com/angular/material2/commit/4adee46))
* **snack-bar:** clean up element when associated viewContainer is destroyed ([#2219](https://github.com/angular/material2/issues/2219)) ([db9608f](https://github.com/angular/material2/commit/db9608f)), closes [#2190](https://github.com/angular/material2/issues/2190)
* **tabs:** observing tab header label changes to recalculate width ([#2186](https://github.com/angular/material2/issues/2186)) ([7ab4430](https://github.com/angular/material2/commit/7ab4430)), closes [#2155](https://github.com/angular/material2/issues/2155)
* TSError: ? Unable to compile TypeScript when running 'gulp:build' ([#2132](https://github.com/angular/material2/issues/2132)) ([714c2a4](https://github.com/angular/material2/commit/714c2a4))
* **tests:** snackbar ref has unnecessary observable.of ([#2298](https://github.com/angular/material2/issues/2298)) ([d076bd3](https://github.com/angular/material2/commit/d076bd3))
* **tooltip:** add missing rxjs import ([#2288](https://github.com/angular/material2/issues/2288)) ([ba7053f](https://github.com/angular/material2/commit/ba7053f))


### Features
* make hammerjs optional ([#2280](https://github.com/angular/material2/issues/2280)) ([28691ca](https://github.com/angular/material2/commit/28691ca))
* **chips:** initial version of md-chip-list. ([#2242](https://github.com/angular/material2/issues/2242)) ([f45c315](https://github.com/angular/material2/commit/f45c315)) ([#2046](https://github.com/angular/material2/issues/2046)) ([ba85883](https://github.com/angular/material2/commit/ba85883)) ([#2332](https://github.com/angular/material2/issues/2332)) ([3f2db27](https://github.com/angular/material2/commit/3f2db27))
* **dialog:** add dialog content elements ([#2090](https://github.com/angular/material2/issues/2090)) ([cac72aa](https://github.com/angular/material2/commit/cac72aa)), closes [#1624](https://github.com/angular/material2/issues/1624) [#2042](https://github.com/angular/material2/issues/2042)
* **checkbox, radio:** change `align` to `labelPosition` (inverted) ([#2289](https://github.com/angular/material2/issues/2289)) ([a1f9028](https://github.com/angular/material2/commit/a1f9028))
* **connected-position:** apply the fallback position that shows the largest area of the element ([#2102](https://github.com/angular/material2/issues/2102)) ([4f5b9c5](https://github.com/angular/material2/commit/4f5b9c5)), closes [#2049](https://github.com/angular/material2/issues/2049)
* **core:** add scrollable view properties to connected pos strategy ([#2259](https://github.com/angular/material2/issues/2259)) ([b60d33f](https://github.com/angular/material2/commit/b60d33f))
* **input:** create md-input-container to eventually replace md-input ([#2052](https://github.com/angular/material2/issues/2052)) ([ca2046b](https://github.com/angular/material2/commit/ca2046b))
* **scroll:** provide directive and service to listen to scrolling ([#2188](https://github.com/angular/material2/issues/2188)) ([9b68e68](https://github.com/angular/material2/commit/9b68e68))
* **sidenav:** close via escape key and restore focus to trigger element ([#1990](https://github.com/angular/material2/issues/1990)) ([a1331ec](https://github.com/angular/material2/commit/a1331ec))
* **tooltip:** add input for delaying show and hide ([#2101](https://github.com/angular/material2/issues/2101)) ([e85d108](https://github.com/angular/material2/commit/e85d108))
* **toolbar** add responsive heights as per spec ([#2157](https://github.com/angular/material2/issues/2157)) ([78d54fc](https://github.com/angular/material2/commit/78d54fc08491ce35f9ad06dc50488cc4d4c3a5e8))

### Performance Improvements

* **sidenav:** avoid extra repaints while scrolling ([#2156](https://github.com/angular/material2/issues/2156)) ([b967712](https://github.com/angular/material2/commit/b967712))



<a name="2.0.0-alpha.11"></a>
# [2.0.0-alpha.11 polyester-golem](https://github.com/angular/material2/compare/2.0.0-alpha.9...2.0.0-alpha.11) (2016-12-08)


**NOTE:** Be sure to delete your previous install of `@angular/material` and install it fresh, as
`npm` sometimes doesn't see that there is a more recent alpha release.

### Bug Fixes

* **a11y:** improved accessibility in high contrast mode ([#1941](https://github.com/angular/material2/issues/1941)) ([5cf7d17](https://github.com/angular/material2/commit/5cf7d17)), closes [#421](https://github.com/angular/material2/issues/421) [#1769](https://github.com/angular/material2/issues/1769)
* **button:** ensure icons are aligned vertically. ([#1736](https://github.com/angular/material2/issues/1736)) ([d3a50b3](https://github.com/angular/material2/commit/d3a50b3)), closes [#1093](https://github.com/angular/material2/issues/1093)
* **button:** improved tap responsiveness on mobile ([#1792](https://github.com/angular/material2/issues/1792)) ([4183fbc](https://github.com/angular/material2/commit/4183fbc)), closes [#1316](https://github.com/angular/material2/issues/1316)
* **button:** remove `disabled` attribute when disabled value is false for MdAnchor ([#1789](https://github.com/angular/material2/issues/1789)) ([716372b](https://github.com/angular/material2/commit/716372b))
* **checkbox:** fix native checked not being checked when MdCheckbox initial checked value is true ([#2055](https://github.com/angular/material2/issues/2055)) ([3fd3117](https://github.com/angular/material2/commit/3fd3117))
* **checkbox, input, radio, slide-toggle:** implement setDisabledState from ControlValueAccessor ([#1750](https://github.com/angular/material2/issues/1750)) ([77a960c](https://github.com/angular/material2/commit/77a960c)), closes [#1171](https://github.com/angular/material2/issues/1171)
* **dialog:** add border radius ([#1872](https://github.com/angular/material2/issues/1872)) ([6aa7e22](https://github.com/angular/material2/commit/6aa7e22)), closes [#1868](https://github.com/angular/material2/issues/1868)
* **dialog:** avoid subpixel rendering issues and refactor GlobalPositionStrategy ([#1962](https://github.com/angular/material2/issues/1962)) ([1ea6d34](https://github.com/angular/material2/commit/1ea6d34)), closes [#932](https://github.com/angular/material2/issues/932)
* **dialog:** backdrop not being removed if it doesn't have transitions ([#1716](https://github.com/angular/material2/issues/1716)) ([accab20](https://github.com/angular/material2/commit/accab20)), closes [#1607](https://github.com/angular/material2/issues/1607)
* **elevation:** change elevations to match spec ([#1857](https://github.com/angular/material2/issues/1857)) ([c2597b6](https://github.com/angular/material2/commit/c2597b6))
* **interactivity-checker:** improve robustness of isTabbable ([#1950](https://github.com/angular/material2/issues/1950)) ([4b7e52d](https://github.com/angular/material2/commit/4b7e52d))
* **list:** prevent list item wrapper elements from collapsing ([#2075](https://github.com/angular/material2/issues/2075)) ([27f9c99](https://github.com/angular/material2/commit/27f9c99)), closes [#2012](https://github.com/angular/material2/issues/2012)
* **list-key-manager:** prevent the default keyboard actions ([#2009](https://github.com/angular/material2/issues/2009)) ([a8355e4](https://github.com/angular/material2/commit/a8355e4))
* **menu:** reposition menu if it would open off screen ([#1761](https://github.com/angular/material2/issues/1761)) ([7572e34](https://github.com/angular/material2/commit/7572e34))
* **overlay:** prevent blurry connected overlays ([#1784](https://github.com/angular/material2/issues/1784)) ([303dd69](https://github.com/angular/material2/commit/303dd69))
* **overlay-directives:** update offsets if they change after overlay creation ([#1981](https://github.com/angular/material2/issues/1981)) ([b36db15](https://github.com/angular/material2/commit/b36db15))
* **radio:** fix radio group behavior on change ([#1735](https://github.com/angular/material2/issues/1735)) ([bbc5f6a](https://github.com/angular/material2/commit/bbc5f6a))
* **ripple:** Always remove ripple after a certain period ([#1915](https://github.com/angular/material2/issues/1915)) ([62cc830](https://github.com/angular/material2/commit/62cc830))
* **ripple:** don't create background div until ripple becomes enabled ([#1849](https://github.com/angular/material2/issues/1849)) ([d7a54ef](https://github.com/angular/material2/commit/d7a54ef))
* **ripple:** Fix the ripple position when page is scrolled ([#1907](https://github.com/angular/material2/issues/1907)) ([dd508ea](https://github.com/angular/material2/commit/dd508ea))
* **sidenav:** resolve promise as false rather than ([#1930](https://github.com/angular/material2/issues/1930)) ([7816752](https://github.com/angular/material2/commit/7816752))
* **slider:** emit change event after updating value accessor ([#1901](https://github.com/angular/material2/issues/1901)) ([8caf9a6](https://github.com/angular/material2/commit/8caf9a6))
* **slider:** support for RTL and invert ([#1794](https://github.com/angular/material2/issues/1794)) ([5ac29dd](https://github.com/angular/material2/commit/5ac29dd))
* **spinner:** animation not being cleaned up when used with AoT ([#1838](https://github.com/angular/material2/issues/1838)) ([83de14f](https://github.com/angular/material2/commit/83de14f)), closes [#1283](https://github.com/angular/material2/issues/1283)
* **tab-link:** avoid potential memory leak ([#1877](https://github.com/angular/material2/issues/1877)) ([e332f15](https://github.com/angular/material2/commit/e332f15))
* **tabs:** tabs should update when tabs are added or removed ([#2014](https://github.com/angular/material2/issues/2014)) ([dfc580d](https://github.com/angular/material2/commit/dfc580d))
* **tooltip:** check tooltip disposed on animation hidden ([#1816](https://github.com/angular/material2/issues/1816)) ([9c0d82a](https://github.com/angular/material2/commit/9c0d82a))
* **tooltip:** don't show tooltip if message is empty or not present ([#2081](https://github.com/angular/material2/issues/2081)) ([2701aae](https://github.com/angular/material2/commit/2701aae)), closes [#2078](https://github.com/angular/material2/issues/2078)
* **tooltip:** throw a better error when an invalid position is passed ([#1986](https://github.com/angular/material2/issues/1986)) ([539e44e](https://github.com/angular/material2/commit/539e44e))


### Features

* **select** initial version of md-select (too many commits to list)
* **textarea:** add md-autosize directive (this will be more useful once the md-input refactoring is complete) ([#1846](https://github.com/angular/material2/issues/1846)) ([9ec17c0](https://github.com/angular/material2/commit/9ec17c0))
* **tabs:** paginate tab header when exceeds width ([#2084](https://github.com/angular/material2/issues/2084)) ([92e26d7](https://github.com/angular/material2/commit/92e26d7))
* **tabs:** add ripples to the tab group and nav bar links ([#1700](https://github.com/angular/material2/issues/1700)) ([b9fe75a](https://github.com/angular/material2/commit/b9fe75a))
* **tabs:** animate tab change, include optional dynamic height ([#1788](https://github.com/angular/material2/issues/1788)) ([f6944e4](https://github.com/angular/material2/commit/f6944e4))
* **tabs:** md-stretch-tabs ([#1909](https://github.com/angular/material2/issues/1909)) ([78464a2](https://github.com/angular/material2/commit/78464a2)), closes [#1353](https://github.com/angular/material2/issues/1353)
* **button-toggle:** add option for vertical toggle groups ([#1936](https://github.com/angular/material2/issues/1936)) ([cb0d6fc](https://github.com/angular/material2/commit/cb0d6fc)), closes [#1892](https://github.com/angular/material2/issues/1892)
* **dialog:** add configurable width, height and position ([#1848](https://github.com/angular/material2/issues/1848)) ([bc6cf6e](https://github.com/angular/material2/commit/bc6cf6e)), closes [#1698](https://github.com/angular/material2/issues/1698)
* **dialog:** add the ability to close all dialogs ([#1965](https://github.com/angular/material2/issues/1965)) ([b2999c9](https://github.com/angular/material2/commit/b2999c9))
* **focus-trap:** add the ability to specify a focus target ([#1752](https://github.com/angular/material2/issues/1752)) ([72ac7a0](https://github.com/angular/material2/commit/72ac7a0)), closes [#1468](https://github.com/angular/material2/issues/1468)
* **icon:** added color attribute to md-icon for icon theming ([#1896](https://github.com/angular/material2/issues/1896)) ([da5febc](https://github.com/angular/material2/commit/da5febc))
* **overlay:** emit position change event ([#1832](https://github.com/angular/material2/issues/1832)) ([b79c953](https://github.com/angular/material2/commit/b79c953))
* **overlay:** support min width and min height ([#2063](https://github.com/angular/material2/issues/2063)) ([a695574](https://github.com/angular/material2/commit/a695574))
* **overlay-directives:** attach and detach events ([#1972](https://github.com/angular/material2/issues/1972)) ([a5eab75](https://github.com/angular/material2/commit/a5eab75))
* **overlay-directives:** support fallback positions ([#1865](https://github.com/angular/material2/issues/1865)) ([aa472a0](https://github.com/angular/material2/commit/aa472a0))
* **sidenav:** emit event when backdrop is clicked ([#1638](https://github.com/angular/material2/issues/1638)) ([93807ed](https://github.com/angular/material2/commit/93807ed)), closes [#1427](https://github.com/angular/material2/issues/1427)
* **sidenav:** focus capturing ([#1695](https://github.com/angular/material2/issues/1695)) ([b9c3304](https://github.com/angular/material2/commit/b9c3304))
* **slider:** keyboard support ([#1759](https://github.com/angular/material2/issues/1759)) ([13b7dd0](https://github.com/angular/material2/commit/13b7dd0))
* **slider:** vertical mode ([#1878](https://github.com/angular/material2/issues/1878)) ([deb940f](https://github.com/angular/material2/commit/deb940f))
* **snackbar:** add onAction to snackbar ref ([#1826](https://github.com/angular/material2/issues/1826)) ([a40cae9](https://github.com/angular/material2/commit/a40cae9))
* **snackbar:** add timeout for snackbar ([#1856](https://github.com/angular/material2/issues/1856)) ([6ce6396](https://github.com/angular/material2/commit/6ce6396))
* **tooltip:** show tooltip on longpress; remove delay on mouseleave ([#1819](https://github.com/angular/material2/issues/1819)) ([1552d70](https://github.com/angular/material2/commit/1552d70))
* **a11y:** add wrap mode to key manager ([#1796](https://github.com/angular/material2/issues/1796)) ([3d4abac](https://github.com/angular/material2/commit/3d4abac))


<a name="2.0.0-alpha.10"></a>
# [2.0.0-alpha.10 mithril-hoverboard](https://github.com/angular/material2/compare/2.0.0-alpha.9...2.0.0-alpha.10) (2016-11-10)

## Breaking Changes
* `MdSnackbarConfig` no longer takes a `ViewContainerRef` as a contructor argument because the
   `ViewContainerRef` is now optional.
* Tabs no longer use an `md-tab-content` directive. Instead, the non-label content of the tab is
  used as its content. Labels can also be specified via attribute, so the tabs can now be given as:
  ```html
  <md-tab-group>
    <md-tab label="Overview">
      This is the overview tab
    </md-tab>
    <md-tab label="Details">
      This is the details tab
    </md-tab>
  </md-tab-group>
  ```

  You can still use `md-tab-label` to provide a label template.


### Features

* **tab-nav-bar:** new component! Provides a tab-bar for use with a router-outlet ([#1589](https://github.com/angular/material2/issues/1589)) ([572b36e](https://github.com/angular/material2/commit/572b36e))
* **a11y:** manager for list keyboard events ([#1599](https://github.com/angular/material2/issues/1599)) ([95b2a34](https://github.com/angular/material2/commit/95b2a34))
* **checkbox:** add color attribute. ([#1463](https://github.com/angular/material2/issues/1463)) ([333b11e](https://github.com/angular/material2/commit/333b11e))
* **checkbox:** add ripple ([#1611](https://github.com/angular/material2/issues/1611)) ([ef4c3c9](https://github.com/angular/material2/commit/ef4c3c9))
* **dialog:** add disableClose option ([#1678](https://github.com/angular/material2/issues/1678)) ([93f8e04](https://github.com/angular/material2/commit/93f8e04)), closes [#1419](https://github.com/angular/material2/issues/1419)
* **dialog:** allow for an object literal to be passed on init ([#1679](https://github.com/angular/material2/issues/1679)) ([f525db1](https://github.com/angular/material2/commit/f525db1))
* **dialog:** don't require a ViewContainerRef ([#1704](https://github.com/angular/material2/issues/1704)) ([f59030e](https://github.com/angular/material2/commit/f59030e))
* **menu:** add animations ([#1685](https://github.com/angular/material2/issues/1685)) ([7fcf511](https://github.com/angular/material2/commit/7fcf511))
* **menu:** allow menu-trigger to take a menu interface. ([#1564](https://github.com/angular/material2/issues/1564)) ([96d196a](https://github.com/angular/material2/commit/96d196a)), closes [#1560](https://github.com/angular/material2/issues/1560)
* **menu:** support icons ([#1702](https://github.com/angular/material2/issues/1702)) ([982cdaa](https://github.com/angular/material2/commit/982cdaa))
* **overlay:** add custom classes for backdrop ([#1532](https://github.com/angular/material2/issues/1532)) ([0b54668](https://github.com/angular/material2/commit/0b54668))
* **overlay:** set overlay size ([#1583](https://github.com/angular/material2/issues/1583)) ([ffbc295](https://github.com/angular/material2/commit/ffbc295))
* **overlay:** support all overlay config properties ([#1591](https://github.com/angular/material2/issues/1591)) ([6f322cf](https://github.com/angular/material2/commit/6f322cf))
* **overlay:** support custom offsets ([#1660](https://github.com/angular/material2/issues/1660)) ([1738d24](https://github.com/angular/material2/commit/1738d24))
* **overlay:** support rtl in overlays ([#1593](https://github.com/angular/material2/issues/1593)) ([b56f520](https://github.com/angular/material2/commit/b56f520))
* **radio:** add ripple ([#1553](https://github.com/angular/material2/issues/1553)) ([d83b3e0](https://github.com/angular/material2/commit/d83b3e0))
* **slider:** fire change event ([#1618](https://github.com/angular/material2/issues/1618)) ([780a654](https://github.com/angular/material2/commit/780a654))
* **slider:** implement ControlValueAccessor setDisabledState ([#1603](https://github.com/angular/material2/issues/1603)) ([437ec8e](https://github.com/angular/material2/commit/437ec8e))
* **snack bar:** add enter and exit animations. ([#1320](https://github.com/angular/material2/issues/1320)) ([6df29dc](https://github.com/angular/material2/commit/6df29dc))
* **snackbar:** don't require a ViewContainerRef ([#1783](https://github.com/angular/material2/issues/1783)) ([9115538](https://github.com/angular/material2/commit/9115538))
* **tabs:** simplify api ([#1645](https://github.com/angular/material2/issues/1645)) ([ea6c817](https://github.com/angular/material2/commit/ea6c817))
* **textarea:** initial md-textarea. Does not yet support auto-size. ([#1562](https://github.com/angular/material2/issues/1562)) ([aff22e5](https://github.com/angular/material2/commit/aff22e5))
* **tooltip:** add tooltip animations ([#1644](https://github.com/angular/material2/issues/1644)) ([52582f4](https://github.com/angular/material2/commit/52582f4))


### Bug Fixes

* **aot:** export dialog/snackbar containers through index ([#1378](https://github.com/angular/material2/issues/1378)) ([bb61928](https://github.com/angular/material2/commit/bb61928))
* **aot:** fix aot error w/ live announcer ([#1355](https://github.com/angular/material2/issues/1355)) ([276d07d](https://github.com/angular/material2/commit/276d07d))
* **button:** Changed button corner radius from 3px to 2px ([#1441](https://github.com/angular/material2/issues/1441)) ([ec48b34](https://github.com/angular/material2/commit/ec48b34))
* **button:** set vertical alignment for md-button and md-raised-button ([#1565](https://github.com/angular/material2/issues/1565)) ([f10ac7c](https://github.com/angular/material2/commit/f10ac7c))
* **button-toggle:** add exportAs ([#1528](https://github.com/angular/material2/issues/1528)) ([d2c288d](https://github.com/angular/material2/commit/d2c288d))
* **button-toggle:** disable user-select in button-toggle ([#1720](https://github.com/angular/material2/issues/1720)) ([83f6efc](https://github.com/angular/material2/commit/83f6efc))
* **checkbox:** disable for all non-false values ([#1631](https://github.com/angular/material2/issues/1631)) ([80491a9](https://github.com/angular/material2/commit/80491a9))
* **checkbox:** prevent checkbox being squished ([#1713](https://github.com/angular/material2/issues/1713)) ([6601949](https://github.com/angular/material2/commit/6601949))
* **checkbox:** vertically align for when there's no text ([#1721](https://github.com/angular/material2/issues/1721)) ([7fd0fcd](https://github.com/angular/material2/commit/7fd0fcd))
* **gestures:** don't clobber native drag events ([#1458](https://github.com/angular/material2/issues/1458)) ([b09465c](https://github.com/angular/material2/commit/b09465c)) ([#1744](https://github.com/angular/material2/issues/1744)) ([4af3cd3](https://github.com/angular/material2/commit/4af3cd3)), closes [#1025](https://github.com/angular/material2/issues/1025)
* **input:** correctly position md-hint in IE11 when position start ([#1674](https://github.com/angular/material2/issues/1674)) ([ecefb89](https://github.com/angular/material2/commit/ecefb89))
* **input:** remove invalid aria-target attribute ([#1513](https://github.com/angular/material2/issues/1513)) ([601c036](https://github.com/angular/material2/commit/601c036)), closes [#929](https://github.com/angular/material2/issues/929)
* **input:** set line-height to normal ([#1734](https://github.com/angular/material2/issues/1734)) ([f1f660e](https://github.com/angular/material2/commit/f1f660e))
* **list:** ensure multi-line lists expand to fill space ([#1466](https://github.com/angular/material2/issues/1466)) ([e7b872a](https://github.com/angular/material2/commit/e7b872a))
* **list:** prevent default black border from applying ([#1548](https://github.com/angular/material2/issues/1548)) ([4086b32](https://github.com/angular/material2/commit/4086b32)), closes [#1336](https://github.com/angular/material2/issues/1336)
* **list:** set flex-shrink for avatar ([#1464](https://github.com/angular/material2/issues/1464)) ([5a528aa](https://github.com/angular/material2/commit/5a528aa)), closes [#1403](https://github.com/angular/material2/issues/1403)
* **menu:** improve a11y for screenreaders ([#1715](https://github.com/angular/material2/issues/1715)) ([267e323](https://github.com/angular/material2/commit/267e323))
* **menu:** make menu open idempotent ([#1478](https://github.com/angular/material2/issues/1478)) ([a5b3296](https://github.com/angular/material2/commit/a5b3296))
* **menu:** properly handle spacebar events ([#1533](https://github.com/angular/material2/issues/1533)) ([cfe3e98](https://github.com/angular/material2/commit/cfe3e98)), closes [#1175](https://github.com/angular/material2/issues/1175)
* **menu:** update menu to use overlay rtl ([#1687](https://github.com/angular/material2/issues/1687)) ([2b913de](https://github.com/angular/material2/commit/2b913de))
* **menu:** update to use overlay backdrop ([#1534](https://github.com/angular/material2/issues/1534)) ([add0d23](https://github.com/angular/material2/commit/add0d23))
* **overlay:** ensure container covers entire screen ([#1634](https://github.com/angular/material2/issues/1634)) ([af39236](https://github.com/angular/material2/commit/af39236))
* **overlay:** fix connected position calculation while scrolled ([#1732](https://github.com/angular/material2/issues/1732)) ([2de461e](https://github.com/angular/material2/commit/2de461e))
* **overlay:** not taking up entire viewport if body is scrollable ([#1661](https://github.com/angular/material2/issues/1661)) ([16cbbab](https://github.com/angular/material2/commit/16cbbab)), closes [#1633](https://github.com/angular/material2/issues/1633)
* **overlay:** raise z-index for overlay-container ([#1614](https://github.com/angular/material2/issues/1614)) ([8f50c35](https://github.com/angular/material2/commit/8f50c35))
* **portal:** cleanup PortalHost on directive destroy ([#1703](https://github.com/angular/material2/issues/1703)) ([7e08468](https://github.com/angular/material2/commit/7e08468))
* **progress-bar:** bar being thrown off by parent's text-align ([#1717](https://github.com/angular/material2/issues/1717)) ([309d54c](https://github.com/angular/material2/commit/309d54c)), closes [#1165](https://github.com/angular/material2/issues/1165)
* **progress-circle:** allow value to be set to 0 ([#1536](https://github.com/angular/material2/issues/1536)) ([25c7fd5](https://github.com/angular/material2/commit/25c7fd5))
* **progress-spinner:** animation expanding parent element ([#1742](https://github.com/angular/material2/issues/1742)) ([4203d09](https://github.com/angular/material2/commit/4203d09)), closes [#1259](https://github.com/angular/material2/issues/1259)
* **radio:** only call change callback with user input ([#1521](https://github.com/angular/material2/issues/1521)) ([920c875](https://github.com/angular/material2/commit/920c875))
* **radio:** only emit change event on user interaction ([#1680](https://github.com/angular/material2/issues/1680)) ([0d552f5](https://github.com/angular/material2/commit/0d552f5))
* **radio:** only fire group change if there is a group ([#1622](https://github.com/angular/material2/issues/1622)) ([065469a](https://github.com/angular/material2/commit/065469a))
* **radio:** Uncheck radio group if uncheck radio button programmatically ([#1561](https://github.com/angular/material2/issues/1561)) ([c108607](https://github.com/angular/material2/commit/c108607)), closes [#609](https://github.com/angular/material2/issues/609)
* **ripple:** disable pointer events on ripple ([#1623](https://github.com/angular/material2/issues/1623)) ([f91ea21](https://github.com/angular/material2/commit/f91ea21)) ([#1684](https://github.com/angular/material2/issues/1684)) ([7336b90](https://github.com/angular/material2/commit/7336b90))
* **ripple:** prevent color flicker on radio/checkbox ([#1705](https://github.com/angular/material2/issues/1705)) ([8ce65ca](https://github.com/angular/material2/commit/8ce65ca))
* **sidenav:** resolve the promise when sidenav is initialized opened. ([#1666](https://github.com/angular/material2/issues/1666)) ([a0d85d8](https://github.com/angular/material2/commit/a0d85d8)), closes [#1382](https://github.com/angular/material2/issues/1382)
* **slide-toggle:** disabled theme not working and dragging works if disabled ([#1268](https://github.com/angular/material2/issues/1268)) ([8908366](https://github.com/angular/material2/commit/8908366))
* **slide-toggle:** emit change event after drag end  ([#1405](https://github.com/angular/material2/issues/1405)) ([0b5b6f2](https://github.com/angular/material2/commit/0b5b6f2))
* **slide-toggle:** remove view encapsulation ([#1446](https://github.com/angular/material2/issues/1446)) ([cbecbce](https://github.com/angular/material2/commit/cbecbce)), closes [#1343](https://github.com/angular/material2/issues/1343)
* **slide-toggle:** thumb spacing at end for rtl ([#1659](https://github.com/angular/material2/issues/1659)) ([ad3100e](https://github.com/angular/material2/commit/ad3100e))
* **slide-toggle:** update colors to match spec ([#1612](https://github.com/angular/material2/issues/1612)) ([596d994](https://github.com/angular/material2/commit/596d994))
* **slider:** clamp thumb between min and max ([#1617](https://github.com/angular/material2/issues/1617)) ([783dbb3](https://github.com/angular/material2/commit/783dbb3)), closes [#1557](https://github.com/angular/material2/issues/1557)
* **slider:** correctly detect when sidenav align changes. ([#1758](https://github.com/angular/material2/issues/1758)) ([5ffdea6](https://github.com/angular/material2/commit/5ffdea6))
* **slider:** update thumb pos & ticks when min/max change ([#1598](https://github.com/angular/material2/issues/1598)) ([ff84842](https://github.com/angular/material2/commit/ff84842))
* **slider:** update thumb position when value changes. Closes [#1386](https://github.com/angular/material2/issues/1386) ([#1610](https://github.com/angular/material2/issues/1610)) ([8e7f80d](https://github.com/angular/material2/commit/8e7f80d))
* **slider:** use percent values for the track ([#1663](https://github.com/angular/material2/issues/1663)) ([8815846](https://github.com/angular/material2/commit/8815846)), closes [#1389](https://github.com/angular/material2/issues/1389) [#1304](https://github.com/angular/material2/issues/1304) [#1234](https://github.com/angular/material2/issues/1234)
* **snackbar:** add explicit box-sizing ([#1413](https://github.com/angular/material2/issues/1413)) ([580da74](https://github.com/angular/material2/commit/580da74)), closes [#1412](https://github.com/angular/material2/issues/1412)
* **snackbar:** always clear ref when dismissing ([#1773](https://github.com/angular/material2/issues/1773)) ([3c5b632](https://github.com/angular/material2/commit/3c5b632))
* **snackbar:** remove even if still animating open ([#1797](https://github.com/angular/material2/issues/1797)) ([523a48e](https://github.com/angular/material2/commit/523a48e))
* **snackbar:** snackbars sometimes don't get removed ([#1795](https://github.com/angular/material2/issues/1795)) ([fcd29c8](https://github.com/angular/material2/commit/fcd29c8))
* **tabs:** make [@Output](https://github.com/Output) not private ([#1636](https://github.com/angular/material2/issues/1636)) ([04e2201](https://github.com/angular/material2/commit/04e2201))
* **tabs:** set correct min-width on mobile devices ([#1351](https://github.com/angular/material2/issues/1351)) ([e270e50](https://github.com/angular/material2/commit/e270e50)), closes [#1350](https://github.com/angular/material2/issues/1350)
* **tooltip:** remove tooltip component after its parent destroyed ([#1470](https://github.com/angular/material2/issues/1470)) ([92ac392](https://github.com/angular/material2/commit/92ac392)), closes [#1111](https://github.com/angular/material2/issues/1111)
* correct EventEmitter generic type across lib ([#1620](https://github.com/angular/material2/issues/1620)) ([0174fa9](https://github.com/angular/material2/commit/0174fa9))
* disable ripples when parent component is disabled ([#1778](https://github.com/angular/material2/issues/1778)) ([6b9e11c](https://github.com/angular/material2/commit/6b9e11c))


### Performance Improvements

* **progress-circle:** improved rendering performance ([#1635](https://github.com/angular/material2/issues/1635)) ([0883fb2](https://github.com/angular/material2/commit/0883fb2))



<a name="2.0.0-alpha.9"></a>
# [2.0.0-alpha.9 cobalt-kraken](https://github.com/angular/material2/compare/2.0.0-alpha.8...2.0.0-alpha.9) (2016-09-26)


## Breaking Changes

Angular Material has changed from `@angular2-material/...` packages to a single package under
`@angular/material`. Along with this change, there is a new NgModule, `MaterialModule`, that
contains all of the components. Build tools such as [`rollup.js`](http://rollupjs.org/) can perform
tree-shaking to eliminate the code for components that you aren't using.

The addition of theming as also changed the directory structure for bringing the core css into your
application. See the new [theming guide](guides/theming.md) for more information.


### Features

* **theming:** add initial version for theming ([#1239](https://github.com/angular/material2/issues/1239)) ([e0726e1](https://github.com/angular/material2/commit/e0726e1))
* **dialog:** initial version of dialog ([#1041](https://github.com/angular/material2/issues/1041)) ([7ecda22](https://github.com/angular/material2/commit/7ecda22), [#1321](https://github.com/angular/material2/issues/1321)) ([74dc5b2](https://github.com/angular/material2/commit/74dc5b2), [#1330](https://github.com/angular/material2/issues/1330)) ([23143b9](https://github.com/angular/material2/commit/23143b9))
* **snack-bar:** initial version of MdSnackBar. ([#1296](https://github.com/angular/material2/issues/1296)) ([a732e88](https://github.com/angular/material2/commit/a732e88))
* **packaging:** move packaging to a single "[@angular](https://github.com/angular)/material" ([#1286](https://github.com/angular/material2/issues/1286)) ([b5c8c63](https://github.com/angular/material2/commit/b5c8c63))
* **a11y:** add basic focus-trap directive ([#1311](https://github.com/angular/material2/issues/1311)) ([3e8b9d9](https://github.com/angular/material2/commit/3e8b9d9))
* **a11y:** initial interactivity checker ([#1288](https://github.com/angular/material2/issues/1288)) ([8a4b69d](https://github.com/angular/material2/commit/8a4b69d))
* **card:** add md-card-footer ([#1178](https://github.com/angular/material2/issues/1178)) ([1c2a3f1](https://github.com/angular/material2/commit/1c2a3f1))

### Bug Fixes

* **aot:** change [@Inputs](https://github.com/Inputs) to not be private ([#1289](https://github.com/angular/material2/issues/1289)) ([b284dd4](https://github.com/angular/material2/commit/b284dd4))
* **checkbox, slide-toggle:** forward required attribute to input. ([#1137](https://github.com/angular/material2/issues/1137)) ([0e9383a](https://github.com/angular/material2/commit/0e9383a)), closes [#1133](https://github.com/angular/material2/issues/1133)
* **gestures:** add hammer types by default ([#1309](https://github.com/angular/material2/issues/1309)) ([1a824d2](https://github.com/angular/material2/commit/1a824d2))
* **grid-list:** darken grid footer ([#1310](https://github.com/angular/material2/issues/1310)) ([f9116f3](https://github.com/angular/material2/commit/f9116f3))
* **grid-list:** hide overflow on tiles ([#1299](https://github.com/angular/material2/issues/1299)) ([06a6076](https://github.com/angular/material2/commit/06a6076))
* **input:** input should not be treated as empty if it is a date field.  ([#846](https://github.com/angular/material2/issues/846)) ([fe2b493](https://github.com/angular/material2/commit/fe2b493)), closes [#845](https://github.com/angular/material2/issues/845) [#845](https://github.com/angular/material2/issues/845) [#845](https://github.com/angular/material2/issues/845)
* **sidenav:** align text at start ([#1297](https://github.com/angular/material2/issues/1297)) ([0e0ff0e](https://github.com/angular/material2/commit/0e0ff0e))
* **sidenav:** fix dark theme ([#1319](https://github.com/angular/material2/issues/1319)) ([332a4a2](https://github.com/angular/material2/commit/332a4a2))
* **sidenav:** fix Promise type to match ([#1188](https://github.com/angular/material2/issues/1188)) ([3d5ceab](https://github.com/angular/material2/commit/3d5ceab))
* **theming:** set input default color to currentColor in input theme ([#1260](https://github.com/angular/material2/issues/1260)) ([#1262](https://github.com/angular/material2/issues/1262)) ([fa78f72](https://github.com/angular/material2/commit/fa78f72))


<a name="2.0.0-alpha.8"></a>
# [2.0.0-alpha.8 ectoplasm-helicopter](https://github.com/angular/material2/compare/g3_v2_0...2.0.0-alpha.8) (2016-09-01)

### Breaking Changes

* all: we've updated our packaging to match angular/angular's packaging.  If you're using SystemJS in your project, you will probably want to
switch to using our UMD bundles.  Example config:

```ts
'@angular2-material/core': {
    format: 'cjs',
    main: 'core.umd.js'
  }
```

You can see a more detailed example in our [demo app's system config](https://github.com/angular/material2/blob/master/src/demo-app/system-config.ts).

In addition to this, each component now has an `index.js` file, so you should now have imports like
```ts
import {MdButtonModule} from '@angular2-material/button'
```

Instead of 
```ts
import {MdButtonModule} from '@angular2-material/button/button'
```

* all: material modules must be included with `forRoot()` when bootstrapping. See the [ngModules guide](https://angular.io/docs/ts/latest/cookbook/ngmodule-faq.html#!#q-for-root) for 
more information.

```ts
@NgModule({
    imports: [
        MdCoreModule.forRoot(),
        MdRadioModule.forRoot(),
        MdIconModule.forRoot()
    ]
...
});
```

* all: material now depends on TypeScript 2.0

* input: `md-input` attributes now match the casing of native attributes. Previously they were camel-cased; now they are all lowercase. 
Example: `autoComplete` is now `autocomplete`.   See [#1066](https://github.com/angular/material2/pull/1066) for a full list.

* overlay: overlays are now synchronous. This means actions like creating an overlay no longer return a promise.


### Bug Fixes

* **button:** hover styles no longer applied to disabled buttons ([#909](https://github.com/angular/material2/issues/909)) ([21e419d](https://github.com/angular/material2/commit/21e419d)), closes [#866](https://github.com/angular/material2/issues/866)
* **button:** stop using `Type` from [@angular](https://github.com/angular) ([#991](https://github.com/angular/material2/issues/991)) ([97d3ed3](https://github.com/angular/material2/commit/97d3ed3))
* **button-toggle:** toggle group should not emit an initial change event. ([#1144](https://github.com/angular/material2/issues/1144)) ([e5830d1](https://github.com/angular/material2/commit/e5830d1))
* **card:** remove unnecessary intermediate div ([#1068](https://github.com/angular/material2/issues/1068)) ([b5e1e33](https://github.com/angular/material2/commit/b5e1e33))
* **checkbox:** export TransitionCheckState enum ([#1147](https://github.com/angular/material2/issues/1147)) ([cda90f3](https://github.com/angular/material2/commit/cda90f3))
* **input:** make attributes match native ones ([#1066](https://github.com/angular/material2/issues/1066)) ([f3a7b91](https://github.com/angular/material2/commit/f3a7b91)), closes [#1065](https://github.com/angular/material2/issues/1065)
* **ngc:** _onDragStart/End are called with one param ([#1113](https://github.com/angular/material2/issues/1113)) ([6e5d260](https://github.com/angular/material2/commit/6e5d260)), closes [#1112](https://github.com/angular/material2/issues/1112)
* **ngc:** don't emit HTMLElement in JS files ([#1061](https://github.com/angular/material2/issues/1061)) ([32eacd2](https://github.com/angular/material2/commit/32eacd2))
* **rc6:** add directives for custom elements that are part of the APIs. ([#1121](https://github.com/angular/material2/issues/1121)) ([2c0dfcb](https://github.com/angular/material2/commit/2c0dfcb))
* **sidenav:** turn off view encapsulation and refactor css ([#1114](https://github.com/angular/material2/issues/1114)) ([97fe211](https://github.com/angular/material2/commit/97fe211))
* **tabs:** change missed md-active to md-tab-active ([#1044](https://github.com/angular/material2/issues/1044)) ([87b6193](https://github.com/angular/material2/commit/87b6193))

### Features

* **menu:** add keyboard events and improve accessibility ([#1132](https://github.com/angular/material2/issues/1132)) ([3669f06](https://github.com/angular/material2/commit/3669f06))
* **modules:** add `forRoot()` to material modules with providers ([#1122](https://github.com/angular/material2/issues/1122)) ([9ff6196](https://github.com/angular/material2/commit/9ff6196))
* **modules:** add `forRoot()` to all modules ([#1166](https://github.com/angular/material2/issues/1166)) ([21dc44a](https://github.com/angular/material2/commit/21dc44a))
* **overlay:** make overlays synchronous ([#1079](https://github.com/angular/material2/issues/1079)) ([cdad90b](https://github.com/angular/material2/commit/cdad90b))
* **slider:** add thumb-label ([#976](https://github.com/angular/material2/issues/976)) ([22d70ae](https://github.com/angular/material2/commit/22d70ae))
* **slider:** support ngModel ([#1029](https://github.com/angular/material2/issues/1029)) ([8828358](https://github.com/angular/material2/commit/8828358))
* **tabs:** support for `disabled` tabs ([#934](https://github.com/angular/material2/issues/934)) ([9d51deb](https://github.com/angular/material2/commit/9d51deb)), closes [#880](https://github.com/angular/material2/issues/880)

<a name="2.0.0-alpha.7"></a>
# [2.0.0-alpha.7 wax-umpire](https://github.com/angular/material2/compare/2.0.0-alpha.6...2.0.0-alpha.7) (2016-08-09)


### Bug Fixes

* **checkbox:** wrong cursor when disabled ([#908](https://github.com/angular/material2/issues/908)) ([5251c27](https://github.com/angular/material2/commit/5251c27)), closes [#907](https://github.com/angular/material2/issues/907)
* **checkbox, slide-toggle:** only emit change event if native input emitted one. ([#820](https://github.com/angular/material2/issues/820)) ([d52e6e0](https://github.com/angular/material2/commit/d52e6e0)), closes [#575](https://github.com/angular/material2/issues/575)
* **gestures:** custom recognizers should not inherit twice. ([#902](https://github.com/angular/material2/issues/902)) ([c68efbd](https://github.com/angular/material2/commit/c68efbd))
* **gestures:** ensure drag and pan are recognized with slide ([#901](https://github.com/angular/material2/issues/901)) ([3179fec](https://github.com/angular/material2/commit/3179fec))
* **input:** ensure all of label displays on safari ([#871](https://github.com/angular/material2/issues/871)) ([c8303b4](https://github.com/angular/material2/commit/c8303b4)), closes [#795](https://github.com/angular/material2/issues/795)
* **overlay:** lazily create container ([#894](https://github.com/angular/material2/issues/894)) ([1efbbb9](https://github.com/angular/material2/commit/1efbbb9))
* **progress-circle:** correct elapsed time calculation ([#927](https://github.com/angular/material2/issues/927)) ([0b17cd3](https://github.com/angular/material2/commit/0b17cd3)), closes [#926](https://github.com/angular/material2/issues/926)
* **progress-circle:** remove performance.now to support non browser envs ([#857](https://github.com/angular/material2/issues/857)) ([14c1765](https://github.com/angular/material2/commit/14c1765))
* **progress-circle:** remove references to window ([#838](https://github.com/angular/material2/issues/838)) ([66ddd3a](https://github.com/angular/material2/commit/66ddd3a)), closes [#837](https://github.com/angular/material2/issues/837)
* **radio:** only emit change event if native input does. ([#911](https://github.com/angular/material2/issues/911)) ([23a61ab](https://github.com/angular/material2/commit/23a61ab)), closes [#791](https://github.com/angular/material2/issues/791)
* **slide-toggle:** fix runtime exception for incorrect mousedown binding. ([#828](https://github.com/angular/material2/issues/828)) ([bbbc87f](https://github.com/angular/material2/commit/bbbc87f)), closes [#828](https://github.com/angular/material2/issues/828)
* fix type mismatches when offline compiling. ([#835](https://github.com/angular/material2/issues/835)) ([4bb7790](https://github.com/angular/material2/commit/4bb7790))


### Features

* Add NgModules ([#950](https://github.com/angular/material2/issues/950)) ([ca351b2](https://github.com/angular/material2/commit/ca351b2))

Note that NgModules are now the supported way of including the Material components in your app.
The MD_XXX_DIRECTIVES constants are now deprecated and will be removed in alpha.8.


* **tooltip:** initial tooltip implementation ([#799](https://github.com/angular/material2/issues/799)) ([f5e2a81](https://github.com/angular/material2/commit/f5e2a81))
* **md-slider:** initial version for md-slider ([#779](https://github.com/angular/material2/issues/779)) ([8354750](https://github.com/angular/material2/commit/8354750))
* **md-menu** initial version for md-menu (more features coming in alpha.8) ([#893](https://github.com/angular/material2/issues/893)) ([16eb6be](https://github.com/angular/material2/commit/16eb6be)) ([#855](https://github.com/angular/material2/issues/855)) ([e324e47](https://github.com/angular/material2/commit/e324e47)) ([#867](https://github.com/angular/material2/issues/867)) ([9a32489](https://github.com/angular/material2/commit/9a32489))
* **ripple:** initial mdInkRipple implementation ([#681](https://github.com/angular/material2/issues/681)) ([47448cb](https://github.com/angular/material2/commit/47448cb))
* **button:** add ripple to md-button ([32aa461](https://github.com/angular/material2/commit/32aa461))
* **input:** support autocapitalize and autocorrect attributes ([#858](https://github.com/angular/material2/issues/858)) ([b2471f2](https://github.com/angular/material2/commit/b2471f2)) 
* **slide-toggle:** add drag functionality to thumb ([#750](https://github.com/angular/material2/issues/750)) ([25b4f21](https://github.com/angular/material2/commit/25b4f21))


### In-progress, not yet released
* **dialog:** add styles and ability to close. ([#862](https://github.com/angular/material2/issues/862)) ([758b851](https://github.com/angular/material2/commit/758b851))
* **dialog:** initial framework for md-dialog ([#761](https://github.com/angular/material2/issues/761)) ([9552ed5](https://github.com/angular/material2/commit/9552ed5))


### Code health
* **tabs:** adds e2e tests for tabs ([#650](https://github.com/angular/material2/issues/650)) ([3c74ae0](https://github.com/angular/material2/commit/3c74ae0)), closes [#549](https://github.com/angular/material2/issues/549)

### BREAKING CHANGES

* radio: radio-button will no longer emit change event on de-select.



<a name="2.0.0-alpha.6"></a>
# [2.0.0-alpha.6 carbonfiber-discotheque](https://github.com/angular/material2/compare/2.0.0-alpha.5...2.0.0-alpha.6) (2016-06-30)

### Breaking changes
* `MdRadioDispatcher` is now `MdUniqueSelectionDispatcher` and is imported from `core`
* Form controls use the new `@angular/forms` package. To make migration easier, you can 
  alternatively install alpha.5-3, which is the same as alpha.6 without the new forms package.
  [Please see the docs for the new forms module](https://angular.io/docs/ts/latest/guide/forms.html).


### Bug Fixes

* **button:** add the focus() method to buttons. ([#643](https://github.com/angular/material2/issues/643)) ([a6e74ce](https://github.com/angular/material2/commit/a6e74ce)), closes [#510](https://github.com/angular/material2/issues/510)
* **button:** focus state matches spec ([#467](https://github.com/angular/material2/issues/467)) ([b24d321](https://github.com/angular/material2/commit/b24d321))
* **checkbox:** checkbox animation works in Safari ([#594](https://github.com/angular/material2/issues/594)) ([0a9fb83](https://github.com/angular/material2/commit/0a9fb83))
* **checkbox:** prevent double click events ([#672](https://github.com/angular/material2/issues/672)) ([afed818](https://github.com/angular/material2/commit/afed818)), closes [#671](https://github.com/angular/material2/issues/671)
* **core:** resolve compilation errors for latest Typescript 1.9 ([#624](https://github.com/angular/material2/issues/624)) ([e366fa0](https://github.com/angular/material2/commit/e366fa0)), closes [#624](https://github.com/angular/material2/issues/624)
* **demo-app:** resolve mapping paths in relative. ([#566](https://github.com/angular/material2/issues/566)) ([421828a](https://github.com/angular/material2/commit/421828a)), closes [#566](https://github.com/angular/material2/issues/566)
* **forms:** update components to new forms module ([#745](https://github.com/angular/material2/issues/745)) ([653fcee](https://github.com/angular/material2/commit/653fcee))
* **grid-list:** account for gutter in total list height ([#545](https://github.com/angular/material2/issues/545)) ([b47097d](https://github.com/angular/material2/commit/b47097d))
* **input:** Fix floating label width ([#689](https://github.com/angular/material2/issues/689)) ([cf2703c](https://github.com/angular/material2/commit/cf2703c)), closes [#689](https://github.com/angular/material2/issues/689) [#688](https://github.com/angular/material2/issues/688)
* **input:** placeholder text is hidden by parent visibility ([#680](https://github.com/angular/material2/issues/680)) ([b407278](https://github.com/angular/material2/commit/b407278)), closes [#670](https://github.com/angular/material2/issues/670)
* **overlay:** add a z-index. ([#615](https://github.com/angular/material2/issues/615)) ([89ab2f5](https://github.com/angular/material2/commit/89ab2f5))
* **progress-bar:** determinate state reflects value ([#542](https://github.com/angular/material2/issues/542)) ([6b86df0](https://github.com/angular/material2/commit/6b86df0)), closes [#519](https://github.com/angular/material2/issues/519)
* **radio:** fix the baseline of radio buttons ([#642](https://github.com/angular/material2/issues/642)) ([31f0c7f](https://github.com/angular/material2/commit/31f0c7f)), closes [#642](https://github.com/angular/material2/issues/642)
* **radio:** model should update before change event is fired ([#456](https://github.com/angular/material2/issues/456)) ([c923f56](https://github.com/angular/material2/commit/c923f56)), closes [#448](https://github.com/angular/material2/issues/448)
* **radio:** support aria-label(ledby) on md-radio ([#586](https://github.com/angular/material2/issues/586)) ([#596](https://github.com/angular/material2/issues/596)) ([8ccc49b](https://github.com/angular/material2/commit/8ccc49b))
* **release:** make resource-inlining regex non-greedy ([#653](https://github.com/angular/material2/issues/653)) ([e808452](https://github.com/angular/material2/commit/e808452))
* **sidenav:** md-content now fills height ([#703](https://github.com/angular/material2/issues/703)) ([e10172c](https://github.com/angular/material2/commit/e10172c)), closes [#606](https://github.com/angular/material2/issues/606)
* **sidenav:** resolve compilation errors for latest Typescript 1.9 ([#627](https://github.com/angular/material2/issues/627)) ([f7f0b4a](https://github.com/angular/material2/commit/f7f0b4a)), closes [#627](https://github.com/angular/material2/issues/627)
* **slide-toggle:** apply typography styles to slide-toggle ([#634](https://github.com/angular/material2/issues/634)) ([bbd96e8](https://github.com/angular/material2/commit/bbd96e8)), closes [#633](https://github.com/angular/material2/issues/633)
* **slide-toggle:** stop change event firing upon init ([#713](https://github.com/angular/material2/issues/713)) ([f21b2f4](https://github.com/angular/material2/commit/f21b2f4)), closes [#709](https://github.com/angular/material2/issues/709)
* **spinner:** omit min/max/value for indeterminate and correctly set mode ([#640](https://github.com/angular/material2/issues/640)) ([a5944da](https://github.com/angular/material2/commit/a5944da))
* **tabs:** adds support for async tabs ([#639](https://github.com/angular/material2/issues/639)) ([231467d](https://github.com/angular/material2/commit/231467d)), closes [#574](https://github.com/angular/material2/issues/574)
* **tabs:** removes minimum height ([#641](https://github.com/angular/material2/issues/641)) ([750a8e3](https://github.com/angular/material2/commit/750a8e3)), closes [#570](https://github.com/angular/material2/issues/570)
* **theme:** fix card and list colors for dark themes ([#667](https://github.com/angular/material2/issues/667)) ([ce27341](https://github.com/angular/material2/commit/ce27341)), closes [#667](https://github.com/angular/material2/issues/667) [#350](https://github.com/angular/material2/issues/350)
* **toolbar:** disable view encapsulation. ([#678](https://github.com/angular/material2/issues/678)) ([5c4dc04](https://github.com/angular/material2/commit/5c4dc04)), closes [#676](https://github.com/angular/material2/issues/676)
* add event object for slide-toggle and checkbox. ([#554](https://github.com/angular/material2/issues/554)) ([55cc197](https://github.com/angular/material2/commit/55cc197)), closes [#552](https://github.com/angular/material2/issues/552)
* include scss sources in packages ([#536](https://github.com/angular/material2/issues/536)) ([fd02b10](https://github.com/angular/material2/commit/fd02b10))
* remove [@internal](https://github.com/internal) where it would make tsc fail ([#538](https://github.com/angular/material2/issues/538)) ([efd1be2](https://github.com/angular/material2/commit/efd1be2))
* remove circular deps and ci check ([#608](https://github.com/angular/material2/issues/608)) ([fda5617](https://github.com/angular/material2/commit/fda5617))
* remove duplicated typing. TS stdlib provides enough for e2e tests ([#637](https://github.com/angular/material2/issues/637)) ([a68597e](https://github.com/angular/material2/commit/a68597e))
* resolve errors w/ Closure Compiler. ([#659](https://github.com/angular/material2/issues/659)) ([fbdb35b](https://github.com/angular/material2/commit/fbdb35b)), closes [#659](https://github.com/angular/material2/issues/659)
* visually hidden inputs should not bubble change event ([#551](https://github.com/angular/material2/issues/551)) ([d037ed3](https://github.com/angular/material2/commit/d037ed3)), closes [#544](https://github.com/angular/material2/issues/544)


### Features

* **grid-list:** add header and footer support ([43806f6](https://github.com/angular/material2/commit/43806f6))
* **overlay:** add connected overlay directive ([#496](https://github.com/angular/material2/issues/496)) ([3b527e8](https://github.com/angular/material2/commit/3b527e8))
* **tabs:** adds focus/select events ([#649](https://github.com/angular/material2/issues/649)) ([497a3c1](https://github.com/angular/material2/commit/497a3c1)), closes [#569](https://github.com/angular/material2/issues/569)
* **tabs:** adds support for two-way bindings on selectedIndex ([#702](https://github.com/angular/material2/issues/702)) ([8df3246](https://github.com/angular/material2/commit/8df3246)), closes [#687](https://github.com/angular/material2/issues/687)


### Performance Improvements

* **progress-circle:** clean up animation on destroy ([#617](https://github.com/angular/material2/issues/617)) ([63f43bd](https://github.com/angular/material2/commit/63f43bd))



<a name="2.0.0-alpha.5"></a>
# [2.0.0-alpha.5 granite-gouda](https://github.com/angular/material2/compare/2.0.0-alpha.4...2.0.0-alpha.5) (2016-05-25)


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
# [2.0.0-alpha.4 mahogany-tambourine](https://github.com/angular/material2/compare/2.0.0-alpha.3...2.0.0-alpha.4) (2016-05-04)


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
# [2.0.0-alpha.3 cotton-candelabrum](https://github.com/angular/material2/compare/2.0.0-alpha.2...2.0.0-alpha.3) (2016-04-21)


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
# [2.0.0-alpha.2 diamond-haircut](https://github.com/angular/material2/compare/2.0.0-alpha.1...2.0.0-alpha.2) (2016-04-06)


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
# [2.0.0-alpha.1 nylon-hyperdrive](https://github.com/angular/material2/compare/2.0.0-alpha.0...2.0.0-alpha.1) (2016-03-16)


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
