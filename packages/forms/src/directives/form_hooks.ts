/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';
import {FormControl} from '../model';
import {NgControl} from './ng_control';

/**
 * @description
 * `InjectionToken` to provide to register hooks on reactive forms.
 * Provide a FormHooks instance with this token.
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
export const NG_FORM_HOOKS = new InjectionToken('NgFormHooks');

/**
 * @description
 * Allows to hook into the link between FormControl and NgControl
 *
 * @see [Reactive Forms Guide](guide/reactive-forms)
 *
 * @usageNotes
 *
 * ### create a service implementing this interface and provide it:
 *
 * ```ts
 * @Injectable()
 * class MyFormHooks implements FormHooks {
 *   ...
 * }
 * ```
 *
 * ```ts
 * @NgModule({
 *   imports: [
 *     ReactiveFormsModule
 *   ],
 *   providers: [
 *     {provide: NG_FORM_HOOKS, useClass: MyFormHooks}
 *   ]
 * }
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
export interface FormHooks {
  /**
   * @description
   * Hook called when connection between FormControl and NgControl is established.
   * the targeted component's ControlValueAccessor is accessible via dir.valueAccessor.
   *
   * @param control the FormControl element specified via [formControl] or [formControlName]
   * @param dir the NgControl (the formControl/formControlName directive object)
   */
  setUpControl?(control: FormControl, dir: NgControl): void;

  /**
   * @description
   * Hook called when connection between FormControl and NgControl is loosened.
   * You should clean up here if you create additional resources/links in setUpControl.
   *
   * @param control the FormControl element specified via [formControl] or [formControlName]
   * @param dir the NgControl (the formControl/formControlName directive object)
   */
  cleanUpControl?(control: FormControl, dir: NgControl): void;
}
