# Creating harnesses for your components

## Before you start

TIP: This guide assumes you've already read the [component harnesses overview guide](guide/testing/component-harnesses-overview). Read that first if you're new to using component harnesses.

### When does creating a test harness make sense?

The Angular team recommends creating component test harnesses for shared components that are used in many places and have some user interactivity. This most commonly applies to widget libraries and similar reusable components. Harnesses are valuable for these cases because they provide the consumers of these shared components a well- supported API for interacting with a component. Tests that use harnesses can avoid depending on unreliable implementation details of these shared components, such as DOM structure and specific event listeners.

For components that appear in only one place, such as a page in an application, harnesses don't provide as much benefit. In these situations, a component's tests can reasonably depend on the implementation details of this component, as the tests and components are updated at the same time. However, harnesses still provide some value if you would use the harness in both unit and end-to-end tests.

### CDK Installation

The [Component Dev Kit (CDK)](https://material.angular.dev/cdk/categories) is a set of behavior primitives for building components. To use the component harnesses, first install `@angular/cdk` from npm. You can do this from your terminal using the Angular CLI:

<docs-code language="shell">
  ng add @angular/cdk
</docs-code>

## Extending `ComponentHarness`

The abstract `ComponentHarness` class is the base class for all component harnesses. To create a custom component harness, extend `ComponentHarness` and implement the static property `hostSelector`.

The `hostSelector` property identifies elements in the DOM that match this harness subclass. In most cases, the `hostSelector` should be the same as the selector of the corresponding `Component` or `Directive`. For example, consider a simple popup component:

<docs-code language="typescript">
@Component({
  selector: 'my-popup',
  template: `
    <button (click)="toggle()">{{triggerText()}}</button>
    @if (isOpen()) {
      <div class="my-popup-content"><ng-content></ng-content></div>
    }
  `
})
class MyPopup {
  triggerText = input('');

isOpen = signal(false);

toggle() {
this.isOpen.update((value) => !value);
}
}
</docs-code>

In this case, a minimal harness for the component would look like the following:

<docs-code language="typescript">
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';
}
</docs-code>

While `ComponentHarness` subclasses require only the `hostSelector` property, most harnesses should also implement a static `with` method to generate `HarnessPredicate` instances. The [filtering harnesses section](guide/testing/using-component-harnesses#filtering-harnesses) covers this in more detail.

## Finding elements in the component's DOM

Each instance of a `ComponentHarness` subclass represents a particular instance of the corresponding component. You can access the component's host element via the `host() `method from the `ComponentHarness` base class.

`ComponentHarness` also offers several methods for locating elements within the component's DOM. These methods are `locatorFor()`, `locatorForOptional()`, and `locatorForAll()`. These methods create functions that find elements, they do not directly find elements. This approach safeguards against caching references to out-of-date elements. For example, when an `@if` block hides and then shows an element, the result is a new DOM element; using functions ensures that tests always reference the current state of the DOM.

See the [ComponentHarness API reference page](/api/cdk/testing/ComponentHarness) for the full list details of the different `locatorFor` methods.

For example, the `MyPopupHarness` example discussed above could provide methods to get the trigger and content elements as follows:

<docs-code language="typescript">
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';

/\*_ Gets the trigger element _/
getTriggerElement = this.locatorFor('button');

/\*_ Gets the content element. _/
getContentElement = this.locatorForOptional('.my-popup-content');
}
</docs-code>

## Working with `TestElement` instances

`TestElement` is an abstraction designed to work across different test environments (Unit tests, WebDriver, etc). When using harnesses, you should perform all DOM interaction via this interface. Other means of accessing DOM elements, such as `document.querySelector()`, do not work in all test environments.

`TestElement` has a number of methods to interact with the underlying DOM, such as `blur()`, `click()`, `getAttribute()`, and more. See the [TestElement API reference page](/api/cdk/testing/TestElement) for the full list of methods.

Do not expose `TestElement` instances to harness users unless it's an element the component consumer defines directly, such as the component's host element. Exposing `TestElement` instances for internal elements leads users to depend on a component's internal DOM structure.

Instead, provide more narrow-focused methods for specific actions the end-user may take or particular state they may observe. For example, `MyPopupHarness` from previous sections could provide methods like `toggle` and `isOpen`:

