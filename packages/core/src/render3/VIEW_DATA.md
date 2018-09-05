# View Data Explanation

`LViewData` and `TView.data` are how the Ivy renderer keeps track of the internal data needed to render the template.
`LViewData` is designed so that a single array can contain all of the necessary data for the template rendering in a compact form.
`TView.data` is a corollary to the `LViewData` and contains information which can be shared across the template instances.

## `LViewData` / `TView.data` layout.

Both `LViewData` and `TView.data` are arrays whose indices refer to the same item.
For example index `123` may point to a component instance in the `LViewData` but a component type in `TView.data`.

The layout is as such:

| Section    | `LViewData`                                   | `TView.data`
| ---------- | --------------------------------------------- | --------------------------------------------------
| `HEADER`   | contextual data                               |  mostly `null`
| `CONSTS`   | DOM, pipe, and local ref instances            |
| `VARS`     | binding values                                |  property names
| `EXPANDO`  | host bindings; directive instances; providers | host prop names; directive tokens; provider tokens


## `HEADER`

`HEADER` is a fixed array size which contains contextual information about the template.
Mostly information such as parent `LViewData`, `Sanitizer`, `TView`, and many more bits of information needed for template rendering.


## `CONSTS`

`CONSTS` contain the DOM elements, pipe instances, and local refs.
The size of the `CONSTS` section is declared in the property `consts` of the component definition.

```typescript
@Component({
  template: `<div>Hello <b>World</b>!</div>`
})
class MyApp {

  static ngComponentDef = defineComponent({
    ...,
    consts: 5,
    template: function(rf: RenderFlags, ctx: MyApp) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'div');
        text(1, 'Hello ');
        elementStart(2, 'b');
        text(3, 'World');
        elementEnd();
        text(4,' '!')
        elementEnd();
      }
      ...
    }
  });
}
```

The above will create following layout:

| Index | `LViewData`         | `TView.data`
| ----: | -----------         | ------------
| `HEADER`
| `CONSTS`
| 10    | `<div>`             | `{type: Element, index: 10, parent: null}`
| 11    | `#text(Hello )`     | `{type: Element, index: 11, parent: tView.data[10]}`
| 12    | `<b>`               | `{type: Element, index: 12, parent: tView.data[10]}`
| 13    | `#text(World)`      | `{type: Element, index: 13, parent: tView.data[12]}`
| 14    | `#text(!)`          | `{type: Element, index: 14, parent: tView.data[10]}`
| ...   | ...                 | ...

NOTE:
- The `10` is not the actual size of `HEADER` but it is left here for simplification.
- `LViewData` contains DOM instances only
- `TView.data` contains information on relationships such as where the parent is.
  You need the `TView.data` information to make sense of the `LViewData` information.


## `VARS`

`VARS` contains information on how to process the bindings.
The size of the `VARS `section is declared in the property `vars` of the component definition.

```typescript
@Component({
  template: `<div title="{{name}}">Hello {{name}}!</div>`
})
class MyApp {
  name = 'World';

  static ngComponentDef = defineComponent({
    ...,
    consts: 2, // Two DOM Element.
    vars: 2,   // Two binding.
    template: function(rf: RenderFlags, ctx: MyApp) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'div');
        text(1);
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        elementProperty(0, 'title', bind(ctx.name));
        textBinding(1, interpolation1('Hello ', ctx.name, '!'));
      }
      ...
    }
  });
}
```

The above will create following layout:

| Index | `LViewData`         | `TView.data`
| ----: | -----------         | ------------
| `HEADER`
| `CONSTS`
| 10    | `<div>`             | `{type: Element, index: 10, parent: null}`
| 11    | `#text()`           | `{type: Element, index: 11, parent: tView.data[10]}`
| `VARS`
| 12    | `'World'`           | `'title'`
| 13    | `'World'`           | `null`
| ...   | ...                 | ...

NOTE:
- `LViewData` contain DOM instances and previous binding values only
- `TView.data` contains information on relationships and property labels.



## `EXPANDO`

*TODO*: This section is to be implemented.

`EXPANDO` contains information on data which size is not known at compile time.
Examples include:
- `Component`/`Directives` since we don't know at compile time which directives will match.
- Host bindings, since until we match the directives it is unclear how many host bindings need to be allocated.

```typescript
@Component({
  template: `<child tooltip></child>`
})
class MyApp {

  static ngComponentDef = defineComponent({
    ...,
    consts: 1,
    template: function(rf: RenderFlags, ctx: MyApp) {
      if (rf & RenderFlags.Create) {
        element(0, 'child', ['tooltip', null]);
      }
      ...
    },
    directives: [Child, Tooltip]
  });
}


@Component({
  selector: 'child',
  ...
})
class Child {
  @HostBinding('tooltip') hostTitle = 'Hello World!';
  static ngComponentDef = defineComponent({
    ...
    hostVars: 1
  });
  ...
}

@Directive({
  selector: '[tooltip]'
})
class Tooltip {
  @HostBinding('title') hostTitle = 'greeting';
  static ngDirectiveDef = defineDirective({
    ...
    hostVars: 1
  });
  ...
}
```


The above will create the following layout:

