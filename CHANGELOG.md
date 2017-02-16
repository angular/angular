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
