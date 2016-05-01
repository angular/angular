import { AbstractControlDirective } from './abstract_control_directive';
import { unimplemented } from 'angular2/src/facade/exceptions';
/**
 * A base class that all control directive extend.
 * It binds a {@link Control} object to a DOM element.
 *
 * Used internally by Angular forms.
 */
export class NgControl extends AbstractControlDirective {
    constructor(...args) {
        super(...args);
        this.name = null;
        this.valueAccessor = null;
    }
    get validator() { return unimplemented(); }
    get asyncValidator() { return unimplemented(); }
}
