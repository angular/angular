import {Decorator, Template} from 'angular2/src/core/annotations/annotations';
import {ViewPort} from 'angular2/src/core/compiler/viewport';
import {NgElement} from 'angular2/src/core/dom/element';
import {DOM} from 'angular2/src/facade/dom';
import {isPresent, isBlank} from 'angular2/src/facade/lang';
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
 * Example:
 *
 * ```
 * <ANY [switch]="expression">
 *   <template [switch-when]="whenExpression1">...</template>
 *   <template [switch-when]="whenExpression1">...</template>
 *   <template [switch-default]>...</template>
 * </ANY>
 * ```
 */
@Decorator({
  selector: '[switch]',
  bind: {
    'switch': 'value'
  }
})
export class Switch {
  _switchValue: any;
  _useDefault: boolean;
  _valueViewPorts: Map;
  _activeViewPorts: List;

  constructor() {
    this._valueViewPorts = MapWrapper.create();
    this._activeViewPorts = ListWrapper.create();
    this._useDefault = false;
  }

  set value(value) {
    // Remove the currently active viewports
    this._removeAllActiveViewPorts();

    // Add the viewports matching the value (with a fallback to default)
    this._useDefault = false;
    var viewPorts = MapWrapper.get(this._valueViewPorts, value);
    if (isBlank(viewPorts)) {
      this._useDefault = true;
      viewPorts = MapWrapper.get(this._valueViewPorts, _whenDefault);
    }
    this._activateViewPorts(viewPorts);

    this._switchValue = value;
  }

  _onWhenValueChanged(oldWhen, newWhen, viewPort: ViewPort) {
    this._deregisterViewPort(oldWhen, viewPort);
    this._registerViewPort(newWhen, viewPort);

    if (oldWhen === this._switchValue) {
      viewPort.remove();
      ListWrapper.remove(this._activeViewPorts, viewPort);
    } else if (newWhen === this._switchValue) {
      if (this._useDefault) {
        this._useDefault = false;
        this._removeAllActiveViewPorts();
      }
      viewPort.create();
      ListWrapper.push(this._activeViewPorts, viewPort);
    }

    // Switch to default when there is no more active viewports
    if (this._activeViewPorts.length === 0 && !this._useDefault) {
      this._useDefault = true;
      this._activateViewPorts(MapWrapper.get(this._valueViewPorts, _whenDefault));
    }
  }

  _removeAllActiveViewPorts() {
    var activeViewPorts = this._activeViewPorts;
    for (var i = 0; i < activeViewPorts.length; i++) {
      activeViewPorts[i].remove();
    }
    this._activeViewPorts = ListWrapper.create();
  }

  _activateViewPorts(viewPorts) {
    // TODO(vicb): assert(this._activeViewPorts.length === 0);
    if (isPresent(viewPorts)) {
      for (var i = 0; i < viewPorts.length; i++) {
        viewPorts[i].create();
      }
      this._activeViewPorts = viewPorts;
    }
  }

  _registerViewPort(value, viewPort: ViewPort) {
    var viewPorts = MapWrapper.get(this._valueViewPorts, value);
    if (isBlank(viewPorts)) {
      viewPorts = ListWrapper.create();
      MapWrapper.set(this._valueViewPorts, value, viewPorts);
    }
    ListWrapper.push(viewPorts, viewPort);
  }

  _deregisterViewPort(value, viewPort: ViewPort) {
    // `_whenDefault` is used a marker for non-registered whens
    if (value == _whenDefault) return;
    var viewPorts = MapWrapper.get(this._valueViewPorts, value);
    if (viewPorts.length == 1) {
      MapWrapper.delete(this._valueViewPorts, value);
    } else {
      ListWrapper.remove(viewPorts, viewPort);
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
 */
@Template({
  selector: '[switch-when]',
  bind: {
    'switch-when' : 'when'
  }
})
export class SwitchWhen {
  _value: any;
  _switch: Switch;
  _viewPort: ViewPort;

  constructor(el: NgElement, viewPort: ViewPort, @Parent() sswitch: Switch) {
    // `_whenDefault` is used as a marker for a not yet initialized value
    this._value = _whenDefault;
    this._switch = sswitch;
    this._viewPort = viewPort;
  }

  set when(value) {
    this._switch._onWhenValueChanged(this._value, value, this._viewPort);
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
 */
@Template({
  selector: '[switch-default]'
})
export class SwitchDefault {
  constructor(viewPort: ViewPort, @Parent() sswitch: Switch) {
    sswitch._registerViewPort(_whenDefault, viewPort);
  }
}

var _whenDefault = new Object();
