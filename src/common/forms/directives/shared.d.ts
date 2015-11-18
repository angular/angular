import { ControlContainer } from './control_container';
import { NgControl } from './ng_control';
import { NgControlGroup } from './ng_control_group';
import { Control, ControlGroup } from '../model';
import { ControlValueAccessor } from './control_value_accessor';
export declare function controlPath(name: string, parent: ControlContainer): string[];
export declare function setUpControl(control: Control, dir: NgControl): void;
export declare function setUpControlGroup(control: ControlGroup, dir: NgControlGroup): void;
export declare function composeValidators(validators: any[]): Function;
export declare function composeAsyncValidators(validators: any[]): Function;
export declare function isPropertyUpdated(changes: {
    [key: string]: any;
}, viewModel: any): boolean;
export declare function selectValueAccessor(dir: NgControl, valueAccessors: ControlValueAccessor[]): ControlValueAccessor;
