# View encapsulation

In Angular, a component's styles can be encapsulated within the component's host element so that they don't affect the rest of the application.

The `Component` decorator provides the [`encapsulation`](api/core/Component#encapsulation) option which can be used to control how the encapsulation is applied on a *per component* basis.

Choose from the following modes:

<!-- vale off -->

| Modes                         | Details |
|:---                           |:---     |
| `ViewEncapsulation.ShadowDom` | Angular uses the browser's built-in [Shadow DOM API](https://developer.mozilla.org/docs/Web/Web_Components/Shadow_DOM) to enclose the component's view inside a ShadowRoot, used as the component's host element, and apply the provided styles in an isolated manner. |
| `ViewEncapsulation.Emulated`  | Angular modifies the component's CSS selectors so that they are only applied to the component's view and do not affect other elements in the application, *emulating* Shadow DOM behavior. For more details, see [Inspecting generated CSS](guide/view-encapsulation#inspect-generated-css). |
| `ViewEncapsulation.None`      | Angular does not apply any sort of view encapsulation meaning that any styles specified for the component are actually globally applied and can affect any HTML element present within the application. This mode is essentially the same as including the styles into the HTML itself. |

<a id="inspect-generated-css"></a>

## Inspecting generated CSS

<!-- vale on -->

When using the emulated view encapsulation, Angular pre-processes all the component's styles so that they are only applied to the component's view.

In the DOM of a running Angular application, elements belonging to components using emulated view encapsulation have some extra attributes attached to them:

<code-example language="html">

&lt;hero-details _nghost-pmm-5&gt;
  &lt;h2 _ngcontent-pmm-5&gt;Mister Fantastic&lt;/h2&gt;
  &lt;hero-team &lowbar;ngcontent-pmm-5 &lowbar;nghost-pmm-6&gt;
    &lt;h3 _ngcontent-pmm-6&gt;Team&lt;/h3&gt;
  &lt;/hero-team&gt;
&lt;/hero-details&gt;

</code-example>

Two kinds of these attributes exist:

| Attributes   | Details |
|:---          |:---     |
| `_nghost`    | Are added to elements that enclose a component's view and that would be ShadowRoots in a native Shadow DOM encapsulation. This is typically the case for components' host elements.          |
| `_ngcontent` | Are added to child element within a component's view, those are used to match the elements with their respective emulated ShadowRoots \(host elements with a matching `_nghost` attribute\). |

The exact values of these attributes are a private implementation detail of Angular.
They are automatically created and you should never refer to them in application code.

They are targeted by the created component styles, which are injected in the `<head>` section of the DOM:

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

These styles are post-processed so that each CSS selector is augmented with the appropriate `_nghost` or `_ngcontent` attribute.
These modified selectors make sure the styles to be applied to components' views in an isolated and targeted fashion.

## Mixing encapsulation modes

As mentioned earlier, you specify the encapsulation mode in the Component's decorator on a *per component* basis. This means that within your application you can have different components using different encapsulation strategies.

Although possible, this is not recommended.
If it is really needed, you should be aware of how the styles of components using different encapsulation modes interact with each other:

| Modes                         | Details |
|:---                           |:---     |
| `ViewEncapsulation.Emulated`  | The styles of components are added to the `<head>` of the document, making them available throughout the application, but their selectors only affect elements within their respective components' templates. |
| `ViewEncapsulation.None`      | The styles of components are added to the `<head>` of the document, making them available throughout the application, so are completely global and affect any matching elements within the document.          |
| `ViewEncapsulation.ShadowDom` | The styles of components are only added to the shadow DOM host, ensuring that they only affect elements within their respective components' views.                                                            |

<div class="alert is-helpful">

Styles of `ViewEncapsulation.Emulated` and `ViewEncapsulation.None` components are also added to the shadow DOM host of each `ViewEncapsulation.ShadowDom` component.

This means that styles for components with `ViewEncapsulation.None` affect matching elements within the shadow DOM.

This approach may seem counter-intuitive at first. But without it a component with `ViewEncapsulation.None` would be rendered differently within a component using `ViewEncapsulation.ShadowDom`, since its styles would not be available.

</div>

### Examples

This section shows examples of how the styling of components with different `ViewEncapsulation` interact.

See the <live-example noDownload></live-example> to try out these components yourself.

#### No encapsulation

The first example shows a component that has `ViewEncapsulation.None`.
This component colors its template elements red.

<code-example header="src/app/no-encapsulation.component.ts" path="view-encapsulation/src/app/no-encapsulation.component.ts"></code-example>

Angular adds the styles for this component as global styles to the `<head>` of the document.

As already mentioned, Angular also adds the styles to all shadow DOM hosts, making the styles available throughout the whole application.

<div class="lightbox">

<img alt="component with no encapsulation" src="generated/images/guide/view-encapsulation/no-encapsulation.png">

</div>

#### Emulated encapsulation

The second example shows a component that has `ViewEncapsulation.Emulated`.
This component colors its template elements green.

<code-example header="src/app/emulated-encapsulation.component.ts" path="view-encapsulation/src/app/emulated-encapsulation.component.ts"></code-example>

Comparable to `ViewEncapsulation.None`, Angular adds the styles for this component to the `<head>` of the document, but with "scoped" styles.

Only the elements directly within this component's template are going to match its styles.
Since the "scoped" styles from the `EmulatedEncapsulationComponent` are specific, they override the global styles from the `NoEncapsulationComponent`.

In this example, the `EmulatedEncapsulationComponent` contains a `NoEncapsulationComponent`, but `NoEncapsulationComponent` is still styled as expected since the `EmulatedEncapsulationComponent` 's "scoped" styles do not match elements in its template.

<div class="lightbox">

<img alt="component with no encapsulation" src="generated/images/guide/view-encapsulation/emulated-encapsulation.png">

</div>

#### Shadow DOM encapsulation

The third example shows a component that has `ViewEncapsulation.ShadowDom`.
This component colors its template elements blue.

<code-example header="src/app/shadow-dom-encapsulation.component.ts" path="view-encapsulation/src/app/shadow-dom-encapsulation.component.ts"></code-example>

Angular adds styles for this component only to the shadow DOM host, so they are not visible outside the shadow DOM.

<div class="alert is-helpful">

**NOTE**: <br />
Angular also adds the global styles from the `NoEncapsulationComponent` and `EmulatedEncapsulationComponent` to the shadow DOM host. Those styles are still available to the elements in the template of this component.

</div>

In this example, the `ShadowDomEncapsulationComponent` contains both a `NoEncapsulationComponent` and `EmulatedEncapsulationComponent`.

The styles added by the `ShadowDomEncapsulationComponent` component are available throughout the shadow DOM of this component, and so to both the `NoEncapsulationComponent` and `EmulatedEncapsulationComponent`.

The `EmulatedEncapsulationComponent` has specific "scoped" styles, so the styling of this component's template is unaffected.

Since styles from `ShadowDomEncapsulationComponent` are added to the shadow host after the global styles, the `h2` style overrides the style from the `NoEncapsulationComponent`.
The result is that the `<h2>` element in the `NoEncapsulationComponent` is colored blue rather than red, which may not be what the component's author intended.

<div class="lightbox">

<img alt="component with no encapsulation" src="generated/images/guide/view-encapsulation/shadow-dom-encapsulation.png">

</div>

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2023-04-21
