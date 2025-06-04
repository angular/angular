# Component harnesses overview

A <strong>component harness</strong> is a class that allows tests to interact with components the way an end user does via a supported API. You can create test harnesses for any component, ranging from small reusable widgets to full pages.

Harnesses offer several benefits:

- They make tests less brittle by insulating themselves against implementation details of a component, such as its DOM structure
- They make tests become more readable and easier to maintain
- They can be used across multiple testing environments

<docs-code language="typescript">
// Example of test with a harness for a component called MyButtonComponent
it('should load button with exact text', async () => {
  const button = await loader.getHarness(MyButtonComponentHarness);
  expect(await button.getText()).toBe('Confirm');
});
</docs-code>

Component harnesses are especially useful for shared UI widgets. Developers often write tests that depend on private implementation details of widgets, such as DOM structure and CSS classes. Those dependencies make tests brittle and hard to maintain. Harnesses offer an alternative— a supported API that interacts with the widget the same way an end-user does. Widget implementation changes now become less likely to break user tests. For example, [Angular Material](https://material.angular.dev/components/categories) provides a test harness for each component in the library.

Component harnesses support multiple testing environments. You can use the same harness implementation in both unit and end-to-end tests. Test authors only need to learn one API and component authors don't have to maintain separate unit and end-to-end test implementations.

Many developers can be categorized by one of the following developer type categories: test authors, component harness authors, and harness environment authors. Use the table below to find the most relevant section in this guide based on these categories:

| Developer Type              | Description                                                                                                                                                                                                                                                                                            | Relevant Section                                                                                             |
| :-------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| Test Authors                | Developers that use component harnesses written by someone else to test their application. For example, this could be an app developer who uses a third-party menu component and needs to interact with the menu in a unit test.                                                                       | [Using component harnesses in tests](guide/testing/using-component-harnesses)                                |
| Component harness authors   | Developers who maintain some reusable Angular components and want to create a test harness for its users to use in their tests. For example, an author of a third party Angular component library or a developer who maintains a set of common components for a large Angular application.             | [Creating component harnesses for your components](guide/testing/creating-component-harnesses)               |
| Harness environment authors | Developers who want to add support for using component harnesses in additional testing environments. For information on supported testing environments out-of-the-box, see the [test harness environments and loaders](guide/testing/using-component-harnesses#test-harness-environments-and-loaders). | [Adding support for additional testing environments](guide/testing/component-harnesses-testing-environments) |

For the full API reference, please see the [Angular CDK's component harness API reference page](/api#angular_cdk_testing).
