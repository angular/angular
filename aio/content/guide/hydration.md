# Hydration

<div class="alert is-important">

Hydration feature is available for [developer preview](https://angular.io/guide/releases#developer-preview).
It's ready for you to try, but it might change before it is stable.

</div>

## What is hydration

Hydration is the process that restores the server side rendered application on the client. This includes things like reusing the server rendered DOM structures, persisting the application state, transferring application data that was retrieved already by the server, and other processes.

## Why is hydration important?

Hydration improves application performance by avoiding extra work to re-create DOM nodes. Instead, Angular tries to match existing DOM elements to the applications structure at runtime and reuses DOM nodes when possible. This results in a performance improvement that can be measured using [Core Web Vitals (CWV)](https://web.dev/learn-core-web-vitals/) statistics, such as reducing the First Input Delay ([FID](https://web.dev/fid/)) and Largest Contentful Paint ([LCP](https://web.dev/lcp/)), as well as Cumulative Layout Shift ([CLS](https://web.dev/cls/)). Improving these numbers also affects things like SEO performance.

Without hydration enabled, server side rendered Angular applications will destroy and re-render the application's DOM, which may result in a visible UI flicker. This re-rendering can negatively impact [Core Web Vitals](https://web.dev/learn-core-web-vitals/) like [LCP](https://web.dev/lcp/) and cause a layout shift. Enabling hydration allows the existing DOM to be re-used and prevents a flicker.

<a id="how-to-enable"></a>

## How do you enable hydration in Angular

Before you can get started with hydration, you must have a server side rendered (SSR) application. Follow the [Angular Universal Guide](https://angular.io/guide/universal) to enable server side rendering first. Once you have SSR working with your application, you can enable hydration by visiting your main app component or module and importing `provideClientHydration` from `@angular/platform-browser`. You'll then add that provider to your app's bootstrapping providers list.

```typescript
import {
  bootstrapApplication,
  provideClientHydration,
} from '@angular/platform-browser';
...

bootstrapApplication(RootCmp, {
  providers: [provideClientHydration()]
});
```

Alternatively if you are using NgModules, you would add `provideClientHydration` to your root app module's provider list.

```typescript
import {provideClientHydration} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

@NgModule({
  declarations: [RootCmp],
  exports: [RootCmp],
  bootstrap: [RootCmp],
  providers: [provideClientHydration()],
})
export class AppModule {}
```

After you've followed these steps and have started up your server, load your application in the browser.

<div class="alert is-helpful">

  You will likely need to fix instances of Direct DOM Manipulation before hydration will fully work either by switching to Angular constructs or by using `ngSkipHydration`. See [Constraints](#constraints), [Direct DOM Manipulation](#dom-manipulation), and [How to skip hydration for particular components](#ngskiphydration) for more details.

</div>

You can confirm hydration is enabled by opening Developer Tools in your browser and viewing the console. You should see a message that includes hydration-related stats, such as the number of components and nodes hydrated. Note: Angular calculates the stats based on all components rendered on a page, including those that come from third-party libraries.

<a id="constraints"></a>

## Constraints

Hydration imposes a few constraints on your application that are not present without hydration enabled. Ideally your application should have similar application structure (in terms of its DOM representation) on both the server and the client. The process of hydration expects the DOM tree to have the same structure in both places.

If there is a mismatch between server and client DOM tree structures, the hydration process will encounter problems attempting to match up what was expected to what is actually present in the DOM. Components that do direct DOM manipulation using native DOM APIs are the most common culprit.

<a id="dom-manipulation"></a>

### Direct DOM Manipulation

If you have components that manipulate the DOM using native DOM APIs, the hydration process will encounter errors. Specific cases where DOM manipulation is a problem are situations like accessing the `document`, querying for specific elements, and injecting additional nodes using `appendChild`. Detaching DOM nodes and moving them to other locations will also result in errors.

This is because Angular is unaware of these DOM changes and cannot resolve them during the hydration process. Angular will expect a certain structure, but it will encounter a different structure when attempting to hydrate. This mismatch will result in hydration failure and throw a DOM mismatch error ([see below](#errors)).

It is best to refactor your component to avoid this sort of DOM manipulation. Try to use Angular APIs to do this work, if you can. If you cannot refactor this behavior, use the `ngSkipHydration` attribute ([described below](#ngskiphydration)) until you can refactor into a hydration friendly solution.

### Valid HTML DOM structure

There are a few cases where if you have a component template that does not have valid HTML structure, this could result in a DOM mismatch error during hydration. For example, if you have a `<table>` and you did not add a `<tbody>` around your rows, the browser will automatically insert one for you when it sees this HTML structure. The hydration process will not know that the `<tbody>` exists and will result in a hydration mismatch error. The solution to this problem is to ensure your template has a valid `<tbody>` where it should be.

Other examples of this behavior are adding a `<div>` inside a `<p>` tag, putting a `<p>` inside of an `<a>`, and putting a `<p>` inside an `<h1>`. If you are uncertain about whether your HTML is valid, you can use a [syntax validator](https://validator.w3.org/) to check it.

<a id="errors"></a>

## Errors

There are several hydration related errors you may encounter ranging from node mismatches to cases when the `ngSkipHydration` was used on an invalid host node. The most common error case that may occur is due to direct DOM manipulation using native APIs that results in hydration being unable to find or match the expected DOM tree structure on the client that was rendered by the server. The other case you may encounter this type of error was mentioned in the prior section on Valid HTML DOM structures. So, make sure the HTML in your templates are using valid structure, and you'll avoid that error case.

For a full reference on hydration related errors, visit the [Errors Reference Guide](/errors).

<a id="ngskiphydration"></a>

## How to skip hydration for particular components

Some components may not work properly with hydration enabled due to some of the aforementioned issues, like direct DOM manipulation. As a workaround, you can add the `ngSkipHydration` attribute to a component's tag in order to skip hydrating the entire component.

```html
<example-cmp ngSkipHydration />
```

Alternatively you can set `ngSkipHydration` as a host binding.

```typescript
@Component({
  ...
  host: {ngSkipHydration: 'true'},
})
class ExampleCmp {}
```

The `ngSkipHydration` attribute will force Angular to skip hydrating the entire component and its children. Using this attribute means that the component will behave as if hydration is not enabled, meaning it will destroy and re-render itself.

<div class="alert is-helpful">
  This will fix rendering issues, but it means that for this component (and its children), you don't get the benefits of hydration. You will need to adjust your component's implementation to avoid hydration-breaking patterns (i.e. Direct DOM Manipulation) to be able to remove the skip hydration annotation.
</div>

The `ngSkipHydration` attribute can only be used on component host nodes. Angular throws an error if this attribute is added to other nodes.

Keep in mind that adding the `ngSkipHydration` attribute to your root application component would effectively disable hydration for your entire application. Be careful and thoughtful about using this attribute. It is intended as a last resort workaround. Components that break hydration should be considered bugs that need to be fixed.

<a id="i18n"></a>

## I18N
We don't yet support internationalization with hydration, but support is coming. If you attempt to enable hydration on an application with internationalization, you will receive an error NG518, which states that I18N is not yet supported.

## Third Party Libraries with DOM Manipulation

There are a number of third party libraries that depend on DOM manipulation to be able to render. D3 charts is a prime example. These libraries worked without hydration, but they may cause DOM mismatch errors when hydration is enabled. For now, if you encounter DOM mismatch errors using one of these libraries, you can add the `ngSkipHydration` attribute to the component that renders using that library.