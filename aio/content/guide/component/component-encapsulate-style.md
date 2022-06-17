# Encapsulate style in a view

In Angular, you are able to restrict style definitions to a specific component.
The association of style with a single component encapsulates the style in the associated view.

The decorator of the `component` provides the [`encapsulation`][AioApiCoreComponentEncapsulation] option which can be used to control how the encapsulation is applied on a *per component* basis.

Choose from the following modes:

| Mode                         | Details |
|:---                           |:---     |
| `ViewEncapsulation.ShadowDom` | The Angular framework uses the built-in [Shadow DOM API][MdnDocsWebWebComponentsShadowDom] of the browser to enclose the view of the component inside a ShadowRoot \(used as the host element of the component\) and apply the provided styles in an isolated manner.                   |
| `ViewEncapsulation.Emulated`  | Angular modifies the CSS selectors of the component, so that each only applies to the view of the component and do not affect other elements in the application \(to emulate Shadow DOM behavior\). To learn more, see [Inspect auto-created CSS][AioGuideComponentEncapsulateStyleInspectAutoCreatedCss]. |
| `ViewEncapsulation.None`      | Angular does not apply any sort of view encapsulation meaning that any styles specified for the component are actually globally applied and can affect any HTML element present within the application. This mode is essentially the same as including the styles into the HTML.                   |

<div class="alert is-important">

**IMPORTANT**: <br />
`ViewEncapsulation.ShadowDom` only works on browsers that have built-in support for the shadow DOM.
To learn more about browsers that support the shadow DOM, see [Shadow DOM (V1)][CaniuseShadowdomv1].
Not all browsers support it, which is why the `ViewEncapsulation.Emulated` is the recommended and default mode.

</div>

## Inspect auto-created CSS

When you use emulated view encapsulation, the Angular framework pre-processes all the styles of the component so that each are only applied to the view of the component.

In running Angular application, an element that belongs to a component that uses emulated view encapsulation has extra attributes in the rendered DOM stucture.

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

A component that uses emulated view encapsulation includes the following two kinds of attributes.

| Attribute        | Details |
|:---              |:---     |
| `_ngcontent-...` | Added to child element within the view of a component, the elements that are used to match the elements with the associated emulated ShadowRoots. Emulated ShadowRoots are host elements with a matching `_nghost-...` attribute. |
| `_nghost-...`    | Added to elements that enclose the view of a component and are ShadowRoots in a native Shadow DOM encapsulation. ShadowRoots in a native Shadow DOM encapsulation are typically the case for host elements of the components.     |

The exact values of the attributes are a private implementation detail of the Angular framework.
The attributes are automatically created and you should never reference any in your application code.

The attributes are targeted by the created component styles, which are injected in the `<head>` section of the rendered DOM structure.

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

The styles are post-processed, so that each CSS selector is augmented with the appropriate `_nghost` or `_ngcontent` attribute.
Each modified CSS selector ensures that the styles applied to the views of each component are in an isolated and targeted fashion.

## Mix encapsulation modes

You specify the encapsulation mode in the decorator of the component on a *per component* basis.
While you are able to have different components using different encapsulation strategies, you should avoid mixing strategies.

The following table shows you how the styles of a component that uses one encapsulation mode interacts with a component that uses another encapsulation mode.

| Mode                         | Details |
|:---                           |:---     |
| `ViewEncapsulation.Emulated`  | The style is added to the `head` element of the rendered DOM structure. The style is available throughout the application, but the selector only affect elements in the template of the associated component. |
| `ViewEncapsulation.None`      | The style is added to the `head` element of the rendered DOM structure. The style is available throughout the application. The styles is completely global and affects any matching elements it.              |
| `ViewEncapsulation.ShadowDom` | The style is only added to the shadow DOM host. The style only affects elements within the view of the associated component.                                                                    |

<div class="alert is-helpful">

A style for a component that uses the `ViewEncapsulation.Emulated` or `ViewEncapsulation.None` mode is also added to the shadow DOM host of each component that uses the `ViewEncapsulation.ShadowDom` mode.

