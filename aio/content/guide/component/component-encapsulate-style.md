# Encapsulate style in a view

In Angular, you are able to restrict style definitions to a specific component.
The association of style with a single component encapsulates the style in the associated view.

The decorator of the `component` provides the [`encapsulation`](api/core/Component#encapsulation) option which can be used to control how the encapsulation is applied on a *per component* basis.

Choose from the following modes:

| Modes                         | Details |
|:---                           |:---     |
| `ViewEncapsulation.ShadowDom` | Angular uses the built-in [Shadow DOM API](https://developer.mozilla.org/docs/Web/Web_Components/Shadow_DOM) of the browser to enclose the view of the component inside a ShadowRoot \(used as the host element of the component\) and apply the provided styles in an isolated manner.                   |
| `ViewEncapsulation.Emulated`  | Angular modifies the CSS selectors of the component so that they are only applied to the view of the component and do not affect other elements in the application \(*emulating* Shadow DOM behavior\). To learn more, see [Inspecting generated CSS](guide/component/component-encapsulate-style#inspect-generated-css). |
| `ViewEncapsulation.None`      | Angular does not apply any sort of view encapsulation meaning that any styles specified for the component are actually globally applied and can affect any HTML element present within the application. This mode is essentially the same as including the styles into the HTML itself.                   |

<div class="alert is-important">

**IMPORTANT**: <br />
`ViewEncapsulation.ShadowDom` only works on browsers that have built-in support for the shadow DOM \(see [Can I use - Shadow DOM v1](https://caniuse.com/shadowdomv1)\).
Not all browsers support it, which is why the `ViewEncapsulation.Emulated` is the recommended and default mode.

</div>

## Inspect generated CSS

When using the emulated view encapsulation, Angular pre-processes all the styles of the component so that they are only applied to the view of the component.

In the DOM of a running Angular application, elements belonging to components using emulated view encapsulation have some extra attributes attached to them:

<code-example format="html" header="Emulated view encapsulation" language="html">

&lt;hero-details _nghost-pmm-5&gt;
  &lt;h2 _ngcontent-pmm-5&gt;
    Mister Fantastic
  &lt;/h2&gt;
  &lt;hero-team _ngcontent-pmm-5 _nghost-pmm-6&gt;
    &lt;h3 _ngcontent-pmm-6&gt;
      Team
    &lt;/h3&gt;
  &lt;/hero-team&gt;
&lt;/hero-detail&gt;

</code-example>

There are two kinds of such attributes:

| Attributes   | Details |
|:---          |:---     |
| `_ngcontent` | Added to child element within the view of a component, those are used to match the elements with their respective emulated ShadowRoots \(host elements with a matching `_nghost` attribute\). |
| `_nghost`    | Added to elements that enclose the view of a component and that would be ShadowRoots in a native Shadow DOM encapsulation. This is typically the case for host elements of the components.|

The exact values of these attributes are a private implementation detail of Angular.
They are automatically generated and you should never refer to them in application code.

They are targeted by the generated component styles, which are injected in the `<head>` section of the DOM:

<code-example format="css" header="Emulated view encapsulation" language="css">

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
These modified selectors make sure the styles to be applied to the views of the components in an isolated and targeted fashion.

## Mix encapsulation modes

As previously mentioned, you specify the encapsulation mode in the decorator of the component on a *per component* basis.
This means that within your application, you are able to have different components using different encapsulation strategies.

Although possible, this is not recommended.
If it is really needed you should be aware of how the styles of components using different encapsulation modes will interact with each other:

| Modes                         | Details |
|:---                           |:---     |
| `ViewEncapsulation.Emulated`  | The style is added to the `head` element of the document. The style is available throughout the application, but the selector only affect elements in the template of the associated component. |
| `ViewEncapsulation.None`      | The style is added to the `head` element of the document. The style is available throughout the application. The styles is completely global and affects any matching elements it.              |
| `ViewEncapsulation.ShadowDom` | The style is only added to the shadow DOM host. The style only affects elements within the view of the associated component.                                                                    |

<div class="alert is-helpful">

A style for a component using the `ViewEncapsulation.Emulated` or `ViewEncapsulation.None` mode is also added to the shadow DOM host of each component using the `ViewEncapsulation.ShadowDom` mode.

This means that a style for a component using the `ViewEncapsulation.None` mode affects matching elements within the shadow DOM.

</div>

### No encapsulation

This component colors the elements in the template red.

<code-example format="typescript" header="Set color to red" language="typescript">

&commat;Component({
  selector: '{name-of-css-selector}',
  template: &grave;
    &lt;h2&gt;Heading 2&lt;/h2&gt;
    &lt;div class="none-message"&gt;No encapsulation&lt;/div&lt;
  &grave;,
  styles: ['h2, .none-message { color: red; }'],
  encapsulation: ViewEncapsulation.None,
})
export class &lcub;NameOfComponent&rcub;Component { }

</code-example>

Angular adds the styles of the component as global styles to the `head` element of the document.

Angular also adds the styles to all shadow DOM hosts, so the styles are available to the entore application.

<div class="lightbox">

<img alt="component with no encapsulation" src="generated/images/guide/view-encapsulation/no-encapsulation.png">

</div>

### Emulated encapsulation

The second example shows a component that has `ViewEncapsulation.Emulated`.
This component colors its template elements green.

<code-example path="view-encapsulation/src/app/emulated-encapsulation.component.ts" header="src/app/emulated-encapsulation.component.ts"></code-example>

Similar to `ViewEncapsulation.None`, Angular adds the styles for this component to the `head` element of the document, but with "scoped" styles.

Therefore, only the elements directly within the template of this component will match its styles.
Since the "scoped" styles from the `EmulatedEncapsulationComponent` are very specific, they override the global styles from the `NoEncapsulationComponent`.

In this example, the `EmulatedEncapsulationComponent` contains a `NoEncapsulationComponent`, but `NoEncapsulationComponent` is still styled as expected since the "scoped" styles of the `EmulatedEncapsulationComponent` do not match elements in its template.

<div class="lightbox">

<img alt="component with no encapsulation" src="generated/images/guide/view-encapsulation/emulated-encapsulation.png">

</div>

### Shadow DOM encapsulation

The third example shows a component that has `ViewEncapsulation.ShadowDom`
This component colors its template elements blue.

<code-example path="view-encapsulation/src/app/shadow-dom-encapsulation.component.ts" header="src/app/shadow-dom-encapsulation.component.ts"></code-example>

Angular adds styles for this component only to the shadow DOM host, so they are not visible outside the shadow DOM.

Note that Angular also adds the global styles from the `NoEncapsulationComponent` and `EmulatedEncapsulationComponent` to the shadow DOM host, so those styles are still available to the elements in the template of this component.

In this example, the `ShadowDomEncapsulationComponent` contains both a `NoEncapsulationComponent` and `EmulatedEncapsulationComponent`.

The styles added by the `ShadowDomEncapsulationComponent` component are available throughout the shadow DOM of this component, and so to both the `NoEncapsulationComponent` and `EmulatedEncapsulationComponent`.

The `EmulatedEncapsulationComponent` has specific "scoped" styles, so the styling of the template of this component is unaffected.

But since styles from `ShadowDomEncapsulationComponent` are added to the shadow host after the global styles, the `h2` style overrides the style from the `NoEncapsulationComponent`.
The result is that the `h2` element in the `NoEncapsulationComponent` is colored blue rather than red, which may not be what the author of the component intended.

<div class="lightbox">

<img alt="component with no encapsulation" src="generated/images/guide/view-encapsulation/shadow-dom-encapsulation.png">

</div>

<!-- links -->

<!--external links -->

<!-- end links -->

@reviewed 2022-04-13
