# Custom Elements Overview

[Custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) are a Web Platform feature, currently supported by Chrome, Opera, and Safari, and available in other browsers through polyfills (see [Browser Support](#browser-support)).
A custom element extends HTML by allowing you to define a tag whose content is created and controlled by JavaScript code. 
The browser maintains a `CustomElementRegistry` of defined custom elements (also called web components), which maps an instantiable JavaScript class to an HTML tag.

The `createCustomElement()` API provides a bridge from Angular's component interface and change detection functionality to the built-in DOM API. 

Transforming a component to a custom element makes all of the required Angular infrastructure available to the browser. Creating a custom element is simple and straightforward, and automatically connects your component-defined view with change detection and data binding, mapping Angular functionality to the corresponding native HTML equivalents. 

Custom elements bootstrap themselves - they start automatically when they are added to the DOM, and are automatically destroyed when removed from the DOM. Once a custom element is added to the DOM for any page, it looks and behaves like any other HTML element, and does not require any special knowledge of Angular terms or usage conventions.  

- Easy dynamic content in an Angular app
  Transforming a component to a custom element provides an easy path to creating dynamic HTML content in your Angular app. HTML content that you add directly to the DOM in an Angular app is normally displayed without Angular processing, unless you define a _dynamic component_, adding your own code to connect the HTML tag to your app data, and participate in change detection. With a custom element, all of that wiring is taken care of automatically.

- Content-rich applications
  (need a succinct description of this use case)



## Basic usage

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

## Creating an Angular custom element

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

## Mapping components to custom elements

A custom element _hosts_ an Angular component, providing a bridge between the data and logic defined in the component and standard DOM APIs. Component properties and logic maps directly into HTML attributes and the browser's event system.
 
A customizable configuration controls how Angular performs the transformations. The default configuration is useful for most cases. In the default configuration:

- The creation API parses the component looking for input properties, and defines corresponding attributes for the custom element. It transforms the property names to make them compatible with custom elements, which do not recognize case distinctions.

 For example, for a component with `@Input('myInputProp') inputProp`, the corresponding custom element defines an attribute `my-input-prop`.
- ???Output properties (`@Output(`myEvent`) doSomething`) become HTML events. ???

 For example, ... 

- ??? @HostBinding/Listener -> CE Attributes / ObservedAttributes ???


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
  <td>Working on an implementation. Use polyfill. </td>
</tr>
</table>
  
For more information about browser support and polyfills, see [Browser Support](guide/browser-support).


## Example: A Popup Service

Previously, when you wanted to add a component to an app at runtime, you had to define a _dynamic component_. 
The app module would have to list your dynamic component under `entry-components`, so that the app wouldn't expect it to be present at startup, and then you would have to load it, attach it to an element in the DOM, and wire up all of the dependencies, change detection, and event handling, as described in [Dynamic Component Loader](guide/dynamic-component-loader).
Using an Angular custom element makes the process much simpler and more transparent, by providing all of the infrastructure and framework automatically&mdash;all you have to do is define the kind of event handling you want.
The Popup Service example app compares the two methodologies by defining a component that you can either load dynamically or convert to a custom element. 

- `popup.component.ts`  defines a simple pop-up element that displays an input message, with some animation and styling. 

```
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AnimationEvent} from '@angular/animations';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'my-popup',
  template: 'Popup: {{message}}',
  host: {
    '[@state]': 'state',
    '(@state.done)': 'onAnimationDone($event)',
  },
  animations: [
    trigger('state', [
      state('opened', style({transform: 'translateY(0%)'})),
      state('void, closed', style({transform: 'translateY(100%)', opacity: 0})),
      transition('* => *', animate('100ms ease-in')),
    ])
  ],
  styles: [`
    :host {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: #009cff;
      height: 48px;
      padding: 16px;
      display: flex;
      align-items: center;
      border-top: 1px solid black;
      font-size: 24px;
    }
  `]
})

export class PopupComponent {
  private state: 'opened' | 'closed' = 'closed';

  @Input()
  set message(message: string) {
    this._message = message;
    this.state = 'opened';

    setTimeout(() => this.state = 'closed', 2000);
  }
  get message(): string { return this._message; }
  _message: string;

  @Output()
  closed = new EventEmitter();

  onAnimationDone(e: AnimationEvent) {
    if (e.toState === 'closed') {
      this.closed.next();
    }
  }
}
```

- `popup.service.ts` creates an injectable service that provides two different ways to invoke the PopupComponent; as a dynamic component, or as a custom element. Notice how much more setup is required for the dynamic-loading method.

```
import {ApplicationRef, ComponentFactoryResolver, Injectable, Injector} from '@angular/core';

import {PopupComponent} from './popup.component';
import {NgElementConstructor} from '../elements-dist';

@Injectable()
export class PopupService {
  constructor(private injector: Injector,
              private applicationRef: ApplicationRef,
              private componentFactoryResolver: ComponentFactoryResolver) {}

  // Use the dynamic-loading method to set up infrastructure
  // before adding the popup to the DOM.
  showAsComponent(message: string) {
    // Create element
    const popup = document.createElement('popup-component');

    // Create the component and wire it up with the element
    const factory = this.componentFactoryResolver.resolveComponentFactory(PopupComponent);
    const popupComponentRef = factory.create(this.injector, [], popup);

    // Attach to the view so that the change detector knows to run
    this.applicationRef.attachView(popupComponentRef.hostView);

    // Listen to the close event
    popupComponentRef.instance.closed.subscribe(() => {
      document.body.removeChild(popup);
      this.applicationRef.detachView(popupComponentRef.hostView);
    });

    // Set the message
    popupComponentRef.instance.message = message;

    // Add to the DOM
    document.body.appendChild(popup);
  }

  // Use the custom-element method to add the popup to the DOM.
  showAsElement(message: string) {
    // Create element
    const popupEl = document.createElement('popup-element');

    // Listen to the close event
    popupEl.addEventListener('closed', () => document.body.removeChild(popupEl));

    // Set the message
    popupEl.message = message;

    // Add to the DOM
    document.body.appendChild(popupEl);
  }
}
```

- `app.component.ts` defines the app's root component, which uses the PopupService to add the pop-up to the DOM at run time. When the app runs, the root component's constructor converts PopupComponent to a custom element. 

For comparison, the demo shows both methods. One button adds the popup using the dynamic-loading method, and the other uses the custom element. You can see that the result is the same; only the preparation is different.

```
import {Component, Injector} from '@angular/core';
import {createNgElementConstructor} from '../elements-dist';
import {PopupService} from './popup.service';
import {PopupComponent} from './popup.component';

@Component({
  selector: 'app-root',
  template: `
    <input #input value="Message">
    <button (click)="popup.showAsComponent(input.value)"> 
        Show as component </button>
    <button (click)="popup.showAsElement(input.value)"> 
        Show as element </button>
  `
})

export class AppComponent {
   constructor(private injector: Injector, public popup: PopupService) {
    // on init, convert PopupComponent to a custom element 
    const PopupElement = 
createNgElementConstructor(PopupComponent, {injector: this.injector});
    // register the custom element with the browser.
       customElements.define('popup-element', PopupElement);
  }
}
```

- `app.module.ts` supports the dynamic-loading method by listing PopupComponent in the module's entryComponents. When you add it as a custom element, you don't need this.

```
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {PopupService} from './popup.service';
import {PopupComponent} from './popup.component';

@NgModule({
  declarations: [AppComponent, PopupComponent],
  imports: [BrowserModule, BrowserAnimationsModule],
  providers: [PopupService],
  bootstrap: [AppComponent],
  entryComponents: [PopupComponent],
})
export class AppModule { }
```
