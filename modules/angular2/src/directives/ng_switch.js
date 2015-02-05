import {Decorator, Template} from 'angular2/src/core/annotations/annotations';
import {ViewPort} from 'angular2/src/core/compiler/viewport';
import {NgElement} from 'angular2/src/core/dom/element';
import {DOM} from 'angular2/src/facade/dom';
import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {ListWrapper, List, MapWrapper, Map} from 'angular2/src/facade/collection';
import {Parent} from 'angular2/src/core/annotations/visibility';

/**
 * The `ngSwitch` directive is used to conditionally swap DOM structure on your template based on a
 * scope expression.
 * Elements within `ngSwitch` but without `ngSwitchWhen` or `ngSwitchDefault` directives will be
 * preserved at the location as specified in the template.
 *
 * `ngSwitch` simply chooses nested elements and makes them visible based on which element matches
 * the value obtained from the evaluated expression. In other words, you define a container element
 * (where you place the directive), place an expression on the **`[ng-switch]="..."` attribute**),
 * define any inner elements inside of the directive and place a `[ng-switch-when]` attribute per
 * element.
 * The when attribute is used to inform ngSwitch which element to display when the expression is
 * evaluated. If a matching expression is not found via a when attribute then an element with the
 * default attribute is displayed.
 *
 * Example:
 *
 * ```
 * <ANY [ng-switch]="expression">
 *   <template [ng-switch-when]="whenExpression1">...</template>
 *   <template [ng-switch-when]="whenExpression1">...</template>
 *   <template [ng-switch-default]>...</template>
 * </ANY>
 * ```
 */
@Decorator({
  selector: '[ng-switch]',
  bind: {
    'ng-switch': 'value'
  }
})
export class NgSwitch {
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
 * If multiple `ngSwitchWhen` match the `ngSwitch` value, all of them are displayed.
 *
 * Example:
 *
 * ```
 * // match against a context variable
 * <template [ng-switch-when]="contextVariable">...</template>
 *
 * // match against a constant string
 * <template [ng-switch-when]="'stringValue'">...</template>
 * ```
 */
@Template({
  selector: '[ng-switch-when]',
  bind: {
    'ng-switch-when' : 'when'
  }
})
export class NgSwitchWhen {
  _value: any;
  _ngSwitch: NgSwitch;
  _viewPort: ViewPort;

  constructor(el: NgElement, viewPort: ViewPort, @Parent() ngSwitch: NgSwitch) {
    // `_whenDefault` is used as a marker for a not yet initialized value
    this._value = _whenDefault;
    this._ngSwitch = ngSwitch;
    this._viewPort = viewPort;
  }

  set when(value) {
    this._ngSwitch._onWhenValueChanged(this._value, value, this._viewPort);
    this._value = value;
  }
}


/**
 * Defines a default case statement.
 *
 * Default case statements are displayed when no `NgSwitchWhen` match the `ngSwitch` value.
 *
 * Example:
 *
 * ```
 * <template [ng-switch-default]>...</template>
 * ```
 */
@Template({
  selector: '[ng-switch-default]'
})
export class NgSwitchDefault {
  constructor(viewPort: ViewPort, @Parent() ngSwitch: NgSwitch) {
    ngSwitch._registerViewPort(_whenDefault, viewPort);
  }
}

var _whenDefault = new Object();