| Index | `LViewData`         | `TView.data`
| ----: | -----------         | ------------
| `HEADER`
| `CONSTS`
| 10    | `[<child>, ...]`    | `{type: Element, index: 10, parent: null}`
| `VARS`
| `EXPANDO`
| 11..18| cumulativeBloom     | templateBloom
| 19    | `new Child()`       | `Child`
| 20    | `new Tooltip()`     | `Tooltip`
| 21    | `'Hello World!'`    | `'tooltip'`
| 22    | `'greeting'`        | `'title'`
| ...   | ...                 | ...


The `EXPANDO` section needs additional information for information stored in `TView.expandoInstructions`

| Index | `TView.expandoInstructions`         | Meaning
| ----: | ---------------------------:        | -------
| 0     | -10                                 | Negative numbers signifies pointers to elements. In this case 10 (`<child>`)
| 1     | 2                                   | Injector size. Number of values to skip to get to Host Bindings.
| 2     | Child.ngComponentDef.hostBindings   | The function to call. (Only when `hostVars` is not `0`)
| 3     | Child.ngComponentDef.hostVars       | Number of host bindings to process. (Only when `hostVars` is not `0`)
| 4     | Tooltip.ngDirectiveDef.hostBindings | The function to call. (Only when `hostVars` is not `0`)
| 5     | Tooltip.ngDirectiveDef.hostVars     | Number of host bindings to process. (Only when `hostVars` is not `0`)

The reason for this layout is to make the host binding update efficient using this pseudo code:
```typescript
let currentDirectiveIndex = -1;
let currentElementIndex = -1;
// This is global state which is used internally by hostBindings to know where the offset is
let bindingRootIndex = tView.expandoStart;
for(var i = 0; i < tview.expandoInstructions.length; i++) {
  let instruction = tview.expandoInstructions[i];
  if (typeof instruction === 'number') {
    // Numbers are used to update the indices.
    if (instruction < 0) {
      // Negative numbers means that we are starting new EXPANDO block and need to update current element and directive index
      bindingRootIndex += BLOOM_OFFSET;
      currentDirectiveIndex = bindingRootIndex;
      currentElementIndex = -instruction;
    } else {
      bindingRootIndex += instruction;
    }
  } else {
    // We know that we are hostBinding function so execute it.
    instruction(currentDirectiveIndex, currentElementIndex);
    currentDirectiveIndex++;
  }
}
```

The above code should execute as:

| Instruction                           | `bindingRootIndex` | `currentDirectiveIndex`   | `currentElementIndex`
| ----------:                           | -----------------: | ----------------------:   | --------------------:
| (initial)                             | `11`               | `-1`                      | `-1`
| `-10`                                 | `19`               | `\* new Child() *\ 19`    | `\* <child> *\ 10`
| `2`                                   | `21`               | `\* new Child() *\ 19`    | `\* <child> *\ 10`
| `Child.ngComponentDef.hostBindings`   | invoke with =>     | `\* new Child() *\ 19`    | `\* <child> *\ 10`
|                                       | `21`               | `\* new Tooltip() *\ 20`  | `\* <child> *\ 10`
| `Child.ngComponentDef.hostVars`       | `22`               | `\* new Tooltip() *\ 20`  | `\* <child> *\ 10`
| `Tooltip.ngDirectiveDef.hostBindings` | invoke with =>     | `\* new Tooltip() *\ 20`  | `\* <child> *\ 10`
|                                       | `22`               | `21`                      | `\* <child> *\ 10`
| `Tooltip.ngDirectiveDef.hostVars`     | `22`               | `21`                      | `\* <child> *\ 10`

## `EXPANDO` and Injection

`EXPANDO` will also store the injection information for the element.
This is because at the time of compilation we don't know about all of the injection tokens which will need to be created.
(The injection tokens are part of the Component hence hide behind a selector and are not available to the parent component.)

```typescript
@Component({
  template: `<child></child>`
})
class MyApp {

  static ngComponentDef = defineComponent({
    ...,
    consts: 1,
    template: function(rf: RenderFlags, ctx: MyApp) {
      if (rf & RenderFlags.Create) {
        element(0, 'child');
      }
      ...
    },
    directives: [Child]
  });
}


@Component({
  selector: 'child',
  providers: [ServiceA],
  viewProviders: [{provide: ServiceB, useValue: 'someServiceBValue'}]
  ...
})
class Child {
  construction(injector: Injector) {}
  static ngComponentDef = defineComponent({
    ...
    providers: [ServiceA],
    viewProviders: [{provide: ServiceB, useValue: 'someServiceBValue'}]
  });
  ...
}
```

The above will create the following layout:

| Index | `LViewData`           | `TView.data`
| ----: | -----------           | ------------
| `HEADER`
| `CONSTS`
| 10    | `[<child>, ...]`      | `{type: Element, index: 10, parent: null, expando: 11, expandoInjectorCount: 4}`
| `VARS`
| `EXPANDO`
| 11..18| cumulativeBloom       | templateBloom
| 19    | `new Child()`         | `Child`
| 20    | `new Injector()`      | `Injector`
| 21    | `new ServiceA()`      | `ServiceA`
| 22    | `'someServiceBValue'` | `new ViewOnlyToken(ServiceB)`
| ...   | ...                   | ...

NOTICE:
- That `TView.data` has `expando` and `expandoInjectorCount` properties which point to where the element injection data is stored.
- That all injectable tokens are stored in linear sequence making it easy to search for instances to match.
- That `viewProviders` which are private to the view are wrapped in `ViewOnlyToken` object which excludes them from injection unless extra work is performed.



# `LContainer`

TODO

## Combining `LContainer` with `LViewData`

TODO