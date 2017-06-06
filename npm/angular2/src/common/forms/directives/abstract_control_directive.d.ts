import { AbstractControl } from '../model';
/**
 * Base class for control directives.
 *
 * Only used internally in the forms module.
 */
export declare abstract class AbstractControlDirective {
    control: AbstractControl;
    value: any;
    valid: boolean;
    errors: {
        [key: string]: any;
    };
    pristine: boolean;
    dirty: boolean;
    touched: boolean;
    untouched: boolean;
    path: string[];
}
