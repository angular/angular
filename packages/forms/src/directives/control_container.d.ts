/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { AbstractControlDirective } from './abstract_control_directive';
import type { Form } from './form_interface';
/**
 * @description
 * A base class for directives that contain multiple registered instances of `NgControl`.
 * Only used by the forms module.
 *
 * @publicApi
 */
export declare abstract class ControlContainer extends AbstractControlDirective {
    /**
     * @description
     * The name for the control
     */
    name: string | number | null;
    /**
     * @description
     * The top-level form directive for the control.
     */
    get formDirective(): Form | null;
    /**
     * @description
     * The path to this group.
     */
    get path(): string[] | null;
}
