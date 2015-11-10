library angular2.src.core.linker.view_ref;

import "package:angular2/src/facade/lang.dart" show isPresent;
import "package:angular2/src/facade/exceptions.dart" show unimplemented;
import "view.dart" as viewModule;
import "../change_detection/change_detector_ref.dart" show ChangeDetectorRef;
import "package:angular2/src/core/render/api.dart"
    show RenderViewRef, RenderFragmentRef;

// This is a workaround for privacy in Dart as we don't have library parts
viewModule.AppView internalView(ViewRef viewRef) {
  return ((viewRef as ViewRef_))._view;
}

// This is a workaround for privacy in Dart as we don't have library parts
viewModule.AppProtoView internalProtoView(ProtoViewRef protoViewRef) {
  return isPresent(protoViewRef)
      ? ((protoViewRef as ProtoViewRef_))._protoView
      : null;
}

/**
 * Represents a View containing a single Element that is the Host Element of a [Component]
 * instance.
 *
 * A Host View is created for every dynamically created Component that was compiled on its own (as
 * opposed to as a part of another Component's Template) via [Compiler#compileInHost] or one
 * of the higher-level APIs: [AppViewManager#createRootHostView],
 * [AppViewManager#createHostViewInContainer], [ViewContainerRef#createHostView].
 */
abstract class HostViewRef {
  /**
   * @internal
   */
  ChangeDetectorRef changeDetectorRef;
}

/**
 * Represents an Angular View.
 *
 * <!-- TODO: move the next two paragraphs to the dev guide -->
 * A View is a fundamental building block of the application UI. It is the smallest grouping of
 * Elements which are created and destroyed together.
 *
 * Properties of elements in a View can change, but the structure (number and order) of elements in
 * a View cannot. Changing the structure of Elements can only be done by inserting, moving or
 * removing nested Views via a [ViewContainer]. Each View can contain many View Containers.
 * <!-- /TODO -->
 *
 * ### Example
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
 * ... we have two [ProtoViewRef]s:
 *
 * Outer [ProtoViewRef]:
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <template ng-for var-item [ng-for-of]="items"></template>
 * </ul>
 * ```
 *
 * Inner [ProtoViewRef]:
 * ```
 *   <li>{{item}}</li>
 * ```
 *
 * Notice that the original template is broken down into two separate [ProtoViewRef]s.
 *
 * The outer/inner [ProtoViewRef]s are then assembled into views like so:
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
abstract class ViewRef implements HostViewRef {
  /**
   * Sets `value` of local variable called `variableName` in this View.
   */
  void setLocal(String variableName, dynamic value);
  ChangeDetectorRef get changeDetectorRef {
    return unimplemented();
  }

  set changeDetectorRef(ChangeDetectorRef value) {
    unimplemented();
  }
}

class ViewRef_ extends ViewRef {
  ChangeDetectorRef _changeDetectorRef = null;
  /** @internal */
  viewModule.AppView _view;
  ViewRef_(viewModule.AppView _view) : super() {
    /* super call moved to initializer */;
    this._view = _view;
  }
  /**
   * Return `RenderViewRef`
   */
  RenderViewRef get render {
    return this._view.render;
  }

  /**
   * Return `RenderFragmentRef`
   */
  RenderFragmentRef get renderFragment {
    return this._view.renderFragment;
  }

  /**
   * Return `ChangeDetectorRef`
   */
  ChangeDetectorRef get changeDetectorRef {
    if (identical(this._changeDetectorRef, null)) {
      this._changeDetectorRef = this._view.changeDetector.ref;
    }
    return this._changeDetectorRef;
  }

  void setLocal(String variableName, dynamic value) {
    this._view.setLocal(variableName, value);
  }
}

/**
 * Represents an Angular ProtoView.
 *
 * A ProtoView is a prototypical [ViewRef View] that is the result of Template compilation and
 * is used by Angular to efficiently create an instance of this View based on the compiled Template.
 *
 * Most ProtoViews are created and used internally by Angular and you don't need to know about them,
 * except in advanced use-cases where you compile components yourself via the low-level
 * [Compiler#compileInHost] API.
 *
 *
 * ### Example
 *
 * Given this template:
 *
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <li *ng-for="var item of items">{{item}}</li>
 * </ul>
 * ```
 *
 * Angular desugars and compiles the template into two ProtoViews:
 *
 * Outer ProtoView:
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <template ng-for var-item [ng-for-of]="items"></template>
 * </ul>
 * ```
 *
 * Inner ProtoView:
 * ```
 *   <li>{{item}}</li>
 * ```
 *
 * Notice that the original template is broken down into two separate ProtoViews.
 */
abstract class ProtoViewRef {}

class ProtoViewRef_ extends ProtoViewRef {
  /** @internal */
  viewModule.AppProtoView _protoView;
  ProtoViewRef_(viewModule.AppProtoView _protoView) : super() {
    /* super call moved to initializer */;
    this._protoView = _protoView;
  }
}
