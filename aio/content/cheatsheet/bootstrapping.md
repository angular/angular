@cheatsheetSection
Bootstrapping
@cheatsheetIndex 0
@description
{@target ts}`import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';`{@endtarget}
{@target js}Available from the `ng.platformBrowserDynamic` namespace{@endtarget}

@cheatsheetItem
syntax(ts):
`platformBrowserDynamic().bootstrapModule(AppModule);`|`platformBrowserDynamic().bootstrapModule`
syntax(js):
`document.addEventListener('DOMContentLoaded', function() {
  ng.platformBrowserDynamic
    .platformBrowserDynamic()
    .bootstrapModule(app.AppModule);
});`|`platformBrowserDynamic().bootstrapModule`
description:
Bootstraps the app, using the root component from the specified `NgModule`. {@target js}Must be wrapped in the event listener to fire when the page loads.{@endtarget}
