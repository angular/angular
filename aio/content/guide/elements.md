# Custom Elements Overview

[Custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)  are a Web Platform feature currently supported by Chrome, Opera, and Safari, and available in other browsers through polyfills (see [Browser Support](#browser-support)).
A custom element extends HTML by allowing you to define a tag whose content is created and controlled by JavaScript code. 
The browser maintains a `CustomElementRegistry` of defined custom elements (also called Web Components), which maps an instantiable JavaScript class to an HTML tag.

The `createCustomElement()` API provides a bridge from Angular's component interface and change detection functionality to the built-in DOM API. 

Transforming a component to a custom element makes all of the required Angular infrastructure available to the browser. Creating a custom element is simple and straightforward, and automatically connects your component-defined view with change detection and data binding, mapping Angular functionality to the corresponding native HTML equivalents. 

## Using custom elements

Custom elements bootstrap themselves - they start automatically when they are added to the DOM, and are automatically destroyed when removed from the DOM. Once a custom element is added to the DOM for any page, it looks and behaves like any other HTML element, and does not require any special knowledge of Angular terms or usage conventions.  

- <b>Easy dynamic content in an Angular app</b>

  Transforming a component to a custom element provides an easy path to creating dynamic HTML content in your Angular app. HTML content that you add directly to the DOM in an Angular app is normally displayed without Angular processing, unless you define a _dynamic component_, adding your own code to connect the HTML tag to your app data, and participate in change detection. With a custom element, all of that wiring is taken care of automatically.

- <b>Content-rich applications</b>

  If you have a content-rich app, such as the Angular app that presents this documentation, custom elements let you give your content providers sophisticated Angular functionality without requiring knowledge of Angular. For example, an Angular guide like this one is added directly to the DOM by the Angular navigation tools, but can include special elements like `<code-snippet>` that perform complex operations. All you need to tell your content provider is the syntax of your custom element. They don't need to know anything about Angular, or anything about your component's data structures or implementation.

### How it works

Use the `createCustomElement()` function to convert a component into a class that can be registered with the browser as a custom element. 
After you register your configured class with the browser's custom-element registry, you can use the new element just like a built-in HTML element in content that you add directly into the DOM: 

```
<my-popup message="Use Angular!"></my-popup>
```

When your custom element is placed on a page, the browser creates an instance of the registered class and adds it to the DOM. The content is provided by the component's template, which  uses Angular template syntax, and is rendered using the component and DOM data. Input properties in the component correspond to input attributes for the element. 

<figure>

<img src="generated/images/guide/elements/customElement1.png" alt="Custom element in browser" class="left">

</figure>

<hr class="clear">

<div class="l-sub-section">

    We are working on custom elements that can be used by web apps built on other frameworks. 
    A minimal, self-contained version of the Angular framework will be injected as a service to support the component's change-detection and data-binding functionality. 
    For more about the direction of development, check out this [video presentation](https://www.youtube.com/watch?v=vHI5C-9vH-E).

</div>

## Transforming components to custom elements

Angular provides the `createCustomElement()` function for converting an Angular component, 
together with its dependencies, to a custom element. The function collects the component's 
observable properties, along with the Angular functionality the browser needs to 
create and destroy instances, and to detect and respond to changes. 

The conversion process implements the `NgElementConstructor` interface, and creates a 
constructor class that is configured to produce a self-bootstrapping instance of your component. 

Use a JavaScript function, `customElements.define()`,  to register the configured constructor 
and its associated custom-element tag with the browser's `CustomElementRegistry`. 
When the browser encounters the tag for the registered element, it uses the constructor to create a custom-element instance.

<figure>

<img src="generated/images/guide/elements/createElement.png" alt="Transform a component to a custom element" class="left">  

</figure>

### Mapping 

A custom element _hosts_ an Angular component, providing a bridge between the data and logic defined in the component and standard DOM APIs. Component properties and logic maps directly into HTML attributes and the browser's event system.

- The creation API parses the component looking for input properties, and defines corresponding attributes for the custom element. It transforms the property names to make them compatible with custom elements, which do not recognize case distinctions. The resulting attribute names use dash-separated lowercase. For example, for a component with `@Input('myInputProp') inputProp`, the corresponding custom element defines an attribute `my-input-prop`.

- Component outputs are dispatched as HTML [Custom Events](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent), with the name of the custom event matching the output name. For example, for a component with `@Output() valueChanged = new EventEmitter()`, the corresponding custom element will dispatch events with the name "valueChanged", and the emitted data will be stored on the event’s `detail` property. If you provide an alias, that value is used; for example, `@Output('myClick') clicks = new EventEmitter<string>();` results in dispatch events with the name "myClick".


For more information, see Web Component documentation for [Creating custom events](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events#Creating_custom_events).
 

{@a browser-support}

## Browser support for custom elements

The recently-developed [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) Web Platform feature is currently supported natively in a number of browsers. Support is pending or planned in other browsers. 

<table>
<tr>
  <th>Browser</th>
  <th>Custom Element Support</th>
</tr>
<tr>
  <td>Chrome</td>
  <td>Supported natively.</td>
</tr>
<tr>
  <td>Opera</td>
  <td>Supported natively.</td>
</tr>
<tr>
  <td>Safari</td>
  <td>Supported natively.</td>
</tr>
<tr>
  <td>Firefox</td>
  <td> Set the <code>dom.webcomponents.enabled</code> and <code>dom.webcomponents.customelements.enabled</code> preferences to true. Planned to be enabled by default in version 60/61.</td>
</tr>
<tr>
  <td>Edge</td>
  <td>Working on an implementation. <br>    
 Use the <a href="https://cli.angular.io/" target="_blanks">CLI</a> to automatically set up your project with the correct polyfill: <code>ng add @angular/elements</code>.
  </td>
</tr>
</table>
  

- For more information about polyfills, see [polyfill documentation](https://www.webcomponents.org/polyfills). 

- For more information about Angular browser support, see [Browser Support](guide/browser-support).


## Example: A Popup Service

Previously, when you wanted to add a component to an app at runtime, you had to define a _dynamic component_. The app module would have to list your dynamic component under `entryComponents`, so that the app wouldn't expect it to be present at startup, and then you would have to load it, attach it to an element in the DOM, and wire up all of the dependencies, change detection, and event handling, as described in [Dynamic Component Loader](guide/dynamic-component-loader).

Using an Angular custom element makes the process much simpler and more transparent, by providing all of the infrastructure and framework automatically&mdash;all you have to do is define the kind of event handling you want. (You do still have to exclude the component from compilation, if you are not going to use it in your app.)

The Popup Service example app defines a component that you can either load dynamically or convert to a custom element. 

- `popup.component.ts`  defines a simple pop-up element that displays an input message, with some animation and styling. 
- `popup.service.ts` creates an injectable service that provides two different ways to invoke the PopupComponent; as a dynamic component, or as a custom element. Notice how much more setup is required for the dynamic-loading method.
- `app.module.ts` adds the PopupComponent in the module's `entryComponents` list, to exclude it from compilation and avoid startup warnings or errors.
- `app.component.ts` defines the app's root component, which uses the PopupService to add the pop-up to the DOM at run time. When the app runs, the root component's constructor converts PopupComponent to a custom element. 

For comparison, the demo shows both methods. One button adds the popup using the dynamic-loading method, and the other uses the custom element. You can see that the result is the same; only the preparation is different.

<code-tabs>

  <code-pane title="popup.component.ts" path="elements/src/app/popup.component.ts">

  </code-pane>

  <code-pane title="popup.service.ts" path="elements/src/app/popup.service.ts">

  </code-pane>

  <code-pane title="app.module.ts" path="elements/src/app/app.module.ts">

  </code-pane>

  <code-pane title="app.component.ts" path="elements/src/app/app.component.ts">

  </code-pane>
</code-tabs>