<docs-code language="typescript">
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';

protected getTriggerElement = this.locatorFor('button');
protected getContentElement = this.locatorForOptional('.my-popup-content');

/\*_ Toggles the open state of the popup. _/
async toggle() {
const trigger = await this.getTriggerElement();
return trigger.click();
}

/\*_ Checks if the popup us open. _/
async isOpen() {
const content = await this.getContentElement();
return !!content;
}
}
</docs-code>

## Loading harnesses for subcomponents

Larger components often compose sub-components. You can reflect this structure in a component's harness as well. Each of the `locatorFor` methods on `ComponentHarness` has an alternate signature that can be used for locating sub-harnesses rather than elements.

See the [ComponentHarness API reference page](/api/cdk/testing/ComponentHarness) for the full list of the different locatorFor methods.

For example, consider a menu build using the popup from above:

<docs-code language="typescript">
@Directive({
  selector: 'my-menu-item'
})
class MyMenuItem {}

@Component({
selector: 'my-menu',
template: `     <my-popup>
      <ng-content></ng-content>
    </my-popup>
  `
})
class MyMenu {
triggerText = input('');

@ContentChildren(MyMenuItem) items: QueryList<MyMenuItem>;
}
</docs-code>

The harness for `MyMenu` can then take advantage of other harnesses for `MyPopup` and `MyMenuItem`:

<docs-code language="typescript">
class MyMenuHarness extends ComponentHarness {
  static hostSelector = 'my-menu';

protected getPopupHarness = this.locatorFor(MyPopupHarness);

/\*_ Gets the currently shown menu items (empty list if menu is closed). _/
getItems = this.locatorForAll(MyMenuItemHarness);

/\*_ Toggles open state of the menu. _/
async toggle() {
const popupHarness = await this.getPopupHarness();
return popupHarness.toggle();
}
}

class MyMenuItemHarness extends ComponentHarness {
static hostSelector = 'my-menu-item';
}
</docs-code>

## Filtering harness instances with `HarnessPredicate`

When a page contains multiple instances of a particular component, you may want to filter based on some property of the component to get a particular component instance. For example, you may want a button with some specific text, or a menu with a specific ID. The `HarnessPredicate` class can capture criteria like this for a `ComponentHarness` subclass. While the test author is able to construct `HarnessPredicate` instances manually, it's easier when the `ComponentHarness` subclass provides a helper method to construct predicates for common filters.

You should create a static `with()` method on each `ComponentHarness` subclass that returns a `HarnessPredicate` for that class. This allows test authors to write easily understandable code, e.g. `loader.getHarness(MyMenuHarness.with({selector: '#menu1'}))`. In addition to the standard selector and ancestor options, the `with` method should add any other options that make sense for the particular subclass.

Harnesses that need to add additional options should extend the `BaseHarnessFilters` interface and additional optional properties as needed. `HarnessPredicate` provides several convenience methods for adding options: `stringMatches()`, `addOption()`, and `add()`. See the [HarnessPredicate API page](/api/cdk/testing/HarnessPredicate) for the full description.

For example, when working with a menu it is useful to filter based on trigger text and to filter menu items based on their text:

<docs-code language="typescript">
interface MyMenuHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the trigger text for the menu. */
  triggerText?: string | RegExp;
}

interface MyMenuItemHarnessFilters extends BaseHarnessFilters {
/\*_ Filters based on the text of the menu item. _/
text?: string | RegExp;
}

class MyMenuHarness extends ComponentHarness {
static hostSelector = 'my-menu';

/\*_ Creates a `HarnessPredicate` used to locate a particular `MyMenuHarness`. _/
static with(options: MyMenuHarnessFilters): HarnessPredicate<MyMenuHarness> {
return new HarnessPredicate(MyMenuHarness, options)
.addOption('trigger text', options.triggerText,
(harness, text) => HarnessPredicate.stringMatches(harness.getTriggerText(), text));
}

protected getPopupHarness = this.locatorFor(MyPopupHarness);

/\*_ Gets the text of the menu trigger. _/
async getTriggerText(): Promise<string> {
const popupHarness = await this.getPopupHarness();
return popupHarness.getTriggerText();
}
...
}

