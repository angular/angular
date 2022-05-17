# Web component

An Angular component packaged as a *custom element* is an *Angular element*.
A *custom element* is also refernced as a [Web Component][MdnDocsWebWebComponents].

<div class="alert is-helpful">

To view or download the example code used in the following sections, see [Example Angular component applications][AioGuideComponentExample].

</div>

[Custom elements][MdnDocsWebWebComponentsUsingCustomElements] are a Web Platform feature currently supported by Chrome, Edge \(Chromium-based\), Firefox, Opera, and Safari, and available in other browsers through polyfills.
To learn more, see [Browser Support][AioGuideComponentWebBrowserSupportForCustomElements].
A custom element extends HTML by allowing you to define a tag whose content is created and controlled by JavaScript code.
The browser maintains a `CustomElementRegistry` interface of the defined custom elements, which maps an instantiable JavaScript class to an HTML element.

The `@angular/elements` package exports a `createCustomElement()` API that provides a bridge from the component interface of Angular and change detection functionality to the built-in DOM API.

Transforming a component to a custom element makes all of the required Angular infrastructure available to the browser.
Creating a custom element is simple and straightforward, and automatically connects your component-defined view with change detection and data binding, mapping Angular functionality to the corresponding built-in HTML equivalents.

<div class="alert is-helpful">

We are working on custom elements that can be used by web apps built on other frameworks.
A minimal, self-contained version of the Angular framework is injected as a service to support the change-detection and data-binding functionality of the component.
To learn more about the direction of development, see the [Elements in v6 and Beyond][YoutubeWatchVZ1glfplvjjyT4s] video presentation.

</div>

## Using custom elements

Custom elements bootstrap themselves.
They start automatically when they are added to the DOM, and are automatically destroyed when removed from the DOM.
Once a custom element is added to the DOM for any page, it looks and behaves like any other HTML element, and does not require any special knowledge of Angular terms or usage conventions.

|     | Details |
|:--- |:---     |
| **Easy dynamic content in an Angular application** | Transforming a component to a custom element provides a straightforward path to creating dynamic HTML content in your Angular application. HTML content that you add directly to the DOM in an Angular application is normally displayed without Angular processing, unless you define a *dynamic component*, adding your own code to connect the HTML tag to your application data, and participate in change detection. With a custom element, all of that wiring is taken care of automatically.                                                                                                                                              |
| **Content-rich applications**                      | If you have a content-rich application, such as the Angular app that presents this documentation, custom elements let you give your content providers sophisticated Angular functionality without requiring knowledge of Angular. For example, an Angular guide like this one is added directly to the DOM by the Angular navigation tools, but can include special elements like `<code-snippet>` that perform complex operations. All you need to tell your content provider is the syntax of your custom element. They do not need to know anything about Angular, or anything about the data structures or implementation of your component. |

### How it works

Use the `createCustomElement()` function to convert a component into a class that can be registered with the browser as a custom element.
After you register your configured class with the custom-element registry of the browser, use the new element just like a built-in HTML element in content that you add directly into the DOM.

<code-example format="html" language="html">

&lt;my-popup message="Use Angular!"&gt;&lt;/my-popup&gt;

</code-example>

When your custom element is placed on a page, the browser creates an instance of the registered class and adds it to the DOM.
The content is provided by the template of the component, which uses Angular template syntax, and is rendered using the component and DOM data.
Input properties in the component correspond to input attributes for the element.

<div class="lightbox">

<img alt="Custom element in browser" class="left" src="generated/images/guide/elements/customElement1.png" />

</div>

## Transforming components to custom elements

Angular provides the `createCustomElement()` function for converting an Angular component, together with the associated dependencies, to a custom element.
The function collects the observable properties of the component, along with the Angular functionality the browser needs to create and destroy instances, and to detect and respond to changes.

The conversion process implements the `NgElementConstructor` interface, and creates a constructor class that is configured to produce a self-bootstrapping instance of your component.

Use the built-in [`customElements.define()`][MdnDocsWebApiCustomelementregistryDefine] function to register the configured constructor and the associated custom-element tag with the [`CustomElementRegistry`][MdnDocsWebApiCustomelementregistry] interface of the browser.
When the browser encounters the tag for the registered element, it uses the constructor to create a custom-element instance.

<div class="lightbox">

<img alt="Transform a component to a custom element" class="left" src="generated/images/guide/elements/createElement.png" />

</div>

<div class="alert is-important">

