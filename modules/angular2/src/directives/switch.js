import {Decorator, Viewport} from 'angular2/src/core/annotations/annotations';
import {ViewContainer} from 'angular2/src/core/compiler/view_container';
import {isPresent, isBlank, normalizeBlank} from 'angular2/src/facade/lang';
import {ListWrapper, List, MapWrapper, Map} from 'angular2/src/facade/collection';
import {Parent} from 'angular2/src/core/annotations/visibility';

/**
 * The `Switch` directive is used to conditionally swap DOM structure on your template based on a
 * scope expression.
 * Elements within `Switch` but without `SwitchWhen` or `SwitchDefault` directives will be
 * preserved at the location as specified in the template.
 *
 * `Switch` simply chooses nested elements and makes them visible based on which element matches
 * the value obtained from the evaluated expression. In other words, you define a container element
 * (where you place the directive), place an expression on the **`[switch]="..."` attribute**),
 * define any inner elements inside of the directive and place a `[switch-when]` attribute per
 * element.
 * The when attribute is used to inform Switch which element to display when the expression is
 * evaluated. If a matching expression is not found via a when attribute then an element with the
 * default attribute is displayed.
 *
 * # Example:
 *
 * ```
 * <ANY [switch]="expression">
 *   <template [switch-when]="whenExpression1">...</template>
 *   <template [switch-when]="whenExpression1">...</template>
 *   <template [switch-default]>...</template>
 * </ANY>
 * ```
 *
 * @exportedAs angular2/directives
 */
@Decorator({
  selector: '[switch]',
  properties: {
    'value': 'switch'
  }
})
export class Switch {
  _switchValue: any;
  _useDefault: boolean;
  _valueViewContainers: Map;
  _activeViewContainers: List<ViewContainer>;

  constructor() {
    this._valueViewContainers = MapWrapper.create();
    this._activeViewContainers = ListWrapper.create();
    this._useDefault = false;
  }

  set value(value) {
    // Empty the currently active ViewContainers
    this._emptyAllActiveViewContainers();

    // Add the ViewContainers matching the value (with a fallback to default)
    this._useDefault = false;
    var containers = MapWrapper.get(this._valueViewContainers, value);
    if (isBlank(containers)) {
      this._useDefault = true;
      containers = normalizeBlank(MapWrapper.get(this._valueViewContainers, _whenDefault));
    }
    this._activateViewContainers(containers);

    this._switchValue = value;
  }

  _onWhenValueChanged(oldWhen, newWhen, viewContainer: ViewContainer) {
    this._deregisterViewContainer(oldWhen, viewContainer);
    this._registerViewContainer(newWhen, viewContainer);

    if (oldWhen === this._switchValue) {
      viewContainer.remove();
      ListWrapper.remove(this._activeViewContainers, viewContainer);
    } else if (newWhen === this._switchValue) {
      if (this._useDefault) {
        this._useDefault = false;
        this._emptyAllActiveViewContainers();
      }
      viewContainer.create();
      ListWrapper.push(this._activeViewContainers, viewContainer);
    }

    // Switch to default when there is no more active ViewContainers
    if (this._activeViewContainers.length === 0 && !this._useDefault) {
      this._useDefault = true;
      this._activateViewContainers(MapWrapper.get(this._valueViewContainers, _whenDefault));
    }
  }

  _emptyAllActiveViewContainers() {
    var activeContainers = this._activeViewContainers;
    for (var i = 0; i < activeContainers.length; i++) {
      activeContainers[i].remove();
    }
    this._activeViewContainers = ListWrapper.create();
  }

  _activateViewContainers(containers: List<ViewContainer>) {
    // TODO(vicb): assert(this._activeViewContainers.length === 0);
    if (isPresent(containers)) {
      for (var i = 0; i < containers.length; i++) {
        containers[i].create();
      }
      this._activeViewContainers = containers;
    }
  }

  _registerViewContainer(value, container: ViewContainer) {
    var containers = MapWrapper.get(this._valueViewContainers, value);
    if (isBlank(containers)) {
      containers = ListWrapper.create();
      MapWrapper.set(this._valueViewContainers, value, containers);
    }
    ListWrapper.push(containers, container);
  }

  _deregisterViewContainer(value, container: ViewContainer) {
    // `_whenDefault` is used a marker for non-registered whens
    if (value == _whenDefault) return;
    var containers = MapWrapper.get(this._valueViewContainers, value);
    if (containers.length == 1) {
      MapWrapper.delete(this._valueViewContainers, value);
    } else {
      ListWrapper.remove(containers, container);
    }
  }
}

/**
 * Defines a case statement as an expression.
 *
 * If multiple `SwitchWhen` match the `Switch` value, all of them are displayed.
 *
 * Example:
 *
 * ```
 * // match against a context variable
 * <template [switch-when]="contextVariable">...</template>
 *
 * // match against a constant string
 * <template [switch-when]="'stringValue'">...</template>
 * ```
 *
 * @exportedAs angular2/directives
 */
@Viewport({
  selector: '[switch-when]',
  properties: {
    'when' : 'switch-when'
  }
})
export class SwitchWhen {
  _value: any;
  _switch: Switch;
  _viewContainer: ViewContainer;

  constructor(viewContainer: ViewContainer, @Parent() sswitch: Switch) {
    // `_whenDefault` is used as a marker for a not yet initialized value
    this._value = _whenDefault;
    this._switch = sswitch;
    this._viewContainer = viewContainer;
  }

  set when(value) {
    this._switch._onWhenValueChanged(this._value, value, this._viewContainer);
    this._value = value;
  }
}


/**
 * Defines a default case statement.
 *
 * Default case statements are displayed when no `SwitchWhen` match the `switch` value.
 *
 * Example:
 *
 * ```
 * <template [switch-default]>...</template>
 * ```
 *
 * @exportedAs angular2/directives
 */
@Viewport({
  selector: '[switch-default]'
})
export class SwitchDefault {
  constructor(viewContainer: ViewContainer, @Parent() sswitch: Switch) {
    sswitch._registerViewContainer(_whenDefault, viewContainer);
  }
}

var _whenDefault = new Object();
