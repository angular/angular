# View encapsulation

In Angular, component CSS styles are encapsulated into the component's view and don't
affect the rest of the application.

To control how this encapsulation happens on a *per
component* basis, you can set the *view encapsulation mode* in the component metadata.
Choose from the following modes:

* `ShadowDom` view encapsulation uses the browser's native shadow DOM implementation (see
  [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM)
  to attach a shadow DOM to the component's host element, and then puts the component
  view inside that shadow DOM. The component's styles are included within the shadow DOM.

* `Emulated` view encapsulation (the default) emulates the behavior of shadow DOM by preprocessing
  (and renaming) the CSS code to effectively scope the CSS to the component's view.
  For details, see [Inspecting generated CSS](guide/view-encapsulation#inspect-generated-css) below.

* `None` means that Angular does no view encapsulation.
  Angular adds the CSS to the global styles.
  The scoping rules, isolations, and protections discussed earlier don't apply.
  This is essentially the same as pasting the component's styles into the HTML.

To set the component's encapsulation mode, use the `encapsulation` property in the component metadata:

<code-example path="component-styles/src/app/quest-summary.component.ts" region="encapsulation.shadow" header="src/app/quest-summary.component.ts"></code-example>

`ShadowDom` view encapsulation only works on browsers that have native support
for shadow DOM (see [Can I use - Shadow DOM v1](https://caniuse.com/shadowdomv1)).
The support is still limited, which is why `Emulated` view encapsulation is the default mode and recommended in most cases.

{@a inspect-generated-css}

## Inspecting generated CSS

When using emulated view encapsulation, Angular preprocesses
all component styles so that they approximate the standard shadow CSS scoping rules.

In the DOM of a running Angular application with emulated view
encapsulation enabled, each DOM element has some extra attributes
attached to it:

<code-example format="">
  &lt;hero-details _nghost-pmm-5>
    &lt;h2 _ngcontent-pmm-5>Mister Fantastic&lt;/h2>
    &lt;hero-team _ngcontent-pmm-5 _nghost-pmm-6>
      &lt;h3 _ngcontent-pmm-6>Team&lt;/h3>
    &lt;/hero-team>
  &lt;/hero-detail>

</code-example>

There are two kinds of generated attributes:

* An element that would be a shadow DOM host in native encapsulation has a
  generated `_nghost` attribute. This is typically the case for component host elements.
* An element within a component's view has a `_ngcontent` attribute
  that identifies to which host's emulated shadow DOM this element belongs.

The exact values of these attributes aren't important. They are automatically
generated and you should never refer to them in application code. But they are targeted
by the generated component styles, which are in the `<head>` section of the DOM:

<code-example format="">
  [_nghost-pmm-5] {
    display: block;
    border: 1px solid black;
  }

h3[_ngcontent-pmm-6] {
background-color: white;
border: 1px solid #777;
}
</code-example>

These styles are post-processed so that each selector is augmented
with `_nghost` or `_ngcontent` attribute selectors.
These extra selectors enable the scoping rules described in this page.

## Mixing encapsulation modes

It is not recommended to mix components that use different view encapsulation modes, but where it is necessary you should be aware of how the component styles will interact.

- The styles of components with `Emulated` and `None` view encapsulation are added to the `<head>` of the document, making them available throughout the application.
  This means that styling for components with `None` view encapsulation will affect any matching elements in the document, while styling for `Emulated` components will only affect elements that are within their components templates.
- The styles of components with `ShadowDom` view encapsulation are only added to the shadow DOM host.
  This ensures that styling for components with `ShadowDom` view encapsulation can only affect matching elements within the component's template.
- All the top level styles (including those added for `Emulated` and `None` view encapsulation components) are also added to the shadow DOM host of each component that has `ShadowDom` encapsulation.
  **This means that styling for components with `None` view encapsulation will affect matching elements within the shadow DOM.**
  This may seem counter-intuitive at first, but without this a component with `None` view encapsulation could not be used within a component with `ShadowDom` view encapsulation, since its styles would not be available to it.

### Examples

This section demonstrates how the styling of components with different view encapsulation interact.
See <live-example></live-example> to try out these components yourself.

First, there is the `NoEncapsulationComponent` that has `ViewEncapsulation.None`. This colors its template nodes red.
Angular adds the styles for this component to the top level document and also to any shadow DOM hosts.
These styles are therefore available throughout the app.

<code-example path="view-encapsulation/src/app/no-encapsulation.component.ts" header="src/app/no-encapsulation.component.ts"></code-example>>

<img src="generated/images/guide/view-encapsulation/no-encapsulation.png" alt="component with no encapsulation">

Next, there is the `EmulatedEncapsulationComponent` that has `ViewEncapsulation.Emulated`. This colors its template nodes green.
Angular also adds the styles for this component to the top level document, and shadow DOM hosts, but are scoped by the attributes described [above](#inspecting-generated-css).
Therefore, only the nodes directly within this component's template will match these styles.
Since these styles are more specific, they override the top level styles from the `NoEncapsulationComponent`.
The `EmulatedEncapsulationComponent` contains a `NoEncapsulationComponent` which is styled as expected because the scoped styles do not match its contents.

<code-example path="view-encapsulation/src/app/emulated-encapsulation.component.ts" header="src/app/emulated-encapsulation.component.ts"></code-example>>

<img src="generated/images/guide/view-encapsulation/emulated-encapsulation.png" alt="component with no encapsulation">

Finally, there is the `ShadowDomEncapsulationComponent` that has `ViewEncapsulation.ShadowDom`. This colors its contents blue.
Angular adds styles for this component only to the shadow DOM host, so they are not visible outside the shadow DOM.
Angular has also added the styles for both the `NoEncapsulationComponent` and `ViewEncapsulationComponent` to the shadow DOM host, so those styles are still available to the template of this component.
The `ShadowDomEncapsulationComponent` contains both a `NoEncapsulationComponent` and `ViewEncapsulationComponent`.
The styles added by the `ShadowDomEncapsulationComponent` component are available throughout the shadow DOM of this component, and so to both the `NoEncapsulationComponent` and `ViewEncapsulationComponent`.
Since the `EmulatedEncapsulationComponent` has very specific "scoped" styles the styling of this component's template is unaffected.
But since styles from `ShadowDomEncapsulationComponent` are added after the styles from the other components they override the styles from the `NoEncapsulationComponent`.
The result is that the styling of the `NoEncapsulationComponent` is not what the component intended.

<code-example path="view-encapsulation/src/app/shadow-dom-encapsulation.component.ts" header="src/app/shadow-dom-encapsulation.component.ts"></code-example>>

<img src="generated/images/guide/view-encapsulation/shadow-dom-encapsulation.png" alt="component with no encapsulation">
