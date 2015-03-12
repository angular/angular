import {StringMapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {isPresent} from 'angular2/src/facade/lang';
import {ControlGroup, Control, OptionalControl, OptionalControlGroup} from 'angular2/forms';


export class FormBuilder {
  group(controlsConfig, extra = null):ControlGroup {
    var controls = this._reduceControls(controlsConfig);
    var optionals = isPresent(extra) ? StringMapWrapper.get(extra, "optionals") : null;
    var validator = isPresent(extra) ? StringMapWrapper.get(extra, "validator") : null;

    if (isPresent(validator)) {
      return new ControlGroup(controls, optionals, validator);
    } else {
      return new ControlGroup(controls, optionals);
    }
  }

  control(value, validator:Function = null):Control {
    if (isPresent(validator)) {
      return new Control(value, validator);
    } else {
      return new Control(value);
    }
  }

  _reduceControls(controlsConfig) {
    var controls = {};
    StringMapWrapper.forEach(controlsConfig, (controlConfig, controlName) => {
      controls[controlName] = this._createControl(controlConfig);
    });
    return controls;
  }

  _createControl(controlConfig) {
    if (controlConfig instanceof Control || controlConfig instanceof ControlGroup) {
      return controlConfig;

    } else if (ListWrapper.isList(controlConfig)) {
      var value = ListWrapper.get(controlConfig, 0);
      var validator = controlConfig.length > 1 ? controlConfig[1] : null;
      return this.control(value, validator);

    } else {
      return this.control(controlConfig);
    }
  }
}