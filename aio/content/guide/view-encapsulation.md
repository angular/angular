# View encapsulation

In Angular, a component's CSS styles can be encapsulated into the component's host element so that they don't affect the rest of the application.

The `Component`'s decorator provides the [`encapsulation`](api/core/Component#encapsulation) option which can be used to control how the encapsulation is applied on a _per component_ basis.

The available options are:

- `ViewEncapsulation.ShadowDom`, it instructs Angular to use the browser's native shadow DOM API (see [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM)) to enclose the component's view inside a Shadow DOM (implemented via a ShadowRoot used as the component's host element) and use such to apply the provided styles in an isolated manner.

- `ViewEncapsulation.Emulated`, it instructs Angular to programmatically modify the component's CSS selectors so that they are only applied to the component's view and do not affect other elements in the application (_emulating_ a ShadowDom-like behavior). For more details, see [Inspecting generated CSS](guide/view-encapsulation#inspect-generated-css).

- `ViewEncapsulation.None`, it doesn't instruct Angular to apply any sort of view encapsulation.
  Meaning that any CSS styles specified for the component are actually globally applied and can affect any HTML element present within the application.
  This mode is essentially the same as including the styles into the HTML itself.

<div class="alert is-important">

  `ViewEncapsulation.ShadowDom` only works on browsers that have built-in support
  for the shadow DOM (see [Can I use - Shadow DOM v1](https://caniuse.com/shadowdomv1)).
  Not all browsers support it, which is why the `ViewEncapsulation.Emulated` is the recommended and default mode.

</div>


{@a inspect-generated-css}

## Inspecting generated CSS

When using the emulated view encapsulation, Angular pre-processes all the component's styles so that they are only applied to the component's view.

In the DOM of a running Angular application, elements belonging to components using the emulated view encapsulation present some extra attributes attached to them:

<code-example format="html" language="html">
&lt;hero-details _nghost-pmm-5>
  &lt;h2 _ngcontent-pmm-5>Mister Fantastic&lt;/h2>
  &lt;hero-team _ngcontent-pmm-5 _nghost-pmm-6>
    &lt;h3 _ngcontent-pmm-6>Team&lt;/h3>
  &lt;/hero-team>
&lt;/hero-detail>
</code-example>

There are two kinds of such attributes:

- `_nghost` attributes are added to elements that enclose a component's view and that would be ShadowRoots in a native Shadow DOM encapsulation. This is typically the case for components' host elements.
- `_ngcontent` attributes are added to child element within a component's view, those are used to match the elements with their respective emulated ShadowRoots (host elements with a matching `_nghost` attribute).

The exact values of these attributes aren't important. They are automatically generated and you should never refer to them in application code.

They are targeted by the generated component styles, which are injected in the `<head>` section of the DOM:

<code-example format="css" language="css">
[_nghost-pmm-5] {
  display: block;
  border: 1px solid black;
}

h3[_ngcontent-pmm-6] {
  background-color: white;
  border: 1px solid #777;
}
</code-example>

These styles are post-processed so that each CSS selector is augmented with the appropriate `_nghost` or `_ngcontent` attribute. These modified selectors make sure the styles to be applied to components' views in an isolated and targeted fashion.

## Mixing encapsulation modes

As previously mentioned the encapsulation mode can be specified in the Component's decorator on a _per component_ basis, this means that within your application you can have different components using different encapsulation strategies.

Although possible, this is not recommended, in case it is really necessary for your needs you should be aware of how the styles of components using different encapsulation modes would interact with each other:

- The styles of components with `ViewEncapsulation.Emulated` are added to the `<head>` of the document, making them available throughout the application, but their selectors are modified as illustrated in the previous section, meaning that they only affect elements within the respective components' templates.

- The styles of components with `ViewEncapsulation.None` are added to the `<head>` of the document, making them available throughout the application, they are not modified in any way making them completely global and applicable to any element withing the application's DOM.

- The styles of components with `ViewEncapsulation.ShadowDom` are only added to the shadow DOM host, ensuring that they only affect elements within the components' views.

<div class="alert is-helpful">

  Styles of `ViewEncapsulation.Emulated` and `ViewEncapsulation.None` components are also added to the shadow DOM host of each `ViewEncapsulation.ShadowDom` component.

  This means that styles for components with `ViewEncapsulation.None` will affect matching elements within shadow DOMs.

  This approach may seem counter-intuitive at first, but without it a component with `ViewEncapsulation.None` could not be styled within a component with `ViewEncapsulation.ShadowDom`, since its styles would not be available.

</div>

### Examples

This section shows examples of how the styling of components with different `ViewEncapsulation` interact.

See the <live-example noDownload></live-example> to try out these components yourself.

#### No encapsulation

This first example shows a component that has `ViewEncapsulation.None`. This component colors its template elements red.

<code-example path="view-encapsulation/src/app/no-encapsulation.component.ts" header="src/app/no-encapsulation.component.ts"></code-example>>

Angular adds the styles for this component as global styles to the `<head>` of the document.

As mentioned Angular also adds the styles to all shadow DOM hosts. Therefore, the styles are available throughout the whole application.

<img src="generated/images/guide/view-encapsulation/no-encapsulation.png" alt="component with no encapsulation">

#### Emulated encapsulation

This second example shows a component that has `ViewEncapsulation.Emulated`. This component colors its template elements green.

<code-example path="view-encapsulation/src/app/emulated-encapsulation.component.ts" header="src/app/emulated-encapsulation.component.ts"></code-example>>

Similar to `ViewEncapsulation.None`, Angular adds the styles for this component to the `<head>` of the document, and to all the shadow DOM hosts (but in this case, the styles are not applied to Shadow DOM elements since they are "scoped" via extra attributes as described in ["Inspecting generated CSS"](#inspecting-generated-css)).

Therefore, only the elements directly within this component's template will match its styles.
Since the "scoped" styles from the `EmulatedEncapsulationComponent` are very specific, they override the global styles from the `NoEncapsulationComponent`.

In this example, the `EmulatedEncapsulationComponent` contains a `NoEncapsulationComponent`, but `NoEncapsulationComponent` is still styled as expected since the `EmulatedEncapsulationComponent`'s "scoped" styles do not match elements in its template.

<img src="generated/images/guide/view-encapsulation/emulated-encapsulation.png" alt="component with no encapsulation">

#### Shadow DOM encapsulation

This third example shows a component that has `ViewEncapsulation.ShadowDom`. This component colors its template elements blue.

<code-example path="view-encapsulation/src/app/shadow-dom-encapsulation.component.ts" header="src/app/shadow-dom-encapsulation.component.ts"></code-example>>

Angular adds styles for this component only to the shadow DOM host, so they are not visible outside the shadow DOM.

Note that Angular also adds the global styles from the `NoEncapsulationComponent` and `ViewEncapsulationComponent` to the shadow DOM host, so those styles are still available to the elements in the template of this component.

In this example, the `ShadowDomEncapsulationComponent` contains both a `NoEncapsulationComponent` and `ViewEncapsulationComponent`.

The styles added by the `ShadowDomEncapsulationComponent` component are available throughout the shadow DOM of this component, and so to both the `NoEncapsulationComponent` and `ViewEncapsulationComponent`.

The `EmulatedEncapsulationComponent` has specific "scoped" styles, so the styling of this component's template is unaffected.

But since styles from `ShadowDomEncapsulationComponent` are added to the shadow host after the global styles, the `h2` style overrides the style from the `NoEncapsulationComponent`.
The result is that the `<h2>` element in the `NoEncapsulationComponent` is colored blue rather than red, which may not be what the component's author intended.

<img src="generated/images/guide/view-encapsulation/shadow-dom-encapsulation.png" alt="component with no encapsulation">

@reviewed 2021-11-10
