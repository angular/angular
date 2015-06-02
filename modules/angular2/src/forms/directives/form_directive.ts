import {ControlDirective} from './control_directive';
import {ControlGroupDirective} from './control_group_directive';

export interface FormDirective {
  addControl(dir: ControlDirective): void;
  removeControl(dir: ControlDirective): void;
  addControlGroup(dir: ControlGroupDirective): void;
  removeControlGroup(dir: ControlGroupDirective): void;
  updateModel(dir: ControlDirective, value: any): void;
}