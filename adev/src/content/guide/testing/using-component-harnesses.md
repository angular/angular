# Using component harnesses in tests

## Before you start

TIP: This guide assumes you've already read the [component harnesses overview guide](guide/testing/component-harnesses-overview). Read that first if you're new to using component harnesses.

### CDK Installation

The [Component Dev Kit (CDK)](https://material.angular.dev/cdk/categories) is a set of behavior primitives for building components. To use the component harnesses, first install `@angular/cdk` from npm. You can do this from your terminal using the Angular CLI:

<docs-code language="shell">
  ng add @angular/cdk
</docs-code>

## Test harness environments and loaders

You can use component test harnesses in different test environments. Angular CDK supports two built-in environments:

- Unit tests with Angular's `TestBed`
- End-to-end tests with [WebDriver](https://developer.mozilla.org/en-US/docs/Web/WebDriver)

Each environment provides a <strong>harness loader</strong>. The loader creates the harness instances you use throughout your tests. See below for more specific guidance on supported testing environments.

Additional testing environments require custom bindings. See the [adding harness support for additional testing environments guide](guide/testing/component-harnesses-testing-environments) for more information.

### Using the loader from `TestbedHarnessEnvironment` for unit tests

For unit tests you can create a harness loader from [TestbedHarnessEnvironment](/api/cdk/testing/TestbedHarnessEnvironment). This environment uses a [component fixture](api/core/testing/ComponentFixture) created by Angular's `TestBed`.

To create a harness loader rooted at the fixture's root element, use the `loader()` method:

<docs-code language="typescript">
const fixture = TestBed.createComponent(MyComponent);

// Create a harness loader from the fixture
const loader = TestbedHarnessEnvironment.loader(fixture);
...

// Use the loader to get harness instances
const myComponentHarness = await loader.getHarness(MyComponent);
</docs-code>

To create a harness loader for harnesses for elements that fall outside the fixture, use the `documentRootLoader()` method. For example, code that displays a floating element or pop-up often attaches DOM elements directly to the document body, such as the `Overlay` service in Angular CDK.

You can also create a harness loader directly with `harnessForFixture()` for a harness at that fixture's root element directly.

### Using the loader from `SeleniumWebDriverHarnessEnvironment` for end-to-end tests

For WebDriver-based end-to-end tests you can create a harness loader with `SeleniumWebDriverHarnessEnvironment`.

Use the `loader()` method to get the harness loader instance for the current HTML document, rooted at the document's root element. This environment uses a WebDriver client.

<docs-code language="typescript">
let wd: webdriver.WebDriver = getMyWebDriverClient();
const loader = SeleniumWebDriverHarnessEnvironment.loader(wd);
...
const myComponentHarness = await loader.getHarness(MyComponent);
</docs-code>

## Using a harness loader

Harness loader instances correspond to a specific DOM element and are used to create component harness instances for elements under that specific element.

To get `ComponentHarness` for the first instance of the element, use the `getHarness()` method. To get all `ComponentHarness` instances, use the `getAllHarnesses()` method.

<docs-code language="typescript">
// Get harness for first instance of the element
const myComponentHarness = await loader.getHarness(MyComponent);

// Get harnesses for all instances of the element
const myComponentHarnesses = await loader.getHarnesses(MyComponent);
</docs-code>

In addition to `getHarness` and `getAllHarnesses`, `HarnessLoader` has several other useful methods for querying for harnesses:

- `getHarnessAtIndex(...)`: Gets the harness for a component that matches the given criteria at a specific index.
- `countHarnesses(...)`: Counts the number of component instances that match the given criteria.
- `hasHarness(...)`: Checks if at least one component instance matches the given criteria.

As an example, consider a reusable dialog-button component that opens a dialog on click. It contains the following components, each with a corresponding harness:

- `MyDialogButton` (composes the `MyButton` and `MyDialog` with a convenient API)
- `MyButton` (a standard button component)
- `MyDialog` (a dialog appended to `document.body` by `MyDialogButton` upon click)

The following test loads harnesses for each of these components:

<docs-code language="typescript">
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
</docs-code>

### Harness behavior in different environments

Harnesses may not behave exactly the same in all environments. Some differences are unavoidable between the real user interaction versus the simulated events generated in unit tests. Angular CDK makes a best effort to normalize the behavior to the extent possible.

### Interacting with child elements

To interact with elements below the root element of this harness loader, use the `HarnessLoader` instance of a child element. For the first instance of the child element, use the `getChildLoader()` method. For all instances of the child element, use the `getAllChildLoaders()` method.

<docs-code language="typescript">
const myComponentHarness = await loader.getHarness(MyComponent);

// Get loader for first instance of child element with '.child' selector
const childLoader = await myComponentHarness.getLoader('.child');

// Get loaders for all instances of child elements with '.child' selector
const allChildLoaders = await myComponentHarness.getAllChildLoaders('.child');
</docs-code>

### Filtering harnesses

When a page contains multiple instances of a particular component, you may want to filter based on some property of the component to get a particular component instance. You can use a <strong>harness predicate</strong>, a class used to associate a `ComponentHarness` class with predicates functions that can be used to filter component instances, to do so.

When you ask a `HarnessLoader` for a harness, you're actually providing a HarnessQuery. A query can be one of two things:

- A harness constructor. This just gets that harness
- A `HarnessPredicate`, which gets harnesses that are filtered based on one or more conditions

`HarnessPredicate` does support some base filters (selector, ancestor) that work on anything that extends `ComponentHarness`.

<docs-code language="typescript">
// Example of loading a MyButtonComponentHarness with a harness predicate
const disabledButtonPredicate = new HarnessPredicate(MyButtonComponentHarness, {selector: '[disabled]'});
const disabledButton = await loader.getHarness(disabledButtonPredicate);
</docs-code>

However it's common for harnesses to implement a static `with()` method that accepts component-specific filtering options and returns a `HarnessPredicate`.

<docs-code language="typescript">
// Example of loading a MyButtonComponentHarness with a specific selector
const button = await loader.getHarness(MyButtonComponentHarness.with({selector: 'btn'}))
</docs-code>

For more details refer to the specific harness documentation since additional filtering options are specific to each harness implementation.

## Using test harness APIs

While every harness defines an API specific to its corresponding component, they all share a common base class, [ComponentHarness](/api/cdk/testing/ComponentHarness). This base class defines a static property, `hostSelector`, that matches the harness class to instances of the component in the DOM.

Beyond that, the API of any given harness is specific to its corresponding component; refer to the component's documentation to learn how to use a specific harness.

As an example, the following is a test for a component that uses the [Angular Material slider component harness](https://material.angular.dev/components/slider/api#MatSliderHarness):

<docs-code language="typescript">
it('should get value of slider thumb', async () => {
  const slider = await loader.getHarness(MatSliderHarness);
  const thumb = await slider.getEndThumb();
  expect(await thumb.getValue()).toBe(50);
});
</docs-code>

## Interop with Angular change detection

By default, test harnesses runs Angular's [change detection](https://angular.dev/best-practices/runtime-performance) before reading the state of a DOM element and after interacting with a DOM element.

There may be times that you need finer-grained control over change detection in your tests. such as checking the state of a component while an async operation is pending. In these cases use the `manualChangeDetection` function to disable automatic handling of change detection for a block of code.

<docs-code language="typescript">
it('checks state while async action is in progress', async () => {
  const buttonHarness = loader.getHarness(MyButtonHarness);
  await manualChangeDetection(async () => {
    await buttonHarness.click();
    fixture.detectChanges();
    // Check expectations while async click operation is in progress.
    expect(isProgressSpinnerVisible()).toBe(true);
    await fixture.whenStable();
    // Check expectations after async click operation complete.
    expect(isProgressSpinnerVisible()).toBe(false);
  });
});
</docs-code>

Almost all harness methods are asynchronous and return a `Promise` to support the following:

- Support for unit tests
- Support for end-to-end tests
- Insulate tests against changes in asynchronous behavior

The Angular team recommends using [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) to improve the test readability. Calling `await` blocks the execution of your test until the associated `Promise` resolves.

Occasionally, you may want to perform multiple actions simultaneously and wait until they're all done rather than performing each action sequentially. For example, read multiple properties of a single component. In these situations use the `parallel` function to parallelize the operations. The parallel function works similarly to `Promise.all`, while also optimizing change detection checks.

<docs-code language="typescript">
it('reads properties in parallel', async () => {
  const checkboxHarness = loader.getHarness(MyCheckboxHarness);
  // Read the checked and intermediate properties simultaneously.
  const [checked, indeterminate] = await parallel(() => [
    checkboxHarness.isChecked(),
    checkboxHarness.isIndeterminate()
  ]);
  expect(checked).toBe(false);
  expect(indeterminate).toBe(true);
});
</docs-code>
