import {Directive} from 'angular2/annotations';
import {Ancestor} from 'angular2/di';
import {ViewContainerRef, TemplateRef} from 'angular2/core';
import {isPresent, isBlank, normalizeBlank} from 'angular2/src/facade/lang';
import {ListWrapper, List, MapWrapper, Map} from 'angular2/src/facade/collection';

export class SwitchView {
  _viewContainerRef: ViewContainerRef;
  _templateRef: TemplateRef;

  constructor(viewContainerRef: ViewContainerRef, templateRef: TemplateRef) {
    this._templateRef = templateRef;
    this._viewContainerRef = viewContainerRef;
  }

  create() { this._viewContainerRef.createEmbeddedView(this._templateRef); }

  destroy() { this._viewContainerRef.clear(); }
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
 * # Example:
 *
 * ```
 * <ANY [ng-switch]="expression">
 *   <template [ng-switch-when]="whenExpression1">...</template>
 *   <template [ng-switch-when]="whenExpression1">...</template>
 *   <template ng-switch-default>...</template>
 * </ANY>
 * ```
 */
@Directive({selector: '[ng-switch]', properties: ['ngSwitch']})
export class NgSwitch {
  _switchValue: any;
  _useDefault: boolean;
  _valueViews: Map<any, List<SwitchView>>;
  _activeViews: List<SwitchView>;

  constructor() {
    this._valueViews = new Map();
    this._activeViews = [];
    this._useDefault = false;
  }

  set ngSwitch(value) {
    // Empty the currently active ViewContainers
    this._emptyAllActiveViews();

    // Add the ViewContainers matching the value (with a fallback to default)
    this._useDefault = false;
    var views = this._valueViews.get(value);
    if (isBlank(views)) {
      this._useDefault = true;
      views = normalizeBlank(this._valueViews.get(_whenDefault));
    }
    this._activateViews(views);

    this._switchValue = value;
  }

  _onWhenValueChanged(oldWhen, newWhen, view: SwitchView): void {
    this._deregisterView(oldWhen, view);
    this._registerView(newWhen, view);

    if (oldWhen === this._switchValue) {
      view.destroy();
      ListWrapper.remove(this._activeViews, view);
    } else if (newWhen === this._switchValue) {
      if (this._useDefault) {
        this._useDefault = false;
        this._emptyAllActiveViews();
      }
      view.create();
      this._activeViews.push(view);
    }

    // Switch to default when there is no more active ViewContainers
    if (this._activeViews.length === 0 && !this._useDefault) {
      this._useDefault = true;
      this._activateViews(this._valueViews.get(_whenDefault));
    }
  }

  _emptyAllActiveViews(): void {
    var activeContainers = this._activeViews;
    for (var i = 0; i < activeContainers.length; i++) {
      activeContainers[i].destroy();
    }
    this._activeViews = [];
  }

  _activateViews(views: List<SwitchView>): void {
    // TODO(vicb): assert(this._activeViews.length === 0);
    if (isPresent(views)) {
      for (var i = 0; i < views.length; i++) {
        views[i].create();
      }
      this._activeViews = views;
    }
  }

  _registerView(value, view: SwitchView): void {
    var views = this._valueViews.get(value);
    if (isBlank(views)) {
      views = [];
      this._valueViews.set(value, views);
    }
    views.push(view);
  }

  _deregisterView(value, view: SwitchView): void {
    // `_whenDefault` is used a marker for non-registered whens
    if (value == _whenDefault) return;
    var views = this._valueViews.get(value);
    if (views.length == 1) {
      MapWrapper.delete(this._valueViews, value);
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
@Directive({selector: '[ng-switch-when]', properties: ['ngSwitchWhen']})
export class NgSwitchWhen {
  _value: any;
  _switch: NgSwitch;
  _view: SwitchView;

  constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef,
              @Ancestor() sswitch: NgSwitch) {
    // `_whenDefault` is used as a marker for a not yet initialized value
    this._value = _whenDefault;
    this._switch = sswitch;
    this._view = new SwitchView(viewContainer, templateRef);
  }

  onDestroy() { this._switch; }

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
@Directive({selector: '[ng-switch-default]'})
export class NgSwitchDefault {
  constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef,
              @Ancestor() sswitch: NgSwitch) {
    sswitch._registerView(_whenDefault, new SwitchView(viewContainer, templateRef));
  }
}

var _whenDefault = new Object();
