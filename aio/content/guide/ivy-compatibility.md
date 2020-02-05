# Ivy compatibility guide

The Angular team has worked hard to ensure Ivy is as backwards-compatible with the previous rendering engine ("View Engine") as possible.
However, in rare cases, minor changes were necessary to ensure that the Angular's behavior was predictable and consistent, correcting issues in the View Engine implementation.
In order to smooth the transition, we have provided [automated migrations](guide/updating-to-version-9#migrations) wherever possible so your application and library code is migrated automatically by the CLI.
That said, some applications will likely need to apply some manual updates.

{@a debugging}
## How to debug errors with Ivy

In version 9, [a few deprecated APIs have been removed](guide/updating-to-version-9#removals) and there are a [few breaking changes](guide/updating-to-version-9#breaking-changes) unrelated to Ivy.
If you're seeing errors after updating to version 9, you'll first want to rule those changes out.

To do so, temporarily [turn off Ivy](guide/ivy#opting-out-of-angular-ivy) in your `tsconfig.json` and re-start your app.

If you're still seeing the errors, they are not specific to Ivy. In this case, you may want to consult the [general version 9 guide](guide/updating-to-version-9). If you've opted into any of the stricter type-checking settings that are new with v9, you may also want to check out the [template type-checking guide](guide/template-typecheck).

If the errors are gone, switch back to Ivy by removing the changes to the `tsconfig.json` and review the list of expected changes below.


{@a common-changes}
### Changes you may see

* By default, `@ContentChildren` queries will only search direct child nodes in the DOM hierarchy (previously, they would search any nesting level in the DOM as long as another directive wasn't matched above it). See further [details](guide/ivy-compatibility-examples#content-children-descendants).

* All classes that use Angular DI must have an Angular decorator like `@Directive()` or `@Injectable` (previously, undecorated classes were allowed in AOT mode only or if injection flags were used). See further [details](guide/ivy-compatibility-examples#undecorated-classes).

* Unbound inputs for directives (e.g. name in `<my-comp name="">`) are now set upon creation of the view, before change detection runs (previously, all inputs were set during change detection).

{@a less-common-changes}
### Less common changes

* Properties like `host` inside `@Component` and `@Directive` decorators can be inherited (previously, only properties with explicit field decorators like `@HostBinding` would be inherited).

* HammerJS support is opt-in through importing the `HammerModule` (previously, it was always included in production bundles regardless of whether the app used HammerJS).

* `@ContentChild` and `@ContentChildren` queries will no longer be able to match their directive's own host node (previously, these queries would match the host node in addition to its content children).

* If a token is injected with the `@Host` or `@Self` flag, the module injector is not searched for that token (previously, tokens marked with these flags would still search at the module level).

* When accessing multiple local refs with the same name in template bindings, the first is matched (previously, the last instance was matched).

* Directives that are used in an exported module (but not exported themselves) are exported publicly (previously, the compiler would automatically write a private, aliased export that it could use its global knowledge to resolve downstream).

* Foreign functions or foreign constants in decorator metadata aren't statically resolvable (previously, you could import a constant or function from another compilation unit, like a library, and use that constant/function in your `@NgModule` definition).

* Forward references to directive inputs accessed through local refs are no longer supported by default.

* If there is both an unbound class attribute and a `[class]` binding, the classes in the unbound attribute will also be added (previously, the class binding would overwrite classes in the unbound attribute).

* It is now an error to assign values to template-only variables like `item` in `ngFor="let item of items"` (previously, the compiler would ignore these assignments).

* It's no longer possible to overwrite lifecycle hooks with mocks on directive instances for testing (instead, modify the lifecycle hook on the directive type itself).

* Special injection tokens (such as `TemplateRef` or `ViewContainerRef`) return a new instance whenever they are requested (previously, instances of special tokens were shared if requested on the same node). This primarily affects tests that do identity comparison of these objects.

* ICU parsing happens at runtime, so only text, HTML tags and text bindings are allowed inside ICU cases (previously, directives were also permitted inside ICUs).

* Providers formatted as `{provide: X}` without a `useValue`, `useFactory`, `useExisting`, or `useClass` property are treated like `{provide: X, useClass: X}` (previously, it defaulted to `{provide: X, useValue: undefined}`).

* `DebugElement.attributes` returns `undefined` for attributes that were added and then subsequently removed (previously, attributes added and later removed would have a value of `null`).

* `DebugElement.classes` returns `undefined` for classes that were added and then subsequently removed (previously, classes added and later removed would have a value of `false`).

* If selecting the native `<option>` element in a `<select>` where the `<option>`s are created via `*ngFor`, use the `[selected]` property of an `<option>` instead of binding to the `[value]` property of the `<select>` element (previously, you could bind to either.) [details](guide/ivy-compatibility-examples#select-value-binding)