# Update Angular to v17

<!-- NOTE to writers: When creating the topic for the next version,                               -->
<!--   remember to update the redirect link in angular/aio/firebase.json                          -->
<!-- To update the redirect link in angular/aio/firebase.json:                                    -->
<!--   1. Search for the entry in firebase.json with "source": "guide/update-to-latest-version"   -->
<!--   2,  Update the destination value to refer to the new guide's URL                           -->
<!--                                                                                              -->

This topic provides information about updating your Angular applications to Angular version 17.

For a summary of this information and the step-by-step procedure to update your Angular application
to v17, see the [Angular Update Guide](https://update.angular.io).

The information in the [Angular Update Guide](https://update.angular.io) and this topic is
summarized from these changelogs:

- [angular/angular changelog](https://github.com/angular/angular/blob/main/CHANGELOG.md)
- [angular/angular-cli changelog](https://github.com/angular/angular-cli/blob/main/CHANGELOG.md)
- [angular/components changelog](https://github.com/angular/components/blob/main/CHANGELOG.md)

Information about updating Angular applications to v16 is archived at
[Update to version 16](/guide/update-to-version-16).

<a id="new-features"></a>

## Feature highlights in Angular v17

For a more comprehensive list of new features, see the
[Angular blog post on the update to v17](https://blog.angular.io).

<!-- markdownLint-disable MD001 -->

#### Deferrable views

The new deferrable views allow you to lazily load all the components, directives, and pipes in a a section of your template:

```html
@defer (on viewport) {
  <comment-list />
} @placeholder {
  <!-- A placeholder content to show until the comments load -->
  <img src="comments-placeholder.png" />
}
```

In the example above, Angular first renders the contents of the placeholder block. When it becomes visible in the viewport, the loading of the `<comment-list />` component starts. Once the loading is completed, Angular removes the placeholder and renders the component.

#### Built-in control flow

We used a new block syntax for an optimized, built-in control flow. After running user studies we identified that a lot of developers struggle with `*ngIf`, `*ngSwitch`, and `*ngFor`.

It includes conditional statements:

```text
@if (loggedIn) {
  The user is logged in
} @else {
  The user is not logged in
}
```

Switch statements:

```text
@switch (accessLevel) {
  @case ('admin') { <admin-dashboard/> }
  @case ('moderator') { <moderator-dashboard/> }
  @default { <user-dashboard/> }
}
```

And for loop:

```text
@for (user of users; track user.id) {
  {{ user.name }}
} @empty {
  Empty list of users
}
```

In addition to the improved ergonomics, the control flow is also up to 90% faster for certain performance benchmarks.

As of v17, the built-in control flow is in developer preview. To update your projects to using it run the schematic:

```sh
ng generate @angular/core:control-flow
```

#### New `@angular/ssr` package

We moved the code powering Angular server-side rendering from `angular/universal` to `angular/angular-cli`, integrating SSR more directly into our tooling.

Starting today, to add SSR support to your existing application run:

```sh
ng add @angular/ssr
```

This command generates the server entry point, adds SSR and SSG build capabilities, and enables hydration by default. `@angular/ssr` provides equivalent functionality to` @nguniversal/express-engine` which is currently in maintenance mode. The Angular CLI will automatically update your code to `@angular/ssr` with `ng update`!

#### New lifecycle hooks

To improve the performance of Angular’s SSR and SSG, in the long-term we’d like to move away from DOM emulation and direct DOM manipulations. At the same time, throughout most applications’ lifecycle they need to interact with elements to instantiate third-party libraries, measure element size, etc.

To enable this, we developed a set of new lifecycle hooks:

- `afterRender` - register a callback to be invoked each time the application finishes rendering
- `afterNextRender` - register a callback to be invoked the next time the application finishes rendering

Only the browser will invoke these hooks, which enables you to plug custom DOM logic safely directly inside your components. For example, if you’d like to instantiate a charting library you can use afterNextRender:

```typescript
@Component({
  selector: 'my-chart-cmp',
  template: `<div #chart>{{ ... }}</div>`,
})
export class MyChartCmp {
  @ViewChild('chart') chartRef: ElementRef;
  chart: MyChart | null;

  constructor() {
    afterNextRender(() => {
      this.chart = new MyChart(this.chartRef.nativeElement);
    });
  }
}
```

#### Vite and esbuild the default for new projects

In v16 we introduced developer preview of the esbuild plus Vite powered build experience. Since then a lot of developers experimented with it and enterprises! Today, we’re happy to announce that the new application builder graduates from developer preview and is enabled by default for all new applications!

We updated the build pipeline when using hybrid rendering. With SSR & SSG you can observe up to 87% speed improvement in ng build and 80% faster edit-refresh loop in for `ng serve`. We'll be working on schematics to switch existing applications using hybrid rendering (SSR and SSG) to the new builder.

#### Dependency injection debugging in DevTools

Over the past few months, we implemented brand new debugging APIs that allow us to plug into the framework’s runtime and inspect the injector tree.

Based on these APIs we built an inspection user interface that allows you to preview the:

- Dependencies of your components in the component inspector
- Injector tree and dependency resolution path
- Providers declared within the individual injectors

#### Experimental view transitions support

The View Transitions API enables smooth transitions when changing the DOM. In the Angular router we now provide direct support for this API via the `withViewTransitions` feature. Using this, you can use the browser's native capabilities for creating animated transitions between routes.

You can add this feature to your app today by configuring it in the router’s provider declaration during bootstrap:

```typescript
bootstrapApplication(App, {
  providers: [provideRouter(routes, withViewTransitions())],
});
```

`withViewTransitions` accepts an optional configuration object with property `onViewTransitionCreated`, which is a callback that provides you some extra control:

- Decide if you’d like to skip particular animations
- Add classes to the document to customize the animation and remove these classes when the animation completes
- etc.

<a id="breaking-changes"></a>

## Highlighted breaking changes in Angular v17

For a comprehensive list of breaking changes, see the full changelogs on GitHub.

<a id="v17-bc-01"></a>

### Angular v17 requires node.js version v18.13 or newer

Angular requires node.js v18.13 or newer.

See [Version compatibility](/guide/versions) for full version compatibility details.

<a id="v17-bc-02"></a>

### Angular v17 requires TypeScript version 5.2 or later

Angular v17 no longer supports TypeScript versions older than 5.2.

See [Version compatibility](/guide/versions) for full version compatibility details.

<a id="v17-bc-03"></a>

### Angular v17 requires zone.js v0.14.0

Angular v17 no longer supports zone.js older than v0.14.0.

<a id="v17-bc-04"></a>

#### Strict NgSwitch check

The `NgSwitch` directive now defaults to the `===` equality operator, migrating from the previously used `==`. `NgSwitch` expressions or individual condition values need adjusting to this stricter equality check. You'll see a warning message in the console where you need to adjust the check.

<a id="v17-bc-06"></a>

#### Routes with `loadComponent` data inheritance

Child routes with `loadComponent` no longer automatically inherit their data from their parent by default. In v17 the default `paramsInheritanceStrategy` is `emptyOnly`. If you want to inherit parent data in child routes update the strategy to `always`.

<a id="v17-bc-07"></a>

#### Router absolute redirect behavior change

Absolute redirects no longer prevent further redirects. You may need to adjust route configurations to prevent infinite redirects. Previously the router was ignoring all redirects after an absolute redirect.

<a id="v17-bc-08"></a>

#### Removal of `setupTestingRouter`

Use `RouterModule.forRoot` or `provideRouter` to setup the Router for tests instead of `setupTestingRouter`.

<a id="v17-bc-09"></a>

#### Removal of `malformedUriErrorHandler`

We removed `malformedUriErrorHandler` from the `RouterModule.forRoot` options. To handle URL parsing errors use the `UrlSerializer.parse` method.

<a id="v17-bc-10"></a>

#### Removal of zone.js bundles

In v17 we removed `zone-testing-bundle` and `zone-testing-node-bundle` which now prevents you from using `dist/` imports like `zone.js/bundles/zone-testing.js` and `zone.js/dist/zone`.

<a id="v17-bc-11"></a>

#### `OnPush` dynamically instantiated components

For dynamically instantiated components we now execute `ngDoCheck` during change detection if the component is marked as dirty. You may need to update your tests or logic within `ngDoCheck` for dynamically instantiated components.

<a id="v17-bc-12"></a>

#### Relocating Router public methods to `provideRouter` and `RouterModule.forRoot`

Make sure you configure `setupTestingRouter`, `canceledNavigationResolution`, `paramsInheritanceStrategy`, `titleStrategy`, `urlUpdateStrategy`, `urlHandlingStrategy`, and `malformedUriErrorHandler` in `provideRouter` or `RouterModule.forRoot` since these properties are now not part of the `Router`'s public API

<a id="v17-bc-13"></a>

#### `REMOVE_STYLES_ON_COMPONENT_DESTROY` now defaults to `true`

Angular now automatically removes styles of destroyed components, which may impact your existing apps in cases you rely on leaked styles. To change this update the value of the `REMOVE_STYLES_ON_COMPONENT_DESTROY` provider to `false`.

<a id="deprecations"></a>

## Deprecations highlights in Angular v17

These APIs remain available in v17, but may be removed in future versions as described by Angular's
[deprecation policy](/guide/releases#deprecation-policy).

To maintain the reliability of your Angular application, always update your application as soon as
practicable.

| Removed                                      | Replacement           | Details                                                                                                                                                              |
| :------------------------------------------- | :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="v17-dp-01"></a>`NgProbeToken`        | None                  | The `NgProbeToken` is not used internally since the transition from View Engine to Ivy. The token has no utility and can be removed from applications and libraries. |
| <a id="v17-dp-02"></a>`AnimationDriver.NOOP` | `NoopAnimationDriver` | `The AnimationDriver.NOOP` symbol is deprecated, use `NoopAnimationDriver` instead.                                                                                  |

@reviewed 2023-10-26