Avoid using the [`@Component`][AioApiCoreComponent] [selector][AioApiCoreDirectiveSelector] as the custom-element tag name.
This can lead to unexpected behavior, due to Angular creating the following two component instances for a single DOM element.

*    One regular Angular component
*    A second one using the custom element

</div>

### Mapping

A custom element hosts an Angular component, providing a bridge between the data and logic defined in the component and standard DOM APIs.
Component properties and logic maps directly into attributes of the HTML elements and the event system of the browser.

*   The creation API parses the component looking for input properties, and defines corresponding attributes for the custom element.
    It transforms the property names to make them compatible with custom elements, which do not recognize case distinctions.
    The resulting attribute names use dash-separated lowercase.
    For example, for a component with `@Input('myInputProp') inputProp`, the corresponding custom element defines aa `my-input-prop` attribute.

*   Component outputs are dispatched as HTML [Custom Events][MdnDocsWebApiCustomevent], with the name of the custom event matching the output name.
    For example, for a component with `@Output() valueChanged = new EventEmitter()`, the corresponding custom element dispatches events with the `valueChanged` name, and the emitted data is stored on the `detail` property of the event.
    If you provide an alias, that value is used; for example, `@Output('myClick') clicks = new EventEmitter<string>();` results in dispatch events with the `myClick` name.

To learn more, see [Creating custom events][MdnDocsWebGuideEventsCreatingAndTriggeringEventsCreatingCustomEvents] on MDN.

## Browser support for custom elements

The recently-developed [custom elements][MdnDocsWebWebComponentsUsingCustomElements] Web Platform feature is currently supported natively in a number of browsers.

| Browser                 | Custom Element Support |
|:---                     |:---                    |
| Chrome                  | Supported natively     |
| Edge \(Chromium-based\) | Supported natively     |
| Firefox                 | Supported natively     |
| Opera                   | Supported natively     |
| Safari                  | Supported natively     |

Use the [Angular CLI][AioCli] to add the `@angular/elements` package to your workspace.

<code-example format="shell" language="shell">

npm install &commat;angular/elements --save

</code-example>

## Example: A Popup Service

Previously, when you wanted to add a component to an application at runtime, you had to define a *dynamic component*, and then you would have to load it, attach it to an element in the DOM, and wire up all of the dependencies, change detection, and event handling, as described in [Dynamic Component Loader][AioGuideComponentDynamicLoad].

Using an Angular custom element makes the process much simpler and more transparent, by providing all of the infrastructure and framework automatically.
You have to define the kind of event handling you want to use an Angular custom element.

<div class="alert is-helpful">

**NOTE**:<br />
If you are not going to use it in your application, you still have to exclude the component from compilation.

</div>

The following Popup Service example application defines a component that you can either load dynamically or convert to a custom element.

| TypeScript file     | Details |
|:---                 |:---     |
| `popup.component.ts`| Defines a simple pop-up element that displays an input message, with some animation and styling.                                                                                                                                       |
| `popup.service.ts`  | Creates an injectable service that provides two different ways to invoke the `PopupComponent`; as a dynamic component, or as a custom element. Notice how much more configuration is required for the dynamic-loading method.          |
| `app.module.ts`     | Adds the `PopupComponent` in the `declarations` list of the module.                                                                                                                                                                    |
| `app.component.ts`  | Defines the root component of the application, which uses the `PopupService` to add the pop-up to the DOM at run time. When the application runs, the constructor of the root component converts `PopupComponent` to a custom element. |

For comparison, the demo shows both methods.
One button adds the popup using the dynamic-loading method, and the other uses the custom element.
The result is the same; only the preparation is different.

<code-tabs>
  <code-pane header="popup.component.ts" path="elements/src/app/popup.component.ts"></code-pane>
  <code-pane header="popup.service.ts" path="elements/src/app/popup.service.ts"></code-pane>
  <code-pane header="app.module.ts" path="elements/src/app/app.module.ts"></code-pane>
  <code-pane header="app.component.ts" path="elements/src/app/app.component.ts"></code-pane>
</code-tabs>

## Typings for custom elements

Generic DOM APIs, such as `document.createElement()` or `document.querySelector()`, return an element type that is appropriate for the specified arguments.
For example, run the `document.createElement('a')` API to returns an `HTMLAnchorElement`, which TypeScript knows has an `href` property.
Similarly, the `document.createElement('div')` API returns an `HTMLDivElement`, which TypeScript knows has no `href` property.

