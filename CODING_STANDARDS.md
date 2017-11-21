# Angular Material Coding Standards


## Code style

The [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html) is the
basis for our coding style, with additional guidance here where that style guide is not aligned with
ES6 or TypeScript.

## Coding practices

### General

#### Write useful comments
Comments that explain what some block of code does are nice; they can tell you something in less
time than it would take to follow through the code itself.

Comments that explain why some block of code exists at all, or does something the way it does,
are _invaluable_. The "why" is difficult, or sometimes impossible, to track down without seeking out
the original author. When collaborators are in the same room, this hurts productivity.
When collaborators are in different timezones, this can be devastating to productivity.

For example, this is a not-very-useful comment:
```ts
// Set default tabindex.
if (!$attrs['tabindex']) {
  $element.attr('tabindex', '-1');
}
```

While this is much more useful:
```ts
// Unless the user specifies so, the calendar should not be a tab stop.
// This is necessary because ngAria might add a tabindex to anything with an ng-model
// (based on whether or not the user has turned that particular feature on/off).
if (!$attrs['tabindex']) {
  $element.attr('tabindex', '-1');
}
```

In TypeScript code, use JsDoc-style comments for descriptions (on classes, members, etc.) and
use `//` style comments for everything else (explanations, background info, etc.).

In SCSS code, always use `//` style comments.

In HTML code, use `<!-- ... -->` comments, which will be stripped when packaging a build.

#### Prefer more focused, granular components vs. complex, configurable components.

For example, rather than doing this:
```html
<mat-button>Basic button</mat-button>
<mat-button class="mat-fab">FAB</mat-button>
<mat-button class="mat-icon-button">pony</mat-button>
```

do this:
```html
<mat-button>Basic button</mat-button>
<mat-fab>FAB</mat-fab>
<mat-icon-button>pony</mat-icon-button>
```

#### Prefer small, focused modules
Keeping modules to a single responsibility makes the code easier to test, consume, and maintain.
ES6 modules offer a straightforward way to organize code into logical, granular units.
Ideally, individual files are 200 - 300 lines of code.

As a rule of thumb, once a file draws near 400 lines (barring abnormally long constants / comments),
start considering how to refactor into smaller pieces.

#### Less is more
Once a feature is released, it never goes away. We should avoid adding features that don't offer
high user value for price we pay both in maintenance, complexity, and payload size. When in doubt,
leave it out.

This applies especially to providing two different APIs to accomplish the same thing. Always
prefer sticking to a _single_ API for accomplishing something.

### 100 column limit
All code and docs in the repo should be 100 columns or fewer. This applies to TypeScript, SCSS,
HTML, bash scripts, and markdown files.

### API Design

#### Boolean arguments
Avoid adding boolean arguments to a method in cases where that argument means "do something extra".
In these cases, prefer breaking the behavior up into different functions.

```ts
// AVOID
function getTargetElement(createIfNotFound = false) {
  // ...
}
```

```ts
// PREFER
function getExistingTargetElement() {
  // ...
}

function createTargetElement() {
 // ...
}
```

### TypeScript

#### Typing
Avoid `any` where possible. If you find yourself using `any`, consider whether a generic may be
appropriate in your case.

For methods and properties that are part of a component's public API, all types must be explicitly
specified because our documentation tooling cannot currently infer types in places where TypeScript
can.

#### Fluent APIs
When creating a fluent or builder-pattern style API, use the `this` return type for methods:
```
class ConfigBuilder {
  withName(name: string): this {
    this.config.name = name;
    return this;
  }
}
```

#### RxJS
When dealing with RxJS operators, import the lettable operator (e.g.
`import {map} from 'rxjs/operators/map'`), as opposed to using the "patch" imports which pollute the
user's global Observable object (e.g. `import 'rxjs/add/operator/map'`):

```ts
// NO
import 'rxjs/add/operator/map';
someObservable.map(...).subscribe(...);

// YES
import {map} from 'rxjs/operators/map';
someObservable.pipe(map(...)).subscribe(...);
```

#### Access modifiers
* Omit the `public` keyword as it is the default behavior.
* Use `private` when appropriate and possible, prefixing the name with an underscore.
* Use `protected` when appropriate and possible with no prefix.
* Prefix *library-internal* properties and methods with an underscore without using the `private`
keyword. This is necessary for anything that must be public (to be used by Angular), but should not
be part of the user-facing API. This typically applies to symbols used in template expressions,
`@ViewChildren` / `@ContentChildren` properties, host bindings, and `@Input` / `@Output` properties
(when using an alias).

Additionally, the `@docs-private` JsDoc annotation can be used to hide any symbol from the public
API docs.


#### Getters and Setters
* Avoid long or complex getters and setters. If the logic of an accessor would take more than
three lines, introduce a new method to contain the logic.
* A getter should immediately precede its corresponding setter.
* Decorators such as `@Input` should be applied to the getter and not the setter.
* Always use a `readonly` property instead of a getter (with no setter) when possible.
  ```ts
  /** YES */
  readonly active: boolean;

  /** NO */
  get active(): boolean {
    // Using a getter solely to make the property read-only.
    return this._active;
  }
  ```

