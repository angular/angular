# View encapsulation

In Angular, component CSS styles are encapsulated into the component's view and don't affect the rest of the application.

To control how this encapsulation happens on a per component basis, you may set the view encapsulation mode in the component metadata.
Choose from the following modes:

*   `ShadowDom` view encapsulation uses the browser's native shadow DOM implementation (see [Shadow DOM][MozillaDeveloperDocsWebWebComponentsShadowDom]) to attach a shadow DOM to the component's host element, and then puts the component view inside that shadow DOM.
    The component's styles are included within the shadow DOM.

*   `Emulated` view encapsulation (the default) emulates the behavior of shadow DOM by preprocessing (and renaming) the CSS code to effectively scope the CSS to the component's view.
    For details, see [Inspecting generated CSS][AioGuideViewEncapsulationInspectingGeneratedCss] below.

*   `None` means that Angular does no view encapsulation.
    Angular adds the CSS to the global styles.
    The scoping rules, isolations, and protections discussed earlier don't apply.
    This mode is essentially the same as pasting the component's styles into the HTML.

To set the component's encapsulation mode, use the `encapsulation` property in the component metadata:

<code-example path="component-styles/src/app/quest-summary.component.ts" region="encapsulation.shadow" header="src/app/quest-summary.component.ts"></code-example>

`ShadowDom` view encapsulation only works on browsers that have native support for shadow DOM (see [Can I use "Shadow DOM v1"?][CaniuseShadowdomv1]).
The support is still limited, which is why `Emulated` view encapsulation is the default mode and recommended in most cases.

## Inspecting generated CSS

{@a inspect-generated-css}

When using emulated view encapsulation, Angular preprocesses all component styles so that they approximate the standard shadow CSS scoping rules.

In the DOM of a running Angular application with emulated view encapsulation enabled, each DOM element has some extra attributes attached to it:

<code-example format="html" language="html">

&lt;hero-details _nghost-pmm-5&gt;
    &lt;h2 _ngcontent-pmm-5&gt;Mister Fantastic&lt;/h2&gt;
    &lt;hero-team _ngcontent-pmm-5 _nghost-pmm-6&gt;
      &lt;h3 _ngcontent-pmm-6&gt;Team&lt;/h3&gt;
    &lt;/hero-team&gt;
&lt;/hero-detail&gt;

</code-example>

There are two kinds of generated attributes:

*   An element that would be a shadow DOM host in native encapsulation has a generated `_nghost` attribute.
    This is typically the case for component host elements.

*   An element within a component's view has a `_ngcontent` attribute that identifies to which host's emulated shadow DOM this element belongs.

The exact values of these attributes aren't important.
They are automatically generated and you should never refer to them in application code. But they are targeted by the generated component styles, which are in the `<head>` section of the DOM:

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

These styles are post-processed so that each selector is augmented with `_nghost` or `_ngcontent` attribute selectors.
These extra selectors enable the scoping rules described in this page.

## Mixing encapsulation modes

Avoid mixing components that use different view encapsulation. Where it is necessary, you should be aware of how the component styles will interact.

*   The styles of components with `ViewEncapsulation.Emulated` are added to the `<head>` of the document, making them available throughout the application, but are "scoped" so they only affect elements within the component's template.

*   The styles of components with `ViewEncapsulation.None` are added to the `<head>` of the document, making them available throughout the application, and are not "scoped" so they affect any element in the application.

*   The styles of components with `ViewEncapsulation.ShadowDom` are only added to the shadow DOM host, ensuring that they only affect elements within the component's template.

**All the styles for `ViewEncapsulation.Emulated` and `ViewEncapsulation.None` components are also added to the shadow DOM host of each `ViewEncapsulation.ShadowDom` component.**

The result is that styling for components with `ViewEncapsulation.None` will affect matching elements within the shadow DOM.

This approach may seem counter-intuitive at first, but without it a component with `ViewEncapsulation.None` could not be used within a component with `ViewEncapsulation.ShadowDom`, since its styles would not be available.

