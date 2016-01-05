library angular2.src.core.linker.view_ref;

import "package:angular2/src/facade/exceptions.dart" show unimplemented;
import "../change_detection/change_detector_ref.dart" show ChangeDetectorRef;
import "view.dart" show AppView, HostViewFactory;

abstract class ViewRef {
  /**
   * @internal
   */
  ChangeDetectorRef get changeDetectorRef {
    return unimplemented();
  }

  bool get destroyed {
    return unimplemented();
  }
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
abstract class HostViewRef extends ViewRef {
  List<dynamic> get rootNodes {
    return unimplemented();
  }
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
 * removing nested Views via a [ViewContainerRef]. Each View can contain many View Containers.
 * <!-- /TODO -->
 *
 * ### Example
 *
 * Given this template...
 *
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <li *ngFor="var item of items">{{item}}</li>
 * </ul>
 * ```
 *
 * ... we have two [ProtoViewRef]s:
 *
 * Outer [ProtoViewRef]:
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <template ngFor var-item [ngForOf]="items"></template>
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
abstract class EmbeddedViewRef extends ViewRef {
  /**
   * Sets `value` of local variable called `variableName` in this View.
   */
  void setLocal(String variableName, dynamic value);
  /**
   * Checks whether this view has a local variable called `variableName`.
   */
  bool hasLocal(String variableName);
  List<dynamic> get rootNodes {
    return unimplemented();
  }
}

class ViewRef_ implements EmbeddedViewRef, HostViewRef {
  AppView _view;
  ViewRef_(this._view) {
    this._view = _view;
  }
  AppView get internalView {
    return this._view;
  }

  /**
   * Return `ChangeDetectorRef`
   */
  ChangeDetectorRef get changeDetectorRef {
    return this._view.changeDetector.ref;
  }

  List<dynamic> get rootNodes {
    return this._view.flatRootNodes;
  }

  void setLocal(String variableName, dynamic value) {
    this._view.setLocal(variableName, value);
  }

  bool hasLocal(String variableName) {
    return this._view.hasLocal(variableName);
  }

  bool get destroyed {
    return this._view.destroyed;
  }
}

abstract class HostViewFactoryRef {}

class HostViewFactoryRef_ implements HostViewFactoryRef {
  HostViewFactory _hostViewFactory;
  HostViewFactoryRef_(this._hostViewFactory) {}
  HostViewFactory get internalHostViewFactory {
    return this._hostViewFactory;
  }
}
