import { internalView } from './view_ref';
/**
 * Represents an Embedded Template that can be used to instantiate Embedded Views.
 *
 * You can access a `TemplateRef`, in two ways. Via a directive placed on a `<template>` element (or
 * directive prefixed with `*`) and have the `TemplateRef` for this Embedded View injected into the
 * constructor of the directive using the `TemplateRef` Token. Alternatively you can query for the
 * `TemplateRef` from a Component or a Directive via {@link Query}.
 *
 * To instantiate Embedded Views based on a Template, use
 * {@link ViewContainerRef#createEmbeddedView}, which will create the View and attach it to the
 * View Container.
 */
export class TemplateRef {
}
export class TemplateRef_ extends TemplateRef {
    constructor(elementRef) {
        super();
        this.elementRef = elementRef;
    }
    _getProtoView() {
        let elementRef = this.elementRef;
        var parentView = internalView(elementRef.parentView);
        return parentView.proto.elementBinders[elementRef.boundElementIndex - parentView.elementOffset]
            .nestedProtoView;
    }
    /**
     * Reference to the ProtoView used for creating Embedded Views that are based on the compiled
     * Embedded Template.
     */
    get protoViewRef() { return this._getProtoView().ref; }
    hasLocal(name) {
        return this._getProtoView().templateVariableBindings.has(name);
    }
}
//# sourceMappingURL=template_ref.js.map