A style for a component that uses the `ViewEncapsulation.None` mode affects matching elements in the shadow DOM.

</div>

### No encapsulation

The component changes the color of the associated element to red in the rendered DOM structure.

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

Angular adds the styles of the component as global styles to the `head` element of the rendered DOM structure.

Angular also adds the styles to all shadow DOM hosts, so the styles are available to the entire application.

<div class="lightbox">

<img alt="component with no encapsulation" src="generated/images/guide/view-encapsulation/no-encapsulation.png">

</div>

### Emulated encapsulation

The second example shows a component that has `ViewEncapsulation.Emulated`.
The component changes the color of the associated element to green in the rendered DOM structure.

<code-example path="view-encapsulation/src/app/emulated-encapsulation.component.ts" header="src/app/emulated-encapsulation.component.ts"></code-example>

The `ViewEncapsulation.Emulated` and `ViewEncapsulation.None` are similar, the Angular framework adds the styles for the component to the `head` element of the rendered DOM structure, but with "scoped" styles.

Only the elements directly within the template of the associated component match the styles.
Since the "scoped" styles from the `EmulatedEncapsulationComponent` are highly specific, the styles override the global styles from the `NoEncapsulationComponent`.

In this example, the `EmulatedEncapsulationComponent` contains a `NoEncapsulationComponent`, but `NoEncapsulationComponent` is still styled as expected since the "scoped" styles of the `EmulatedEncapsulationComponent` do not match elements in the associated template.

<div class="lightbox">

<img alt="component with no encapsulation" src="generated/images/guide/view-encapsulation/emulated-encapsulation.png">

</div>

### Shadow DOM encapsulation

The third example shows a component that has `ViewEncapsulation.ShadowDom`.
The component changes the color of associated element to blue in the rendered DOM structure.

<code-example path="view-encapsulation/src/app/shadow-dom-encapsulation.component.ts" header="src/app/shadow-dom-encapsulation.component.ts"></code-example>

Angular adds styles for the component only to the shadow DOM host, so the styles are not visible outside the shadow DOM.

Note that Angular also adds the global styles from the `NoEncapsulationComponent` and `EmulatedEncapsulationComponent` to the shadow DOM host, so those styles are still available to the elements in the template of this component.

In this example, the `ShadowDomEncapsulationComponent` contains both a `NoEncapsulationComponent` and `EmulatedEncapsulationComponent`.

The styles added by the `ShadowDomEncapsulationComponent` component are available throughout the shadow DOM of this component, and so to both the `NoEncapsulationComponent` and `EmulatedEncapsulationComponent`.

The `EmulatedEncapsulationComponent` has specific "scoped" styles, so the styling of the template of this component is unaffected.

Since styles from `ShadowDomEncapsulationComponent` are added to the shadow host after the global styles, the `h2` style overrides the style from the `NoEncapsulationComponent`.
The result is that the `h2` element in the `NoEncapsulationComponent` is colored blue rather than red, which may not be what the author of the component intended.

<div class="lightbox">

<img alt="component with no encapsulation" src="generated/images/guide/view-encapsulation/shadow-dom-encapsulation.png">

</div>

<!-- links -->

[AioApiCoreComponentEncapsulation]: api/core/Component#encapsulation

<!-- "encapsulation - Component | @angular/core - API | Angular" -->

[AioGuideComponentEncapsulateStyleInspectAutoCreatedCss]: guide/component/component-encapsulate-style#inspect-auto-created-css

<!-- "Inspect auto-created CSS - Encapsulate style in a view | Angular" -->

<!--external links -->

[CaniuseShadowdomv1]: https://caniuse.com/shadowdomv1

<!-- "Shadow DOM (V1) | Can I use..." -->

[MdnDocsWebWebComponentsShadowDom]: https://developer.mozilla.org/docs/Web/Web_Components/Shadow_DOM

<!-- "Using shadow DOM | MDN" -->

<!-- end links -->

@reviewed 2022-04-13
