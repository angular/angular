Component Assets in Angular 2
=============================

Components in Angular 2 allow for HTML, CSS and JavaScript code to be combined
together into a contained package that can be used in various parts of an application.

One of the necessary features of components in web applications is to allow
for portability. Therefore, having the ability for a component and its associated
asset files (the template and stylesheets) to be moved into another area of the
application is essential. Angular 2 introduces various steps to make this work by
use of the component `moduleId` annotation as well as the `package:` URL scheme.

# Asset URLs Relative to the Component Module

Almost all CommonJS-based module loaders provide the location of the current module
path via a variable called `module.id`. When this variable is attached to a component's
annotation `moduleId` property then Angular will use as that as the base directory
when resolving relative asset files.

For example, if a component is situated within `app/components/banner/banner.ts` then
CommonJS `module.id` variable will match that.

```ts
@Component({
  // module.id is "app/components/banner/banner.ts"
  moduleId: module.id,
  selector: 'banner'
})
class BannerCmp {
}
```

The component asset files can now be **relatively** resolved based on where the
component is located since the `moduleId` tells us what the full path of the file is.

```
@Component({
  moduleId: module.id,
  templateUrl: 'template.html',
  styleUrls: ['style.css'],
  selector: 'banner'
})
class BannerCmp {
}
```

Based on the example code above, the final absolute URL values for `template.html` and `style.css` are
`app/components/banner/template.html` and `app/components/banner/style.css`, respectively.

Please note that the `module.id` variable is only present with module loaders that support CommonJS.

# Asset URLs Relative to a Shared Base Directory

Prefixing an asset url with `package:` allows for asset files to be referenced relatively against
a shared package directory.

For example, if all asset files within an application are stored under `app/assets` then the
component code for this would look like so:

```
// this file is located in `app/my_cmp.ts`
@Component({
  templateUrl: "package:my_cmp/template.html", 
  styleUrls: ["package:my_cmp/style.css"]
})
export class MyCmp {
}
```

The default value for the package scheme can be changed by overriding the `PACKAGE_ROOT_URL`
token when bootstrapping an Angular2 application:

```ts
import {MyCmp} from "app/my_cmp";
import {PACKAGE_ROOT_URL} from "angular2/compiler";
import {bootstrap} from "angular2/platform/browser";
import {provide} from "angular2/core";

bootstrap(MyCmp, [
  provide(PACKAGE_ROOT_URL, { toValue: "/app/assets" })
])
```

By default the base directory that is set for an asset containing a package scheme is `/` in
JavaScript/TypeScript and `/packages` for Dart.
