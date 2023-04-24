# Update Angular to v15

<!-- NOTE to writers: When creating the topic for the next version,                               -->
<!--   remember to update the redirect link in angular/aio/firebase.json                          -->
<!-- To update the redirect link in angular/aio/firebase.json:                                    -->
<!--   1. Search for the entry in firebase.json with "source": "guide/update-to-latest-version"   -->
<!--   2,  Update the destination value to refer to the new guide's URL                           -->
<!--                                                                                              -->

This topic provides information about updating your Angular applications to Angular version 15.

For a summary of this information and the step-by-step procedure to update your Angular application to v15, see the [Angular Update Guide](https://update.angular.io).

The information in the [Angular Update Guide](https://update.angular.io) and this topic is summarized from these change logs:

*  [angular/angular changelog](https://github.com/angular/angular/blob/main/CHANGELOG.md)
*  [angular/angular-cli changelog](https://github.com/angular/angular-cli/blob/main/CHANGELOG.md)
*  [angular/components changelog](https://github.com/angular/components/blob/main/CHANGELOG.md)

Information about updating Angular applications to v14 is archived at [Update to version 14](/guide/update-to-version-14).

<a id="new-features"></a>

## New features in Angular v15

Angular v15 brings many improvements and new features.
This section only contains some of the innovations in v15.

For a comprehensive list of the new features, see the [Angular blog post on the update to v15](https://blog.angular.io/angular-v15-is-now-available-df7be7f2f4c8).

<!-- markdownLint-disable MD001 -->

#### Standalone components are stable

The standalone components API lets you build Angular applications without the need to use NgModules. For more information about using these APIs in your next Angular application, see [Standalone components](guide/standalone-components).

#### The `NgOptimizedImage` directive is stable

Adding `NgOptimizedImage` directive to your component or NgModule can help reduce the download time of images in your Angular application. For more information about using the `NgOptimizedImage` directive, see [Getting started with `NgOptimizedImage`](guide/image-directive).

#### Directives can be added to host elements

The directive composition API makes it possible to add directives to host elements, addressing [feature request #8785](https://github.com/angular/angular/issues/8785). Directives let you add behaviors to your components behaviors without using inheritance.

#### Stack traces are more helpful

Angular v15 makes debugging Angular applications easier with cleaner stack traces.
Angular worked with Google Chrome developers to present stack traces that show more of your application's code and less from the libraries it calls.

For more information about the Chrome DevTools and Angular's support for the cleaner stack traces, see [Modern web debugging in Chrome DevTools](https://developer.chrome.com/blog/devtools-modern-web-debugging/).

<!-- vale Angular.Google_Acronyms = NO -->

#### MDC-based components are stable

<!-- vale Angular.Google_Acronyms = YES -->

Many of the components in Angular Material v15 have been refactored to be based on Angular Material Design Components (MDC) for the Web.
The refactored components offer improved accessibility and adherence to the Material Design spec.

For more information about the updated components, see [Migrating to MDC-based Angular Material Components](https://material.angular.io/guide/mdc-migration).

<a id="breaking-changes"></a>

## Breaking changes in Angular v15

These are the aspects of Angular that behave differently in v15 and that might require you to review and refactor parts of your Angular application.

<a id="v15-bc-01"></a>

#### Angular v15 supports node.js versions: 14.20.x, 16.13.x and 18.10.x

In v15, Angular no longer supports node.js versions 14.\[15-19\].x or 16.\[10-12\].x. [PR #47730](https://github.com/angular/angular/pull/47730)

<a id="v15-bc-02"></a>

#### Angular v15 supports TypeScript version 4.8 or later

In v15, Angular no longer supports TypeScript versions older than 4.8. [PR #47690](https://github.com/angular/angular/pull/47690)

<a id="v15-bc-03"></a>

#### `@keyframes` name format changes

In v15, `@keyframes` names are prefixed with the component's *scope name*. [PR #42608](https://github.com/angular/angular/pull/42608)

For example, in a component definition whose *scope name* is `host-my-cmp`, a  `@keyframes` rule with a name in v14 of:

<code-example language="ts" hideCopy>

@keyframes foo { ... }

</code-example>

becomes in v15:

<code-example language="ts" hideCopy>

@keyframes host-my-cmp_foo { ... }

</code-example>

This change can break any TypeScript or JavaScript code that use the names of `@keyframes` rules.

To accommodate this breaking change, you can:

*  Change the component's view encapsulation to `None` or `ShadowDom`.
*  Define `@keyframes` rules in global stylesheets, such as `styles.css`.
*  Define `@keyframes` rules in your own code.

<a id="v15-bc-05"></a>

#### Invalid constructors for dependency injection can report compilation errors

When a class inherits its constructor from a base class, the compiler can report an error when that constructor cannot be used for dependency injection purposes. [PR #44615](https://github.com/angular/angular/pull/44615)

This can happen:

*  When the base class is missing an Angular decorator such as `@Injectable()` or `@Directive()`
*  When the constructor contains parameters that do not have an associated token ,such as primitive types like `string`.

These situations used to behave unexpectedly at runtime. For example, a class might be constructed without any of its constructor parameters.
In v15, this is reported as a compilation error.

New errors reported because of this change can be resolved by either:

* Decorating the base class from which the constructor is inherited.
* Adding an explicit constructor to the class for which the error is reported.

<a id="v15-bc-06"></a>

#### `setDisabledState` is always called when a `ControlValueAccessor` is attached

In v15, `setDisabledState` is always called when a `ControlValueAccessor` is attached. [PR #47576](https://github.com/angular/angular/pull/47576)

You can opt out of this behavior with `FormsModule.withConfig` or `ReactiveFormsModule.withConfig`.

<a id="v15-bc-07"></a>

#### The `canParse` method has been removed

The `canParse` method has been removed from all translation parsers in `@angular/localize/tools`. [PR #47275](https://github.com/angular/angular/pull/47275)

In v15, use `analyze` should instead and the `hint` parameter in the parse methods is mandatory.

<a id="v15-bc-08"></a>

#### The `title` property is required on `ActivatedRouteSnapshot`

In v15, the `title` property is required on [`ActivatedRouteSnapshot`](api/router/ActivatedRouteSnapshot). [PR #47481](https://github.com/angular/angular/pull/47481)

<a id="v15-bc-09"></a>

#### `RouterOutlet` instantiates the component after change detection

Before v15, during navigation, `RouterOutlet` instantiated the component being activated immediately. [PR #46554](https://github.com/angular/angular/pull/46554)

In v15, the component is not instantiated until after change detection runs.
This change could affect tests that do not trigger change detection after a router navigation.
This can also affect production code that relies on the exact timing of component availability,
for example, if your component's constructor calls `router.getCurrentNavigation()`.

<a id="v15-bc-10"></a>

#### `relativeLinkResolution` is not configurable in the Router

In v15, `relativeLinkResolution` is not configurable in the Router. [PR #47623](https://github.com/angular/angular/pull/47623)

In previous versions, this option was used to opt out of a bug fix.

<a id="v15-bc-04"></a>

#### Angular compiler option `enableIvy` has been removed

The Angular compiler option `enableIvy` has been removed because Ivy is Angular's only rendering engine. [PR #47346](https://github.com/angular/angular/pull/47346)

<a id="v15-bc-10"></a>

#### Angular Material components based on MDC

In Angular Material v15, many components have been refactored to be based on the official Material Design Components for Web (MDC).
For information about breaking changes in Material components v15, see [Migrating to MDC-based Angular Material Components](https://material.angular.io/guide/mdc-migration).

<a id="v15-bc-11"></a>

#### Hardening attribute and property binding rules for `<iframe>` elements

Existing `<iframe>` instances might have security-sensitive attributes applied to them as an attribute or property binding.
These security-sensitive attributes can occur in a template or in a directive's host bindings.
Such occurrences require an update to ensure compliance with the new and stricter rules about `<iframe>` bindings.
For more information, see [the error page](/errors/NG0910).

<a id="deprecations"></a>

## Deprecations in Angular v15

These are the aspects of Angular that are being phased out.
They are still available in v15, but they can be removed in future versions as Angular's [deprecation practices](/guide/releases#deprecation-practices) describe.

To maintain the reliability of your Angular application, review these notes and update your application as soon as practicable.

| Removed | Replacement | Details |
| :--- | :--- |:--- |
| <a id="v15-dp-01"></a>[`DATE_PIPE_DEFAULT_TIMEZONE`](api/common/DATE_PIPE_DEFAULT_TIMEZONE) | [`DATE_PIPE_DEFAULT_OPTIONS`](api/common/DATE_PIPE_DEFAULT_OPTIONS) | The `timezone` field in `DATE_PIPE_DEFAULT_OPTIONS` defines the time zone.<br>[PR #43611](https://github.com/angular/angular/pull/43611) |
| <a id="v15-dp-02"></a>[`Injector.get()`](api/core/Injector#get) with the `InjectFlags` parameter | [`Injector.get()`](api/core/Injector#get) with the `InjectOptions` object | [PR #41592](https://github.com/angular/angular/pull/41592) |
| <a id="v15-dp-03"></a>[`TestBed.inject()`](api/core/testing/TestBed#inject) with the `InjectFlags` parameter | [`TestBed.inject()`](api/core/testing/TestBed#inject) with the `InjectOptions` object.| [PR #46761](https://github.com/angular/angular/pull/46761) |
| <a id="v15-dp-04"></a>`providedIn: NgModule` for [`@Injectable`](api/core/Injectable) and [`InjectionToken`](api/core/InjectionToken)<br><a id="v15-dp-05"></a>`providedIn: 'any'` for an `@Injectable` or `InjectionToken` | See Details | `providedIn: NgModule` was intended to be a tree-shakable alternative to `NgModule` providers. It does not have wide usage and is often used incorrectly in cases where `providedIn: 'root'` would be preferred. If providers must be scoped to a specific [`NgModule`](api/core/NgModule), use `NgModule.providers` instead. [PR #47616](https://github.com/angular/angular/pull/47616)|
| <a id="v15-dp-06"></a>[`RouterLinkWithHref`](api/router/RouterLinkWithHref) directive | [`RouterLink`](api/router/RouterLink) directive | The `RouterLink` directive contains the code from the `RouterLinkWithHref` directive to handle elements with `href` attributes. [PR #47630](https://github.com/angular/angular/pull/47630), [PR #47599](https://github.com/angular/angular/pull/47599)|

For information about deprecations in Material components v15, see [Migrating to MDC-based Angular Material Components](https://material.angular.io/guide/mdc-migration).

@reviewed 2022-11-15
