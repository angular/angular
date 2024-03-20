# Update Angular to v16

<!-- NOTE to writers: When creating the topic for the next version,                               -->
<!--   remember to update the redirect link in angular/aio/firebase.json                          -->
<!-- To update the redirect link in angular/aio/firebase.json:                                    -->
<!--   1. Search for the entry in firebase.json with "source": "guide/update-to-latest-version"   -->
<!--   2,  Update the destination value to refer to the new guide's URL                           -->
<!--                                                                                              -->

This topic provides information about updating your Angular applications to Angular version 16.

For a summary of this information and the step-by-step procedure to update your Angular application
to v16, see the [Angular Update Guide](https://update.angular.io).

The information in the [Angular Update Guide](https://update.angular.io) and this topic is
summarized from these changelogs:

*  [angular/angular changelog](https://github.com/angular/angular/blob/main/CHANGELOG.md)
*  [angular/angular-cli changelog](https://github.com/angular/angular-cli/blob/main/CHANGELOG.md)
*  [angular/components changelog](https://github.com/angular/components/blob/main/CHANGELOG.md)

Information about updating Angular applications to v15 is archived at
[Update to version 15](/guide/update-to-version-15).

<a id="new-features"></a>

## Feature highlights in Angular v16

For a more comprehensive list of new features, see the
[Angular blog post on the update to v16](https://blog.angular.io).

<!-- markdownLint-disable MD001 -->

#### Angular Signals developer preview

This release includes the first developer preview of Angular's new reactivity primitives: `signal`,
`computed`, and `effect`. See the [signals guide](/guide/signals) for details and the
[Angular Signals RFC](https://github.com/angular/angular/discussions/49685) for more background.

#### Enhanced hydration developer preview

Previously, when Angular bootstrapped on a page that was server-side rendered or compile-time
pre-rendered, the framework would discard any existing DOM nodes and re-render from scratch. With
v16's enhanced hydration support, you can opt into Angular reusing these existing DOM nodes. This
developer preview feature can improve page load performance in many scenarios. See the full
[hydration guide](/guide/hydration) for details.

### Faster builds with the esbuild developer preview

v16 brings you the developer preview of Angular CLI's new builders based on
[esbuild](https://esbuild.github.io). This new architecture can significantly improve build times in
many scenarios. This preview additionally includes integration with [Vite](https://vitejs.dev)
powering the CLI's development server.

You can try this new build setup by updating your `angular.json`:

```json
"architect": {
  "build": {
    "builder": "@angular-devkit/build-angular:browser-esbuild",
```

### Standalone component migration and scaffolding

To support developers transitioning their apps to standalone APIs, Angular v16 includes migration
schematics and a standalone migration guide. These tools dramatically reduce the effort required to
move your code to standalone components, directives, and pipes. Visit the 
[standalone migration guide](/guide/standalone-migration) for details.

You can now also generate new Angular applications with standalone components by running:

```sh
ng new --standalone
```

### Required inputs

You can now mark component and directive inputs as _required_:

```typescript
export class ColorPicker {
  @Input({ required: true }) defaultColor!: string;
}
```

If a template includes a component without specifying all of its required inputs, Angular reports
an error at build time.

<a id="breaking-changes"></a>

## Highlighted breaking changes in Angular v16

For a comprehensive list of breaking changes, see the full changelogs on GitHub.

<a id="v16-bc-01"></a>

### Angular v16 requires node.js version v16 or v18

Angular requires node.js v16 or v18. [PR #47730](https://github.com/angular/angular/pull/49255)

See [Version compatibility](/guide/versions) for full version compatibility details.

<a id="v16-bc-02"></a>

### Angular v16 requires TypeScript version 4.9 or later

In Angular v16, TypeScript versions 4.9.3 up to, but not including 5.2.0, are supported, with no support for versions older than 4.9.3. [PR #49155](https://github.com/angular/angular/pull/49155)

See [Version compatibility](/guide/versions) for full version compatibility details.

<a id="v16-bc-03"></a>

### Angular Compatibility Compiler (ngcc) has been removed

The Angular Compatibility Compiler (ngcc) was a build tool that facilitated compatibility between
Angular's previous compiler and rendering architecture (View Engine) and its new architecture (Ivy).

View Engine was removed in Angular v13, and v16 finally removes ngcc. As a result, Angular
libraries built with View Engine cannot be used in Angular v16+.

<a id="v16-bc-04"></a>

#### Angular Package Format changes

The Angular Package Format (APF) has been updated
with the following changes:

* Flattened ESM 2015 (FESM2015) outputs have been removed.
* EcmaScript 2020 outputs have been updated to EcmaScript 2022 (including the flattened output).

See [Angular Package Format](/guide/angular-package-format) for background.

<a id="v16-bc-06"></a>

#### `ReflectiveInjector` has been removed

The ReflectiveInjector and related symbols were removed. Please update the code to avoid references
to the ReflectiveInjector symbol. Use `Injector.create` to create an injector instead.

<a id="v16-bc-07"></a>

#### Updated behavior for `Router.createUrlTree`

Tests which mock `ActivatedRoute` instances may need to be adjusted because Router.createUrlTree now
does the right thing in more scenarios. This means that tests with invalid/incomplete ActivatedRoute
mocks may behave differently than before. Additionally, tests may now navigate to a real URL where
before they would navigate to the root. Ensure that tests provide expected routes to match. There is
rarely production impact, but it has been found that relative navigations when using
an `ActivatedRoute` that does not appear in the current router state were effectively ignored in the
past. By creating the correct URLs, this sometimes resulted in different navigation behavior in the
application. Most often, this happens when attempting to create a navigation that only updates query
params using an empty command array, for
example `router.navigate([], {relativeTo: route, queryParams: newQueryParams})`. In this case,
the `relativeTo` property should be removed.

<a id="deprecations"></a>

## Deprecations highlights in Angular v16

These APIs remain available in v16, but may be removed in future versions as described by Angular's
[deprecation policy](/guide/releases#deprecation-policy).

To maintain the reliability of your Angular application, always update your application as soon as
practicable.

| Removed                                                                              | Replacement | Details                                                                                                                                                                                                                                       |
|:-------------------------------------------------------------------------------------|:------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <a id="v16-dp-01"></a>Class and `InjectionToken` router guards and resolvers         | See details | Class and `InjectionToken` guards and resolvers are deprecated. Instead, write guards as plain JavaScript functions and inject dependencies with `inject` from `@angular/core`.<br>[PR #47924](https://github.com/angular/angular/pull/47924) |
| <a id="v16-dp-02"></a>The `ripple` properties of several Angular Material components | None        | The `ripple` property of `MatButton`, `MatCheckbox`, `MatChip` is deprecated. This change moves ripples to being a private implementation detail of the components.                                                                           |

@reviewed 2023-05-03
