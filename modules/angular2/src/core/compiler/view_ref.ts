import {isPresent} from 'angular2/src/core/facade/lang';
import * as viewModule from './view';
import {RenderViewRef, RenderFragmentRef} from 'angular2/src/core/render/api';

// This is a workaround for privacy in Dart as we don't have library parts
export function internalView(viewRef: ViewRef): viewModule.AppView {
  return viewRef._view;
}

// This is a workaround for privacy in Dart as we don't have library parts
export function internalProtoView(protoViewRef: ProtoViewRef): viewModule.AppProtoView {
  return isPresent(protoViewRef) ? protoViewRef._protoView : null;
}


/**
 * Represents a View containing a single Element that is the Host Element of a {@link Component}
 * instance.
 *
 * A Host View is created for every entry-point Component that was compiled on its own (as opposed
 * to as a part of another Component's Template) via {@link Compiler#compileInHost} or one of the
 * higher-level APIs: {@link AppViewManager#createRootHostView},
 * {@link AppViewManager#createHostViewInContainer}, {@link ViewContainerRef#createHostView}.
 */
export interface HostViewRef {}

/**
 * Represents an Angular View.
 *
 * <!-- TODO: move the next two paragraphs to the dev guide -->
 * A View is a fundamental building block of the application UI. It is the smallest grouping of
 * Elements which are created and destroyed together.
 *
 * Properties of elements in a View can change, but the structure (number and order) of elements in
 * a View cannot. Changing the structure of elements can only be done by inserting, moving or
 * removing nested Views via a View Container. Each View can contain many View Containers.
 * <!-- /TODO -->
 *
 * ## Example
 *
 * Given this template...
 *
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <li *ng-for="var item of items">{{item}}</li>
 * </ul>
 * ```
 *
 * ... we have two {@link ProtoViewRef}s:
 *
 * Outer {@link ProtoViewRef}:
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <template ng-for var-item [ng-for-of]="items"></template>
 * </ul>
 * ```
 *
 * Inner {@link ProtoViewRef}:
 * ```
 *   <li>{{item}}</li>
 * ```
 *
 * Notice that the original template is broken down into two separate {@link ProtoViewRef}s.
 *
 * The outer/inner {@link ProtoViewRef}s are then assembled into views like so:
 *
 * ```
 * <!-- ViewRef: outer-0 -->
 * Count: 2
 * <ul>
 *   <template view-container-ref></template>
 *   <!-- ViewRef: inner-1 --><li>first</li><!-- /ViewRef: inner-1 -->
 *   <!-- ViewRef: inner-2 --><li>second</li><!-- /ViewRef: inner-2 -->
 * </ul>
 * <!-- /ViewRef: outer-0 -->
 * ```
 */
export class ViewRef implements HostViewRef {
  /**
   * @private
   */
  constructor(public _view: viewModule.AppView) {}

  /**
   * Return `RenderViewRef`
   */
  get render(): RenderViewRef { return this._view.render; }

  /**
   * Return `RenderFragmentRef`
   */
  get renderFragment(): RenderFragmentRef { return this._view.renderFragment; }

  /**
   * Set local variable in a view.
   *
   * - `contextName` - Name of the local variable in a view.
   * - `value` - Value for the local variable in a view.
   */
  setLocal(contextName: string, value: any): void { this._view.setLocal(contextName, value); }
}

/**
 * Represents Angular's ProtoView.
 *
 * A ProtoView is a prototypical View that is the result of Template compilation and is used by
 * Angular to efficiently create an instance of a View based on the compiled Template.
 *
 * Most ProtoViews are created internally by Angular as a result of recursive Template compilation
 * that was started by a low-level {@link Compiler#compileInHost} API to compile a Component.
 *
 *
 * ## Example
 *
 * Given this template
 *
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <li *ng-for="var item of items">{{item}}</li>
 * </ul>
 * ```
 *
 * The above example we have two {@link ProtoViewRef}s:
 *
 * Outer {@link ProtoViewRef}:
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <template ng-for var-item [ng-for-of]="items"></template>
 * </ul>
 * ```
 *
 * Inner {@link ProtoViewRef}:
 * ```
 *   <li>{{item}}</li>
 * ```
 *
 * Notice that the original template is broken down into two separate {@link ProtoViewRef}s.
 */
export class ProtoViewRef {
  /**
   * @private
   */
  constructor(public _protoView: viewModule.AppProtoView) {}
}
