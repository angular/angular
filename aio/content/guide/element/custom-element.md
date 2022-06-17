# Understand custom element

An *Angular element* is an Angular component packaged as a [custom element][MdnDocsWebWebComponentsUsingCustomElements].
A *custom element* is also called a [Web Component][MdnDocsWebWebComponents].
A web component is a custom element that also defines a [Shadow Root][MdnDocsWebApiShadowroot] interface.
[Web Components][MdnDocsWebWebComponents] are a web standard that allows you to define a new HTML element in a framework-agnostic way.

<div class="alert is-helpful">

**NOTE**: <br />
To view or download the example code used in the following sections, see <live-example name="elements"></live-example>.

</div>

The [custom elements][MdnDocsWebWebComponentsUsingCustomElements] API is a Web Platform feature.
The following browsers currently support [custom elements][MdnDocsWebWebComponentsUsingCustomElements].

<!-- vale off -->

*   Chrome
*   Edge \(Chromium-based\)
*   Firefox
*   Opera
*   Safari
*   other browsers through polyfills

<!-- vale on -->

To learn more, see [Browser support for Angular element][AioGuideElementCustomElementBrowserSupportForAngularElement].

Use a custom element to define an element tag whose in which the content is created and controlled using JavaScript code.
The browser maintains a [`CustomElementRegistry`][MdnDocsWebApiCustomelementregistry] interface of the defined custom elements.
The [`CustomElementRegistry`][MdnDocsWebApiCustomelementregistry] interface maps a JavaScript class to an HTML element.
The targeted JavaScript class must be able to be instantiated.

After you import the `@angular/elements` package, the Angular framework provides a [`createCustomElement`][AioApiElementsCreatecustomelement] function that connects the component interface and change detection features to the built-in DOM API.

If you choose to transform a component to a custom element, you make all required Angular infrastructure available to the browser.
The creation of a custom element is simple and straightforward.
A custom element connects the following features.

*   The rendered DOM structure that you use change detection and data binding to define in your component
*   Angular code and HTML that matches the built-in HTML

<!-- <div class="alert is-helpful">

**NOTE**: <br />
The Angular team is working on custom elements for you to use in web apps built with other frameworks.
A minimal, self-contained version of the Angular framework is injected as a service to support the change-detection and data-binding features of the component.
To learn more about the direction of development, see the [Elements in v6 and Beyond][YoutubeWatchVZ1glfplvjjyT4s] video presentation.

</div>-->

<div class="lightbox">

<img alt="Angular element in browser" class="left" src="generated/images/guide/elements/customElement1.png">

</div>

## Browser support for Angular element

The recently developed [custom elements][MdnDocsWebWebComponentsUsingCustomElements] Web Platform feature is natively supported in the following browsers.

<!-- vale off -->

| Browser                 | Custom Element Support |
|:---                     |:---                    |
| Chrome                  | Supported natively     |
| Edge \(Chromium-based\) | Supported natively     |
| Firefox                 | Supported natively     |
| Opera                   | Supported natively     |
| Safari                  | Supported natively     |

<!-- vale on -->

Use the [`npm install`][NpmjsDocsCliV6CommandsNpmInstall] `npm` command to add the `@angular/elements` package to your workspace.

<!-- vale off -->

<code-example format="shell" language="shell">

npm install &commat;angular/elements --save

</code-example>

<!-- vale on -->

## Example: A Popup Service

In the past, when you wanted to add a component to an application at runtime, you had to define a dynamic component.
You had to load the dynamic component and attach it to an element in the DOM.
You also had to connect all dependencies, change detection, and event handling.
To learn more, see [Dynamically load a component][AioGuideComponentDynamicLoad].

Use a custom element to make the simplify the process and increase transparency.
A custom element automatically provides all infrastructure and framework.
You have to define the kind of event handling you want to use a custom element.

<div class="alert is-helpful">

**NOTE**:<br />
If you do not use the component in your application, you must exclude it from compilation.

</div>

<!--
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

-->

## Typing for a custom element

Generic DOM APIs return an element type appropriate for the specified arguments.
Generic DOM APIs include `document.createElement()` or `document.querySelector()`.

If run the following code example, TypeScript returns an `HTMLAnchorElement` and knows the `a` element has an `href` property.

<!-- vale off -->

<code-example>

document.createElement('a')

</code-example>

<!-- vale on -->

If you run the following code example, TypeScript returns the `HTMLDivElement` and knows `div` element does not have a `href` property.

<!-- vale off -->

<code-example>

document.createElement('div')

</code-example>

<!-- vale on -->

When the Angular framework runs into with an unknown element, the `createElement()` method returns a generic type.
An unknown element includes the name of a custom element.
The generic type is returned, because TypeScript is not able to infer the correct type for the returned element.
An example of generic type is `HTMLElement`.

A custom element created with Angular extends `NgElement`.
As a result the custom element also extends `HTMLElement`.
Additionally, the custom element includes a property for each input of the associated component.
For example, the `popup-element` custom element has a `message` property of `string` type.

