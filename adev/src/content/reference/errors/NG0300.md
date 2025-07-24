# Selector Collision

<docs-video src="https://www.youtube.com/embed/z_3Z5mOm59I"/>

Two or more [components](guide/components) use the same element selector. Because there can only be a single component associated with an element, selectors must be unique strings to prevent ambiguity for Angular.

This error occurs at runtime when you apply two selectors to a single node, each of which matches a different component, or when you apply a single selector to a node and it matches more than one component.

<docs-code language="typescript">

import { Component } from '@angular/core';

@Component({
  selector: '[stroked-button]',
  templateUrl: './stroked-button.component.html',
})
export class StrokedBtnComponent {}

@Component({
  selector: '[raised-button]',
  templateUrl: './raised-button.component.html',
})
export class RaisedBtnComponent {}


@Component({
  selector: 'app-root',
  template: `
  <!-- This node has 2 selectors: stroked-button and raised-button, and both match a different component: StrokedBtnComponent, and RaisedBtnComponent , so NG0300 will be raised  -->
  <button stroked-button  raised-button></button>
  `,
})
export class AppComponent {}

</docs-code>

## Debugging the error

Use the element name from the error message to search for places where you're using the same selector declaration in your codebase:

<docs-code language="typescript">

@Component({
  selector: 'YOUR_STRING',
  …
})

</docs-code>

Ensure that each component has a unique CSS selector. This will guarantee that Angular renders the component you expect.

If you're having trouble finding multiple components with this selector tag name, check for components from imported component libraries, such as Angular Material. Make sure you're following the [best practices](style-guide#component-selectors) for your selectors to prevent collisions.
