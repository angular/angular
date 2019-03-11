## 7.3.4 "tapioca-turtle" (2019-03-11)


### Bug Fixes

* **badge:** duplicate leftover badge after server-side render ([#15417](https://github.com/angular/material2/issues/15417)) ([815a729](https://github.com/angular/material2/commit/815a729))
* **calendar:** should markForCheck when properties are changed ([#15102](https://github.com/angular/material2/issues/15102)) ([4aa5535](https://github.com/angular/material2/commit/4aa5535))
* **datepicker:** toggle throwing an error if datepicker is not defined on init ([#15256](https://github.com/angular/material2/issues/15256)) ([3c5e671](https://github.com/angular/material2/commit/3c5e671))
* **form-field:** allow user to click through arrow on native select ([#15328](https://github.com/angular/material2/issues/15328)) ([cb057d2](https://github.com/angular/material2/commit/cb057d2)), closes [#15318](https://github.com/angular/material2/issues/15318)
* **form-field:** infinite loop with zone-patch-rxjs ([#15335](https://github.com/angular/material2/issues/15335)) ([8581556](https://github.com/angular/material2/commit/8581556)), closes [#15331](https://github.com/angular/material2/issues/15331)
* **list:** action list missing focus and hover styling ([#14147](https://github.com/angular/material2/issues/14147)) ([3f876e2](https://github.com/angular/material2/commit/3f876e2))
* **list:** override native button text align in action list ([#15404](https://github.com/angular/material2/issues/15404)) ([aaec2d5](https://github.com/angular/material2/commit/aaec2d5))
* **radio:** ng-touched incorrectly being set on click ([#12560](https://github.com/angular/material2/issues/12560)) ([5b04ec3](https://github.com/angular/material2/commit/5b04ec3))
* **radio:** only show focus ripple for keyboard focus ([#13565](https://github.com/angular/material2/issues/13565)) ([87477c3](https://github.com/angular/material2/commit/87477c3)), closes [#13544](https://github.com/angular/material2/issues/13544)
* **radio:** unable to distinguish disabled radio button in high contrast mode ([#15375](https://github.com/angular/material2/issues/15375)) ([230b1ed](https://github.com/angular/material2/commit/230b1ed))
* **schematics:** incorrectly throws if NgModule uses namespaced decorator ([#15298](https://github.com/angular/material2/issues/15298)) ([89c48f4](https://github.com/angular/material2/commit/89c48f4))
* **scrolling:** virtual scroll viewport error during server-side rendering ([#15299](https://github.com/angular/material2/issues/15299)) ([78e7207](https://github.com/angular/material2/commit/78e7207)), closes [#15291](https://github.com/angular/material2/issues/15291)
* **select:** Fixes width-issue of select option panel in IE ([#11801](https://github.com/angular/material2/issues/11801)) ([81a73c6](https://github.com/angular/material2/commit/81a73c6)), closes [#11609](https://github.com/angular/material2/issues/11609)
* **sort:** remove arrow when sort header is disabled ([#15212](https://github.com/angular/material2/issues/15212)) ([4a7fdfe](https://github.com/angular/material2/commit/4a7fdfe)), closes [#14986](https://github.com/angular/material2/issues/14986)
* **stepper:** unable to tab to step content ([#14892](https://github.com/angular/material2/issues/14892)) ([824aad2](https://github.com/angular/material2/commit/824aad2))
* **tabs:** correct example title ([#15325](https://github.com/angular/material2/issues/15325)) ([f1ca6ff](https://github.com/angular/material2/commit/f1ca6ff))
* **virtual-scroll:** move views that are already attached instead of inserting ([#15348](https://github.com/angular/material2/issues/15348)) ([8dc572d](https://github.com/angular/material2/commit/8dc572d))



## 7.3.3 "cashmere-armor" (2019-02-20)


### Bug Fixes

* **theming**: fix errors when building theme using CSS variables ([#15140](https://github.com/angular/material2/issues/15140)) ([96f6e06](https://github.com/angular/material2/commit/96f6e06)), closes [#15107](https://github.com/angular/material2/issues/15107)
* **bidi:** handle uppercase values correctly ([#14773](https://github.com/angular/material2/issues/14773)) ([0029cde](https://github.com/angular/material2/commit/0029cde))
* **dialog:** don't assign aria-label to close button if button has text ([#11093](https://github.com/angular/material2/issues/11093)) ([9bf368d](https://github.com/angular/material2/commit/9bf368d)), closes [#11084](https://github.com/angular/material2/issues/11084)
* **list:** disableRipple on selection list not affecting list options after init ([#14858](https://github.com/angular/material2/issues/14858)) ([edf4541](https://github.com/angular/material2/commit/edf4541))
* **schematics:** do not generate invalid stylesheet files ([#15235](https://github.com/angular/material2/issues/15235)) ([e7422e4](https://github.com/angular/material2/commit/e7422e4)), closes [#15164](https://github.com/angular/material2/issues/15164)
* **table:** add missing rowgroup roles ([#15131](https://github.com/angular/material2/issues/15131)) ([2c7bc1c](https://github.com/angular/material2/commit/2c7bc1c))



## 7.3.2 "jute-box" (2019-02-11)


### Bug Fixes

* **autocomplete:** set aria-haspopup ([#15079](https://github.com/angular/material2/issues/15079)) ([45bd5d4](https://github.com/angular/material2/commit/45bd5d4))
* **checkbox:** unable to click to select if text is marked ([#15062](https://github.com/angular/material2/issues/15062)) ([4819c5b](https://github.com/angular/material2/commit/4819c5b)), closes [#14967](https://github.com/angular/material2/issues/14967)
* **drag-drop:** set class when item or list is disabled ([#14769](https://github.com/angular/material2/issues/14769)) ([c543cf6](https://github.com/angular/material2/commit/c543cf6)), closes [#14760](https://github.com/angular/material2/issues/14760)
* **drag-drop:** standalone draggable drag class not being applied with OnPush change detection ([#14727](https://github.com/angular/material2/issues/14727)) ([2f63195](https://github.com/angular/material2/commit/2f63195))
* **icon:** add notranslate class ([#14889](https://github.com/angular/material2/issues/14889)) ([39fa928](https://github.com/angular/material2/commit/39fa928))
* **menu:** prevent removal of mat-elevation class ([#15035](https://github.com/angular/material2/issues/15035)) ([8069641](https://github.com/angular/material2/commit/8069641))
* **slide-toggle:** input element should use switch role ([#15073](https://github.com/angular/material2/issues/15073)) ([3af7748](https://github.com/angular/material2/commit/3af7748)), closes [#14949](https://github.com/angular/material2/issues/14949)
* **tree:** opposite direction padding not being reset on change ([#14816](https://github.com/angular/material2/issues/14816)) ([ae4a5ae](https://github.com/angular/material2/commit/ae4a5ae))



## 7.3.1 "liquidcrystal-sandwich" (2019-02-04)


### Bug Fixes

* **button:** not updating DOM node name if group name changes ([#14963](https://github.com/angular/material2/issues/14963)) ([37732cb](https://github.com/angular/material2/commit/37732cb))
* **cdk-stepper:** coercing selectedIndex value to a Number ([#14817](https://github.com/angular/material2/issues/14817)) ([b64c08d](https://github.com/angular/material2/commit/b64c08d))
* **checkbox:** not marked as touched immediately on blur with OnPush change detection ([#15001](https://github.com/angular/material2/issues/15001)) ([916c532](https://github.com/angular/material2/commit/916c532)), closes [#14980](https://github.com/angular/material2/issues/14980)
* **chips:** newly-added chips not being disabled when added to a disable list ([#14976](https://github.com/angular/material2/issues/14976)) ([c23512a](https://github.com/angular/material2/commit/c23512a))
* **examples:** fix form-field custom control `disabled` input ([#14957](https://github.com/angular/material2/issues/14957)) ([ce3926d](https://github.com/angular/material2/commit/ce3926d)), closes [/github.com/angular/angular/blob/e2c98fbe11272295c3827b0e54f859d283cd32bf/packages/forms/src/directives/reactive_errors.ts#L64](https://github.com//github.com/angular/angular/blob/e2c98fbe11272295c3827b0e54f859d283cd32bf/packages/forms/src/directives/reactive_errors.ts/issues/L64)
* **list:** selection list not picking up indirect descendants ([#15003](https://github.com/angular/material2/issues/15003)) ([6a07d0d](https://github.com/angular/material2/commit/6a07d0d)), closes [#15000](https://github.com/angular/material2/issues/15000)
* **MatPseudoCheckbox:** fix checkmark pseudo-element box-sizing ([#14971](https://github.com/angular/material2/issues/14971)) ([ba6b405](https://github.com/angular/material2/commit/ba6b405))
* **overlay:** unnecessarily pushing overlay if it is exactly as wide as the viewport ([#14975](https://github.com/angular/material2/issues/14975)) ([f4b4e61](https://github.com/angular/material2/commit/f4b4e61)), closes [#14968](https://github.com/angular/material2/issues/14968)
* **radio:** not updating DOM node name if group name changes ([#14950](https://github.com/angular/material2/issues/14950)) ([4d5c5d5](https://github.com/angular/material2/commit/4d5c5d5))
* **radio:** unable to click to select button if text is marked ([#14967](https://github.com/angular/material2/issues/14967)) ([81380d2](https://github.com/angular/material2/commit/81380d2)), closes [#14753](https://github.com/angular/material2/issues/14753)
* **slider:** focus ring showing when ancestor has focus monitoring ([#14960](https://github.com/angular/material2/issues/14960)) ([2ec9dff](https://github.com/angular/material2/commit/2ec9dff)), closes [#14958](https://github.com/angular/material2/issues/14958)
* **table:** allow for a caption to be projected ([#14965](https://github.com/angular/material2/issues/14965)) ([a8a6617](https://github.com/angular/material2/commit/a8a6617)), closes [#14948](https://github.com/angular/material2/issues/14948)
* **table:** Clarify unknown table column error ([#14947](https://github.com/angular/material2/issues/14947)) ([2782273](https://github.com/angular/material2/commit/2782273))
* **tree,scrolling:** don't require user DataSource to extend DataSource ([#14966](https://github.com/angular/material2/issues/14966)) ([0f9926a](https://github.com/angular/material2/commit/0f9926a))



# 7.3.0 "pyrite-pixie" (2019-01-28)


### Bug Fixes

* **autocomplete:** not updating origin if it changes after init ([#14677](https://github.com/angular/material2/issues/14677)) ([4913c36](https://github.com/angular/material2/commit/4913c36))
* **bottom-sheet:** allow disableClose to be updated after opened ([#14711](https://github.com/angular/material2/issues/14711)) ([3d3179f](https://github.com/angular/material2/commit/3d3179f)), closes [#14708](https://github.com/angular/material2/issues/14708)
* **button:** focus indication hard to see in high contrast mode ([#13259](https://github.com/angular/material2/issues/13259)) ([fffbcb1](https://github.com/angular/material2/commit/fffbcb1))
* **button-toggle:** remove references to selected toggle on destroy ([#14627](https://github.com/angular/material2/issues/14627)) ([98f0142](https://github.com/angular/material2/commit/98f0142))
* **datepicker:** update validation when switching from null to error input ([#14423](https://github.com/angular/material2/issues/14423)) ([5aefe60](https://github.com/angular/material2/commit/5aefe60))
* **drag-drop:** apply translation transform before user transforms ([#14712](https://github.com/angular/material2/issues/14712)) ([349675a](https://github.com/angular/material2/commit/349675a)), closes [#14699](https://github.com/angular/material2/issues/14699)
* **drag-drop:** dragging styling not being reset in some cases with OnPush change detection ([#14725](https://github.com/angular/material2/issues/14725)) ([1d4bb18](https://github.com/angular/material2/commit/1d4bb18))
* **drag-drop:** incorrectly preserving transform if root element changes ([#14697](https://github.com/angular/material2/issues/14697)) ([3656a4e](https://github.com/angular/material2/commit/3656a4e))
* **drag-drop:** restore initial transform when resetting ([#14701](https://github.com/angular/material2/issues/14701)) ([005fb46](https://github.com/angular/material2/commit/005fb46))
* **drag-drop:** unable to move item into connected container by passing through another container ([#14651](https://github.com/angular/material2/issues/14651)) ([0bd93dd](https://github.com/angular/material2/commit/0bd93dd)), closes [#14645](https://github.com/angular/material2/issues/14645)
* **focus-trap:** apply aria-hidden to focus trap tab anchors ([#14644](https://github.com/angular/material2/issues/14644)) ([f66302d](https://github.com/angular/material2/commit/f66302d))
* **icon:** clean up cached references in icon registry on destroy ([#14801](https://github.com/angular/material2/issues/14801)) ([f6b4288](https://github.com/angular/material2/commit/f6b4288))
* **list:** action list button outline not being reset on firefox ([#14693](https://github.com/angular/material2/issues/14693)) ([73d0fb9](https://github.com/angular/material2/commit/73d0fb9))
* **list:** deselect option if value doesn't match up ([#14800](https://github.com/angular/material2/issues/14800)) ([551ded5](https://github.com/angular/material2/commit/551ded5)), closes [#14734](https://github.com/angular/material2/issues/14734)
* **list:** disableRipple on list input not taking effect after init ([#14836](https://github.com/angular/material2/issues/14836)) ([463ac9e](https://github.com/angular/material2/commit/463ac9e)), closes [#14824](https://github.com/angular/material2/issues/14824)
* **menu:** not unsubscribing from close stream if trigger is destroyed ([#14107](https://github.com/angular/material2/issues/14107)) ([80f510f](https://github.com/angular/material2/commit/80f510f))
* **overlay:** not sizing flexible overlay correctly when opening downwards on a scrollable page ([#14672](https://github.com/angular/material2/issues/14672)) ([40f8b20](https://github.com/angular/material2/commit/40f8b20))
* **overlay:** reset transform when disposing of position strategy ([#14660](https://github.com/angular/material2/issues/14660)) ([86c530e](https://github.com/angular/material2/commit/86c530e)), closes [#14657](https://github.com/angular/material2/issues/14657)
* **overlay:** update size if dimensions change in overlay directives ([#14610](https://github.com/angular/material2/issues/14610)) ([c92d8c9](https://github.com/angular/material2/commit/c92d8c9)), closes [#7811](https://github.com/angular/material2/issues/7811)
* **slide-toggle:** use default hue for thumb in dark theme ([#14230](https://github.com/angular/material2/issues/14230)) ([7d96ed3](https://github.com/angular/material2/commit/7d96ed3)), closes [#14192](https://github.com/angular/material2/issues/14192)
* **sort:** extra Firefox focus outline not being reset ([#14733](https://github.com/angular/material2/issues/14733)) ([027d4f4](https://github.com/angular/material2/commit/027d4f4))
* **stepper:** ensure step state is not minified ([#14933](https://github.com/angular/material2/issues/14933)) ([e7b0e40](https://github.com/angular/material2/commit/e7b0e40))
* **table:** not re-rendering when switching to a smaller set of data than the current page ([#14665](https://github.com/angular/material2/issues/14665)) ([a31a2ff](https://github.com/angular/material2/commit/a31a2ff)), closes [#12586](https://github.com/angular/material2/issues/12586) [#14010](https://github.com/angular/material2/issues/14010)
* **tabs:** better handling of animationDuration without units ([#14778](https://github.com/angular/material2/issues/14778)) ([6f49813](https://github.com/angular/material2/commit/6f49813)), closes [#13428](https://github.com/angular/material2/issues/13428)
* **tabs:** don't handle keyboard events with modifier keys ([#14234](https://github.com/angular/material2/issues/14234)) ([76cb9d0](https://github.com/angular/material2/commit/76cb9d0))
* **tabs:** pagination not working correctly on chrome in rtl mode ([#14690](https://github.com/angular/material2/issues/14690)) ([220e6b2](https://github.com/angular/material2/commit/220e6b2)), closes [#14689](https://github.com/angular/material2/issues/14689)
* **tooltip:** afterHidden stream not being completed ([#14620](https://github.com/angular/material2/issues/14620)) ([0394d59](https://github.com/angular/material2/commit/0394d59))


### Features

* **dialog:** support adding and removing classes via dialogRef ([#14772](https://github.com/angular/material2/issues/14772)) ([b62f3f3](https://github.com/angular/material2/commit/b62f3f3)), closes [#6206](https://github.com/angular/material2/issues/6206)
* **drag-drop:** add service for attaching drag&drop to arbitrary DOM nodes ([#14437](https://github.com/angular/material2/issues/14437)) ([5a18ea6](https://github.com/angular/material2/commit/5a18ea6))
* **overlay:** allow for connected overlay to be positioned relative to a point ([#14616](https://github.com/angular/material2/issues/14616)) ([651549f](https://github.com/angular/material2/commit/651549f)), closes [#5007](https://github.com/angular/material2/issues/5007)
* **ripples:** support updating global ripple options at runtime ([#14705](https://github.com/angular/material2/issues/14705)) ([4f755cf](https://github.com/angular/material2/commit/4f755cf)), closes [#9729](https://github.com/angular/material2/issues/9729)
* **tabs:** add automatic scrolling when holding down paginator ([#14632](https://github.com/angular/material2/issues/14632)) ([e661317](https://github.com/angular/material2/commit/e661317)), closes [#6510](https://github.com/angular/material2/issues/6510)
* **tooltip:** allow for default position to be configured ([#14872](https://github.com/angular/material2/issues/14872)) ([342e6f0](https://github.com/angular/material2/commit/342e6f0)), closes [#14862](https://github.com/angular/material2/issues/14862)



## 7.2.1 "acrylic-axolotl" (2019-01-07)


### Bug Fixes

* **a11y:** remove listeners when focus trap anchors are removed ([#14629](https://github.com/angular/material2/issues/14629)) ([17bb9c3](https://github.com/angular/material2/commit/17bb9c3))
* **autocomplete:** adding aria-activedescendant while closed if autoActiveFirstOption is enabled ([#14455](https://github.com/angular/material2/issues/14455)) ([f3065cc](https://github.com/angular/material2/commit/f3065cc)), closes [#14453](https://github.com/angular/material2/issues/14453)
* **checkbox:** incorrect color for disabled indeterminate checkbox ([#14478](https://github.com/angular/material2/issues/14478)) ([0398d53](https://github.com/angular/material2/commit/0398d53)), closes [#14415](https://github.com/angular/material2/issues/14415)
* **datepicker:** native date adapter not preserving time when cloning ([#14691](https://github.com/angular/material2/issues/14691)) ([9e3a77b](https://github.com/angular/material2/commit/9e3a77b))
* **dialog:** complete injectable streams on destroy ([#14254](https://github.com/angular/material2/issues/14254)) ([e673608](https://github.com/angular/material2/commit/e673608))
* **drag-drop:** don't disable native drag interactions if dragging is disabled ([#14233](https://github.com/angular/material2/issues/14233)) ([9fa3376](https://github.com/angular/material2/commit/9fa3376))
* **drag-drop:** update root element if selector changes ([#14426](https://github.com/angular/material2/issues/14426)) ([14b90db](https://github.com/angular/material2/commit/14b90db))
* **form-field:** proper arrow color for native select ([#14490](https://github.com/angular/material2/issues/14490)) ([3824a05](https://github.com/angular/material2/commit/3824a05))
* **input:** unable to reset focused state of readonly input ([#14698](https://github.com/angular/material2/issues/14698)) ([98711d7](https://github.com/angular/material2/commit/98711d7))
* **list:** add hover and focus indication in high contrast mode ([#14637](https://github.com/angular/material2/issues/14637)) ([3c71348](https://github.com/angular/material2/commit/3c71348))
* **menu:** hasBackdrop not being updated after first open ([#14561](https://github.com/angular/material2/issues/14561)) ([268b0e8](https://github.com/angular/material2/commit/268b0e8)), closes [#14560](https://github.com/angular/material2/issues/14560)
* **menu:** scroll position jumping to top after animation is done on scrollable menu ([#14190](https://github.com/angular/material2/issues/14190)) ([37a7080](https://github.com/angular/material2/commit/37a7080)), closes [#11859](https://github.com/angular/material2/issues/11859) [#11790](https://github.com/angular/material2/issues/11790)
* **moment-adapter:** incorrectly deserializing moment dates and not setting locale on deserialized values ([#14685](https://github.com/angular/material2/issues/14685)) ([36db1c0](https://github.com/angular/material2/commit/36db1c0))
* **overlay:** not updating hasBackdrop after first open ([#14562](https://github.com/angular/material2/issues/14562)) ([61d3cf8](https://github.com/angular/material2/commit/61d3cf8)), closes [#14561](https://github.com/angular/material2/issues/14561)
* **radio:** host element unable to receive focus events ([#14472](https://github.com/angular/material2/issues/14472)) ([8c35917](https://github.com/angular/material2/commit/8c35917)), closes [#13323](https://github.com/angular/material2/issues/13323) [#13953](https://github.com/angular/material2/issues/13953)
* **select:** announce value changes with arrow keys while closed ([#14540](https://github.com/angular/material2/issues/14540)) ([3f9a125](https://github.com/angular/material2/commit/3f9a125))
* **select:** don't shift arrow if there is no label ([#14607](https://github.com/angular/material2/issues/14607)) ([7188719](https://github.com/angular/material2/commit/7188719)), closes [#13907](https://github.com/angular/material2/issues/13907)
* **select:** form field state not updated if options are reset ([#14720](https://github.com/angular/material2/issues/14720)) ([391a9fd](https://github.com/angular/material2/commit/391a9fd)), closes [#14709](https://github.com/angular/material2/issues/14709)
* **slider:** don't handle keyboard events with modifier keys ([#14675](https://github.com/angular/material2/issues/14675)) ([7d2748e](https://github.com/angular/material2/commit/7d2748e))
* **typography:** deprecation warning in latest sass version ([#14673](https://github.com/angular/material2/issues/14673)) ([65ecb08](https://github.com/angular/material2/commit/65ecb08)), closes [#14636](https://github.com/angular/material2/issues/14636)
* **expansion-panel:** add missing injection token for configuring the default options ([#14384](https://github.com/angular/material2/issues/14384)) ([a389704](https://github.com/angular/material2/commit/a389704)), closes [#14383](https://github.com/angular/material2/issues/14383)



# 7.2.0 "gold-snowman" (2018-12-18)


### Bug Fixes

* **a11y:** inconsistent runtime value for ListKeyManager.activeItem ([#14154](https://github.com/angular/material2/issues/14154)) ([c4b3484](https://github.com/angular/material2/commit/c4b3484)), closes [#14152](https://github.com/angular/material2/issues/14152)
* **autocomplete:** update template when changing autocomplete in trigger ([#13814](https://github.com/angular/material2/issues/13814)) ([904a5ea](https://github.com/angular/material2/commit/904a5ea))
* **badge:** aria-label not being updated if description changes ([#14393](https://github.com/angular/material2/issues/14393)) ([ab78183](https://github.com/angular/material2/commit/ab78183))
* **bottom-sheet:** bottom-sheet content not being read out by screen readers ([#14534](https://github.com/angular/material2/issues/14534)) ([9485aff](https://github.com/angular/material2/commit/9485aff)), closes [#10591](https://github.com/angular/material2/issues/10591)
* **cdk/stepper:** exported injection token referring to Material ([#14339](https://github.com/angular/material2/issues/14339)) ([b584888](https://github.com/angular/material2/commit/b584888))
* **chips:** don't handle separator keys while pressing modifiers ([#14424](https://github.com/angular/material2/issues/14424)) ([d1cec1f](https://github.com/angular/material2/commit/d1cec1f))
* **drag-drop:** account for out of view container and stacking order ([#14257](https://github.com/angular/material2/issues/14257)) ([c5be8d3](https://github.com/angular/material2/commit/c5be8d3)), closes [#14231](https://github.com/angular/material2/issues/14231)
* **drag-drop:** error on touch end ([#14392](https://github.com/angular/material2/issues/14392)) ([53cecbb](https://github.com/angular/material2/commit/53cecbb)), closes [#14390](https://github.com/angular/material2/issues/14390)
* **drag-drop:** handle placeholder and preview templates changing after init ([#14541](https://github.com/angular/material2/issues/14541)) ([bfacbb5](https://github.com/angular/material2/commit/bfacbb5))
* **drag-drop:** prevent text selection while dragging on Safari ([#14405](https://github.com/angular/material2/issues/14405)) ([220e388](https://github.com/angular/material2/commit/220e388)), closes [#14403](https://github.com/angular/material2/issues/14403)
* **drag-drop:** showing touch device tap highlight when using a handle ([#14549](https://github.com/angular/material2/issues/14549)) ([8a3d21a](https://github.com/angular/material2/commit/8a3d21a))
* **drag-drop:** throw better error when attaching to non-element node ([#14221](https://github.com/angular/material2/issues/14221)) ([31f0e6d](https://github.com/angular/material2/commit/31f0e6d))
* **drag-drop:** unable to stop dragging after quick double click ([#14506](https://github.com/angular/material2/issues/14506)) ([fbb2a13](https://github.com/angular/material2/commit/fbb2a13))
* **drawer:** ensure all observables are unsubscribed ([#13378](https://github.com/angular/material2/issues/13378)) ([f7dcc27](https://github.com/angular/material2/commit/f7dcc27))
* **form-field:** long labels and option values going under select arrow ([#14268](https://github.com/angular/material2/issues/14268)) ([166279b](https://github.com/angular/material2/commit/166279b))
* **form-field:** native select label floating incorrectly when invalid value is set ([#14263](https://github.com/angular/material2/issues/14263)) ([9c65c87](https://github.com/angular/material2/commit/9c65c87))
* **form-field:** outline gap not being calculated when element starts off invisible ([#13477](https://github.com/angular/material2/issues/13477)) ([e579181](https://github.com/angular/material2/commit/e579181)), closes [#13328](https://github.com/angular/material2/issues/13328)
* **form-field:** outline gap not being recalculated on direction changes ([#13478](https://github.com/angular/material2/issues/13478)) ([b78a750](https://github.com/angular/material2/commit/b78a750))
* **grid-list:** allow more units for gutter width and row height ([#14341](https://github.com/angular/material2/issues/14341)) ([f176119](https://github.com/angular/material2/commit/f176119))
* **menu:** accidentally tapping on sub-menu content that overlaps trigger on touch devices ([#14538](https://github.com/angular/material2/issues/14538)) ([f2a06ab](https://github.com/angular/material2/commit/f2a06ab))
* **menu:** reduce specificity of icon selector ([#14389](https://github.com/angular/material2/issues/14389)) ([74e945a](https://github.com/angular/material2/commit/74e945a))
* **menu:** unable to set icon color dynamically ([#14161](https://github.com/angular/material2/issues/14161)) ([48e4f65](https://github.com/angular/material2/commit/48e4f65)), closes [#14151](https://github.com/angular/material2/issues/14151)
* **schematics:** drag-drop schematic two consecutive commas ([#14446](https://github.com/angular/material2/issues/14446)) ([35fd998](https://github.com/angular/material2/commit/35fd998))
* **schematics:** two consecutive commas generated ([#14371](https://github.com/angular/material2/issues/14371)) ([dd6065c](https://github.com/angular/material2/commit/dd6065c)), closes [#14366](https://github.com/angular/material2/issues/14366)
* **sidenav:** content margins not updated on viewport changes ([#14089](https://github.com/angular/material2/issues/14089)) ([b15392d](https://github.com/angular/material2/commit/b15392d))
* **snack-bar:** announcing same message twice to screen readers ([#13298](https://github.com/angular/material2/issues/13298)) ([3fb4b23](https://github.com/angular/material2/commit/3fb4b23))
* **stepper:** ignoring custom falsy value for hasError ([#14337](https://github.com/angular/material2/issues/14337)) ([7fac915](https://github.com/angular/material2/commit/7fac915)), closes [#14333](https://github.com/angular/material2/issues/14333)
* **text-field:** add fallback for browsers that don't support requestAnimationFrame ([#14519](https://github.com/angular/material2/issues/14519)) ([c94812d](https://github.com/angular/material2/commit/c94812d))
* **tree:** allow tree node to have undefined child or null child ([#14482](https://github.com/angular/material2/issues/14482)) ([eeda91d](https://github.com/angular/material2/commit/eeda91d))
* **tree:** handle null children in nested tree ([#14547](https://github.com/angular/material2/issues/14547)) ([364376e](https://github.com/angular/material2/commit/364376e)), closes [#10886](https://github.com/angular/material2/issues/10886) [#14545](https://github.com/angular/material2/issues/14545)
* reference symbols for example components rather than providing a string of the component name ([#13992](https://github.com/angular/material2/issues/13992)) ([d0d97c3](https://github.com/angular/material2/commit/d0d97c3))
* workaround for es2015 inheritance not always working ([#13834](https://github.com/angular/material2/issues/13834)) ([a22a9fa](https://github.com/angular/material2/commit/a22a9fa))


### Features

* **drag-drop:** add class to indicate whether a container can receive an item ([#14532](https://github.com/angular/material2/issues/14532)) ([c6dc070](https://github.com/angular/material2/commit/c6dc070)), closes [#14439](https://github.com/angular/material2/issues/14439)
* **drag-drop:** add released event ([#14513](https://github.com/angular/material2/issues/14513)) ([792d536](https://github.com/angular/material2/commit/792d536)), closes [#14498](https://github.com/angular/material2/issues/14498)
* **drag-drop:** add the ability to constrain dragging to an element ([#14242](https://github.com/angular/material2/issues/14242)) ([8432e80](https://github.com/angular/material2/commit/8432e80)), closes [#14211](https://github.com/angular/material2/issues/14211)
* **drag-drop:** allow entire group of drop lists to be disabled ([#14179](https://github.com/angular/material2/issues/14179)) ([94e76de](https://github.com/angular/material2/commit/94e76de))
* **drag-drop:** indicate in dropped event whether item was dropped outside of container ([#14140](https://github.com/angular/material2/issues/14140)) ([42de6a2](https://github.com/angular/material2/commit/42de6a2)), closes [#14136](https://github.com/angular/material2/issues/14136)


## 7.1.1 "fondant-friendship" (2018-12-03)


### Bug Fixes

* **a11y:** don't handle disallowed modifier keys in typeahead mode ([#14301](https://github.com/angular/material2/issues/14301)) ([700f20f](https://github.com/angular/material2/commit/700f20f)), closes [#14274](https://github.com/angular/material2/issues/14274)
* **badge:** badge instances not being cleaned up on destroy ([#14265](https://github.com/angular/material2/issues/14265)) ([da3776f](https://github.com/angular/material2/commit/da3776f))
* **checkbox:** poor color contrast for disabled checkbox ([#14044](https://github.com/angular/material2/issues/14044)) ([9c86b5f](https://github.com/angular/material2/commit/9c86b5f))
* **chips:** invert focus overlay on dark theme ([#14204](https://github.com/angular/material2/issues/14204)) ([7af8d02](https://github.com/angular/material2/commit/7af8d02))
* **drag-drop:** add support for dragging svg elements in IE11 ([#14215](https://github.com/angular/material2/issues/14215)) ([81db16c](https://github.com/angular/material2/commit/81db16c)), closes [#14214](https://github.com/angular/material2/issues/14214)
* **drag-drop:** dragged elements blurry in some browsers ([#14299](https://github.com/angular/material2/issues/14299)) ([63174d2](https://github.com/angular/material2/commit/63174d2)), closes [#14283](https://github.com/angular/material2/issues/14283)
* **drag-drop:** only add top-level drop lists to drop group ([#14130](https://github.com/angular/material2/issues/14130)) ([4acecd7](https://github.com/angular/material2/commit/4acecd7))
* **drag-drop:** remove expensive style recalculation ([#14189](https://github.com/angular/material2/issues/14189)) ([f212345](https://github.com/angular/material2/commit/f212345))
* **form-field:** error when native select has no options ([#14102](https://github.com/angular/material2/issues/14102)) ([0ef75ea](https://github.com/angular/material2/commit/0ef75ea)), closes [#14101](https://github.com/angular/material2/issues/14101)
* **list:** don't handle events when modifier key is pressed ([#14313](https://github.com/angular/material2/issues/14313)) ([0c7ce7a](https://github.com/angular/material2/commit/0c7ce7a))
* **menu:** allow alternate roles to be set on menu item ([#14165](https://github.com/angular/material2/issues/14165)) ([3f1588f](https://github.com/angular/material2/commit/3f1588f)), closes [#14163](https://github.com/angular/material2/issues/14163)
* **ng-add:** do not throw if custom builder is used for "test" ([#14203](https://github.com/angular/material2/issues/14203)) ([498a3d8](https://github.com/angular/material2/commit/498a3d8)), closes [#14176](https://github.com/angular/material2/issues/14176)
* **scrolling:** default to vertical CSS class for invalid orientation ([#14145](https://github.com/angular/material2/issues/14145)) ([dbe27c4](https://github.com/angular/material2/commit/dbe27c4))
* **scrolling:** provide virtual scroll viewport as scrollable ([#14168](https://github.com/angular/material2/issues/14168)) ([c552504](https://github.com/angular/material2/commit/c552504))
* **slide-toggle:** label not being read out by JAWS ([#14304](https://github.com/angular/material2/issues/14304)) ([754414b](https://github.com/angular/material2/commit/754414b)), closes [#4610](https://github.com/angular/material2/issues/4610)
* **slide-toggle:** label not being read out by screen reader on IE ([#14259](https://github.com/angular/material2/issues/14259)) ([5264804](https://github.com/angular/material2/commit/5264804))
* **stepper:** showing hover state after tap on touch devices ([#14074](https://github.com/angular/material2/issues/14074)) ([f3031ad](https://github.com/angular/material2/commit/f3031ad))
* **tabs:** avoid hitting change detection if text content hasn't changed ([#14251](https://github.com/angular/material2/issues/14251)) ([9778af2](https://github.com/angular/material2/commit/9778af2)), closes [#14249](https://github.com/angular/material2/issues/14249)
* **tabs:** blurry text in scrolled header on some browsers ([#14303](https://github.com/angular/material2/issues/14303)) ([f7c8026](https://github.com/angular/material2/commit/f7c8026))


<a name="7.1.0"></a>
# 7.1.0 "stone-silhouette" (2018-11-20)


### Bug Fixes

* **a11y:** aria-live directive announcing the same text multiple times ([#13467](https://github.com/angular/material2/issues/13467)) ([a150494](https://github.com/angular/material2/commit/a150494))
* **a11y:** avoid overlapping or left over timers in live announcer ([#13602](https://github.com/angular/material2/issues/13602)) ([d0f4e7b](https://github.com/angular/material2/commit/d0f4e7b))
* **a11y:** key manager preventing arrow key events with modifier keys ([#13503](https://github.com/angular/material2/issues/13503)) ([1ef16ac](https://github.com/angular/material2/commit/1ef16ac)), closes [#11987](https://github.com/angular/material2/issues/11987) [#13496](https://github.com/angular/material2/issues/13496)
* **a11y:** wrong order of constructor arguments in provider ([#14078](https://github.com/angular/material2/issues/14078)) ([2fcf9e7](https://github.com/angular/material2/commit/2fcf9e7)), closes [#14077](https://github.com/angular/material2/issues/14077)
* **autocomplete:** autofill value changes not being propagated to the form control ([#9887](https://github.com/angular/material2/issues/9887)) ([059864d](https://github.com/angular/material2/commit/059864d)), closes [#9704](https://github.com/angular/material2/issues/9704)
* **autocomplete:** not propagating same model value when reset while open ([#13634](https://github.com/angular/material2/issues/13634)) ([8d98375](https://github.com/angular/material2/commit/8d98375))
* **bazel:** theming bundle not exposed as sass_library ([#14071](https://github.com/angular/material2/issues/14071)) ([af7a3d4](https://github.com/angular/material2/commit/af7a3d4))
* **bidi:** preserve user dir attribute ([#13859](https://github.com/angular/material2/issues/13859)) ([d94d176](https://github.com/angular/material2/commit/d94d176)), closes [#13855](https://github.com/angular/material2/issues/13855)
* **breakpoints:** set max-widths for breakpoints to non-integers to handle subpixel queries ([#13828](https://github.com/angular/material2/issues/13828)) ([077f68e](https://github.com/angular/material2/commit/077f68e))
* **button:** ripple color not correct for standard, icon and stroked buttons ([#13235](https://github.com/angular/material2/issues/13235)) ([b104e75](https://github.com/angular/material2/commit/b104e75)), closes [#13232](https://github.com/angular/material2/issues/13232)
* **button:** stroked button crops applied badges ([#13912](https://github.com/angular/material2/issues/13912)) ([4b431fe](https://github.com/angular/material2/commit/4b431fe)), closes [#13909](https://github.com/angular/material2/issues/13909)
* **button-toggle:** content shifting in IE11 ([#13492](https://github.com/angular/material2/issues/13492)) ([b3483a6](https://github.com/angular/material2/commit/b3483a6))
* **button-toggle:** not forwarding focus to underlying control ([#14001](https://github.com/angular/material2/issues/14001)) ([81f8fb9](https://github.com/angular/material2/commit/81f8fb9))
* **button-toggle:** remove hover state on touch devices ([#13724](https://github.com/angular/material2/issues/13724)) ([a320af2](https://github.com/angular/material2/commit/a320af2))
* **button-toggle:** svg icon not align inside toggle ([#13839](https://github.com/angular/material2/issues/13839)) ([5851c91](https://github.com/angular/material2/commit/5851c91)), closes [#13726](https://github.com/angular/material2/issues/13726)
* **button-toggle:** webkit tap highlight conflicting with ripples ([#13721](https://github.com/angular/material2/issues/13721)) ([efe53a0](https://github.com/angular/material2/commit/efe53a0))
* **cdk-platform:** pass `{}` to `@NgModule` since passing nothing breaks ([#13792](https://github.com/angular/material2/issues/13792)) ([65dd75d](https://github.com/angular/material2/commit/65dd75d))
* **checkbox:** disabled property not being coerced ([#13755](https://github.com/angular/material2/issues/13755)) ([e5fe34c](https://github.com/angular/material2/commit/e5fe34c)), closes [#13739](https://github.com/angular/material2/issues/13739)
* **checkbox:** no focus indicator in high contrast ([#13255](https://github.com/angular/material2/issues/13255)) ([caf65e5](https://github.com/angular/material2/commit/caf65e5)), closes [#13227](https://github.com/angular/material2/issues/13227)
* **chips:** disabled state not matching specs ([#13272](https://github.com/angular/material2/issues/13272)) ([60e0d88](https://github.com/angular/material2/commit/60e0d88))
* **chips:** invalid ripple color for selected chips ([#13271](https://github.com/angular/material2/issues/13271)) ([df5d18f](https://github.com/angular/material2/commit/df5d18f))
* **chips:** not updating keyboard controls if direction changes ([#14080](https://github.com/angular/material2/issues/14080)) ([1ffa1fc](https://github.com/angular/material2/commit/1ffa1fc))
* **chips:** remove circular dependency between chip-list and chip-input ([#13994](https://github.com/angular/material2/issues/13994)) ([6c741c4](https://github.com/angular/material2/commit/6c741c4))
* **datepicker:** don't allow clicks on disabled cells in year and multi-year views ([#13448](https://github.com/angular/material2/issues/13448)) ([c15bad2](https://github.com/angular/material2/commit/c15bad2))
* **datepicker:** toggle not forwarding focus to underlying button ([#14020](https://github.com/angular/material2/issues/14020)) ([b1d4b42](https://github.com/angular/material2/commit/b1d4b42))
* **datepicker:** unable to disable ripple on datepicker toggle ([#13997](https://github.com/angular/material2/issues/13997)) ([31bffb3](https://github.com/angular/material2/commit/31bffb3)), closes [#13986](https://github.com/angular/material2/issues/13986)
* **dialog,bottom-sheet:** enter animation blocking child animations ([#13888](https://github.com/angular/material2/issues/13888)) ([235add9](https://github.com/angular/material2/commit/235add9)), closes [#13870](https://github.com/angular/material2/issues/13870)
* **drag-drop:** avoid disrupting drag sequence if event propagation is stopped ([#13841](https://github.com/angular/material2/issues/13841)) ([8b2dc82](https://github.com/angular/material2/commit/8b2dc82))
* **drag-drop:** avoid generating elements with duplicate ids ([#13489](https://github.com/angular/material2/issues/13489)) ([68b53f7](https://github.com/angular/material2/commit/68b53f7))
* **drag-drop:** avoid interference from native drag&drop ([#14054](https://github.com/angular/material2/issues/14054)) ([26d63ee](https://github.com/angular/material2/commit/26d63ee))
* **drag-drop:** drop list not toggling dragging class inside component with OnPush change detection ([#13703](https://github.com/angular/material2/issues/13703)) ([12c15ba](https://github.com/angular/material2/commit/12c15ba)), closes [#13680](https://github.com/angular/material2/issues/13680)
* **drag-drop:** enable drag interactions when there is a drag handle ([#13780](https://github.com/angular/material2/issues/13780)) ([4ee6636](https://github.com/angular/material2/commit/4ee6636)), closes [#13779](https://github.com/angular/material2/issues/13779)
* **drag-drop:** error if drag item is destroyed zone has stabilized ([#13978](https://github.com/angular/material2/issues/13978)) ([6fe84f3](https://github.com/angular/material2/commit/6fe84f3))
* **drag-drop:** events fired multiple times for short drag sequences on touch devices ([#13135](https://github.com/angular/material2/issues/13135)) ([dc0b51a](https://github.com/angular/material2/commit/dc0b51a)), closes [#13125](https://github.com/angular/material2/issues/13125)
* **drag-drop:** ignore enter predicate when returning item to its initial container ([#13972](https://github.com/angular/material2/issues/13972)) ([fa944b7](https://github.com/angular/material2/commit/fa944b7))
* **drag-drop:** incorrectly laying out items with different height or margins ([#13849](https://github.com/angular/material2/issues/13849)) ([89701ef](https://github.com/angular/material2/commit/89701ef)), closes [#13483](https://github.com/angular/material2/issues/13483)
* **drag-drop:** multiple parallel drag sequences when dragging nested drag items ([#13820](https://github.com/angular/material2/issues/13820)) ([436809c](https://github.com/angular/material2/commit/436809c))
* **drag-drop:** not picking up handle that isn't a direct descendant ([#13360](https://github.com/angular/material2/issues/13360)) ([c38ebb6](https://github.com/angular/material2/commit/c38ebb6))
* **drag-drop:** preserve previous inline transform ([#13529](https://github.com/angular/material2/issues/13529)) ([cae16b0](https://github.com/angular/material2/commit/cae16b0))
* **drag-drop:** prevent mouse wheel scrolling while dragging ([#13524](https://github.com/angular/material2/issues/13524)) ([cd6da93](https://github.com/angular/material2/commit/cd6da93)), closes [#13508](https://github.com/angular/material2/issues/13508)
* **drag-drop:** use passive event listeners for start events ([#13526](https://github.com/angular/material2/issues/13526)) ([280b0d6](https://github.com/angular/material2/commit/280b0d6))
* **expansion-panel:** don't handle enter/space if modifier is pressed ([#13790](https://github.com/angular/material2/issues/13790)) ([04716b1](https://github.com/angular/material2/commit/04716b1)), closes [#13783](https://github.com/angular/material2/issues/13783)
* **expansion-panel:** emitting events twice on some browsers ([#13600](https://github.com/angular/material2/issues/13600)) ([fa6e46d](https://github.com/angular/material2/commit/fa6e46d))
* **focus-trap:** warn if initial element is not focusable ([#13960](https://github.com/angular/material2/issues/13960)) ([27347b5](https://github.com/angular/material2/commit/27347b5)), closes [#13953](https://github.com/angular/material2/issues/13953)
* **form-field:** native select options blending in with dropdown background on a dark theme ([#13201](https://github.com/angular/material2/issues/13201)) ([3f1e960](https://github.com/angular/material2/commit/3f1e960))
* **form-field:** users being able to select the hidden placeholder of disabled input ([#13480](https://github.com/angular/material2/issues/13480)) ([8dc367c](https://github.com/angular/material2/commit/8dc367c)), closes [#13479](https://github.com/angular/material2/issues/13479)
* **grid-list:** unable to assign numeric zero as gutter size ([#13652](https://github.com/angular/material2/issues/13652)) ([037a746](https://github.com/angular/material2/commit/037a746))
* **icon:** account for query params when prefixing external references ([#13930](https://github.com/angular/material2/issues/13930)) ([4ce5ee0](https://github.com/angular/material2/commit/4ce5ee0)), closes [#13924](https://github.com/angular/material2/issues/13924)
* **list:** add ripples to action list items ([#13799](https://github.com/angular/material2/issues/13799)) ([76044e8](https://github.com/angular/material2/commit/76044e8)), closes [#13795](https://github.com/angular/material2/issues/13795)
* **list:** remove disabled selection list hover feedback on mobile ([#13850](https://github.com/angular/material2/issues/13850)) ([0589881](https://github.com/angular/material2/commit/0589881))
* **list:** selection list moving focus when an option is destroyed ([#13531](https://github.com/angular/material2/issues/13531)) ([b5a0b16](https://github.com/angular/material2/commit/b5a0b16))
* **menu:** closing parent overlay when pressing escape ([#13442](https://github.com/angular/material2/issues/13442)) ([a7df1d0](https://github.com/angular/material2/commit/a7df1d0))
* **menu:** proper focus styling when opened by tap on a touch device ([#13599](https://github.com/angular/material2/issues/13599)) ([e51de15](https://github.com/angular/material2/commit/e51de15))
* **menu:** unable to swap menu panel after first open ([#13819](https://github.com/angular/material2/issues/13819)) ([1fb1c55](https://github.com/angular/material2/commit/1fb1c55)), closes [#13812](https://github.com/angular/material2/issues/13812)
* **menu:** use passive touch listener ([#14041](https://github.com/angular/material2/issues/14041)) ([3842c8c](https://github.com/angular/material2/commit/3842c8c))
* **ng-update:** do not fail if [@schematics](https://github.com/schematics)/angular version is outdated ([#13929](https://github.com/angular/material2/issues/13929)) ([ece6b2d](https://github.com/angular/material2/commit/ece6b2d))
* **ng-update:** do not throw if typescript version is outdated ([#13927](https://github.com/angular/material2/issues/13927)) ([eb59e56](https://github.com/angular/material2/commit/eb59e56))
* **overlay:** backdrop exit animation not working ([#10145](https://github.com/angular/material2/issues/10145)) ([3816079](https://github.com/angular/material2/commit/3816079))
* **overlay:** provide fullscreen overlay container in root ([#14091](https://github.com/angular/material2/issues/14091)) ([c55b78e](https://github.com/angular/material2/commit/c55b78e))
* **portal:** use portal's ComponentFactoryResolver in portal outlet directive ([#13886](https://github.com/angular/material2/issues/13886)) ([99d2512](https://github.com/angular/material2/commit/99d2512)), closes [#12677](https://github.com/angular/material2/issues/12677) [#9712](https://github.com/angular/material2/issues/9712)
* **progress-bar:** account for query params when prefixing references ([#13942](https://github.com/angular/material2/issues/13942)) ([2290063](https://github.com/angular/material2/commit/2290063)), closes [#13930](https://github.com/angular/material2/issues/13930)
* **progress-bar:** not taking current path after first initialization ([#13628](https://github.com/angular/material2/issues/13628)) ([88c6548](https://github.com/angular/material2/commit/88c6548))
* **radio:** don't show hover ripples on touch devices ([#13701](https://github.com/angular/material2/issues/13701)) ([f230633](https://github.com/angular/material2/commit/f230633)), closes [#13675](https://github.com/angular/material2/issues/13675)
* **radio:** improved alignment for native validation messages ([#13570](https://github.com/angular/material2/issues/13570)) ([dd96369](https://github.com/angular/material2/commit/dd96369))
* **scrolling:** leaking subscription if same element is registered multiple times ([#13974](https://github.com/angular/material2/issues/13974)) ([20f8924](https://github.com/angular/material2/commit/20f8924))
* **select:** don't prevent enter and space keys if a modifier is pressed ([#14090](https://github.com/angular/material2/issues/14090)) ([cb56df9](https://github.com/angular/material2/commit/cb56df9))
* **sidenav:** opened and closed events emitting twice on IE and Edge ([#13649](https://github.com/angular/material2/issues/13649)) ([beb4739](https://github.com/angular/material2/commit/beb4739))
* **slide-toggle:** don't show hover ripples on touch devices ([#13702](https://github.com/angular/material2/issues/13702)) ([e8f8d07](https://github.com/angular/material2/commit/e8f8d07)), closes [#13675](https://github.com/angular/material2/issues/13675)
* **slide-toggle:** no focus indication in high-contrast mode ([#13287](https://github.com/angular/material2/issues/13287)) ([264f306](https://github.com/angular/material2/commit/264f306))
* **slide-toggle:** redirect focus to underlying input element ([#13957](https://github.com/angular/material2/issues/13957)) ([ec4809f](https://github.com/angular/material2/commit/ec4809f)), closes [#13953](https://github.com/angular/material2/issues/13953)
* **slide-toggle:** showing focus ripple when clicking disabled control ([#14055](https://github.com/angular/material2/issues/14055)) ([9b05c3c](https://github.com/angular/material2/commit/9b05c3c)), closes [#13957](https://github.com/angular/material2/issues/13957)
* **slide-toggle:** using incorrect colors when disabled ([#13444](https://github.com/angular/material2/issues/13444)) ([dd9f267](https://github.com/angular/material2/commit/dd9f267))
* **slider:** changing value on right click ([#14083](https://github.com/angular/material2/issues/14083)) ([ed857c9](https://github.com/angular/material2/commit/ed857c9))
* **slider:** update value on mousedown instead of click ([#13020](https://github.com/angular/material2/issues/13020)) ([861642c](https://github.com/angular/material2/commit/861642c))
* **snack-bar:** set appropriate role based on passed in politeness ([#13864](https://github.com/angular/material2/issues/13864)) ([50f999b](https://github.com/angular/material2/commit/50f999b)), closes [#13493](https://github.com/angular/material2/issues/13493)
* **snackbar:** override min-width of snackbar on mobile ([#13880](https://github.com/angular/material2/issues/13880)) ([6703605](https://github.com/angular/material2/commit/6703605))
* **snackbar:** set aria role based on if announcement message is provided ([#13993](https://github.com/angular/material2/issues/13993)) ([69ffd33](https://github.com/angular/material2/commit/69ffd33))
* **stepper:** custom icons not centered inside circle ([#12947](https://github.com/angular/material2/issues/12947)) ([87e1742](https://github.com/angular/material2/commit/87e1742))
* **stepper:** don't handle enter/space when modifier key is pressed ([#13827](https://github.com/angular/material2/issues/13827)) ([a9e550e](https://github.com/angular/material2/commit/a9e550e)), closes [#13790](https://github.com/angular/material2/issues/13790)
* **stepper:** emitting the animationDone event twice on some browsers ([#13608](https://github.com/angular/material2/issues/13608)) ([3ef933a](https://github.com/angular/material2/commit/3ef933a)), closes [#13600](https://github.com/angular/material2/issues/13600) [#13587](https://github.com/angular/material2/issues/13587)
* **stepper:** fix text contrast ratio of stepper labels ([#14012](https://github.com/angular/material2/issues/14012)) ([ae5b10f](https://github.com/angular/material2/commit/ae5b10f))
* **stepper:** incorrect border color in dark theme for header with label position ([#13791](https://github.com/angular/material2/issues/13791)) ([bbeb5ef](https://github.com/angular/material2/commit/bbeb5ef))
* **stepper:** intl provider not being picked up in lazy-loaded modules ([#12934](https://github.com/angular/material2/issues/12934)) ([675aa66](https://github.com/angular/material2/commit/675aa66))
* **stepper:** selector assuming that there will always be a dir attribute ([#13751](https://github.com/angular/material2/issues/13751)) ([d5f0f0f](https://github.com/angular/material2/commit/d5f0f0f)), closes [#13741](https://github.com/angular/material2/issues/13741)
* **stroked-button:** ripples and focus overlay have incorrect radius ([#13745](https://github.com/angular/material2/issues/13745)) ([4cdf5ba](https://github.com/angular/material2/commit/4cdf5ba)), closes [#13738](https://github.com/angular/material2/issues/13738)
* **table:** delimit words when filtering ([#13487](https://github.com/angular/material2/issues/13487)) ([2a3599e](https://github.com/angular/material2/commit/2a3599e))
* **tabs:** duplicate animation events on some browsers ([#13674](https://github.com/angular/material2/issues/13674)) ([28e3d36](https://github.com/angular/material2/commit/28e3d36))
* **tabs:** mat-align-tabs not working on mat-tab-nav-bar ([#13818](https://github.com/angular/material2/issues/13818)) ([8fad5d1](https://github.com/angular/material2/commit/8fad5d1)), closes [#13798](https://github.com/angular/material2/issues/13798)
* **tabs:** paginated header offset incorrect on IE ([#13223](https://github.com/angular/material2/issues/13223)) ([d7a8892](https://github.com/angular/material2/commit/d7a8892)), closes [#13217](https://github.com/angular/material2/issues/13217)
* **text-field:** autosize textarea not resizing on minRows decrease ([#13437](https://github.com/angular/material2/issues/13437)) ([cfeab79](https://github.com/angular/material2/commit/cfeab79))
* **tooltip:** add fallback for touch devices if Hammer isn't loaded ([#13580](https://github.com/angular/material2/issues/13580)) ([5d54920](https://github.com/angular/material2/commit/5d54920)), closes [#13536](https://github.com/angular/material2/issues/13536)
* **virtual-scroll:** not removing view from container if it's outside the template cache ([#13916](https://github.com/angular/material2/issues/13916)) ([8922100](https://github.com/angular/material2/commit/8922100)), closes [#13901](https://github.com/angular/material2/issues/13901)

### Features

* **bottom-sheet:** allow focus restoration to be disabled ([#13153](https://github.com/angular/material2/issues/13153)) ([83fc823](https://github.com/angular/material2/commit/83fc823)), closes [#13150](https://github.com/angular/material2/issues/13150)
* **datepicker:** allow custom classes to be applied to individual dates ([#13971](https://github.com/angular/material2/issues/13971)) ([4be1b06](https://github.com/angular/material2/commit/4be1b06)), closes [#13943](https://github.com/angular/material2/issues/13943)
* **drag-drop:** add directive to connect drop lists automatically ([#13754](https://github.com/angular/material2/issues/13754)) ([962dbeb](https://github.com/angular/material2/commit/962dbeb)), closes [#13750](https://github.com/angular/material2/issues/13750)
* **drag-drop:** add the ability to disable dragging ([#13722](https://github.com/angular/material2/issues/13722)) ([b02a72e](https://github.com/angular/material2/commit/b02a72e)), closes [#13651](https://github.com/angular/material2/issues/13651)
* **drag-utils:** add utility function for cloning array items from one array to another ([#13743](https://github.com/angular/material2/issues/13743)) ([d2d8a1f](https://github.com/angular/material2/commit/d2d8a1f)), closes [#13100](https://github.com/angular/material2/issues/13100)
* **keycodes:** add utilities for checking modifier keys ([#13933](https://github.com/angular/material2/issues/13933)) ([7899863](https://github.com/angular/material2/commit/7899863)), closes [#13790](https://github.com/angular/material2/issues/13790)
* **live-announcer:** add ability to clear live element ([#11996](https://github.com/angular/material2/issues/11996)) ([4a1c8ed](https://github.com/angular/material2/commit/4a1c8ed)), closes [#11991](https://github.com/angular/material2/issues/11991)
* **ng-add:** add preview URLs for theme choices ([#13723](https://github.com/angular/material2/issues/13723)) ([4fbbb9d](https://github.com/angular/material2/commit/4fbbb9d)), closes [/github.com/angular/angular-cli/blob/907ce5c94c774147c4b52870b3522aed4e087c76/packages/schematics/angular/ng-new/schema.json#L121](https://github.com//github.com/angular/angular-cli/blob/907ce5c94c774147c4b52870b3522aed4e087c76/packages/schematics/angular/ng-new/schema.json/issues/L121) [#13708](https://github.com/angular/material2/issues/13708)
* **paginator:** allow paginator to be disabled ([#13146](https://github.com/angular/material2/issues/13146)) ([cb4f5a0](https://github.com/angular/material2/commit/cb4f5a0)), closes [#13145](https://github.com/angular/material2/issues/13145)
* **stepper:** add CdkStepHeader directive and fix CdkStepper error on init ([#10614](https://github.com/angular/material2/issues/10614)) ([fbbe463](https://github.com/angular/material2/commit/fbbe463)), closes [#10611](https://github.com/angular/material2/issues/10611)
* **tabs:** add the ability to customize the animation duration ([#13505](https://github.com/angular/material2/issues/13505)) ([0cd7536](https://github.com/angular/material2/commit/0cd7536)), closes [#13428](https://github.com/angular/material2/issues/13428)
* **tabs:** make the updatePagination method public ([#13935](https://github.com/angular/material2/issues/13935)) ([1e4ee0c](https://github.com/angular/material2/commit/1e4ee0c))


### Performance Improvements

* **focus-monitor:** mark event listeners as passive ([#13532](https://github.com/angular/material2/issues/13532)) ([bfc00a0](https://github.com/angular/material2/commit/bfc00a0))
* **list:** reduce css selector size ([#12571](https://github.com/angular/material2/issues/12571)) ([e31e011](https://github.com/angular/material2/commit/e31e011))



<a name="7.0.4"></a>
## 7.0.4 "brick-dress" (2018-11-13)


### Bug Fixes

* **a11y:** aria-live directive announcing the same text multiple times ([#13467](https://github.com/angular/material2/issues/13467)) ([7c2a095](https://github.com/angular/material2/commit/7c2a095))
* **a11y:** avoid overlapping or left over timers in live announcer ([#13602](https://github.com/angular/material2/issues/13602)) ([a93d3a5](https://github.com/angular/material2/commit/a93d3a5))
* **a11y:** key manager preventing arrow key events with modifier keys ([#13503](https://github.com/angular/material2/issues/13503)) ([b7ef6af](https://github.com/angular/material2/commit/b7ef6af)), closes [#11987](https://github.com/angular/material2/issues/11987) [#13496](https://github.com/angular/material2/issues/13496)
* **bazel:** theming bundle not exposed as sass_library ([#14071](https://github.com/angular/material2/issues/14071)) ([71c205e](https://github.com/angular/material2/commit/71c205e))
* **bidi:** preserve user dir attribute ([#13859](https://github.com/angular/material2/issues/13859)) ([86089fe](https://github.com/angular/material2/commit/86089fe)), closes [#13855](https://github.com/angular/material2/issues/13855)
* **button:** ripple color not correct for standard, icon and stroked buttons ([#13235](https://github.com/angular/material2/issues/13235)) ([62c6d55](https://github.com/angular/material2/commit/62c6d55)), closes [#13232](https://github.com/angular/material2/issues/13232)
* **button-toggle:** not forwarding focus to underlying control ([#14001](https://github.com/angular/material2/issues/14001)) ([b7be573](https://github.com/angular/material2/commit/b7be573))
* **button-toggle:** svg icon not align inside toggle ([#13839](https://github.com/angular/material2/issues/13839)) ([2814a99](https://github.com/angular/material2/commit/2814a99)), closes [#13726](https://github.com/angular/material2/issues/13726)
* **checkbox:** no focus indicator in high contrast ([#13255](https://github.com/angular/material2/issues/13255)) ([13d9d3a](https://github.com/angular/material2/commit/13d9d3a)), closes [#13227](https://github.com/angular/material2/issues/13227)
* **chips:** invalid ripple color for selected chips ([#13271](https://github.com/angular/material2/issues/13271)) ([057eee1](https://github.com/angular/material2/commit/057eee1))
* **datepicker:** toggle not forwarding focus to underlying button ([#14020](https://github.com/angular/material2/issues/14020)) ([723d7f5](https://github.com/angular/material2/commit/723d7f5))
* **datepicker:** unable to disable ripple on datepicker toggle ([#13997](https://github.com/angular/material2/issues/13997)) ([2fb58ab](https://github.com/angular/material2/commit/2fb58ab)), closes [#13986](https://github.com/angular/material2/issues/13986)
* **drag-drop:** avoid disrupting drag sequence if event propagation is stopped ([#13841](https://github.com/angular/material2/issues/13841)) ([2902d0b](https://github.com/angular/material2/commit/2902d0b))
* **drag-drop:** avoid generating elements with duplicate ids ([#13489](https://github.com/angular/material2/issues/13489)) ([905f0b4](https://github.com/angular/material2/commit/905f0b4))
* **drag-drop:** avoid interference from native drag&drop ([#14054](https://github.com/angular/material2/issues/14054)) ([8dcbee2](https://github.com/angular/material2/commit/8dcbee2))
* **drag-drop:** enable drag interactions when there is a drag handle ([#13780](https://github.com/angular/material2/issues/13780)) ([0d3b74a](https://github.com/angular/material2/commit/0d3b74a)), closes [#13779](https://github.com/angular/material2/issues/13779)
* **drag-drop:** error if drag item is destroyed zone has stabilized ([#13978](https://github.com/angular/material2/issues/13978)) ([40a63cf](https://github.com/angular/material2/commit/40a63cf))
* **drag-drop:** ignore enter predicate when returning item to its initial container ([#13972](https://github.com/angular/material2/issues/13972)) ([3fb5522](https://github.com/angular/material2/commit/3fb5522))
* **drag-drop:** prevent mouse wheel scrolling while dragging ([#13524](https://github.com/angular/material2/issues/13524)) ([718d306](https://github.com/angular/material2/commit/718d306)), closes [#13508](https://github.com/angular/material2/issues/13508)
* **drag-drop:** add directive to connect drop lists automatically ([#13754](https://github.com/angular/material2/issues/13754)) ([e905127](https://github.com/angular/material2/commit/e905127)), closes [#13750](https://github.com/angular/material2/issues/13750)
* **focus-trap:** warn if initial element is not focusable ([#13960](https://github.com/angular/material2/issues/13960)) ([3026138](https://github.com/angular/material2/commit/3026138)), closes [#13953](https://github.com/angular/material2/issues/13953)
* **icon:** account for query params when prefixing external references ([#13930](https://github.com/angular/material2/issues/13930)) ([90420d6](https://github.com/angular/material2/commit/90420d6)), closes [#13924](https://github.com/angular/material2/issues/13924)
* **menu:** use passive touch listener ([#14041](https://github.com/angular/material2/issues/14041)) ([f5006d6](https://github.com/angular/material2/commit/f5006d6))
* **progress-bar:** account for query params when prefixing references ([#13942](https://github.com/angular/material2/issues/13942)) ([eb82847](https://github.com/angular/material2/commit/eb82847)), closes [#13930](https://github.com/angular/material2/issues/13930)
* **scrolling:** leaking subscription if same element is registered multiple times ([#13974](https://github.com/angular/material2/issues/13974)) ([1a7173d](https://github.com/angular/material2/commit/1a7173d))
* **slide-toggle:** redirect focus to underlying input element ([#13957](https://github.com/angular/material2/issues/13957)) ([1d4be69](https://github.com/angular/material2/commit/1d4be69)), closes [#13953](https://github.com/angular/material2/issues/13953)
* **slide-toggle:** showing focus ripple when clicking disabled control ([#14055](https://github.com/angular/material2/issues/14055)) ([a2c2caf](https://github.com/angular/material2/commit/a2c2caf)), closes [#13957](https://github.com/angular/material2/issues/13957)
* **snackbar:** set aria role based on if announcement message is provided ([#13993](https://github.com/angular/material2/issues/13993)) ([199583b](https://github.com/angular/material2/commit/199583b))
* **stepper:** fix text contrast ratio of stepper labels ([#14012](https://github.com/angular/material2/issues/14012)) ([01605d0](https://github.com/angular/material2/commit/01605d0))



<a name="7.0.3"></a>
## 7.0.3 "lyrium-longboard" (2018-11-06)


### Bug Fixes

* **breakpoints:** set max-widths for breakpoints to non-integers to handle subpixel queries ([#13828](https://github.com/angular/material2/issues/13828)) ([b88b79d](https://github.com/angular/material2/commit/b88b79d))
* **button:** stroked button crops applied badges ([#13912](https://github.com/angular/material2/issues/13912)) ([835dc9e](https://github.com/angular/material2/commit/835dc9e)), closes [#13909](https://github.com/angular/material2/issues/13909)
* **button-toggle:** remove hover state on touch devices ([#13724](https://github.com/angular/material2/issues/13724)) ([f9d5fb4](https://github.com/angular/material2/commit/f9d5fb4))
* **chips:** remove circular dependency between chip-list and chip-input ([#13994](https://github.com/angular/material2/issues/13994)) ([3da858d](https://github.com/angular/material2/commit/3da858d))
* **dialog,bottom-sheet:** enter animation blocking child animations ([#13888](https://github.com/angular/material2/issues/13888)) ([e5afa48](https://github.com/angular/material2/commit/e5afa48)), closes [#13870](https://github.com/angular/material2/issues/13870)
* **drag-drop:** drop list not toggling dragging class inside component with OnPush change detection ([#13703](https://github.com/angular/material2/issues/13703)) ([4e50d4a](https://github.com/angular/material2/commit/4e50d4a)), closes [#13680](https://github.com/angular/material2/issues/13680)
* **drag-drop:** incorrectly laying out items with different height or margins ([#13849](https://github.com/angular/material2/issues/13849)) ([c509591](https://github.com/angular/material2/commit/c509591)), closes [#13483](https://github.com/angular/material2/issues/13483)
* **drag-drop:** multiple parallel drag sequences when dragging nested drag items ([#13820](https://github.com/angular/material2/issues/13820)) ([cdc0c8b](https://github.com/angular/material2/commit/cdc0c8b))
* **list:** add ripples to action list items ([#13799](https://github.com/angular/material2/issues/13799)) ([b293655](https://github.com/angular/material2/commit/b293655)), closes [#13795](https://github.com/angular/material2/issues/13795)
* **list:** remove disabled selection list hover feedback on mobile ([#13850](https://github.com/angular/material2/issues/13850)) ([e975223](https://github.com/angular/material2/commit/e975223))
* **menu:** unable to swap menu panel after first open ([#13819](https://github.com/angular/material2/issues/13819)) ([cbb76ec](https://github.com/angular/material2/commit/cbb76ec)), closes [#13812](https://github.com/angular/material2/issues/13812)
* **ng-update:** do not fail if [@schematics](https://github.com/schematics)/angular version is outdated ([#13929](https://github.com/angular/material2/issues/13929)) ([f10f8b9](https://github.com/angular/material2/commit/f10f8b9))
* **ng-update:** do not throw if typescript version is outdated ([#13927](https://github.com/angular/material2/issues/13927)) ([d44fcf8](https://github.com/angular/material2/commit/d44fcf8))
* **portal:** use portal's ComponentFactoryResolver in portal outlet directive ([#13886](https://github.com/angular/material2/issues/13886)) ([d2af80b](https://github.com/angular/material2/commit/d2af80b)), closes [#12677](https://github.com/angular/material2/issues/12677) [#9712](https://github.com/angular/material2/issues/9712)
* **snack-bar:** set appropriate role based on passed in politeness ([#13864](https://github.com/angular/material2/issues/13864)) ([33d3cb3](https://github.com/angular/material2/commit/33d3cb3)), closes [#13493](https://github.com/angular/material2/issues/13493)
* **snackbar:** override min-width of snackbar on mobile ([#13880](https://github.com/angular/material2/issues/13880)) ([41cb8aa](https://github.com/angular/material2/commit/41cb8aa))
* **stepper:** don't handle enter/space when modifier key is pressed ([#13827](https://github.com/angular/material2/issues/13827)) ([0bd3890](https://github.com/angular/material2/commit/0bd3890)), closes [#13790](https://github.com/angular/material2/issues/13790)
* **tabs:** duplicate animation events on some browsers ([#13674](https://github.com/angular/material2/issues/13674)) ([7106681](https://github.com/angular/material2/commit/7106681))
* **tabs:** mat-align-tabs not working on mat-tab-nav-bar ([#13818](https://github.com/angular/material2/issues/13818)) ([2289e43](https://github.com/angular/material2/commit/2289e43)), closes [#13798](https://github.com/angular/material2/issues/13798)
* **virtual-scroll:** not removing view from container if it's outside the template cache ([#13916](https://github.com/angular/material2/issues/13916)) ([7c202ec](https://github.com/angular/material2/commit/7c202ec)), closes [#13901](https://github.com/angular/material2/issues/13901)
* bazel support for downstream apps ([#13836](https://github.com/angular/material2/issues/13836)) ([61dbd26](https://github.com/angular/material2/commit/61dbd26))



<a name="7.0.2"></a>
## 7.0.2 limestone-linguine (2018-10-26)


### Bug Fixes

* **build:** material not working with ES2015 ([#13709](https://github.com/angular/material2/issues/13709)) ([e9103a6](https://github.com/angular/material2/commit/e9103a6)), closes [#12760](https://github.com/angular/material2/issues/12760) [#13695](https://github.com/angular/material2/issues/13695)
* **button-toggle:** webkit tap highlight conflicting with ripples ([#13721](https://github.com/angular/material2/issues/13721)) ([abd0278](https://github.com/angular/material2/commit/abd0278))
* **cdk-platform:** pass `{}` to `@NgModule` since passing nothing breaks ([#13792](https://github.com/angular/material2/issues/13792)) ([5abb644](https://github.com/angular/material2/commit/5abb644))
* **checkbox:** disabled property not being coerced ([#13755](https://github.com/angular/material2/issues/13755)) ([cee8c65](https://github.com/angular/material2/commit/cee8c65)), closes [#13739](https://github.com/angular/material2/issues/13739)
* **expansion-panel:** don't handle enter/space if modifier is pressed ([#13790](https://github.com/angular/material2/issues/13790)) ([3e6cc77](https://github.com/angular/material2/commit/3e6cc77)), closes [#13783](https://github.com/angular/material2/issues/13783)
* **radio:** don't show hover ripples on touch devices ([#13701](https://github.com/angular/material2/issues/13701)) ([b89c139](https://github.com/angular/material2/commit/b89c139)), closes [#13675](https://github.com/angular/material2/issues/13675)
* **slide-toggle:** don't show hover ripples on touch devices ([#13702](https://github.com/angular/material2/issues/13702)) ([9d495f1](https://github.com/angular/material2/commit/9d495f1)), closes [#13675](https://github.com/angular/material2/issues/13675)
* **stepper:** incorrect border color in dark theme for header with label position ([#13791](https://github.com/angular/material2/issues/13791)) ([afa5a28](https://github.com/angular/material2/commit/afa5a28))
* **stepper:** selector assuming that there will always be a dir attribute ([#13751](https://github.com/angular/material2/issues/13751)) ([576118e](https://github.com/angular/material2/commit/576118e)), closes [#13741](https://github.com/angular/material2/issues/13741)
* **stroked-button:** ripples and focus overlay have incorrect radius ([#13745](https://github.com/angular/material2/issues/13745)) ([7877404](https://github.com/angular/material2/commit/7877404)), closes [#13738](https://github.com/angular/material2/issues/13738)
* **tooltip:** add fallback for touch devices if Hammer isn't loaded ([#13580](https://github.com/angular/material2/issues/13580)) ([9ae6c84](https://github.com/angular/material2/commit/9ae6c84)), closes [#13536](https://github.com/angular/material2/issues/13536)


### Features

* **drag-utils:** add utility function for cloning array items from one array to another ([#13743](https://github.com/angular/material2/issues/13743)) ([13395c5](https://github.com/angular/material2/commit/13395c5)), closes [#13100](https://github.com/angular/material2/issues/13100)
* **ng-add:** add preview URLs for theme choices ([#13723](https://github.com/angular/material2/issues/13723)) ([f1d1fc5](https://github.com/angular/material2/commit/f1d1fc5)), closes [/github.com/angular/angular-cli/blob/907ce5c94c774147c4b52870b3522aed4e087c76/packages/schematics/angular/ng-new/schema.json#L121](https://github.com//github.com/angular/angular-cli/blob/907ce5c94c774147c4b52870b3522aed4e087c76/packages/schematics/angular/ng-new/schema.json/issues/L121) [#13708](https://github.com/angular/material2/issues/13708)



<a name="7.0.1"></a>
## 7.0.1 emerald-egret (2018-10-22)


### Bug Fixes

* **autocomplete:** not propagating same model value when reset while open ([#13634](https://github.com/angular/material2/issues/13634)) ([2006144](https://github.com/angular/material2/commit/2006144))
* **button-toggle:** content shifting in IE11 ([#13492](https://github.com/angular/material2/issues/13492)) ([7f5cbe3](https://github.com/angular/material2/commit/7f5cbe3))
* **datepicker:** don't allow clicks on disabled cells in year and multi-year views ([#13448](https://github.com/angular/material2/issues/13448)) ([85741e0](https://github.com/angular/material2/commit/85741e0))
* **drag-drop:** not picking up handle that isn't a direct descendant ([#13360](https://github.com/angular/material2/issues/13360)) ([0f05d99](https://github.com/angular/material2/commit/0f05d99))
* **drag-drop:** preserve previous inline transform ([#13529](https://github.com/angular/material2/issues/13529)) ([2a8da45](https://github.com/angular/material2/commit/2a8da45))
* **drag-drop:** use passive event listeners for start events ([#13526](https://github.com/angular/material2/issues/13526)) ([5d5fba5](https://github.com/angular/material2/commit/5d5fba5))
* **expansion-panel:** emitting events twice on some browsers ([#13600](https://github.com/angular/material2/issues/13600)) ([85a3ae0](https://github.com/angular/material2/commit/85a3ae0))
* **form-field:** native select options blending in with dropdown background on a dark theme ([#13201](https://github.com/angular/material2/issues/13201)) ([b8a6294](https://github.com/angular/material2/commit/b8a6294))
* **grid-list:** unable to assign numeric zero as gutter size ([#13652](https://github.com/angular/material2/issues/13652)) ([4ffcf74](https://github.com/angular/material2/commit/4ffcf74))
* **list:** selection list moving focus when an option is destroyed ([#13531](https://github.com/angular/material2/issues/13531)) ([2c4c5ba](https://github.com/angular/material2/commit/2c4c5ba))
* **menu:** closing parent overlay when pressing escape ([#13442](https://github.com/angular/material2/issues/13442)) ([c3ae922](https://github.com/angular/material2/commit/c3ae922))
* **menu:** proper focus styling when opened by tap on a touch device ([#13599](https://github.com/angular/material2/issues/13599)) ([c271167](https://github.com/angular/material2/commit/c271167))
* **progress-bar:** not taking current path after first initialization ([#13628](https://github.com/angular/material2/issues/13628)) ([8e331a7](https://github.com/angular/material2/commit/8e331a7))
* **radio:** improved alignment for native validation messages ([#13570](https://github.com/angular/material2/issues/13570)) ([dbf5164](https://github.com/angular/material2/commit/dbf5164))
* **sidenav:** opened and closed events emitting twice on IE and Edge ([#13649](https://github.com/angular/material2/issues/13649)) ([5295e2f](https://github.com/angular/material2/commit/5295e2f))
* **slider:** update value on mousedown instead of click ([#13020](https://github.com/angular/material2/issues/13020)) ([c995db7](https://github.com/angular/material2/commit/c995db7))
* **stepper:** custom icons not centered inside circle ([#12947](https://github.com/angular/material2/issues/12947)) ([45edf64](https://github.com/angular/material2/commit/45edf64))
* **stepper:** emitting the animationDone event twice on some browsers ([#13608](https://github.com/angular/material2/issues/13608)) ([a11ca21](https://github.com/angular/material2/commit/a11ca21)), closes [#13600](https://github.com/angular/material2/issues/13600) [#13587](https://github.com/angular/material2/issues/13587)
* **stepper:** intl provider not being picked up in lazy-loaded modules ([#12934](https://github.com/angular/material2/issues/12934)) ([00ce69b](https://github.com/angular/material2/commit/00ce69b))
* **table:** delimit words when filtering ([#13487](https://github.com/angular/material2/issues/13487)) ([1d87b4c](https://github.com/angular/material2/commit/1d87b4c))
* **text-field:** autosize textarea not resizing on minRows decrease ([#13437](https://github.com/angular/material2/issues/13437)) ([8bae5b4](https://github.com/angular/material2/commit/8bae5b4))


### Performance Improvements

* **focus-monitor:** mark event listeners as passive ([#13532](https://github.com/angular/material2/issues/13532)) ([ba0c820](https://github.com/angular/material2/commit/ba0c820))



<a name="7.0.0"></a>
# 7.0.0 amethyst-ammonite (2018-10-17)

### Highlights

* Support for [Drag and Drop](https://material.angular.io/cdk/drag-drop/overview) in `@angular/cdk/drag-drop`.
* Support for [Virtual Scrolling](https://material.angular.io/cdk/scrolling/overview) in `@angular/cdk/scrolling`.
* Support for native `<select>` element in `<mat-form-field>` .
* Added `<mat-action-list>`, a list where each item is a `<button>`.
* Updated component styles throughout the library matching the 2018 Material Design Spec refresh.
* Added more schematics, with schematics now available for table, drag and drop, tree, address form and more.
* Added CLI prompts when using `ng add` to assist in setting up HammerJS support, application theming and animations.
* 250+ bug/performance fixes


### Upgrading to 7.0

Using the Angular CLI, you can use the `ng update` command to automatically migrate to the new APIs in for Material and CDK.
```
ng update @angular/material
```

**NOTE:** If you are **using only the CDK** you can automatically migrate using `ng update @angular/cdk` instead.


### Breaking Changes

* **ripple:** deprecated `[matRippleSpeedFactor]` and `baseSpeedFactor` for the ripples have been removed. Use the new animation config instead.
* **overlay:** The `flexibleDiemsions` property on `CdkConnectedOverlay` has been renamed to `flexibleDimensions`
* **sidenav:** the constructor signature of the `MatDrawerContent` and `MatSidenavContent` has changed.
* **elevation:** Because `mat-elevation` usages have been moved out of component stylesheets, users who have
not invoked a theme mixin will not see any elevation shadows on Material components.
However, users that have created a custom theme which lacks the `elevation` property will
still see the default black shadows.

Additionally, users who want to use themed elevations in their custom components can create
their own shorthand mixin:

```sass
@import '~@angular/material/theming';

$myTheme: ...

@mixin my-elevation($zValue) {
  @include mat-theme-elevation($zValue, $myTheme);
}

```

and then invoke `angular-material-theme` with the `$myTheme` variable.



### Marked for Deprecation
A number of items throughout the library have been deprecated and are expected to be removed in v8.
#### CDK
Collections
- `SelectionModel.onChange` has been deprecated, use `SelectionModel.changed` instead.

Scrolling
- `ScrollDispatchModule` has been deprecated, use `ScrollingModule` instead.

Table
- `CdkTable.setFooterRowDef` has been deprecated, use `CdkTable.addFooterRowDef` and `CdkTable.removeFooterRowDef` instead.
- `CdkTable.setHeaderRowDef` has been deprecated, use `CdkTable.addHeaderRowDef` and `CdkTable.removeHeaderRowDef` instead.

#### Material
Dialog
- `matDialogAnimations.slideDialog` has been deprecated, use `matDialogAnimations.dialogContainer` instead.
- `MatDialogRef.afterOpen` has been deprecated, use `MatDialogRef.afterOpened` instead.
- `MatDialogRef.afterClose` has been deprecated, use `MatDialogRef.afterClosed` instead.
- `MatDialog.afterOpen` has been deprecated, use `MatDialog.afterOpened` instead.

Form Field
- `<mat-placeholder>` has been deprecated, use `<mat-label>` instead.
- `MatPlaceholder` has been deprecated, use `MatLabel` instead.

Paginator
- `$mat-paginator-selector-trigger-min-width` has been deprecated, use `$mat-paginator-selector-trigger-width` instead.

Select
- `matSelectAnimations.fadeInContent` has been deprecated and will be removed without replacement.
- The setter method for `MatSelect.focused` has been deprecated, `MatSelect.focused` will become readonly.

Toolbar
- `$mat-toolbar-height-mobile-portrait` has been deprecated and will be removed without replacement.
- `$mat-toolbar-height-mobile-landscape` has been deprecated and will be removed without replacement.

**NOTE:** In addition to the specific deprecations listed above, many component constructor methods contain 
optional parameters which are expected to become required in v8.


### Bug Fixes

* **icon:** not taking current path after initialization  ([#13641](https://github.com/angular/material2/issues/13641)) ([df9ec7](https://github.com/angular/material2/commit/df9ec7))
* **list:** action list items clickable area not stretching the full width ([#13099](https://github.com/angular/material2/issues/13099)) ([f3057fa](https://github.com/angular/material2/commit/f3057fa))


<a name="7.0.0-rc.2"></a>
# 7.0.0-rc.2 (2018-10-15)


### Bug Fixes

* **drag-drop:** enterPredicate being called with wrong drop container ([#13578](https://github.com/angular/material2/issues/13578)) ([60b4a58](https://github.com/angular/material2/commit/60b4a58))
* **drag-drop:** rename cdkDrop to cdkDropList ([#13619](https://github.com/angular/material2/issues/13619)) ([160b688](https://github.com/angular/material2/commit/160b688))
* **ng-add:** do not add theme file if existing theme is set up ([#13468](https://github.com/angular/material2/issues/13468)) ([d1e59a2](https://github.com/angular/material2/commit/d1e59a2))
* **schematics:** template content exceeds max line length ([#13521](https://github.com/angular/material2/issues/13521)) ([b0a1daf](https://github.com/angular/material2/commit/b0a1daf))
* **schematics:** tree folder icons do not have enough contrast ([#13462](https://github.com/angular/material2/issues/13462)) ([4a0eb2b](https://github.com/angular/material2/commit/4a0eb2b))
* **virtual-scroll:** fix several small bugs ([#13597](https://github.com/angular/material2/issues/13597)) ([8cfaeea](https://github.com/angular/material2/commit/8cfaeea))

### Features

* **schematics:** prompt for name when generating component ([#13518](https://github.com/angular/material2/issues/13518)) ([9085de7](https://github.com/angular/material2/commit/9085de7))



<a name="7.0.0-rc.1"></a>
# 7.0.0-rc.1 (2018-10-09)


### Bug Fixes

* **a11y:** not being able to escape disabled focus trap using arrow keys ([#13133](https://github.com/angular/material2/issues/13133)) ([3c55caa](https://github.com/angular/material2/commit/3c55caa)), closes [#13132](https://github.com/angular/material2/issues/13132)
* **autocomplete:** closing parent overlay when pressing escape (Esc) ([#13413](https://github.com/angular/material2/issues/13413)) ([8dfd2ee](https://github.com/angular/material2/commit/8dfd2ee))
* **bottom-sheet:** dismiss bottom sheet on destroy ([#13120](https://github.com/angular/material2/issues/13120)) ([ffa4a06](https://github.com/angular/material2/commit/ffa4a06))
* **button-toggle:** not setting proper border in vertical mode ([#13397](https://github.com/angular/material2/issues/13397)) ([d58db5d](https://github.com/angular/material2/commit/d58db5d))
* **button-toggle:** remove extra focus indication added by firefox ([#13367](https://github.com/angular/material2/issues/13367)) ([3583913](https://github.com/angular/material2/commit/3583913))
* **checkbox:** ripple not hiding after click/touch ([#13295](https://github.com/angular/material2/issues/13295)) ([afb0352](https://github.com/angular/material2/commit/afb0352)), closes [#13291](https://github.com/angular/material2/issues/13291)
* **chips:** content not centered vertically on IE in some cases ([#13260](https://github.com/angular/material2/issues/13260)) ([4f43f5c](https://github.com/angular/material2/commit/4f43f5c))
* **chips:** ripple not clipping correctly in safari ([#12244](https://github.com/angular/material2/issues/12244)) ([eb95e61](https://github.com/angular/material2/commit/eb95e61))
* **chips:** selectionChange event firing when value has not changed ([#13173](https://github.com/angular/material2/issues/13173)) ([e8a6ea1](https://github.com/angular/material2/commit/e8a6ea1))
* **datepicker:** change overlay position strategy so the calendar is kept on-screen ([#11607](https://github.com/angular/material2/issues/11607)) ([f44d6db](https://github.com/angular/material2/commit/f44d6db))
* **drag-drop:** avoid interfering with element clicks ([#13152](https://github.com/angular/material2/issues/13152)) ([38e7dd2](https://github.com/angular/material2/commit/38e7dd2))
* **expansion-panel:** correct jump in panel sizing during animation ([#12509](https://github.com/angular/material2/issues/12509)) ([a706c8c](https://github.com/angular/material2/commit/a706c8c))
* **form-field:** blue box inside focused native select on IE ([#13187](https://github.com/angular/material2/issues/13187)) ([ab44d50](https://github.com/angular/material2/commit/ab44d50))
* **form-field:** not updating outline when prefix/suffix is added or removed ([#13253](https://github.com/angular/material2/issues/13253)) ([0060bd7](https://github.com/angular/material2/commit/0060bd7)), closes [#13251](https://github.com/angular/material2/issues/13251)
* **grid-list:** incorrectly laying out tiles for nested list ([#13086](https://github.com/angular/material2/issues/13086)) ([3e1cff0](https://github.com/angular/material2/commit/3e1cff0)), closes [#13074](https://github.com/angular/material2/issues/13074)
* **icon:** handle references for pages with base tag ([#12428](https://github.com/angular/material2/issues/12428)) ([9e5fd91](https://github.com/angular/material2/commit/9e5fd91)), closes [#9276](https://github.com/angular/material2/issues/9276)
* **list:** selection list not marking options as selected correctly when setting value with duplicates ([#13363](https://github.com/angular/material2/issues/13363)) ([bef9a17](https://github.com/angular/material2/commit/bef9a17))
* **menu:** incorrectly styling keyboard focus, if trigger is right clicked before opening ([#13136](https://github.com/angular/material2/issues/13136)) ([730e6a3](https://github.com/angular/material2/commit/730e6a3))
* **ng-add:** allow using noop animations ([#13429](https://github.com/angular/material2/issues/13429)) ([15a1ab7](https://github.com/angular/material2/commit/15a1ab7))
* **overlay:** incorrectly calculating centered position on a scrolled page with pushing ([#13185](https://github.com/angular/material2/issues/13185)) ([f5dd24a](https://github.com/angular/material2/commit/f5dd24a)), closes [#11868](https://github.com/angular/material2/issues/11868)
* **overlay:** wait for panel to detach before removing panelClass ([#13199](https://github.com/angular/material2/issues/13199)) ([238aef0](https://github.com/angular/material2/commit/238aef0)), closes [#13189](https://github.com/angular/material2/issues/13189)
* **paginator:** icons and labels not centered vertically on IE ([#12495](https://github.com/angular/material2/issues/12495)) ([fe3f37a](https://github.com/angular/material2/commit/fe3f37a)), closes [#12491](https://github.com/angular/material2/issues/12491)
* **schematics:** [@angular](https://github.com/angular)/material schematics not working ([#13406](https://github.com/angular/material2/issues/13406)) ([3f8ee74](https://github.com/angular/material2/commit/3f8ee74))
* **schematics:** name is required when generating the drag-drop schematic ([#13452](https://github.com/angular/material2/issues/13452)) ([4a9bbcb](https://github.com/angular/material2/commit/4a9bbcb))
* **schematics:** proper error if name is not specified ([#13379](https://github.com/angular/material2/issues/13379)) ([4a0b09a](https://github.com/angular/material2/commit/4a0b09a))
* **scrolling:** viewport ruler resize event running inside the NgZone ([#12909](https://github.com/angular/material2/issues/12909)) ([707a7ee](https://github.com/angular/material2/commit/707a7ee)), closes [#12883](https://github.com/angular/material2/issues/12883)
* **select:** allow extra content to be projected after label in mat-optgroup ([#13396](https://github.com/angular/material2/issues/13396)) ([cb5b15e](https://github.com/angular/material2/commit/cb5b15e)), closes [#11489](https://github.com/angular/material2/issues/11489)
* **select:** handle home and end keys on closed select ([#13278](https://github.com/angular/material2/issues/13278)) ([d6ba25f](https://github.com/angular/material2/commit/d6ba25f))
* **tabs:** disabled tab link not preventing router navigation ([#10358](https://github.com/angular/material2/issues/10358)) ([bf66d57](https://github.com/angular/material2/commit/bf66d57)), closes [#10354](https://github.com/angular/material2/issues/10354)
* **virtual-scroll:** don't set both `right` and `left` on the content ([#13412](https://github.com/angular/material2/issues/13412)) ([6ee9149](https://github.com/angular/material2/commit/6ee9149)), closes [#13231](https://github.com/angular/material2/issues/13231)


### Features

* **bottom-sheet:** add injection token for default options ([#13172](https://github.com/angular/material2/issues/13172)) ([3de3851](https://github.com/angular/material2/commit/3de3851)), closes [#13149](https://github.com/angular/material2/issues/13149)
* **datepicker:** add ng-content to datepicker header ([#13236](https://github.com/angular/material2/issues/13236)) ([3fc0d36](https://github.com/angular/material2/commit/3fc0d36)), closes [#13212](https://github.com/angular/material2/issues/13212)
* **schematics:** create drag-drop schematic ([#13368](https://github.com/angular/material2/issues/13368)) ([72ccd8b](https://github.com/angular/material2/commit/72ccd8b))



<a name="7.0.0-rc.0"></a>
# 7.0.0-rc.0 (2018-10-02)


### Bug Fixes

* **autocomplete:** dividers in list throwing off keyboard navigation ([#13224](https://github.com/angular/material2/issues/13224)) ([0886cef](https://github.com/angular/material2/commit/0886cef)), closes [#13200](https://github.com/angular/material2/issues/13200)
* **button:** fix stroked button border color ([#13219](https://github.com/angular/material2/issues/13219)) ([bfeb540](https://github.com/angular/material2/commit/bfeb540))
* **checkbox:** clear tabindex from host element ([#13308](https://github.com/angular/material2/issues/13308)) ([845388c](https://github.com/angular/material2/commit/845388c))
* **chips:** set aria-invalid on chip input ([#13249](https://github.com/angular/material2/issues/13249)) ([311d786](https://github.com/angular/material2/commit/311d786)), closes [#13205](https://github.com/angular/material2/issues/13205)
* **common:** account for async hammer loader when checking whether hammer is defined ([#12933](https://github.com/angular/material2/issues/12933)) ([d15431b](https://github.com/angular/material2/commit/d15431b))
* **drag-drop:** emitting incorrect index for horizontal list in rtl ([#13274](https://github.com/angular/material2/issues/13274)) ([f3bb0c7](https://github.com/angular/material2/commit/f3bb0c7))
* **drag-drop:** error on IE when customizing root element ([#13279](https://github.com/angular/material2/issues/13279)) ([e1071f0](https://github.com/angular/material2/commit/e1071f0))
* **drag-drop:** unable to return item to initial container within same drag sequence, if not connected to current drag container ([#13247](https://github.com/angular/material2/issues/13247)) ([0ac41a0](https://github.com/angular/material2/commit/0ac41a0)), closes [#13246](https://github.com/angular/material2/issues/13246)
* **form-field:** always use native input value to determine whether control is empty ([#13307](https://github.com/angular/material2/issues/13307)) ([10e6502](https://github.com/angular/material2/commit/10e6502)), closes [#13305](https://github.com/angular/material2/issues/13305)
* **form-field:** incorrect arrow color for native select ([#13046](https://github.com/angular/material2/issues/13046)) ([10b8353](https://github.com/angular/material2/commit/10b8353))
* **form-field:** native date/time input taller than text input ([#13321](https://github.com/angular/material2/issues/13321)) ([92a5f0e](https://github.com/angular/material2/commit/92a5f0e)), closes [#13317](https://github.com/angular/material2/issues/13317)
* **form-field:** native select outline not reset on firefox ([#12967](https://github.com/angular/material2/issues/12967)) ([38e492f](https://github.com/angular/material2/commit/38e492f))
* **grid:** fix mat-grid-tile position ([#12980](https://github.com/angular/material2/issues/12980)) ([966cf5f](https://github.com/angular/material2/commit/966cf5f))
* **grid-list:** exception thrown when rowHeight is set before first change detection run ([#13112](https://github.com/angular/material2/issues/13112)) ([e7007a2](https://github.com/angular/material2/commit/e7007a2)), closes [#13102](https://github.com/angular/material2/issues/13102)
* **grid-list:** throw error if invalid value is assigned for rowHeight ([#13254](https://github.com/angular/material2/issues/13254)) ([210f3f9](https://github.com/angular/material2/commit/210f3f9)), closes [#13252](https://github.com/angular/material2/issues/13252)
* **list:** set aria-multiselectable on selection list ([#13325](https://github.com/angular/material2/issues/13325)) ([877ef5d](https://github.com/angular/material2/commit/877ef5d))
* **overlay:** connected overlay directive inputs not updating position strategy ([#13066](https://github.com/angular/material2/issues/13066)) ([1d8e9af](https://github.com/angular/material2/commit/1d8e9af))
* **paginator:** getNumberOfPages off by one ([#10724](https://github.com/angular/material2/issues/10724)) ([016ba5c](https://github.com/angular/material2/commit/016ba5c)), closes [#10720](https://github.com/angular/material2/issues/10720) [#10699](https://github.com/angular/material2/issues/10699)
* **radio:** clear tabindex from host element ([#13323](https://github.com/angular/material2/issues/13323)) ([5c0a061](https://github.com/angular/material2/commit/5c0a061)), closes [#13311](https://github.com/angular/material2/issues/13311) [#13308](https://github.com/angular/material2/issues/13308)
* **schematics:** addressForm: fix bad Validators definition and TSLint ([#13285](https://github.com/angular/material2/issues/13285)) ([267dd65](https://github.com/angular/material2/commit/267dd65))
* **schematics:** dashboard schematic fails parsing declaration in spec ([#13269](https://github.com/angular/material2/issues/13269)) ([543cb9f](https://github.com/angular/material2/commit/543cb9f))
* **schematics:** fix typo in table's datasource ([#13283](https://github.com/angular/material2/issues/13283)) ([0ccdfc8](https://github.com/angular/material2/commit/0ccdfc8))
* **schematics:** nav schematic generates TSLint errors ([#13268](https://github.com/angular/material2/issues/13268)) ([8d25fd1](https://github.com/angular/material2/commit/8d25fd1))
* **schematics:** remove unnecessary semicolon in tree component ([#13284](https://github.com/angular/material2/issues/13284)) ([8558878](https://github.com/angular/material2/commit/8558878))
* **schematics:** sidenav toolbar should use default background ([#13282](https://github.com/angular/material2/issues/13282)) ([c454f7b](https://github.com/angular/material2/commit/c454f7b))
* **schematics:** table schematic not expanding full width ([#13234](https://github.com/angular/material2/issues/13234)) ([884762f](https://github.com/angular/material2/commit/884762f))
* **schematics:** toolbar in nav w/o z-index causes issues with dashboard ([#13270](https://github.com/angular/material2/issues/13270)) ([d74e38c](https://github.com/angular/material2/commit/d74e38c))
* **select:** give native select a bigger clickable area ([#13228](https://github.com/angular/material2/issues/13228)) ([6da7d23](https://github.com/angular/material2/commit/6da7d23))
* **slide-toggle:** clear tabindex from host element ([#13311](https://github.com/angular/material2/issues/13311)) ([119fafd](https://github.com/angular/material2/commit/119fafd)), closes [#13308](https://github.com/angular/material2/issues/13308)
* **snack-bar:** button not centered inside snack bar on IE11 ([#13062](https://github.com/angular/material2/issues/13062)) ([4e05745](https://github.com/angular/material2/commit/4e05745))
* **snackbar:** move elevation style to snackbar theme ([#13273](https://github.com/angular/material2/issues/13273)) ([96e670f](https://github.com/angular/material2/commit/96e670f))
* **stepper:** vertical step header labels not centered on IE ([#13262](https://github.com/angular/material2/issues/13262)) ([40fb5cb](https://github.com/angular/material2/commit/40fb5cb))
* **tooltip:** custom gesture config not set up ([#12941](https://github.com/angular/material2/issues/12941)) ([1852563](https://github.com/angular/material2/commit/1852563)), closes [#12940](https://github.com/angular/material2/issues/12940) [#12917](https://github.com/angular/material2/issues/12917)
* **tooltip:** hiding and reopening for consecutive show calls ([#13326](https://github.com/angular/material2/issues/13326)) ([b5001f6](https://github.com/angular/material2/commit/b5001f6))


### Features

* **badge:** allow badge to be disabled ([#13196](https://github.com/angular/material2/issues/13196)) ([bfc1286](https://github.com/angular/material2/commit/bfc1286)), closes [#13191](https://github.com/angular/material2/issues/13191)
* **button-toggle:** align with 2018 material design spec ([#12443](https://github.com/angular/material2/issues/12443)) ([fd3eb6a](https://github.com/angular/material2/commit/fd3eb6a))
* **overlay:** add option to automatically dispose on navigation ([#12592](https://github.com/angular/material2/issues/12592)) ([d48b1ba](https://github.com/angular/material2/commit/d48b1ba)), closes [#12544](https://github.com/angular/material2/issues/12544)
* **overlay:** add support for swappable position strategies ([#12306](https://github.com/angular/material2/issues/12306)) ([e0f3ae7](https://github.com/angular/material2/commit/e0f3ae7))
* **schematics:** support for cdk `ng add` ([#13319](https://github.com/angular/material2/issues/13319)) ([ac3f8c4](https://github.com/angular/material2/commit/ac3f8c4))
* **schematics:** support for cdk `ng-update`. ([#13303](https://github.com/angular/material2/issues/13303)) ([1afddfb](https://github.com/angular/material2/commit/1afddfb))
* **tabs:** align with 2018 material design spec ([#12605](https://github.com/angular/material2/issues/12605)) ([0c5598c](https://github.com/angular/material2/commit/0c5598c))
* **tree:** support units different than px for indentation ([#12991](https://github.com/angular/material2/issues/12991)) ([590d294](https://github.com/angular/material2/commit/590d294))


### Performance Improvements

* **virtual-scroll:** use auditTime instead of sampleTime ([#13131](https://github.com/angular/material2/issues/13131)) ([c26dc74](https://github.com/angular/material2/commit/c26dc74))


### update

* **ripple:** remove deprecated speed factor option ([#12258](https://github.com/angular/material2/issues/12258)) ([a6c91bc](https://github.com/angular/material2/commit/a6c91bc))


### BREAKING CHANGES

* **ripple:** deprecated `[matRippleSpeedFactor]` and `baseSpeedFactor` for the ripples have been removed. Use the new animation config instead.



<a name="7.0.0-beta.2"></a>
# 7.0.0-beta.2 (2018-09-20)


### Highlights

* This release includes a number of changes to bring the components more in line with the 2018
  Material Design update. If you are overriding the default styles, you may find that you need to
  tweak them to look right after these changes.

### Bug Fixes

* **card:** better scaling for avatar image ([#13032](https://github.com/angular/material2/issues/13032)) ([19ce1a1](https://github.com/angular/material2/commit/19ce1a1))
* **checkbox, slide-toggle:** no margin if content is projected ([#12973](https://github.com/angular/material2/issues/12973)) ([4636a98](https://github.com/angular/material2/commit/4636a98)), closes [#4720](https://github.com/angular/material2/issues/4720)
* **chips:** arrow keys resetting focus to first chip ([#12987](https://github.com/angular/material2/issues/12987)) ([959c827](https://github.com/angular/material2/commit/959c827))
* **dialog:** clean up open dialogs on destroy ([#12835](https://github.com/angular/material2/issues/12835)) ([4e15ba9](https://github.com/angular/material2/commit/4e15ba9))
* **expansion:** MatExpansionHeader transition animations ([#13088](https://github.com/angular/material2/issues/13088)) ([4a96539](https://github.com/angular/material2/commit/4a96539)), closes [#11990](https://github.com/angular/material2/issues/11990) [#11990](https://github.com/angular/material2/issues/11990) [#11990](https://github.com/angular/material2/issues/11990) [#11990](https://github.com/angular/material2/issues/11990) [#11990](https://github.com/angular/material2/issues/11990) [#11990](https://github.com/angular/material2/issues/11990) [#11990](https://github.com/angular/material2/issues/11990) [#11990](https://github.com/angular/material2/issues/11990)
* **form-field:** Make labels show while printing ([#12766](https://github.com/angular/material2/issues/12766)) ([e88271a](https://github.com/angular/material2/commit/e88271a))
* **table:** incorrect padding and text alignment in rtl ([#12280](https://github.com/angular/material2/issues/12280)) ([2b89342](https://github.com/angular/material2/commit/2b89342)), closes [#12276](https://github.com/angular/material2/issues/12276)


### Features

* **button:** align with 2018 material design spec ([#13083](https://github.com/angular/material2/issues/13083)) ([79801e0](https://github.com/angular/material2/commit/79801e0)), closes [#12537](https://github.com/angular/material2/issues/12537) [#13011](https://github.com/angular/material2/issues/13011)
* **card:** align with 2018 material design spec ([#12731](https://github.com/angular/material2/issues/12731)) ([484dc8b](https://github.com/angular/material2/commit/484dc8b))
* **checkbox:** align with 2018 material design spec ([#12493](https://github.com/angular/material2/issues/12493)) ([95acccc](https://github.com/angular/material2/commit/95acccc))
* **chips:** align with 2018 material design spec ([#12838](https://github.com/angular/material2/issues/12838)) ([3cc9c67](https://github.com/angular/material2/commit/3cc9c67))
* **dialog:** align with 2018 material design spec ([#12705](https://github.com/angular/material2/issues/12705)) ([00b7233](https://github.com/angular/material2/commit/00b7233))
* **elevation:** move elevation rules into theme stylesheets ([#11344](https://github.com/angular/material2/issues/11344)) ([9c075f5](https://github.com/angular/material2/commit/9c075f5)), closes [#11343](https://github.com/angular/material2/issues/11343)


### BREAKING CHANGES

* **dialog:** * The `matDialogAnimations.slideDialog` symbol has been renamed to `matDialogAnimations.dialogContainer`.

![angular_material_-_google_chrome_2018-08-16_20-43-44](https://user-images.githubusercontent.com/4450522/44231568-da0d2780-a19e-11e8-9836-4f1b15f9bcc2.png)
![angular_material_-_google_chrome_2018-08-16_21-30-17](https://user-images.githubusercontent.com/4450522/44231576-e09b9f00-a19e-11e8-9fae-8ad9cf0be8e5.png)
* **elevation:** Because `mat-elevation` usages have been moved out of component stylesheets, users who have
not invoked a theme mixin will not see any elevation shadows on Material components.
However, users that have created a custom theme which lacks the `elevation` property will
still see the default black shadows.

Additionally, users who want to use themed elevations in their custom components can create
their own shorthand mixin:

```sass
@import '~@angular/material/theming';

$myTheme: ...

@mixin my-elevation($zValue) {
  @include mat-theme-elevation($zValue, $myTheme);
}

```

and then invoke `angular-material-theme` with the `$myTheme` variable.



<a name="7.0.0-beta.1"></a>
# 7.0.0-beta.1 (2018-09-17)


### Bug Fixes

* **button-toggle:** underlying input not disabled when group is disabled ([#11610](https://github.com/angular/material2/issues/11610)) ([bd21f21](https://github.com/angular/material2/commit/bd21f21)), closes [#11608](https://github.com/angular/material2/issues/11608)
* **chips:** default click action on chip being prevented ([#12856](https://github.com/angular/material2/issues/12856)) ([ae3ce4a](https://github.com/angular/material2/commit/ae3ce4a)), closes [#9032](https://github.com/angular/material2/issues/9032)
* **datepicker:** allow calendar cell selection via the space key ([#13098](https://github.com/angular/material2/issues/13098)) ([5c4a334](https://github.com/angular/material2/commit/5c4a334))
* **drag-drop:** DOM element not being returned to initial container on drop ([#12948](https://github.com/angular/material2/issues/12948)) ([fb7bf90](https://github.com/angular/material2/commit/fb7bf90)), closes [#12944](https://github.com/angular/material2/issues/12944)
* **drag-drop:** dragging class not being applied on drop container ([#12921](https://github.com/angular/material2/issues/12921)) ([ec0de52](https://github.com/angular/material2/commit/ec0de52))
* **drag-drop:** incorrectly calculating index when sorting horizontally ([#13082](https://github.com/angular/material2/issues/13082)) ([664ef4c](https://github.com/angular/material2/commit/664ef4c)), closes [#13072](https://github.com/angular/material2/issues/13072)
* **drag-drop:** incorrectly calculating pointer position inside element, in some cases ([#13111](https://github.com/angular/material2/issues/13111)) ([22cd3ed](https://github.com/angular/material2/commit/22cd3ed)), closes [#13107](https://github.com/angular/material2/issues/13107)
* **drag-drop:** incorrectly picking up transitions on non-transform properties ([#12966](https://github.com/angular/material2/issues/12966)) ([951add9](https://github.com/angular/material2/commit/951add9))
* **drag-drop:** not dropping immediately for failed drag after a successful one ([#13097](https://github.com/angular/material2/issues/13097)) ([32a0010](https://github.com/angular/material2/commit/32a0010)), closes [#13091](https://github.com/angular/material2/issues/13091)
* **drag-drop:** text selection not disabled on safari if user drags out of the viewport ([#12864](https://github.com/angular/material2/issues/12864)) ([8ee5fb6](https://github.com/angular/material2/commit/8ee5fb6))
* **drawer:** respect `NoopAnimationsModule` and `@.disabled` binding ([#12839](https://github.com/angular/material2/issues/12839)) ([23df492](https://github.com/angular/material2/commit/23df492))
* **expansion:** disable all animations when using NoopAnimationsModule ([#12855](https://github.com/angular/material2/issues/12855)) ([3e22641](https://github.com/angular/material2/commit/3e22641)), closes [#10590](https://github.com/angular/material2/issues/10590)
* **form-field:** don't set up mutation observer on non-outline appearances ([#12976](https://github.com/angular/material2/issues/12976)) ([cbfbade](https://github.com/angular/material2/commit/cbfbade))
* **form-field:** remove chevron from native multi-select ([#13009](https://github.com/angular/material2/issues/13009)) ([b62343a](https://github.com/angular/material2/commit/b62343a))
* **grid-list:** better handling of negative columns ([#12939](https://github.com/angular/material2/issues/12939)) ([cfb83a0](https://github.com/angular/material2/commit/cfb83a0))
* **input:** do not focus input element twice ([#12851](https://github.com/angular/material2/issues/12851)) ([7d586e4](https://github.com/angular/material2/commit/7d586e4)), closes [#12849](https://github.com/angular/material2/issues/12849)
* **ng-update:** do not throw if imports without named bindings are used ([#12866](https://github.com/angular/material2/issues/12866)) ([#12984](https://github.com/angular/material2/issues/12984)) ([fe64211](https://github.com/angular/material2/commit/fe64211)), closes [#11571](https://github.com/angular/material2/issues/11571)
* **overlay:** correct misspelled flexibleDiemsions property ([#12927](https://github.com/angular/material2/issues/12927)) ([5d1643a](https://github.com/angular/material2/commit/5d1643a)), closes [#12925](https://github.com/angular/material2/issues/12925)
* **overlay:** infinite loop when used together with zone-patch-rxjs ([#13081](https://github.com/angular/material2/issues/13081)) ([c2e502c](https://github.com/angular/material2/commit/c2e502c)), closes [#12686](https://github.com/angular/material2/issues/12686)
* **platform:** wrap MSStream property detection as string to prevent Closure property renaming ([#13117](https://github.com/angular/material2/issues/13117)) ([aef61eb](https://github.com/angular/material2/commit/aef61eb)), closes [#12223](https://github.com/angular/material2/issues/12223)
* **portal:** remove dependency on deprecated parentInjector ([#12986](https://github.com/angular/material2/issues/12986)) ([f39e091](https://github.com/angular/material2/commit/f39e091))
* **progress-bar:** buffer background animation stuttering ([#13114](https://github.com/angular/material2/issues/13114)) ([2f2e116](https://github.com/angular/material2/commit/2f2e116))
* **ripple:** ripples not being cleared if touch sequence is canceled ([#12936](https://github.com/angular/material2/issues/12936)) ([948e563](https://github.com/angular/material2/commit/948e563))
* **sidenav:** not positioning correctly in rtl ([#12741](https://github.com/angular/material2/issues/12741)) ([9d3d95f](https://github.com/angular/material2/commit/9d3d95f))
* **snack-bar:** dismiss snack bar on destroy ([#13042](https://github.com/angular/material2/issues/13042)) ([50be24b](https://github.com/angular/material2/commit/50be24b))
* **tabs:** pagination state not updated when tab content changes ([#12911](https://github.com/angular/material2/issues/12911)) ([a7de64a](https://github.com/angular/material2/commit/a7de64a)), closes [#12901](https://github.com/angular/material2/issues/12901)
* **tooltip:** not showing up on touch devices ([#12940](https://github.com/angular/material2/issues/12940)) ([722dfb3](https://github.com/angular/material2/commit/722dfb3)), closes [#12917](https://github.com/angular/material2/issues/12917)
* **tooltip:** text fields not editable if tooltip is applied in safari ([#12959](https://github.com/angular/material2/issues/12959)) ([0389d12](https://github.com/angular/material2/commit/0389d12)), closes [#12953](https://github.com/angular/material2/issues/12953)
* **tree:** theming nested notes ([#12938](https://github.com/angular/material2/issues/12938)) ([e24f24a](https://github.com/angular/material2/commit/e24f24a))
* **typings:** update typings to support more strict typings in RxJS 6.3.2 ([#12979](https://github.com/angular/material2/issues/12979)) ([0a25fca](https://github.com/angular/material2/commit/0a25fca))


### Features

* **list:** add new `<mat-action-list>`  ([#12415](https://github.com/angular/material2/issues/12415)) ([69fa762](https://github.com/angular/material2/commit/69fa762))
* **menu:** align with 2018 material design spec ([#12331](https://github.com/angular/material2/issues/12331)) ([c812268](https://github.com/angular/material2/commit/c812268))
* **ng-add:** add x-prompts to install schematics ([#13058](https://github.com/angular/material2/issues/13058)) ([a5bc79c](https://github.com/angular/material2/commit/a5bc79c))
* **schematics:** compatibility with Angular CLI 6.2.0 ([#13078](https://github.com/angular/material2/issues/13078)) ([714c205](https://github.com/angular/material2/commit/714c205)), closes [#11438](https://github.com/angular/material2/issues/11438)
* **select:** align panel appearance and animation with 2018 material design spec ([#12975](https://github.com/angular/material2/issues/12975)) ([18d0fa8](https://github.com/angular/material2/commit/18d0fa8))
* **stepper:** Create MAT_STEPPER_GLOBAL_OPTIONS InjectionToken ([#11457](https://github.com/angular/material2/issues/11457)) ([9ab2c90](https://github.com/angular/material2/commit/9ab2c90))


### BREAKING CHANGES

* **overlay:** The `flexibleDiemsions` property on `CdkConnectedOverlay` has been renamed to `flexibleDimensions`



<a name="7.0.0-beta.0"></a>
# [7.0.0-beta.0](https://github.com/angular/material2/compare/6.4.0...7.0.0-beta.0) (2018-08-30)

### Highlights
* Support for drag and drop in `@angular/cdk/drag-drop`!
* Support for virtual scrolling in `@angular/cdk/scrolling`!
* You can now use a native `<select>` element in `<mat-form-field>` 
* Updated visuals for 2018 Material Design update (in-progress, not all components are done)

_Note that schematics for v7 are still in-progress._

You can view a beta version of the docs at https://beta-angular-material-io.firebaseapp.com. 

### Bug Fixes

* **autocomplete:** remove aria-owns attribute while closed ([#12333](https://github.com/angular/material2/issues/12333)) ([f0a0ab1](https://github.com/angular/material2/commit/f0a0ab1)), closes [#12332](https://github.com/angular/material2/issues/12332)
* **autocomplete:** reopening closed autocomplete when coming back to tab ([#12372](https://github.com/angular/material2/issues/12372)) ([c2b488e](https://github.com/angular/material2/commit/c2b488e)), closes [#12337](https://github.com/angular/material2/issues/12337)
* **autofill:** avoid firing unnecessary event on initial render of input ([#12116](https://github.com/angular/material2/issues/12116)) ([c2fc3f4](https://github.com/angular/material2/commit/c2fc3f4))
* **badge:** apply view encapsulation attributes on badge element ([#12870](https://github.com/angular/material2/issues/12870)) ([db1d51f](https://github.com/angular/material2/commit/db1d51f))
* **badge:** hide badges with no content ([#12239](https://github.com/angular/material2/issues/12239)) ([701a0dd](https://github.com/angular/material2/commit/701a0dd))
* **bidi:** default invalid directionality values to ltr ([#12396](https://github.com/angular/material2/issues/12396)) ([e644350](https://github.com/angular/material2/commit/e644350))
* **breakpoints:** emit only one event for adjacent breakpoint changes. ([#11007](https://github.com/angular/material2/issues/11007)) ([2830a64](https://github.com/angular/material2/commit/2830a64))
* **button:** allow for non-colored flat button ([#12550](https://github.com/angular/material2/issues/12550)) ([8c08bb1](https://github.com/angular/material2/commit/8c08bb1))
* **button:** allow transition for the button focus overlay for all buttons ([#12552](https://github.com/angular/material2/issues/12552)) ([a080a79](https://github.com/angular/material2/commit/a080a79))
* **button-toggle:** clickable area not stretching when custom width is set ([#12642](https://github.com/angular/material2/issues/12642)) ([ecf8b0d](https://github.com/angular/material2/commit/ecf8b0d)), closes [#8432](https://github.com/angular/material2/issues/8432)
* **button-toggle:** forward tabindex to underlying button ([#12538](https://github.com/angular/material2/issues/12538)) ([7dff5f8](https://github.com/angular/material2/commit/7dff5f8))
* **button-toggle:** set aria-disabled based on group disabled state ([#12828](https://github.com/angular/material2/issues/12828)) ([5969523](https://github.com/angular/material2/commit/5969523))
* **card:** images in title-group overlapping content ([#12205](https://github.com/angular/material2/issues/12205)) ([89d16b2](https://github.com/angular/material2/commit/89d16b2)), closes [#10031](https://github.com/angular/material2/issues/10031)
* **card:** incorrectly inverting inset divider in rtl ([#12285](https://github.com/angular/material2/issues/12285)) ([fba4a93](https://github.com/angular/material2/commit/fba4a93))
* **cdk-text-field:** prevent keyframes from getting stripped by LibSass ([#12567](https://github.com/angular/material2/issues/12567)) ([915590e](https://github.com/angular/material2/commit/915590e))
* **checkbox:** prevent error when disabling while focused ([#12327](https://github.com/angular/material2/issues/12327)) ([c4cacce](https://github.com/angular/material2/commit/c4cacce)), closes [#12323](https://github.com/angular/material2/issues/12323)
* **chips:** chip list removing focus from first chip when adding through the input ([#12840](https://github.com/angular/material2/issues/12840)) ([c3b2d4f](https://github.com/angular/material2/commit/c3b2d4f))
* **chips:** dynamic chip input placeholder changes not being propagated to form field ([#12422](https://github.com/angular/material2/issues/12422)) ([e007c27](https://github.com/angular/material2/commit/e007c27)), closes [#11861](https://github.com/angular/material2/issues/11861)
* **chips:** focus indication not visible in high contrast mode ([#12431](https://github.com/angular/material2/issues/12431)) ([bcf4c9f](https://github.com/angular/material2/commit/bcf4c9f))
* **chips:** focus not being restored correctly on chip removal when inside component with animations ([#12416](https://github.com/angular/material2/issues/12416)) ([5fb338b](https://github.com/angular/material2/commit/5fb338b)), closes [#12374](https://github.com/angular/material2/issues/12374)
* **chips:** focus not restored properly if chip has been removed by click ([#12788](https://github.com/angular/material2/issues/12788)) ([3da390e](https://github.com/angular/material2/commit/3da390e)), closes [#12416](https://github.com/angular/material2/issues/12416)
* **chips:** form field not appearing as blurred when used without an input ([#12858](https://github.com/angular/material2/issues/12858)) ([f82a94b](https://github.com/angular/material2/commit/f82a94b))
* **chips:** improved image scaling in avatar ([#12843](https://github.com/angular/material2/issues/12843)) ([f6e787a](https://github.com/angular/material2/commit/f6e787a)), closes [#12660](https://github.com/angular/material2/issues/12660)
* **chips:** incorrectly handling disabled state ([#12659](https://github.com/angular/material2/issues/12659)) ([65ad6ab](https://github.com/angular/material2/commit/65ad6ab)), closes [#11089](https://github.com/angular/material2/issues/11089)
* **chips:** losing focus if active chip is deleted ([#11910](https://github.com/angular/material2/issues/11910)) ([e13bfe0](https://github.com/angular/material2/commit/e13bfe0))
* **chips:** support focusing first/last item using home/end ([#11892](https://github.com/angular/material2/issues/11892)) ([3723191](https://github.com/angular/material2/commit/3723191))
* **collections:** align SelectionModel to `changed` naming ([#8286](https://github.com/angular/material2/issues/8286)) ([27e88c3](https://github.com/angular/material2/commit/27e88c3))
* **datepicker:** able to open from readonly input using keyboard control ([#12880](https://github.com/angular/material2/issues/12880)) ([548d2b7](https://github.com/angular/material2/commit/548d2b7))
* **datepicker:** add minDate and maxDate validation in demo-app ([#12531](https://github.com/angular/material2/issues/12531)) ([2b29c93](https://github.com/angular/material2/commit/2b29c93))
* **datepicker:** input not picking up changes if datepicker is assigned after init ([#12546](https://github.com/angular/material2/issues/12546)) ([3299628](https://github.com/angular/material2/commit/3299628))
* **datepicker:** multiple dialog open if the user holds down enter key ([#12238](https://github.com/angular/material2/issues/12238)) ([8e63656](https://github.com/angular/material2/commit/8e63656))
* **datepicker:** screenreaders report editable grid cells ([#12275](https://github.com/angular/material2/issues/12275)) ([a2dcf21](https://github.com/angular/material2/commit/a2dcf21))
* **datepicker-toggle:** forward tabindex to underlying button ([#12461](https://github.com/angular/material2/issues/12461)) ([648eb4a](https://github.com/angular/material2/commit/648eb4a)), closes [#12456](https://github.com/angular/material2/issues/12456)
* **expansion:** respect parent accordion hideToggle binding ([#12725](https://github.com/angular/material2/issues/12725)) ([9c184ea](https://github.com/angular/material2/commit/9c184ea)), closes [#6529](https://github.com/angular/material2/issues/6529)
* **expansion-panel:** elevation transition not working ([#12860](https://github.com/angular/material2/issues/12860)) ([ac8ed31](https://github.com/angular/material2/commit/ac8ed31))
* **expansion-panel:** focus lost if focused element is inside closing panel ([#12692](https://github.com/angular/material2/issues/12692)) ([baf6419](https://github.com/angular/material2/commit/baf6419))
* **expansion-panel:** implement keyboard controls ([#12427](https://github.com/angular/material2/issues/12427)) ([32e5d72](https://github.com/angular/material2/commit/32e5d72))
* **form-field:** allow for measuring outline gap when label is not in dom ([#12782](https://github.com/angular/material2/issues/12782)) ([21095f5](https://github.com/angular/material2/commit/21095f5))
* **form-field:** legacy ripple underline jumps in edge ([#12648](https://github.com/angular/material2/issues/12648)) ([70d1be8](https://github.com/angular/material2/commit/70d1be8)), closes [#6351](https://github.com/angular/material2/issues/6351)
* **form-field:** outline gap not calculated when appearance is provided through DI ([#12767](https://github.com/angular/material2/issues/12767)) ([8e49388](https://github.com/angular/material2/commit/8e49388)), closes [#12765](https://github.com/angular/material2/issues/12765)
* **form-field:** remove outline gap for empty labels ([#12637](https://github.com/angular/material2/issues/12637)) ([3d4fc82](https://github.com/angular/material2/commit/3d4fc82))
* **form-field:** reset inputs not being reset on safari ([#12413](https://github.com/angular/material2/issues/12413)) ([4884dac](https://github.com/angular/material2/commit/4884dac)), closes [#12408](https://github.com/angular/material2/issues/12408)
* **form-field:** unable to distinguish disabled form field in high contrast mode ([#12445](https://github.com/angular/material2/issues/12445)) ([df2b371](https://github.com/angular/material2/commit/df2b371))
* **form-field:** update label gap for outline style ([#12555](https://github.com/angular/material2/issues/12555)) ([03527c6](https://github.com/angular/material2/commit/03527c6))
* **grid-list:** not picking up indirect descendants ([#12823](https://github.com/angular/material2/issues/12823)) ([c04d2ae](https://github.com/angular/material2/commit/c04d2ae)), closes [#12809](https://github.com/angular/material2/issues/12809)
* **input:** only monitor focus origin on browser platform ([#11604](https://github.com/angular/material2/issues/11604)) ([625f792](https://github.com/angular/material2/commit/625f792))
* **list:** disable hover styling on touch devices ([#12520](https://github.com/angular/material2/issues/12520)) ([795c956](https://github.com/angular/material2/commit/795c956))
* **list:** improved image scaling in avatar ([#12660](https://github.com/angular/material2/issues/12660)) ([9a59c2a](https://github.com/angular/material2/commit/9a59c2a)), closes [#8131](https://github.com/angular/material2/issues/8131)
* **live-announcer:** avoid triggering a reflow when reading directive content ([#12638](https://github.com/angular/material2/issues/12638)) ([040f9db](https://github.com/angular/material2/commit/040f9db))
* **live-announcer:** duplicate live element when coming in from the server ([#12378](https://github.com/angular/material2/issues/12378)) ([a10bfa4](https://github.com/angular/material2/commit/a10bfa4)), closes [#11940](https://github.com/angular/material2/issues/11940)
* **menu:** changed after checked error when toggling quickly between triggers for same submenu ([#12209](https://github.com/angular/material2/issues/12209)) ([b53b66a](https://github.com/angular/material2/commit/b53b66a))
* **menu:** collapse empty menu panel ([#12211](https://github.com/angular/material2/issues/12211)) ([b23cecd](https://github.com/angular/material2/commit/b23cecd))
* **menu:** focus indication not visible in high contrast mode ([#12201](https://github.com/angular/material2/issues/12201)) ([56bce47](https://github.com/angular/material2/commit/56bce47))
* **menu:** menu content data being cleared when lazy-loaded content is reused between nested triggers ([#12476](https://github.com/angular/material2/issues/12476)) ([1e1751f](https://github.com/angular/material2/commit/1e1751f)), closes [#12467](https://github.com/angular/material2/issues/12467)
* **menu:** showing scrollbars on first open in Edge if item width is set ([#12141](https://github.com/angular/material2/issues/12141)) ([275de51](https://github.com/angular/material2/commit/275de51))
* **menu:** throw better error when trying to open undefined menu ([#12688](https://github.com/angular/material2/issues/12688)) ([c90dcfb](https://github.com/angular/material2/commit/c90dcfb)), closes [#12649](https://github.com/angular/material2/issues/12649)
* **moment-date-adapter:** not returning utc date when parsing ([#12029](https://github.com/angular/material2/issues/12029)) ([d431566](https://github.com/angular/material2/commit/d431566))
* **ng-add:** do not incorrectly insert custom-theme into CSS files ([#12711](https://github.com/angular/material2/issues/12711)) ([51da6a6](https://github.com/angular/material2/commit/51da6a6))
* **ng-add:** inserted dependencies should be sorted ([#12847](https://github.com/angular/material2/issues/12847)) ([0760dad](https://github.com/angular/material2/commit/0760dad))
* **ng-add:** material version could not be determined ([#12751](https://github.com/angular/material2/issues/12751)) ([a027ae5](https://github.com/angular/material2/commit/a027ae5))
* **ng-update:** do not throw if imports without named bindings are used ([#12866](https://github.com/angular/material2/issues/12866)) ([cef2e1e](https://github.com/angular/material2/commit/cef2e1e)), closes [#11571](https://github.com/angular/material2/issues/11571)
* **ng-update:** form-field css name incorrectly updated ([#12768](https://github.com/angular/material2/issues/12768)) ([4830be8](https://github.com/angular/material2/commit/4830be8))
* **ng-update:** support parenthesized directive metadata ([#12314](https://github.com/angular/material2/issues/12314)) ([c5b87da](https://github.com/angular/material2/commit/c5b87da))
* **overlay:** avoid same overlay being added to the keyboard event stack multiple times ([#12222](https://github.com/angular/material2/issues/12222)) ([45d6ae4](https://github.com/angular/material2/commit/45d6ae4))
* **overlay:** flexible overlay with push not handling scroll offset and position locking ([#11628](https://github.com/angular/material2/issues/11628)) ([f8b70cd](https://github.com/angular/material2/commit/f8b70cd))
* **overlay:** flexible overlay with push not handling scroll offset and position locking ([#12624](https://github.com/angular/material2/issues/12624)) ([e765d8e](https://github.com/angular/material2/commit/e765d8e)), closes [#11365](https://github.com/angular/material2/issues/11365)
* **paginator:** inconsistently disabling tooltips between browsers ([#12539](https://github.com/angular/material2/issues/12539)) ([73a3d4a](https://github.com/angular/material2/commit/73a3d4a))
* **progress-bar:** avoid error on SSR if pathname is undefined ([#12807](https://github.com/angular/material2/issues/12807)) ([f3af763](https://github.com/angular/material2/commit/f3af763))
* **progress-bar:** generate correct url on server ([#12813](https://github.com/angular/material2/issues/12813)) ([787f31a](https://github.com/angular/material2/commit/787f31a))
* **progress-bar:** incorrectly handling current path when using hash location strategy ([#12713](https://github.com/angular/material2/issues/12713)) ([5727eac](https://github.com/angular/material2/commit/5727eac)), closes [#12710](https://github.com/angular/material2/issues/12710)
* **progress-bar:** query animation not working inside routes with named outlets ([#12350](https://github.com/angular/material2/issues/12350)) ([b9c0d85](https://github.com/angular/material2/commit/b9c0d85)), closes [#12014](https://github.com/angular/material2/issues/12014) [#12338](https://github.com/angular/material2/issues/12338)
* **progress-bar:** query state animation not working ([#11459](https://github.com/angular/material2/issues/11459)) ([b40967f](https://github.com/angular/material2/commit/b40967f)), closes [#11453](https://github.com/angular/material2/issues/11453)
* **ripple:** don't hide directive host in high contrast ([#12168](https://github.com/angular/material2/issues/12168)) ([944caf9](https://github.com/angular/material2/commit/944caf9))
* **ripple:** don't launch ripple for fake mouse events ([#11997](https://github.com/angular/material2/issues/11997)) ([4639a87](https://github.com/angular/material2/commit/4639a87))
* **schematics:** do not allow specifying native view encapsulation ([#12632](https://github.com/angular/material2/issues/12632)) ([0a823dd](https://github.com/angular/material2/commit/0a823dd))
* **schematics:** fix object iteration error in dashboard ([#12216](https://github.com/angular/material2/issues/12216)) ([b589828](https://github.com/angular/material2/commit/b589828))
* **schematics:** generated spec files not working ([#12842](https://github.com/angular/material2/issues/12842)) ([c09da0b](https://github.com/angular/material2/commit/c09da0b)), closes [#12778](https://github.com/angular/material2/issues/12778)
* **schematics:** properly detect tsconfig files ([#12434](https://github.com/angular/material2/issues/12434)) ([08e6653](https://github.com/angular/material2/commit/08e6653))
* **schematics:** properly indent inline files ([#12317](https://github.com/angular/material2/issues/12317)) ([ed4e082](https://github.com/angular/material2/commit/ed4e082))
* **schematics:** tree schematic not working ([#12281](https://github.com/angular/material2/issues/12281)) ([ba134f4](https://github.com/angular/material2/commit/ba134f4))
* **select:** arrow position/animation for appearance="standard" ([#12045](https://github.com/angular/material2/issues/12045)) ([58f3c54](https://github.com/angular/material2/commit/58f3c54))
* **select:** pointing to non-existent element via aria-labelledby ([#12411](https://github.com/angular/material2/issues/12411)) ([3b7f0f1](https://github.com/angular/material2/commit/3b7f0f1)), closes [#12405](https://github.com/angular/material2/issues/12405)
* **select:** skip disabled options when using ctrl + a ([#12553](https://github.com/angular/material2/issues/12553)) ([559b95e](https://github.com/angular/material2/commit/559b95e)), closes [#12543](https://github.com/angular/material2/issues/12543)
* **select,autocomplete:** unable to set custom id on mat-option ([#11573](https://github.com/angular/material2/issues/11573)) ([29d5173](https://github.com/angular/material2/commit/29d5173)), closes [#11572](https://github.com/angular/material2/issues/11572)
* **selection-list:** do not allow toggling disabled options ([#12617](https://github.com/angular/material2/issues/12617)) ([4cfdb20](https://github.com/angular/material2/commit/4cfdb20)), closes [#12608](https://github.com/angular/material2/issues/12608)
* **selection-list:** proper styling not being applied when using mat-list-icon ([#12879](https://github.com/angular/material2/issues/12879)) ([7bc8670](https://github.com/angular/material2/commit/7bc8670))
* **sidenav:** content jumping in rtl and blurry text on IE ([#12726](https://github.com/angular/material2/issues/12726)) ([4050002](https://github.com/angular/material2/commit/4050002)), closes [#10026](https://github.com/angular/material2/issues/10026)
* **sidenav:** scrollable instance not exposed when explicitly specifying content element ([#11706](https://github.com/angular/material2/issues/11706)) ([441c98e](https://github.com/angular/material2/commit/441c98e)), closes [#11517](https://github.com/angular/material2/issues/11517) [#10884](https://github.com/angular/material2/issues/10884)
* **slide-toggle:** blended ripples do not match spec ([#12735](https://github.com/angular/material2/issues/12735)) ([e148414](https://github.com/angular/material2/commit/e148414))
* **slide-toggle:** fix font sizing for slide toggle to match other input methods ([#10688](https://github.com/angular/material2/issues/10688)) ([58c1c95](https://github.com/angular/material2/commit/58c1c95))
* **slide-toggle:** invert the thumb and slide gesture in rtl ([#12284](https://github.com/angular/material2/issues/12284)) ([9a191b3](https://github.com/angular/material2/commit/9a191b3))
* **slide-toggle:** prevent error when disabling while focused ([#12325](https://github.com/angular/material2/issues/12325)) ([e273a7a](https://github.com/angular/material2/commit/e273a7a)), closes [#12323](https://github.com/angular/material2/issues/12323)
* **slide-toggle:** remove webkit tap highlight ([#12708](https://github.com/angular/material2/issues/12708)) ([ba55d04](https://github.com/angular/material2/commit/ba55d04))
* **slide-toggle:** respect primary palette of theme ([#12698](https://github.com/angular/material2/issues/12698)) ([dad0ed0](https://github.com/angular/material2/commit/dad0ed0)), closes [#11854](https://github.com/angular/material2/issues/11854)
* **slider:** thumb label blending in with background in high contrast mode ([#12606](https://github.com/angular/material2/issues/12606)) ([f1b65b6](https://github.com/angular/material2/commit/f1b65b6))
* **snack-bar:** prevent content from overriding configured aria-live message ([#12294](https://github.com/angular/material2/issues/12294)) ([0958cbb](https://github.com/angular/material2/commit/0958cbb))
* **snackbar:** wrap simple snackbar text in span ([#12599](https://github.com/angular/material2/issues/12599)) ([ef0b84b](https://github.com/angular/material2/commit/ef0b84b))
* **stepper:** focus lost if focus is inside stepper while changing step ([#12761](https://github.com/angular/material2/issues/12761)) ([8a7ca7f](https://github.com/angular/material2/commit/8a7ca7f))
* **stepper:** handle removing a step before the current one ([#11813](https://github.com/angular/material2/issues/11813)) ([82b35d0](https://github.com/angular/material2/commit/82b35d0)), closes [#11791](https://github.com/angular/material2/issues/11791)
* **stepper:** improved alignment for step icons ([#12703](https://github.com/angular/material2/issues/12703)) ([37a7056](https://github.com/angular/material2/commit/37a7056)), closes [#12696](https://github.com/angular/material2/issues/12696)
* **tab-group:** focus change event not firing for keyboard navigation ([#12192](https://github.com/angular/material2/issues/12192)) ([1b7b8ab](https://github.com/angular/material2/commit/1b7b8ab))
* **table:** error if row definition is on an ng-container ([#12462](https://github.com/angular/material2/issues/12462)) ([ef57919](https://github.com/angular/material2/commit/ef57919)), closes [#12460](https://github.com/angular/material2/issues/12460)
* **table:** errors when rendering table with sticky elements on the server ([#12095](https://github.com/angular/material2/issues/12095)) ([7e67fe9](https://github.com/angular/material2/commit/7e67fe9)), closes [#12094](https://github.com/angular/material2/issues/12094)
* **table:** extra elements throwing off table alignment ([#12645](https://github.com/angular/material2/issues/12645)) ([3b70d20](https://github.com/angular/material2/commit/3b70d20)), closes [#11165](https://github.com/angular/material2/issues/11165)
* **table:** unable to sort large numbers in strings ([#12052](https://github.com/angular/material2/issues/12052)) ([adda21f](https://github.com/angular/material2/commit/adda21f))
* **tabs:** animation running after initialization ([#12549](https://github.com/angular/material2/issues/12549)) ([4c2f619](https://github.com/angular/material2/commit/4c2f619))
* **tabs:** changed after checked error when using isActive in view ([#12206](https://github.com/angular/material2/issues/12206)) ([499458c](https://github.com/angular/material2/commit/499458c)), closes [#12197](https://github.com/angular/material2/issues/12197)
* **tabs:** content animation in RTL not working (chrome) ([#12215](https://github.com/angular/material2/issues/12215)) ([c6c68a6](https://github.com/angular/material2/commit/c6c68a6))
* **tabs:** disable focus overlay for touch focus ([#12249](https://github.com/angular/material2/issues/12249)) ([1b19b93](https://github.com/angular/material2/commit/1b19b93)), closes [#12247](https://github.com/angular/material2/issues/12247)
* **tabs:** enable keyboard wrapping and mark disabled tabs ([#12218](https://github.com/angular/material2/issues/12218)) ([7f8fd9f](https://github.com/angular/material2/commit/7f8fd9f))
* **tabs:** only target direct descendants with mat-stretch-tabs ([#12198](https://github.com/angular/material2/issues/12198)) ([592af48](https://github.com/angular/material2/commit/592af48)), closes [#12196](https://github.com/angular/material2/issues/12196)
* **tabs:** reposition tab body on direction change ([#12229](https://github.com/angular/material2/issues/12229)) ([49ec9ca](https://github.com/angular/material2/commit/49ec9ca))
* **tabs:** ripple overflow in internet explorer ([#12036](https://github.com/angular/material2/issues/12036)) ([f35a314](https://github.com/angular/material2/commit/f35a314))
* **tabs:** selectedIndex being overwritten if tabs are being added / removed ([#12245](https://github.com/angular/material2/issues/12245)) ([569c221](https://github.com/angular/material2/commit/569c221))
* **tooltip:** interfering with native drag&drop ([#12200](https://github.com/angular/material2/issues/12200)) ([19f64ad](https://github.com/angular/material2/commit/19f64ad))
* **tooltip:** opening after click on android ([#12250](https://github.com/angular/material2/issues/12250)) ([2a49532](https://github.com/angular/material2/commit/2a49532)), closes [#12223](https://github.com/angular/material2/issues/12223)
* **tree:** include constructors on MatTree classes to allow es6 builds ([#12556](https://github.com/angular/material2/issues/12556)) ([5623c5b](https://github.com/angular/material2/commit/5623c5b))
* ensure components work with ES2015 in jit mode. ([#12759](https://github.com/angular/material2/issues/12759)) ([2adced1](https://github.com/angular/material2/commit/2adced1)), closes [/github.com/angular/angular/pull/22356#issuecomment-387756794](https://github.com//github.com/angular/angular/pull/22356/issues/issuecomment-387756794) [#9329](https://github.com/angular/material2/issues/9329)
* explictly declare types for mixin base classes ([#12876](https://github.com/angular/material2/issues/12876)) ([515912b](https://github.com/angular/material2/commit/515912b))


### Features

* **autocomplete:** add updatePosition() method to MatAutocompleteTrigger ([#11495](https://github.com/angular/material2/issues/11495)) ([3ce5b1f](https://github.com/angular/material2/commit/3ce5b1f))
* **autocomplete:** align with 2018 material design ([#12570](https://github.com/angular/material2/issues/12570)) ([b9651df](https://github.com/angular/material2/commit/b9651df))
* **bottom-sheet:** align with 2018 material design spec ([#12625](https://github.com/angular/material2/issues/12625)) ([ceb2051](https://github.com/angular/material2/commit/ceb2051))
* **bottom-sheet:** allow autofocusing to be disabled ([#12193](https://github.com/angular/material2/issues/12193)) ([d6ca3ec](https://github.com/angular/material2/commit/d6ca3ec))
* **breakpoint-observer:** Emit matching state of each query provided ([#12506](https://github.com/angular/material2/issues/12506)) ([5a560b2](https://github.com/angular/material2/commit/5a560b2))
* **cdk-scrollable:** add methods to normalize scrolling in RTL ([#12607](https://github.com/angular/material2/issues/12607)) ([028746a](https://github.com/angular/material2/commit/028746a))
* **chips:** allow set in separatorKeyCodes ([#12477](https://github.com/angular/material2/issues/12477)) ([170665a](https://github.com/angular/material2/commit/170665a))
* **datepicker:** align with 2018 material design spec ([#12693](https://github.com/angular/material2/issues/12693)) ([32456e3](https://github.com/angular/material2/commit/32456e3))
* **dialog:** allow focus restoration to be disabled ([#12519](https://github.com/angular/material2/issues/12519)) ([d5c5f31](https://github.com/angular/material2/commit/d5c5f31))
* **drag-drop:** new feature! Too many commits to list.
* **expansion:** add animation events for expansion panels ([#12412](https://github.com/angular/material2/issues/12412)) ([f6b1002](https://github.com/angular/material2/commit/f6b1002))
* **expansion-panel:** align with 2018 material design spec ([#12670](https://github.com/angular/material2/issues/12670)) ([ccbae0b](https://github.com/angular/material2/commit/ccbae0b))
* **focus-monitor:** support monitoring ElementRef ([#12712](https://github.com/angular/material2/issues/12712)) ([932211e](https://github.com/angular/material2/commit/932211e))
* **form-field:** support native select element ([#12707](https://github.com/angular/material2/issues/12707)) ([4e41985](https://github.com/angular/material2/commit/4e41985))
* **ng-add:** respect project default inlineStyle, inlineTemplate and spec option value ([#12888](https://github.com/angular/material2/issues/12888)) ([8831a7a](https://github.com/angular/material2/commit/8831a7a)), closes [#11874](https://github.com/angular/material2/issues/11874)
* **ng-add:** respect project default style extension ([#12618](https://github.com/angular/material2/issues/12618)) ([5144aa7](https://github.com/angular/material2/commit/5144aa7))
* **ng-add:** set up gestures in CLI projects ([#12734](https://github.com/angular/material2/issues/12734)) ([b919a48](https://github.com/angular/material2/commit/b919a48))
* **overlay:** add the ability to set a panelClass based on the current connected position ([#12631](https://github.com/angular/material2/issues/12631)) ([765990e](https://github.com/angular/material2/commit/765990e))
* **overlay:** support setting panelClass on cdkConnectedOverlay ([#12380](https://github.com/angular/material2/issues/12380)) ([d7c734c](https://github.com/angular/material2/commit/d7c734c))
* **paginator:** allow form field color to be customized ([#12834](https://github.com/angular/material2/issues/12834)) ([e18a99f](https://github.com/angular/material2/commit/e18a99f))
* **portal:** allow for custom ComponentFactoryResolver to be associated with portal ([#12677](https://github.com/angular/material2/issues/12677)) ([136f5dd](https://github.com/angular/material2/commit/136f5dd)), closes [#9712](https://github.com/angular/material2/issues/9712)
* **progress-bar:** add transitionend output for value animation ([#12409](https://github.com/angular/material2/issues/12409)) ([6a1a707](https://github.com/angular/material2/commit/6a1a707))
* **progress-bar:** align with 2018 material design spec ([#12394](https://github.com/angular/material2/issues/12394)) ([b2247f8](https://github.com/angular/material2/commit/b2247f8))
* **radio:** align with 2018 material design spec ([#12299](https://github.com/angular/material2/issues/12299)) ([dda8122](https://github.com/angular/material2/commit/dda8122))
* **ripple:** no longer require additional setup when using MatRipple directive ([#11913](https://github.com/angular/material2/issues/11913)) ([d796776](https://github.com/angular/material2/commit/d796776))
* **ripple:** support multi-touch ([#12643](https://github.com/angular/material2/issues/12643)) ([8fdc2cf](https://github.com/angular/material2/commit/8fdc2cf))
* **schematics:** new tree schematic ([#11739](https://github.com/angular/material2/issues/11739)) ([1540e2f](https://github.com/angular/material2/commit/1540e2f))
* **select:** allow for option sorting logic to be customized ([#11890](https://github.com/angular/material2/issues/11890)) ([d54a75a](https://github.com/angular/material2/commit/d54a75a))
* **sidenav:** align with 2018 material design spec ([#12569](https://github.com/angular/material2/issues/12569)) ([1f88bd7](https://github.com/angular/material2/commit/1f88bd7))
* **slide-toggle:** align with 2018 material design spec ([#12419](https://github.com/angular/material2/issues/12419)) ([5f2e077](https://github.com/angular/material2/commit/5f2e077))
* **snack-bar:** align with 2018 material design spec ([#12634](https://github.com/angular/material2/issues/12634)) ([1e754a0](https://github.com/angular/material2/commit/1e754a0))
* **tooltip:** align with 2018 material design spec ([#12310](https://github.com/angular/material2/issues/12310)) ([4e358c3](https://github.com/angular/material2/commit/4e358c3))
* **virtual-scroll:** new feature! Too many commits to list.


### Performance Improvements

* **overlay:** remove detached overlays from the DOM ([#12414](https://github.com/angular/material2/issues/12414)) ([71886f8](https://github.com/angular/material2/commit/71886f8)), closes [#12341](https://github.com/angular/material2/issues/12341)
* **table:** leaking reference through mostRecentCellOutlet ([#12269](https://github.com/angular/material2/issues/12269)) ([34a7e38](https://github.com/angular/material2/commit/34a7e38)), closes [#12259](https://github.com/angular/material2/issues/12259)
* **tree:** leaking reference through mostRecentTreeNode ([#12334](https://github.com/angular/material2/issues/12334)) ([60b9928](https://github.com/angular/material2/commit/60b9928)), closes [#12269](https://github.com/angular/material2/issues/12269)
* **virtual-scroll:** improve scrolling performance ([#12490](https://github.com/angular/material2/issues/12490)) ([4a9fe87](https://github.com/angular/material2/commit/4a9fe87))


### BREAKING CHANGES

* **sidenav:** the constructor signature of the `MatDrawerContent` and `MatSidenavContent` has changed.



<a name="6.4.7"></a>
## [6.4.7 kryptonite-kombucha](https://github.com/angular/material2/compare/6.4.6...6.4.7) (2018-08-29)


### Bug Fixes

* **autocomplete:** reopening closed autocomplete when coming back to tab ([#12372](https://github.com/angular/material2/issues/12372)) ([8617423](https://github.com/angular/material2/commit/8617423)), closes [#12337](https://github.com/angular/material2/issues/12337)
* **badge:** apply view encapsulation attributes on badge element ([#12870](https://github.com/angular/material2/issues/12870)) ([dc8cf46](https://github.com/angular/material2/commit/dc8cf46))
* **button-toggle:** clickable area not stretching when custom width is set ([#12642](https://github.com/angular/material2/issues/12642)) ([70aca02](https://github.com/angular/material2/commit/70aca02)), closes [#8432](https://github.com/angular/material2/issues/8432)
* **button-toggle:** set aria-disabled based on group disabled state ([#12828](https://github.com/angular/material2/issues/12828)) ([3f67cc5](https://github.com/angular/material2/commit/3f67cc5))
* **card:** images in title-group overlapping content ([#12205](https://github.com/angular/material2/issues/12205)) ([22ae587](https://github.com/angular/material2/commit/22ae587)), closes [#10031](https://github.com/angular/material2/issues/10031)
* **chips:** chip list removing focus from first chip when adding through the input ([#12840](https://github.com/angular/material2/issues/12840)) ([0e60fb8](https://github.com/angular/material2/commit/0e60fb8))
* **chips:** focus not being restored correctly on chip removal when inside component with animations ([#12416](https://github.com/angular/material2/issues/12416)) ([d08d8bc](https://github.com/angular/material2/commit/d08d8bc)), closes [#12374](https://github.com/angular/material2/issues/12374)
* **chips:** focus not restored properly if chip has been removed by click ([#12788](https://github.com/angular/material2/issues/12788)) ([59a7f28](https://github.com/angular/material2/commit/59a7f28)), closes [#12416](https://github.com/angular/material2/issues/12416)
* **chips:** form field not appearing as blurred when used without an input ([#12858](https://github.com/angular/material2/issues/12858)) ([be1ba9c](https://github.com/angular/material2/commit/be1ba9c))
* **chips:** improved image scaling in avatar ([#12843](https://github.com/angular/material2/issues/12843)) ([130806b](https://github.com/angular/material2/commit/130806b)), closes [#12660](https://github.com/angular/material2/issues/12660)
* **chips:** incorrectly handling disabled state ([#12659](https://github.com/angular/material2/issues/12659)) ([15e7f74](https://github.com/angular/material2/commit/15e7f74)), closes [#11089](https://github.com/angular/material2/issues/11089)
* **chips:** support focusing first/last item using home/end ([#11892](https://github.com/angular/material2/issues/11892)) ([b735e48](https://github.com/angular/material2/commit/b735e48))
* **collections:** align SelectionModel to `changed` naming ([#8286](https://github.com/angular/material2/issues/8286)) ([4b30539](https://github.com/angular/material2/commit/4b30539))
* **datepicker:** multiple dialog open if the user holds down enter key ([#12238](https://github.com/angular/material2/issues/12238)) ([c807d74](https://github.com/angular/material2/commit/c807d74))
* **datepicker:** screenreaders report editable grid cells ([#12275](https://github.com/angular/material2/issues/12275)) ([3328808](https://github.com/angular/material2/commit/3328808))
* **datepicker-toggle:** forward tabindex to underlying button ([#12461](https://github.com/angular/material2/issues/12461)) ([09302b6](https://github.com/angular/material2/commit/09302b6)), closes [#12456](https://github.com/angular/material2/issues/12456)
* **expansion:** respect parent accordion hideToggle binding ([#12725](https://github.com/angular/material2/issues/12725)) ([803f73f](https://github.com/angular/material2/commit/803f73f)), closes [#6529](https://github.com/angular/material2/issues/6529)
* **expansion-panel:** focus lost if focused element is inside closing panel ([#12692](https://github.com/angular/material2/issues/12692)) ([3596e9d](https://github.com/angular/material2/commit/3596e9d))
* **expansion-panel:** implement keyboard controls ([#12427](https://github.com/angular/material2/issues/12427)) ([04d5955](https://github.com/angular/material2/commit/04d5955))
* **form-field:** allow for measuring outline gap when label is not in dom ([#12782](https://github.com/angular/material2/issues/12782)) ([9579212](https://github.com/angular/material2/commit/9579212))
* **form-field:** legacy ripple underline jumps in edge ([#12648](https://github.com/angular/material2/issues/12648)) ([34d91c7](https://github.com/angular/material2/commit/34d91c7)), closes [#6351](https://github.com/angular/material2/issues/6351)
* **form-field:** outline gap not calculated when appearance is provided through DI ([#12767](https://github.com/angular/material2/issues/12767)) ([8b9d283](https://github.com/angular/material2/commit/8b9d283)), closes [#12765](https://github.com/angular/material2/issues/12765)
* **form-field:** remove outline gap for empty labels ([#12637](https://github.com/angular/material2/issues/12637)) ([a326ee0](https://github.com/angular/material2/commit/a326ee0))
* **grid-list:** not picking up indirect descendants ([#12823](https://github.com/angular/material2/issues/12823)) ([4f53e4f](https://github.com/angular/material2/commit/4f53e4f)), closes [#12809](https://github.com/angular/material2/issues/12809)
* **input:** only monitor focus origin on browser platform ([#11604](https://github.com/angular/material2/issues/11604)) ([a30e909](https://github.com/angular/material2/commit/a30e909))
* **list:** improved image scaling in avatar ([#12660](https://github.com/angular/material2/issues/12660)) ([70cb0a2](https://github.com/angular/material2/commit/70cb0a2)), closes [#8131](https://github.com/angular/material2/issues/8131)
* **live-announcer:** avoid triggering a reflow when reading directive content ([#12638](https://github.com/angular/material2/issues/12638)) ([92f53ce](https://github.com/angular/material2/commit/92f53ce))
* **menu:** throw better error when trying to open undefined menu ([#12688](https://github.com/angular/material2/issues/12688)) ([f732059](https://github.com/angular/material2/commit/f732059)), closes [#12649](https://github.com/angular/material2/issues/12649)
* **progress-bar:** avoid error on SSR if pathname is undefined ([#12807](https://github.com/angular/material2/issues/12807)) ([bb9cfec](https://github.com/angular/material2/commit/bb9cfec))
* **progress-bar:** generate correct url on server ([#12813](https://github.com/angular/material2/issues/12813)) ([b0555b5](https://github.com/angular/material2/commit/b0555b5))
* **progress-bar:** incorrectly handling current path when using hash location strategy ([#12713](https://github.com/angular/material2/issues/12713)) ([da3b5e0](https://github.com/angular/material2/commit/da3b5e0)), closes [#12710](https://github.com/angular/material2/issues/12710)
* **ripple:** don't launch ripple for fake mouse events ([#11997](https://github.com/angular/material2/issues/11997)) ([266a159](https://github.com/angular/material2/commit/266a159))
* **select:** pointing to non-existent element via aria-labelledby ([#12411](https://github.com/angular/material2/issues/12411)) ([12c6f81](https://github.com/angular/material2/commit/12c6f81)), closes [#12405](https://github.com/angular/material2/issues/12405)
* **select:** skip disabled options when using ctrl + a ([#12553](https://github.com/angular/material2/issues/12553)) ([2349166](https://github.com/angular/material2/commit/2349166)), closes [#12543](https://github.com/angular/material2/issues/12543)
* **select,autocomplete:** unable to set custom id on mat-option ([#11573](https://github.com/angular/material2/issues/11573)) ([1f78d8a](https://github.com/angular/material2/commit/1f78d8a)), closes [#11572](https://github.com/angular/material2/issues/11572)
* **sidenav:** content jumping in rtl and blurry text on IE ([#12726](https://github.com/angular/material2/issues/12726)) ([81e0542](https://github.com/angular/material2/commit/81e0542)), closes [#10026](https://github.com/angular/material2/issues/10026)
* **slide-toggle:** remove webkit tap highlight ([#12708](https://github.com/angular/material2/issues/12708)) ([3ce4e8d](https://github.com/angular/material2/commit/3ce4e8d))
* **slider:** thumb label blending in with background in high contrast mode ([#12606](https://github.com/angular/material2/issues/12606)) ([a4a79ea](https://github.com/angular/material2/commit/a4a79ea))
* **stepper:** focus lost if focus is inside stepper while changing step ([#12761](https://github.com/angular/material2/issues/12761)) ([fc537af](https://github.com/angular/material2/commit/fc537af))
* **stepper:** handle removing a step before the current one ([#11813](https://github.com/angular/material2/issues/11813)) ([0fcdae4](https://github.com/angular/material2/commit/0fcdae4)), closes [#11791](https://github.com/angular/material2/issues/11791)
* **stepper:** improved alignment for step icons ([#12703](https://github.com/angular/material2/issues/12703)) ([41d0196](https://github.com/angular/material2/commit/41d0196)), closes [#12696](https://github.com/angular/material2/issues/12696)
* **table:** errors when rendering table with sticky elements on the server ([#12095](https://github.com/angular/material2/issues/12095)) ([8956d1d](https://github.com/angular/material2/commit/8956d1d)), closes [#12094](https://github.com/angular/material2/issues/12094)
* **table:** extra elements throwing off table alignment ([#12645](https://github.com/angular/material2/issues/12645)) ([13f1c6e](https://github.com/angular/material2/commit/13f1c6e)), closes [#11165](https://github.com/angular/material2/issues/11165)
* **tabs:** disable focus overlay for touch focus ([#12249](https://github.com/angular/material2/issues/12249)) ([d3af441](https://github.com/angular/material2/commit/d3af441)), closes [#12247](https://github.com/angular/material2/issues/12247)
* **tabs:** only target direct descendants with mat-stretch-tabs ([#12198](https://github.com/angular/material2/issues/12198)) ([6bb0ffe](https://github.com/angular/material2/commit/6bb0ffe)), closes [#12196](https://github.com/angular/material2/issues/12196)
* **tooltip:** opening after click on android ([#12250](https://github.com/angular/material2/issues/12250)) ([a6b8a06](https://github.com/angular/material2/commit/a6b8a06)), closes [#12223](https://github.com/angular/material2/issues/12223)
* ensure all components work with ES2015 in jit mode. ([#12759](https://github.com/angular/material2/issues/12759)) ([0c4a1b4](https://github.com/angular/material2/commit/0c4a1b4)), closes [#12760](https://github.com/angular/material2/issues/12760), [#9329](https://github.com/angular/material2/issues/9329)

<a name="6.4.6"></a>
## [6.4.6 argon-aftershave](https://github.com/angular/material2/compare/6.4.5...6.4.6) (2018-08-20)


### Bug Fixes

* **cdk-text-field:** prevent keyframes from getting stripped by LibSass ([#12567](https://github.com/angular/material2/issues/12567)) ([4180e72](https://github.com/angular/material2/commit/4180e72))
* **form-field:** update label gap for outline style ([#12555](https://github.com/angular/material2/issues/12555)) ([ffeb779](https://github.com/angular/material2/commit/ffeb779))
* **progress-bar:** query state animation not working ([#11459](https://github.com/angular/material2/issues/11459)) ([948f655](https://github.com/angular/material2/commit/948f655)), closes [#11453](https://github.com/angular/material2/issues/11453)
* **selection-list:** do not allow toggling disabled options ([#12617](https://github.com/angular/material2/issues/12617)) ([3c1995d](https://github.com/angular/material2/commit/3c1995d)), closes [#12608](https://github.com/angular/material2/issues/12608)
* **tabs:** changed after checked error when using isActive in view ([#12206](https://github.com/angular/material2/issues/12206)) ([75632bd](https://github.com/angular/material2/commit/75632bd)), closes [#12197](https://github.com/angular/material2/issues/12197)


<a name="6.4.5"></a>
## [6.4.5 mithril-magnet](https://github.com/angular/material2/compare/6.4.3...6.4.4) (2018-08-13)


### Bug Fixes

* **button:** allow transition for the button focus overlay for all buttons ([#12552](https://github.com/angular/material2/issues/12552)) ([0a56cf7](https://github.com/angular/material2/commit/0a56cf7))
* **button-toggle:** forward tabindex to underlying button ([#12538](https://github.com/angular/material2/issues/12538)) ([dcae875](https://github.com/angular/material2/commit/dcae875))
* **breakpoint-observer:** Emit matching state of each query provided ([#12506](https://github.com/angular/material2/issues/12506)) ([cb3f760](https://github.com/angular/material2/commit/cb3f760))
* **datepicker:** input not picking up changes if datepicker is assigned after init ([#12546](https://github.com/angular/material2/issues/12546)) ([d10a6c4](https://github.com/angular/material2/commit/d10a6c4))
* **drag-drop:** add support for sorting animations ([#12530](https://github.com/angular/material2/issues/12530)) ([7d0e69b](https://github.com/angular/material2/commit/7d0e69b))
* **drag-drop:** ignore self inside connectedTo ([#12626](https://github.com/angular/material2/issues/12626)) ([7e7e873](https://github.com/angular/material2/commit/7e7e873))
* **drag-drop:** remove circular dependencies ([#12554](https://github.com/angular/material2/issues/12554)) ([fd70c07](https://github.com/angular/material2/commit/fd70c07))
* **list:** disable hover styling on touch devices ([#12520](https://github.com/angular/material2/issues/12520)) ([6048f6f](https://github.com/angular/material2/commit/6048f6f))
* **overlay:** flexible overlay with push not handling scroll offset and position locking ([#11628](https://github.com/angular/material2/issues/11628)) ([a192907](https://github.com/angular/material2/commit/a192907))
* **paginator:** inconsistently disabling tooltips between browsers ([#12539](https://github.com/angular/material2/issues/12539)) ([35bdd00](https://github.com/angular/material2/commit/35bdd00))
* **snackbar:** wrap simple snackbar text in span ([#12599](https://github.com/angular/material2/issues/12599)) ([11b97e4](https://github.com/angular/material2/commit/11b97e4))
* **tabs:** animation running after initialization ([#12549](https://github.com/angular/material2/issues/12549)) ([2798084](https://github.com/angular/material2/commit/2798084))
* **tree:** include constructors on MatTree classes to allow es6 builds ([#12556](https://github.com/angular/material2/issues/12556)) ([5b0eed3](https://github.com/angular/material2/commit/5b0eed3))


<a name="6.4.3"></a>
## [6.4.3 monelite-meeple](https://github.com/angular/material2/compare/6.4.2...6.4.3) (2018-08-07)


### Bug Fixes

* **bidi:** default invalid directionality values to ltr ([#12396](https://github.com/angular/material2/issues/12396)) ([58361f1](https://github.com/angular/material2/commit/58361f1))
* **checkbox:** prevent error when disabling while focused ([#12327](https://github.com/angular/material2/issues/12327)) ([0c746c1](https://github.com/angular/material2/commit/0c746c1)), closes [#12323](https://github.com/angular/material2/issues/12323)
* **chips:** dynamic chip input placeholder changes not being propagated to form field ([#12422](https://github.com/angular/material2/issues/12422)) ([5053532](https://github.com/angular/material2/commit/5053532)), closes [#11861](https://github.com/angular/material2/issues/11861)
* **chips:** focus indication not visible in high contrast mode ([#12431](https://github.com/angular/material2/issues/12431)) ([3652707](https://github.com/angular/material2/commit/3652707))
* **drag-drop:** account for transition-delay when waiting for the animation to finish ([#12466](https://github.com/angular/material2/issues/12466)) ([3580fb5](https://github.com/angular/material2/commit/3580fb5))
* **form-field:** reset inputs not being reset on safari ([#12413](https://github.com/angular/material2/issues/12413)) ([952b553](https://github.com/angular/material2/commit/952b553)), closes [#12408](https://github.com/angular/material2/issues/12408)
* **form-field:** unable to distinguish disabled form field in high contrast mode ([#12445](https://github.com/angular/material2/issues/12445)) ([212bd0b](https://github.com/angular/material2/commit/212bd0b))
* **live-announcer:** duplicate live element when coming in from the server ([#12378](https://github.com/angular/material2/issues/12378)) ([bf9bc0d](https://github.com/angular/material2/commit/bf9bc0d)), closes [#11940](https://github.com/angular/material2/issues/11940)
* **menu:** menu content data being cleared when lazy-loaded content is reused between nested triggers ([#12476](https://github.com/angular/material2/issues/12476)) ([747231a](https://github.com/angular/material2/commit/747231a)), closes [#12467](https://github.com/angular/material2/issues/12467)
* **slide-toggle:** prevent error when disabling while focused ([#12325](https://github.com/angular/material2/issues/12325)) ([80f6929](https://github.com/angular/material2/commit/80f6929)), closes [#12323](https://github.com/angular/material2/issues/12323)
* **table:** error if row definition is on an ng-container ([#12462](https://github.com/angular/material2/issues/12462)) ([39d40f3](https://github.com/angular/material2/commit/39d40f3)), closes [#12460](https://github.com/angular/material2/issues/12460)


### Performance Improvements

* **overlay:** remove detached overlays from the DOM ([#12414](https://github.com/angular/material2/issues/12414)) ([40d8ae4](https://github.com/angular/material2/commit/40d8ae4)), closes [#12341](https://github.com/angular/material2/issues/12341)



<a name="6.4.2"></a>
## [6.4.2 chalk-window](https://github.com/angular/material2/compare/6.4.1...6.4.2) (2018-07-30)


### Bug Fixes

* **autocomplete:** remove aria-owns attribute while closed ([#12333](https://github.com/angular/material2/issues/12333)) ([2122b18](https://github.com/angular/material2/commit/2122b18)), closes [#12332](https://github.com/angular/material2/issues/12332)
* **card:** incorrectly inverting inset divider in rtl ([#12285](https://github.com/angular/material2/issues/12285)) ([8a2dc60](https://github.com/angular/material2/commit/8a2dc60))
* **progress-bar:** query animation not working inside routes with named outlets ([#12350](https://github.com/angular/material2/issues/12350)) ([0c526d3](https://github.com/angular/material2/commit/0c526d3)), closes [#12014](https://github.com/angular/material2/issues/12014) [#12338](https://github.com/angular/material2/issues/12338)
* **snack-bar:** prevent content from overriding configured aria-live message ([#12294](https://github.com/angular/material2/issues/12294)) ([b46689e](https://github.com/angular/material2/commit/b46689e))
* **ng-update:** support parenthesized directive metadata ([#12314](https://github.com/angular/material2/issues/12314)) ([66416f5](https://github.com/angular/material2/commit/66416f5))


### Performance Improvements

* **table:** leaking reference through mostRecentCellOutlet ([#12269](https://github.com/angular/material2/issues/12269)) ([7c8e892](https://github.com/angular/material2/commit/7c8e892)), closes [#12259](https://github.com/angular/material2/issues/12259)
* **tree:** leaking reference through mostRecentTreeNode ([#12334](https://github.com/angular/material2/issues/12334)) ([b6f7205](https://github.com/angular/material2/commit/b6f7205)), closes [#12269](https://github.com/angular/material2/issues/12269)



<a name="6.4.1"></a>
## [6.4.1 elm-electrode](https://github.com/angular/material2/compare/6.4.0...6.4.1) (2018-07-23)


### Bug Fixes

* **autofill:** avoid firing unnecessary event on initial render of input ([#12116](https://github.com/angular/material2/issues/12116)) ([1fb1fab](https://github.com/angular/material2/commit/1fb1fab))
* **badge:** hide badges with no content ([#12239](https://github.com/angular/material2/issues/12239)) ([1e847f1](https://github.com/angular/material2/commit/1e847f1))
* **chips:** losing focus if active chip is deleted ([#11910](https://github.com/angular/material2/issues/11910)) ([646e378](https://github.com/angular/material2/commit/646e378))
* **drag-drop:** disable text selection on draggable element ([#12204](https://github.com/angular/material2/issues/12204)) ([7a04609](https://github.com/angular/material2/commit/7a04609))
* **drag-drop:** make `CDK_DROP_CONTAINER` public ([#12214](https://github.com/angular/material2/issues/12214)) ([b9cece4](https://github.com/angular/material2/commit/b9cece4))
* **drag-drop:** unable to drag last item back into initial container ([#12261](https://github.com/angular/material2/issues/12261)) ([3e0e3c5](https://github.com/angular/material2/commit/3e0e3c5))
* **menu:** collapse empty menu panel ([#12211](https://github.com/angular/material2/issues/12211)) ([aed3993](https://github.com/angular/material2/commit/aed3993))
* **menu:** focus indication not visible in high contrast mode ([#12201](https://github.com/angular/material2/issues/12201)) ([6fb6216](https://github.com/angular/material2/commit/6fb6216))
* **menu:** showing scrollbars on first open in Edge if item width is set ([#12141](https://github.com/angular/material2/issues/12141)) ([ff53295](https://github.com/angular/material2/commit/ff53295))
* **moment-date-adapter:** not returning utc date when parsing ([#12029](https://github.com/angular/material2/issues/12029)) ([0304ac1](https://github.com/angular/material2/commit/0304ac1))
* **overlay:** avoid same overlay being added to the keyboard event stack multiple times ([#12222](https://github.com/angular/material2/issues/12222)) ([e587f4b](https://github.com/angular/material2/commit/e587f4b))
* **ripple:** don't hide directive host in high contrast ([#12168](https://github.com/angular/material2/issues/12168)) ([efedc9b](https://github.com/angular/material2/commit/efedc9b))
* **schematics:** fix object iteration error in dashboard ([#12216](https://github.com/angular/material2/issues/12216)) ([f2acb51](https://github.com/angular/material2/commit/f2acb51))
* **slide-toggle:** invert the thumb and slide gesture in rtl ([#12284](https://github.com/angular/material2/issues/12284)) ([fe193f5](https://github.com/angular/material2/commit/fe193f5))
* **tab-group:** focus change event not firing for keyboard navigation ([#12192](https://github.com/angular/material2/issues/12192)) ([48ece27](https://github.com/angular/material2/commit/48ece27))
* **table:** unable to sort large numbers in strings ([#12052](https://github.com/angular/material2/issues/12052)) ([dd31521](https://github.com/angular/material2/commit/dd31521))
* **tabs:** content animation in RTL not working (chrome) ([#12215](https://github.com/angular/material2/issues/12215)) ([f700897](https://github.com/angular/material2/commit/f700897))
* **tabs:** enable keyboard wrapping and mark disabled tabs ([#12218](https://github.com/angular/material2/issues/12218)) ([0e03aae](https://github.com/angular/material2/commit/0e03aae))
* **tabs:** reposition tab body on direction change ([#12229](https://github.com/angular/material2/issues/12229)) ([4ac1be3](https://github.com/angular/material2/commit/4ac1be3))
* **tabs:** ripple overflow in internet explorer ([#12036](https://github.com/angular/material2/issues/12036)) ([09f439a](https://github.com/angular/material2/commit/09f439a))
* **tabs:** selectedIndex being overwritten if tabs are being added / removed ([#12245](https://github.com/angular/material2/issues/12245)) ([641ec85](https://github.com/angular/material2/commit/641ec85))
* **tooltip:** interfering with native drag&drop ([#12200](https://github.com/angular/material2/issues/12200)) ([8a4f2c3](https://github.com/angular/material2/commit/8a4f2c3))



<a name="6.4.0"></a>
# [6.4.0 dimeritium-dandelion](https://github.com/angular/material2/compare/6.3.1...6.4.0) (2018-07-16)


### Bug Fixes

* **a11y:** allow ListKeyManager wrapping to be disabled ([#11920](https://github.com/angular/material2/issues/11920)) ([e9e44f6](https://github.com/angular/material2/commit/e9e44f6))
* **a11y:** clear duplicate AriaDescriber container coming in from the server ([#11900](https://github.com/angular/material2/issues/11900)) ([b041f3f](https://github.com/angular/material2/commit/b041f3f))
* **autocomplete:** don't override native autocomplete attribute ([#11926](https://github.com/angular/material2/issues/11926)) ([88efb7e](https://github.com/angular/material2/commit/88efb7e))
* **autocomplete:** error when typing in input with disabled autocomplete and no panel ([#11881](https://github.com/angular/material2/issues/11881)) ([6b1a672](https://github.com/angular/material2/commit/6b1a672)), closes [#11876](https://github.com/angular/material2/issues/11876)
* **autocomplete:** reposition the panel when the amount of options changes ([#4469](https://github.com/angular/material2/issues/4469)) ([2b80dbf](https://github.com/angular/material2/commit/2b80dbf))
* **bottom-sheet:** close on page navigation ([#12106](https://github.com/angular/material2/issues/12106)) ([5c6f25e](https://github.com/angular/material2/commit/5c6f25e))
* **button:** don't show hover overlay on devices that don't support hovering ([#12030](https://github.com/angular/material2/issues/12030)) ([947c29a](https://github.com/angular/material2/commit/947c29a)), closes [#12022](https://github.com/angular/material2/issues/12022)
* **button:** not resetting all outlines on firefox ([#11911](https://github.com/angular/material2/issues/11911)) ([85711aa](https://github.com/angular/material2/commit/85711aa))
* **button:** unable to set a custom tabindex on a link button ([#12042](https://github.com/angular/material2/issues/12042)) ([cb6c621](https://github.com/angular/material2/commit/cb6c621)), closes [#12041](https://github.com/angular/material2/issues/12041)
* **button-toggle:** allow event bubbling for toggle button clicks ([#11951](https://github.com/angular/material2/issues/11951)) ([5e16682](https://github.com/angular/material2/commit/5e16682))
* **button-toggle:** parent margin and padding being propagated to underlying button ([#11993](https://github.com/angular/material2/issues/11993)) ([3bf10f9](https://github.com/angular/material2/commit/3bf10f9)), closes [#11976](https://github.com/angular/material2/issues/11976)
* **card:** don't override vertical divider styles ([#11899](https://github.com/angular/material2/issues/11899)) ([2d11588](https://github.com/angular/material2/commit/2d11588))
* **checkbox:** fix checkbox animation when moved between view containers ([#10589](https://github.com/angular/material2/issues/10589)) ([fbccfd4](https://github.com/angular/material2/commit/fbccfd4))
* **chips:** ripples still showing up when globally disabled ([#11918](https://github.com/angular/material2/issues/11918)) ([69a7f7c](https://github.com/angular/material2/commit/69a7f7c))
* **datepicker:** all cells being read out as selected ([#12006](https://github.com/angular/material2/issues/12006)) ([32da038](https://github.com/angular/material2/commit/32da038))
* **datepicker:** calendar input changes not being propagated on child views ([#12004](https://github.com/angular/material2/issues/12004)) ([b1d4fe1](https://github.com/angular/material2/commit/b1d4fe1)), closes [#11737](https://github.com/angular/material2/issues/11737)
* **datepicker:** set role on datepicker popup and aria-haspopup on the datepicker toggle ([#12008](https://github.com/angular/material2/issues/12008)) ([57b066a](https://github.com/angular/material2/commit/57b066a))
* **datepicker:** showing dot in high contrast mode after popup has closed ([#12099](https://github.com/angular/material2/issues/12099)) ([6a472eb](https://github.com/angular/material2/commit/6a472eb))
* **expansion-panel:** disable hover highlight on non-hover devices ([#12080](https://github.com/angular/material2/issues/12080)) ([25eb43f](https://github.com/angular/material2/commit/25eb43f)), closes [#12030](https://github.com/angular/material2/issues/12030)
* **focus-monitor:** allow native focus options to be passed through focusVia ([#11962](https://github.com/angular/material2/issues/11962)) ([4a02bb1](https://github.com/angular/material2/commit/4a02bb1))
* **focus-origin:** focus origin sometimes invalid in firefox 57 ([#8669](https://github.com/angular/material2/issues/8669)) ([a1aa9e7](https://github.com/angular/material2/commit/a1aa9e7)), closes [#6984](https://github.com/angular/material2/issues/6984)
* **focus-trap:** not attaching correctly if element is not in the DOM on init ([#7665](https://github.com/angular/material2/issues/7665)) ([d64f94d](https://github.com/angular/material2/commit/d64f94d))
* **form-field:** clear safari autofill icons ([#12137](https://github.com/angular/material2/issues/12137)) ([04934b4](https://github.com/angular/material2/commit/04934b4))
* **form-field:** label gap not being calculated when switching to outline dynamically ([#11658](https://github.com/angular/material2/issues/11658)) ([d75fa75](https://github.com/angular/material2/commit/d75fa75)), closes [#11653](https://github.com/angular/material2/issues/11653)
* **form-field:** placeholder not hiding if `-webkit-text-fill-color` is used ([#12076](https://github.com/angular/material2/issues/12076)) ([cc5dfb8](https://github.com/angular/material2/commit/cc5dfb8)), closes [#12074](https://github.com/angular/material2/issues/12074)
* **icon:** clearing all content when inserting a new SVG ([#11956](https://github.com/angular/material2/issues/11956)) ([8280a76](https://github.com/angular/material2/commit/8280a76))
* **icon:** reverse for loop when removing child nodes from mat-icon ([#12078](https://github.com/angular/material2/issues/12078)) ([dd6aec6](https://github.com/angular/material2/commit/dd6aec6))
* **menu:** scrollable menu not scrolled to top when opened for the first time ([#11859](https://github.com/angular/material2/issues/11859)) ([742c226](https://github.com/angular/material2/commit/742c226))
* **overlay:** justifyContent center ignored when direction is RTL ([#11877](https://github.com/angular/material2/issues/11877)) ([415c956](https://github.com/angular/material2/commit/415c956))
* **overlay:** account for virtual keyboard offset on mobile devices ([#12119](https://github.com/angular/material2/issues/12119)) ([a248c18](https://github.com/angular/material2/commit/a248c18)), closes [#6341](https://github.com/angular/material2/issues/6341)
* **overlay:** clear timeout if the backdrop transition completes early ([#11938](https://github.com/angular/material2/issues/11938)) ([1a31c4e](https://github.com/angular/material2/commit/1a31c4e))
* **overlay:** don't dispatch key events to overlays that don't handle them ([#11810](https://github.com/angular/material2/issues/11810)) ([c3fdc32](https://github.com/angular/material2/commit/c3fdc32))
* **overlay:** remove panelClass when the overlay is detached ([#12142](https://github.com/angular/material2/issues/12142)) ([79bacf2](https://github.com/angular/material2/commit/79bacf2)), closes [#12099](https://github.com/angular/material2/issues/12099)
* **progress-bar:** query animation not working on safari ([#12014](https://github.com/angular/material2/issues/12014)) ([49119ed](https://github.com/angular/material2/commit/49119ed))
* **progress-spinner:** circle not rendering correctly when switching modes in Safari ([#12151](https://github.com/angular/material2/issues/12151)) ([623cd3d](https://github.com/angular/material2/commit/623cd3d)), closes [#12140](https://github.com/angular/material2/issues/12140)
* **radio:** circle not being greyed out when disabled ([#12127](https://github.com/angular/material2/issues/12127)) ([85b8f32](https://github.com/angular/material2/commit/85b8f32)), closes [#12125](https://github.com/angular/material2/issues/12125)
* **ripple:** remove webkit touch highlights from ripple containers ([#12082](https://github.com/angular/material2/issues/12082)) ([8e2ff1f](https://github.com/angular/material2/commit/8e2ff1f))
* **schematic:** parse5 v5.0.0 requires different parse options ([#12028](https://github.com/angular/material2/issues/12028)) ([118344e](https://github.com/angular/material2/commit/118344e)), closes [#12027](https://github.com/angular/material2/issues/12027)
* **schematics:** add parse5 dep ([#11647](https://github.com/angular/material2/issues/11647)) ([2330c8b](https://github.com/angular/material2/commit/2330c8b))
* **select:** blank option label throwing off alignment ([#11994](https://github.com/angular/material2/issues/11994)) ([45b949a](https://github.com/angular/material2/commit/45b949a)), closes [#11969](https://github.com/angular/material2/issues/11969)
* **select:** not resuming keyboard selection after clicking on single-select option ([#11882](https://github.com/angular/material2/issues/11882)) ([195665f](https://github.com/angular/material2/commit/195665f))
* **select:** reset option being marked as selected ([#11934](https://github.com/angular/material2/issues/11934)) ([d88e021](https://github.com/angular/material2/commit/d88e021))
* **select:** support ctrl+a shortcut for multi-select ([#11799](https://github.com/angular/material2/issues/11799)) ([d5de711](https://github.com/angular/material2/commit/d5de711))
* **selection-list:** disabling list doesn't disable ripples of options ([#11955](https://github.com/angular/material2/issues/11955)) ([d3212a6](https://github.com/angular/material2/commit/d3212a6))
* **selection-list:** form control disable locks disabled property ([#12113](https://github.com/angular/material2/issues/12113)) ([fcc8875](https://github.com/angular/material2/commit/fcc8875)), closes [#12107](https://github.com/angular/material2/issues/12107)
* **sidenav:** continuously hitting zone when using autosize option ([#12067](https://github.com/angular/material2/issues/12067)) ([330176d](https://github.com/angular/material2/commit/330176d)), closes [#11231](https://github.com/angular/material2/issues/11231) [#11986](https://github.com/angular/material2/issues/11986) [#11215](https://github.com/angular/material2/issues/11215)
* **sidenav:** remove margin from content instead of setting zero ([#11986](https://github.com/angular/material2/issues/11986)) ([444fb38](https://github.com/angular/material2/commit/444fb38))
* **slide-toggle:** no color demarcation in high contrast black mode ([#12150](https://github.com/angular/material2/issues/12150)) ([b5fd6de](https://github.com/angular/material2/commit/b5fd6de))
* **slide-toggle:** not updating model from toggle method ([#11846](https://github.com/angular/material2/issues/11846)) ([fc15fa2](https://github.com/angular/material2/commit/fc15fa2))
* **slider:** track not being rendered under some conditions when using a thumb label ([#12079](https://github.com/angular/material2/issues/12079)) ([d4623ff](https://github.com/angular/material2/commit/d4623ff)), closes [#12071](https://github.com/angular/material2/issues/12071)
* **sort:** arrow indicator not visible in high contrast mode ([#12159](https://github.com/angular/material2/issues/12159)) ([eb6c456](https://github.com/angular/material2/commit/eb6c456))
* **sort:** arrow visible while parent row is being animated ([#11827](https://github.com/angular/material2/issues/11827)) ([c59abc6](https://github.com/angular/material2/commit/c59abc6))
* **stepper:** unable to set aria-label on step ([#11989](https://github.com/angular/material2/issues/11989)) ([ae39535](https://github.com/angular/material2/commit/ae39535)), closes [#11898](https://github.com/angular/material2/issues/11898)
* **tab-nav-bar:** ripples still showing up when globally disabled ([#11865](https://github.com/angular/material2/issues/11865)) ([fc1d1a4](https://github.com/angular/material2/commit/fc1d1a4))
* **tabs:** don't fire change event when amount of tabs changes ([#12097](https://github.com/angular/material2/issues/12097)) ([0186a03](https://github.com/angular/material2/commit/0186a03)), closes [#12084](https://github.com/angular/material2/issues/12084)
* **tabs:** don't show focus indication for mouse focus ([#11194](https://github.com/angular/material2/issues/11194)) ([89cad3f](https://github.com/angular/material2/commit/89cad3f)), closes [#11184](https://github.com/angular/material2/issues/11184)
* **tabs:** maintain selected tab when new tabs are added or removed ([#9132](https://github.com/angular/material2/issues/9132)) ([78f556a](https://github.com/angular/material2/commit/78f556a))
* **tabs:** unable to distinguish disabled tab in high contrast mode ([#12160](https://github.com/angular/material2/issues/12160)) ([98b9ed1](https://github.com/angular/material2/commit/98b9ed1))
* **tabs:** unable to set aria-label or aria-labelledby on tab ([#11898](https://github.com/angular/material2/issues/11898)) ([bd3d085](https://github.com/angular/material2/commit/bd3d085))
* **toolbar:** deprecate unused landscape row-height variable ([#12129](https://github.com/angular/material2/issues/12129)) ([6314d15](https://github.com/angular/material2/commit/6314d15))
* **tree:** define CdkTree before CdkTreeNode to prevent errors in JIT ([#11870](https://github.com/angular/material2/issues/11870)) ([4166d16](https://github.com/angular/material2/commit/4166d16))
* parse5 not listed as dependency for material ([#11981](https://github.com/angular/material2/issues/11981)) ([e0bbe07](https://github.com/angular/material2/commit/e0bbe07))
* sanity checks throwing an error if scripts are set in the head ([#12068](https://github.com/angular/material2/issues/12068)) ([c134026](https://github.com/angular/material2/commit/c134026)), closes [#12026](https://github.com/angular/material2/issues/12026)


### Features

* **autocomplete:** allow panel to have a width value of auto ([#11879](https://github.com/angular/material2/issues/11879)) ([8a5713e](https://github.com/angular/material2/commit/8a5713e))
* **docs:** show additional type aliases in docs. ([#11901](https://github.com/angular/material2/issues/11901)) ([637ef83](https://github.com/angular/material2/commit/637ef83))
* **list:** allow avatar in selection list options ([#10316](https://github.com/angular/material2/issues/10316)) ([20cbdba](https://github.com/angular/material2/commit/20cbdba))
* **moment-dateadapter:** add option to create utc dates ([#11336](https://github.com/angular/material2/issues/11336)) ([9a85b9b](https://github.com/angular/material2/commit/9a85b9b))
* **overlay:** expose keydown events on the opened overlay ([#11867](https://github.com/angular/material2/issues/11867)) ([a831bf6](https://github.com/angular/material2/commit/a831bf6))
* **slider:** support two-way binding for value ([#12003](https://github.com/angular/material2/issues/12003)) ([de107b7](https://github.com/angular/material2/commit/de107b7))
* **tree:** support array of data as children in nested tree ([#10886](https://github.com/angular/material2/issues/10886)) ([825d35c](https://github.com/angular/material2/commit/825d35c))
* support lazy-loading HammerJS w/ Angular 6.1 ([#11960](https://github.com/angular/material2/issues/11960)) ([eed6110](https://github.com/angular/material2/commit/eed6110))



<a name="6.3.3"></a>
## [6.3.3 chrome-tarantula](https://github.com/angular/material2/compare/6.3.2...6.3.3) (2018-07-09)


### Highlights

* In the next minor version we will remove the beta versions of Angular 6 as valid dependency
  versions. This is a change that we intended to make when moving out of beta but was accidentally
  overlooked. Please note that versions prior to beta.8 don't work properly even today, as they do
  not have all of the changes we depend on related to tree-shakeable providers.
* We have added a cdk-experimental package for drag & drop. It's not ready for prime time yet, but
  if you're feeling adventurous and want to give it a spin, feel free!


### Bug Fixes

* **tabs:** don't show focus indication for mouse focus ([#11194](https://github.com/angular/material2/issues/11194)) ([1a83bc0](https://github.com/angular/material2/commit/1a83bc0)), closes [#11184](https://github.com/angular/material2/issues/11184)


<a name="6.3.2"></a>
## [6.3.2 ruby-robot](https://github.com/angular/material2/compare/6.3.0...6.3.2) (2018-07-02)


### Bug Fixes

* **aria-describer:** clear duplicate container coming in from the server ([#11900](https://github.com/angular/material2/issues/11900)) ([31c8f6b](https://github.com/angular/material2/commit/31c8f6b))
* **autocomplete:** don't override native autocomplete attribute ([#11926](https://github.com/angular/material2/issues/11926)) ([ee9ddfb](https://github.com/angular/material2/commit/ee9ddfb))
* **autocomplete:** reposition the panel when the amount of options changes ([#4469](https://github.com/angular/material2/issues/4469)) ([a7c4d0c](https://github.com/angular/material2/commit/a7c4d0c))
* **button:** not resetting all outlines on firefox ([#11911](https://github.com/angular/material2/issues/11911)) ([df80dc6](https://github.com/angular/material2/commit/df80dc6))
* **button-toggle:** allow event bubbling for toggle button clicks ([#11951](https://github.com/angular/material2/issues/11951)) ([79415c4](https://github.com/angular/material2/commit/79415c4))
* **button-toggle:** emit change event when button is clicked ([#11886](https://github.com/angular/material2/issues/11886)) ([828b3c0](https://github.com/angular/material2/commit/828b3c0))
* **button-toggle:** use native button and aria-pressed for button-toggle ([#10990](https://github.com/angular/material2/issues/10990)) ([b959e18](https://github.com/angular/material2/commit/b959e18))
* **card:** don't override vertical divider styles ([#11899](https://github.com/angular/material2/issues/11899)) ([8a9a8bc](https://github.com/angular/material2/commit/8a9a8bc))
* **checkbox:** fix checkbox animation when moved between view containers ([#10589](https://github.com/angular/material2/issues/10589)) ([0244afc](https://github.com/angular/material2/commit/0244afc))
* **chips:** ripples still showing up when globally disabled ([#11918](https://github.com/angular/material2/issues/11918)) ([8d6a9ae](https://github.com/angular/material2/commit/8d6a9ae))
* **focus-monitor:** allow native focus options to be passed through focusVia ([#11962](https://github.com/angular/material2/issues/11962)) ([8f3b316](https://github.com/angular/material2/commit/8f3b316))
* **focus-trap:** not attaching correctly if element is not in the DOM on init ([#7665](https://github.com/angular/material2/issues/7665)) ([80d9a9a](https://github.com/angular/material2/commit/80d9a9a))
* **GlobalPositionStrategy:** justifyContent center ignored when direction is RTL ([#11877](https://github.com/angular/material2/issues/11877)) ([6b1f703](https://github.com/angular/material2/commit/6b1f703))
* **icon:** clearing all content when inserting a new SVG ([#11956](https://github.com/angular/material2/issues/11956)) ([96b389c](https://github.com/angular/material2/commit/96b389c))
* **list-key-manager:** allow withWrap to be disabled ([#11920](https://github.com/angular/material2/issues/11920)) ([ab14539](https://github.com/angular/material2/commit/ab14539))
* **menu:** panel positions not changing if position is updated after first open ([#11707](https://github.com/angular/material2/issues/11707)) ([671ad82](https://github.com/angular/material2/commit/671ad82)), closes [#11668](https://github.com/angular/material2/issues/11668)
* **menu:** scrollable menu not scrolled to top when opened for the first time ([#11859](https://github.com/angular/material2/issues/11859)) ([548266b](https://github.com/angular/material2/commit/548266b))
* **moment-dateadapter:** add option to create utc dates ([#11336](https://github.com/angular/material2/issues/11336)) ([3acd2a4](https://github.com/angular/material2/commit/3acd2a4))
* **overlay:** clear timeout if the backdrop transition completes early ([#11938](https://github.com/angular/material2/issues/11938)) ([c55c0e1](https://github.com/angular/material2/commit/c55c0e1))
* **overlay:** don't dispatch key events to overlays that don't handle them ([#11810](https://github.com/angular/material2/issues/11810)) ([2433439](https://github.com/angular/material2/commit/2433439))
* **overlay:** explicitly implement OverlayReference. ([#11824](https://github.com/angular/material2/issues/11824)) ([3e99c46](https://github.com/angular/material2/commit/3e99c46))
* **progress-spinner:** create internal default to force animations to always be on ([#11462](https://github.com/angular/material2/issues/11462)) ([11f3993](https://github.com/angular/material2/commit/11f3993))
* **schematics:** add parse5 dep ([#11647](https://github.com/angular/material2/issues/11647)) ([42dd824](https://github.com/angular/material2/commit/42dd824))
* **schematics:** error in generated unit test ([#11884](https://github.com/angular/material2/issues/11884)) ([0e5b30e](https://github.com/angular/material2/commit/0e5b30e))
* **select:** don't blur label when trigger is blurred while the panel is opened ([#11537](https://github.com/angular/material2/issues/11537)) ([6c9c3fe](https://github.com/angular/material2/commit/6c9c3fe))
* **select:** not resuming keyboard selection after clicking on single-select option ([#11882](https://github.com/angular/material2/issues/11882)) ([a3dba76](https://github.com/angular/material2/commit/a3dba76))
* **select:** reset option being marked as selected ([#11934](https://github.com/angular/material2/issues/11934)) ([cd32d78](https://github.com/angular/material2/commit/cd32d78))
* **select:** support ctrl+a shortcut for multi-select ([#11799](https://github.com/angular/material2/issues/11799)) ([11d7080](https://github.com/angular/material2/commit/11d7080))
* **selection-list:** disabling list doesn't disable ripples of options ([#11955](https://github.com/angular/material2/issues/11955)) ([4ac64da](https://github.com/angular/material2/commit/4ac64da))
* **sidenav:** remove margin from content instead of setting zero ([#11986](https://github.com/angular/material2/issues/11986)) ([82016c2](https://github.com/angular/material2/commit/82016c2))
* default config check is not  checking test builder ([#11816](https://github.com/angular/material2/issues/11816)) ([c36e6f3](https://github.com/angular/material2/commit/c36e6f3))
* parse5 not listed as dependency for material ([#11981](https://github.com/angular/material2/issues/11981)) ([ce90bed](https://github.com/angular/material2/commit/ce90bed))
* **slide-toggle:** not updating model from toggle method ([#11846](https://github.com/angular/material2/issues/11846)) ([e69cf76](https://github.com/angular/material2/commit/e69cf76))
* **sort:** arrow visible while parent row is being animated ([#11827](https://github.com/angular/material2/issues/11827)) ([de13ec9](https://github.com/angular/material2/commit/de13ec9))
* **tab-nav-bar:** ripples still showing up when globally disabled ([#11865](https://github.com/angular/material2/issues/11865)) ([4f3cbfe](https://github.com/angular/material2/commit/4f3cbfe))
* **table:** use solid color for sorting arrow ([#11533](https://github.com/angular/material2/issues/11533)) ([d083d76](https://github.com/angular/material2/commit/d083d76)), closes [#11340](https://github.com/angular/material2/issues/11340)
* **tabs:** maintain selected tab when new tabs are added or removed ([#9132](https://github.com/angular/material2/issues/9132)) ([1e164b6](https://github.com/angular/material2/commit/1e164b6))
* **tabs:** unable to set aria-label or aria-labelledby on tab ([#11898](https://github.com/angular/material2/issues/11898)) ([8e44f89](https://github.com/angular/material2/commit/8e44f89))
* **tree:** fix dynamic tree example and demo not closing children ([#11148](https://github.com/angular/material2/issues/11148)) [#11728](https://github.com/angular/material2/issues/11728) ([128e2a0](https://github.com/angular/material2/commit/128e2a0))


<a name="6.3.1"></a>
## [6.3.1 string-sole](https://github.com/angular/material2/compare/6.3.0...6.3.1) (2018-06-26)


### Bug Fixes

* **button-toggle:** emit change event when button is clicked ([#11886](https://github.com/angular/material2/issues/11886)) ([828b3c0](https://github.com/angular/material2/commit/828b3c0))
* **button-toggle:** use native button and aria-pressed for button-toggle ([#10990](https://github.com/angular/material2/issues/10990)) ([b959e18](https://github.com/angular/material2/commit/b959e18))
* **menu:** panel positions not changing if position is updated after first open ([#11707](https://github.com/angular/material2/issues/11707)) ([671ad82](https://github.com/angular/material2/commit/671ad82)), closes [#11668](https://github.com/angular/material2/issues/11668)
* **overlay:** explicitly implement OverlayReference. ([#11824](https://github.com/angular/material2/issues/11824)) ([3e99c46](https://github.com/angular/material2/commit/3e99c46))
* **progress-spinner:** create internal default to force animations to always be on ([#11462](https://github.com/angular/material2/issues/11462)) ([11f3993](https://github.com/angular/material2/commit/11f3993))
* **select:** don't blur label when trigger is blurred while the panel is opened ([#11537](https://github.com/angular/material2/issues/11537)) ([6c9c3fe](https://github.com/angular/material2/commit/6c9c3fe))
* **table:** use solid color for sorting arrow ([#11533](https://github.com/angular/material2/issues/11533)) ([d083d76](https://github.com/angular/material2/commit/d083d76)), closes [#11340](https://github.com/angular/material2/issues/11340)
* **tree:** fix dynamic tree example and demo not closing children ([#11148](https://github.com/angular/material2/issues/11148)) [#11728](https://github.com/angular/material2/issues/11728) ([128e2a0](https://github.com/angular/material2/commit/128e2a0))



<a name="6.3.0"></a>
# [6.3.0 tourmaline-transom](https://github.com/angular/material2/compare/6.2.0...6.3.0) (2018-06-18)


### Bug Fixes

* **autocomplete:** model not being updated when typing in input with disabled autocomplete ([#11695](https://github.com/angular/material2/issues/11695)) ([429d3bc](https://github.com/angular/material2/commit/429d3bc)), closes [#11678](https://github.com/angular/material2/issues/11678)
* **autofill:** listen for animation events outside the zone, but emit autofill events inside ([#11798](https://github.com/angular/material2/issues/11798)) ([48dda50](https://github.com/angular/material2/commit/48dda50))
* **badge:** remove badge margins ([#11599](https://github.com/angular/material2/issues/11599)) ([f042068](https://github.com/angular/material2/commit/f042068)), closes [#11596](https://github.com/angular/material2/issues/11596)
* **badge, tooltip:** Add A11yModule ([#11586](https://github.com/angular/material2/issues/11586)) ([75d116d](https://github.com/angular/material2/commit/75d116d))
* **checkbox:** high contrast accessibility improvements ([#11633](https://github.com/angular/material2/issues/11633)) ([6220b72](https://github.com/angular/material2/commit/6220b72)), closes [#11623](https://github.com/angular/material2/issues/11623)
* **datepicker:** inconsistent arrow color between popup and touch modes ([#11535](https://github.com/angular/material2/issues/11535)) ([bb297c9](https://github.com/angular/material2/commit/bb297c9))
* **datepicker:** make date range aria-live and fix active date logic ([#11144](https://github.com/angular/material2/issues/11144)) ([8063c26](https://github.com/angular/material2/commit/8063c26))
* **dialog:** inconsistently resetting dimensions ([#11723](https://github.com/angular/material2/issues/11723)) ([e95623d](https://github.com/angular/material2/commit/e95623d))
* **dialog:** not closing correctly when detached externally ([#11516](https://github.com/angular/material2/issues/11516)) ([be1b5e6](https://github.com/angular/material2/commit/be1b5e6))
* **expansion:** expansion panel blending in with background in high contrast mode ([#11659](https://github.com/angular/material2/issues/11659)) ([8842fb2](https://github.com/angular/material2/commit/8842fb2))
* **form-field:** fix wrong underline color in error state ([#11447](https://github.com/angular/material2/issues/11447)) ([3681ddf](https://github.com/angular/material2/commit/3681ddf)), closes [#11436](https://github.com/angular/material2/issues/11436)
* **form-field:** inaccessible in high contrast mode ([#11736](https://github.com/angular/material2/issues/11736)) ([0a39595](https://github.com/angular/material2/commit/0a39595)), closes [#6257](https://github.com/angular/material2/issues/6257) [#6383](https://github.com/angular/material2/issues/6383) [#9009](https://github.com/angular/material2/issues/9009)
* **icon:** IE/Edge ignoring style tags inside inline SVG ([#11531](https://github.com/angular/material2/issues/11531)) ([555d8f4](https://github.com/angular/material2/commit/555d8f4)), closes [#11458](https://github.com/angular/material2/issues/11458)
* **menu:** reintroduce panel position classes ([#11612](https://github.com/angular/material2/issues/11612)) ([703da89](https://github.com/angular/material2/commit/703da89)), closes [#11597](https://github.com/angular/material2/issues/11597)
* **menu:** toggle aria-expanded attribute on menu trigger ([#11751](https://github.com/angular/material2/issues/11751)) ([bf88702](https://github.com/angular/material2/commit/bf88702))
* **overlay:** flexible overlay with push not handling scroll offset and position locking ([#11421](https://github.com/angular/material2/issues/11421)) ([55aaa03](https://github.com/angular/material2/commit/55aaa03))
* **overlay:** global overlay incorrectly handling left/right position when RTL is set on body ([#11412](https://github.com/angular/material2/issues/11412)) ([2a51565](https://github.com/angular/material2/commit/2a51565)), closes [#11393](https://github.com/angular/material2/issues/11393)
* **overlay:** unable to reset overlay size properties to initial value ([#11592](https://github.com/angular/material2/issues/11592)) ([ba4f2af](https://github.com/angular/material2/commit/ba4f2af))
* **paginator:** page size selections being truncated with outline and fill appearances ([#11722](https://github.com/angular/material2/issues/11722)) ([255c10a](https://github.com/angular/material2/commit/255c10a)), closes [#11681](https://github.com/angular/material2/issues/11681)
* **progress-bar:** not usable in high contrast mode ([#11651](https://github.com/angular/material2/issues/11651)) ([ff78ade](https://github.com/angular/material2/commit/ff78ade)), closes [#11623](https://github.com/angular/material2/issues/11623)
* **progress-spinner:** animation not working when default size is set via token ([#11688](https://github.com/angular/material2/issues/11688)) ([7c1db46](https://github.com/angular/material2/commit/7c1db46)), closes [#11687](https://github.com/angular/material2/issues/11687)
* **schematics:** add app prefix to components ([#11738](https://github.com/angular/material2/issues/11738)) ([84634cc](https://github.com/angular/material2/commit/84634cc))
* **schematics:** remove temp path [#11198](https://github.com/angular/material2/issues/11198) ([#11424](https://github.com/angular/material2/issues/11424)) ([b349de3](https://github.com/angular/material2/commit/b349de3))
* **scrolling:** scrollable elementScrolled stream not being completed on destroy ([#11518](https://github.com/angular/material2/issues/11518)) ([9ab6cd0](https://github.com/angular/material2/commit/9ab6cd0))
* **select:** disable all animations when using NoopAnimationsModule ([#11594](https://github.com/angular/material2/issues/11594)) ([fa60fe4](https://github.com/angular/material2/commit/fa60fe4)), closes [#10590](https://github.com/angular/material2/issues/10590)
* **select:** handle null values in multi-select ([#11792](https://github.com/angular/material2/issues/11792)) ([dd8c807](https://github.com/angular/material2/commit/dd8c807))
* **select:** inconsistent openedChange event dispatched between browsers ([#11461](https://github.com/angular/material2/issues/11461)) ([4ef9cb0](https://github.com/angular/material2/commit/4ef9cb0))
* **select:** label not being read out when using mat-label in mat-form-field ([#11710](https://github.com/angular/material2/issues/11710)) ([e349fe4](https://github.com/angular/material2/commit/e349fe4))
* **select:** multi-select checkbox not having an outline in high contrast mode ([#11667](https://github.com/angular/material2/issues/11667)) ([082efa3](https://github.com/angular/material2/commit/082efa3))
* **select:** unable to use the MatOption select/deselect API to toggle options ([#11528](https://github.com/angular/material2/issues/11528)) ([81537af](https://github.com/angular/material2/commit/81537af)), closes [#9314](https://github.com/angular/material2/issues/9314)
* **selection-list:** support selecting all via ctrl + a ([#11502](https://github.com/angular/material2/issues/11502)) ([e6d9494](https://github.com/angular/material2/commit/e6d9494))
* **sidenav:** scrollable instance not exposed when explicitly specifying content element ([#11517](https://github.com/angular/material2/issues/11517)) ([436ac7d](https://github.com/angular/material2/commit/436ac7d)), closes [#10884](https://github.com/angular/material2/issues/10884)
* **slider:** value not being rounded when using keyboard and decimal step ([#11574](https://github.com/angular/material2/issues/11574)) ([61f0f2a](https://github.com/angular/material2/commit/61f0f2a)), closes [#10951](https://github.com/angular/material2/issues/10951)
* **stepper:** reading out wrong amount of options with NVDA on Firefox ([#11711](https://github.com/angular/material2/issues/11711)) ([56e703f](https://github.com/angular/material2/commit/56e703f)), closes [#11694](https://github.com/angular/material2/issues/11694)
* **table:** minor styling fix to expandable rows ([#11569](https://github.com/angular/material2/issues/11569)) ([3d6f326](https://github.com/angular/material2/commit/3d6f326))
* **tabs:** Add role to mat-tab-nav-bar and mat-tab-link ([#11410](https://github.com/angular/material2/issues/11410)) ([fd23c02](https://github.com/angular/material2/commit/fd23c02))
* **tabs:** Set initial ink bar width as 0 width ([#11585](https://github.com/angular/material2/issues/11585)) ([c977763](https://github.com/angular/material2/commit/c977763))
* **tabs:** tab position and amount of tabs not being read out by screen reader ([#11694](https://github.com/angular/material2/issues/11694)) ([260afcf](https://github.com/angular/material2/commit/260afcf)), closes [#11369](https://github.com/angular/material2/issues/11369)
* **tabs:** update mat-tab-link to set aria-current when active ([#11409](https://github.com/angular/material2/issues/11409)) ([103acc4](https://github.com/angular/material2/commit/103acc4))
* **tooltip:** don't open for mouse and touch focus ([#10728](https://github.com/angular/material2/issues/10728)) ([74f4364](https://github.com/angular/material2/commit/74f4364))
* **tooltip:** long continuous strings overflowing tooltip container ([#11363](https://github.com/angular/material2/issues/11363)) ([2786b34](https://github.com/angular/material2/commit/2786b34))


### Features

* **table:** support sticky headers, footers, and columns ([#11483](https://github.com/angular/material2/issues/11483)) ([edbbc1b](https://github.com/angular/material2/commit/edbbc1b))
* **bottom-sheet:** switch to providedIn syntax ([59554c4](https://github.com/angular/material2/commit/59554c4))
* **collections:** add isMultipleSelection function to SelectionModel ([#11560](https://github.com/angular/material2/issues/11560)) ([0675e05](https://github.com/angular/material2/commit/0675e05))
* **schematics:** add address form schematic ([#11425](https://github.com/angular/material2/issues/11425)) ([9b80a4c](https://github.com/angular/material2/commit/9b80a4c))
* **snackbar:** switch to providedIn syntax ([a21a4f2](https://github.com/angular/material2/commit/a21a4f2))


<a name="6.2.1"></a>
## [6.2.1 crystal-caribou](https://github.com/angular/material2/compare/6.2.0...6.2.1) (2018-06-04)


### Bug Fixes

* **datepicker:** inconsistent arrow color between popup and touch modes ([#11535](https://github.com/angular/material2/issues/11535)) ([f974324](https://github.com/angular/material2/commit/f974324))
* **dialog:** not closing correctly when detached externally ([#11516](https://github.com/angular/material2/issues/11516)) ([bbb1d39](https://github.com/angular/material2/commit/bbb1d39))
* **tooltip:** don't open for mouse and touch focus ([a003b9a](https://github.com/angular/material2/commit/a003b9a)), closes [#10709](https://github.com/angular/material2/issues/10709)
* **tooltip:** long continuous strings overflowing tooltip container ([#11363](https://github.com/angular/material2/issues/11363)) ([c5f1293](https://github.com/angular/material2/commit/c5f1293))



<a name="6.2.0"></a>
# [6.2.0 bamboo-shampoo](https://github.com/angular/material2/compare/6.1.0...6.2.0) (2018-05-29)


### Highlights

* An initial implementation of virtual scrolling is now available in @angular/cdk-experimental.
  Please note that, since these components are still experimental, they may have bugs and the API
  is subject to change.

### Bug Fixes

* **autosize:** textarea receiving focus on init ([#11460](https://github.com/angular/material2/issues/11460)) ([7d447c2](https://github.com/angular/material2/commit/7d447c2)), closes [#11451](https://github.com/angular/material2/issues/11451) [#11308](https://github.com/angular/material2/issues/11308)
* **button:** disable all animations when using the NoopAnimationsModule ([#11477](https://github.com/angular/material2/issues/11477)) ([1a75152](https://github.com/angular/material2/commit/1a75152)), closes [#10590](https://github.com/angular/material2/issues/10590)
* **checkbox, radio:** remove webkit tap highlights ([#11349](https://github.com/angular/material2/issues/11349)) ([4b2cc1a](https://github.com/angular/material2/commit/4b2cc1a))
* **form-field:** disable all animations when using NoopAnimationsModule ([#11371](https://github.com/angular/material2/issues/11371)) ([9062640](https://github.com/angular/material2/commit/9062640)), closes [#10590](https://github.com/angular/material2/issues/10590)
* **form-field:** infinite loop when using outline appearance and element isn't in the DOM ([#11406](https://github.com/angular/material2/issues/11406)) ([e592615](https://github.com/angular/material2/commit/e592615)), closes [#11329](https://github.com/angular/material2/issues/11329)
* **menu:** lazy-rendered content being duplicated when toggling quickly ([#11348](https://github.com/angular/material2/issues/11348)) ([fb5cdb2](https://github.com/angular/material2/commit/fb5cdb2)), closes [#11331](https://github.com/angular/material2/issues/11331)
* **nav-schematics:** update isHandset$ type and fix template expression ([#11448](https://github.com/angular/material2/issues/11448)) ([b9041e3](https://github.com/angular/material2/commit/b9041e3)), closes [#11445](https://github.com/angular/material2/issues/11445) [#11441](https://github.com/angular/material2/issues/11441)
* **overlay:** incorrect position when using flexible positioning and rtl on the body ([#11393](https://github.com/angular/material2/issues/11393)) ([acc24c4](https://github.com/angular/material2/commit/acc24c4)), closes [#11387](https://github.com/angular/material2/issues/11387)
* **accordion, expansion:** prevent nested expansion panels from registering to the same accordion ([#11342](https://github.com/angular/material2/issues/11342)) ([9bf720a](https://github.com/angular/material2/commit/9bf720a))
* **select:** panel content blurry in some browsers ([#11434](https://github.com/angular/material2/issues/11434)) ([3dc3fcd](https://github.com/angular/material2/commit/3dc3fcd))
* **slide-toggle:** disable animations when using NoopAnimationsModule ([#11414](https://github.com/angular/material2/issues/11414)) ([1d96d5a](https://github.com/angular/material2/commit/1d96d5a)), closes [#10590](https://github.com/angular/material2/issues/10590)
* **slider:** disable animations when using NoopAnimationsModule ([#11422](https://github.com/angular/material2/issues/11422)) ([cf17ef7](https://github.com/angular/material2/commit/cf17ef7)), closes [#10590](https://github.com/angular/material2/issues/10590)
* **table:** data source not unsubscribing from render changes subscription ([#11394](https://github.com/angular/material2/issues/11394)) ([9313f18](https://github.com/angular/material2/commit/9313f18)), closes [#11382](https://github.com/angular/material2/issues/11382)


### Features

* **a11y:** add cdkAriaLive directive ([#11352](https://github.com/angular/material2/issues/11352)) ([64a70ad](https://github.com/angular/material2/commit/64a70ad))
* **expansion:** allow expansion indicator positioning ([#8199](https://github.com/angular/material2/issues/8199)) ([51d859f](https://github.com/angular/material2/commit/51d859f))
* **overlay:** allow for Directionality instance to be passed in ([#11411](https://github.com/angular/material2/issues/11411)) ([be577b1](https://github.com/angular/material2/commit/be577b1))
* **progress-spinner:** add injection token for configuring the diameter and stroke globally ([#11493](https://github.com/angular/material2/issues/11493)) ([c3899cf](https://github.com/angular/material2/commit/c3899cf)), closes [#11490](https://github.com/angular/material2/issues/11490)
* **collections:** add ArrayDataSource, a DataSource wrapper for Array and Observable<Array> ([#11354](https://github.com/angular/material2/issues/11354)) ([f59658d](https://github.com/angular/material2/commit/f59658d))


### Performance Improvements

* **overlay:** only compute and emit position changes if there are subscribers ([#11431](https://github.com/angular/material2/issues/11431)) ([c68ccc9](https://github.com/angular/material2/commit/c68ccc9))



<a name="6.1.0"></a>
# [6.1.0 plaster-parliament](https://github.com/angular/material2/compare/6.0.0...6.1.0) (2018-05-21)


### Features

* **autocomplete:** add the ability to set a different panel connection element ([#11284](https://github.com/angular/material2/issues/11284)) ([efe37f5](https://github.com/angular/material2/commit/efe37f5)), closes [#11269](https://github.com/angular/material2/issues/11269)
* **autocomplete:** allow autocomplete panel to be disabled ([#11142](https://github.com/angular/material2/issues/11142)) ([e8bc0e9](https://github.com/angular/material2/commit/e8bc0e9))
* **button:** add isIconButton and isRoundButton properties ([#11226](https://github.com/angular/material2/issues/11226)) ([318d699](https://github.com/angular/material2/commit/318d699))
* **cdk-input:** change autosize to be bindable ([#9884](https://github.com/angular/material2/issues/9884)) ([#11167](https://github.com/angular/material2/issues/11167)) ([2d227b7](https://github.com/angular/material2/commit/2d227b7))
* **elevation:** add $opacity argument to elevation mixins ([#10877](https://github.com/angular/material2/issues/10877)) ([fbf5648](https://github.com/angular/material2/commit/fbf5648))
* **observe-content:** refactor so logic can be used without directive ([#11170](https://github.com/angular/material2/issues/11170)) ([ba57852](https://github.com/angular/material2/commit/ba57852))
* **overlay:** add support for automatically setting the transform-origin based on the current position ([#10868](https://github.com/angular/material2/issues/10868)) ([d26735c](https://github.com/angular/material2/commit/d26735c))
* **overlay:** expose flexible overlay features through CdkConnectedOverlay ([#11069](https://github.com/angular/material2/issues/11069)) ([ef0229c](https://github.com/angular/material2/commit/ef0229c))
* **table:** allow multiple header/footer rows ([#11245](https://github.com/angular/material2/issues/11245)) ([641edc3](https://github.com/angular/material2/commit/641edc3))
* **table:** enable multiple data rows ([#11116](https://github.com/angular/material2/issues/11116)) ([c15e307](https://github.com/angular/material2/commit/c15e307))
* **tree:** Add support for trackBy ([#11267](https://github.com/angular/material2/issues/11267)) ([ff34dac](https://github.com/angular/material2/commit/ff34dac))


### Bug Fixes

* **animations:** prevent animations when in a noopanimations module ([#10881](https://github.com/angular/material2/issues/10881)) ([81b6a78](https://github.com/angular/material2/commit/81b6a78))
* **autocomplete:** panel blending in with background in high contrast mode ([#11190](https://github.com/angular/material2/issues/11190)) ([9e9daf8](https://github.com/angular/material2/commit/9e9daf8))
* **autocomplete:** return consistent output from panelClosingActions ([#8533](https://github.com/angular/material2/issues/8533)) ([2815607](https://github.com/angular/material2/commit/2815607)), closes [#7553](https://github.com/angular/material2/issues/7553)
* **autosize:** error thrown by IE in some cases when component is destroyed ([#11109](https://github.com/angular/material2/issues/11109)) ([af09c8f](https://github.com/angular/material2/commit/af09c8f))
* **button:** ripples not being clipped by button border radius ([#11181](https://github.com/angular/material2/issues/11181)) ([6e026d7](https://github.com/angular/material2/commit/6e026d7)), closes [#11160](https://github.com/angular/material2/issues/11160)
* **button-toggle:** fix button toggle with 0 value not checked ([#11292](https://github.com/angular/material2/issues/11292)) ([9a8cd4d](https://github.com/angular/material2/commit/9a8cd4d))
* **checkbox:** disable animations when using NoopAnimationsModule ([#11249](https://github.com/angular/material2/issues/11249)) ([93b5892](https://github.com/angular/material2/commit/93b5892)), closes [#11205](https://github.com/angular/material2/issues/11205)
* **checkbox:** update MatCheckbox disabled setter to trigger change detection ([#11098](https://github.com/angular/material2/issues/11098)) ([ce1b517](https://github.com/angular/material2/commit/ce1b517))
* **chips:** stacked chips overflowing chip list ([#11143](https://github.com/angular/material2/issues/11143)) ([d3c8cc5](https://github.com/angular/material2/commit/d3c8cc5))
* **datepicker:** dateInput event being fired if the value hasn't changed ([#10952](https://github.com/angular/material2/issues/10952)) ([a62cdb6](https://github.com/angular/material2/commit/a62cdb6))
* **datepicker:** don't autofocus calendar cell if used outside of overlay ([#11049](https://github.com/angular/material2/issues/11049)) ([2897797](https://github.com/angular/material2/commit/2897797))
* **dialog:** min-height and max-height not having an effect on dialog container ([#11235](https://github.com/angular/material2/issues/11235)) ([a20dfd3](https://github.com/angular/material2/commit/a20dfd3))
* **dialog,bottom-sheet:** don't provide directionality if no direction is set ([#11285](https://github.com/angular/material2/issues/11285)) ([cd37a54](https://github.com/angular/material2/commit/cd37a54)), closes [#11262](https://github.com/angular/material2/issues/11262)
* **expansion-panel:** inconsistent margin for nested panels ([#11305](https://github.com/angular/material2/issues/11305)) ([1bf5c41](https://github.com/angular/material2/commit/1bf5c41)), closes [#11254](https://github.com/angular/material2/issues/11254)
* **focus-monitor:** don't null-out focus until after event is finished with capture & bubble ([#10721](https://github.com/angular/material2/issues/10721)) ([0b7572b](https://github.com/angular/material2/commit/0b7572b))
* **focus-monitor:** reenter ngzone before emitting ([#10549](https://github.com/angular/material2/issues/10549)) ([37193d8](https://github.com/angular/material2/commit/37193d8))
* **form-field:** error on IE11 when using outline appearance ([#11108](https://github.com/angular/material2/issues/11108)) ([c9bd05c](https://github.com/angular/material2/commit/c9bd05c))
* **icon:** log full error message when icon set fails to load ([#10915](https://github.com/angular/material2/issues/10915)) ([fbf06bb](https://github.com/angular/material2/commit/fbf06bb))
* **icon:** remove duplicate icon registry provider ([#11214](https://github.com/angular/material2/issues/11214)) ([67a6aa1](https://github.com/angular/material2/commit/67a6aa1))
* **nav-schematics:** Subscribe to breakpoint observable ([#11310](https://github.com/angular/material2/issues/11310)) ([d52acc9](https://github.com/angular/material2/commit/d52acc9))
* **ng-add:** install added packages ([#11163](https://github.com/angular/material2/issues/11163)) ([be08eb9](https://github.com/angular/material2/commit/be08eb9))
* **overlay:** injection errors for scroll strategy providers in lazy-loaded modules ([#11213](https://github.com/angular/material2/issues/11213)) ([0cda47c](https://github.com/angular/material2/commit/0cda47c)), closes [#10820](https://github.com/angular/material2/issues/10820)
* **radio:** disable animations when using NoopAnimationsModule ([#11296](https://github.com/angular/material2/issues/11296)) ([af78b97](https://github.com/angular/material2/commit/af78b97))
* **radio:** update set disabled directly on MatRadioButton to trigger change detection ([#11056](https://github.com/angular/material2/issues/11056)) ([860ce13](https://github.com/angular/material2/commit/860ce13))
* **ripple:** disable ripple animations when using NoopAnimationsModule ([#11205](https://github.com/angular/material2/issues/11205)) ([9715928](https://github.com/angular/material2/commit/9715928))
* **sidenav:** disable all sidenav animations when using NoopAnimationsModule ([#11180](https://github.com/angular/material2/issues/11180)) ([03e749a](https://github.com/angular/material2/commit/03e749a))
* **sidenav-demo:** trigger event opened ([#11225](https://github.com/angular/material2/issues/11225)) ([853b04c](https://github.com/angular/material2/commit/853b04c))
* **snack-bar:** snack bar not animating in if no positions are passed in ([#11230](https://github.com/angular/material2/issues/11230)) ([f5377dd](https://github.com/angular/material2/commit/f5377dd)), closes [#11197](https://github.com/angular/material2/issues/11197)
* **stepper:** error being thrown if selected step is accessed too early ([#11186](https://github.com/angular/material2/issues/11186)) ([4638833](https://github.com/angular/material2/commit/4638833)), closes [#11158](https://github.com/angular/material2/issues/11158)
* **stepper:** handle keyboard interactions if direction changes after init ([#11067](https://github.com/angular/material2/issues/11067)) ([116ee60](https://github.com/angular/material2/commit/116ee60))
* **table:** add missing constructors ([#11252](https://github.com/angular/material2/issues/11252)) ([8e7dd80](https://github.com/angular/material2/commit/8e7dd80))
* **tabs:** handle long tab labels in mat-tab-nav-bar ([#10903](https://github.com/angular/material2/issues/10903)) ([61dd937](https://github.com/angular/material2/commit/61dd937))
* **tooltip:** not handling direction changes after the first open ([#11324](https://github.com/angular/material2/issues/11324)) ([abc3d38](https://github.com/angular/material2/commit/abc3d38))
* add custom theme using string ref in angular.json ([#11189](https://github.com/angular/material2/issues/11189)) ([33b5df4](https://github.com/angular/material2/commit/33b5df4)), closes [#11188](https://github.com/angular/material2/issues/11188)


### Performance Improvements

* **sidenav:** avoid hitting zone continuously when using autosize option ([#11231](https://github.com/angular/material2/issues/11231)) ([c936bc9](https://github.com/angular/material2/commit/c936bc9)), closes [#11215](https://github.com/angular/material2/issues/11215)



<a name="6.0.2"></a>
## [6.0.2 chocolate-reality](https://github.com/angular/material2/compare/6.0.1...6.0.2) (2018-05-14)


### Bug Fixes

* **autocomplete:** panel blending in with background in high contrast mode ([#11190](https://github.com/angular/material2/issues/11190)) ([23fca28](https://github.com/angular/material2/commit/23fca28))
* **autosize:** error thrown by IE in some cases when component is destroyed ([#11109](https://github.com/angular/material2/issues/11109)) ([408134f](https://github.com/angular/material2/commit/408134f))
* **button:** ripples not being clipped by button border radius ([#11181](https://github.com/angular/material2/issues/11181)) ([a1d98a9](https://github.com/angular/material2/commit/a1d98a9)), closes [#11160](https://github.com/angular/material2/issues/11160)
* **checkbox:** update MatCheckbox disabled setter to trigger change detection ([#11098](https://github.com/angular/material2/issues/11098)) ([22baefc](https://github.com/angular/material2/commit/22baefc))
* **datepicker:** dateInput event being fired if the value hasn't changed ([#10952](https://github.com/angular/material2/issues/10952)) ([f3d436d](https://github.com/angular/material2/commit/f3d436d))
* **dialog:** min-height and max-height not having an effect on dialog container ([#11235](https://github.com/angular/material2/issues/11235)) ([7ea3900](https://github.com/angular/material2/commit/7ea3900))
* **icon:** remove duplicate icon registry provider ([#11214](https://github.com/angular/material2/issues/11214)) ([c66d6a5](https://github.com/angular/material2/commit/c66d6a5))
* add custom theme using string ref in angular.json ([#11189](https://github.com/angular/material2/issues/11189)) ([f0b1529](https://github.com/angular/material2/commit/f0b1529)), closes [#11188](https://github.com/angular/material2/issues/11188)
* **ripple:** disable ripple animations when using NoopAnimationsModule ([#11205](https://github.com/angular/material2/issues/11205)) ([29d7330](https://github.com/angular/material2/commit/29d7330))
* **sidenav:** disable all sidenav animations when using NoopAnimationsModule ([#11180](https://github.com/angular/material2/issues/11180)) ([0c7998c](https://github.com/angular/material2/commit/0c7998c))
* **stepper:** error being thrown if selected step is accessed too early ([#11186](https://github.com/angular/material2/issues/11186)) ([834c6f7](https://github.com/angular/material2/commit/834c6f7)), closes [#11158](https://github.com/angular/material2/issues/11158)
* **stepper:** handle keyboard interactions if direction changes after init ([#11067](https://github.com/angular/material2/issues/11067)) ([b15b8be](https://github.com/angular/material2/commit/b15b8be))
* **table:** add missing constructors ([#11252](https://github.com/angular/material2/issues/11252)) ([f02bb05](https://github.com/angular/material2/commit/f02bb05))
* **tabs:** handle long tab labels in mat-tab-nav-bar ([#10903](https://github.com/angular/material2/issues/10903)) ([f5eda86](https://github.com/angular/material2/commit/f5eda86))


### Performance Improvements

* **sidenav:** avoid hitting zone continuously when using autosize option ([#11231](https://github.com/angular/material2/issues/11231)) ([2764ea6](https://github.com/angular/material2/commit/2764ea6)), closes [#11215](https://github.com/angular/material2/issues/11215)



<a name="6.0.1"></a>
## [6.0.1 glass-spaceship](https://github.com/angular/material2/compare/6.0.0...6.0.1) (2018-05-07)


### Bug Fixes

* **chips:** stacked chips overflowing chip list ([#11143](https://github.com/angular/material2/issues/11143)) ([70ba46e](https://github.com/angular/material2/commit/70ba46e))
* **datepicker:** don't autofocus calendar cell if used outside of overlay ([#11049](https://github.com/angular/material2/issues/11049)) ([2a02ce2](https://github.com/angular/material2/commit/2a02ce2))
* **focus-monitor:** don't null-out focus until after event is finished with capture & bubble ([#10721](https://github.com/angular/material2/issues/10721)) ([71ac0ae](https://github.com/angular/material2/commit/71ac0ae))
* **focus-monitor:** reenter ngzone before emitting ([#10549](https://github.com/angular/material2/issues/10549)) ([8be7d4e](https://github.com/angular/material2/commit/8be7d4e))
* **form-field:** error on IE11 when using outline appearance ([#11108](https://github.com/angular/material2/issues/11108)) ([3f87309](https://github.com/angular/material2/commit/3f87309))
* **icon:** log full error message when icon set fails to load ([#10915](https://github.com/angular/material2/issues/10915)) ([f6af40c](https://github.com/angular/material2/commit/f6af40c))
* **ng-add:** install added packages ([#11163](https://github.com/angular/material2/issues/11163)) ([bf9d5bb](https://github.com/angular/material2/commit/bf9d5bb))
* **radio:** update set disabled directly on MatRadioButton to trigger change detection ([#11056](https://github.com/angular/material2/issues/11056)) ([a4597c9](https://github.com/angular/material2/commit/a4597c9))



<a name="6.0.0"></a>
# [6.0.0 vibranium-vivarium](https://github.com/angular/material2/compare/6.0.0-rc.14...6.0.0) (2018-05-03)

### Highlights

* [`MatTree`](https://material.angular.io/components/tree/overview) component is now available, [@tinayuangao](https://github.com/tinayuangao) recently gave a [talk at ng-conf about the new component](https://www.youtube.com/watch?v=s0Vy3sLbeyA)
* `<mat-table>` and `<cdk-table>` now native [`<table>` elements](https://material.angular.io/components/table/overview#applying-material-styles-to-native-table) in addition to the existing [`display: flex` based layout](https://material.angular.io/components/table/overview#tables-with-code-display-flex-code-)
* `MatTable` now supports having an optional [footer row](https://material.angular.io/components/table/overview#footer_row)
* [Schematics](https://material.angular.io/guides/schematics) are now available for Angular Material, [@jelbourn](https://github.com/jelbourn) recently gave a [talk at ng-conf about using schematics](https://www.youtube.com/watch?v=v__RuD9RX3I)
* `MatTabs` content can now be [lazy loaded](https://material.angular.io/components/tabs/overview#lazy_loading)
* [`MatBadge`](https://material.angular.io/components/badge/overview) and [`MatBottomSheet`](https://material.angular.io/components/bottom-sheet/overview) components are now available
* `@angular/cdk/overlay` has a new positioning strategy available, [`FlexibleConnectedPositionStrategy`](https://material.angular.io/cdk/overlay/overview#position-strategies), which intelligently handles sizing and positioning to ensure that overlay contents always remain on the screen
* `MatIcon` now allows SVG icons to be registered from strings
* `@angular/cdk/keycodes` now includes most keycodes you might need for building a web application
* 130+ bug fixes
* Docs for v5 are now available at [v5.material.angular.io](https://v5.material.angular.io)
* A version picker is available [material.angular.io](https://material.angular.io) to switch between docs versions


### Upgrading to Angular Material 6.0

With the Angular CLI v6.0+, you can use the `ng update` command to automatically migrate to the new APIs
```
ng update @angular/material
```
**NOTE:** There may be some cases where the tool may be unable to automatically migrate, but will notify you of those cases


### Breaking Changes
* A number of APIs that were deprecated during beta have been removed, see [here for complete list](https://github.com/angular/material2/blob/master/CHANGELOG.md#600-beta5-2018-03-23)
* See `ng update` tooling above to automatically migrate to the new APIs



### Bug Fixes

* **autocomplete:** panel direction not being updated if the trigger direction changes ([#10916](https://github.com/angular/material2/issues/10916)) ([8c30cee](https://github.com/angular/material2/commit/8c30cee))
* **button-toggle:** not usable in high contrast mode ([#11097](https://github.com/angular/material2/issues/11097)) ([dd2f465](https://github.com/angular/material2/commit/dd2f465))
* **dialog:** add generic parameter for the dialog result to open method ([#11059](https://github.com/angular/material2/issues/11059)) ([bf1bdc0](https://github.com/angular/material2/commit/bf1bdc0))
* **form-field:** inconsistent underline height at different DPIs ([#11062](https://github.com/angular/material2/issues/11062)) ([0f7d503](https://github.com/angular/material2/commit/0f7d503))
* **form-field:** scrollbars appear on autosize textarea in chrome ([#10811](https://github.com/angular/material2/issues/10811)) ([385f96d](https://github.com/angular/material2/commit/385f96d))
* **form-field,select:** handle form field controls inside toolbar ([#10627](https://github.com/angular/material2/issues/10627)) ([1a3993e](https://github.com/angular/material2/commit/1a3993e))
* **list:** selection list always firing change event for selectAll and deselectAll ([#11029](https://github.com/angular/material2/issues/11029)) ([54c0b00](https://github.com/angular/material2/commit/54c0b00))
* **menu:** not updating panel direction after init ([#11070](https://github.com/angular/material2/issues/11070)) ([294ba3c](https://github.com/angular/material2/commit/294ba3c))
* **menu:** unable to open same sub-menu from different triggers and not picking up indirect descendant items ([#10132](https://github.com/angular/material2/issues/10132)) ([5393bfe](https://github.com/angular/material2/commit/5393bfe))
* **overlay:** error when rendering flexible overlay on the server ([#11072](https://github.com/angular/material2/issues/11072)) ([422d102](https://github.com/angular/material2/commit/422d102))
* **paginator:** handle negative pageSize and pageIndex correctly ([#11068](https://github.com/angular/material2/issues/11068)) ([3f5e481](https://github.com/angular/material2/commit/3f5e481))
* **select:** losing focus position when tabbing away after clicking inside multi select ([#10905](https://github.com/angular/material2/issues/10905)) ([c6ad1f8](https://github.com/angular/material2/commit/c6ad1f8))
* **select:** unable to toggle multi select option after using the mouse ([#11061](https://github.com/angular/material2/issues/11061)) ([01d0993](https://github.com/angular/material2/commit/01d0993))
* **sidenav:** box shadow visible while closed when rendering on the server ([#10969](https://github.com/angular/material2/issues/10969)) ([cfe6c1d](https://github.com/angular/material2/commit/cfe6c1d))



<a name="6.0.0-rc.14"></a>
# [6.0.0-rc.14](https://github.com/angular/material2/compare/6.0.0-rc.12...6.0.0-rc.14) (2018-04-30)


### Bug Fixes

* **card:** flat card selector not working ([#11028](https://github.com/angular/material2/issues/11028)) ([b67813e](https://github.com/angular/material2/commit/b67813e)), closes [#11014](https://github.com/angular/material2/issues/11014)
* **ci:** Shard tests on CI across 3 browsers ([#11048](https://github.com/angular/material2/issues/11048)) ([a647579](https://github.com/angular/material2/commit/a647579))
* **overlay:** always dispatch keyboard events to top overlay in OverlayKeyboardDispatcher ([#10807](https://github.com/angular/material2/issues/10807)) ([d96fa07](https://github.com/angular/material2/commit/d96fa07)), closes [#10799](https://github.com/angular/material2/issues/10799)
* **schematics:** allow more tsconfig locations for ng update ([#11058](https://github.com/angular/material2/issues/11058)) ([7bbc040](https://github.com/angular/material2/commit/7bbc040))



<a name="6.0.0-rc.13"></a>
# [6.0.0-rc.13](https://github.com/angular/material2/compare/6.0.0-rc.12...6.0.0-rc.13) (2018-04-26)


### Bug Fixes

* **accordion:** complete accordion item emitters on destroy ([#10858](https://github.com/angular/material2/issues/10858)) ([b8e97b2](https://github.com/angular/material2/commit/b8e97b2))
* **bottom-sheet:** server-side rendering error when opened ([#10487](https://github.com/angular/material2/issues/10487)) ([6d9ed8a](https://github.com/angular/material2/commit/6d9ed8a))
* **chips:** unable to bind to chip input placeholder ([#10855](https://github.com/angular/material2/issues/10855)) ([acb0bd0](https://github.com/angular/material2/commit/acb0bd0)), closes [#10848](https://github.com/angular/material2/issues/10848)
* **datepicker:** allow MatCalendarHeader to be re-used inside a custom header ([#10856](https://github.com/angular/material2/issues/10856)) ([153dfb8](https://github.com/angular/material2/commit/153dfb8))
* **datepicker:** calendar stateChanges not being completed ([#10960](https://github.com/angular/material2/issues/10960)) ([f08a4ec](https://github.com/angular/material2/commit/f08a4ec))
* **datepicker:** producing wrong selector for disabled dates for themes inside a selector ([#10904](https://github.com/angular/material2/issues/10904)) ([54301da](https://github.com/angular/material2/commit/54301da)), closes [#10889](https://github.com/angular/material2/issues/10889)
* **examples:** add missing module imports and exports ([#10947](https://github.com/angular/material2/issues/10947)) ([069e1df](https://github.com/angular/material2/commit/069e1df))
* **form-field:** inconsistent border width across outline gap in Chrome ([#10956](https://github.com/angular/material2/issues/10956)) ([a609acf](https://github.com/angular/material2/commit/a609acf)), closes [#10710](https://github.com/angular/material2/issues/10710)
* **form-field:** make outline appearance work in situations where the… ([#10943](https://github.com/angular/material2/issues/10943)) ([a0c77e2](https://github.com/angular/material2/commit/a0c77e2))
* **menu:** not closing sibling sub-menus when hovering over disabled items ([#10396](https://github.com/angular/material2/issues/10396)) ([3b7fe64](https://github.com/angular/material2/commit/3b7fe64))
* **menu:** set proper focus origin when the user starts using the keyboard after opening with the mouse ([#11000](https://github.com/angular/material2/issues/11000)) ([ec3e3e7](https://github.com/angular/material2/commit/ec3e3e7)), closes [#10980](https://github.com/angular/material2/issues/10980)
* **overlay:** clear element reference on destroy ([#10486](https://github.com/angular/material2/issues/10486)) ([0e21443](https://github.com/angular/material2/commit/0e21443))
* **overlay:** handle OnDestroy in FullscreenOverlayContainer and use document injection token ([#10773](https://github.com/angular/material2/issues/10773)) ([d2b183e](https://github.com/angular/material2/commit/d2b183e))
* **overlay:** unable to use overlay provider during app initialization ([#10975](https://github.com/angular/material2/issues/10975)) ([e4817bb](https://github.com/angular/material2/commit/e4817bb)), closes [#10967](https://github.com/angular/material2/issues/10967)
* **overlay:** wrong import path in distributed overlay styles ([#10999](https://github.com/angular/material2/issues/10999)) ([257a777](https://github.com/angular/material2/commit/257a777)), closes [#10908](https://github.com/angular/material2/issues/10908)
* **radio:** radios aren't checkable when the value is falsy ([#10315](https://github.com/angular/material2/issues/10315)) ([4e48cf4](https://github.com/angular/material2/commit/4e48cf4))
* **ripple:** only persist top ripple on pointer down ([#10976](https://github.com/angular/material2/issues/10976)) ([a8d99da](https://github.com/angular/material2/commit/a8d99da)), closes [#10973](https://github.com/angular/material2/issues/10973)
* **schematics:** include 6.0.0 RC releases for migrations ([#11010](https://github.com/angular/material2/issues/11010)) ([d52bc1d](https://github.com/angular/material2/commit/d52bc1d))
* **schematics:** support basic style asset string ([#10989](https://github.com/angular/material2/issues/10989)) ([45251ff](https://github.com/angular/material2/commit/45251ff)), closes [#10912](https://github.com/angular/material2/issues/10912)
* **select,autocomplete:** mat-option theme not being applied correctly when nested inside a selector ([#10889](https://github.com/angular/material2/issues/10889)) ([1a60a7a](https://github.com/angular/material2/commit/1a60a7a))
* **slider:** truncate long decimal values ([#10959](https://github.com/angular/material2/issues/10959)) ([aa752cd](https://github.com/angular/material2/commit/aa752cd)), closes [#10951](https://github.com/angular/material2/issues/10951)
* **sort:** arrow not centered vertically inside multiline headers ([#10619](https://github.com/angular/material2/issues/10619)) ([99af109](https://github.com/angular/material2/commit/99af109)), closes [#10604](https://github.com/angular/material2/issues/10604)
* **tab:** add flex-basis hack for IE11 ([#10369](https://github.com/angular/material2/issues/10369)) ([c367e66](https://github.com/angular/material2/commit/c367e66)), closes [#10237](https://github.com/angular/material2/issues/10237)
* **table:** data source can listen for init from sort, page ([#10593](https://github.com/angular/material2/issues/10593)) ([99f39ca](https://github.com/angular/material2/commit/99f39ca))
* **tabs:** tab-nav-link disableRipple input not working ([#10643](https://github.com/angular/material2/issues/10643)) ([45e1b29](https://github.com/angular/material2/commit/45e1b29)), closes [#10636](https://github.com/angular/material2/issues/10636)
* **text-field:** autosize textarea not scrolling to end of input on firefox ([#10403](https://github.com/angular/material2/issues/10403)) ([d0a4e9f](https://github.com/angular/material2/commit/d0a4e9f)), closes [#10400](https://github.com/angular/material2/issues/10400)
* **toolbar:** improved high contrast accessibility ([#10465](https://github.com/angular/material2/issues/10465)) ([e409ec4](https://github.com/angular/material2/commit/e409ec4))
* **tree:** add theme & typography to angular-material-theme mixin ([#11015](https://github.com/angular/material2/issues/11015)) ([a292d31](https://github.com/angular/material2/commit/a292d31))
* **tree:** remove invalid aria attribute ([#10935](https://github.com/angular/material2/issues/10935)) ([a275dc1](https://github.com/angular/material2/commit/a275dc1))


### Features

* **accordion:** allow intermediate elements between accordion and expansion panel ([#11016](https://github.com/angular/material2/issues/11016)) ([85252b3](https://github.com/angular/material2/commit/85252b3))
* **cdk/keycodes:** add missing keycodes ([#10891](https://github.com/angular/material2/issues/10891)) ([c976040](https://github.com/angular/material2/commit/c976040))
* **overlay:** allow multiple classes to be assigned to the backdrop ([#10531](https://github.com/angular/material2/issues/10531)) ([540226c](https://github.com/angular/material2/commit/540226c)), closes [#10529](https://github.com/angular/material2/issues/10529)
* **paginator:** expose previousPageIndex inside PageEvent ([#10759](https://github.com/angular/material2/issues/10759)) ([85039ca](https://github.com/angular/material2/commit/85039ca)), closes [#10758](https://github.com/angular/material2/issues/10758)
* **selection-list:** add support for compareWith function ([#10501](https://github.com/angular/material2/issues/10501)) ([7747e66](https://github.com/angular/material2/commit/7747e66))
* **sidenav:** allow for auto focusing to be disabled ([#10933](https://github.com/angular/material2/issues/10933)) ([4ae63b3](https://github.com/angular/material2/commit/4ae63b3)), closes [#10402](https://github.com/angular/material2/issues/10402)
* **table:** add optional footer row ([#10330](https://github.com/angular/material2/issues/10330)) ([6df3709](https://github.com/angular/material2/commit/6df3709))
* **tree:** add level to tree node context ([#10985](https://github.com/angular/material2/issues/10985)) ([f1589db](https://github.com/angular/material2/commit/f1589db))



<a name="6.0.0-rc.12"></a>
# [6.0.0-rc.12](https://github.com/angular/material2/compare/6.0.0-rc.11...6.0.0-rc.12) (2018-04-17)


### Bug Fixes

* **breakpoint-observer:** split comma separated queries into separte queries ([#10789](https://github.com/angular/material2/issues/10789)) ([7c1549a](https://github.com/angular/material2/commit/7c1549a))
* **datepicker:** high contrast accessibility improvements ([#10363](https://github.com/angular/material2/issues/10363)) ([4d23b08](https://github.com/angular/material2/commit/4d23b08))
* **datepicker:** update popup direction if datepicker direction changes ([#10871](https://github.com/angular/material2/issues/10871)) ([4cc72b8](https://github.com/angular/material2/commit/4cc72b8))
* **directionality:** complete change event on destroy ([#10826](https://github.com/angular/material2/issues/10826)) ([b057391](https://github.com/angular/material2/commit/b057391))
* **form-field:** incorrect label position for outline style in prod mode ([#10803](https://github.com/angular/material2/issues/10803)) ([7484321](https://github.com/angular/material2/commit/7484321))
* **menu:** svg icons not aligned inside menu item ([#10837](https://github.com/angular/material2/issues/10837)) ([2af9c35](https://github.com/angular/material2/commit/2af9c35)), closes [#10832](https://github.com/angular/material2/issues/10832)
* **schematics:** correct path to ng-update entry-point ([#10850](https://github.com/angular/material2/issues/10850)) ([6a82c65](https://github.com/angular/material2/commit/6a82c65))
* **schematics:** ignore e2e projects w/ `ng add` ([#10883](https://github.com/angular/material2/issues/10883)) ([5554506](https://github.com/angular/material2/commit/5554506))
* **schematics:** make v6 migration work ([#10853](https://github.com/angular/material2/issues/10853)) ([c9f5be6](https://github.com/angular/material2/commit/c9f5be6))
* **scrolling:** complete ScrollDispatcher.scrolled on destroy ([#10794](https://github.com/angular/material2/issues/10794)) ([41be069](https://github.com/angular/material2/commit/41be069))
* **select:** open method triggered twice on click ([#7619](https://github.com/angular/material2/issues/7619)) ([991daac](https://github.com/angular/material2/commit/991daac))
* **selection-list:** toggle newly-focused item when pressing arrow key + shift ([#10828](https://github.com/angular/material2/issues/10828)) ([975fe7e](https://github.com/angular/material2/commit/975fe7e))
* **stepper:** not resetting to first step when some of the steps aren't editable ([#10804](https://github.com/angular/material2/issues/10804)) ([5df8d01](https://github.com/angular/material2/commit/5df8d01)), closes [#10801](https://github.com/angular/material2/issues/10801)
* **table:** Allow any iterable to be used as for `columns` in headerrow and row defs ([#10822](https://github.com/angular/material2/issues/10822)) ([92e5f55](https://github.com/angular/material2/commit/92e5f55))
* **tree:** make toggle non-recursive by default ([#10879](https://github.com/angular/material2/issues/10879)) ([5920bc3](https://github.com/angular/material2/commit/5920bc3))
* **stepper:** add animationDone event ([#10752](https://github.com/angular/material2/issues/10752)) ([358a12d](https://github.com/angular/material2/commit/358a12d)), closes [#9087](https://github.com/angular/material2/issues/9087)



<a name="6.0.0-rc.11"></a>
# [6.0.0-rc.11](https://github.com/angular/material2/compare/6.0.0-rc.5...6.0.0-rc.11) (2018-04-13)


### Bug Fixes

* **schematics:** Fix a number of issues with ng-update schematic for v5 -> v6 migration



<a name="6.0.0-rc.5"></a>
# [6.0.0-rc.5](https://github.com/angular/material2/compare/6.0.0-rc.4...6.0.0-rc.5) (2018-04-13)


### Bug Fixes

* **schematics:** move ng-update under correct location ([d98fb35](https://github.com/angular/material2/commit/d98fb35))



<a name="6.0.0-rc.4"></a>
# [6.0.0-rc.4](https://github.com/angular/material2/compare/6.0.0-rc.3...6.0.0-rc.4) (2018-04-13)


### Bug Fixes

* **schematics:** add ng-update config to package.json ([#10844](https://github.com/angular/material2/issues/10844)) ([0a3cfa7](https://github.com/angular/material2/commit/0a3cfa7))



<a name="6.0.0-rc.3"></a>
# [6.0.0-rc.3](https://github.com/angular/material2/compare/6.0.0-rc.2...6.0.0-rc.3) (2018-04-12)


### Bug Fixes

* **button-toggle:** selected value not being maintained when changing value while toggles are being swapped out ([#10707](https://github.com/angular/material2/issues/10707)) ([dec91ce](https://github.com/angular/material2/commit/dec91ce)), closes [#10690](https://github.com/angular/material2/issues/10690)
* **focus-monitor:** server-side rendering error when using focusVia ([#10729](https://github.com/angular/material2/issues/10729)) ([44a0a4f](https://github.com/angular/material2/commit/44a0a4f))
* **radio:** checked radio button indistinguishable in high contrast mode ([#10753](https://github.com/angular/material2/issues/10753)) ([a74099f](https://github.com/angular/material2/commit/a74099f))
* **schematics:** schematics now functioning with Angular CLI v6 ([#10703](https://github.com/angular/material2/issues/10703)) ([023e8f4](https://github.com/angular/material2/commit/023e8f4))



<a name="6.0.0-rc.2"></a>
# [6.0.0-rc.2](https://github.com/angular/material2/compare/6.0.0-rc.0...6.0.0-rc.2) (2018-04-11)


### Features

* **coercion:** add utility for coercing CSS values ([#10654](https://github.com/angular/material2/issues/10654)) ([e30824c](https://github.com/angular/material2/commit/e30824c))
* **icon:** allow SVG icons to be registered from strings ([#10757](https://github.com/angular/material2/issues/10757)) ([57efa13](https://github.com/angular/material2/commit/57efa13)), closes [#3132](https://github.com/angular/material2/issues/3132)
* **overlay:** add the ability to set the default offsets on FlexibleConnectedPositionStrategy ([#10555](https://github.com/angular/material2/issues/10555)) ([bcff93e](https://github.com/angular/material2/commit/bcff93e))
* **table:** support native table selectors ([#10594](https://github.com/angular/material2/issues/10594)) ([7774da2](https://github.com/angular/material2/commit/7774da2))


### Bug Fixes

* **autocomplete:** panel width not being updated on window resize ([#10629](https://github.com/angular/material2/issues/10629)) ([2dc4e70](https://github.com/angular/material2/commit/2dc4e70))
* **badge:** incorrectly handling rtl ([#10630](https://github.com/angular/material2/issues/10630)) ([9c1f8a9](https://github.com/angular/material2/commit/9c1f8a9))
* **button-toggle:** changed after checked error for repeated toggles with a preselected value ([#10612](https://github.com/angular/material2/issues/10612)) ([9a3d3e8](https://github.com/angular/material2/commit/9a3d3e8))
* **button-toggle:** setting blank aria-label attribute by default ([#10605](https://github.com/angular/material2/issues/10605)) ([95dba59](https://github.com/angular/material2/commit/95dba59))
* **datepicker:** avoid accidental form submissions through calendar buttons ([#10515](https://github.com/angular/material2/issues/10515)) ([edb57f9](https://github.com/angular/material2/commit/edb57f9)), closes [#10514](https://github.com/angular/material2/issues/10514)
* **datepicker:** close datepicker popup on alt + up arrow ([#10662](https://github.com/angular/material2/issues/10662)) ([446ef66](https://github.com/angular/material2/commit/446ef66))
* **datepicker:** export `MatCalendarHeader` ([#10633](https://github.com/angular/material2/issues/10633)) ([5df1af6](https://github.com/angular/material2/commit/5df1af6))
* **datepicker:** nested animation not working ([#10355](https://github.com/angular/material2/issues/10355)) ([9fff92f](https://github.com/angular/material2/commit/9fff92f)), closes [#9134](https://github.com/angular/material2/issues/9134)
* **datepicker:** overly broad selector in theme ([#10372](https://github.com/angular/material2/issues/10372)) ([5b7a6a3](https://github.com/angular/material2/commit/5b7a6a3))
* **datepicker:** reformat valid values on blur ([#10777](https://github.com/angular/material2/issues/10777)) ([603dfa4](https://github.com/angular/material2/commit/603dfa4)), closes [#10645](https://github.com/angular/material2/issues/10645)
* **focus-monitor:** hitting ngzone when using focusVia ([#10608](https://github.com/angular/material2/issues/10608)) ([b38b966](https://github.com/angular/material2/commit/b38b966))
* **focus-trap:** wrong element being checked when logging deprecation warning ([#10578](https://github.com/angular/material2/issues/10578)) ([52493d1](https://github.com/angular/material2/commit/52493d1))
* **form-field:** run change detection when prefix or suffix changes ([#10670](https://github.com/angular/material2/issues/10670)) ([515cc06](https://github.com/angular/material2/commit/515cc06))
* **form-field:** server-side rendering error with outline appearance ([#10719](https://github.com/angular/material2/issues/10719)) ([39887da](https://github.com/angular/material2/commit/39887da))
* **overlay:** centered flexible positioning not working in some browsers ([#10701](https://github.com/angular/material2/issues/10701)) ([dfc3b02](https://github.com/angular/material2/commit/dfc3b02))
* **overlay:** incorrect bottom offset using upward-flowing flexible position with a viewport margin ([#10650](https://github.com/angular/material2/issues/10650)) ([306b704](https://github.com/angular/material2/commit/306b704))
* **platform:** change isBrowser check to use Angular PLATFORM_ID ([#10659](https://github.com/angular/material2/issues/10659)) ([f023579](https://github.com/angular/material2/commit/f023579))
* **progress-spinner:** set spinner width to match diameter. ([#10314](https://github.com/angular/material2/issues/10314)) ([c64cb7e](https://github.com/angular/material2/commit/c64cb7e))
* **sidenav:** remove dependency on OverlayModule ([#10357](https://github.com/angular/material2/issues/10357)) ([27ef2dc](https://github.com/angular/material2/commit/27ef2dc))
* **slide-toggle:** run timeout outside the NgZone ([#10655](https://github.com/angular/material2/issues/10655)) ([6f7765e](https://github.com/angular/material2/commit/6f7765e))
* **stepper:** header icon collapsing with very long labels ([#10341](https://github.com/angular/material2/issues/10341)) ([5b5f2ee](https://github.com/angular/material2/commit/5b5f2ee)), closes [#10332](https://github.com/angular/material2/issues/10332)
* **stepper:** horizontal stepper cutting off bottom part of content ([#10644](https://github.com/angular/material2/issues/10644)) ([4fbde10](https://github.com/angular/material2/commit/4fbde10)), closes [#10634](https://github.com/angular/material2/issues/10634)
* **table:** MatTableDataSource incorrectly sorting zero ([#10561](https://github.com/angular/material2/issues/10561)) ([bcb5697](https://github.com/angular/material2/commit/bcb5697)), closes [#10556](https://github.com/angular/material2/issues/10556)
* **table,sort,paginator:** incorrect spacing in rtl ([#10617](https://github.com/angular/material2/issues/10617)) ([46ca6ce](https://github.com/angular/material2/commit/46ca6ce))
* **tabs:** hide mat-tab-nav-bar ink bar when no link is active ([#9701](https://github.com/angular/material2/issues/9701)) ([51206ee](https://github.com/angular/material2/commit/51206ee)), closes [#9671](https://github.com/angular/material2/issues/9671)
* **tabs:** tab content portal not being cleaned up on destroy ([#10661](https://github.com/angular/material2/issues/10661)) ([2e3393a](https://github.com/angular/material2/commit/2e3393a))
* **theme:** apply base theme classes at location the theme is included ([#10737](https://github.com/angular/material2/issues/10737)) ([2aba8ab](https://github.com/angular/material2/commit/2aba8ab))
* **tooltip:** error when updating position while closed ([#10704](https://github.com/angular/material2/issues/10704)) ([6449ae1](https://github.com/angular/material2/commit/6449ae1))
* **tree:** fix exported symbol cannot be named error. ([#10626](https://github.com/angular/material2/issues/10626)) ([6729b6d](https://github.com/angular/material2/commit/6729b6d))
* **tree:** fix nested node cannot expand/collapse multiple times ([#10671](https://github.com/angular/material2/issues/10671)) ([5570beb](https://github.com/angular/material2/commit/5570beb))
* **tree:** fix nested node is not working ([#10635](https://github.com/angular/material2/issues/10635)) ([7857b92](https://github.com/angular/material2/commit/7857b92))



<a name="6.0.0-rc.1"></a>
# [6.0.0-rc.1](https://github.com/angular/material2/compare/6.0.0-rc.0...6.0.0-rc.1) (2018-04-05)


### Bug Fixes

* **autocomplete:** panel width not being updated on window resize ([#10629](https://github.com/angular/material2/issues/10629)) ([2dc4e70](https://github.com/angular/material2/commit/2dc4e70))
* **badge:** incorrectly handling rtl ([#10630](https://github.com/angular/material2/issues/10630)) ([9c1f8a9](https://github.com/angular/material2/commit/9c1f8a9))
* **button-toggle:** changed after checked error for repeated toggles with a preselected value ([#10612](https://github.com/angular/material2/issues/10612)) ([9a3d3e8](https://github.com/angular/material2/commit/9a3d3e8))
* **button-toggle:** setting blank aria-label attribute by default ([#10605](https://github.com/angular/material2/issues/10605)) ([95dba59](https://github.com/angular/material2/commit/95dba59))
* **datepicker:** close datepicker popup on alt + up arrow ([#10662](https://github.com/angular/material2/issues/10662)) ([446ef66](https://github.com/angular/material2/commit/446ef66))
* **datepicker:** export `MatCalendarHeader` ([#10633](https://github.com/angular/material2/issues/10633)) ([5df1af6](https://github.com/angular/material2/commit/5df1af6))
* **datepicker:** overly broad selector in theme ([#10372](https://github.com/angular/material2/issues/10372)) ([5b7a6a3](https://github.com/angular/material2/commit/5b7a6a3))
* **focus-monitor:** hitting ngzone when using focusVia ([#10608](https://github.com/angular/material2/issues/10608)) ([b38b966](https://github.com/angular/material2/commit/b38b966))
* **focus-trap:** wrong element being checked when logging deprecation warning ([#10578](https://github.com/angular/material2/issues/10578)) ([52493d1](https://github.com/angular/material2/commit/52493d1))
* **form-field:** run change detection when prefix or suffix changes ([#10670](https://github.com/angular/material2/issues/10670)) ([515cc06](https://github.com/angular/material2/commit/515cc06))
* **overlay:** incorrect bottom offset using upward-flowing flexible position with a viewport margin ([#10650](https://github.com/angular/material2/issues/10650)) ([306b704](https://github.com/angular/material2/commit/306b704))
* **progress-spinner:** set spinner width to match diameter. ([#10314](https://github.com/angular/material2/issues/10314)) ([c64cb7e](https://github.com/angular/material2/commit/c64cb7e))
* **sidenav:** remove dependency on OverlayModule ([#10357](https://github.com/angular/material2/issues/10357)) ([27ef2dc](https://github.com/angular/material2/commit/27ef2dc))
* **slide-toggle:** run timeout outside the NgZone ([#10655](https://github.com/angular/material2/issues/10655)) ([6f7765e](https://github.com/angular/material2/commit/6f7765e))
* **stepper:** horizontal stepper cutting off bottom part of content ([#10644](https://github.com/angular/material2/issues/10644)) ([4fbde10](https://github.com/angular/material2/commit/4fbde10)), closes [#10634](https://github.com/angular/material2/issues/10634)
* **table,sort,paginator:** incorrect spacing in rtl ([#10617](https://github.com/angular/material2/issues/10617)) ([46ca6ce](https://github.com/angular/material2/commit/46ca6ce))
* **tabs:** tab content portal not being cleaned up on destroy ([#10661](https://github.com/angular/material2/issues/10661)) ([2e3393a](https://github.com/angular/material2/commit/2e3393a))
* **tooltip:** error when updating position while closed ([#10704](https://github.com/angular/material2/issues/10704)) ([6449ae1](https://github.com/angular/material2/commit/6449ae1))
* **tree:** fix exported symbol cannot be named error. ([#10626](https://github.com/angular/material2/issues/10626)) ([6729b6d](https://github.com/angular/material2/commit/6729b6d))
* **tree:** fix nested node cannot expand/collapse multiple times ([#10671](https://github.com/angular/material2/issues/10671)) ([5570beb](https://github.com/angular/material2/commit/5570beb))
* **tree:** fix nested node is not working ([#10635](https://github.com/angular/material2/issues/10635)) ([7857b92](https://github.com/angular/material2/commit/7857b92))


### Features

* **coercion:** add utility for coercing CSS values ([#10654](https://github.com/angular/material2/issues/10654)) ([e30824c](https://github.com/angular/material2/commit/e30824c))
* **overlay:** add the ability to set the default offsets on FlexibleConnectedPositionStrategy ([#10555](https://github.com/angular/material2/issues/10555)) ([bcff93e](https://github.com/angular/material2/commit/bcff93e))
* **table:** support native table selectors ([#10594](https://github.com/angular/material2/issues/10594)) ([7774da2](https://github.com/angular/material2/commit/7774da2))



<a name="6.0.0-rc.0"></a>
# [6.0.0-rc.0](https://github.com/angular/material2/compare/6.0.0-beta-5...6.0.0-rc.0) (2018-03-29)

### Known issues
* MatButtonToggleGroup causes ExpressionChangedAfterItHasBeenCheckedError ([#10607](https://github.com/angular/material2/issues/10607))
* focus-trap: wrong element being checked when logging deprecation warning ([#10578](https://github.com/angular/material2/pull/10578))


### Bug Fixes

* **bottom-sheet:** handle overflowing content ([#10533](https://github.com/angular/material2/issues/10533)) ([cb6d469](https://github.com/angular/material2/commit/cb6d469))
* **datepicker:** add back MAT_DATE_LOCALE_PROVIDER ([#10602](https://github.com/angular/material2/issues/10602)) ([7fd7ad3](https://github.com/angular/material2/commit/7fd7ad3))
* **datepicker:** incorrect icon color ([#10458](https://github.com/angular/material2/issues/10458)) ([4e298a6](https://github.com/angular/material2/commit/4e298a6))
* **datepicker:** set canPush to false for position strategy ([#10609](https://github.com/angular/material2/issues/10609)) ([67c7348](https://github.com/angular/material2/commit/67c7348))
* **drawer:** better handling of high contrast mode ([#10418](https://github.com/angular/material2/issues/10418)) ([ff2860f](https://github.com/angular/material2/commit/ff2860f))
* **input:** inaccurate textarea check during server-side render ([#10467](https://github.com/angular/material2/issues/10467)) ([dda1d04](https://github.com/angular/material2/commit/dda1d04))
* **overlay:** CdkConnectedOverlay ignoring offset from position config ([#10451](https://github.com/angular/material2/issues/10451)) ([1659004](https://github.com/angular/material2/commit/1659004))
* **select:** MatOption state change stream not being completed ([#10540](https://github.com/angular/material2/issues/10540)) ([b8bb62f](https://github.com/angular/material2/commit/b8bb62f))
* **slider:** unable to slide to max value under certain conditions ([#10364](https://github.com/angular/material2/issues/10364)) ([d50fd3d](https://github.com/angular/material2/commit/d50fd3d)), closes [#10148](https://github.com/angular/material2/issues/10148)
* **sort:** add aria-sort to host when sorted ([#6891](https://github.com/angular/material2/issues/6891)) ([63f713f](https://github.com/angular/material2/commit/63f713f))
* **tree:** fix the MatTreeNodeOutlet not exported issue ([#10581](https://github.com/angular/material2/issues/10581)) ([0b8240c](https://github.com/angular/material2/commit/0b8240c))
* **tree:** improve nested tree node & fix nested tree control ([#10454](https://github.com/angular/material2/issues/10454)) ([2ddc257](https://github.com/angular/material2/commit/2ddc257))


### Features

* **cdk/keycodes:** add 0 and 9 numerical keypad codes ([#10562](https://github.com/angular/material2/issues/10562)) ([d5cd0d6](https://github.com/angular/material2/commit/d5cd0d6))
* **stepper:** allow number icon to be customized and expose template context variables ([#10516](https://github.com/angular/material2/issues/10516)) ([946fd84](https://github.com/angular/material2/commit/946fd84)), closes [#10513](https://github.com/angular/material2/issues/10513)
* **tabs:** Allow tab ink bar positioning to be determined with a provided method. ([#9972](https://github.com/angular/material2/issues/9972)) ([02f5256](https://github.com/angular/material2/commit/02f5256))
* **tooltip:** allow for position to be updated while open ([#10362](https://github.com/angular/material2/issues/10362)) ([04045d2](https://github.com/angular/material2/commit/04045d2))



<a name="6.0.0-beta.5"></a>
# [6.0.0-beta.5](https://github.com/angular/material2/compare/5.2.4...6.0.0-beta.5) (2018-03-23)

This release contains many breaking changes due to the deletion of deprecated targets. We are
currently working on a tool that will help migrate your app if you are affected by these changes.
We expect to have the tool ready when we release version 6.0.0.


### BREAKING CHANGES

* **typography:**  The `$mat-font-family` variable has been removed. Use the Material typography or redeclare in your project `$mat-font-family: Roboto, 'Helvetica Neue', sans-serif;`.
* **datepicker:**  `MatDatePicker` now requires an animations module to be loaded
* **datepicker:**  `selectedChanged` has been removed. Use `dateChange` or `dateInput` from `MatDatepickerInput`.
* **button-toggle:**  `selected` is no longer an input and is now readonly.
* **snack-bar:**  `SHOW_ANIMATION` has been removed.
* `HIDE_ANIMATION` has been removed.
* **icon:**  The `_document` parameter in the `MatIconRegistry` constructor is now required.
* **list:**  `selectionChange` on the `MatListOption`, which was deprecated in 5.0.0 has been removed. Use `selectionChange` on the `MatSelectionList` instead.
* `MatListOptionChange` which was deprecated in 5.0.0 has been removed.
* **slider:**  `thumb-label` which was deprecated in 5.0.0 has been removed. Use `thumbLabel` instead.
* `tick-interval` which was deprecated in 5.0.0 has been removed. Use `tickInterval` instead.
* **tooltip:**  `tooltip-position` which was deprecated in 5.0.0 has been removed. Use `matTooltipPosition` instead.
* The `_defaultOptions` parameter in the `MatTooltip` constructor is now required.
* **select:**  `onOpen`, which was deprecated in 5.0.0, has been removed.
* `onClose`, which was deprecated in 5.0.0, has been removed.
* `change`, which was deprecated in 5.0.0, has been removed.
* **chips:**  `remove` which was deprecated in 5.0.0 has been removed. Use `removed` instead.
* `destroy` which was deprecated in 5.0.0 has been removed. Use `destroyed` instead.
* **text-field:**  The `_ngZone` parameter in the `CdkTextareaAutosize` constructor is now required.
* **sidenav:**  The `MatDrawerToggleResult` class has been turned into an type.
* The promise returned from `open`, `close` and `toggle` now resolves with the `MatDrawerToggleResult` type rather than the class.
* `align` which was deprecated in 5.0.0 has been removed. Use `position` instead.
* `open` which was deprecated in 5.0.0 has been removed. Use `opened` instead.
* `close` which was deprecated in 5.0.0 has been removed. Use `closed` instead.
* `align-changed` which was deprecated in 5.0.0 has been removed. Use `positionChanged`.
* **form-field:** - dividerColor which was deprecated in 5.0.0 has been removed. Use color instead.
- floatPlaceholder which was deprecated in 5.0.0 has been removed. Use floatLabel instead.
* **overlay:**  `ConnectedOverlayDirective` which was deprecated in 5.0.0 has been removed. Use `CdkConnectedOverlay` instead.
* `OverlayOrigin` which was deprecated in 5.0.0 has been removed. Use `CdkOverlayOrigin` instead.
* `hasBackdrop` which was deprecated in 5.0.0 has been removed. Use `cdkConnectedOverlayHasBackdrop` instead.
* `open` which was deprecated in 5.0.0 has been removed. Use `cdkConnectedOverlayOpen` instead.
* `scrollStrategy` which was deprecated in 5.0.0 has been removed. Use `cdkConnectedOverlayScrollStrategy` instead.
* `backdropClass` which was deprecated in 5.0.0 has been removed. Use `cdkConnectedOverlayBackdropClass` instead.
* `minHeight` which was deprecated in 5.0.0 has been removed. Use `cdkConnectedOverlayMinHeight` instead.
* `minWidth` which was deprecated in 5.0.0 has been removed. Use `cdkConnectedOverlayMinWidth` instead.
* `height` which was deprecated in 5.0.0 has been removed. Use `cdkConnectedOverlayHeight` instead.
* `width` which was deprecated in 5.0.0 has been removed. Use `cdkConnectedOverlayWidth` instead.
* `offsetX` which was deprecated in 5.0.0 has been removed. Use `cdkConnectedOverlayOffsetX` instead.
* `offsetY` which was deprecated in 5.0.0 has been removed. Use `cdkConnectedOverlayOffsetY` instead.
* `positions` which was deprecated in 5.0.0 has been removed. Use `cdkConnectedOverlayPositions` instead.
* `origin` which was deprecated in 5.0.0 has been removed. Use `cdkConnectedOverlayOrigin` instead.
* **tabs:**  `mat-dynamic-height` which was deprecated in 5.0.0 has been removed. Use `dynamicHeight` instead.
* `selectChange` which was deprecated in 5.0.0 has been removed. Use `selectedTabChange`.
* **checkbox:**  `align` which was deprecated in 5.0.0 has been removed. Use `labelPosition` instead. Note that the values are different.
* **form-field:** - The following deprecated CSS classes have been removed:
  - mat-input-container instead use mat-form-field
  - mat-input-invalid instead use mat-form-field-invalid
  - mat-input-wrapper instead use mat-form-field-wrapper
  - mat-input-flex instead use mat-form-field-flex
  - mat-input-prefix instead use mat-form-field-prefix
  - mat-input-infix instead use mat-form-field-infix
  - mat-input-placeholder-wrapper instead use mat-form-field-label-wrapper
  - mat-input-placeholder instead use mat-form-field-label
  - mat-input-suffix instead use mat-form-field-suffix
  - mat-input-underline instead use mat-form-field-underline
  - mat-input-ripple instead use mat-form-field-ripple
  - mat-input-subscript-wrapper instead use mat-form-field-subscript-wrapper
  - mat-input-hint-wrapper instead use mat-form-field-hint-wrapper
  - mat-input-hint-spacer instead use mat-form-field-hint-spacer
  - mat-form-field-placeholder-wrapper instead use mat-form-field-label-wrapper
  - mat-form-field-placeholder instead use mat-form-field-label
* **a11y:**  The `renderer` parameter in `FocusMonitor.monitor` has been removed.
* `cdk-focus-trap` which was deprecated in 5.0.0 has been removed. Use `cdkTrapFocus` instead.
* **autocomplete:**  The `defaults` parameter in the `MatAutocomplete` constructor is now required.
* **form-field:**  MatFormFieldControl.shouldPlaceholderFloat which was deprecated in 5.0.0 has been removed. * MatFormFieldControl.shouldLabelFloat is no longer optional and should be used instead.
* `FloatPlaceholderType` which was deprecated in 5.0.0 has been removed. Use `FloatLabelType` instead.
* `PlaceholderOptions` which was deprecated in 5.0.0 has been removed. Use `LabelOptions` instead.
* `MAT_PLACEHOLDER_GLOBAL_OPTIONS` which was deprecated in 5.0.0 has been removed. Use `MAT_LABEL_GLOBAL_OPTIONS` instead.
* **snack-bar:**  `extraClasses` which was deprecated in 5.0.0 has been removed. Use `panelClass` instead.
* **portal:**  The `portalHost` and `cdkPortalHost` inputs which were deprecated in 5.0.0 have been removed. Use `cdkPortalOutlet` instead.


### Features

* **button-toggle:** general component cleanup and support value input in multiple mode ([#9191](https://github.com/angular/material2/issues/9191)) ([a403bac](https://github.com/angular/material2/commit/a403bac)), closes [#2773](https://github.com/angular/material2/issues/2773) [#2773](https://github.com/angular/material2/issues/2773) [#9058](https://github.com/angular/material2/issues/9058)
* **cdk:** switch injectables to new scope API ([#10301](https://github.com/angular/material2/issues/10301)) ([6405da9](https://github.com/angular/material2/commit/6405da9))
* **cdk-input:** move input autofill and autosize utils into cdk ([#9831](https://github.com/angular/material2/issues/9831)) ([ced9c90](https://github.com/angular/material2/commit/ced9c90))
* **chips:** allow for separatorKeyCodes to be configured globally ([#10264](https://github.com/angular/material2/issues/10264)) ([3c8a498](https://github.com/angular/material2/commit/3c8a498)), closes [#10256](https://github.com/angular/material2/issues/10256)
* **datepicker:** add animation to calendar popup ([#8999](https://github.com/angular/material2/issues/8999)) ([c42549e](https://github.com/angular/material2/commit/c42549e))
* **datepicker:** Add Custom Header to DatePicker ([#9639](https://github.com/angular/material2/issues/9639)) ([4e1bb26](https://github.com/angular/material2/commit/4e1bb26))
* **form-field:** allow setting default appearance via provider ([#9815](https://github.com/angular/material2/issues/9815)) ([158b1db](https://github.com/angular/material2/commit/158b1db))
* **icon:** add input for inline styling of icons ([#9984](https://github.com/angular/material2/issues/9984)) ([be1fc08](https://github.com/angular/material2/commit/be1fc08))
* **icon:** add utility to mirror icons in RTL ([#10327](https://github.com/angular/material2/issues/10327)) ([11a3fe1](https://github.com/angular/material2/commit/11a3fe1)), closes [#10045](https://github.com/angular/material2/issues/10045)
* **material:** use scoped injectables ([#10507](https://github.com/angular/material2/issues/10507)) ([f7b5d34](https://github.com/angular/material2/commit/f7b5d34))
* **overlay:** add support for flexible connected positioning ([#9153](https://github.com/angular/material2/issues/9153)) ([27e5f6e](https://github.com/angular/material2/commit/27e5f6e)), closes [#6534](https://github.com/angular/material2/issues/6534) [#2725](https://github.com/angular/material2/issues/2725) [#5267](https://github.com/angular/material2/issues/5267)
* **schematics:** dashboard schematic ([#10011](https://github.com/angular/material2/issues/10011)) ([6273d6a](https://github.com/angular/material2/commit/6273d6a))
* **schematics:** navigation schematic ([#10009](https://github.com/angular/material2/issues/10009)) ([279c112](https://github.com/angular/material2/commit/279c112))
* **schematics:** table schematic ([#10012](https://github.com/angular/material2/issues/10012)) ([e7533a5](https://github.com/angular/material2/commit/e7533a5))
* **tabs:** support stretched tabs in mat-tab-nav-bar ([#10368](https://github.com/angular/material2/issues/10368)) ([89ea485](https://github.com/angular/material2/commit/89ea485)), closes [#8871](https://github.com/angular/material2/issues/8871)


### Bug Fixes

* **badge:** invalid style declaration and too broad transition ([#10433](https://github.com/angular/material2/issues/10433)) ([c14cf7c](https://github.com/angular/material2/commit/c14cf7c))
* **bottom-sheet:** error when attempting to open multiple instances quickly ([#10147](https://github.com/angular/material2/issues/10147)) ([34e96f5](https://github.com/angular/material2/commit/34e96f5))
* **button:** theme font color being overwritten ([#9771](https://github.com/angular/material2/issues/9771)) ([c3a8d0c](https://github.com/angular/material2/commit/c3a8d0c)), closes [#4614](https://github.com/angular/material2/issues/4614) [#9231](https://github.com/angular/material2/issues/9231) [#9634](https://github.com/angular/material2/issues/9634)
* **checkbox:** setting blank aria-label by default ([#10281](https://github.com/angular/material2/issues/10281)) ([c12d7c4](https://github.com/angular/material2/commit/c12d7c4))
* **chip-list:** set key manager active index to -1 when blurred ([#10335](https://github.com/angular/material2/issues/10335)) ([b10fff4](https://github.com/angular/material2/commit/b10fff4))
* **chips:** form field label pointing to non-existing elements ([#9908](https://github.com/angular/material2/issues/9908)) ([9337ae1](https://github.com/angular/material2/commit/9337ae1))
* **datepicker:** server-side rendering error for disabled input ([#10249](https://github.com/angular/material2/issues/10249)) ([af4fc9b](https://github.com/angular/material2/commit/af4fc9b)), closes [#10248](https://github.com/angular/material2/issues/10248)
* **icon:** namespace error when registering an icon on the server ([#10175](https://github.com/angular/material2/issues/10175)) ([498534b](https://github.com/angular/material2/commit/498534b)), closes [#10170](https://github.com/angular/material2/issues/10170)
* **input:** setting blank placeholder by default ([#10277](https://github.com/angular/material2/issues/10277)) ([889a9f2](https://github.com/angular/material2/commit/889a9f2))
* **overlay:** clear last calculated position when new set of positions is provided ([#10462](https://github.com/angular/material2/issues/10462)) ([cdb6e40](https://github.com/angular/material2/commit/cdb6e40)), closes [#10457](https://github.com/angular/material2/issues/10457)
* **overlay:** incorrect bounding box bottom position when page is scrolled and content is flowing upwards ([#10463](https://github.com/angular/material2/issues/10463)) ([1dd8a27](https://github.com/angular/material2/commit/1dd8a27))
* **overlay:** incorrect bounding box styles if position is exactly zero ([#10470](https://github.com/angular/material2/issues/10470)) ([eefa9c4](https://github.com/angular/material2/commit/eefa9c4))
* **overlay:** opaque backdrop appearing solid in high contrast mode ([#10252](https://github.com/angular/material2/issues/10252)) ([8366ec6](https://github.com/angular/material2/commit/8366ec6))
* **select:** scroll strategy token cannot inject overlay ([#10535](https://github.com/angular/material2/issues/10535)) ([3eb71c2](https://github.com/angular/material2/commit/3eb71c2))
* **table:** move padding from rows to cells ([#10499](https://github.com/angular/material2/issues/10499)) ([e0321db](https://github.com/angular/material2/commit/e0321db))
* **tree:** fix mat-tree paddings ([#10349](https://github.com/angular/material2/issues/10349)) ([d065aea](https://github.com/angular/material2/commit/d065aea))
* **tree:** invalid style declaration during server-side rendering ([#10326](https://github.com/angular/material2/issues/10326)) ([c205749](https://github.com/angular/material2/commit/c205749)), closes [#10131](https://github.com/angular/material2/issues/10131)


### Code Refactoring

* **a11y:** remove 6.0.0 deletion targets ([#10325](https://github.com/angular/material2/issues/10325)) ([7a42c35](https://github.com/angular/material2/commit/7a42c35))
* **autocomplete:** remove 6.0.0 deletion targets ([#10319](https://github.com/angular/material2/issues/10319)) ([0af5bca](https://github.com/angular/material2/commit/0af5bca))
* **button-toggle:** remove 6.0.0 deletion targets ([#10416](https://github.com/angular/material2/issues/10416)) ([f0bf6e7](https://github.com/angular/material2/commit/f0bf6e7))
* **checkbox:** remove 6.0.0 deletion targets ([#10342](https://github.com/angular/material2/issues/10342)) ([9f8eec1](https://github.com/angular/material2/commit/9f8eec1))
* **chips:** remove 6.0.0 deletion targets ([#10311](https://github.com/angular/material2/issues/10311)) ([1a8106d](https://github.com/angular/material2/commit/1a8106d))
* **datepicker:** remove 6.0.0 deletion targets ([#10413](https://github.com/angular/material2/issues/10413)) ([8bc7ee9](https://github.com/angular/material2/commit/8bc7ee9))
* **form-field:** remove deprecated @Inputs ([#10294](https://github.com/angular/material2/issues/10294)) ([f133da9](https://github.com/angular/material2/commit/f133da9)), closes [#10164](https://github.com/angular/material2/issues/10164)
* **form-field:** remove deprecated CSS classes ([#10296](https://github.com/angular/material2/issues/10296)) ([aa2356d](https://github.com/angular/material2/commit/aa2356d))
* **form-field:** remove deprecated placeholder options. ([#10291](https://github.com/angular/material2/issues/10291)) ([26ee3e7](https://github.com/angular/material2/commit/26ee3e7))
* **icon:** remove 6.0.0 deletion targets ([#10389](https://github.com/angular/material2/issues/10389)) ([e8af5ae](https://github.com/angular/material2/commit/e8af5ae))
* **list:** remove 6.0.0 deletion targets ([#10398](https://github.com/angular/material2/issues/10398)) ([d8a365e](https://github.com/angular/material2/commit/d8a365e))
* **overlay:** remove 6.0.0 deletion targets ([#10161](https://github.com/angular/material2/issues/10161)) ([54252d5](https://github.com/angular/material2/commit/54252d5))
* **portal:** remove 6.0.0 deletion targets ([#10257](https://github.com/angular/material2/issues/10257)) ([88abd9e](https://github.com/angular/material2/commit/88abd9e))
* **select:** remove 6.0.0 deletion targets ([#10163](https://github.com/angular/material2/issues/10163)) ([2b745c4](https://github.com/angular/material2/commit/2b745c4))
* **sidenav:** remove 6.0.0 deletion targets ([#10279](https://github.com/angular/material2/issues/10279)) ([c1d4666](https://github.com/angular/material2/commit/c1d4666))
* **slider:** remove 6.0.0 deletion targets ([#10373](https://github.com/angular/material2/issues/10373)) ([c8cc414](https://github.com/angular/material2/commit/c8cc414))
* **snack-bar:** remove 6.0.0 deletion targets ([#10253](https://github.com/angular/material2/issues/10253)) ([88bb6f3](https://github.com/angular/material2/commit/88bb6f3))
* **snack-bar:** remove overly broad animation variables ([#10405](https://github.com/angular/material2/issues/10405)) ([9f3bf27](https://github.com/angular/material2/commit/9f3bf27))
* **tabs:** remove 6.0.0 deletion targets ([#10309](https://github.com/angular/material2/issues/10309)) ([4d05cda](https://github.com/angular/material2/commit/4d05cda))
* **text-field:** make constructor parameters required ([#10431](https://github.com/angular/material2/issues/10431)) ([5e5aae3](https://github.com/angular/material2/commit/5e5aae3))
* **tooltip:** remove 6.0.0 deletion targets ([#10344](https://github.com/angular/material2/issues/10344)) ([999cb57](https://github.com/angular/material2/commit/999cb57))
* **typography:** remove deprecated variable ([#10430](https://github.com/angular/material2/issues/10430)) ([9a1ae9c](https://github.com/angular/material2/commit/9a1ae9c))


<a name="6.0.0-beta.4"></a>
# [6.0.0-beta.4](https://github.com/angular/material2/compare/6.0.0-beta-2...6.0.0-beta.4) (2018-03-05)

### Highlights

* New tree component! The base behavior lives in `@angular/cdk` with Material Design flavors in
  `@angular/material`.


### Bug Fixes

* **button:** hide overflow of buttons to prevent overflow of hover/ripple ([#9424](https://github.com/angular/material2/issues/9424)) ([915a2b7](https://github.com/angular/material2/commit/915a2b7))
* avoid layout jumping on elements with ripples in RTL ([#10026](https://github.com/angular/material2/issues/10026)) ([900716a](https://github.com/angular/material2/commit/900716a))
* **chips:** Update chips in chip list, and add margin to chip input ([#8579](https://github.com/angular/material2/issues/8579)) ([67e710c](https://github.com/angular/material2/commit/67e710c))
* **datepicker:** improve native adapter DST handling ([#10068](https://github.com/angular/material2/issues/10068)) ([2fad732](https://github.com/angular/material2/commit/2fad732))
* **dialog:** actions not being pulled down when trapping focus ([#10007](https://github.com/angular/material2/issues/10007)) ([8a402d0](https://github.com/angular/material2/commit/8a402d0)), closes [#9722](https://github.com/angular/material2/issues/9722)
* **dialog:** don't provide directionality if user injector has one already ([#10004](https://github.com/angular/material2/issues/10004)) ([e3d7aec](https://github.com/angular/material2/commit/e3d7aec))
* **expansion-panel:** entire body content being shown on animation start ([#10138](https://github.com/angular/material2/issues/10138)) ([b4b76bd](https://github.com/angular/material2/commit/b4b76bd)), closes [#10134](https://github.com/angular/material2/issues/10134)
* **grid-list:** default to LTR when Directionality value is empty ([#10111](https://github.com/angular/material2/issues/10111)) ([64ef3a8](https://github.com/angular/material2/commit/64ef3a8))
* **grid-list:** invalid style declaration during server-side rendering ([#10131](https://github.com/angular/material2/issues/10131)) ([a27d9df](https://github.com/angular/material2/commit/a27d9df))
* **list:** align avatar size in dense list with spec ([#10028](https://github.com/angular/material2/issues/10028)) ([d4a4f61](https://github.com/angular/material2/commit/d4a4f61)), closes [#10019](https://github.com/angular/material2/issues/10019)
* **list-key-manager:** not ignoring vertical key events in horizontal-only mode ([#10075](https://github.com/angular/material2/issues/10075)) ([ffbb425](https://github.com/angular/material2/commit/ffbb425))
* **menu:** detach lazily-rendered content when the menu is closed ([#10005](https://github.com/angular/material2/issues/10005)) ([bb1803d](https://github.com/angular/material2/commit/bb1803d)), closes [#9915](https://github.com/angular/material2/issues/9915)
* **overlay:** hide overlay container when there are no attached overlays ([#10139](https://github.com/angular/material2/issues/10139)) ([4b528f6](https://github.com/angular/material2/commit/4b528f6)), closes [#6882](https://github.com/angular/material2/issues/6882) [#10033](https://github.com/angular/material2/issues/10033)
* **paginator:** first/last icons being thrown off on IE and Edge; simplify icon setup ([#9776](https://github.com/angular/material2/issues/9776)) ([dd082cb](https://github.com/angular/material2/commit/dd082cb))
* **select:** animation jumping on IE11 ([#10050](https://github.com/angular/material2/issues/10050)) ([a5909db](https://github.com/angular/material2/commit/a5909db))
* **selection-list:** improve accessibility of selection list ([#10137](https://github.com/angular/material2/issues/10137)) ([51fce51](https://github.com/angular/material2/commit/51fce51)), closes [#9995](https://github.com/angular/material2/issues/9995)
* **selection-list:** repeated preselected items not appearing as selected with OnPush parent ([#10100](https://github.com/angular/material2/issues/10100)) ([cdd224a](https://github.com/angular/material2/commit/cdd224a)), closes [#10090](https://github.com/angular/material2/issues/10090)
* **tree:** fix type error in tree ([#10095](https://github.com/angular/material2/issues/10095)) ([6d94aec](https://github.com/angular/material2/commit/6d94aec))


### Features

* **list-key-manager:** accept item references in setActiveItem ([#10029](https://github.com/angular/material2/issues/10029)) ([92ed9c8](https://github.com/angular/material2/commit/92ed9c8))
* **menu:** allow for backdrop class to be customized ([#10097](https://github.com/angular/material2/issues/10097)) ([2ece035](https://github.com/angular/material2/commit/2ece035)), closes [#10062](https://github.com/angular/material2/issues/10062)
* **menu:** allow for backdrop to be disabled ([#10070](https://github.com/angular/material2/issues/10070)) ([e42f0bc](https://github.com/angular/material2/commit/e42f0bc)), closes [#9938](https://github.com/angular/material2/issues/9938)
* **snack-bar:** add injection token for overriding the default options ([#9849](https://github.com/angular/material2/issues/9849)) ([a943b36](https://github.com/angular/material2/commit/a943b36)), closes [#9821](https://github.com/angular/material2/issues/9821)
* **stepper:** require users to visit non-optional steps ([#10048](https://github.com/angular/material2/issues/10048)) ([77c8d8f](https://github.com/angular/material2/commit/77c8d8f))
* **tree:** merge tree branch to master ([#9796](https://github.com/angular/material2/issues/9796)) ([c975ca8](https://github.com/angular/material2/commit/c975ca8))



<a name="6.0.0-beta.3"></a>
# [6.0.0-beta.3](https://github.com/angular/material2/compare/6.0.0-beta-2...6.0.0-beta.3) (2018-02-27)


### Bug Fixes

* **select:** animation jumping on IE11 ([#10050](https://github.com/angular/material2/issues/10050)) ([a5909db](https://github.com/angular/material2/commit/a5909db))
* **tree:** fix type error in tree ([#10095](https://github.com/angular/material2/issues/10095)) ([6d94aec](https://github.com/angular/material2/commit/6d94aec))


### Features

* **menu:** allow for backdrop class to be customized ([#10097](https://github.com/angular/material2/issues/10097)) ([2ece035](https://github.com/angular/material2/commit/2ece035)), closes [#10062](https://github.com/angular/material2/issues/10062)
* **tree:** merge tree branch to master ([#9796](https://github.com/angular/material2/issues/9796)) ([c975ca8](https://github.com/angular/material2/commit/c975ca8))



<a name="6.0.0-beta.2"></a>
# [6.0.0-beta.2](https://github.com/angular/material2/compare/6.0.0-beta-0...6.0.0-beta.2) (2018-02-21)


### Bug Fixes

* **badge:** AoT and server-side rendering errors ([#9935](https://github.com/angular/material2/issues/9935)) ([06b4017](https://github.com/angular/material2/commit/06b4017))
* **badge:** hard to see in high contrast mode ([#9973](https://github.com/angular/material2/issues/9973)) ([1b2f90c](https://github.com/angular/material2/commit/1b2f90c))
* **badge:** incorrectly setting aria-describedby ([#9957](https://github.com/angular/material2/issues/9957)) ([aed7e8a](https://github.com/angular/material2/commit/aed7e8a))
* **badge:** move styles into the theme mixin ([#9999](https://github.com/angular/material2/issues/9999)) ([00a6c90](https://github.com/angular/material2/commit/00a6c90))
* **badge:** remove top-level ampersand selectors from theme mixin ([#9991](https://github.com/angular/material2/issues/9991)) ([bd7a408](https://github.com/angular/material2/commit/bd7a408)), closes [#9990](https://github.com/angular/material2/issues/9990)
* **bottom-sheet:** inject correct directionality in child components ([#9996](https://github.com/angular/material2/issues/9996)) ([9d784a0](https://github.com/angular/material2/commit/9d784a0))
* **button:** inconsistent overflow value between browsers ([#9933](https://github.com/angular/material2/issues/9933)) ([9d19291](https://github.com/angular/material2/commit/9d19291))
* **chips:** Fix chip and chip list selectable ([#9955](https://github.com/angular/material2/issues/9955)) ([949a69b](https://github.com/angular/material2/commit/949a69b))
* **expansion-panel,menu,select:** nested animations not working ([#9134](https://github.com/angular/material2/issues/9134)) ([1e2b79a](https://github.com/angular/material2/commit/1e2b79a)), closes [#8814](https://github.com/angular/material2/issues/8814) [#8953](https://github.com/angular/material2/issues/8953)
* **input:** AutofillMonitor stream not being completed when stopping monitoring ([#9886](https://github.com/angular/material2/issues/9886)) ([87bbfc5](https://github.com/angular/material2/commit/87bbfc5))
* **overlay:** default to global directionality ([#9994](https://github.com/angular/material2/issues/9994)) ([47674f1](https://github.com/angular/material2/commit/47674f1)), closes [#9817](https://github.com/angular/material2/issues/9817)
* **tooltip:** memory leak in _setTooltipMessage ([#6782](https://github.com/angular/material2/issues/6782)) ([66a01fb](https://github.com/angular/material2/commit/66a01fb))

### Features

* **button-toggle** add ripples to button-toggle ([#9891](https://github.com/angular/material2/issues/9891)) ([53417d4](https://github.com/angular/material2/commit/53417d4)), closes [#9442](https://github.com/angular/material2/issues/9442)
* **autocomplete:** add opened/closed events to panel ([#9904](https://github.com/angular/material2/issues/9904)) ([82c5ff0](https://github.com/angular/material2/commit/82c5ff0)), closes [#9894](https://github.com/angular/material2/issues/9894)
* **badge:** add badge component ([#7483](https://github.com/angular/material2/issues/7483)) ([c98d217](https://github.com/angular/material2/commit/c98d217))
* **bottom-sheet:** add result param when dismissing bottom sheet ([#9810](https://github.com/angular/material2/issues/9810)) ([98a6910](https://github.com/angular/material2/commit/98a6910))
* **datepicker:** add theming support ([#9407](https://github.com/angular/material2/issues/9407)) ([0383704](https://github.com/angular/material2/commit/0383704))
* **drawer:** allow for backdrop to be disabled ([#9381](https://github.com/angular/material2/issues/9381)) ([6d4e052](https://github.com/angular/material2/commit/6d4e052)), closes [#5300](https://github.com/angular/material2/issues/5300)
* **schematics:** add material scaffolding schematic ([#9883](https://github.com/angular/material2/issues/9883)) ([45399c6](https://github.com/angular/material2/commit/45399c6))
* **typography:** add letter-spacing configuration to typography configs. ([#9932](https://github.com/angular/material2/issues/9932)) ([f30609c](https://github.com/angular/material2/commit/f30609c))



<a name="6.0.0-beta.1"></a>
# [6.0.0-beta.1](https://github.com/angular/material2/compare/5.2.0...6.0.0-beta-0) (2018-02-12)

* Fix typo in version name (using a dash instead of a dot)
* Update Angular peer dependency to 6.0.0-beta.x

<a name="6.0.0-beta-0"></a>
# [6.0.0-beta-0](https://github.com/angular/material2/compare/5.2.0...6.0.0-beta-0) (2018-02-12)


### Bug Fixes

* **overlay:** validate that ConnectedPositionStrategy positions are passed in correctly at runtime ([#9466](https://github.com/angular/material2/issues/9466)) ([6a8ce02](https://github.com/angular/material2/commit/6a8ce02))


### Features

* add bottom sheet component ([#9764](https://github.com/angular/material2/issues/9764)) ([bbf62cd](https://github.com/angular/material2/commit/bbf62cd))
* **datepicker:** @Output for year and month selected in multiyear/year ([#9678](https://github.com/angular/material2/issues/9678)) ([c2e108e](https://github.com/angular/material2/commit/c2e108e))
* **expansion:** add accordion expand/collapse all ([#6929](https://github.com/angular/material2/issues/6929)) ([#7461](https://github.com/angular/material2/issues/7461)) ([3aceb73](https://github.com/angular/material2/commit/3aceb73))
* **form-field, chip:** merge new form-field and chip features to master ([#9762](https://github.com/angular/material2/issues/9762)) ([4a5287c](https://github.com/angular/material2/commit/4a5287c)), closes [#9743](https://github.com/angular/material2/issues/9743) [#9759](https://github.com/angular/material2/issues/9759) [#9767](https://github.com/angular/material2/issues/9767)
* **schematics:** add initial schematics utils ([#9451](https://github.com/angular/material2/issues/9451)) ([673d56e](https://github.com/angular/material2/commit/673d56e))
* **tabs:** add ability to lazy load tab content ([#8921](https://github.com/angular/material2/issues/8921)) ([6feaf62](https://github.com/angular/material2/commit/6feaf62))



<a name="5.2.5"></a>
# [5.2.5 cardboard-kangaroo](https://github.com/angular/material2/compare/5.2.4...5.2.5) (2018-04-17)


### Highlights
* Tweak peer deps to avoid warnings when updating Angular to 6.0



<a name="5.2.4"></a>
# [5.2.4 ash-submarine](https://github.com/angular/material2/compare/5.2.3...5.2.4) (2018-03-06)


### Bug Fixes

* **chips:** Update chips in chip list, and add margin to chip input ([#8579](https://github.com/angular/material2/issues/8579)) ([3074b45](https://github.com/angular/material2/commit/3074b45))
* **expansion-panel:** entire body content being shown on animation start ([#10138](https://github.com/angular/material2/issues/10138)) ([35b66f9](https://github.com/angular/material2/commit/35b66f9)), closes [#10134](https://github.com/angular/material2/issues/10134)
* **menu:** detach lazily-rendered content when the menu is closed ([#10005](https://github.com/angular/material2/issues/10005)) ([37b1a09](https://github.com/angular/material2/commit/37b1a09)), closes [#9915](https://github.com/angular/material2/issues/9915)
* **menu:** Fix [#10005](https://github.com/angular/material2/issues/10005) lint error ([c8ca770](https://github.com/angular/material2/commit/c8ca770))
* **overlay:** hide overlay container when there are no attached overlays ([#10139](https://github.com/angular/material2/issues/10139)) ([d0bc91d](https://github.com/angular/material2/commit/d0bc91d)), closes [#6882](https://github.com/angular/material2/issues/6882) [#10033](https://github.com/angular/material2/issues/10033)
* **paginator:** first/last icons being thrown off on IE and Edge; simplify icon setup ([#9776](https://github.com/angular/material2/issues/9776)) ([85f9491](https://github.com/angular/material2/commit/85f9491))
* **selection-list:** improve accessibility of selection list ([#10137](https://github.com/angular/material2/issues/10137)) ([cbe11d4](https://github.com/angular/material2/commit/cbe11d4)), closes [#9995](https://github.com/angular/material2/issues/9995)


<a name="5.2.3"></a>
# [5.2.3 diamond-silhouette](https://github.com/angular/material2/compare/5.2.2...5.2.3) (2018-02-27)


### Bug Fixes

* **cdk-dialog:** decorate dialog as an injectable ([#10052](https://github.com/angular/material2/issues/10052)) ([07b4250](https://github.com/angular/material2/commit/07b4250))
* **datepicker:** improve native adapter DST handling ([#10068](https://github.com/angular/material2/issues/10068)) ([2837196](https://github.com/angular/material2/commit/2837196))
* avoid layout jumping on elements with ripples in RTL ([#10026](https://github.com/angular/material2/issues/10026)) ([c93103b](https://github.com/angular/material2/commit/c93103b))
* **dialog:** actions not being pulled down when trapping focus ([#10007](https://github.com/angular/material2/issues/10007)) ([9a39e24](https://github.com/angular/material2/commit/9a39e24)), closes [#9722](https://github.com/angular/material2/issues/9722)
* **dialog:** don't provide directionality if user injector has one already ([#10004](https://github.com/angular/material2/issues/10004)) ([6ec0af1](https://github.com/angular/material2/commit/6ec0af1))
* **grid-list:** default to LTR when Directionality value is empty ([#10111](https://github.com/angular/material2/issues/10111)) ([65810bc](https://github.com/angular/material2/commit/65810bc))
* **grid-list:** invalid style declaration during server-side rendering ([#10131](https://github.com/angular/material2/issues/10131)) ([1576a99](https://github.com/angular/material2/commit/1576a99))
* **list:** align avatar size in dense list with spec ([#10028](https://github.com/angular/material2/issues/10028)) ([7d81b6f](https://github.com/angular/material2/commit/7d81b6f)), closes [#10019](https://github.com/angular/material2/issues/10019)
* **list-key-manager:** not ignoring vertical key events in horizontal-only mode ([#10075](https://github.com/angular/material2/issues/10075)) ([f31a2f1](https://github.com/angular/material2/commit/f31a2f1))
* **selection-list:** repeated preselected items not appearing as selected with OnPush parent ([#10100](https://github.com/angular/material2/issues/10100)) ([f93d0f4](https://github.com/angular/material2/commit/f93d0f4)), closes [#10090](https://github.com/angular/material2/issues/10090)
* **stepper:** require users to visit non-optional steps ([#10048](https://github.com/angular/material2/issues/10048)) ([d26aa6e](https://github.com/angular/material2/commit/d26aa6e))


<a name="5.2.2"></a>
# [5.2.2 cork-yacht](https://github.com/angular/material2/compare/5.2.1...5.2.2) (2018-02-21)


### Bug Fixes

* **aria-describer:** better handling of non-string values ([#9959](https://github.com/angular/material2/issues/9959)) ([d351e33](https://github.com/angular/material2/commit/d351e33))
* **list:** list-options require a parent selection list ([#9899](https://github.com/angular/material2/issues/9899)) ([8cca2c2](https://github.com/angular/material2/commit/8cca2c2))
* **list-key-manager:** infinite loop if all items are disabled ([#9981](https://github.com/angular/material2/issues/9981)) ([775f560](https://github.com/angular/material2/commit/775f560))
* **menu:** not picking up indirect descendant items ([#9971](https://github.com/angular/material2/issues/9971)) ([14b21e9](https://github.com/angular/material2/commit/14b21e9)), closes [#9969](https://github.com/angular/material2/issues/9969)
* **overlay:** expose backdropClick mouse event in ConnectedOverlayDirective ([#9845](https://github.com/angular/material2/issues/9845)) ([5a1e7fe](https://github.com/angular/material2/commit/5a1e7fe))
* **platform:** potential error if CSS object is undefined ([#9968](https://github.com/angular/material2/issues/9968)) ([3212111](https://github.com/angular/material2/commit/3212111)), closes [#9801](https://github.com/angular/material2/issues/9801)
* **select:** icons inside option not centered ([#9982](https://github.com/angular/material2/issues/9982)) ([ecc7f53](https://github.com/angular/material2/commit/ecc7f53)), closes [#9978](https://github.com/angular/material2/issues/9978)
* **select:** lock dropdown position when scrolling ([#9789](https://github.com/angular/material2/issues/9789)) ([30b90a2](https://github.com/angular/material2/commit/30b90a2))
* **selection-list:** incorrect cursor if disabled ([#9963](https://github.com/angular/material2/issues/9963)) ([13e809a](https://github.com/angular/material2/commit/13e809a)), closes [#9952](https://github.com/angular/material2/issues/9952)
* **tabs:** ink bar not visible in high contrast mode ([#9997](https://github.com/angular/material2/issues/9997)) ([1ba04eb](https://github.com/angular/material2/commit/1ba04eb))
* **theming:** add aliases for alternate spelling of "grey" ([#9903](https://github.com/angular/material2/issues/9903)) ([36e1bc0](https://github.com/angular/material2/commit/36e1bc0))
* **viewport-ruler:** fix server-side rendering errors when attempting to measure the viewport ([#9870](https://github.com/angular/material2/issues/9870)) ([ac4cd91](https://github.com/angular/material2/commit/ac4cd91))



<a name="5.2.1"></a>
# [5.2.1 ghillie-soup](https://github.com/angular/material2/compare/5.2.0...5.2.1) (2018-02-12)


### Bug Fixes

* **autocomplete:** escape key inconsistency on IE ([#9777](https://github.com/angular/material2/issues/9777)) ([180750e](https://github.com/angular/material2/commit/180750e))
* **button:** better accessibility for flat buttons in high-contrast ([#9783](https://github.com/angular/material2/issues/9783)) ([0d0c6d4](https://github.com/angular/material2/commit/0d0c6d4))
* **datepicker:** add max/min filter to multi year and year views ([#9727](https://github.com/angular/material2/issues/9727)) ([0793142](https://github.com/angular/material2/commit/0793142))
* **datepicker:** changed after checked error if focused datepicker inputs turn disabled ([#9717](https://github.com/angular/material2/issues/9717)) ([01ad7bd](https://github.com/angular/material2/commit/01ad7bd)), closes [#9559](https://github.com/angular/material2/issues/9559)
* **global-position-strategy:** ignoring width and height from OverlayConfig ([#9774](https://github.com/angular/material2/issues/9774)) ([b425a46](https://github.com/angular/material2/commit/b425a46)), closes [#9715](https://github.com/angular/material2/issues/9715)
* **overlay:** dimension not updated after init ([#8765](https://github.com/angular/material2/issues/8765)) ([c36b512](https://github.com/angular/material2/commit/c36b512))
* **select:** options inside option group not being rendered when wrapped with ng-container ([#9769](https://github.com/angular/material2/issues/9769)) ([38fddfe](https://github.com/angular/material2/commit/38fddfe)), closes [#9736](https://github.com/angular/material2/issues/9736)
* **selection-list:** external changes to selection model not being reflected ([#9846](https://github.com/angular/material2/issues/9846)) ([82df181](https://github.com/angular/material2/commit/82df181)), closes [#9838](https://github.com/angular/material2/issues/9838)
* **slider:** invisible in high contrast mode ([#9792](https://github.com/angular/material2/issues/9792)) ([94bbffc](https://github.com/angular/material2/commit/94bbffc))
* **slider:** unable to reset value by setting it back to undefined ([#9768](https://github.com/angular/material2/issues/9768)) ([c2e2744](https://github.com/angular/material2/commit/c2e2744)), closes [#9740](https://github.com/angular/material2/issues/9740)
* **radio:** add aria-describedby passthrough to radio button input ([#9741](https://github.com/angular/material2/issues/9741)) ([cd159f5](https://github.com/angular/material2/commit/cd159f5))



<a name="5.2.0"></a>
# [5.2.0 selenium-scramble](https://github.com/angular/material2/compare/5.1.0...5.2.0) (2018-02-05)


### Features

* **autocomplete:** add the ability to highlight the first option on open ([#9495](https://github.com/angular/material2/issues/9495)) ([b42fcb9](https://github.com/angular/material2/commit/b42fcb9)), closes [#8423](https://github.com/angular/material2/issues/8423)
* **button:** create stroked and flat button variants ([#9365](https://github.com/angular/material2/issues/9365)) ([b652683](https://github.com/angular/material2/commit/b652683))
* **button:** expose ripple instance ([#9170](https://github.com/angular/material2/issues/9170)) ([17e36fe](https://github.com/angular/material2/commit/17e36fe)), closes [#4179](https://github.com/angular/material2/issues/4179)
* **checkbox:** expose ripple instance ([#9176](https://github.com/angular/material2/issues/9176)) ([e09c0a6](https://github.com/angular/material2/commit/e09c0a6))
* **datepicker:** allow for mat-datepicker-toggle icon to be customized ([#9487](https://github.com/angular/material2/issues/9487)) ([01867ad](https://github.com/angular/material2/commit/01867ad))
* **dialog:** support using dialog content directives with template dialogs ([#9379](https://github.com/angular/material2/issues/9379)) ([99b768e](https://github.com/angular/material2/commit/99b768e)), closes [#5412](https://github.com/angular/material2/issues/5412)
* **drawer:** expose CdkScrollable instance ([#9183](https://github.com/angular/material2/issues/9183)) ([2d03af0](https://github.com/angular/material2/commit/2d03af0)), closes [#9136](https://github.com/angular/material2/issues/9136)
* **expansion-panel:** support two-way binding for the expanded property ([#9327](https://github.com/angular/material2/issues/9327)) ([a72085b](https://github.com/angular/material2/commit/a72085b)), closes [#9311](https://github.com/angular/material2/issues/9311)
* **layout:** add window breakpoints from spec ([#9318](https://github.com/angular/material2/issues/9318)) ([1038950](https://github.com/angular/material2/commit/1038950))
* **list-key-manager:** add support for horizontal directions ([#9122](https://github.com/angular/material2/issues/9122)) ([ab02367](https://github.com/angular/material2/commit/ab02367))
* **menu:** support lazy rendering and passing in context data ([#9271](https://github.com/angular/material2/issues/9271)) ([9fed87c](https://github.com/angular/material2/commit/9fed87c)), closes [#9251](https://github.com/angular/material2/issues/9251)
* **observe-content:** allow for the MutationObserver to be disabled ([#9025](https://github.com/angular/material2/issues/9025)) ([aa2e76c](https://github.com/angular/material2/commit/aa2e76c))
* **overlay:** expose reference to the backdrop element ([#9702](https://github.com/angular/material2/issues/9702)) ([959a8a1](https://github.com/angular/material2/commit/959a8a1)), closes [#9689](https://github.com/angular/material2/issues/9689)
* **overlay:** make it easier to override backdrop color ([#9114](https://github.com/angular/material2/issues/9114)) ([3d18006](https://github.com/angular/material2/commit/3d18006)), closes [#7855](https://github.com/angular/material2/issues/7855)
* **paginator:** Add functionality to jump to first and last page ([#9603](https://github.com/angular/material2/issues/9603)) ([04cdb13](https://github.com/angular/material2/commit/04cdb13)), closes [#9278](https://github.com/angular/material2/issues/9278)
* **paginator:** allow page size selection to be disabled ([#8373](https://github.com/angular/material2/issues/8373)) ([c8743e7](https://github.com/angular/material2/commit/c8743e7)), closes [#8359](https://github.com/angular/material2/issues/8359)
* **portal:** expose attached result in CdkPortalOutlet ([#9326](https://github.com/angular/material2/issues/9326)) ([b626b13](https://github.com/angular/material2/commit/b626b13)), closes [#9304](https://github.com/angular/material2/issues/9304)
* **ripple:** support animation duration overwrites ([#9253](https://github.com/angular/material2/issues/9253)) ([3bc4cd3](https://github.com/angular/material2/commit/3bc4cd3))
* **ripple:** support ripple fade-out on pointer up ([#9694](https://github.com/angular/material2/issues/9694)) ([efb03c9](https://github.com/angular/material2/commit/efb03c9)), closes [#9577](https://github.com/angular/material2/issues/9577)
* **slider:** add focus and blur methods do MatSlider ([#9373](https://github.com/angular/material2/issues/9373)) ([2d592a5](https://github.com/angular/material2/commit/2d592a5))
* **sort:** fix animation; show on hover ([#7608](https://github.com/angular/material2/issues/7608)) ([cde00df](https://github.com/angular/material2/commit/cde00df))
* **stepper:** add proper type to stepper buttons ([#9401](https://github.com/angular/material2/issues/9401)) ([b3d2e78](https://github.com/angular/material2/commit/b3d2e78))
* **stepper:** add the ability to reset a stepper ([#8623](https://github.com/angular/material2/issues/8623)) ([a6f9fc2](https://github.com/angular/material2/commit/a6f9fc2))
* **stepper:** allow for header icons to be customized ([#7482](https://github.com/angular/material2/issues/7482)) ([adc251c](https://github.com/angular/material2/commit/adc251c)), closes [#7384](https://github.com/angular/material2/issues/7384)
* **table:** allow data input to be array, stream ([#9489](https://github.com/angular/material2/issues/9489)) ([085d805](https://github.com/angular/material2/commit/085d805))


### Bug Fixes

* **aria-describer:** exception when attempting to describe a non-element node ([#9392](https://github.com/angular/material2/issues/9392)) ([4c7a4f3](https://github.com/angular/material2/commit/4c7a4f3))
* **autocomplete:** close panel using alt + up arrow ([#9341](https://github.com/angular/material2/issues/9341)) ([2c192d0](https://github.com/angular/material2/commit/2c192d0))
* **autocomplete:** error when closing from a destroyed view ([#7365](https://github.com/angular/material2/issues/7365)) ([2b05106](https://github.com/angular/material2/commit/2b05106)), closes [#7315](https://github.com/angular/material2/issues/7315)
* **autocomplete:** expose MatAutocompleteTrigger in template ([#9703](https://github.com/angular/material2/issues/9703)) ([8997db0](https://github.com/angular/material2/commit/8997db0)), closes [#9687](https://github.com/angular/material2/issues/9687)
* **autocomplete:** handle `optionSelections` being accessed early ([#8802](https://github.com/angular/material2/issues/8802)) ([4e1a6a8](https://github.com/angular/material2/commit/4e1a6a8)), closes [#4616](https://github.com/angular/material2/issues/4616)
* **autocomplete:** handle attaching autocomplete to a number input ([#9672](https://github.com/angular/material2/issues/9672)) ([f75fa15](https://github.com/angular/material2/commit/f75fa15)), closes [#9628](https://github.com/angular/material2/issues/9628)
* **autocomplete:** panel not closing on IE when selecting an option with an empty string display value ([#9506](https://github.com/angular/material2/issues/9506)) ([95ffe37](https://github.com/angular/material2/commit/95ffe37)), closes [#9479](https://github.com/angular/material2/issues/9479)
* **autocomplete:** prevent opening using arrow keys on readonly input ([#9229](https://github.com/angular/material2/issues/9229)) ([9d152c0](https://github.com/angular/material2/commit/9d152c0)), closes [#9227](https://github.com/angular/material2/issues/9227)
* **block-scroll-strategy:** server-side rendering error ([#9665](https://github.com/angular/material2/issues/9665)) ([3acbf26](https://github.com/angular/material2/commit/3acbf26))
* **button:** accent color not set on fab buttons with build optimizer ([#9376](https://github.com/angular/material2/issues/9376)) ([b3f8a42](https://github.com/angular/material2/commit/b3f8a42)), closes [#9360](https://github.com/angular/material2/issues/9360)
* **button:** incorrect text color when no color is passed in on dark theme ([#9234](https://github.com/angular/material2/issues/9234)) ([6824375](https://github.com/angular/material2/commit/6824375)), closes [#9231](https://github.com/angular/material2/issues/9231)
* **button-toggle:** inaccurate name passed down to input if no name is assigned ([#9017](https://github.com/angular/material2/issues/9017)) ([54d60df](https://github.com/angular/material2/commit/54d60df))
* **card:** add camel-cased selectors to content projection ([#6818](https://github.com/angular/material2/issues/6818)) ([d5a7cce](https://github.com/angular/material2/commit/d5a7cce)), closes [#6816](https://github.com/angular/material2/issues/6816)
* **card,tabs,toolbar:** Make media query breakpoints follow Material spec ([#9284](https://github.com/angular/material2/issues/9284)) ([7672913](https://github.com/angular/material2/commit/7672913))
* **checkbox:** underlying native checkbox being rendered when parent uses css column layout ([#9258](https://github.com/angular/material2/issues/9258)) ([eac1512](https://github.com/angular/material2/commit/eac1512)), closes [#9049](https://github.com/angular/material2/issues/9049)
* **chips:** chip list capturing keyboard events from input ([#9651](https://github.com/angular/material2/issues/9651)) ([a48f75b](https://github.com/angular/material2/commit/a48f75b))
* **collections:** clean up UniqueSelectionDispatcher listeners on destroy ([#9673](https://github.com/angular/material2/issues/9673)) ([26b0635](https://github.com/angular/material2/commit/26b0635))
* **datepicker:** calendar controls not being inverted in rtl ([#9219](https://github.com/angular/material2/issues/9219)) ([8a3e023](https://github.com/angular/material2/commit/8a3e023))
* **datepicker:** calendar keyboard controls not working if the user clicks on blank area ([#9494](https://github.com/angular/material2/issues/9494)) ([0b8955b](https://github.com/angular/material2/commit/0b8955b))
* **datepicker:** gray out filtered years in multi-year view ([#9563](https://github.com/angular/material2/issues/9563)) ([403ebbd](https://github.com/angular/material2/commit/403ebbd))
* **datepicker:** highlight datepicker toggle when calendar is open ([#9426](https://github.com/angular/material2/issues/9426)) ([e3b5e3f](https://github.com/angular/material2/commit/e3b5e3f))
* **datepicker:** set border radius on calendar popup ([#9509](https://github.com/angular/material2/issues/9509)) ([4e7c1a3](https://github.com/angular/material2/commit/4e7c1a3))
* **dialog:** server-side rendering error when attempting to trap focus ([#9698](https://github.com/angular/material2/issues/9698)) ([acbf3c8](https://github.com/angular/material2/commit/acbf3c8))
* **divider:** add inset styles for icons and lists in cards ([#9242](https://github.com/angular/material2/issues/9242)) ([d587abe](https://github.com/angular/material2/commit/d587abe))
* **expansion:** define default expansion header heights via css. ([#9313](https://github.com/angular/material2/issues/9313)) ([c604834](https://github.com/angular/material2/commit/c604834))
* **expansion-panel:** expand animation jumping ([#8779](https://github.com/angular/material2/issues/8779)) ([37575c9](https://github.com/angular/material2/commit/37575c9))
* **expansion-panel:** improved accessibility labelling and keyboard default action not being prevented ([#9174](https://github.com/angular/material2/issues/9174)) ([e62afdf](https://github.com/angular/material2/commit/e62afdf))
* **focus-monitor:** implement OnDestroy logic ([#9305](https://github.com/angular/material2/issues/9305)) ([8972bf4](https://github.com/angular/material2/commit/8972bf4))
* **focus-monitor:** set up global listeners in root zone ([#9542](https://github.com/angular/material2/issues/9542)) ([afcb3ea](https://github.com/angular/material2/commit/afcb3ea))
* **form-field:** unable to override font-size through typography config ([#9463](https://github.com/angular/material2/issues/9463)) ([66dc73a](https://github.com/angular/material2/commit/66dc73a))
* **grid-list:** tile being pulled outside the grid if no gap can be found ([#9128](https://github.com/angular/material2/issues/9128)) ([c8127ed](https://github.com/angular/material2/commit/c8127ed)), closes [#4515](https://github.com/angular/material2/issues/4515)
* **icon:** prevent parsing the same icon set multiple times ([#9635](https://github.com/angular/material2/issues/9635)) ([e6e4c3c](https://github.com/angular/material2/commit/e6e4c3c))
* **input:** floating label not reacting when patching the value without emitting an event ([#9260](https://github.com/angular/material2/issues/9260)) ([ec6678d](https://github.com/angular/material2/commit/ec6678d)), closes [#8982](https://github.com/angular/material2/issues/8982)
* **input:** respect text-align value from form-field ([#9397](https://github.com/angular/material2/issues/9397)) ([5136361](https://github.com/angular/material2/commit/5136361))
* **interactivity-checker:** carefully handle frame elements ([#9340](https://github.com/angular/material2/issues/9340)) ([6f7332b](https://github.com/angular/material2/commit/6f7332b)), closes [#3372](https://github.com/angular/material2/issues/3372)
* **keycodes:** incorrect key code for nine ([#9568](https://github.com/angular/material2/issues/9568)) ([637e1b6](https://github.com/angular/material2/commit/637e1b6)), closes [#9567](https://github.com/angular/material2/issues/9567)
* **list:** incorrect padding for list-items with avatars, icons ([#9500](https://github.com/angular/material2/issues/9500)) ([39a5861](https://github.com/angular/material2/commit/39a5861)), closes [#9156](https://github.com/angular/material2/issues/9156)
* **list-key-manager:** maintain selected index when amount of items changes ([#9164](https://github.com/angular/material2/issues/9164)) ([4f65276](https://github.com/angular/material2/commit/4f65276))
* **menu:** always focus first menu item ([#9383](https://github.com/angular/material2/issues/9383)) ([8430617](https://github.com/angular/material2/commit/8430617)), closes [#9252](https://github.com/angular/material2/issues/9252)
* **menu:** inconsistent side padding for nested menu items in RTL ([#9124](https://github.com/angular/material2/issues/9124)) ([cc24c7c](https://github.com/angular/material2/commit/cc24c7c))
* **menu:** set appropriate origin when restoring focus ([#9303](https://github.com/angular/material2/issues/9303)) ([278e25a](https://github.com/angular/material2/commit/278e25a)), closes [#9292](https://github.com/angular/material2/issues/9292)
* **menu,toolbar:** avoid potential server-side rendering errors ([#9423](https://github.com/angular/material2/issues/9423)) ([dfa68db](https://github.com/angular/material2/commit/dfa68db))
* **native-date-adapter:** avoid error when formatting edge case dates in IE11 and Edge ([#9523](https://github.com/angular/material2/issues/9523)) ([dd2fbc8](https://github.com/angular/material2/commit/dd2fbc8))
* **overlay:** attempting to position overlay if it was detached immediately after being attached ([#9507](https://github.com/angular/material2/issues/9507)) ([c7ad145](https://github.com/angular/material2/commit/c7ad145)), closes [#9406](https://github.com/angular/material2/issues/9406)
* **overlay:** ConnectedOverlayDirective not updating positions after first open ([#9579](https://github.com/angular/material2/issues/9579)) ([d0011c4](https://github.com/angular/material2/commit/d0011c4))
* **overlay:** default options not being applied correctly ([#9088](https://github.com/angular/material2/issues/9088)) ([b153947](https://github.com/angular/material2/commit/b153947))
* **overlay:** expose event object in backdropClick stream ([#9716](https://github.com/angular/material2/issues/9716)) ([5611947](https://github.com/angular/material2/commit/5611947)), closes [#9713](https://github.com/angular/material2/issues/9713)
* **overlay:** onPositionChange stream not being completed ([#8562](https://github.com/angular/material2/issues/8562)) ([7fe651b](https://github.com/angular/material2/commit/7fe651b))
* **overlay:** OverlayKeyboardDispatcher not dispatching events when propagation is stopped ([#9546](https://github.com/angular/material2/issues/9546)) ([e30852a](https://github.com/angular/material2/commit/e30852a))
* **overlay:** server-side rendering error when creating backdrop element ([#9448](https://github.com/angular/material2/issues/9448)) ([a1db4e4](https://github.com/angular/material2/commit/a1db4e4))
* **overlay:** transparent overlay not blocking scroll on Firefox 57 ([#9446](https://github.com/angular/material2/issues/9446)) ([d0ad3b7](https://github.com/angular/material2/commit/d0ad3b7)), closes [#8924](https://github.com/angular/material2/issues/8924)
* **overlay:** unable to change CdkConnectedOverlay origin dynamically ([#9358](https://github.com/angular/material2/issues/9358)) ([df44767](https://github.com/angular/material2/commit/df44767)), closes [#9353](https://github.com/angular/material2/issues/9353)
* **progress-bar:** prevent users from tabbing into underlying SVG on IE ([#9638](https://github.com/angular/material2/issues/9638)) ([0a1904d](https://github.com/angular/material2/commit/0a1904d))
* **progress-bar:** remove data url for CSP compliance ([#8898](https://github.com/angular/material2/issues/8898)) ([0f2ac9b](https://github.com/angular/material2/commit/0f2ac9b))
* **progress-spinner:** element size not updated when diamater is changed ([#8697](https://github.com/angular/material2/issues/8697)) ([6d4c7ae](https://github.com/angular/material2/commit/6d4c7ae))
* **radio:** add support for tabindex on radio-buttons ([#9467](https://github.com/angular/material2/issues/9467)) ([f1c3e2c](https://github.com/angular/material2/commit/f1c3e2c)), closes [#9427](https://github.com/angular/material2/issues/9427)
* **scrolling:** implement ngOnDestroy in ScrollDispatcher ([#9608](https://github.com/angular/material2/issues/9608)) ([fd17cf2](https://github.com/angular/material2/commit/fd17cf2))
* **select:** close panel on alt + arrow key presses ([#9250](https://github.com/angular/material2/issues/9250)) ([7c78c93](https://github.com/angular/material2/commit/7c78c93))
* **select:** don't restore focus unless an option was selected ([#8964](https://github.com/angular/material2/issues/8964)) ([9dc43de](https://github.com/angular/material2/commit/9dc43de)), closes [#8915](https://github.com/angular/material2/issues/8915)
* **select:** handle async changes to the option label ([#9159](https://github.com/angular/material2/issues/9159)) ([245caae](https://github.com/angular/material2/commit/245caae)), closes [#7923](https://github.com/angular/material2/issues/7923)
* **select:** handle keyboard events from inside panel ([#9361](https://github.com/angular/material2/issues/9361)) ([69270ef](https://github.com/angular/material2/commit/69270ef))
* **select:** support changing the value using left/right arrow keys while closed ([#9578](https://github.com/angular/material2/issues/9578)) ([83b369e](https://github.com/angular/material2/commit/83b369e))
* **selection-model:** incorrect initial value when empty array is passed in single-selection mode ([#9287](https://github.com/angular/material2/issues/9287)) ([075464f](https://github.com/angular/material2/commit/075464f)), closes [#9273](https://github.com/angular/material2/issues/9273)
* **slide-toggle:** truncate label content with ellipsis ([#9166](https://github.com/angular/material2/issues/9166)) ([68bb44c](https://github.com/angular/material2/commit/68bb44c)), closes [#5212](https://github.com/angular/material2/issues/5212)
* **slider:** slider emiting changes on slide end when disabled ([#9434](https://github.com/angular/material2/issues/9434)) ([1e2fe90](https://github.com/angular/material2/commit/1e2fe90))
* **snack-bar:** indicate in afterDismissed whether dismissal was a result of an action ([#9154](https://github.com/angular/material2/issues/9154)) ([829506d](https://github.com/angular/material2/commit/829506d)), closes [#9147](https://github.com/angular/material2/issues/9147)
* **stepper:** header collapsing if box-sizing is set ([#9505](https://github.com/angular/material2/issues/9505)) ([ffc5381](https://github.com/angular/material2/commit/ffc5381)), closes [#9501](https://github.com/angular/material2/issues/9501)
* **stepper:** overriding default completed logic when resetting ([#9650](https://github.com/angular/material2/issues/9650)) ([7e352ce](https://github.com/angular/material2/commit/7e352ce))
* **stepper:** support going to first/last steps via home/end keys ([#9632](https://github.com/angular/material2/issues/9632)) ([834aecc](https://github.com/angular/material2/commit/834aecc))
* **stepper:** throw when out-of-bounds value is assigned to selectedIndex ([#9127](https://github.com/angular/material2/issues/9127)) ([f54377c](https://github.com/angular/material2/commit/f54377c))
* **stepper:** unable to skip optional steps in linear stepper ([#9245](https://github.com/angular/material2/issues/9245)) ([9dba30b](https://github.com/angular/material2/commit/9dba30b)), closes [#9239](https://github.com/angular/material2/issues/9239)
* **tab-link:** preventDefault action when disabled tab link is clicked. ([#9357](https://github.com/angular/material2/issues/9357)) ([8de5e83](https://github.com/angular/material2/commit/8de5e83))
* **table:** data source should sort empty values correctly ([#8698](https://github.com/angular/material2/issues/8698)) ([f213f6c](https://github.com/angular/material2/commit/f213f6c))
* **tabs:** move focus to first/last tabs using home/end ([#9171](https://github.com/angular/material2/issues/9171)) ([24f62eb](https://github.com/angular/material2/commit/24f62eb))
* **theming:** provide text color through mat-app-background ([#9262](https://github.com/angular/material2/issues/9262)) ([1e7eeab](https://github.com/angular/material2/commit/1e7eeab))
* **tooltip:** match mobile dimensions from spec ([#9181](https://github.com/angular/material2/issues/9181)) ([63a5588](https://github.com/angular/material2/commit/63a5588)), closes [#9039](https://github.com/angular/material2/issues/9039)


### Performance Improvements

* **menu,select:** panel repainting on scroll ([#7721](https://github.com/angular/material2/issues/7721)) ([13410bd](https://github.com/angular/material2/commit/13410bd)), closes [#7716](https://github.com/angular/material2/issues/7716)



<a name="5.2.0-beta.0"></a>
# [5.2.0-beta.0](https://github.com/angular/material2/compare/5.1.0...5.2.0-beta.0) (2018-01-30)

### Features

* **autocomplete:** add the ability automatically keep the first option active ([#9495](https://github.com/angular/material2/issues/9495)) ([b42fcb9](https://github.com/angular/material2/commit/b42fcb9)), closes [#8423](https://github.com/angular/material2/issues/8423)
* **button:** expose ripple instance ([#9170](https://github.com/angular/material2/issues/9170)) ([17e36fe](https://github.com/angular/material2/commit/17e36fe)), closes [#4179](https://github.com/angular/material2/issues/4179)
* **checkbox:** expose ripple instance ([#9176](https://github.com/angular/material2/issues/9176)) ([e09c0a6](https://github.com/angular/material2/commit/e09c0a6))
* **datepicker:** allow for mat-datepicker-toggle icon to be customized ([#9487](https://github.com/angular/material2/issues/9487)) ([01867ad](https://github.com/angular/material2/commit/01867ad))
* **dialog:** support using dialog content directives with template dialogs ([#9379](https://github.com/angular/material2/issues/9379)) ([99b768e](https://github.com/angular/material2/commit/99b768e)), closes [#5412](https://github.com/angular/material2/issues/5412)
* **drawer:** expose CdkScrollable instance ([#9183](https://github.com/angular/material2/issues/9183)) ([2d03af0](https://github.com/angular/material2/commit/2d03af0)), closes [#9136](https://github.com/angular/material2/issues/9136)
* **expansion-panel:** support two-way binding for the expanded property ([#9327](https://github.com/angular/material2/issues/9327)) ([a72085b](https://github.com/angular/material2/commit/a72085b)), closes [#9311](https://github.com/angular/material2/issues/9311)
* **layout:** add window breakpoints from spec ([#9318](https://github.com/angular/material2/issues/9318)) ([1038950](https://github.com/angular/material2/commit/1038950))
* **list-key-manager:** add support for horizontal directions ([#9122](https://github.com/angular/material2/issues/9122)) ([ab02367](https://github.com/angular/material2/commit/ab02367))
* **menu:** support lazy rendering and passing in context data ([#9271](https://github.com/angular/material2/issues/9271)) ([9fed87c](https://github.com/angular/material2/commit/9fed87c)), closes [#9251](https://github.com/angular/material2/issues/9251)
* **observe-content:** allow for the MutationObserver to be disabled ([#9025](https://github.com/angular/material2/issues/9025)) ([aa2e76c](https://github.com/angular/material2/commit/aa2e76c))
* **overlay:** make it easier to override backdrop color ([#9114](https://github.com/angular/material2/issues/9114)) ([3d18006](https://github.com/angular/material2/commit/3d18006)), closes [#7855](https://github.com/angular/material2/issues/7855)
* **paginator:** allow page size selection to be disabled ([#8373](https://github.com/angular/material2/issues/8373)) ([c8743e7](https://github.com/angular/material2/commit/c8743e7)), closes [#8359](https://github.com/angular/material2/issues/8359)
* **portal:** expose attached result in CdkPortalOutlet ([#9326](https://github.com/angular/material2/issues/9326)) ([b626b13](https://github.com/angular/material2/commit/b626b13)), closes [#9304](https://github.com/angular/material2/issues/9304)
* **ripple:** support animation duration overwrites ([#9253](https://github.com/angular/material2/issues/9253)) ([3bc4cd3](https://github.com/angular/material2/commit/3bc4cd3))
* **slider:** add focus and blur methods do MatSlider ([#9373](https://github.com/angular/material2/issues/9373)) ([2d592a5](https://github.com/angular/material2/commit/2d592a5))
* **stepper:** add proper type to stepper buttons ([#9401](https://github.com/angular/material2/issues/9401)) ([b3d2e78](https://github.com/angular/material2/commit/b3d2e78))
* **stepper:** add the ability to reset a stepper ([#8623](https://github.com/angular/material2/issues/8623)) ([a6f9fc2](https://github.com/angular/material2/commit/a6f9fc2))

### Bug Fixes

* **aria-describer:** exception when attempting to describe a non-element node ([#9392](https://github.com/angular/material2/issues/9392)) ([4c7a4f3](https://github.com/angular/material2/commit/4c7a4f3))
* **autocomplete:** close panel using alt + up arrow ([#9341](https://github.com/angular/material2/issues/9341)) ([2c192d0](https://github.com/angular/material2/commit/2c192d0))
* **autocomplete:** error when closing from a destroyed view ([#7365](https://github.com/angular/material2/issues/7365)) ([2b05106](https://github.com/angular/material2/commit/2b05106)), closes [#7315](https://github.com/angular/material2/issues/7315)
* **autocomplete:** handle `optionSelections` being accessed early ([#8802](https://github.com/angular/material2/issues/8802)) ([4e1a6a8](https://github.com/angular/material2/commit/4e1a6a8)), closes [#4616](https://github.com/angular/material2/issues/4616)
* **autocomplete:** prevent opening using arrow keys on readonly input ([#9229](https://github.com/angular/material2/issues/9229)) ([9d152c0](https://github.com/angular/material2/commit/9d152c0)), closes [#9227](https://github.com/angular/material2/issues/9227)
* **button:** accent color not set on fab buttons with build optimizer ([#9376](https://github.com/angular/material2/issues/9376)) ([b3f8a42](https://github.com/angular/material2/commit/b3f8a42)), closes [#9360](https://github.com/angular/material2/issues/9360)
* **button:** incorrect text color when no color is passed in on dark theme ([#9234](https://github.com/angular/material2/issues/9234)) ([6824375](https://github.com/angular/material2/commit/6824375)), closes [#9231](https://github.com/angular/material2/issues/9231)
* **button-toggle:** inaccurate name passed down to input if no name is assigned ([#9017](https://github.com/angular/material2/issues/9017)) ([54d60df](https://github.com/angular/material2/commit/54d60df))
* **card:** add camel-cased selectors to content projection ([#6818](https://github.com/angular/material2/issues/6818)) ([d5a7cce](https://github.com/angular/material2/commit/d5a7cce)), closes [#6816](https://github.com/angular/material2/issues/6816)
* **card,tabs,toolbar:** Make media query breakpoints follow Material spec ([#9284](https://github.com/angular/material2/issues/9284)) ([7672913](https://github.com/angular/material2/commit/7672913))
* **checkbox:** underlying native checkbox being rendered when parent uses css column layout ([#9258](https://github.com/angular/material2/issues/9258)) ([eac1512](https://github.com/angular/material2/commit/eac1512)), closes [#9049](https://github.com/angular/material2/issues/9049)
* **chips:** chip list capturing keyboard events from input ([#9651](https://github.com/angular/material2/issues/9651)) ([a48f75b](https://github.com/angular/material2/commit/a48f75b))
* **datepicker:** calendar controls not being inverted in rtl ([#9219](https://github.com/angular/material2/issues/9219)) ([8a3e023](https://github.com/angular/material2/commit/8a3e023))
* **datepicker:** calendar keyboard controls not working if the user clicks on blank area ([#9494](https://github.com/angular/material2/issues/9494)) ([0b8955b](https://github.com/angular/material2/commit/0b8955b))
* **datepicker:** gray out filtered years in multi-year view ([#9563](https://github.com/angular/material2/issues/9563)) ([403ebbd](https://github.com/angular/material2/commit/403ebbd))
* **datepicker:** highlight datepicker toggle when calendar is open ([#9426](https://github.com/angular/material2/issues/9426)) ([e3b5e3f](https://github.com/angular/material2/commit/e3b5e3f))
* **datepicker:** set border radius on calendar popup ([#9509](https://github.com/angular/material2/issues/9509)) ([4e7c1a3](https://github.com/angular/material2/commit/4e7c1a3))
* **expansion:** define default expansion header heights via css. ([#9313](https://github.com/angular/material2/issues/9313)) ([c604834](https://github.com/angular/material2/commit/c604834))
* **expansion-panel:** improved accessibility labelling and keyboard default action not being prevented ([#9174](https://github.com/angular/material2/issues/9174)) ([e62afdf](https://github.com/angular/material2/commit/e62afdf))
* **focus-monitor:** implement OnDestroy logic ([#9305](https://github.com/angular/material2/issues/9305)) ([8972bf4](https://github.com/angular/material2/commit/8972bf4))
* **focus-monitor:** set up global listeners in root zone ([#9542](https://github.com/angular/material2/issues/9542)) ([afcb3ea](https://github.com/angular/material2/commit/afcb3ea))
* **form-field:** unable to override font-size through typography config ([#9463](https://github.com/angular/material2/issues/9463)) ([66dc73a](https://github.com/angular/material2/commit/66dc73a))
* **grid-list:** tile being pulled outside the grid if no gap can be found ([#9128](https://github.com/angular/material2/issues/9128)) ([c8127ed](https://github.com/angular/material2/commit/c8127ed)), closes [#4515](https://github.com/angular/material2/issues/4515)
* **icon:** prevent parsing the same icon set multiple times ([#9635](https://github.com/angular/material2/issues/9635)) ([e6e4c3c](https://github.com/angular/material2/commit/e6e4c3c))
* **input:** floating label not reacting when patching the value without emitting an event ([#9260](https://github.com/angular/material2/issues/9260)) ([ec6678d](https://github.com/angular/material2/commit/ec6678d)), closes [#8982](https://github.com/angular/material2/issues/8982)
* **input:** respect text-align value from form-field ([#9397](https://github.com/angular/material2/issues/9397)) ([5136361](https://github.com/angular/material2/commit/5136361))
* **interactivity-checker:** carefully handle frame elements ([#9340](https://github.com/angular/material2/issues/9340)) ([6f7332b](https://github.com/angular/material2/commit/6f7332b)), closes [#3372](https://github.com/angular/material2/issues/3372)
* **keycodes:** incorrect key code for nine ([#9568](https://github.com/angular/material2/issues/9568)) ([637e1b6](https://github.com/angular/material2/commit/637e1b6)), closes [#9567](https://github.com/angular/material2/issues/9567)
* **list:** incorrect padding for list-items with avatars, icons ([#9500](https://github.com/angular/material2/issues/9500)) ([39a5861](https://github.com/angular/material2/commit/39a5861)), closes [#9156](https://github.com/angular/material2/issues/9156)
* **list-key-manager:** maintain selected index when amount of items changes ([#9164](https://github.com/angular/material2/issues/9164)) ([4f65276](https://github.com/angular/material2/commit/4f65276))
* **menu:** always focus first menu item ([#9383](https://github.com/angular/material2/issues/9383)) ([8430617](https://github.com/angular/material2/commit/8430617)), closes [#9252](https://github.com/angular/material2/issues/9252)
* **menu:** inconsistent side padding for nested menu items in RTL ([#9124](https://github.com/angular/material2/issues/9124)) ([cc24c7c](https://github.com/angular/material2/commit/cc24c7c))
* **menu:** set appropriate origin when restoring focus ([#9303](https://github.com/angular/material2/issues/9303)) ([278e25a](https://github.com/angular/material2/commit/278e25a)), closes [#9292](https://github.com/angular/material2/issues/9292)
* **menu,toolbar:** avoid potential server-side rendering errors ([#9423](https://github.com/angular/material2/issues/9423)) ([dfa68db](https://github.com/angular/material2/commit/dfa68db))
* **native-date-adapter:** avoid error when formatting edge case dates in IE11 and Edge ([#9523](https://github.com/angular/material2/issues/9523)) ([dd2fbc8](https://github.com/angular/material2/commit/dd2fbc8))
* **overlay:** attempting to position overlay if it was detached immediately after being attached ([#9507](https://github.com/angular/material2/issues/9507)) ([c7ad145](https://github.com/angular/material2/commit/c7ad145)), closes [#9406](https://github.com/angular/material2/issues/9406)
* **overlay:** ConnectedOverlayDirective not updating positions after first open ([#9579](https://github.com/angular/material2/issues/9579)) ([d0011c4](https://github.com/angular/material2/commit/d0011c4))
* **overlay:** default options not being applied correctly ([#9088](https://github.com/angular/material2/issues/9088)) ([b153947](https://github.com/angular/material2/commit/b153947))
* **overlay:** server-side rendering error when creating backdrop element ([#9448](https://github.com/angular/material2/issues/9448)) ([a1db4e4](https://github.com/angular/material2/commit/a1db4e4))
* **overlay:** transparent overlay not blocking scroll on Firefox 57 ([#9446](https://github.com/angular/material2/issues/9446)) ([d0ad3b7](https://github.com/angular/material2/commit/d0ad3b7)), closes [#8924](https://github.com/angular/material2/issues/8924)
* **overlay:** unable to change CdkConnectedOverlay origin dynamically ([#9358](https://github.com/angular/material2/issues/9358)) ([df44767](https://github.com/angular/material2/commit/df44767)), closes [#9353](https://github.com/angular/material2/issues/9353)
* **progress-bar:** remove data url for CSP compliance ([#8898](https://github.com/angular/material2/issues/8898)) ([0f2ac9b](https://github.com/angular/material2/commit/0f2ac9b))
* **progress-spinner:** element size not updated when diamater is changed ([#8697](https://github.com/angular/material2/issues/8697)) ([6d4c7ae](https://github.com/angular/material2/commit/6d4c7ae))
* **radio:** add support for tabindex on radio-buttons ([#9467](https://github.com/angular/material2/issues/9467)) ([f1c3e2c](https://github.com/angular/material2/commit/f1c3e2c)), closes [#9427](https://github.com/angular/material2/issues/9427)
* **scrolling:** implement ngOnDestroy in ScrollDispatcher ([#9608](https://github.com/angular/material2/issues/9608)) ([fd17cf2](https://github.com/angular/material2/commit/fd17cf2))
* **select:** close panel on alt + arrow key presses ([#9250](https://github.com/angular/material2/issues/9250)) ([7c78c93](https://github.com/angular/material2/commit/7c78c93))
* **select:** don't restore focus unless an option was selected ([#8964](https://github.com/angular/material2/issues/8964)) ([9dc43de](https://github.com/angular/material2/commit/9dc43de)), closes [#8915](https://github.com/angular/material2/issues/8915)
* **select:** handle async changes to the option label ([#9159](https://github.com/angular/material2/issues/9159)) ([245caae](https://github.com/angular/material2/commit/245caae)), closes [#7923](https://github.com/angular/material2/issues/7923)
* **select:** handle keyboard events from inside panel ([#9361](https://github.com/angular/material2/issues/9361)) ([69270ef](https://github.com/angular/material2/commit/69270ef))
* **select:** support changing the value using left/right arrow keys while closed ([#9578](https://github.com/angular/material2/issues/9578)) ([83b369e](https://github.com/angular/material2/commit/83b369e))
* **selection-model:** incorrect initial value when empty array is passed in single-selection mode ([#9287](https://github.com/angular/material2/issues/9287)) ([075464f](https://github.com/angular/material2/commit/075464f)), closes [#9273](https://github.com/angular/material2/issues/9273)
* **slide-toggle:** truncate label content with ellipsis ([#9166](https://github.com/angular/material2/issues/9166)) ([68bb44c](https://github.com/angular/material2/commit/68bb44c)), closes [#5212](https://github.com/angular/material2/issues/5212)
* **slider:** slider emiting changes on slide end when disabled ([#9434](https://github.com/angular/material2/issues/9434)) ([1e2fe90](https://github.com/angular/material2/commit/1e2fe90))
* **snack-bar:** indicate in afterDismissed whether dismissal was a result of an action ([#9154](https://github.com/angular/material2/issues/9154)) ([829506d](https://github.com/angular/material2/commit/829506d)), closes [#9147](https://github.com/angular/material2/issues/9147)
* **stepper:** header collapsing if box-sizing is set ([#9505](https://github.com/angular/material2/issues/9505)) ([ffc5381](https://github.com/angular/material2/commit/ffc5381)), closes [#9501](https://github.com/angular/material2/issues/9501)
* **stepper:** throw when out-of-bounds value is assigned to selectedIndex ([#9127](https://github.com/angular/material2/issues/9127)) ([f54377c](https://github.com/angular/material2/commit/f54377c))
* **stepper:** unable to skip optional steps in linear stepper ([#9245](https://github.com/angular/material2/issues/9245)) ([9dba30b](https://github.com/angular/material2/commit/9dba30b)), closes [#9239](https://github.com/angular/material2/issues/9239)
* **tab-link:** preventDefault action when disabled tab link is clicked. ([#9357](https://github.com/angular/material2/issues/9357)) ([8de5e83](https://github.com/angular/material2/commit/8de5e83))
* **table:** data source should sort empty values correctly ([#8698](https://github.com/angular/material2/issues/8698)) ([f213f6c](https://github.com/angular/material2/commit/f213f6c))
* **tabs:** move focus to first/last tabs using home/end ([#9171](https://github.com/angular/material2/issues/9171)) ([24f62eb](https://github.com/angular/material2/commit/24f62eb))
* **theming:** provide text color through mat-app-background ([#9262](https://github.com/angular/material2/issues/9262)) ([1e7eeab](https://github.com/angular/material2/commit/1e7eeab))


### Performance Improvements

* **menu,select:** panel repainting on scroll ([#7721](https://github.com/angular/material2/issues/7721)) ([13410bd](https://github.com/angular/material2/commit/13410bd)), closes [#7716](https://github.com/angular/material2/issues/7716)



<a name="5.1.1"></a>
# [5.1.1 silk-xylophone](https://github.com/angular/material2/compare/5.1.0...5.1.1) (2018-01-29)


### Bug Fixes

* **autocomplete:** close panel using alt + up arrow ([#9341](https://github.com/angular/material2/issues/9341)) ([a1ad82b](https://github.com/angular/material2/commit/a1ad82b))
* **autocomplete:** error when closing from a destroyed view ([#7365](https://github.com/angular/material2/issues/7365)) ([00820f7](https://github.com/angular/material2/commit/00820f7)), closes [#7315](https://github.com/angular/material2/issues/7315)
* **autocomplete:** handle `optionSelections` being accessed early ([#8802](https://github.com/angular/material2/issues/8802)) ([ec6168b](https://github.com/angular/material2/commit/ec6168b)), closes [#4616](https://github.com/angular/material2/issues/4616)
* **autocomplete:** prevent opening using arrow keys on readonly input ([#9229](https://github.com/angular/material2/issues/9229)) ([f3b50b0](https://github.com/angular/material2/commit/f3b50b0)), closes [#9227](https://github.com/angular/material2/issues/9227)
* **button:** accent color not set on fab buttons with build optimizer ([#9376](https://github.com/angular/material2/issues/9376)) ([f6a59cd](https://github.com/angular/material2/commit/f6a59cd)), closes [#9360](https://github.com/angular/material2/issues/9360)
* **button-toggle:** inaccurate name passed down to input if no name is assigned ([#9017](https://github.com/angular/material2/issues/9017)) ([fda978a](https://github.com/angular/material2/commit/fda978a))
* **card:** add camel-cased selectors to content projection ([#6818](https://github.com/angular/material2/issues/6818)) ([6e4f90f](https://github.com/angular/material2/commit/6e4f90f)), closes [#6816](https://github.com/angular/material2/issues/6816)
* **card,tabs,toolbar:** Make media query breakpoints follow Material spec ([#9284](https://github.com/angular/material2/issues/9284)) ([d6b3cc8](https://github.com/angular/material2/commit/d6b3cc8))
* **checkbox:** underlying native checkbox being rendered when parent uses css column layout ([#9258](https://github.com/angular/material2/issues/9258)) ([58b665e](https://github.com/angular/material2/commit/58b665e)), closes [#9049](https://github.com/angular/material2/issues/9049)
* **datepicker:** calendar controls not being inverted in rtl ([#9219](https://github.com/angular/material2/issues/9219)) ([af38b97](https://github.com/angular/material2/commit/af38b97))
* **datepicker:** calendar keyboard controls not working if the user clicks on blank area ([#9494](https://github.com/angular/material2/issues/9494)) ([7cea0b6](https://github.com/angular/material2/commit/7cea0b6))
* **datepicker:** highlight datepicker toggle when calendar is open ([#9426](https://github.com/angular/material2/issues/9426)) ([37d8716](https://github.com/angular/material2/commit/37d8716))
* **datepicker:** set border radius on calendar popup ([#9509](https://github.com/angular/material2/issues/9509)) ([3f87dc4](https://github.com/angular/material2/commit/3f87dc4))
* **expansion-panel:** improved accessibility labelling and keyboard default action not being prevented ([#9174](https://github.com/angular/material2/issues/9174)) ([444cee8](https://github.com/angular/material2/commit/444cee8))
* **focus-monitor:** implement OnDestroy logic ([#9305](https://github.com/angular/material2/issues/9305)) ([e6cdce5](https://github.com/angular/material2/commit/e6cdce5))
* **grid-list:** tile being pulled outside the grid if no gap can be found ([#9128](https://github.com/angular/material2/issues/9128)) ([5535325](https://github.com/angular/material2/commit/5535325)), closes [#4515](https://github.com/angular/material2/issues/4515)
* **input:** floating label not reacting when patching the value without emitting an event ([#9260](https://github.com/angular/material2/issues/9260)) ([4a00499](https://github.com/angular/material2/commit/4a00499)), closes [#8982](https://github.com/angular/material2/issues/8982)
* **interactivity-checker:** carefully handle frame elements ([#9340](https://github.com/angular/material2/issues/9340)) ([305a81c](https://github.com/angular/material2/commit/305a81c)), closes [#3372](https://github.com/angular/material2/issues/3372)
* **keycodes:** incorrect key code for nine ([#9568](https://github.com/angular/material2/issues/9568)) ([b489559](https://github.com/angular/material2/commit/b489559)), closes [#9567](https://github.com/angular/material2/issues/9567)
* **list:** incorrect padding for list-items with avatars, icons ([#9500](https://github.com/angular/material2/issues/9500)) ([db520cf](https://github.com/angular/material2/commit/db520cf)), closes [#9156](https://github.com/angular/material2/issues/9156)
* **menu:** inconsistent side padding for nested menu items in RTL ([#9124](https://github.com/angular/material2/issues/9124)) ([53d48f6](https://github.com/angular/material2/commit/53d48f6))
* **menu:** set appropriate origin when restoring focus ([#9303](https://github.com/angular/material2/issues/9303)) ([2bf9ad8](https://github.com/angular/material2/commit/2bf9ad8)), closes [#9292](https://github.com/angular/material2/issues/9292)
* **native-date-adapter:** avoid error when formatting edge case dates in IE11 and Edge ([#9523](https://github.com/angular/material2/issues/9523)) ([d25ab57](https://github.com/angular/material2/commit/d25ab57))
* **overlay:** default options not being applied correctly ([#9088](https://github.com/angular/material2/issues/9088)) ([6f8f226](https://github.com/angular/material2/commit/6f8f226))
* **overlay:** server-side rendering error when creating backdrop element ([#9448](https://github.com/angular/material2/issues/9448)) ([5c98185](https://github.com/angular/material2/commit/5c98185))
* **overlay:** transparent overlay not blocking scroll on Firefox 57 ([#9446](https://github.com/angular/material2/issues/9446)) ([e2999a8](https://github.com/angular/material2/commit/e2999a8)), closes [#8924](https://github.com/angular/material2/issues/8924)
* **progress-spinner:** element size not updated when diamater is changed ([#8697](https://github.com/angular/material2/issues/8697)) ([23f0c47](https://github.com/angular/material2/commit/23f0c47))
* **select:** close panel on alt + arrow key presses ([#9250](https://github.com/angular/material2/issues/9250)) ([c3ec94d](https://github.com/angular/material2/commit/c3ec94d))
* **select:** don't restore focus unless an option was selected ([#8964](https://github.com/angular/material2/issues/8964)) ([960b7cf](https://github.com/angular/material2/commit/960b7cf)), closes [#8915](https://github.com/angular/material2/issues/8915)
* **select:** handle async changes to the option label ([#9159](https://github.com/angular/material2/issues/9159)) ([63a5184](https://github.com/angular/material2/commit/63a5184)), closes [#7923](https://github.com/angular/material2/issues/7923)
* **select:** handle keyboard events from inside panel ([#9361](https://github.com/angular/material2/issues/9361)) ([0d233b2](https://github.com/angular/material2/commit/0d233b2))
* **select:** support changing the value using left/right arrow keys while closed ([#9578](https://github.com/angular/material2/issues/9578)) ([b11523a](https://github.com/angular/material2/commit/b11523a))
* **selection-model:** incorrect initial value when empty array is passed in single-selection mode ([#9287](https://github.com/angular/material2/issues/9287)) ([5d0fb95](https://github.com/angular/material2/commit/5d0fb95)), closes [#9273](https://github.com/angular/material2/issues/9273)
* **slide-toggle:** truncate label content with ellipsis ([#9166](https://github.com/angular/material2/issues/9166)) ([4bd96ce](https://github.com/angular/material2/commit/4bd96ce)), closes [#5212](https://github.com/angular/material2/issues/5212)
* **stepper:** header collapsing if box-sizing is set ([#9505](https://github.com/angular/material2/issues/9505)) ([ccc8fbb](https://github.com/angular/material2/commit/ccc8fbb)), closes [#9501](https://github.com/angular/material2/issues/9501)
* **stepper:** unable to skip optional steps in linear stepper ([#9245](https://github.com/angular/material2/issues/9245)) ([517ea57](https://github.com/angular/material2/commit/517ea57)), closes [#9239](https://github.com/angular/material2/issues/9239)
* **tab-link:** preventDefault action when disabled tab link is clicked. ([#9357](https://github.com/angular/material2/issues/9357)) ([0b5806b](https://github.com/angular/material2/commit/0b5806b))
* **theming:** provide text color through mat-app-background ([#9262](https://github.com/angular/material2/issues/9262)) ([6d66a16](https://github.com/angular/material2/commit/6d66a16))
* **overlay:** make it easier to override backdrop color ([#9114](https://github.com/angular/material2/issues/9114)) ([4ff1fd4](https://github.com/angular/material2/commit/4ff1fd4)), closes [#7855](https://github.com/angular/material2/issues/7855)



<a name="5.1.0"></a>
# [5.1.0 burlap-bezel](https://github.com/angular/material2/compare/5.0.1...5.1.0) (2018-01-17)


### Bug Fixes

* **aria-describer:** server-side rendering error during cleanup ([#8903](https://github.com/angular/material2/issues/8903)) ([8a3b19e](https://github.com/angular/material2/commit/8a3b19e)), closes [#8901](https://github.com/angular/material2/issues/8901)
* **autocomplete:** not implementing setDisabledState from ControlValueAccessor ([#8746](https://github.com/angular/material2/issues/8746)) ([92bc503](https://github.com/angular/material2/commit/92bc503)), closes [#8735](https://github.com/angular/material2/issues/8735)
* **autocomplete:** not resetting completely when overlay is detached externally ([#8515](https://github.com/angular/material2/issues/8515)) ([a8cd033](https://github.com/angular/material2/commit/a8cd033))
* **autocomplete:** panelClosingActions emitting twice in some cases ([#8998](https://github.com/angular/material2/issues/8998)) ([4f97232](https://github.com/angular/material2/commit/4f97232))
* **autocomplete:** panelClosingActions emitting when tabbing away from a closed autocomplete ([#8774](https://github.com/angular/material2/issues/8774)) ([92dcd76](https://github.com/angular/material2/commit/92dcd76)), closes [#8763](https://github.com/angular/material2/issues/8763)
* **chip,stepper:** compile cleanly with `"fullTemplateTypeCheck"` ([#8889](https://github.com/angular/material2/issues/8889)) ([50967b6](https://github.com/angular/material2/commit/50967b6))
* **chips:** being able to focus disabled chip by clicking ([#8892](https://github.com/angular/material2/issues/8892)) ([bfd513d](https://github.com/angular/material2/commit/bfd513d)), closes [#8883](https://github.com/angular/material2/issues/8883)
* **chips:** event propagation not stopped by remove button ([#8772](https://github.com/angular/material2/issues/8772)) ([c7e2d4e](https://github.com/angular/material2/commit/c7e2d4e)), closes [#8771](https://github.com/angular/material2/issues/8771)
* **connected-position-strategy:** allow positions to be updated after init ([#8800](https://github.com/angular/material2/issues/8800)) ([b7071ba](https://github.com/angular/material2/commit/b7071ba))
* **datepicker:** leaking backdropClick subscriptions ([#8919](https://github.com/angular/material2/issues/8919)) ([3728555](https://github.com/angular/material2/commit/3728555))
* **datepicker:** not resetting when detached externally ([#9133](https://github.com/angular/material2/issues/9133)) ([a0bd162](https://github.com/angular/material2/commit/a0bd162))
* **datepicker:** typo in MatMonthView export ([#9055](https://github.com/angular/material2/issues/9055)) ([2250747](https://github.com/angular/material2/commit/2250747))
* **datepicker:** unable to close calendar when opened on focus in IE11 ([#8918](https://github.com/angular/material2/issues/8918)) ([a411382](https://github.com/angular/material2/commit/a411382)), closes [#8914](https://github.com/angular/material2/issues/8914)
* **dialog:** change order of button actions ([#9021](https://github.com/angular/material2/issues/9021)) ([230b297](https://github.com/angular/material2/commit/230b297))
* **dialog:** hide all non-overlay content from assistive technology ([#9016](https://github.com/angular/material2/issues/9016)) ([d82124d](https://github.com/angular/material2/commit/d82124d)), closes [#7787](https://github.com/angular/material2/issues/7787)
* **dialog:** improved type safety in dialog ref result ([#8766](https://github.com/angular/material2/issues/8766)) ([571ef46](https://github.com/angular/material2/commit/571ef46)), closes [#8760](https://github.com/angular/material2/issues/8760)
* **directionality:** complete dir change observable ([#8874](https://github.com/angular/material2/issues/8874)) ([41f5fe2](https://github.com/angular/material2/commit/41f5fe2))
* **drawer:** infinite loop when two-way opened binding is toggled mid-animation ([#8872](https://github.com/angular/material2/issues/8872)) ([7c84490](https://github.com/angular/material2/commit/7c84490)), closes [#8869](https://github.com/angular/material2/issues/8869)
* **drawer:** margins not being updated on direction changes ([#9161](https://github.com/angular/material2/issues/9161)) ([ff1c5f1](https://github.com/angular/material2/commit/ff1c5f1)), closes [#9158](https://github.com/angular/material2/issues/9158)
* **drawer:** unable to close using keyboard if there are no focusable elements ([#8783](https://github.com/angular/material2/issues/8783)) ([fba3728](https://github.com/angular/material2/commit/fba3728))
* **expansion:** accordion emitting closed event while closed ([#9101](https://github.com/angular/material2/issues/9101)) ([92ded30](https://github.com/angular/material2/commit/92ded30)), closes [#9098](https://github.com/angular/material2/issues/9098)
* **focus-trap:** server-side rendering error ([#9001](https://github.com/angular/material2/issues/9001)) ([c77f69f](https://github.com/angular/material2/commit/c77f69f)), closes [#8981](https://github.com/angular/material2/issues/8981)
* **form-field:** hide required asterisk if control is disabled ([#8799](https://github.com/angular/material2/issues/8799)) ([1c2f6b7](https://github.com/angular/material2/commit/1c2f6b7)), closes [#8251](https://github.com/angular/material2/issues/8251)
* **global-position-strategy:** error if disposed before applied ([#8761](https://github.com/angular/material2/issues/8761)) ([f565560](https://github.com/angular/material2/commit/f565560)), closes [#8758](https://github.com/angular/material2/issues/8758)
* **icon:** handle values with unnecessary spaces being passed into fontIcon and fontSet ([#9056](https://github.com/angular/material2/issues/9056)) ([1a735bc](https://github.com/angular/material2/commit/1a735bc)), closes [#9054](https://github.com/angular/material2/issues/9054)
* **icon:** server-side error when registering icons ([#8492](https://github.com/angular/material2/issues/8492)) ([b6da765](https://github.com/angular/material2/commit/b6da765)), closes [#6787](https://github.com/angular/material2/issues/6787)
* **input:** align caret color with spec ([#8692](https://github.com/angular/material2/issues/8692)) ([b0449ab](https://github.com/angular/material2/commit/b0449ab))
* **input:** allow color inputs in mat-form-field ([#8748](https://github.com/angular/material2/issues/8748)) ([982982b](https://github.com/angular/material2/commit/982982b)), closes [#8686](https://github.com/angular/material2/issues/8686)
* **layout:** handle platforms that don't support matchMedia ([#8775](https://github.com/angular/material2/issues/8775)) ([4846e4c](https://github.com/angular/material2/commit/4846e4c)), closes [#8710](https://github.com/angular/material2/issues/8710)
* **list:** prevent list icon shrinking ([#9211](https://github.com/angular/material2/issues/9211)) ([5737b9f](https://github.com/angular/material2/commit/5737b9f)), closes [#8699](https://github.com/angular/material2/issues/8699)
* **menu:** not closing when overlay is detached externally ([#8868](https://github.com/angular/material2/issues/8868)) ([4d8c712](https://github.com/angular/material2/commit/4d8c712))
* **paginator:** coerce string values ([#8946](https://github.com/angular/material2/issues/8946)) ([0388202](https://github.com/angular/material2/commit/0388202))
* **paginator:** set default display value ([#8455](https://github.com/angular/material2/issues/8455)) ([bd50fa6](https://github.com/angular/material2/commit/bd50fa6)), closes [#8454](https://github.com/angular/material2/issues/8454)
* **progress-bar:** animation tearing in Firefox 57 ([#9123](https://github.com/angular/material2/issues/9123)) ([9e47d40](https://github.com/angular/material2/commit/9e47d40)), closes [#7606](https://github.com/angular/material2/issues/7606)
* **select:** active item not being updated on click in multiple mode ([#7808](https://github.com/angular/material2/issues/7808)) ([bc27fea](https://github.com/angular/material2/commit/bc27fea))
* **select:** alt + arrow key not opening in single-selection mode ([#8910](https://github.com/angular/material2/issues/8910)) ([a4c042b](https://github.com/angular/material2/commit/a4c042b))
* **select:** change event emitted before data binding is updated ([#8740](https://github.com/angular/material2/issues/8740)) ([5819385](https://github.com/angular/material2/commit/5819385)), closes [#8739](https://github.com/angular/material2/issues/8739)
* **select:** complete state change event ([#8777](https://github.com/angular/material2/issues/8777)) ([4f78613](https://github.com/angular/material2/commit/4f78613))
* **select:** handle `optionSelectionChanges` being accessed early ([#8830](https://github.com/angular/material2/issues/8830)) ([97ebd76](https://github.com/angular/material2/commit/97ebd76))
* **select:** not marked as touched when clicking away ([#8784](https://github.com/angular/material2/issues/8784)) ([984dece](https://github.com/angular/material2/commit/984dece)), closes [#8573](https://github.com/angular/material2/issues/8573)
* **select:** remove aria-owns when options aren't in the DOM ([#9091](https://github.com/angular/material2/issues/9091)) ([d85c44b](https://github.com/angular/material2/commit/d85c44b)), closes [#7023](https://github.com/angular/material2/issues/7023)
* **select:** support using shift + arrow key to toggle items in a multi-select ([#9037](https://github.com/angular/material2/issues/9037)) ([f82bbae](https://github.com/angular/material2/commit/f82bbae))
* **selection-list:** allow jumping to first/last item using home/end ([#9062](https://github.com/angular/material2/issues/9062)) ([bd36529](https://github.com/angular/material2/commit/bd36529))
* **selection-list:** allow users to jump focus to a particular item by typing ([#9026](https://github.com/angular/material2/issues/9026)) ([af44b9d](https://github.com/angular/material2/commit/af44b9d))
* **selection-list:** options not marked as selected if value is assigned too early ([#9090](https://github.com/angular/material2/issues/9090)) ([bd7c751](https://github.com/angular/material2/commit/bd7c751)), closes [#9085](https://github.com/angular/material2/issues/9085)
* **selection-list:** preselected options not being added to the model value ([#9116](https://github.com/angular/material2/issues/9116)) ([91ea1a1](https://github.com/angular/material2/commit/91ea1a1))
* **selection-list:** remove selected option from model value on destroy ([#9106](https://github.com/angular/material2/issues/9106)) ([f8cd8eb](https://github.com/angular/material2/commit/f8cd8eb))
* **selection-list:** unable to select using the enter key ([#8595](https://github.com/angular/material2/issues/8595)) ([9105302](https://github.com/angular/material2/commit/9105302)), closes [#8589](https://github.com/angular/material2/issues/8589)
* **slider:** prevent slider thumb from getting cropped ([#8061](https://github.com/angular/material2/issues/8061)) ([0b05a1f](https://github.com/angular/material2/commit/0b05a1f))
* **stepper:** completed binding not being considered when moving from a step without a stepControl ([#9126](https://github.com/angular/material2/issues/9126)) ([32d0dbb](https://github.com/angular/material2/commit/32d0dbb)), closes [#8110](https://github.com/angular/material2/issues/8110)
* **stepper:** use up/down arrows for navigating vertical stepper ([#8920](https://github.com/angular/material2/issues/8920)) ([7b78b74](https://github.com/angular/material2/commit/7b78b74))
* **table:** inaccurate row height ([#8303](https://github.com/angular/material2/issues/8303)) ([baa8a6e](https://github.com/angular/material2/commit/baa8a6e)), closes [#8299](https://github.com/angular/material2/issues/8299)
* too strict peer dependency of angular ([#9355](https://github.com/angular/material2/issues/9355)) ([7187670](https://github.com/angular/material2/commit/7187670)), closes [#9328](https://github.com/angular/material2/issues/9328)
* **table:** row content not centered in IE ([#6820](https://github.com/angular/material2/issues/6820)) ([1b79e92](https://github.com/angular/material2/commit/1b79e92)), closes [#6813](https://github.com/angular/material2/issues/6813)
* **table:** set height of mat-header-row to 56px ([#8215](https://github.com/angular/material2/issues/8215)) ([0c4ee2e](https://github.com/angular/material2/commit/0c4ee2e))
* **theming:** light text on colored backgrounds should be opaque ([#7421](https://github.com/angular/material2/issues/7421)) ([1701b98](https://github.com/angular/material2/commit/1701b98))
* **typography:** deprecation warning if null font family is passed in ([#9002](https://github.com/angular/material2/issues/9002)) ([d8c1392](https://github.com/angular/material2/commit/d8c1392)), closes [#8973](https://github.com/angular/material2/issues/8973)
* **typography:** handle inherit being set as a typography value ([#8721](https://github.com/angular/material2/issues/8721)) ([139c506](https://github.com/angular/material2/commit/139c506)), closes [#8700](https://github.com/angular/material2/issues/8700)


### Features

* **autocomplete:** allow option ripples to be disabled ([#8851](https://github.com/angular/material2/issues/8851)) ([ff31ac8](https://github.com/angular/material2/commit/ff31ac8))
* **close-scroll-strategy:** add scroll threshold option ([#8656](https://github.com/angular/material2/issues/8656)) ([c0ff761](https://github.com/angular/material2/commit/c0ff761))
* **datepicker:** add animation to calendar popup ([#8542](https://github.com/angular/material2/issues/8542)) ([c3e267f](https://github.com/angular/material2/commit/c3e267f))
* **datepicker:** add year selection mode ([#8565](https://github.com/angular/material2/issues/8565)) ([cdbabf7](https://github.com/angular/material2/commit/cdbabf7))
* **dialog:** allow default dialog options to be configurable ([#9113](https://github.com/angular/material2/issues/9113)) ([05304f0](https://github.com/angular/material2/commit/05304f0))
* **dialog:** allow for closing on navigation to be disabled ([#9024](https://github.com/angular/material2/issues/9024)) ([c349c58](https://github.com/angular/material2/commit/c349c58)), closes [#8983](https://github.com/angular/material2/issues/8983)
* **dialog:** allow for single dialog scroll strategy to be overwritten ([#8726](https://github.com/angular/material2/issues/8726)) ([c7de734](https://github.com/angular/material2/commit/c7de734)), closes [#8706](https://github.com/angular/material2/issues/8706)
* **divider:** move divider out of mat-list ([#5862](https://github.com/angular/material2/issues/5862)) ([bd0ec64](https://github.com/angular/material2/commit/bd0ec64))
* **elevations:** Allow tonal color elevations through mat-elevation mixin. ([#8995](https://github.com/angular/material2/issues/8995)) ([21d004a](https://github.com/angular/material2/commit/21d004a))
* **expansion-panel:** allow for content to be rendered lazily ([#8243](https://github.com/angular/material2/issues/8243)) ([60ba0a7](https://github.com/angular/material2/commit/60ba0a7)), closes [#8230](https://github.com/angular/material2/issues/8230)
* **table:** support directly adding column, row, and header defs ([#8744](https://github.com/angular/material2/issues/8744)) ([693c8e8](https://github.com/angular/material2/commit/693c8e8))
* **tabs:** add animation done event [#5238](https://github.com/angular/material2/issues/5238) ([#6811](https://github.com/angular/material2/issues/6811)) ([3a52624](https://github.com/angular/material2/commit/3a52624))
* **tooltip:** add injection token for specifying the default delays ([#8109](https://github.com/angular/material2/issues/8109)) ([3dcf4cd](https://github.com/angular/material2/commit/3dcf4cd)), closes [#7928](https://github.com/angular/material2/issues/7928)


### Performance Improvements

* **ripple:** do not register events if ripples are disabled initially ([#8882](https://github.com/angular/material2/issues/8882)) ([58b93dc](https://github.com/angular/material2/commit/58b93dc))
* **ripple:** use passive event listeners ([#8719](https://github.com/angular/material2/issues/8719)) ([12feff7](https://github.com/angular/material2/commit/12feff7))



<a name="5.0.4"></a>
# [5.0.4 linoleum-wormhole](https://github.com/angular/material2/compare/5.0.0...5.0.4) (2018-01-08)


### Bug Fixes

* **chips:** being able to focus disabled chip by clicking ([#8892](https://github.com/angular/material2/issues/8892)) ([699b7c2](https://github.com/angular/material2/commit/699b7c2)), closes [#8883](https://github.com/angular/material2/issues/8883)
* **datepicker:** typo in MatMonthView export ([#9055](https://github.com/angular/material2/issues/9055)) ([3e99bcc](https://github.com/angular/material2/commit/3e99bcc))
* **dialog:** hide all non-overlay content from assistive technology ([#9016](https://github.com/angular/material2/issues/9016)) ([ef06a9c](https://github.com/angular/material2/commit/ef06a9c)), closes [#7787](https://github.com/angular/material2/issues/7787)
* **directionality:** complete dir change observable ([#8874](https://github.com/angular/material2/issues/8874)) ([a2438fa](https://github.com/angular/material2/commit/a2438fa))
* **drawer:** margins not being updated on direction changes ([#9161](https://github.com/angular/material2/issues/9161)) ([f64a857](https://github.com/angular/material2/commit/f64a857)), closes [#9158](https://github.com/angular/material2/issues/9158)
* **expansion:** accordion emitting closed event while closed ([#9101](https://github.com/angular/material2/issues/9101)) ([50161ae](https://github.com/angular/material2/commit/50161ae)), closes [#9098](https://github.com/angular/material2/issues/9098)
* **focus-trap:** server-side rendering error ([#9001](https://github.com/angular/material2/issues/9001)) ([7698193](https://github.com/angular/material2/commit/7698193)), closes [#8981](https://github.com/angular/material2/issues/8981)
* **icon:** handle values with unnecessary spaces being passed into fontIcon and fontSet ([#9056](https://github.com/angular/material2/issues/9056)) ([b71d954](https://github.com/angular/material2/commit/b71d954)), closes [#9054](https://github.com/angular/material2/issues/9054)
* **icon:** server-side error when registering icons ([#8492](https://github.com/angular/material2/issues/8492)) ([61b12b6](https://github.com/angular/material2/commit/61b12b6)), closes [#6787](https://github.com/angular/material2/issues/6787)
* **input:** align caret color with spec ([#8692](https://github.com/angular/material2/issues/8692)) ([1eb8450](https://github.com/angular/material2/commit/1eb8450))
* **layout:** handle platforms that don't support matchMedia ([#8775](https://github.com/angular/material2/issues/8775)) ([673a636](https://github.com/angular/material2/commit/673a636)), closes [#8710](https://github.com/angular/material2/issues/8710)
* **progress-bar:** animation tearing in Firefox 57 ([#9123](https://github.com/angular/material2/issues/9123)) ([255f9d8](https://github.com/angular/material2/commit/255f9d8)), closes [#7606](https://github.com/angular/material2/issues/7606)
* **select:** active item not being updated on click in multiple mode ([#7808](https://github.com/angular/material2/issues/7808)) ([ce2487e](https://github.com/angular/material2/commit/ce2487e))
* **select:** not marked as touched when clicking away ([#8784](https://github.com/angular/material2/issues/8784)) ([c0209fc](https://github.com/angular/material2/commit/c0209fc)), closes [#8573](https://github.com/angular/material2/issues/8573)
* **select:** remove aria-owns when options aren't in the DOM ([#9091](https://github.com/angular/material2/issues/9091)) ([4a03497](https://github.com/angular/material2/commit/4a03497)), closes [#7023](https://github.com/angular/material2/issues/7023)
* **select:** support using shift + arrow key to toggle items in a multi-select ([#9037](https://github.com/angular/material2/issues/9037)) ([76055a4](https://github.com/angular/material2/commit/76055a4))
* **selection-list:** allow jumping to first/last item using home/end ([#9062](https://github.com/angular/material2/issues/9062)) ([6d70f2c](https://github.com/angular/material2/commit/6d70f2c))
* **selection-list:** allow users to jump focus to a particular item by typing ([#9026](https://github.com/angular/material2/issues/9026)) ([7167113](https://github.com/angular/material2/commit/7167113))
* **selection-list:** options not marked as selected if value is assigned too early ([#9090](https://github.com/angular/material2/issues/9090)) ([c61a289](https://github.com/angular/material2/commit/c61a289)), closes [#9085](https://github.com/angular/material2/issues/9085)
* **selection-list:** preselected options not being added to the model value ([#9116](https://github.com/angular/material2/issues/9116)) ([2235239](https://github.com/angular/material2/commit/2235239))
* **selection-list:** remove selected option from model value on destroy ([#9106](https://github.com/angular/material2/issues/9106)) ([02a1334](https://github.com/angular/material2/commit/02a1334))
* **stepper:** completed binding not being considered when moving from a step without a stepControl ([#9126](https://github.com/angular/material2/issues/9126)) ([9da4e71](https://github.com/angular/material2/commit/9da4e71)), closes [#8110](https://github.com/angular/material2/issues/8110)
* **stepper:** use up/down arrows for navigating vertical stepper ([#8920](https://github.com/angular/material2/issues/8920)) ([a6c7888](https://github.com/angular/material2/commit/a6c7888))
* **typography:** deprecation warning if null font family is passed in ([#9002](https://github.com/angular/material2/issues/9002)) ([497816b](https://github.com/angular/material2/commit/497816b)), closes [#8973](https://github.com/angular/material2/issues/8973)


### Performance Improvements

* **ripple:** do not register events if ripples are disabled initially ([#8882](https://github.com/angular/material2/issues/8882)) ([4838f02](https://github.com/angular/material2/commit/4838f02))



<a name="5.0.3"></a>
# [5.0.3 concrete-aeroplane](https://github.com/angular/material2/compare/5.0.1...5.0.3) (2018-01-02)


### Bug Fixes

* **autocomplete:** panelClosingActions emitting twice in some cases ([#8998](https://github.com/angular/material2/issues/8998)) ([22c3259](https://github.com/angular/material2/commit/22c3259))
* **dialog:** change order of button actions ([#9021](https://github.com/angular/material2/issues/9021)) ([7b879a5](https://github.com/angular/material2/commit/7b879a5))



<a name="5.0.2"></a>
# [5.0.2 flannel-battlestar](https://github.com/angular/material2/compare/5.0.0...5.0.2) (2017-12-19)


### Bug Fixes

* **aria-describer:** server-side rendering error during cleanup ([#8903](https://github.com/angular/material2/issues/8903)) ([b2370ce](https://github.com/angular/material2/commit/b2370ce)), closes [#8901](https://github.com/angular/material2/issues/8901)
* **autocomplete:** not implementing setDisabledState from ControlValueAccessor ([#8746](https://github.com/angular/material2/issues/8746)) ([ae639da](https://github.com/angular/material2/commit/ae639da)), closes [#8735](https://github.com/angular/material2/issues/8735)
* **autocomplete:** not resetting completely when overlay is detached externally ([#8515](https://github.com/angular/material2/issues/8515)) ([8e14343](https://github.com/angular/material2/commit/8e14343))
* **autocomplete:** panelClosingActions emitting when tabbing away from a closed autocomplete ([#8774](https://github.com/angular/material2/issues/8774)) ([3066929](https://github.com/angular/material2/commit/3066929)), closes [#8763](https://github.com/angular/material2/issues/8763)
* **autosize:** not updating when window is resized ([#8619](https://github.com/angular/material2/issues/8619)) ([97f67c5](https://github.com/angular/material2/commit/97f67c5)), closes [#8610](https://github.com/angular/material2/issues/8610)
* **autosize:** remove resize handle ([#8621](https://github.com/angular/material2/issues/8621)) ([28452ab](https://github.com/angular/material2/commit/28452ab))
* **chip,stepper:** compile cleanly with `"fullTemplateTypeCheck"` ([#8889](https://github.com/angular/material2/issues/8889)) ([eec7c73](https://github.com/angular/material2/commit/eec7c73))
* **chips:** event propagation not stopped by remove button ([#8772](https://github.com/angular/material2/issues/8772)) ([0236623](https://github.com/angular/material2/commit/0236623)), closes [#8771](https://github.com/angular/material2/issues/8771)
* **connected-position-strategy:** allow positions to be updated after init ([#8800](https://github.com/angular/material2/issues/8800)) ([c207219](https://github.com/angular/material2/commit/c207219))
* **datepicker:** leaking backdropClick subscriptions ([#8919](https://github.com/angular/material2/issues/8919)) ([baf22ec](https://github.com/angular/material2/commit/baf22ec))
* **dialog:** improved type safety in dialog ref result ([#8766](https://github.com/angular/material2/issues/8766)) ([657f649](https://github.com/angular/material2/commit/657f649)), closes [#8760](https://github.com/angular/material2/issues/8760)
* **drawer:** infinite loop when two-way opened binding is toggled mid-animation ([#8872](https://github.com/angular/material2/issues/8872)) ([241be7a](https://github.com/angular/material2/commit/241be7a)), closes [#8869](https://github.com/angular/material2/issues/8869)
* **drawer:** unable to close using keyboard if there are no focusable elements ([#8783](https://github.com/angular/material2/issues/8783)) ([9aabb14](https://github.com/angular/material2/commit/9aabb14))
* **global-position-strategy:** error if disposed before applied ([#8761](https://github.com/angular/material2/issues/8761)) ([8d79cc8](https://github.com/angular/material2/commit/8d79cc8)), closes [#8758](https://github.com/angular/material2/issues/8758)
* **input:** allow color inputs in mat-form-field ([#8748](https://github.com/angular/material2/issues/8748)) ([92d198b](https://github.com/angular/material2/commit/92d198b)), closes [#8686](https://github.com/angular/material2/issues/8686)
* **menu:** not closing when overlay is detached externally ([#8868](https://github.com/angular/material2/issues/8868)) ([534c797](https://github.com/angular/material2/commit/534c797))
* **overlay:** export OverlaySizeConfig ([#8932](https://github.com/angular/material2/issues/8932)) ([adfa31e](https://github.com/angular/material2/commit/adfa31e))
* **paginator:** set default display value ([#8455](https://github.com/angular/material2/issues/8455)) ([ccb325e](https://github.com/angular/material2/commit/ccb325e)), closes [#8454](https://github.com/angular/material2/issues/8454)
* **portal:** inaccurate hasAttahed result and portal being cleared if attached too early ([#8642](https://github.com/angular/material2/issues/8642)) ([93e6c53](https://github.com/angular/material2/commit/93e6c53)), closes [/github.com/angular/material2/blob/master/src/lib/dialog/dialog-container.ts#L118](https://github.com//github.com/angular/material2/blob/master/src/lib/dialog/dialog-container.ts/issues/L118) [#8628](https://github.com/angular/material2/issues/8628)
* **select:** alt + arrow key not opening in single-selection mode ([#8910](https://github.com/angular/material2/issues/8910)) ([85f83f9](https://github.com/angular/material2/commit/85f83f9))
* **select:** change event emitted before data binding is updated ([#8740](https://github.com/angular/material2/issues/8740)) ([2493797](https://github.com/angular/material2/commit/2493797)), closes [#8739](https://github.com/angular/material2/issues/8739)
* **select:** complete state change event ([#8777](https://github.com/angular/material2/issues/8777)) ([46411e3](https://github.com/angular/material2/commit/46411e3))
* safety check for window in common module. ([#8816](https://github.com/angular/material2/issues/8816)) ([a6cedd2](https://github.com/angular/material2/commit/a6cedd2)), closes [#8809](https://github.com/angular/material2/issues/8809)
* **select:** handle `optionSelectionChanges` being accessed early ([#8830](https://github.com/angular/material2/issues/8830)) ([c98321c](https://github.com/angular/material2/commit/c98321c))
* **select,input:** inconsistent disabled text color ([#7794](https://github.com/angular/material2/issues/7794)) ([4d47750](https://github.com/angular/material2/commit/4d47750)), closes [#7793](https://github.com/angular/material2/issues/7793)
* **selection-list:** unable to select using the enter key ([#8595](https://github.com/angular/material2/issues/8595)) ([c23853f](https://github.com/angular/material2/commit/c23853f)), closes [#8589](https://github.com/angular/material2/issues/8589)
* **slider:** prevent slider thumb from getting cropped ([#8061](https://github.com/angular/material2/issues/8061)) ([f33c7cf](https://github.com/angular/material2/commit/f33c7cf))
* **tooltip:** not closing when scrolling away ([#8688](https://github.com/angular/material2/issues/8688)) ([e96a847](https://github.com/angular/material2/commit/e96a847))
* **typography:** handle inherit being set as a typography value ([#8721](https://github.com/angular/material2/issues/8721)) ([e45b164](https://github.com/angular/material2/commit/e45b164)), closes [#8700](https://github.com/angular/material2/issues/8700)


### Performance Improvements

* **ripple:** use passive event listeners ([#8719](https://github.com/angular/material2/issues/8719)) ([d67f971](https://github.com/angular/material2/commit/d67f971))



<a name="5.0.1"></a>
# [5.0.1 ceramic-gravy](https://github.com/angular/material2/compare/5.0.0...5.0.1) (2017-12-11)


### Bug Fixes

* **common:** safety check for window in common module. ([#8816](https://github.com/angular/material2/issues/8816)) ([fb9ea53](https://github.com/angular/material2/commit/fb9ea53)), closes [#8809](https://github.com/angular/material2/issues/8809)
* **autosize:** not updating when window is resized ([#8619](https://github.com/angular/material2/issues/8619)) ([b8664b8](https://github.com/angular/material2/commit/b8664b8)), closes [#8610](https://github.com/angular/material2/issues/8610)
* **autosize:** remove resize handle ([#8621](https://github.com/angular/material2/issues/8621)) ([0d2a419](https://github.com/angular/material2/commit/0d2a419))
* **overlay:** export OverlaySizeConfig ([#8932](https://github.com/angular/material2/issues/8932)) ([a626c8f](https://github.com/angular/material2/commit/a626c8f))
* **portal:** inaccurate hasAttached result and portal being cleared if attached too early ([#8642](https://github.com/angular/material2/issues/8642)) ([b488b39](https://github.com/angular/material2/commit/b488b39)), closes [#8628](https://github.com/angular/material2/issues/8628)
* **select,input:** inconsistent disabled text color ([#7794](https://github.com/angular/material2/issues/7794)) ([f31be6f](https://github.com/angular/material2/commit/f31be6f)), closes [#7793](https://github.com/angular/material2/issues/7793)
* **tooltip:** not closing when scrolling away ([#8688](https://github.com/angular/material2/issues/8688)) ([d5a2fca](https://github.com/angular/material2/commit/d5a2fca))



<a name="5.0.0"></a>
# [5.0.0 velvet-cuttlefish](https://github.com/angular/material2/compare/5.0.0-rc.3...5.0.0) (2017-12-06)


### Bug Fixes

* **drawer:** avoid initial animation when rendering on the server ([#8828](https://github.com/angular/material2/issues/8828)) ([2b1f84e](https://github.com/angular/material2/commit/2b1f84e)), closes [#6865](https://github.com/angular/material2/issues/6865)
* **tabs:**  hide tab body content after leaving the tab's view area ([#8827](https://github.com/angular/material2/issues/8827)) ([05d726d](https://github.com/angular/material2/commit/05d726d))


### Features

* **selection-list:** support for ngModel ([#7456](https://github.com/angular/material2/issues/7456)) ([3fbb28a](https://github.com/angular/material2/commit/3fbb28a)), closes [#6896](https://github.com/angular/material2/issues/6896)



<a name="5.0.0-rc.3"></a>
# [5.0.0-rc.3 ink-sparkler](https://github.com/angular/material2/compare/5.0.0-rc.2...5.0.0-rc.3) (2017-12-05)


### BREAKING CHANGES

* **overlay:** OverlayRef.getConfig returns an immutable version of
the config object.
* **overlay:** OverlayRef.updateSize now accepts a OverlaySizeConfig
rather than being based on the existing config object.


### Features

* **checkbox:** Support checkbox click action config ([#8521](https://github.com/angular/material2/issues/8521)) ([537b8b5](https://github.com/angular/material2/commit/537b8b5))
* **datepicker:** add opened input binding ([#8098](https://github.com/angular/material2/issues/8098)) ([2b9bc57](https://github.com/angular/material2/commit/2b9bc57)), closes [#8094](https://github.com/angular/material2/issues/8094)
* **form-field:** add support for separate label and placeholder ([#8223](https://github.com/angular/material2/issues/8223)) ([d6fec35](https://github.com/angular/material2/commit/d6fec35)), closes [#6194](https://github.com/angular/material2/issues/6194)
* **ripple:** handle touch events ([#7927](https://github.com/angular/material2/issues/7927)) ([65cd1a1](https://github.com/angular/material2/commit/65cd1a1)), closes [#7062](https://github.com/angular/material2/issues/7062)
* **sort:** add the ability to disable sort toggling ([#8643](https://github.com/angular/material2/issues/8643)) ([7576a73](https://github.com/angular/material2/commit/7576a73)), closes [#8622](https://github.com/angular/material2/issues/8622)


### Bug Fixes

* **checkbox:** don't hide focus indicator on space press. ([#8539](https://github.com/angular/material2/issues/8539)) ([9e35bf0](https://github.com/angular/material2/commit/9e35bf0))
* **chip-list:** fix error state changes in chip list ([#8425](https://github.com/angular/material2/issues/8425)) ([d2c11ca](https://github.com/angular/material2/commit/d2c11ca))
* **chip-list:** stateChanges stream not being completed ([#8636](https://github.com/angular/material2/issues/8636)) ([61dada8](https://github.com/angular/material2/commit/61dada8))
* **datepicker:** calendar overlapping input when in a fallback position ([#8099](https://github.com/angular/material2/issues/8099)) ([e5b7afe](https://github.com/angular/material2/commit/e5b7afe))
* **datepicker:** keyboard fixes (enter matches click behavior & corre… ([#7370](https://github.com/angular/material2/issues/7370)) ([0b2757c](https://github.com/angular/material2/commit/0b2757c))
* **datepicker:** placeholder not floating when an invalid value is typed in ([#8603](https://github.com/angular/material2/issues/8603)) ([f0789eb](https://github.com/angular/material2/commit/f0789eb)), closes [#8575](https://github.com/angular/material2/issues/8575)
* **directionality:** change event now emit the new value ([#8424](https://github.com/angular/material2/issues/8424)) ([841f753](https://github.com/angular/material2/commit/841f753))
* **drawer:** allow for drawer container to auto-resize while open ([#8488](https://github.com/angular/material2/issues/8488)) ([e7b412a](https://github.com/angular/material2/commit/e7b412a)), closes [#6743](https://github.com/angular/material2/issues/6743)
* **form-field:** unable to tap on certain types of inputs on iOS ([#8543](https://github.com/angular/material2/issues/8543)) ([74c1d01](https://github.com/angular/material2/commit/74c1d01)), closes [#8001](https://github.com/angular/material2/issues/8001)
* **input:** Add pure-CSS floating label logic that will work on... ([#8491](https://github.com/angular/material2/issues/8491)) ([1a7a61a](https://github.com/angular/material2/commit/1a7a61a))
* **input:** stuck in focused state if disabled while in focus ([#8637](https://github.com/angular/material2/issues/8637)) ([bec4cfe](https://github.com/angular/material2/commit/bec4cfe)), closes [#8634](https://github.com/angular/material2/issues/8634)
* **list:** fix role for list-item ([#8767](https://github.com/angular/material2/issues/8767)) ([8f7c7cf](https://github.com/angular/material2/commit/8f7c7cf))
* **menu:** not closing when overlay is detached externally ([#8654](https://github.com/angular/material2/issues/8654)) ([dd3094f](https://github.com/angular/material2/commit/dd3094f))
* **menu:** Set menu-item icon color only when not set on mat-icon ([#8614](https://github.com/angular/material2/issues/8614)) ([d0cb077](https://github.com/angular/material2/commit/d0cb077)), closes [#8594](https://github.com/angular/material2/issues/8594)
* **overlay:** add horizontal fallback positions to the connected overlay defaults ([#8689](https://github.com/angular/material2/issues/8689)) ([e939ea7](https://github.com/angular/material2/commit/e939ea7)), closes [#8318](https://github.com/angular/material2/issues/8318)
* **overlay:** make config immutable for existing refs ([#7376](https://github.com/angular/material2/issues/7376)) ([2dbc766](https://github.com/angular/material2/commit/2dbc766))
* **progress-spinner:** value not updated while in indeterminate mode ([#8269](https://github.com/angular/material2/issues/8269)) ([9b68b54](https://github.com/angular/material2/commit/9b68b54))
* **radio:** coerce checked input binding ([#8556](https://github.com/angular/material2/issues/8556)) ([f41fa8c](https://github.com/angular/material2/commit/f41fa8c))
* **select:** option not truncated correctly in multiple mode ([#7857](https://github.com/angular/material2/issues/7857)) ([d04aa19](https://github.com/angular/material2/commit/d04aa19))
* **selection-model:** inaccurate selected value when accessed in change subscription ([#8599](https://github.com/angular/material2/issues/8599)) ([0f7fbda](https://github.com/angular/material2/commit/0f7fbda)), closes [#8584](https://github.com/angular/material2/issues/8584)
* **sidenav:** remove min-width ([#7748](https://github.com/angular/material2/issues/7748)) ([55a9f9a](https://github.com/angular/material2/commit/55a9f9a))
* **slide-toggle:** height collapsing if component doesn't have a label ([#8270](https://github.com/angular/material2/issues/8270)) ([8205cb2](https://github.com/angular/material2/commit/8205cb2)), closes [#8264](https://github.com/angular/material2/issues/8264)
* **snack-bar:** not applying all panel classes in IE ([#8578](https://github.com/angular/material2/issues/8578)) ([a6d0847](https://github.com/angular/material2/commit/a6d0847))
* **stepper:** block linear stepper for pending components ([#8646](https://github.com/angular/material2/issues/8646)) ([53c94c7](https://github.com/angular/material2/commit/53c94c7)), closes [#8645](https://github.com/angular/material2/issues/8645)
* **stepper:** set appropriate aria-orientation ([#8657](https://github.com/angular/material2/issues/8657)) ([9582b8b](https://github.com/angular/material2/commit/9582b8b))
* **tabs:** pagination not enabled on init on some browsers ([#8104](https://github.com/angular/material2/issues/8104)) ([2c34a7e](https://github.com/angular/material2/commit/2c34a7e)), closes [#7983](https://github.com/angular/material2/issues/7983)
* blurry ripples for slide-toggle, radio, checkbox in MS edge. ([#8514](https://github.com/angular/material2/issues/8514)) ([8b7a3af](https://github.com/angular/material2/commit/8b7a3af)), closes [#8392](https://github.com/angular/material2/issues/8392)
* **tooltip:** close tooltip if message is cleared while open ([#8544](https://github.com/angular/material2/issues/8544)) ([d66284d](https://github.com/angular/material2/commit/d66284d))
* **tooltip:** unable to type in input with tooltip on iOS ([#8534](https://github.com/angular/material2/issues/8534)) ([75c665a](https://github.com/angular/material2/commit/75c665a)), closes [#8331](https://github.com/angular/material2/issues/8331)



<a name="5.0.0-rc.2 wool-wish"></a>
# [5.0.0-rc.2](https://github.com/angular/material2/compare/5.0.0-rc.1...5.0.0-rc.2) (2017-11-27)


### Bug Fixes

* **overlay:** disposed overlays not removed from the key event stack ([#8226](https://github.com/angular/material2/issues/8226)) ([461dfaf](https://github.com/angular/material2/commit/461dfaf))
* **tabs:** fix accidentally setting `top` instead of `width` after removing Renderer use ([#8602](https://github.com/angular/material2/issues/8602)) ([6e865b7](https://github.com/angular/material2/commit/6e865b7))

### Features
* The examples on [material.angular.io](https://material.angular.io) are now opened externally via
StackBlitz instead of Plunker.


<a name="5.0.0-rc.1 felt-photon"></a>
# [5.0.0-rc.1](https://github.com/angular/material2/compare/5.0.0-rc0...5.0.0-rc.1) (2017-11-20)


### Bug Fixes

* **autosize:** incorrect height with long placeholders ([#8024](https://github.com/angular/material2/issues/8024)) ([ad7cb4a](https://github.com/angular/material2/commit/ad7cb4a)), closes [#8013](https://github.com/angular/material2/issues/8013)
* **cdk-observers:**  prevent attribute renaming in closure compilers advanced optimizations  ([#7894](https://github.com/angular/material2/issues/7894)) ([8dfe470](https://github.com/angular/material2/commit/8dfe470))
* **checkbox:** Set aria-checkbox to mixed for indeterminate checkbox ([#8089](https://github.com/angular/material2/issues/8089)) ([3037a90](https://github.com/angular/material2/commit/3037a90))
* **chip:** fix placeholder and text overlap ([#8468](https://github.com/angular/material2/issues/8468)) ([81db650](https://github.com/angular/material2/commit/81db650))
* **chips:** remove chip bottom margin in sibling chips ([#8198](https://github.com/angular/material2/issues/8198)) ([d79903a](https://github.com/angular/material2/commit/d79903a))
* **chips:** use all available space for the input ([#7462](https://github.com/angular/material2/issues/7462)) ([c725249](https://github.com/angular/material2/commit/c725249))
* **datepicker:** add missing exportAs ([#7782](https://github.com/angular/material2/issues/7782)) ([d6d9ff8](https://github.com/angular/material2/commit/d6d9ff8))
* **datepicker:** correct DST issues on IE 11 ([#7858](https://github.com/angular/material2/issues/7858)) ([2f2325a](https://github.com/angular/material2/commit/2f2325a))
* **datepicker:** correct overlay broad style selector ([#8130](https://github.com/angular/material2/issues/8130)) ([f69c8e6](https://github.com/angular/material2/commit/f69c8e6))
* **datepicker:** prevent `matInput` from clobbering date value ([#7831](https://github.com/angular/material2/issues/7831)) ([4b59ca1](https://github.com/angular/material2/commit/4b59ca1))
* **drawer:** invalid margin declaration when rendering server-side ([#8324](https://github.com/angular/material2/issues/8324)) ([5600b80](https://github.com/angular/material2/commit/5600b80))
* **drawer:** missing elevation shadow ([#8387](https://github.com/angular/material2/issues/8387)) ([b0756a2](https://github.com/angular/material2/commit/b0756a2)), closes [#8386](https://github.com/angular/material2/issues/8386)
* **drawer:** re-add openedStart and closedStart events ([#7747](https://github.com/angular/material2/issues/7747)) ([7610c7c](https://github.com/angular/material2/commit/7610c7c))
* **expansion:** prevent memory leak by calling parent ngOnDestroy ([#8410](https://github.com/angular/material2/issues/8410)) ([f6bd9b0](https://github.com/angular/material2/commit/f6bd9b0))
* **fab-buttons:** vertically align icons inside fab buttons ([#8442](https://github.com/angular/material2/issues/8442)) ([43217ef](https://github.com/angular/material2/commit/43217ef))
* **form-field:** jumping underline in Edge and Firefox ([#8480](https://github.com/angular/material2/issues/8480)) ([c7ab877](https://github.com/angular/material2/commit/c7ab877)), closes [#8395](https://github.com/angular/material2/issues/8395)
* **icon:** remove IDs from source icon set from rendered output ([#8266](https://github.com/angular/material2/issues/8266)) ([76806e3](https://github.com/angular/material2/commit/76806e3))
* **input:** add aria-required to inputs ([#8034](https://github.com/angular/material2/issues/8034)) ([8178d6f](https://github.com/angular/material2/commit/8178d6f))
* **input:** remove native IE reveal icon ([#8439](https://github.com/angular/material2/issues/8439)) ([47055a7](https://github.com/angular/material2/commit/47055a7)), closes [#8390](https://github.com/angular/material2/issues/8390)
* **select:** error when attempting to open before init ([#8242](https://github.com/angular/material2/issues/8242)) ([ba36d3a](https://github.com/angular/material2/commit/ba36d3a))
* **progress-spinner:** coerceNumber values ([#7791](https://github.com/angular/material2/issues/7791)) ([b6712f8](https://github.com/angular/material2/commit/b6712f8))
* **list:** multi-line list item spacing ([#8339](https://github.com/angular/material2/issues/8339)) ([bb504ad](https://github.com/angular/material2/commit/bb504ad)), closes [#8333](https://github.com/angular/material2/issues/8333)
* **menu:** return focus to root trigger when closed by mouse ([#8348](https://github.com/angular/material2/issues/8348)) ([b085dc6](https://github.com/angular/material2/commit/b085dc6)), closes [#8290](https://github.com/angular/material2/issues/8290)
* **overlay:** better handling of server-side rendering ([#8422](https://github.com/angular/material2/issues/8422)) ([0f83b20](https://github.com/angular/material2/commit/0f83b20)), closes [#8412](https://github.com/angular/material2/issues/8412)
* **overlay:** complete key event stream on dispose ([#8341](https://github.com/angular/material2/issues/8341)) ([b437b45](https://github.com/angular/material2/commit/b437b45))
* **overlay:** remove global keydown listener when there are no open overlays ([#8389](https://github.com/angular/material2/issues/8389)) ([131272a](https://github.com/angular/material2/commit/131272a))
* **progress-spinner:** default strokeWidth to 10% of the diameter ([#7746](https://github.com/angular/material2/issues/7746)) ([b997353](https://github.com/angular/material2/commit/b997353))
* **slide-toggle:** drag not working in edge ([#8421](https://github.com/angular/material2/issues/8421)) ([d6f287e](https://github.com/angular/material2/commit/d6f287e)), closes [#8391](https://github.com/angular/material2/issues/8391)
* **snack-bar:** complete onAction observable on close ([#8183](https://github.com/angular/material2/issues/8183)) ([bc8560e](https://github.com/angular/material2/commit/bc8560e))
* **stepper:** update state when steps change ([#8398](https://github.com/angular/material2/issues/8398)) ([2bc0b41](https://github.com/angular/material2/commit/2bc0b41))
* **tabs:** detach tab portal when tab hides from view ([#8486](https://github.com/angular/material2/issues/8486)) ([fbf2987](https://github.com/angular/material2/commit/fbf2987))
* **tooltip:** allow toolip to reopen when closed by detaching overlay ([#8232](https://github.com/angular/material2/issues/8232)) ([0719c38](https://github.com/angular/material2/commit/0719c38))
* consistently coerce boolean and number properties ([#7283](https://github.com/angular/material2/issues/7283)) ([3ca801a](https://github.com/angular/material2/commit/3ca801a))
* replace extendObject utility w/ object spread ([#7372](https://github.com/angular/material2/issues/7372)) ([ea54edb](https://github.com/angular/material2/commit/ea54edb))
* using correct global name in rollup bundle ([#8407](https://github.com/angular/material2/issues/8407)) ([40be1f2](https://github.com/angular/material2/commit/40be1f2))
* TypeScript interfaces are now documented on https://material.angular.io

### Features

* **a11y:** add autoCapture option to cdkTrapFocus ([#7641](https://github.com/angular/material2/issues/7641)) ([20b47d7](https://github.com/angular/material2/commit/20b47d7))
* **datepicker:** dispatch events when datepicker is opened and closed ([#7792](https://github.com/angular/material2/issues/7792)) ([998153a](https://github.com/angular/material2/commit/998153a))
* **dialog:** add ariaLabel and focusOnOpen config options ([#6558](https://github.com/angular/material2/issues/6558)) ([dad5922](https://github.com/angular/material2/commit/dad5922))
* **gestures:** add injection token for specifying Hammer.js options ([#8106](https://github.com/angular/material2/issues/8106)) ([f2a0206](https://github.com/angular/material2/commit/f2a0206)), closes [#7097](https://github.com/angular/material2/issues/7097)
* **menu:** allow disabling ripples on items ([#8388](https://github.com/angular/material2/issues/8388)) ([ce23395](https://github.com/angular/material2/commit/ce23395)), closes [#8261](https://github.com/angular/material2/issues/8261)
* **overlay:** add option to re-use last preferred position when re-applying to open connected overlay ([#7805](https://github.com/angular/material2/issues/7805)) ([f83beb8](https://github.com/angular/material2/commit/f83beb8))
* **reposition-scroll-strategy:** add option for closing once the user scrolls away ([#8233](https://github.com/angular/material2/issues/8233)) ([58598c4](https://github.com/angular/material2/commit/58598c4))
* **slider:** support specifying tabindex ([#7848](https://github.com/angular/material2/issues/7848)) ([8e9dade](https://github.com/angular/material2/commit/8e9dade))
* **tab-nav-bar:** allow setting tabindex for links ([#7809](https://github.com/angular/material2/issues/7809)) ([a041253](https://github.com/angular/material2/commit/a041253))



<a name="5.0.0-rc0"></a>
# [5.0.0-rc0 cesium-cephalopod](https://github.com/angular/material2/compare/2.0.0-beta.12...5.0.0-rc0) (2017-11-06)

### Highlights

* First release candidate for Angular Material and CDK! The team now believes that APIs and
  behaviors are stable and mature enough to exit beta. Please continue to file issues that
  help us eliminate more bugs from the forthcoming 5.0.0 release. Moving forward, the _major_
  version number of Angular Material and CDK will update alongside Angular itself.
* A [moment.js](http://momentjs.com/) implementation of the `DateAdapter` for `MatDatepicker` is
  now available as `@angular/material-moment-adapter`
* Based on Angular 5.0
* More consistent naming conventions across the board
* 60+ bug fixes

### BREAKING CHANGES
* Angular Material now requires Angular 5, which itself requires TypeScript 2.4+ and RxJS 5.5.2+
* `mat-icon` now uses `HttpClient` from `@angular/common/http` instead of `Http` from
  `@angular/http`. Any unit tests that faked icon responses should be changed to use an
  `HttpInterceptor`.
* `@angular/cdk/rxjs` has been removed in favor of [RxJS 5.5's lettable operators](https://github.com/ReactiveX/rxjs/blob/master/doc/lettable-operators.md).
* **toolbar:** in previous versions, any content of `mat-toolbar` not wrapped in a
  `mat-toolbar-row` would be rendered inside of an implicitly created `mat-toolbar-row`. As of rc0,
  this implicit row will no longer be created. This means that any custom application CSS that
  targeted this implicitly created `mat-toolbar-row` will no longer apply. Users can re-add the
  `mat-toolbar-row` in their own templates to match the original output structure. This
  resolves a longstanding issue where `display: flex` styles were difficult to use on `mat-toolbar`.
* **accordion:** move CdkAccordion to `@angular/cdk/accordion`
  - `CdkAccordion` and associated classes live in `@angular/cdk/accordion`
  - `AccordionChild` is renamed to `CdkAccordionChild`
  - `CdkAccordion` no longer has displayMode and hideToggle `@Inputs`
  - `CdkAccordionItem` is now a `@Directive`
* **table**:
  - The argument order for the `when` property of `matRowDef` and `cdkRowDef` has been changed
    from `(rowData, index)` to `(index, rowData)` in order to match `trackBy`.
* **datepicker:**
  - `fromIso8601` method on `DateAdapter` removed in favor of `deserialize`
  - `DateAdapter` will return an invalid date instead of throwing an error
  - The `userSelection` `@Output` of `mat-calendar` has been made internal-only
* **cdk/scrolling:**
  - `ScrollDispatcher.getScrollContainers` has been renamed to `getAncestorScrollContainers` to
    better match its behavior.
  - The `ScrollDispatcher.scrollableReferences` property has been renamed to `scrollContainers`.
  - The `ScrollDispatcher.scrollableContainsElement` method has been removed.
  - The `Scrollable` class has been renamed to `CdkScrollable` for consistency.
  - Any uses of the `ScrollDispatcher.scrolled` method have to be refactored to subscribe to the
    returned Observable, instead of passing in the `callback`. Example
    ```ts
    // Before
    scrollDispatcher.scrolled(50, () => ...);

    // After
    scrollDispatcher.scrolled(50).subscribe(() => ...);
    ```
* **unique-selection:** move UniqueSelectionDispatcher to `@angular/cdk/collections`
  (`UniqueSelectionDispatcher`, `UniqueSelectionDispatcherListener`, and
   `UNIQUE_SELECTION_DISPATCHER_PROVIDER`)
* `MATERIAL_COMPATIBILITY_MODE`, `CompatibilityModule`, `NoConflictStyleCompatibilityMode`,
  `MatPrefixRejector`, `MdPrefixRejector` symbols have been removed.
* `MAT_CONNECTED_OVERLAY_SCROLL_STRATEGY` is renamed to `CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY`

### Deprecations
* The following classes have been renamed. The old names are still available as deprecated:
`OverlayOrigin` -> `CdkOverlayOrigin`
`ConnectedOverlayDirective` -> `CdkConnectedOverlay`
`PortalDirective` -> `CdkPortal`
`PortalHostDirective` -> `CdkPortalOutlet`
`ObserveContent` -> `CdkObserveContent`
* The following `@Output` names have been renamed. The old names are still available as deprecated:
 - `mat-select`
   - `onOpen` -> `opened`
   - `onClose` -> `closed`
   - `change` -> `selectionChange`
 - `mat-sidenav` / `mat-drawer`
   - `open` -> `opened`
   - `close` -> `closed`
 - `mat-menu`
   - `close` -> `closed`
 - `matMenuTriggerFor`
   - `onMenuOpen` -> `menuOpened`
   - `onMenuClose` -> `menuClosed`
 - `mat-chip`
   - `onSelectionChange` -> `selectionChange`
   - `remove` -> `removed`
   - `destroy` -> `destroyed`
 - `mat-tab-group`
   - `selectChange` -> `selectedTabChange`


### Features

* **table:** add MatTableDataSource ([#6747](https://github.com/angular/material2/issues/6747)) ([a9600e7](https://github.com/angular/material2/commit/a9600e7))
* **dialog:** support minWidth, minHeight, maxWidth and maxHeight ([#7488](https://github.com/angular/material2/issues/7488)) ([57f19cd](https://github.com/angular/material2/commit/57f19cd))
* **overlay:** new keyboard dispatcher for targeting correct overlay ([#6682](https://github.com/angular/material2/issues/6682)) ([a2ca4d6](https://github.com/angular/material2/commit/a2ca4d6))
* **snack-bar:** set snack bar to be responsive. ([#7485](https://github.com/angular/material2/issues/7485)) ([5b7982f](https://github.com/angular/material2/commit/5b7982f))
* **sort:** use existing intl provider if one exists ([#7988](https://github.com/angular/material2/issues/7988)) ([c8df2c1](https://github.com/angular/material2/commit/c8df2c1))
* **dialog:** add optional generic param for config data ([#7447](https://github.com/angular/material2/issues/7447)) ([b29ac45](https://github.com/angular/material2/commit/b29ac45)), closes [#4398](https://github.com/angular/material2/issues/4398)
* Most directives / components now define an `exportAs` name ([#7554](https://github.com/angular/material2/issues/7554)) ([fa441bc](https://github.com/angular/material2/commit/fa441bc))

### Bug Fixes

* **block-scroll-strategy:** disable smooth scrolling before restoring scroll position ([#8132](https://github.com/angular/material2/issues/8132)) ([75bccde](https://github.com/angular/material2/commit/75bccde)), closes [#7139](https://github.com/angular/material2/issues/7139)
* **button:** focus styles not applied to programmatically focused buttons ([#5966](https://github.com/angular/material2/issues/5966)) ([a0bb1a3](https://github.com/angular/material2/commit/a0bb1a3)), closes [#7510](https://github.com/angular/material2/issues/7510)
* **button-toggle:** support two-way binding of value ([#7911](https://github.com/angular/material2/issues/7911)) ([ee4915c](https://github.com/angular/material2/commit/ee4915c))
* **card:** change image path to https in example ([#7800](https://github.com/angular/material2/issues/7800)) ([65d3630](https://github.com/angular/material2/commit/65d3630))
* **chip-list:** use role = listbox only if chip list is not empty ([#7664](https://github.com/angular/material2/issues/7664)) ([dc76c09](https://github.com/angular/material2/commit/dc76c09))
* **chips:** programmatically selected chip stealing focus ([#7978](https://github.com/angular/material2/issues/7978)) ([8168667](https://github.com/angular/material2/commit/8168667))
* **datepicker:** allow `DateAdapter` authors to have more control ove… ([#7346](https://github.com/angular/material2/issues/7346)) ([9fa075e](https://github.com/angular/material2/commit/9fa075e))
* **datepicker:** use disabled state from FormControl ([#7514](https://github.com/angular/material2/issues/7514)) ([66e71c8](https://github.com/angular/material2/commit/66e71c8))
* **dialog:** don't block other dialogs from opening while animating ([#8051](https://github.com/angular/material2/issues/8051)) ([cc4fc11](https://github.com/angular/material2/commit/cc4fc11)), closes [#6560](https://github.com/angular/material2/issues/6560)
* **drawer:** not restoring focus on close ([#7668](https://github.com/angular/material2/issues/7668)) ([3041124](https://github.com/angular/material2/commit/3041124))
* **drawer:** unable to toggle while drawer is animating ([#6810](https://github.com/angular/material2/issues/6810)) ([085827f](https://github.com/angular/material2/commit/085827f)), closes [#6376](https://github.com/angular/material2/issues/6376)
* **expansion-panel:** prevent content from being clipped ([#7617](https://github.com/angular/material2/issues/7617)) ([aa77aa1](https://github.com/angular/material2/commit/aa77aa1))
* **focus-trap:** server-side rendering error ([#7635](https://github.com/angular/material2/issues/7635)) ([f7a12b6](https://github.com/angular/material2/commit/f7a12b6)), closes [#7633](https://github.com/angular/material2/issues/7633)
* **focus-trap:** update focus trap attrs to camel case [#6799](https://github.com/angular/material2/issues/6799) ([#6960](https://github.com/angular/material2/issues/6960)) ([c663fad](https://github.com/angular/material2/commit/c663fad))
* **form-field:** fix underline at different zoom levels ([#7567](https://github.com/angular/material2/issues/7567)) ([5cffd7c](https://github.com/angular/material2/commit/5cffd7c))
* **form-field:** remove 200px width since it messes up flex layouts ([#7083](https://github.com/angular/material2/issues/7083)) ([160a511](https://github.com/angular/material2/commit/160a511))
* **form-field:** remove specific mention of matInput in error ([#7727](https://github.com/angular/material2/issues/7727)) ([f17cb99](https://github.com/angular/material2/commit/f17cb99))
* **icon:** use SafeResourceUrl in getSvgIconFromUrl ([#7535](https://github.com/angular/material2/issues/7535)) ([291a87c](https://github.com/angular/material2/commit/291a87c))
* **input:** remove IE clear icon ([#8095](https://github.com/angular/material2/issues/8095)) ([2fa679b](https://github.com/angular/material2/commit/2fa679b)), closes [#8076](https://github.com/angular/material2/issues/8076)
* **menu:** add typography mat-font-weight ([7fe1b81](https://github.com/angular/material2/commit/7fe1b81))
* **menu:** make @Output names consistent [#6677](https://github.com/angular/material2/issues/6677) ([#8053](https://github.com/angular/material2/issues/8053)) ([b2dd17a](https://github.com/angular/material2/commit/b2dd17a))
* **menu:** not handling keyboard events when opened by mouse ([#4843](https://github.com/angular/material2/issues/4843)) ([d822a39](https://github.com/angular/material2/commit/d822a39)), closes [#4991](https://github.com/angular/material2/issues/4991)
* **menu:** wrong offset for nested menu in a fallback position ([#7562](https://github.com/angular/material2/issues/7562)) ([074f6ce](https://github.com/angular/material2/commit/074f6ce)), closes [#7549](https://github.com/angular/material2/issues/7549)
* **overlay:** CloseScrollStrategy not triggering change detection on close ([#7929](https://github.com/angular/material2/issues/7929)) ([c0ba25a](https://github.com/angular/material2/commit/c0ba25a)), closes [#7922](https://github.com/angular/material2/issues/7922)
* **overlay:** emitting to detachments stream when not attached ([#7944](https://github.com/angular/material2/issues/7944)) ([6fdc237](https://github.com/angular/material2/commit/6fdc237))
* **overlay:** import BidiModule in OverlayModule ([#7566](https://github.com/angular/material2/issues/7566)) ([4321f32](https://github.com/angular/material2/commit/4321f32))
* **overlay:** overlay class audits [#6372](https://github.com/angular/material2/issues/6372) ([#8056](https://github.com/angular/material2/issues/8056)) ([cd05b54](https://github.com/angular/material2/commit/cd05b54))
* **overlay:** wait until after change detection to position overlays ([#6527](https://github.com/angular/material2/issues/6527)) ([f299d25](https://github.com/angular/material2/commit/f299d25))
* **paginator:** fix select baseline; support mobile ([#7610](https://github.com/angular/material2/issues/7610)) ([c12e4b5](https://github.com/angular/material2/commit/c12e4b5))
* **progress-spinner:** fallback animation not working ([#7599](https://github.com/angular/material2/issues/7599)) ([4bb696e](https://github.com/angular/material2/commit/4bb696e))
* **progress-spinner:** inaccurate stroke width on really small spinners ([#7725](https://github.com/angular/material2/issues/7725)) ([f52f078](https://github.com/angular/material2/commit/f52f078)), closes [#7686](https://github.com/angular/material2/issues/7686)
* **progress-spinner:** spinner with narrower stroke not taking up entire element ([#7686](https://github.com/angular/material2/issues/7686)) ([2361983](https://github.com/angular/material2/commit/2361983)), closes [#7674](https://github.com/angular/material2/issues/7674)
* **scroll:** Replace references to scrollableReferences ([#7752](https://github.com/angular/material2/issues/7752)) ([9673f63](https://github.com/angular/material2/commit/9673f63))
* **select:** errors not shown on submit ([#7640](https://github.com/angular/material2/issues/7640)) ([d2f41a4](https://github.com/angular/material2/commit/d2f41a4)), closes [#7634](https://github.com/angular/material2/issues/7634)
* **select:** make @Output names consistent [#6677](https://github.com/angular/material2/issues/6677) ([#8052](https://github.com/angular/material2/issues/8052)) ([f59abdb](https://github.com/angular/material2/commit/f59abdb))
* **select:** not scrolling active option into view when typing ([#7620](https://github.com/angular/material2/issues/7620)) ([717f252](https://github.com/angular/material2/commit/717f252))
* **select:** remove inert focus call ([#7729](https://github.com/angular/material2/issues/7729)) ([70c349c](https://github.com/angular/material2/commit/70c349c))
* **select:** support typing to select items on when closed ([#7885](https://github.com/angular/material2/issues/7885)) ([8edb416](https://github.com/angular/material2/commit/8edb416))
* **select:** unable to preselect array value in single selection mode ([#7603](https://github.com/angular/material2/issues/7603)) ([d55aa0c](https://github.com/angular/material2/commit/d55aa0c)), closes [#7584](https://github.com/angular/material2/issues/7584)
* **select:** wrong cursor on disabled select ([#7696](https://github.com/angular/material2/issues/7696)) ([9b4f435](https://github.com/angular/material2/commit/9b4f435)), closes [#7695](https://github.com/angular/material2/issues/7695)
* **selection-list:** fix option value coercion and selection events ([#6901](https://github.com/angular/material2/issues/6901)) ([80671bf](https://github.com/angular/material2/commit/80671bf)), closes [#6864](https://github.com/angular/material2/issues/6864)
* **snack-bar:** add content fade in animation ([#7504](https://github.com/angular/material2/issues/7504)) ([2b9c470](https://github.com/angular/material2/commit/2b9c470))
* **snackbar:** swap enter and exit animation curves ([#6791](https://github.com/angular/material2/issues/6791)) ([4f571b1](https://github.com/angular/material2/commit/4f571b1))
* **sort:** fix arrow on width-constrained headers ([#7569](https://github.com/angular/material2/issues/7569)) ([147ae46](https://github.com/angular/material2/commit/147ae46))
* **spinner:** set initial value for spinner to 0. ([#8139](https://github.com/angular/material2/issues/8139)) ([9e4c636](https://github.com/angular/material2/commit/9e4c636))
* **stepper:** don't grey out non-linear steps ([#7479](https://github.com/angular/material2/issues/7479)) ([60707b3](https://github.com/angular/material2/commit/60707b3)), closes [#7260](https://github.com/angular/material2/issues/7260)
* **stepper:** error when selectedIndex is pre-set ([#8035](https://github.com/angular/material2/issues/8035)) ([cf11ff2](https://github.com/angular/material2/commit/cf11ff2)), closes [#8031](https://github.com/angular/material2/issues/8031)
* **table:** broaden abstraction for filtering ([#8059](https://github.com/angular/material2/issues/8059)) ([d47b37a](https://github.com/angular/material2/commit/d47b37a))
* **table:** cell content should not stretch width ([#7666](https://github.com/angular/material2/issues/7666)) ([bb424e2](https://github.com/angular/material2/commit/bb424e2))
* **table:** empty string should be sorted right ([#8011](https://github.com/angular/material2/issues/8011)) ([58627c4](https://github.com/angular/material2/commit/58627c4))
* **table:** render cells even if data is falsy ([#7914](https://github.com/angular/material2/issues/7914)) ([f601e83](https://github.com/angular/material2/commit/f601e83))
* **table:** switch when arguments ([#7516](https://github.com/angular/material2/issues/7516)) ([a2129fc](https://github.com/angular/material2/commit/a2129fc))
* **table:** Provide a provider if exists. ([#7895](https://github.com/angular/material2/issues/7895)) ([9a05ecd](https://github.com/angular/material2/commit/9a05ecd)), closes [#7344](https://github.com/angular/material2/issues/7344)
* **table:** throw error when missing row defs ([#7751](https://github.com/angular/material2/issues/7751)) ([55476e2](https://github.com/angular/material2/commit/55476e2))
* **table:** update implicit when using trackby ([#7893](https://github.com/angular/material2/issues/7893)) ([f806286](https://github.com/angular/material2/commit/f806286))
* **tabs:** incorrect ripple color for tabs with background ([#8123](https://github.com/angular/material2/issues/8123)) ([02d3eb6](https://github.com/angular/material2/commit/02d3eb6))
* **toolbar:** no longer auto-generate toolbar rows ([#6661](https://github.com/angular/material2/issues/6661)) ([c3405aa](https://github.com/angular/material2/commit/c3405aa)), closes [#6004](https://github.com/angular/material2/issues/6004) [#1718](https://github.com/angular/material2/issues/1718)
* **tooltip:** don't open from programmatic focus ([#7258](https://github.com/angular/material2/issues/7258)) ([90a55fa](https://github.com/angular/material2/commit/90a55fa)), closes [#7245](https://github.com/angular/material2/issues/7245)
* **viewport-ruler:** incorrectly caching viewport size ([#7951](https://github.com/angular/material2/issues/7951)) ([0d6d9cc](https://github.com/angular/material2/commit/0d6d9cc))
* consistent names for all cdk directives ([#8088](https://github.com/angular/material2/issues/8088)) ([f08b3f0](https://github.com/angular/material2/commit/f08b3f0))
* don't show sanity check messages in tests ([#8080](https://github.com/angular/material2/issues/8080)) ([d17f9d2](https://github.com/angular/material2/commit/d17f9d2))
* user-select mixin ignores value ([#7992](https://github.com/angular/material2/issues/7992)) ([eaa4a36](https://github.com/angular/material2/commit/eaa4a36))

### Performance Improvements

* **scroll** remove persistent global scroll listener ([#7560](https://github.com/angular/material2/issues/7560)) ([d6698e1](https://github.com/angular/material2/commit/d6698e1)), closes [#6882](https://github.com/angular/material2/issues/6882)
* **drawer:** drawer content repainting on scroll ([#7719](https://github.com/angular/material2/issues/7719)) ([131e98f](https://github.com/angular/material2/commit/131e98f))
* **focus-monitor:** use passive touch listener ([#7957](https://github.com/angular/material2/issues/7957)) ([ff7a13b](https://github.com/angular/material2/commit/ff7a13b))
* **tabs:** avoid repainting while scrolling ([#7889](https://github.com/angular/material2/issues/7889)) ([943395e](https://github.com/angular/material2/commit/943395e))

### Code Refactoring

* **accordion:** move CdkAccordion to [<@S1DQE0YR5|@angular-core-eng>](https://github.com/angular)/cdk ([#7530](https://github.com/angular/material2/issues/7530)) ([4d04472](https://github.com/angular/material2/commit/4d04472))
* remove compatibility mode ([#7689](https://github.com/angular/material2/issues/7689)) ([dcef604](https://github.com/angular/material2/commit/dcef604))
* switch to HttpClient ([#6702](https://github.com/angular/material2/issues/6702)) ([0ea4370](https://github.com/angular/material2/commit/0ea4370))

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
<a name="2.0.0-beta.12"></a>
# [2.0.0-beta.12 marble-mustache](https://github.com/angular/material2/compare/2.0.0-beta.11...2.0.0-beta.12) (2017-10-05)
```


### Breaking Changes

* All "md" prefixes have been removed. See the [deprecation notice in the beta.11 notes for more
information](https://github.com/angular/material2/blob/master/CHANGELOG.md#deprecation-of-md-prefix).
* All cdk re-exports in `@angular/material` have been removed. See the [the beta.10 notes for more
information](https://github.com/angular/material2/blob/master/CHANGELOG.md#breaking-changes-2).
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
