# Adding harness support for additional testing environments

## Before you start

TIP: This guide assumes you've already read the [component harnesses overview guide](guide/testing/component-harnesses-overview). Read that first if you're new to using component harnesses.

### When does adding support for a test environment make sense?

To use component harnesses in the following environments, you can use Angular CDK's two built-in environments:

- Unit tests
- WebDriver end-to-end tests

To use a supported testing environment, read the [Creating harnesses for your components guide](guide/testing/creating-component-harnesses).

Otherwise, to add support for other environments, you need to define how to interact with a DOM element and how DOM interactions work in your environment. Continue reading to learn more.

### CDK Installation

The [Component Dev Kit (CDK)](https://material.angular.dev/cdk/categories) is a set of behavior primitives for building components. To use the component harnesses, first install `@angular/cdk` from npm. You can do this from your terminal using the Angular CLI:

<docs-code language="shell">
  ng add @angular/cdk
</docs-code>

## Creating a `TestElement` implementation

Every test environment must define a `TestElement` implementation. The `TestElement` interface serves as an environment-agnostic representation of a DOM element. It enables harnesses to interact with DOM elements regardless of the underlying environment. Because some environments don't support interacting with DOM elements synchronously (e.g. WebDriver), all `TestElement` methods are asynchronous, returning a `Promise` with the result of the operation.

`TestElement` offers a number of methods to interact with the underlying DOM such as `blur()`, `click()`, `getAttribute()`, and more. See the [TestElement API reference page](/api/cdk/testing/TestElement) for the full list of methods.

The `TestElement` interface consists largely of methods that resemble methods available on `HTMLElement`. Similar methods exist in most test environments, which makes implementing the methods fairly straightforward. However, one important difference to note when implementing the `sendKeys` method, is that the key codes in the `TestKey` enum likely differ from the key codes used in the test environment. Environment authors should maintain a mapping from `TestKey` codes to the codes used in the particular testing environment.

The [UnitTestElement](/api/cdk/testing/testbed/UnitTestElement) and [SeleniumWebDriverElement](/api/cdk/testing/selenium-webdriver/SeleniumWebDriverElement) implementations in Angular CDK serve as good examples of implementations of this interface.

## Creating a `HarnessEnvironment` implementation

Test authors use `HarnessEnvironment` to create component harness instances for use in tests. `HarnessEnvironment` is an abstract class that must be extended to create a concrete subclass for the new environment. When supporting a new test environment, create a `HarnessEnvironment` subclass that adds concrete implementations for all abstract members.

`HarnessEnvironment` has a generic type parameter: `HarnessEnvironment<E>`. This parameter, `E`, represents the raw element type of the environment. For example, this parameter is Element for unit test environments.

The following are the abstract methods that must be implemented:

| Method                                                       | Description                                                                                                                                                          |
| :----------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `abstract getDocumentRoot(): E`                              | Gets the root element for the environment (e.g. `document.body`).                                                                                                    |
| `abstract createTestElement(element: E): TestElement`        | Creates a `TestElement` for the given raw element.                                                                                                                   |
| `abstract createEnvironment(element: E): HarnessEnvironment` | Creates a `HarnessEnvironment` rooted at the given raw element.                                                                                                      |
| `abstract getAllRawElements(selector: string): Promise<E[]>` | Gets all of the raw elements under the root element of the environment matching the given selector.                                                                  |
| `abstract forceStabilize(): Promise<void>`                   | Gets a `Promise` that resolves when the `NgZone` is stable. Additionally, if applicable, tells `NgZone` to stabilize (e.g. calling `flush()` in a `fakeAsync` test). |
| `abstract waitForTasksOutsideAngular(): Promise<void>`       | Gets a `Promise` that resolves when the parent zone of `NgZone` is stable.                                                                                           |

In addition to implementing the missing methods, this class should provide a way for test authors to get `ComponentHarness` instances. You should define a protected constructor and provide a static method called `loader` that returns a `HarnessLoader` instance. This allows test authors to write code like: `SomeHarnessEnvironment.loader().getHarness(...)`. Depending on the needs of the particular environment, the class may provide several different static methods or require arguments to be passed. (e.g. the `loader` method on `TestbedHarnessEnvironment` takes a `ComponentFixture`, and the class provides additional static methods called `documentRootLoader` and `harnessForFixture`).

The [`TestbedHarnessEnvironment`](/api/cdk/testing/testbed/TestbedHarnessEnvironment) and [SeleniumWebDriverHarnessEnvironment](/api/cdk/testing/selenium-webdriver/SeleniumWebDriverHarnessEnvironment) implementations in Angular CDK serve as good examples of implementations of this interface.

## Handling auto change detection

In order to support the `manualChangeDetection` and parallel APIs, your environment should install a handler for the auto change detection status.

When your environment wants to start handling the auto change detection status it can call `handleAutoChangeDetectionStatus(handler)`. The handler function will receive a `AutoChangeDetectionStatus` which has two properties `isDisabled` and `onDetectChangesNow()`. See the [AutoChangeDetectionStatus API reference page](/api/cdk/testing/AutoChangeDetectionStatus) for more information.
If your environment wants to stop handling auto change detection status it can call `stopHandlingAutoChangeDetectionStatus()`.
