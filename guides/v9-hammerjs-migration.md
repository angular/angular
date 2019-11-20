# V9 HammerJS migration

Angular Material, as of version 9, no longer requires HammerJS for any component. Components which
previously depended on HammerJS no longer provide a [`HAMMER_GESTURE_CONFIG`][1] that will
enable use of HammerJS events in templates.

Additionally the `GestureConfig` export from `@angular/material/core` has been marked as
deprecated and will be removed in version 10.

### Why is a migration needed?

Since HammerJS previously was a requirement for a few Angular Material components, projects might
have installed `HammerJS` exclusively for Angular Material. Since HammerJS is no longer needed when
updating to v9, the dependency on HammerJS can be removed if it's not used directly in the
application.

In some cases, projects use HammerJS events in templates while relying on Angular Material
modules to set up the HammerJS event plugin. Since this is no longer the case in version 9,
such projects need to manually configure the HammerJS event plugin in order to continue using
these HammerJS events.

### What does the migration do?

The migration automatically removes HammerJS from the project if HammerJS is not used.

Additionally, Angular Material's `GestureConfig` (now deprecated) defined custom HammerJS gestures.
If the application directly uses any of these gestures, the migration will introduce a new
application-specific configuration for these custom gestures, removing the dependency on Angular
Material's `GestureConfig`.

Finally, if the application uses any of the custom HammerJS gestures provided by Angular Material's
`GestureConfig`, or the default HammerJS gestures, the migration will add an import for Angular's
new `HammerModule`, which enabled HammerJS event bindings. These bindings were previously enabled
by default in Angular versions 8 and below.

If your application provides a custom [`HAMMER_GESTURE_CONFIG`][1] and also references the
deprecated Angular Material `GestureConfig`, the migration will print a warning about
ambiguous usage. The migration cannot migrate the project automatically and manual changes
are required. Read more [in the dedicated section](#The-migration-reported-ambiguous-usage-What-should-I-do).

### How does the schematic remove HammerJS?

HammerJS can be set up in many ways. The migration handles the most common cases, covering
approaches recommended by Angular Material in the past. The migration performs the following steps:

*1\.* Remove `hammerjs` from the project `package.json`.
```json
{
  "dependencies": {
    "hammerjs": "..."
  }
}
```
*2\.* Remove script imports to `hammerjs` in the `index.html` file.
```html
<script src="https://my-cdn.io/hammer.min.js"></script>
```
*3\.* Remove [side-effect imports][2] to `hammerjs`.
```typescript
import 'hammerjs';
```

The migration cannot automatically remove HammerJS from tests. Please manually clean up
the test setup and resolve any test issues. Read more in a
[dedicated section for test migration](#How-to-migrate-my-tests)

### How do I migrate references to the deprecated `GestureConfig`?

The `GestureConfig` can be consumed in multiple ways. The migration covers the most common cases.
The most common case is that an `NgModule` in your application directly provides `GestureConfig`: 

```typescript
import {GestureConfig} from '@angular/material/core';

@NgModule({
  ...
  providers: [
    {provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig}
  ],
})
export class AppModule {}
```

If this pattern is found in the project, it usually means that a component relies on the
deprecated `GestureConfig` in order to use HammerJS events in the template. If this is the case,
the migration automatically creates a new gesture config which supports the used HammerJS
events. All references to the deprecated gesture config will be rewritten to the newly created one.

If no event from the deprecated config is used, the provider declaration can be safely removed
from the module. This is automatically done by the migration.

There are other patterns where the deprecated `GestureConfig` is extended, injected or used
in combination with a different custom gesture config. These patterns cannot be handled
automatically, but the migration will report such patterns and ask for manual cleanup.

<a name="test-migration"></a>
### How to migrate my tests?

Components in your project might use Angular Material components which previously depended
on HammerJS. There might be unit tests for these components which also test gesture functionality
of the Angular Material components. For such unit tests, find all failing gesture tests. These
might need to be reworked to dispatch proper events to simulate gestures, or need to be deleted.
Specifically gesture tests for the `<mat-slide-toggle>` should be removed. This is because the
`<mat-slide-toggle>` no longer supports gestures.

If some unit tests depend on the deprecated Angular Material `GestureConfig` to simulate gesture
events, the reference should be either removed and tests reworked to use DOM events, or the
reference should be changed to the new gesture config created by the migration.

If HammerJS has been removed by the migration from the project, you might able to need to
clean up test setup that provides HammerJS. This is usually done in the test main file (usually
in `src/test.ts`) where `hammerjs` is imported.

```typescript
import 'hammerjs';
```

<a name="what-to-do-ambiguous-usage"></a>
### The migration reported ambiguous usage. What should I do?

**Case 1**: It detected that a HammerJS event provided by the deprecated `GestureConfig` is
used in a component template. This is because the migration relies on static analysis to detect
event bindings and can never guarantee that a event binding is bound to the Hammer gesture
plugin, or to an actual `@Output`. For example:

```html
<image-rotator (rotate)="onRotate()"></image-rotator>
```

In the example above, `rotate` could be an event from the deprecated `GestureConfig`, or an
`@Output` from `<image-rotator>`. The migration warns about this to raise awareness that it
might have _incorrectly kept_ HammerJS. Please manually check if you can remove HammerJS.

**Case 2**: The deprecated Angular Material `GestureConfig` is used in combination with a
custom [`HAMMER_GESTURE_CONFIG`][1]. This case is ambiguous because the migration is unable
to detect whether a given HammerJS event binding corresponds to the custom gesture config, or to
the deprecated Angular Material gesture config. If such a warning has been reported to you, check
if you can remove references to the deprecated `GestureConfig`, or if you need to handle the events
provided by the deprecated gesture config in your existing custom gesture config.

[1]: https://v9.angular.io/api/platform-browser/HammerGestureConfig
[2]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#Import_a_module_for_its_side_effects_only
