import {internalView, ProtoViewRef} from './view_ref';
import {ElementRef, ElementRef_} from './element_ref';
import * as viewModule from './view';

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
export abstract class TemplateRef {
  /**
   * The location in the View where the Embedded View logically belongs to.
   *
   * The data-binding and injection contexts of Embedded Views created from this `TemplateRef`
   * inherit from the contexts of this location.
   *
   * Typically new Embedded Views are attached to the View Container of this location, but in
   * advanced use-cases, the View can be attached to a different container while keeping the
   * data-binding and injection context from the original location.
   *
   */
  // TODO(i): rename to anchor or location
  elementRef: ElementRef;

  /**
   * Allows you to check if this Embedded Template defines Local Variable with name matching `name`.
   */
  abstract hasLocal(name: string): boolean;
}

export class TemplateRef_ extends TemplateRef {
  constructor(elementRef: ElementRef) {
    super();
    this.elementRef = elementRef;
  }

  private _getProtoView(): viewModule.AppProtoView {
    let elementRef = <ElementRef_>this.elementRef;
    var parentView = internalView(elementRef.parentView);
    return parentView.proto.elementBinders[elementRef.boundElementIndex - parentView.elementOffset]
        .nestedProtoView;
  }

  /**
   * Reference to the ProtoView used for creating Embedded Views that are based on the compiled
   * Embedded Template.
   */
  get protoViewRef(): ProtoViewRef { return this._getProtoView().ref; }

  hasLocal(name: string): boolean {
    return this._getProtoView().templateVariableBindings.has(name);
  }
}