When run with unknown elements, such as a custom element name \(`popup-element` custom element in the code example\), the methods return a generic type, such as `HTMLElement`, because TypeScript cannot infer the correct type of the returned element.

Custom elements created with Angular extend `NgElement` \(which in turn extends `HTMLElement`\).
Additionally, these custom elements will have a property for each input of the corresponding component.
For example, the `popup-element` cutom element has a `message` property of type `string`.

There are a few options if you want to get correct types for your custom elements.
Assume you create a `my-dialog` custom element based on the following component.

<code-example format="typescript" language="typescript">

&commat;Component(...)
class MyDialog {
  &commat;Input() content: string;
}

</code-example>

The most straightforward way to get accurate typings is to cast the return value of the relevant DOM methods to the correct type.
For that, use the `NgElement` and `WithProperties` types.
Both are exported from `@angular/elements`.

<code-example format="typescript" language="typescript">

const aDialog = document.createElement('my-dialog') as NgElement &amp; WithProperties&lt;{content: string}&gt;;
aDialog.content = 'Hello, world!';
aDialog.content = 123;  // &lt;-- ERROR: TypeScript knows this should be a string.
aDialog.body = 'News';  // &lt;-- ERROR: TypeScript knows there is no `body` property on `aDialog`.

</code-example>

This is a good way to quickly get TypeScript features, such as type checking and autocomplete support, for your custom element.
But it can get cumbersome if you need it in several places, because you have to cast the return type on every occurrence.

An alternative way, that only requires defining the type of each custom element once, is augmenting the `HTMLElementTagNameMap`, which TypeScript uses to infer the type of a returned element based on the associated tag name \(for DOM methods such as `document.createElement()`, `document.querySelector()`, and so on\).

<code-example format="typescript" language="typescript">

declare global {
  interface HTMLElementTagNameMap {
    'my-dialog': NgElement & WithProperties&lt;{content: string}&gt;;
    'my-other-element': NgElement & WithProperties&lt;{foo: 'bar'}&gt;;
    ...
  }
}

</code-example>

Now, TypeScript infers the correct type the same way it does for built-in elements.

<code-example format="typescript" language="typescript">

document.createElement('div')               //--&gt; HTMLDivElement (built-in element)
document.querySelector('foo')               //--&gt; Element        (unknown element)
document.createElement('my-dialog')         //--&gt; NgElement &amp; WithProperties&lt;{content: string}&gt; (custom element)
document.querySelector('my-other-element')  //--&gt; NgElement &amp; WithProperties&lt;{foo: 'bar'}&gt;      (custom element)

</code-example>

<!-- links -->

[AioApiCoreComponent]: api/core/Component "Component | @angular/core - API | Angular"

[AioApiCoreDirectiveSelector]: api/core/Directive#selector "selector - Directive | @angular/core - API | Angular"

[AioCli]: cli "CLI Overview and Command Reference | Angular"

[AioGuideComponentDynamicLoad]: guide/component/component-dynamic-load "Example: Dynamically load a component | Angular"

[AioGuideComponentExample]: guide/component/component-example "Example Angular component applications | Angular"

[AioGuideComponentWebBrowserSupportForCustomElements]: guide/component/component-web#browser-support-for-custom-elements "Browser support for custom elements - Web component | Angular"

<!-- external links -->

[MdnDocsWebApiCustomelementregistry]: https://developer.mozilla.org/docs/Web/API/CustomElementRegistry "CustomElementRegistry | MDN"
[MdnDocsWebApiCustomelementregistryDefine]: https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define "CustomElementRegistry.define() | MDN"

[MdnDocsWebApiCustomevent]: https://developer.mozilla.org/docs/Web/API/CustomEvent "CustomEvent | MDN"

[MdnDocsWebGuideEventsCreatingAndTriggeringEventsCreatingCustomEvents]: https://developer.mozilla.org/docs/Web/Guide/Events/Creating_and_triggering_events#Creating_custom_events "Creating custom events - Creating and triggering events | MDN"

[MdnDocsWebWebComponents]: https://developer.mozilla.org/docs/Web/Web_Components "Web Components | MDN"
[MdnDocsWebWebComponentsUsingCustomElements]: https://developer.mozilla.org/docs/Web/Web_Components/Using_custom_elements "Using custom elements | MDN"

[YoutubeWatchVZ1glfplvjjyT4s]: https://www.youtube.com/watch?v=Z1gLFPLVJjY&t=4s "Elements in v6 and Beyond - Rob Wormald | YouTube"

<!-- end links -->

@reviewed 2022-04-13
