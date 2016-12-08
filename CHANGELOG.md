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
application. See the new [theming guide](docs/theming.md) for more information.


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