You have a few options if you want to get correct types for your custom elements.
Assume you create a `my-dialog` custom element based on the following component.

<!-- vale off -->

<code-example format="typescript" header="my-dialog custom element component" language="typescript">

&commat;Component(...)
class MyDialog {
  &commat;Input() content: string;
}

</code-example>

<!-- vale on -->

To get accurate typings, cast the return value of the relevant DOM methods to the correct type.
Use the `NgElement` and `WithProperties` types.
Both types are exported from `@angular/elements` module.

<!-- vale off -->

<code-example format="typescript" header="my-dialog custom element with content" language="typescript">

const aDialog = document.createElement('my-dialog') as NgElement &amp; WithProperties&lt;{content: string}&gt;;
aDialog.content = 'Hello, world!';
aDialog.content = 123;  // &lt;-- ERROR: TypeScript knows this should be a string.
aDialog.body = 'News';  // &lt;-- ERROR: TypeScript knows there is no `body` property on `aDialog`.

</code-example>

<!-- vale on -->

The implementation is a good way to quickly get TypeScript features for your custom element.
Examples of the TypeScript features include type checking and autocomplete support.
You may be unhappy if you need it in several places, because you have to cast the return type on every occurrence.

An alternative way is to augment the `HTMLElementTagNameMap`, which only requires that you define the type for each custom element one time.
TypeScript infers the type for a returned element based on the associated tag name for DOM methods including `document.createElement()` and `document.querySelector()`.

<!-- vale off -->

<code-example format="typescript" header="HTMLElementTagNameMap interface" language="typescript">

declare global {
  interface HTMLElementTagNameMap {
    'my-dialog': NgElement & WithProperties&lt;{content: string}&gt;;
    'my-other-element': NgElement & WithProperties&lt;{foo: 'bar'}&gt;;
    ...
  }
}

</code-example>

<!-- vale on -->

Now, TypeScript infers the correct type the same way it does for built-in elements.

<code-example format="typescript" language="typescript">

document.createElement('div')               //--&gt; HTMLDivElement (built-in element)
document.querySelector('foo')               //--&gt; Element        (unknown element)
document.createElement('my-dialog')         //--&gt; NgElement &amp; WithProperties&lt;{content: string}&gt; (custom element)
document.querySelector('my-other-element')  //--&gt; NgElement &amp; WithProperties&lt;{foo: 'bar'}&gt;      (custom element)

</code-example>

<!-- links -->

[AioApiCoreComponent]: api/core/Component

<!-- "Component | @angular/core - API | Angular" -->

[AioApiCoreDirectiveSelector]: api/core/Directive#selector

<!-- "selector - Directive | @angular/core - API | Angular" -->

[AioApiElementsCreatecustomelement]: api/elements/createCustomElement

<!-- "createCustomElement | @angular/elements - API | Angular" -->

[AioCli]: cli

<!-- "CLI Overview and Command Reference | Angular" -->

[AioGuideComponentDynamicLoad]: guide/component/component-dynamic-load

<!-- "Dynamically load a component | Angular" -->

[AioGuideComponentExample]: guide/component/component-example

<!-- "Example Angular component applications | Angular" -->

[AioGuideElementCustomElementBrowserSupportForAngularElement]: guide/element/custom-element#browser-support-for-angular-element

<!-- "Browser support for Angular element - Understand custom element | Angular" -->

<!-- external links -->

[MdnDocsWebApiCustomelementregistry]: https://developer.mozilla.org/docs/Web/API/CustomElementRegistry

<!-- "CustomElementRegistry | MDN" -->

[MdnDocsWebApiCustomelementregistryDefine]: https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define

<!-- "CustomElementRegistry.define() | MDN" -->

[MdnDocsWebApiCustomevent]: https://developer.mozilla.org/docs/Web/API/CustomEvent

<!-- "CustomEvent | MDN" -->

[MdnDocsWebGuideEventsCreatingAndTriggeringEventsCreatingCustomEvents]: https://developer.mozilla.org/docs/Web/Guide/Events/Creating_and_triggering_events#Creating_custom_events

<!-- "Creating custom events - Creating and triggering events | MDN" -->

[MdnDocsWebApiShadowroot]: https://developer.mozilla.org/docs/Web/API/ShadowRoot

<!-- "ShadowRoot | MDN" -->

[MdnDocsWebWebComponents]: https://developer.mozilla.org/docs/Web/Web_Components

<!-- "Web Components | MDN" -->

[MdnDocsWebWebComponentsUsingCustomElements]: https://developer.mozilla.org/docs/Web/Web_Components/Using_custom_elements

<!-- "Using custom elements | MDN" -->

[NpmjsDocsCliV6CommandsNpmInstall]: https://docs.npmjs.com/cli/v6/commands/npm-install

<!-- "npm-install | npm Docs" -->

[YoutubeWatchVZ1glfplvjjyT4s]: https://www.youtube.com/watch?v=Z1gLFPLVJjY&t=4s

<!-- "Elements in v6 and Beyond - Rob Wormald | YouTube" -->

<!-- end links -->

@reviewed 2022-04-13
