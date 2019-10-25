`@angular/cdk/testing` provides infrastructure to help with testing Angular components.

### Component test harnesses

A component harness is a class that lets a test interact with a component via a supported API.
Each harness's API interacts with a component the same way a user would. By using the harness API,
a test insulates itself against updates to the internals of a component, such as changing its DOM
structure. The idea for component harnesses comes from the
[PageObject](https://martinfowler.com/bliki/PageObject.html) pattern commonly used for integration
testing.

`@angular/cdk/testing` contains infrastructure for creating and using component test harnesses. You
can create test harnesses for any component, ranging from small reusable widgets to full application
pages. 

The component harness system supports multiple testing environments. You can use the same harness
implementation in both unit and end-to-end tests. This means that users only need to learn one API,
and component authors don't have to maintain separate unit and end-to-end test implementations.

Common component libraries, in particular, benefit from this infrastructure due to the wide use of
their components. Providing a test harness allows the consumers of a component to write tests that
avoid dependencies on any private implementation details. By capturing these implementation details
in a single place, consumers can more easily update to new library versions.

This document provides guidance for three types of developers:
1. [Test authors](#api-for-test-authors)
2. [Component harness authors](#api-for-component-harness-authors)
3. [Harness environment authors](#api-for-harness-environment-authors)
   
Since many developers fall into only one of these categories, the relevant APIs are broken out by
developer type in the sections below.

### API for test authors

Test authors are developers using component harnesses written by someone else to test their
application. For example, this could be an app developer who uses a third-party menu component and
needs to interact with the menu in a unit test.

#### Working with `ComponentHarness` classes

`ComponentHarness` is the abstract base class for all component harnesses. Every harness extends
this class. All `ComponentHarness` subclasses have a static property, `hostSelector`, that
matches the harness class to instances of the component in the DOM. Beyond that, the API of any
given harness is specific to its corresponding component; refer to the component's documentation to
learn how to use a specific harness.

#### Using `TestbedHarnessEnvironment` and `ProtractorHarnessEnvironment`

These classes correspond to different implementations of the component harness system with bindings
for specific test environments. Any given test must only import _one_ of these classes. Karma-based
unit tests should use the `TestbedHarnessEnvironment`, while Protractor-based end-to-end tests
should use the `ProtractorHarnessEnvironment`. Additional environments require custom bindings; see
[API for harness environment authors](#api-for-harness-environment-authors) for more information on
alternate test environments.

These classes are primarily used to create a `HarnessLoader` instance, and in certain cases, to
create `ComponentHarness` instances directly.

`TestbedHarnessEnvironment` offers the following static methods:

| Method | Description |
| ------ | ----------- |
| `loader(fixture: ComponentFixture<unknown>): HarnessLoader` | Gets a `HarnessLoader` instance for the given fixture, rooted at the fixture's root element. Should be used to create harnesses for elements contained inside the fixture |
| `documentRootLoader(fixture: ComponentFixture<unknown>): HarnessLoader` | Gets a `HarnessLoader` instance for the given fixture, rooted at the HTML document's root element. Can be used to create harnesses for elements that fall outside of the fixture |
| `harnessForFixture<T extends ComponentHarness>(fixture: ComponentFixture<unknown>, harnessType: ComponentHarnessConstructor<T>): Promise<T>` | Used to create a `ComponentHarness` instance for the fixture's root element directly. This is necessary when bootstrapping the test with the component you plan to load a harness for, because Angular does not set the proper tag name when creating the fixture. |

In most cases, you can create a `HarnessLoader` in the `beforeEach` block using
`TestbedHarnessEnvironment.loader(fixture)` and then use that `HarnessLoader` to create any
necessary `ComponentHarness` instances. The other methods cover special cases as shown in this
example:  

Consider a reusable dialog-button component that opens a dialog on click, containing the following
components, each with a corresponding harness:
- `MyDialogButton` (composes the `MyButton` and `MyDialog` with a convenient API)
- `MyButton` (a simple button component)
- `MyDialog` (a dialog appended to `document.body` by `MyButtonDialog` upon click)

The following code loads harnesses for each of these components:

```ts
let fixture: ComponentFixture<MyDialogButton>;
let loader: HarnessLoader;
let rootLoader: HarnessLoader;

beforeEach(() => {
  fixture = TestBed.createComponent(MyDialogButton);
  loader = TestbedHarnessEnvironment.loader(fixture);
  rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
});

it('loads harnesses', async () => {
  // Load a harness for the bootstrapped component with `harnessForFixture`
  dialogButtonHarness =
      await TestbedHarnessEnvironment.harnessForFixture(fixture, MyDialogButtonHarness);

  // The button element is inside the fixture's root element, so we use `loader`.
  const buttonHarness = await loader.getHarness(MyButtonHarness);

  // Click the button to open the dialog
  await buttonHarness.click();

  // The dialog is appended to `document.body`, outside of the fixture's root element,
  // so we use `rootLoader` in this case.
  const dialogHarness = await rootLoader.getHarness(MyDialogHarness);

  // ... make some assertions
});
```

`ProtractorHarnessEnvironment` has an API that offers a single static method:

| Method | Description |
| ------ | ----------- |
| `loader(): HarnessLoader` | Gets a `HarnessLoader` instance for the current HTML document, rooted at the document's root element. |

Since Protractor does not deal with fixtures, the API in this environment is simpler. The
`HarnessLoader` returned by the `loader()` method should be sufficient for loading all necessary
`ComponentHarness` instances.

Please note that harnesses may not behave _exactly_ the same in all environments. There will always
be some difference between the real browser-generated event sequence when a user clicks or types in
an element, versus the simulated event sequence generated in unit tests. Instead, the CDK makes a
best effort to normalize the behavior and simulate the most important events in the sequence.

#### Creating harnesses with `HarnessLoader`

Instances of this class correspond to a specific DOM element (the "root element" of the loader) and
are used to create `ComponentHarness` instances for elements under this root element.

`HarnessLoader` instances have the following methods:

| Method | Description |
| ------ | ----------- |
| `getChildLoader(selector: string): Promise<HarnessLoader>` | Searches for an element matching the given selector below the root element of this `HarnessLoader`, and returns a new `HarnessLoader` rooted at the first matching element |
| `getAllChildLoaders(selector: string): Promise<HarnessLoader[]>` | Acts like `getChildLoader`, but returns an array of `HarnessLoader` instances, one for each matching element, rather than just the first matching element |
| `getHarness<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T> \| HarnessPredicate<T>): Promise<T>` | Searches for an instance of the given `ComponentHarness` class or `HarnessPredicate` below the root element of this `HarnessLoader` and returns an instance of the harness corresponding to the first matching element |
| `getAllHarnesses<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T> \| HarnessPredicate<T>): Promise<T[]>` | Acts like `getHarness`, but returns an array of harness instances, one for each matching element, rather than just the first matching element  |

Calls to `getHarness` and `getAllHarnesses` can either take `ComponentHarness` subclass or a 
`HarnessPredicate`. `HarnessPredicate` applies additional restrictions to the search (e.g. searching
for a button that has some particular text, etc). The
[details of `HarnessPredicate`](#filtering-harness-instances-with-harnesspredicate) are discussed in
the [API for component harness authors](#api-for-component-harness-authors); harness authors should
provide convenience methods on their `ComponentHarness` subclass to facilitate creation of
`HarnessPredicate` instances. However, if the harness author's API is not sufficient, they can be
created manually.

#### Working with asynchronous component harness methods

In order to support both unit and end-to-end tests, and to insulate tests against changes in
asynchronous behavior, almost all harness methods are asynchronous and return a `Promise`;
therefore, the Angular team recommends using 
[ES2017 `async`/`await` syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
to improve the test readability.

Note that `await` statements block the execution of your test until the associated `Promise`
resolves. When reading multiple properties off a harness it may not be necessary to block on the
first before asking for the next, in these cases use `Promise.all` to parallelize.

For example, consider the following example of reading both the `checked` and `indeterminate` state
off of a checkbox harness:

```ts
it('reads properties in parallel', async () => {
  const checkboxHarness = loader.getHarness(MyCheckboxHarness);
  const [checked, indeterminate] = await Promise.all([
    checkboxHarness.isChecked(),
    checkboxHarness.isIndeterminate()
  ]);

  // ... make some assertions
});
```

### API for component harness authors

Component harness authors are developers who maintain some reusable Angular component, and want to
create a test harness for it, that users of the component can use in their tests. For example, this
could be an author of a third party Angular component library or a developer who maintains a set of
common components for a large Angular application.

#### Extending `ComponentHarness`

The abstract `ComponentHarness` class is the base class for all component harnesses. To create a
custom component harness, extend `ComponentHarness` and implement the static property
`hostSelector`. The `hostSelector` property identifies elements in the DOM that match this harness
subclass. In most cases the `hostSelector` should be the same as the `selector` of the corresponding
`Component` or `Directive`. For example, consider a simple popup component:

```ts
@Component({
  selector: 'my-popup',
  template: `
    <button (click)="toggle()">{{triggerText}}</button>
    <div *ngIf="open" class="my-popup-content"><ng-content></ng-content></div>
  `
})
class MyPopup {
  @Input() triggerText: string;

  open = false;

  toggle() {
    this.open = !this.open;
  }
}
```

In this case, a minimal harness for the component would look like the following:

```ts
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';
}
```

While `ComponentHarness` subclasses require only the `hostSelector` property, most harnesses should
also implement a static `with` method to generate `HarnessPredicate` instances. The
[`HarnessPredicate`](#filtering-harness-instances-with-harnesspredicate) section below covers this
in more detail.

#### Finding elements in the component's DOM

Each instance of a `ComponentHarness` subclass represents a particular instance of the
corresponding component. You can access the component's host element via the `host` method from
the `ComponentHarness` base class.

`ComponentHarness` additionally offers several methods for locating elements within the component's
DOM. These methods are `locatorFor`, `locatorForOptional`, and `locatorForAll`. 
Note, though, that these methods do not directly find elements. Instead, they _create functions_
that find elements. This approach safeguards against caching references to out-of-date elements. For
example, when an `ngIf` hides and then shows an element, the result is a new DOM element; using
functions ensures that tests always reference the current state of the DOM.

| Method | Description |
| ------ | ----------- |
| `host(): Promise<TestElement>` | Returns a `Promise` for the host element of the corresponding component instance. |
| `locatorFor(selector: string): () => Promise<TestElement>` | Creates a function that returns a `Promise` for the first element matching the given selector when called. If no matching element is found, the `Promise` rejects. |
| `locatorForOptional(selector: string): () => Promise<TestElement \| null>` | Creates a function that returns a `Promise` for the first element matching the given selector when called. If no matching element is found, the `Promise` is resolved with `null`. |
| `locatorForAll(selector: string): () => Promise<TestElement[]>` | Creates a function that returns a `Promise` for a list of all elements matching the given selector when called. |

For example, the `MyPopupHarness` class discussed above could provide methods to get the trigger
and content elements as follows:

```ts
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';

  /** Gets the trigger element */
  getTriggerElement = this.locatorFor('button');

  /** Gets the content element. */
  getContentElement = this.locatorForOptional('.my-popup-content');
}
```

#### Working with `TestElement` instances

The functions created with the locator methods described above all return `TestElement` instances.
`TestElement` offers a number of methods to interact with the underlying DOM:

| Method | Description |
| ------ | ----------- |
| `blur(): Promise<void>` | Blurs the element. |
| `clear(): Promise<void>` | Clears the text in the element (intended for `<input>` and `<textarea>` only). |
| `click(relativeX?: number, relativeY?: number): Promise<void>` | Clicks the element (at the given position relative to the element's top-left corner). |
| `focus(): Promise<void>` | Focuses the element. |
| `getCssValue(property: string): Promise<string>` | Gets the computed value of the given CSS property for the element. |
| `hover(): Promise<void>` | Hovers over the element. |
| `sendKeys(modifiers?: ModifierKeys, ...keys: (string \| TestKey)[]): Promise<void>` | Sends the given list of key presses to the element (with optional modifier keys). |
| `text(): Promise<string>` | Gets the text content of the element |
| `getAttribute(name: string): Promise<string \| null>` | Gets the value of the given HTML attribute for the element. |
| `hasClass(name: string): Promise<boolean>` | Checks whether the element has the given class applied. |
| `getDimensions(): Promise<ElementDimensions>` | Gets the dimensions of the element. |
| `getProperty(name: string): Promise<any>` | Gets the value of the given JS property for the element. |
| `matchesSelector(selector: string): Promise<boolean>` | Checks whether the element matches the given CSS selector. |

`TestElement` is an abstraction designed to work across different test environments (Karma,
Protractor, etc). When using harnesses, you should perform all DOM interaction via this interface.
Other means of accessing DOM elements (e.g. `document.querySelector`) will not work in all test
environments.

As a best practice, you should not expose `TestElement` instances to users of a harness
unless its an element the component consumer defines directly (e.g. the host element). Exposing
`TestElement` instances for internal elements leads users to depend on a component's internal DOM
structure.

Instead, provide more narrow-focused methods for particular actions the end user will
take or particular state they may want to check. For example, `MyPopupHarness` could provide methods
like `toggle` and `isOpen`:

```ts
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';

  protected getTriggerElement = this.locatorFor('button');
  protected getContentElement = this.locatorForOptional('.my-popup-content');

  /** Toggles the open state of the popup. */
  async toggle() {
    const trigger = await this.getTriggerElement();
    return trigger.click();
  }

  /** Checks if the popup us open. */
  async isOpen() {
    const content = await this.getContentElement();
    return !!content;
  }
}
```

#### Loading harnesses for subcomponents

Larger components often compose smaller components. You can reflect this structure in a
component's harness as well. Each of the `locatorFor` methods on `ComponentHarness` discussed
earlier has an alternate signature that can be used for locating sub-harnesses rather than elements.

| Method | Description |
| ------ | ----------- |
| `locatorFor<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T>): () => Promise<T>` | Creates a function that returns a `Promise` for the first harness matching the given harness type when called. If no matching harness is found, the `Promise` rejects. |
| `locatorForOptional<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T>): () => Promise<T \| null>` | Creates a function that returns a `Promise` for the first harness matching the given harness type when called. If no matching harness is found, the `Promise` is resolved with `null`. |
| `locatorForAll<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T>): () => Promise<T[]>` | Creates a function that returns a `Promise` for a list of all harnesses matching the given harness type when called. |

For example consider a menu build using the popup shown above:

```ts
@Component({
  selector: 'my-menu',
  template: `
    <my-popup>
      <ng-content></ng-content>
    </my-popup>
  `
})
class MyMenu {
  @Input() triggerText: string;

  @ContentChildren(MyMenuItem) items: QueryList<MyMenuItem>;
}

@Directive({
  selector: 'my-menu-item'
})
class MyMenuItem {}
```

The harness for `MyMenu` can then take advantage of other harnesses for `MyPopup` and `MyMenuItem`:

```ts
class MyMenuHarness extends ComponentHarness {
  static hostSelector = 'my-menu';

  protected getPopupHarness = this.locatorFor(MyPopupHarness);

  /** Gets the currently shown menu items (empty list if menu is closed). */
  getItems = this.locatorForAll(MyMenuItemHarness);

  /** Toggles open state of the menu. */
  async toggle() {
    const popupHarness = await this.getPopupHarness();
    return popupHarness.toggle();
  }
}

class MyMenuItemHarness extends ComponentHarness {
  static hostSelector = 'my-menu-item';
}
```

#### Filtering harness instances with `HarnessPredicate`

When a page contains multiple instances of a particular component, you may want to filter based on
some property of the component to get a particular component instance. For example, you may want
a button with some specific text, or a menu with a specific ID. The `HarnessPredicate`
class can capture criteria like this for a `ComponentHarness` subclass. While the
test author is able to construct `HarnessPredicate` instances manually, its easier when the
`ComponentHarness` subclass provides a helper method to construct predicates for common filters.

The recommended approach to providing this helper is to create a static `with` method on each
`ComponentHarness` subclass that returns a `HarnessPredicate` for that class. This allows test
authors to write easily understandable code, e.g.
`loader.getHarness(MyMenuHarness.with({selector: '#menu1'}))`. In addition to the standard
`selector` and `ancestor` options, the `with` method should add any other options that make sense
for the particular subclass.

Harnesses that need to add additional options should extend the `BaseHarnessFilters` interface and
additional optional properties as needed. `HarnessPredicate` provides several convenience methods
for adding options.

| Method | Description |
| ------ | ----------- |
| `static stringMatches(s: string \| Promise<string>, pattern: string \| RegExp): Promise<boolean>` | Compares a string or `Promise` of a string against a `string` or `RegExp` and returns a boolean `Promise` indicating whether it matches. |
| `addOption<O>(name: string, option: O \| undefined, predicate: (harness: T, option: O) => Promise<boolean>): HarnessPredicate<T>` | Creates a new `HarnessPredicate` that enforces all of the conditions of the current one, plus the new constraint specified by the `predicate` parameter. If the `option` parameter is `undefined` the `predicate` is considered to be always true. |
| `add(description: string, predicate: (harness: T) => Promise<boolean>): HarnessPredicate<T>` | Creates a new `HarnessPredicate` that enforces all of the conditions of the current one, plus the new constraint specified by the `predicate` parameter. |

For example, when working with a menu it would likely be useful to add a way to filter based on
trigger text and to filter menu items based on their text: 

```ts
interface MyMenuHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the trigger text for the menu. */
  triggerText?: string | RegExp;
}

interface MyMenuItemHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the text of the menu item. */
  text?: string | RegExp;
}

class MyMenuHarness extends ComponentHarness {
  static hostSelector = 'my-menu';

  /** Creates a `HarnessPredicate` used to locatr a particular `MyMenuHarness`. */
  static with(options: MyMenuHarnessFilters): HarnessPredicate<MyMenuHarness> {
    return new HarnessPredicate(MyMenuHarness, options)
        .addOption('trigger text', options.triggerText,
            (harness, text) => HarnessPredicate.stringMatches(harness.getTriggerText(), text));
  }

  protected getPopupHarness = this.locatorFor(MyPopupHarness);

  /** Gets the text of the menu trigger. */
  getTriggerText(): Promise<string> {
    const popupHarness = await this.getPopupHarness();
    return popupHarness.getTriggerText();
  }

  ...
}

class MyMenuItemHarness extends ComponentHarness {
  static hostSelector = 'my-menu-item';

  /** Creates a `HarnessPredicate` used to locatr a particular `MyMenuItemHarness`. */
  static with(options: MyMenuItemHarnessFilters): HarnessPredicate<MyMenuItemHarness> {
    return new HarnessPredicate(MyMenuItemHarness, options)
        .addOption('text', options.text,
            (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text));
  }

  /** Gets the text of the menu item. */
  async getText(): Promise<string> {
    const host = await this.host();
    return host.text();
  }
}
```

You can pass a `HarnessPredicate` in place of a `ComponentHarness` class to any of the APIs on
`HarnessLoader`, `LocatorFactory`, or `ComponentHarness`. This allows test authors to easily target
a particular component instance when creating a harness instance. It also allows the harness author
to leverage the same `HarnessPredicate` to enable more powerful APIs on their harness class. For
example, consider the `getItems` method on the `MyMenuHarness` shown above.
This can now easily be expanded to allow users of the harness to search for particular menu items:

```ts
class MyMenuHarness extends ComponentHarness {
  static hostSelector = 'my-menu';

  /** Gets a list of items in the menu, optionally filtered based on the given criteria. */
  async getItems(filters: MyMenuItemHarnessFilters = {}): Promise<MyMenuItemHarness[]> {
    const getFilteredItems = this.locatorFor(MyMenuItemHarness.with(filters));
    return getFilteredItems();
  }

  ...
}
```

#### Creating a `HarnessLoader` for an element

Some components use `<ng-content>` to project additional content into the component's template. When
creating a harness for such a component, you can give the harness user a `HarnessLoader` instance
scoped to the element containing the `<ng-content>`. This allows the user of the harness to load
additional harnesses for whatever components were passed in as content. `ComponentHarness` has
several APIs that can be used to create `HarnessLoader` instances for cases like this.

| Method | Description |
| ------ | ----------- |
| `harnessLoaderFor(selector: string): Promise<HarnessLoader>` | Gets a `Promise` for a `HarnessLoader` rooted at the first element matching the given selector, if no element is found the `Promise` rejects. |
| `harnessLoaderForOptional(selector: string): Promise<HarnessLoader \| null>` | Gets a `Promise` for a `HarnessLoader` rooted at the first element matching the given selector, if no element is found the `Promise` resolves to `null`. |
| `harnessLoaderForAll(selector: string): Promise<HarnessLoader[]>` | Gets a `Promise` for a list of `HarnessLoader`, one rooted at each element matching the given selector. |

The `MyPopup` component discussed earlier is a good example of a component with arbitrary content
that users may want to load harnesses for. `MyPopupHarness` could add support for this:

```ts
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';

  /** Gets a `HarnessLoader` whose root element is the popup's content element. */
  async getHarnessLoaderForContent(): Promise<HarnessLoader> {
    return this.harnessLoaderFor('my-popup-content');
  }
}
```

#### Accessing elements outside of the component's host element

There are times when a component harness might need to access elements outside of it's corresponding
component's host element. A good example of this is components that use the
[CDK overlay](https://material.angular.io/cdk/overlay/overview). The CDK overlay creates an element
that is attached directly to the body, outside of the component's host element. In this case,
`ComponentHarness` provides a method that can be used to get a `LocatorFactory` for the root element
of the document. The `LocatorFactory` supports most of the same APIs as the `ComponentHarness` base
class, and can then be used to query relative to the document's root element.

| Method | Description |
| ------ | ----------- |
| `documentRootLocatorFactory(): LocatorFactory` | Creates a `LocatorFactory` rooted at the document's root element. |

Consider if the `MyPopup` component above used the CDK overlay for the popup content, rather than an
element in its own template. In this case, `MyPopupHarness` would have to access the content element
via `documentRootLocatorFactory()`:

```ts
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';

  /** Gets a `HarnessLoader` whose root element is the popup's content element. */
  async getHarnessLoaderForContent(): Promise<HarnessLoader> {
    const rootLocator = this.documentRootLocatorFactory();
    return rootLocator.harnessLoaderFor('my-popup-content');
  }
}
```

#### Waiting for asynchronous tasks

The methods on `TestElement` automatically trigger Angular's change detection and wait for tasks
inside the `NgZone`, so in most cases no special effort is required for harness authors to wait on
asynchronous tasks. However, there are some edge cases where this may not be sufficient.

Under some circumstances, Angular animations may require a second cycle of change detection and
subsequent `NgZone` stabilization before animation events are fully flushed. In cases where this is
needed, the `ComponentHarness` offers a `forceStabilize()` method that can be called to do the
second round.

Additionally some components may intentionally schedule tasks _outside_ of `NgZone`, this is
typically accomplished by using `NgZone.runOutsideAngular`. In this case the corresponding harness
may need to explicitly wait for tasks outside `NgZone`, as this does not happen automatically.
`ComponentHarness` offers a method called `waitForTasksOutsideAngular` for this purpose.

| Method | Description |
| ------ | ----------- |
| `forceStabilize(): Promise<void>` | Explicitly runs a round of change detection in Angular and waits for `NgZone` to stabilize. |
| `waitForTasksOutsideAngular(): Promise<void>` | Waits for tasks scheduled outside of `NgZone` to complete. |

### API for harness environment authors

TODO(mmalerba): Fill in docs for harness environment authors
