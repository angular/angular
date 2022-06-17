# Use a custom element

An Angular element self-bootstraps.
An Angular element automatically starts when added to the DOM, and is automatically destroyed when removed from the DOM.
After you add a Angular element to the rendered DOM structure

*   The Angular element behaves like any other HTML element
*   The Angular element requires no special knowledge of Angular terms or usage conventions

| Advantages                                     | Details |
|:---                                            |:---     |
| Easy dynamic content in an Angular application | Transform a component to a custom element to provide a straightforward path to create dynamic HTML content in your Angular application. HTML content that you directly add to the DOM in an Angular application is normally displayed without Angular processing. If you define a dynamic component, add your code to connect the HTML element tag to your application data, and interact with change detection. With an Angular element, all the connections are automatically managed.                                                                                                                                                                                               |
| Content-rich applications                      | If you have a content-rich application, such as the Angular application that presents this documentation, an Angular element allows you give your content providers sophisticated Angular capabilities without requiring knowledge of Angular. For example, a documentation topic is directly added to the DOM by the Angular framework. The topic may include special element tags such as the `code-snippet` element tag to perform complex tasks. You tell your content provider the syntax of your custom element. Your content provider does not need to know anything about Angular. Nor does you content provider need to know anything about the data structures or the implementation of your component. |

## How an Angular element works

Use the [`createCustomElement`][AioApiElementsCreatecustomelement] function to convert a component into a class that can be registered with the browser as a custom element.
The new custom element is available after you register your configured class with the custom-element registry of the browser.
Use the new custom element like a built-in HTML element in content that you add directly into the DOM.

<code-example format="html" language="html">

&lt;my-popup message="Use Angular!"&gt;&lt;/my-popup&gt;

</code-example>

When your custom element is placed on a page, the browser creates an instance of the registered class and adds it to the DOM.
The content is provided by the template of the component, which uses Angular template syntax, and is rendered using the component and DOM data.
Input properties in the component correspond to input attributes for the element.
