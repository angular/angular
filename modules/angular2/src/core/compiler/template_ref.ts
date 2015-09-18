import {internalView, ProtoViewRef} from './view_ref';
import {ElementRef} from './element_ref';
import * as viewModule from './view';

/**
 * Represents an Embedded Template that can be used for creating Embedded Views.
 *
 * Use {@link ViewContainerRef#createEmbeddedView} method to instantiate an Embedded View and attach
 * it to a View Container.
 *
 * <!-- TODO: how to get hold of it? -->
 */
export class TemplateRef {

  /**
   * The location in the View where the Embedded View logically belong to.
   *
   * This `ElementRef` provides the data-binding and injection context for Embedded Views created
   * from this `TemplateRef`.
   */
  elementRef: ElementRef;

  /**
   * @private
   */
  constructor(elementRef: ElementRef) { this.elementRef = elementRef; }

  private _getProtoView(): viewModule.AppProtoView {
    var parentView = internalView(this.elementRef.parentView);
    return parentView.proto
        .elementBinders[this.elementRef.boundElementIndex - parentView.elementOffset]
        .nestedProtoView;
  }

  /**
   * Reference to the ProtoView created by compiling the original Embedded Template, from which the
   * Embedded View is instatiated.
   */
  get protoViewRef(): ProtoViewRef { return this._getProtoView().ref; }

  /**
   * Returns true if the Template declares a Local Variable with the given name.
   */
  hasLocal(name: string): boolean { return this._getProtoView().variableBindings.has(name); }
}
