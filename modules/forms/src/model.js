import {StringMapWrapper} from 'facade/src/collection';

export class Control {
  value:any;

  constructor(value:any) {
    this.value = value;
  }
}

export class ControlGroup {
  controls;

  constructor(controls) {
    this.controls = controls;
  }

  get value() {
    var res = {};
    StringMapWrapper.forEach(this.controls, (control, name) => {
      res[name] = control.value;
    });
    return res;
  }
}
