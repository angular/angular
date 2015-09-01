import {Directive} from 'angular2/metadata';
import {Host} from 'angular2/di';
import {ViewContainerRef, TemplateRef} from 'angular2/core';
import {isPresent, isBlank, normalizeBlank, CONST_EXPR} from 'angular2/src/core/facade/lang';
import {ListWrapper, Map} from 'angular2/src/core/facade/collection';

const _WHEN_DEFAULT = CONST_EXPR(new Object());

export class SwitchView {
  constructor(private _viewContainerRef: ViewContainerRef, private _templateRef: TemplateRef) {}

  create(): void { this._viewContainerRef.createEmbeddedView(this._templateRef); }

  destroy(): void { this._viewContainerRef.clear(); }
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
  private _switchValue: any;
  private _useDefault: boolean = false;
  private _valueViews: Map<any, SwitchView[]> = new Map();
  private _activeViews: SwitchView[] = [];

  set ngSwitch(value) {
    // Empty the currently active ViewContainers
    this._emptyAllActiveViews();

    // Add the ViewContainers matching the value (with a fallback to default)
    this._useDefault = false;
    var views = this._valueViews.get(value);
    if (isBlank(views)) {
      this._useDefault = true;
      views = normalizeBlank(this._valueViews.get(_WHEN_DEFAULT));
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
      this._activateViews(this._valueViews.get(_WHEN_DEFAULT));
    }
  }

  _emptyAllActiveViews(): void {
    var activeContainers = this._activeViews;
    for (var i = 0; i < activeContainers.length; i++) {
      activeContainers[i].destroy();
    }
    this._activeViews = [];
  }

  _activateViews(views: SwitchView[]): void {
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
    // `_WHEN_DEFAULT` is used a marker for non-registered whens
    if (value === _WHEN_DEFAULT) return;
    var views = this._valueViews.get(value);
    if (views.length == 1) {
      this._valueViews.delete(value);
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
  // `_WHEN_DEFAULT` is used as a marker for a not yet initialized value
  _value: any = _WHEN_DEFAULT;
  _view: SwitchView;

  constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef,
              @Host() private _switch: NgSwitch) {
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
@Directive({selector: '[ng-switch-default]'})
export class NgSwitchDefault {
  constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef,
              @Host() sswitch: NgSwitch) {
    sswitch._registerView(_WHEN_DEFAULT, new SwitchView(viewContainer, templateRef));
  }
}
