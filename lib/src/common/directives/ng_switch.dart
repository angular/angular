library angular2.src.common.directives.ng_switch;

import "package:angular2/src/core/metadata.dart" show Directive;
import "package:angular2/src/core/di.dart" show Host;
import "package:angular2/src/core/linker.dart"
    show ViewContainerRef, TemplateRef;
import "package:angular2/src/facade/lang.dart" show isPresent, isBlank;
import "package:angular2/src/facade/collection.dart" show ListWrapper, Map;

const _WHEN_DEFAULT = const Object();

class SwitchView {
  ViewContainerRef _viewContainerRef;
  TemplateRef _templateRef;
  SwitchView(this._viewContainerRef, this._templateRef) {}
  void create() {
    this._viewContainerRef.createEmbeddedView(this._templateRef);
  }

  void destroy() {
    this._viewContainerRef.clear();
  }
}

/**
 * The `NgSwitch` directive is used to conditionally swap DOM structure on your template based on a
 * scope expression.
 * Elements within `NgSwitch` but without `NgSwitchWhen` or `NgSwitchDefault` directives will be
 * preserved at the location as specified in the template.
 *
 * `NgSwitch` simply chooses nested elements and makes them visible based on which element matches
 * the value obtained from the evaluated expression. In other words, you define a container element
 * (where you place the directive), place an expression on the **`[ng-switch]="..."` attribute**),
 * define any inner elements inside of the directive and place a `[ng-switch-when]` attribute per
 * element.
 * The when attribute is used to inform NgSwitch which element to display when the expression is
 * evaluated. If a matching expression is not found via a when attribute then an element with the
 * default attribute is displayed.
 *
 * ### Example
 *
 * ```
 * <ANY [ng-switch]="expression">
 *   <template [ng-switch-when]="whenExpression1">...</template>
 *   <template [ng-switch-when]="whenExpression1">...</template>
 *   <template ng-switch-default>...</template>
 * </ANY>
 * ```
 */
@Directive(selector: "[ng-switch]", inputs: const ["ngSwitch"])
class NgSwitch {
  dynamic _switchValue;
  bool _useDefault = false;
  var _valueViews = new Map<dynamic, List<SwitchView>>();
  List<SwitchView> _activeViews = [];
  set ngSwitch(value) {
    // Empty the currently active ViewContainers
    this._emptyAllActiveViews();
    // Add the ViewContainers matching the value (with a fallback to default)
    this._useDefault = false;
    var views = this._valueViews[value];
    if (isBlank(views)) {
      this._useDefault = true;
      views = this._valueViews[_WHEN_DEFAULT];
    }
    this._activateViews(views);
    this._switchValue = value;
  }

  /** @internal */
  void _onWhenValueChanged(oldWhen, newWhen, SwitchView view) {
    this._deregisterView(oldWhen, view);
    this._registerView(newWhen, view);
    if (identical(oldWhen, this._switchValue)) {
      view.destroy();
      ListWrapper.remove(this._activeViews, view);
    } else if (identical(newWhen, this._switchValue)) {
      if (this._useDefault) {
        this._useDefault = false;
        this._emptyAllActiveViews();
      }
      view.create();
      this._activeViews.add(view);
    }
    // Switch to default when there is no more active ViewContainers
    if (identical(this._activeViews.length, 0) && !this._useDefault) {
      this._useDefault = true;
      this._activateViews(this._valueViews[_WHEN_DEFAULT]);
    }
  }

  /** @internal */
  void _emptyAllActiveViews() {
    var activeContainers = this._activeViews;
    for (var i = 0; i < activeContainers.length; i++) {
      activeContainers[i].destroy();
    }
    this._activeViews = [];
  }

  /** @internal */
  void _activateViews(List<SwitchView> views) {
    // TODO(vicb): assert(this._activeViews.length === 0);
    if (isPresent(views)) {
      for (var i = 0; i < views.length; i++) {
        views[i].create();
      }
      this._activeViews = views;
    }
  }

  /** @internal */
  void _registerView(value, SwitchView view) {
    var views = this._valueViews[value];
    if (isBlank(views)) {
      views = [];
      this._valueViews[value] = views;
    }
    views.add(view);
  }

  /** @internal */
  void _deregisterView(value, SwitchView view) {
    // `_WHEN_DEFAULT` is used a marker for non-registered whens
    if (identical(value, _WHEN_DEFAULT)) return;
    var views = this._valueViews[value];
    if (views.length == 1) {
      (this._valueViews.containsKey(value) &&
          (this._valueViews.remove(value) != null || true));
    } else {
      ListWrapper.remove(views, view);
    }
  }
}

/**
 * Defines a case statement as an expression.
 *
 * If multiple `NgSwitchWhen` match the `NgSwitch` value, all of them are displayed.
 *
 * Example:
 *
 * ```
 * // match against a context variable
 * <template [ng-switch-when]="contextVariable">...</template>
 *
 * // match against a constant string
 * <template ng-switch-when="stringValue">...</template>
 * ```
 */
@Directive(selector: "[ng-switch-when]", inputs: const ["ngSwitchWhen"])
class NgSwitchWhen {
  NgSwitch _switch;
  // `_WHEN_DEFAULT` is used as a marker for a not yet initialized value

  /** @internal */
  dynamic _value = _WHEN_DEFAULT;
  /** @internal */
  SwitchView _view;
  NgSwitchWhen(ViewContainerRef viewContainer, TemplateRef templateRef,
      @Host() this._switch) {
    this._view = new SwitchView(viewContainer, templateRef);
  }
  set ngSwitchWhen(value) {
    this._switch._onWhenValueChanged(this._value, value, this._view);
    this._value = value;
  }
}

/**
 * Defines a default case statement.
 *
 * Default case statements are displayed when no `NgSwitchWhen` match the `ng-switch` value.
 *
 * Example:
 *
 * ```
 * <template ng-switch-default>...</template>
 * ```
 */
@Directive(selector: "[ng-switch-default]")
class NgSwitchDefault {
  NgSwitchDefault(ViewContainerRef viewContainer, TemplateRef templateRef,
      @Host() NgSwitch sswitch) {
    sswitch._registerView(
        _WHEN_DEFAULT, new SwitchView(viewContainer, templateRef));
  }
}
