# NgModules

IMPORTANT: The Angular team recommends using [standalone components](guide/components/anatomy-of-components#-imports-in-the-component-decorator) instead of `NgModule` for all new code. Use this guide to understand existing code built with `@NgModule`.

An NgModule is a class marked by the `@NgModule` decorator. This decorator accepts *metadata* that tells Angular how to compile component templates and configure dependency injection.

```typescript
import {NgModule} from '@angular/core';

@NgModule({
  // Metadata goes here
})
export class CustomMenuModule { }
```

An NgModule has two main responsibilities:
* Declaring components, directives, and pipes that belong to the NgModule
* Add providers to the injector for components, directives, and pipes that import the NgModule

## Declarations

The `declarations` property of the `@NgModule` metadata declares the components, directives, and pipes that belong to the NgModule.

```typescript
@NgModule({
  /* ... */
  // CustomMenu and CustomMenuItem are components.
  declarations: [CustomMenu, CustomMenuItem],
})
export class CustomMenuModule { }
```

In the example above, the components `CustomMenu` and `CustomMenuItem` belong to `CustomMenuModule`.

The `declarations` property additionally accepts _arrays_ of components, directives, and pipes. These arrays, in turn, may also contain other arrays.

```typescript
const MENU_COMPONENTS = [CustomMenu, CustomMenuItem];
const WIDGETS = [MENU_COMPONENTS, CustomSlider];

@NgModule({
  /* ... */
  // This NgModule declares all of CustomMenu, CustomMenuItem,
  // CustomSlider, and CustomCheckbox.
  declarations: [WIDGETS, CustomCheckbox],
})
export class CustomMenuModule { }
```

If Angular discovers any components, directives, or pipes declared in more than one NgModule, it reports an error.

Any components, directives, or pipes must be explicitly marked as `standalone: false` in order to be declared in an NgModule.

```typescript
@Component({
  // Mark this component as `standalone: false` so that it can be declared in an NgModule.
  standalone: false,
  /* ... */
})
export class CustomMenu { /* ... */ }
```

### imports

Components declared in an NgModule may depend on other components, directives, and pipes. Add these dependencies to the `imports` property of the `@NgModule` metadata.

```typescript
@NgModule({
  /* ... */
  // CustomMenu and CustomMenuItem depend on the PopupTrigger and SelectorIndicator components.
  imports: [PopupTrigger, SelectionIndicator],
  declarations: [CustomMenu, CustomMenuItem],
})
export class CustomMenuModule { }
```

The `imports` array accepts other NgModules, as well as standalone components, directives, and pipes.

### exports

An NgModule can _export_ its declared components, directives, and pipes such that they're available to other components and NgModules.

 ```typescript
@NgModule({
  imports: [PopupTrigger, SelectionIndicator],
  declarations: [CustomMenu, CustomMenuItem],

  // Make CustomMenu and CustomMenuItem available to
  // components and NgModules that import CustomMenuModule.
  exports: [CustomMenu, CustomMenuItem],
})
export class CustomMenuModule { }
```

The `exports` property is not limited to declarations, however. An NgModule can also export any other components, directives, pipes, and NgModules that it imports.

 ```typescript
@NgModule({
  imports: [PopupTrigger, SelectionIndicator],
  declarations: [CustomMenu, CustomMenuItem],

  // Also make PopupTrigger available to any component or NgModule that imports CustomMenuModule.
  exports: [CustomMenu, CustomMenuItem, PopupTrigger],
})
export class CustomMenuModule { }
```

## `NgModule` providers

TIP: See the [Dependency Injection guide](guide/di) for information on dependency injection and providers.

An `NgModule` can specify `providers` for injected dependencies. These providers are available to:
* Any standalone component, directive, or pipe that imports the NgModule, and
* The `declarations` and `providers` of any _other_ NgModule that imports the NgModule.

```typescript
@NgModule({
  imports: [PopupTrigger, SelectionIndicator],
  declarations: [CustomMenu, CustomMenuItem],

  // Provide the OverlayManager service
  providers: [OverlayManager],
  /* ... */
})
export class CustomMenuModule { }

@NgModule({
  imports: [CustomMenuModule],
  declarations: [UserProfile],
  providers: [UserDataClient],
})
export class UserProfileModule { }
```

In the example above:
* The `CustomMenuModule` provides `OverlayManager`.
* The `CustomMenu` and `CustomMenuItem` components can inject `OverlayManager` because they're declared in `CustomMenuModule`.
* `UserProfile` can inject `OverlayManager` because its NgModule imports `CustomMenuModule`.
* `UserDataClient` can inject `OverlayManager` because its NgModule imports `CustomMenuModule`.

### The `forRoot` and `forChild` pattern

Some NgModules define a static `forRoot` method that accepts some configuration and returns an array of providers. The name "`forRoot`" is a convention that indicates that these providers are intended to be added exclusively to the _root_ of your application during bootstrap.

Any providers included in this way are eagerly loaded, increasing the JavaScript bundle size of your initial page load.

```typescript
bootstrapApplication(MyApplicationRoot, {
  providers: [
    CustomMenuModule.forRoot(/* some config */),
  ],
});
```

Similarly, some NgModules may define a static `forChild` that indicates the providers are intended to be added to components within your application hierarchy.

```typescript
@Component({
  /* ... */
  providers: [
    CustomMenuModule.forChild(/* some config */),
  ],
})
export class UserProfile { /* ... */ }
```

## Bootstrapping an application

IMPORTANT: The Angular team recommends using [bootstrapApplication](api/platform-browser/bootstrapApplication) instead of `bootstrapModule` for all new code. Use this guide to understand existing applications bootstrapped with `@NgModule`.

The `@NgModule` decorator accepts an optional `bootstrap` array that may contain one or more components.

You can use the [`bootstrapModule`](https://angular.dev/api/core/PlatformRef#bootstrapModule) method from either [`platformBrowser`](api/platform-browser/platformBrowser) or [`platformServer`](api/platform-server/platformServer) to start an Angular application. When run, this function locates any elements on the page with a CSS selector that matches the listed componet(s) and renders those components on the page.

```typescript
import {platformBrowser} from '@angular/platform-browser';

@NgModule({
  bootstrap: [MyApplication],
})
export class MyApplicationModule { }

platformBrowser().bootstrapModule(MyApplicationModule);
```

Components listed in `bootstrap` are automatically included in the NgModule's declarations.

When you bootstrap an application from an NgModule, the collected `providers` of this module and all of the `providers` of its `imports` are eagerly loaded and available to inject for the entire application.
