import { AbstractControlDirective } from './abstract_control_directive';
/**
 * A directive that contains multiple {@link NgControl}s.
 *
 * Only used by the forms module.
 */
export class ControlContainer extends AbstractControlDirective {
    /**
     * Get the form to which this container belongs.
     */
    get formDirective() { return null; }
    /**
     * Get the path to this container.
     */
    get path() { return null; }
}
