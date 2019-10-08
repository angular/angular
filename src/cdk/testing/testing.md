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

#### `ComponentHarness`

This is the abstract base class for all component harnesses. Every harness extends
`ComponentHarness`. All `ComponentHarness` subclasses have a static property, `hostSelector`, that
matches the harness class to instances of the component in the DOM. Beyond that, the API of any
given harness is specific to its corresponding component; refer to the component's documentation to
learn how to use a specific harness.

#### `TestbedHarnessEnvironment` and `ProtractorHarnessEnvironment`

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

#### `HarnessLoader`

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
[details of `HarnessPredicate`](#harnesspredicate) are discussed in the
[API for component harness authors](#api-for-component-harness-authors); harness authors should
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

TODO(mmalerba): Fill in docs for harness authors

#### `HarnessPredicate`

TODO(mmalerba): Fill in docs for `HarnessPredicate`

### API for harness environment authors

TODO(mmalerba): Fill in docs for harness environment authors
