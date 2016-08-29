@cheatsheetSection
Bootstrapping
@cheatsheetIndex 0
@description
{@target ts}`import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';`{@endtarget}
{@target js}Available from the `ng.platformBrowserDynamic` namespace{@endtarget}
{@target dart}`import 'package:angular2/platform/browser.dart';`{@endtarget}

@cheatsheetItem
syntax(ts dart):
`platformBrowserDynamic().bootstrapModule(MyAppModule);`|`platformBrowserDynamic().bootstrapModule`
syntax(js):
`document.addEventListener('DOMContentLoaded', function() {
  ng.platformBrowserDynamic
    .platformBrowserDynamic()
    .bootstrapModule(app.AppModule);
});`|`platformBrowserDynamic().bootstrapModule`
description:
Bootstraps an application defined as AppModule ng module using the Just in Time compiler.{@target js}Must be wrapped in the event listener to fire when the page loads.{@endtarget}
