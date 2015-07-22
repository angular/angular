import {internalView, ProtoViewRef} from './view_ref';
import {ElementRef} from './element_ref';
import * as viewModule from './view';

/**
 * Reference to a template within a component.
 *
 * Represents an opaque reference to the underlying template that can
 * be instantiated using the {@link ViewContainerRef}.
 */
export class TemplateRef {
  /**
   * The location of the template
   */
  elementRef: ElementRef;

  constructor(elementRef: ElementRef) { this.elementRef = elementRef; }

  private _getProtoView(): viewModule.AppProtoView {
    var parentView = internalView(this.elementRef.parentView);
    return parentView.proto
        .elementBinders[this.elementRef.boundElementIndex - parentView.elementOffset]
        .nestedProtoView;
  }

  get protoViewRef(): ProtoViewRef { return this._getProtoView().ref; }

  /**
   * Whether this template has a local variable with the given name
   */
  hasLocal(name: string): boolean { return this._getProtoView().variableBindings.has(name); }
}