### Examples

This section shows examples of how the styling of components with different `ViewEncapsulation` interact.

See the <live-example noDownload></live-example> to try out these components yourself.

#### No encapsulation

The first example shows a component that has `ViewEncapsulation.None`. This component colors its template elements red.

<code-example path="view-encapsulation/src/app/no-encapsulation.component.ts" header="src/app/no-encapsulation.component.ts"></code-example>>

Angular adds the styles for this component as global styles to the `<head>` of the document.

**Angular also adds the styles to all shadow DOM hosts.** Therefore, the styles are available throughout the application.

<div class="lightbox">

<img src="./generated/images/guide/view-encapsulation/no-encapsulation.png" alt="Component with no encapsulation" title="Component with no encapsulation" />

</div>

#### Emulated encapsulation

The second example shows a component that has `ViewEncapsulation.Emulated`. This component colors its template elements green.

<code-example path="view-encapsulation/src/app/emulated-encapsulation.component.ts" header="src/app/emulated-encapsulation.component.ts"></code-example>>

Similar to `ViewEncapsulation.None`, Angular adds the styles for this component to the `<head>` of the document, and to all the shadow DOM hosts.
But in this case, the styles are "scoped" by the attributes described in [Inspecting generated CSS][AioGuideViewEncapsulationInspectingGeneratedCss].

Therefore, only the elements directly within this component's template will match its styles.
Since the "scoped" styles from the `EmulatedEncapsulationComponent` are very specific, they override the global styles from the `NoEncapsulationComponent`.

In this example, the `EmulatedEncapsulationComponent` contains a `NoEncapsulationComponent`.
The `NoEncapsulationComponent` is styled as expected because the scoped styles do not match elements in its template.

<div class="lightbox">

<img src="./generated/images/guide/view-encapsulation/emulated-encapsulation.png" alt="Component with emulated encapsulation" title="Component with emulated encapsulation" />

</div>

#### Shadow DOM encapsulation

The third example shows a component that has `ViewEncapsulation.ShadowDom`. This component colors its template elements blue.

<code-example path="view-encapsulation/src/app/shadow-dom-encapsulation.component.ts" header="src/app/shadow-dom-encapsulation.component.ts"></code-example>>

Angular adds styles for this component only to the shadow DOM host, so they are not visible outside the shadow DOM.

Note that Angular also adds the global styles from the `NoEncapsulationComponent` and `ViewEncapsulationComponent` to the shadow DOM host, so those styles are still available to the elements in the template of this component.

In this example, the `ShadowDomEncapsulationComponent` contains both a `NoEncapsulationComponent` and `ViewEncapsulationComponent`.

The styles added by the `ShadowDomEncapsulationComponent` component are available throughout the shadow DOM of this component, and so to both the `NoEncapsulationComponent` and `ViewEncapsulationComponent`.

The `EmulatedEncapsulationComponent` has specific "scoped" styles, so the styling of this component's template is unaffected.

But since styles from `ShadowDomEncapsulationComponent` are added to the shadow host after the global styles, the `h2` style overrides the style from the `NoEncapsulationComponent`.
The result is that the `<h2>` element in the `NoEncapsulationComponent` is colored blue rather than red, which may not be what the component author intended.

<div class="lightbox">

<img src="./generated/images/guide/view-encapsulation/shadow-dom-encapsulation.png" alt="Component with no encapsulation" title="Component with no encapsulation" />

</div>

<!-- links -->

[AioGuideViewEncapsulationInspectingGeneratedCss]: guide/view-encapsulation#inspecting-generated-css "Inspecting generated CSS - View encapsulation | Angular"

<!-- external links -->

[CaniuseShadowdomv1]: https://caniuse.com/shadowdomv1 "Shadow DOM (V1) | Can I use"

[MozillaDeveloperDocsWebWebComponentsShadowDom]: https://developer.mozilla.org/docs/Web/Web_Components/Shadow_DOM "Using shadow DOM | MDN Web Docs"

<!-- end links -->

@reviewed 2021-11-02
