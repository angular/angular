# Signal queries

A component or directive can define queries that find child elements and read values from their injectors.

Developers most commonly use queries to retrieve references to components, directives, DOM elements, and more.

There are two categories of query: view queries and content queries.

Signal queries supply query results as a reactive signal primitive. You can use query results in `computed` and `effect`, composing these results with other signals.

<div class="alert is-helpful">

Signal queries are in [developer preview](/guide/releases#developer-preview).
APIs may change based on feedback without going through Angular's deprecation cycle.

</div>

If you're already familiar with Angular queries, you can jump straight to [Comparing signal-based queries to decorator-based queries](#comparing-signal-based-queries-to-decorator-based-queries)

## View queries

View queries retrieve results from the elements in the component's own template (view). 

### `viewChild`

You can declare a query targeting a single result with the `viewChild` function. 

```ts
@Component({
    template: `
        <div #el></div>
        <my-component />
    `
})
export class TestComponent {
    // query for a single result by a string predicate  
    divEl = viewChild<ElementRef>('el');       // Signal<ElementRef|undefined>
    // query for a single result by a type predicate
    cmp = viewChild(MyComponent);              // Signal<MyComponent|undefined>
}
```

### `viewChildren`

You can also query for multiple results with the `viewChildren` function. 

```ts
 @Component({
    template: `
        <div #el></div>
        @if (show) {
            <div #el></div>
        }
    `
})
export class TestComponent {
    show = true;

    // query for multiple results
    divEls = viewChildren<ElementRef>('el');        // Signal<ReadonlyArray<ElementRef>>
}
 ```

### View query options

The `viewChild` and the `viewChildren` query declaration functions have a similar signature accepting two arguments:

* a **locator** to specify the query target - it can be either a `string` or any injectable token
* a set of **options**  to adjust behavior of a given query.

Signal-based view queries accept only one option: `read`. The `read` option indicates the type of result to inject from the matched nodes and return in the final results. 

```ts
@Component({
    template: `<my-component/>`
})
export class TestComponent {
    // query for a single result with options
    cmp = viewChild(MyComponent, {read: ElementRef});   // Signal<ElementRef|undefined>
}
```

## Content queries

Content queries retrieve results from the elements in the component's content — the elements nested inside the component tag in the template where it's used. 

### `contentChild`

You can query for a single result with the `contentChild` function. 

```ts
 @Component({...})
 export class TestComponent {
    // query by a string predicate  
    headerEl = contentChild<ElementRef>('h');                    // Signal<ElementRef|undefined>

    // query by a type predicate
    header = contentChild(MyHeader);                             // Signal<MyHeader|undefined>
 }
 ```

 ### `contentChildren`

You can also query for multiple results with the `contentChildren` function. 

```ts
 @Component({...})
 export class TestComponent {
    // query for multiple results
    divEls = contentChildren<ElementRef>('h');                  // Signal<ReadonlyArray<ElementRef>>
 }
 ```

### Content query options

The `contentChild` and the `contentChildren` query declaration functions have a similar signature accepting two arguments:

* a **locator** to specify the query target - it can be either a `string` or any injectable token
* a set of **options**  to adjust behavior of a given query.

Content queries accept the following options:

* `descendants` By default, content queries find only direct children of the component and do not traverse into descendants. If this option is changed to `true`, query results will include all descendants of the element. Even when `true`, however, queries _never_ descend into components.
* `read` indicates the type of result to retrieve from the matched nodes and return in the final results.

### Required child queries

If a child query (`viewChild` or `contentChild`) does not find a result, its value is `undefined`. This may occur if the target element is hidden by a control flow statement like `@if` or `@for`.

Because of this, the child queries return a signal that potentially have the `undefined` value. Most of the time, and especially for the view child queries, developers author their code such that:
* there is at least one matching result;
* results are accessed when the template was processed and query results are available.

For such cases, you can mark child queries as `required` to enforce presence of at least one matching result. This eliminates `undefined` from the result type signature. If a `required` query does not find any results, Angular throws an error.

```ts
@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div #requiredEl></div>
  `,
})
export class App {
  existingEl = viewChild.required('requiredEl');     // required and existing result
  missingEl = viewChild.required('notInATemplate'); // required but NOT existing result
  
  ngAfterViewInit() {
    console.log(this.existingEl()); // OK :-)
    console.log(this.missingEl());  // Runtime error: result marked as required but not available!
  }
}
```

## Results availability timing

A signal query authoring functions will be executed as part of the directive instance construction. This happens before we could create a query instance and execute the template’s creation mode to collect any matches. As a consequence, there is a period of time where the signal instance was created (and can be read) but no query results could have been collected. By default Angular will return `undefined` (for child queries) or an empty array (for children queries) before results are available. Required queries will throw if accessed at this point.

Angular computes signal-based query results lazily, on demand. This means that query results are not collected unless there is a code path that reads the signal. 

Query results can change over time due to the view manipulation - either through the Angular's control flow (`@if`, `@for` etc.) or by the direct calls to the `ViewContainerRef` API. When you read the value from the query result signal, you can receive different values over time. 

Note: to avoid returning incomplete query results while a template is rendered, Angular delays query resolution until it finishes rendering a given template.

## Query declarations functions and the associated rules

The `viewChild`, `contentChild`, `viewChildren` and `contentChildren` functions are special function recognized by the Angular compiler. You can use those functions to declare queries by initializing a component or a directive property. You can never call these functions outside of component and directive property initializers.

```ts
@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div #el></div>
  `,
})
export class App {
  el = viewChild('el'); // all good!

  constructor() {
    const myConst = viewChild('el'); // NOT SUPPORTED
  }
}
```

## Comparing signal-based queries to decorator-based queries

Signal queries are an alternative approach to the queries declared using the `@ContentChild`, `@ContentChildren`, `@ViewChild` or `@ViewChildren` decorators. The new approach exposes query results as signals which means that query results can be composed with other signals (using `computed` or `effect`) and drive change detection. Additionally, the signal-based query system offers other benefits:

* **More predictable timing.** You can access query results as soon as they're available.
* **Simpler API surface.** All queries return a signal, and queries with more than one result let you work with a standard array.
* **Improved type safety.**  Fewer query use cases include `undefined` in the possible results.
* **More accurate type inference.** TypeScript can infer more accurate types when you use a type predicate or when you specify an explicit `read` option.
* **Lazier updates.** - Angular updates signal-based query results lazily; the framework does no work unless your code explicitly reads the query results.

The underlying query mechanism doesn't change much - conceptually Angular still creates singular "child" or plural "children" queries that target elements in a template (view) or content. The difference is in type of results and the exact timing of the results availability. The authoring format for declaring signal-based queries changed as well: the `viewChild`, `viewChildren`, `contentChild` and `contentChildren` functions used as initializer of class members are automatically recognized by Angular. 
