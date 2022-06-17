# Transform component to custom element

The Angular framework uses the [`createCustomElement`][AioApiElementsCreatecustomelement] function to convert an Angular component and any associated dependencies to an Angular custom element.
The function collects the observable properties of the component.
The function collect the Angular capabilities the browser needs to create and destroy instances, and to detect and respond to changes.

The conversion process implements the `NgElementConstructor` interface, and creates a constructor class configured to produce a self-bootstrapping instance of your component.

Use the built-in [`customElements.define()`][MdnDocsWebApiCustomelementregistryDefine] function to register the configured constructor and the associated Angular element tag with the [`CustomElementRegistry`][MdnDocsWebApiCustomelementregistry] interface of the browser.
When the browser encounters the tag for the registered element, it uses the constructor to create an instance of the Angular element.

<div class="lightbox">

<img alt="Transform a component to a custom element" class="left" src="generated/images/guide/elements/createElement.png" />

</div>

<div class="alert is-important">

**IMPORTANT**: <br />
Do not use the [`@Component`][AioApiCoreComponent] [selector][AioApiCoreDirectiveSelector] as the name of the custom element tag.
<!--This can lead to unexpected behavior, due to Angular creating the following two instances of the component for a single DOM element.

*    One regular Angular component
*    A second one using the custom element-->

</div>

## Map

An Angular custom element hosts an Angular component.
The component provides a bridge between the data and logic defined in the component and the standard DOM APIs.
Component properties and logic directly map to attributes of the HTML elements and the event system of the browser.

*   The Angular framework uses the creation API to complete the following actions.
    *   Parse the component
    *   Search for input properties
    *   Define associated attributes for the custom element
    *   Transform each property name to make each compatible with each custom element

        <div class="alert is-important">

        **IMPORTANT**: <br />
        The transformation process does not recognize case distinctions.

        </div>

        The resulting attribute names are dash-separated and lowercase.

    In the following code example, the corresponding custom element defines a `my-input-prop` attribute.

    <!-- vale off -->

    <code-example>

    &commat;Input('myInputProp') inputProp

    </code-example>

    <!-- vale on -->

*   A component output is dispatched as a [CustomEvent][MdnDocsWebApiCustomevent] interface.
    The name of the custom event matches the output name.
    In the following example, the Angular custom element outputs `valueChanged` events and stores the emitted data for each event as the value of the `detail` property.

    <!-- vale off -->

    <code-example>

    &commat;Output() valueChanged = new EventEmitter();

    </code-example>

    <!-- vale on -->

    If you provide an alias, that value is used.
    In the following example, the Angular custom element outputs `myClick` events.

    <!-- vale off -->

    <code-example>

    &commat;Output('myClick') clicks = new EventEmitter<string>();

    </code-example>

    <!-- vale on -->


To learn more, see [Creating custom events][MdnDocsWebGuideEventsCreatingAndTriggeringEventsCreatingCustomEvents].