#### JsDoc comments

All public APIs must have user-facing comments. These are extracted and shown in the documentation
on [material.angular.io](https://material.angular.io).

Private and internal APIs should have JsDoc when they are not obvious. Ultimately it is the purview
of the code reviewer as to what is "obvious", but the rule of thumb is that *most* classes,
properties, and methods should have a JsDoc description.

Properties should have a concise description of what the property means:
```ts
  /** The label position relative to the checkbox. Defaults to 'after' */
  @Input() labelPosition: 'before' | 'after' = 'after';
```

Methods blocks should describe what the function does and provide a description for each parameter
and the return value:
```ts
  /**
   * Opens a modal dialog containing the given component.
   * @param component Type of the component to load into the dialog.
   * @param config Dialog configuration options.
   * @returns Reference to the newly-opened dialog.
   */
  open<T>(component: ComponentType<T>, config?: MatDialogConfig): MatDialogRef<T> { ... }
```

Boolean properties and return values should use "Whether..." as opposed to "True if...":
```ts
  /** Whether the button is disabled. */
  disabled: boolean = false;
```

#### Try-Catch

Avoid `try-catch` blocks, instead preferring to prevent an error from being thrown in the first
place. When impossible to avoid, the `try-catch` block must include a comment that explains the
specific error being caught and why it cannot be prevented.


#### Naming

##### General
* Prefer writing out words instead of using abbreviations.
* Prefer *exact* names over short names (within reason). E.g., `labelPosition` is better than
`align` because the former much more exactly communicates what the property means.
* Except for `@Input` properties, use `is` and `has` prefixes for boolean properties / methods.

##### Classes
Classes should be named based on what they're responsible for. Names should capture what the code
*does*, not how it is used:
```
/** NO: */
class RadioService { }

/** YES: */
class UniqueSelectionDispatcher { }
```

Avoid suffixing a class with "Service", as it communicates nothing about what the class does. Try to
think of the class name as a person's job title.

Classes that correspond to a directive with an `mat-` prefix should also be prefixed with `Mat`.
CDK classes should only have a `Cdk` prefix when the class is a directive with a `cdk` selector
prefix.

##### Methods
The name of a method should capture the action that is performed *by* that method rather than
describing when the method will be called. For example,

```ts
/** AVOID: does not describe what the function does. */
handleClick() {
  // ...
}

/** PREFER: describes the action performed by the function. */
activateRipple() {
  // ...
}
```

#### Inheritance

Avoid using inheritance to apply reusable behaviors to multiple components. This limits how many
behaviors can be composed. Instead, [TypeScript mixins][ts-mixins] can be used to compose multiple
common behaviors into a single component.

### Angular

#### Host bindings
Prefer using the `host` object in the directive configuration instead of `@HostBinding` and
`@HostListener`. We do this because TypeScript preserves the type information of methods with
decorators, and when one of the arguments for the method is a native `Event` type, this preserved
type information can lead to runtime errors in non-browser environments (e.g., server-side
pre-rendering).


### CSS

#### Be cautious with use of `display: flex`
* The [baseline calculation for flex elements](http://www.w3.org/TR/css-flexbox-1/#flex-baselines)
is different than other display values, making it difficult to align flex elements with standard
elements like input and button.
* Component outermost elements are never flex (block or inline-block)
* Don't use `display: flex` on elements that will contain projected content.

#### Use lowest specificity possible
Always prioritize lower specificity over other factors. Most style definitions should consist of a
single element or css selector plus necessary state modifiers. **Avoid SCSS nesting for the sake of
code organization.** This will allow users to much more easily override styles.

For example, rather than doing this:
```scss
.mat-calendar {
  display: block;

  .mat-month {
    display: inline-block;

    .mat-date.mat-selected {
      font-weight: bold;
    }
  }
}
```

do this:
```scss
.mat-calendar {
  display: block;
}

.mat-calendar-month {
  display: inline-block;
}

.mat-calendar-date.mat-selected {
  font-weight: bold;
}
```

#### Never set a margin on a host element.
The end-user of a component should be the one to decide how much margin a component has around it.

#### Prefer styling the host element vs. elements inside the template (where possible).
This makes it easier to override styles when necessary. For example, rather than

```scss
the-host-element {
  // ...

  .some-child-element {
    color: red;
  }
}
```

you can write
```scss
the-host-element {
  // ...
  color: red;
}
```

The latter is equivalent for the component, but makes it easier override when necessary.

#### Support styles for Windows high-contrast mode
This is a low-effort task that makes a big difference for low-vision users. Example:
```css
@media screen and (-ms-high-contrast: active) {
  .unicorn-motocycle {
    border: 1px solid #fff !important;
  }
}
```

#### Explain what CSS classes are for
When it is not super obvious, include a brief description of what a class represents. For example:
```scss
// The calendar icon button used to open the calendar pane.
.mat-datepicker-button { ... }

// Floating pane that contains the calendar at the bottom of the input.
.mat-datepicker-calendar-pane { ... }

// Portion of the floating panel that sits, invisibly, on top of the input.
.mat-datepicker-input-mask { }
```

[ts-mixins]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-mix-in-classes
