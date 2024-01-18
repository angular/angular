# Deferrable Views

## Overview

Deferrable views can be used in component template to defer the loading of select dependencies within that template. Those dependencies include components, directives, and pipes, and any associated CSS. To use this feature, you can declaratively wrap a section of your template in a `@defer` block which specifies the loading conditions.

Deferrable views support a series of [triggers](guide/defer#triggers), [prefetching](guide/defer#prefetching), and several sub blocks used for [placeholder](guide/defer#placeholder), [loading](guide/defer#loading), and [error](guide/defer#error) state management. You can also create custom conditions with [`when`](guide/defer#when) and [`prefetch when`](guide/defer#prefetching).

```html
@defer {
  <large-component />
}
```

## Why use Deferrable Views?

Deferrable views, also known as `@defer` blocks, are a powerful tool that can be used to reduce the initial bundle size of your application or defer heavy components that may not ever be loaded until a later time. This should result in a faster initial load and an improvement in your Core Web Vitals (CWV) results. Deferring some of your components until later should specifically improve Largest Contentful Paint (LCP) and Time to First Byte (TTFB).

Note: It is highly recommended that any defer loaded component that might result in layout shift once the dependencies have loaded be below the fold or otherwise not yet visible to the user.

## Which dependencies are defer-loadable?

In order for dependencies within a `@defer` block to be deferred, they need to meet two conditions:

1. They must be standalone. Non-standalone dependencies cannot be deferred and will still be eagerly loaded, even inside of `@defer` blocks.

2. They must not be directly referenced from the same file, outside of `@defer` blocks; this includes ViewChild queries.

Transitive dependencies of the components, directives, and pipes used in the defer block can be standalone or NgModule based and will still be deferred.

## Blocks

`@defer` blocks have several sub blocks to allow you to gracefully handle different stages in the deferred loading process.

### `@defer`

The content of the main `@defer` block is the section of content that is lazily loaded. It will not be rendered initially, and all of the content will appear once the specified [trigger](guide/defer#triggers) or `when` condition is met and the dependencies have been fetched. By default, a `@defer` block is triggered when the browser state becomes [idle](guide/defer#on-idle).

### `@placeholder`

By default, defer blocks do not render any content before they are triggered. The `@placeholder` is an optional block that declares content to show before the defer block is triggered. This placeholder content is replaced with the main content once the loading is complete. You can use any content in the placeholder section including plain HTML, components, directives, and pipes; however keep in mind the dependencies of the placeholder block are eagerly loaded.

Note: For the best user experience, you should always specify a `@placeholder` block.

The `@placeholder` block accepts an optional parameter to specify the `minimum` amount of time that this placeholder should be shown. This `minimum` parameter is specified in time increments of milliseconds (ms) or seconds (s). This parameter exists to prevent fast flickering of placeholder content in the case that the deferred dependencies are fetched quickly. The `minimum` timer for the `@placeholder` block begins after the initial render of this `@placeholder` block completes.

```html
@defer {
  <large-component />
} @placeholder (minimum 500ms) {
  <p>Placeholder content</p>
}
```

Note: Certain triggers may require the presence of either a `@placeholder` or a [template reference variable](guide/templates/reference-variables) to function. See the [Triggers](guide/defer#triggers) section for more details.

### `@loading`

The `@loading` block is an optional block that allows you to declare content that will be shown during the loading of any deferred dependencies. For example, you could show a loading spinner. Similar to `@placeholder`, the dependencies of the `@loading` block are eagerly loaded.

The `@loading` block accepts two optional parameters to specify the `minimum` amount of time that this placeholder should be shown and amount of time to wait `after` loading begins before showing the loading template. `minimum` and `after` parameters are specified in time increments of milliseconds (ms) or seconds (s). Just like `@placeholder`, these parameters exist to prevent fast flickering of content in the case that the deferred dependencies are fetched quickly. Both the `minimum` and `after` timers for the `@loading` block begins immediately after the loading has been triggered.

```html
@defer {
  <large-component />
} @loading (after 100ms; minimum 1s) {
  <img alt="loading..." src="loading.gif" />
}
```

### `@error`

The `@error` block allows you to declare content that will be shown if deferred loading fails. Similar to `@placeholder` and `@loading`, the dependencies of the `@error` block are eagerly loaded. The `@error` block is optional.

```html
@defer {
  <calendar-cmp />
} @error {
  <p>Failed to load the calendar</p>
}
```

## Triggers

When a `@defer` block is triggered, it replaces placeholder content with lazily loaded content. There are two options for configuring when this swap is triggered: `on` and `when`.

<a id="on"></a>
`on` specifies a trigger condition using a trigger from the list of available triggers below. An example would be on interaction or on viewport.

Multiple event triggers can be defined at once. For example: `on interaction; on timer(5s)` means that the defer block will be triggered if the user interacts with the placeholder, or after 5 seconds.

Note: Multiple `on` triggers are always OR conditions. Similarly, `on` mixed with `when` conditions are also OR conditions.

```html
@defer (on viewport; on timer(5s)) {
  <calendar-cmp />
} @placeholder {
  <img src="placeholder.png" />
}
```

<a id="when"></a>
`when` specifies a condition as an expression that returns a boolean. When this expression becomes truthy, the placeholder is swapped with the lazily loaded content (which may be an asynchronous operation if the dependencies need to be fetched).

Note: if the `when` condition switches back to `false`, the defer block is not reverted back to the placeholder. The swap is a one-time operation. If the content within the block should be conditionally rendered, an `if` condition can be used within the block itself.

```html
@defer (when cond) {
  <calendar-cmp />
}
```

You could also use both `when` and `on` together in one statement, and the swap will be triggered if either condition is met.

```html
@defer (on viewport; when cond) {
  <calendar-cmp />
} @placeholder {
  <img src="placeholder.png" />
}
```

### on idle

`idle` will trigger the deferred loading once the browser has reached an idle state (detected using the `requestIdleCallback` API under the hood). This is the default behavior with a defer block.

### on viewport

`viewport` would trigger the deferred block when the specified content enters the viewport using the [`IntersectionObserver` API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API). This could be the placeholder content or an element reference.

By default, the placeholder will act as the element watched for entering viewport as long as it is a single root element node.

```html
@defer (on viewport) {
  <calendar-cmp />
} @placeholder {
  <div>Calendar placeholder</div>
}
```

Alternatively, you can specify a [template reference variable](guide/templates/reference-variables) in the same template as the `@defer` block as the element that is watched to enter the viewport. This variable is passed in as a parameter on the viewport trigger.

```html
<div #greeting>Hello!</div>

@defer (on viewport(greeting)) {
  <greetings-cmp />
}
```

### on interaction

`interaction` will trigger the deferred block when the user interacts with the specified element through `click` or `keydown` events.

By default, the placeholder will act as the interaction element as long as it is a single root element node.

```html
@defer (on interaction) {
  <calendar-cmp />
} @placeholder {
  <div>Calendar placeholder</div>
}
```

Alternatively, you can specify a [template reference variable](guide/templates/reference-variables) as the element that triggers interaction. This variable is passed in as a parameter on the interaction trigger.

```html
<button type="button" #greeting>Hello!</button>

@defer (on interaction(greeting)) {
  <calendar-cmp />
} @placeholder {
  <div>Calendar placeholder</div>
}
```

### on hover

`hover` triggers deferred loading when the mouse has hovered over the trigger area. Events used for this are `mouseenter` and `focusin`.

By default, the placeholder will act as the hover element as long as it is a single root element node.

```html
@defer (on hover) {
  <calendar-cmp />
} @placeholder {
  <div>Calendar placeholder</div>
}
```

Alternatively, you can specify a [template reference variable](guide/templates/reference-variables) as the hover element. This variable is passed in as a parameter on the hover trigger.

```html
<div #greeting>Hello!</div>

@defer (on hover(greeting)) {
  <calendar-cmp />
} @placeholder {
  <div>Calendar placeholder</div>
}
```

### on immediate

`immediate` triggers the deferred load immediately, meaning once the client has finished rendering, the defer chunk would then start fetching right away.

```html
@defer (on immediate) {
  <calendar-cmp />
} @placeholder {
  <div>Calendar placeholder</div>
}
```

### on timer

`timer(x)` would trigger after a specified duration. The duration is required and can be specified in `ms` or `s`.

```html
@defer (on timer(500ms)) {
  <calendar-cmp />
}
```

## Prefetching

`@defer` allows to specify conditions when prefetching of the dependencies should be triggered. You can use a special `prefetch` keyword. `prefetch` syntax works similarly to the main defer conditions, and accepts `when` and/or `on` to declare the trigger.

In this case, `when` and `on` associated with defer controls when to render, and `prefetch when` and `prefetch on` controls when to fetch the resources. This enables more advanced behaviors, such as letting you start to prefetch resources before a user has actually seen or interacted with a defer block, but might interact with it soon, making the resources available faster.

In the example below, the prefetching starts when a browser becomes idle and the contents of the block is rendered on interaction.

```html
@defer (on interaction; prefetch on idle) {
  <calendar-cmp />
} @placeholder {
  <img src="placeholder.png" />
}
```

## Testing

Angular provides TestBed APIs to simplify the process of testing `@defer` blocks and triggering different states during testing. By default, `@defer` blocks in tests will play through like a defer block would behave in a real application. If you want to manually step through states, you can switch the defer block behavior to `Manual` in the TestBed configuration.

```typescript
it('should render a defer block in different states', async () => {
  // configures the defer block behavior to start in "paused" state for manual control.
  TestBed.configureTestingModule({deferBlockBehavior: DeferBlockBehavior.Manual});

  @Component({
    // ...
    template: `
      @defer {
        <large-component />
      } @placeholder {
        Placeholder
      } @loading {
        Loading...
      }
    `
  })
  class ComponentA {}

  // Create component fixture.
  const componentFixture = TestBed.createComponent(ComponentA);

  // Retrieve the list of all defer block fixtures and get the first block.
  const deferBlockFixture = (await componentFixture.getDeferBlocks())[0];

  // Renders placeholder state by default.
  expect(componentFixture.nativeElement.innerHTML).toContain('Placeholder');

  // Render loading state and verify rendered output.
  await deferBlockFixture.render(DeferBlockState.Loading);
  expect(componentFixture.nativeElement.innerHTML).toContain('Loading');

  // Render final state and verify the output.
  await deferBlockFixture.render(DeferBlockState.Complete);
  expect(componentFixture.nativeElement.innerHTML).toContain('large works!');
});
```

## Behavior with Server-side rendering (SSR) and Static site generation (SSG)

When rendering an application on the server (either using SSR or SSG), defer blocks always render their `@placeholder` (or nothing if a placeholder is not specified). Triggers are ignored on the server.

## Behavior with `NgModule`

`@defer` blocks can be used in both standalone and NgModule-based components, directives and pipes. You can use standalone and NgModule-based dependencies inside of a `@defer` block, however **only standalone components, directives, and pipes can be deferred**. The NgModule-based dependencies would be included into the eagerly loaded bundle.

## Nested `@defer` blocks and avoiding cascading loads

There are cases where nesting multiple `@defer` blocks may cause cascading requests. An example of this would be when a `@defer` block with an immediate trigger has a nested `@defer` block with another immediate trigger. When you have nested `@defer` blocks, make sure that an inner one has a different set of conditions, so that they don't trigger at the same time, causing cascading requests.

## Avoiding Layout Shifts

It is a recommended best practice to not defer components that will be visible in the user's viewport on initial load. This will negatively affect Core Web Vitals by causing an increase in cumulative layout shift (CLS). If you choose to defer components in this area, it's best to avoid `immediate`, `timer`, `viewport`, and custom `when` conditions that would cause the content to be loaded during the initial render of the page.
