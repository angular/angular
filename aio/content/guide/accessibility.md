# Accessibility in Angular

The web is used by a wide variety of people, including those who have visual or motor impairments.
A variety of assistive technologies are available that make it much easier for these groups to interact with web-based software applications.
Also, designing an application to be more accessible generally improves the user experience for all users.

For an in-depth introduction to issues and techniques for designing accessible applications, see the [Accessibility](https://developers.google.com/web/fundamentals/accessibility/#what_is_accessibility) section of the Google's [Web Fundamentals](https://developers.google.com/web/fundamentals).

This page discusses best practices for designing Angular applications that work well for all users, including those who rely on assistive technologies.

<div class="alert is-helpful">

For the sample application that this page describes, see the <live-example></live-example>.

</div>

## Accessibility attributes

Building accessible web experience often involves setting [Accessible Rich Internet Applications \(ARIA\) attributes](https://developers.google.com/web/fundamentals/accessibility/semantics-aria) to provide semantic meaning where it might otherwise be missing.
Use [attribute binding](guide/attribute-binding) template syntax to control the values of accessibility-related attributes.

When binding to ARIA attributes in Angular, you must use the `attr.` prefix. The ARIA specification depends specifically on HTML attributes rather than properties of DOM elements.

<code-example format="html" language="html">

&lt;!-- Use attr. when binding to an ARIA attribute --&gt;
&lt;button [attr.aria-label]="myActionLabel"&gt;&hellip;&lt;/button&gt;

</code-example>

<div class="alert is-helpful">

**NOTE** <br />
This syntax is only necessary for attribute *bindings*.
Static ARIA attributes require no extra syntax.

<code-example format="html" language="html">

&lt;!-- Static ARIA attributes require no extra syntax --&gt;
&lt;button aria-label="Save document"&gt;&hellip;&lt;/button&gt;

</code-example>

</div>

<div class="alert is-helpful">

By convention, HTML attributes use lowercase names \(`tabindex`\), while properties use camelCase names \(`tabIndex`\).

See the [Binding syntax](guide/binding-syntax#html-attribute-vs-dom-property) guide for more background on the difference between attributes and properties.

</div>

## Angular UI components

The [Angular Material](https://material.angular.io) library, which is maintained by the Angular team, is a suite of reusable UI components that aims to be fully accessible.
The [Component Development Kit (CDK)](https://material.angular.io/cdk/categories) includes the `a11y` package that provides tools to support various areas of accessibility.
For example:

*   `LiveAnnouncer` is used to announce messages for screen-reader users using an `aria-live` region.
    See the W3C documentation for more information on [aria-live regions](https://www.w3.org/WAI/PF/aria-1.1/states_and_properties#aria-live).

*   The `cdkTrapFocus` directive traps Tab-key focus within an element.
    Use it to create accessible experience for components such as modal dialogs, where focus must be constrained.

For full details of these and other tools, see the [Angular CDK accessibility overview](https://material.angular.io/cdk/a11y/overview).

### Augmenting native elements

Native HTML elements capture several standard interaction patterns that are important to accessibility.
When authoring Angular components, you should re-use these native elements directly when possible, rather than re-implementing well-supported behaviors.

For example, instead of creating a custom element for a new variety of button, create a component that uses an attribute selector with a native `<button>` element.
This most commonly applies to `<button>` and `<a>`, but can be used with many other types of element.

You can see examples of this pattern in Angular Material:
[`MatButton`](https://github.com/angular/components/blob/50d3f29b6dc717b512dbd0234ce76f4ab7e9762a/src/material/button/button.ts#L67-L69), [`MatTabNav`](https://github.com/angular/components/blob/50d3f29b6dc717b512dbd0234ce76f4ab7e9762a/src/material/tabs/tab-nav-bar/tab-nav-bar.ts#L139), and [`MatTable`](https://github.com/angular/components/blob/50d3f29b6dc717b512dbd0234ce76f4ab7e9762a/src/material/table/table.ts#L22).

### Using containers for native elements

Sometimes using the appropriate native element requires a container element.
For example, the native `<input>` element cannot have children, so any custom text entry components need to wrap an `<input>` with extra elements.
By just including `<input>` in your custom component's template, it's impossible for your component's users  to set arbitrary properties and attributes to the `<input>` element.
Instead, create a container component that uses content projection to include the native control in the component's API.

You can see [`MatFormField`](https://material.angular.io/components/form-field/overview) as an example of this pattern.

## Case study: Building a custom progress bar

The following example shows how to make a progress bar accessible by using host binding to control accessibility-related attributes.

*   The component defines an accessibility-enabled element with both the standard HTML attribute `role`, and ARIA attributes.
    The ARIA attribute `aria-valuenow` is bound to the user's input.

    <code-example header="src/app/progress-bar.component.ts" path="accessibility/src/app/progress-bar.component.ts" region="progressbar-component"></code-example>

*   In the template, the `aria-label` attribute ensures that the control is accessible to screen readers.

    <code-example header="src/app/app.component.html" path="accessibility/src/app/app.component.html" region="template"></code-example>

## Routing

### Focus management after navigation

Tracking and controlling [focus](https://developers.google.com/web/fundamentals/accessibility/focus) in a UI is an important consideration in designing for accessibility.
When using Angular routing, you should decide where page focus goes upon navigation.

To avoid relying solely on visual cues, you need to make sure your routing code updates focus after page navigation.
Use the `NavigationEnd` event from the `Router` service to know when to update focus.

The following example shows how to find and focus the main content header in the DOM after navigation.

<code-example format="typescript" language="typescript">

router.events.pipe(filter(e =&gt; e instanceof NavigationEnd)).subscribe(() =&gt; {
  const mainHeader = document.querySelector('&num;main-content-header')
  if (mainHeader) {
    mainHeader.focus();
  }
});

</code-example>

In a real application, the element that receives focus depends on your specific application structure and layout.
The focused element should put users in a position to immediately move into the main content that has just been routed into view.
You should avoid situations where focus returns to the `body` element after a route change.

### Active links identification

CSS classes applied to active `RouterLink` elements, such as `RouterLinkActive`, provide a visual cue to identify the active link.
Unfortunately, a visual cue doesn't help blind or visually impaired users.
Applying the `aria-current` attribute to the element can help identify the active link.
For more information, see [Mozilla Developer Network \(MDN\) aria-current](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current)).

The `RouterLinkActive` directive provides the `ariaCurrentWhenActive` input which sets the `aria-current` to a specified value when the link becomes active.

The following example shows how to apply the `active-page` class to active links as well as setting their `aria-current` attribute to `"page"` when they are active:

```html
    <nav>
      <a routerLink="home"
         routerLinkActive="active-page"
         ariaCurrentWhenActive="page">
        Home
      </a>
      <a routerLink="about"
         routerLinkActive="active-page"
         ariaCurrentWhenActive="page">
        About
      </a>
      <a routerLink="shop"
         routerLinkActive="active-page"
         ariaCurrentWhenActive="page">
        Shop
      </a>
    </nav>
```

<!-- vale Angular.Angular_Spelling = NO -->

## More information

*   [Accessibility - Google Web Fundamentals](https://developers.google.com/web/fundamentals/accessibility)
*   [ARIA specification and authoring practices](https://www.w3.org/TR/wai-aria)
*   [Material Design - Accessibility](https://material.io/design/usability/accessibility.html)
*   [Smashing Magazine](https://www.smashingmagazine.com/search/?q=accessibility)
*   [Inclusive Components](https://inclusive-components.design)
*   [Accessibility Resources and Code Examples](https://dequeuniversity.com/resources)
*   [W3C - Web Accessibility Initiative](https://www.w3.org/WAI/people-use-web)
*   [Rob Dodson A11ycasts](https://www.youtube.com/watch?v=HtTyRajRuyY)
*   [Angular ESLint](https://github.com/angular-eslint/angular-eslint#functionality) provides linting rules that can help you make sure your code meets accessibility standards.

<!-- vale Angular.Angular_Spelling = YES -->

Books

<!-- vale Angular.Google_Quotes = NO -->

*   "A Web for Everyone: Designing Accessible User Experiences," Sarah Horton and Whitney Quesenbery
*   "Inclusive Design Patterns," Heydon Pickering

<!-- vale Angular.Google_Quotes = YES -->

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
