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
 * Represents the View of a {@link Component} that was compiled via {@link Compiler#compileInHost
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
 * A ProtoView is a prototypical View that is the result of Template compilation and enables
 * Angular to efficiently create an instance of a View based on the compiled Template.
 *
 * A ProtoView is created {@link AppViewManager#createViewInContainer} and
 * {@link AppViewManager#createRootHostView `AppViewManager#createRootHostView`}).
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