class MyMenuItemHarness extends ComponentHarness {
static hostSelector = 'my-menu-item';

/\*_ Creates a `HarnessPredicate` used to locate a particular `MyMenuItemHarness`. _/
static with(options: MyMenuItemHarnessFilters): HarnessPredicate<MyMenuItemHarness> {
return new HarnessPredicate(MyMenuItemHarness, options)
.addOption('text', options.text,
(harness, text) => HarnessPredicate.stringMatches(harness.getText(), text));
}

/\*_ Gets the text of the menu item. _/
async getText(): Promise<string> {
const host = await this.host();
return host.text();
}
}
</docs-code>

You can pass a `HarnessPredicate` instead of a `ComponentHarness` class to any of the APIs on `HarnessLoader`, `LocatorFactory`, or `ComponentHarness`. This allows test authors to easily target a particular component instance when creating a harness instance. It also allows the harness author to leverage the same `HarnessPredicate` to enable more powerful APIs on their harness class. For example, consider the `getItems` method on the `MyMenuHarness` shown above. Adding a filtering API allows users of the harness to search for particular menu items:

<docs-code language="typescript">
class MyMenuHarness extends ComponentHarness {
  static hostSelector = 'my-menu';

/\*_ Gets a list of items in the menu, optionally filtered based on the given criteria. _/
async getItems(filters: MyMenuItemHarnessFilters = {}): Promise<MyMenuItemHarness[]> {
const getFilteredItems = this.locatorForAll(MyMenuItemHarness.with(filters));
return getFilteredItems();
}
...
}
</docs-code>

## Creating `HarnessLoader` for elements that use content projection

Some components project additional content into the component's template. See the [content projection guide](guide/components/content-projection) for more information.

Add a `HarnessLoader` instance scoped to the element containing the `<ng-content>` when you create a harness for a component that uses content projection. This allows the user of the harness to load additional harnesses for whatever components were passed in as content. `ComponentHarness` has several methods that can be used to create HarnessLoader instances for cases like this: `harnessLoaderFor()`, `harnessLoaderForOptional()`, `harnessLoaderForAll()`. See the [HarnessLoader interface API reference page](/api/cdk/testing/HarnessLoader) for more details.

For example, the `MyPopupHarness` example from above can extend `ContentContainerComponentHarness` to add support to load harnesses within the `<ng-content>` of the component.

<docs-code language="typescript">
class MyPopupHarness extends ContentContainerComponentHarness<string> {
  static hostSelector = 'my-popup';
}
</docs-code>

## Accessing elements outside of the component's host element

There are times when a component harness might need to access elements outside of its corresponding component's host element. For example, code that displays a floating element or pop-up often attaches DOM elements directly to the document body, such as the `Overlay` service in Angular CDK.

In this case, `ComponentHarness` provides a method that can be used to get a `LocatorFactory` for the root element of the document. The `LocatorFactory` supports most of the same APIs as the `ComponentHarness` base class, and can then be used to query relative to the document's root element.

Consider if the `MyPopup` component above used the CDK overlay for the popup content, rather than an element in its own template. In this case, `MyPopupHarness` would have to access the content element via `documentRootLocatorFactory()` method that gets a locator factory rooted at the document root.

<docs-code language="typescript">
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';

/\*_ Gets a `HarnessLoader` whose root element is the popup's content element. _/
async getHarnessLoaderForContent(): Promise<HarnessLoader> {
const rootLocator = this.documentRootLocatorFactory();
return rootLocator.harnessLoaderFor('my-popup-content');
}
}
</docs-code>

## Waiting for asynchronous tasks

The methods on `TestElement` automatically trigger Angular's change detection and wait for tasks inside the `NgZone`. In most cases no special effort is required for harness authors to wait on asynchronous tasks. However, there are some edge cases where this may not be sufficient.

Under some circumstances, Angular animations may require a second cycle of change detection and subsequent `NgZone` stabilization before animation events are fully flushed. In cases where this is needed, the `ComponentHarness` offers a `forceStabilize()` method that can be called to do the second round.

You can use `NgZone.runOutsideAngular()` to schedule tasks outside of NgZone. Call the `waitForTasksOutsideAngular()` method on the corresponding harness if you need to explicitly wait for tasks outside `NgZone` since this does not happen automatically.
