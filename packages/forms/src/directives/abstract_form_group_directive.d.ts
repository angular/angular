/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '../model/form_group';
import { ControlContainer } from './control_container';
import type { Form } from './form_interface';
/**
 * @description
 * A base class for code shared between the `NgModelGroup` and `FormGroupName` directives.
 *
 * @publicApi
 */
export declare class AbstractFormGroupDirective extends ControlContainer implements OnInit, OnDestroy {
    /**
     * @description
     * The parent control for the group
     *
     * @internal
     */
    _parent: ControlContainer;
    /** @docs-private */
    ngOnInit(): void;
    /** @docs-private */
    ngOnDestroy(): void;
    /**
     * @description
     * The `FormGroup` bound to this directive.
     */
    get control(): FormGroup;
    /**
     * @description
     * The path to this group from the top-level directive.
     */
    get path(): string[];
    /**
     * @description
     * The top-level directive for this group if present, otherwise null.
     */
    get formDirective(): Form | null;
    /** @internal */
    _checkParentType(): void;
}
