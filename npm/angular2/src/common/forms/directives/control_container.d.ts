import { Form } from './form_interface';
import { AbstractControlDirective } from './abstract_control_directive';
/**
 * A directive that contains multiple {@link NgControl}s.
 *
 * Only used by the forms module.
 */
export declare class ControlContainer extends AbstractControlDirective {
    name: string;
    /**
     * Get the form to which this container belongs.
     */
    formDirective: Form;
    /**
     * Get the path to this container.
     */
    path: string[];
}
