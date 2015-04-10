import {StringMapWrapper, ListWrapper, List} from 'angular2/src/facade/collection';
import {isPresent} from 'angular2/src/facade/lang';
import * as modelModule from './model';


/**
 * @exportedAs angular2/forms
 */
export class FormBuilder {
  group(controlsConfig, extra = null):modelModule.ControlGroup {
    var controls = this._reduceControls(controlsConfig);
    var optionals = isPresent(extra) ? StringMapWrapper.get(extra, "optionals") : null;
    var validator = isPresent(extra) ? StringMapWrapper.get(extra, "validator") : null;

    if (isPresent(validator)) {
      return new modelModule.ControlGroup(controls, optionals, validator);
    } else {
      return new modelModule.ControlGroup(controls, optionals);
    }
  }

  control(value, validator:Function = null):modelModule.Control {
    if (isPresent(validator)) {
      return new modelModule.Control(value, validator);
    } else {
      return new modelModule.Control(value);
    }
  }

  array(controlsConfig:List, validator:Function = null):modelModule.ControlArray  {
    var controls = ListWrapper.map(controlsConfig, (c) => this._createControl(c));
    if (isPresent(validator)) {
      return new modelModule.ControlArray(controls, validator);
    } else {
      return new modelModule.ControlArray(controls);
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
    if (controlConfig instanceof modelModule.Control ||
      controlConfig instanceof modelModule.ControlGroup ||
      controlConfig instanceof modelModule.ControlArray) {
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