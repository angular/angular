/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AfterViewInit,
  computed,
  Directive,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  Optional,
  Provider,
  Self,
  signal,
  untracked,
  ɵWritable as Writable,
} from '@angular/core';

import {
  AbstractControl,
  FormHooks,
  FormResetEvent,
  FormSubmittedEvent,
} from '../model/abstract_model';
import {FormControl} from '../model/form_control';
import {FormGroup} from '../model/form_group';
import {
  composeAsyncValidators,
  composeValidators,
  NG_ASYNC_VALIDATORS,
  NG_VALIDATORS,
} from '../validators';

import {ControlContainer} from './control_container';
import {Form} from './form_interface';
import {NgControl} from './ng_control';
import type {NgModel} from './ng_model';
import type {NgModelGroup} from './ng_model_group';
import {
  CALL_SET_DISABLED_STATE,
  SetDisabledStateOption,
  setUpControl,
  setUpFormContainer,
  syncPendingControls,
} from './shared';
import {AsyncValidator, AsyncValidatorFn, Validator, ValidatorFn} from './validators';

const formDirectiveProvider: Provider = {
  provide: ControlContainer,
  useExisting: forwardRef(() => NgForm),
};

const resolvedPromise = (() => Promise.resolve())();

/**
 * @description
 * Creates a top-level `FormGroup` instance and binds it to a form
 * to track aggregate form value and validation status.
 *
 * As soon as you import the `FormsModule`, this directive becomes active by default on
 * all `<form>` tags.  You don't need to add a special selector.
 *
 * You optionally export the directive into a local template variable using `ngForm` as the key
 * (ex: `#myForm="ngForm"`). This is optional, but useful.  Many properties from the underlying
 * `FormGroup` instance are duplicated on the directive itself, so a reference to it
 * gives you access to the aggregate value and validity status of the form, as well as
 * user interaction properties like `dirty` and `touched`.
 *
 * To register child controls with the form, use `NgModel` with a `name`
 * attribute. You may use `NgModelGroup` to create sub-groups within the form.
 *
 * If necessary, listen to the directive's `ngSubmit` event to be notified when the user has
 * triggered a form submission. The `ngSubmit` event emits the original form
 * submission event.
 *
 * In template driven forms, all `<form>` tags are automatically tagged as `NgForm`.
 * To import the `FormsModule` but skip its usage in some forms,
 * for example, to use native HTML5 validation, add the `ngNoForm` and the `<form>`
 * tags won't create an `NgForm` directive. In reactive forms, using `ngNoForm` is
 * unnecessary because the `<form>` tags are inert. In that case, you would
 * refrain from using the `formGroup` directive.
 *
 * @usageNotes
 *
 * ### Listening for form submission
 *
 * The following example shows how to capture the form values from the "ngSubmit" event.
 *
 * {@example forms/ts/simpleForm/simple_form_example.ts region='Component'}
 *
 * ### Setting the update options
 *
 * The following example shows you how to change the "updateOn" option from its default using
 * ngFormOptions.
 *
 * ```html
 * <form [ngFormOptions]="{updateOn: 'blur'}">
 *    <input name="one" ngModel>  <!-- this ngModel will update on blur -->
 * </form>
 * ```
 *
 * ### Native DOM validation UI
 *
 * In order to prevent the native DOM form validation UI from interfering with Angular's form
 * validation, Angular automatically adds the `novalidate` attribute on any `<form>` whenever
 * `FormModule` or `ReactiveFormModule` are imported into the application.
 * If you want to explicitly enable native DOM validation UI with Angular forms, you can add the
 * `ngNativeValidate` attribute to the `<form>` element:
 *
 * ```html
 * <form ngNativeValidate>
 *   ...
 * </form>
 * ```
 *
 * @ngModule FormsModule
 * @publicApi
 */
@Directive({
  selector: 'form:not([ngNoForm]):not([formGroup]),ng-form,[ngForm]',
  providers: [formDirectiveProvider],
  host: {'(submit)': 'onSubmit($event)', '(reset)': 'onReset()'},
  outputs: ['ngSubmit'],
  exportAs: 'ngForm',
  standalone: false,
})
export class NgForm extends ControlContainer implements Form, AfterViewInit {
  /**
   * @description
   * Returns whether the form submission has been triggered.
   */
  get submitted(): boolean {
    return untracked(this.submittedReactive);
  }
  /** @internal */
  readonly _submitted = computed(() => this.submittedReactive());
  private readonly submittedReactive = signal(false);

  private _directives = new Set<NgModel>();

  /**
   * @description
   * The `FormGroup` instance created for this form.
   */
  form: FormGroup;

  /**
   * @description
   * Event emitter for the "ngSubmit" event
   */
  ngSubmit = new EventEmitter();

  /**
   * @description
   * Tracks options for the `NgForm` instance.
   *
   * **updateOn**: Sets the default `updateOn` value for all child `NgModels` below it
   * unless explicitly set by a child `NgModel` using `ngModelOptions`). Defaults to 'change'.
   * Possible values: `'change'` | `'blur'` | `'submit'`.
   *
   */
  @Input('ngFormOptions') options!: {updateOn?: FormHooks};

  constructor(
    @Optional() @Self() @Inject(NG_VALIDATORS) validators: (Validator | ValidatorFn)[],
    @Optional()
    @Self()
    @Inject(NG_ASYNC_VALIDATORS)
    asyncValidators: (AsyncValidator | AsyncValidatorFn)[],
    @Optional()
    @Inject(CALL_SET_DISABLED_STATE)
    private callSetDisabledState?: SetDisabledStateOption,
  ) {
    super();
    this.form = new FormGroup(
      {},
      composeValidators(validators),
      composeAsyncValidators(asyncValidators),
    );
  }

  /** @docs-private */
  ngAfterViewInit() {
    this._setUpdateStrategy();
  }

  /**
   * @description
   * The directive instance.
   */
  override get formDirective(): Form {
    return this;
  }

  /**
   * @description
   * The internal `FormGroup` instance.
   */
  override get control(): FormGroup {
    return this.form;
  }

  /**
   * @description
   * Returns an array representing the path to this group. Because this directive
   * always lives at the top level of a form, it is always an empty array.
   */
  override get path(): string[] {
    return [];
  }

  /**
   * @description
   * Returns a map of the controls in this group.
   */
  get controls(): {[key: string]: AbstractControl} {
    return this.form.controls;
  }

  /**
   * @description
   * Method that sets up the control directive in this group, re-calculates its value
   * and validity, and adds the instance to the internal list of directives.
   *
   * @param dir The `NgModel` directive instance.
   */
  addControl(dir: NgModel): void {
    resolvedPromise.then(() => {
      const container = this._findContainer(dir.path);
      (dir as Writable<NgModel>).control = <FormControl>(
        container.registerControl(dir.name, dir.control)
      );
      setUpControl(dir.control, dir, this.callSetDisabledState);
      dir.control.updateValueAndValidity({emitEvent: false});
      this._directives.add(dir);
    });
  }

  /**
   * @description
   * Retrieves the `FormControl` instance from the provided `NgModel` directive.
   *
   * @param dir The `NgModel` directive instance.
   */
  getControl(dir: NgModel): FormControl {
    return <FormControl>this.form.get(dir.path);
  }

  /**
   * @description
   * Removes the `NgModel` instance from the internal list of directives
   *
   * @param dir The `NgModel` directive instance.
   */
  removeControl(dir: NgModel): void {
    resolvedPromise.then(() => {
      const container = this._findContainer(dir.path);
      if (container) {
        container.removeControl(dir.name);
      }
      this._directives.delete(dir);
    });
  }

  /**
   * @description
   * Adds a new `NgModelGroup` directive instance to the form.
   *
   * @param dir The `NgModelGroup` directive instance.
   */
  addFormGroup(dir: NgModelGroup): void {
    resolvedPromise.then(() => {
      const container = this._findContainer(dir.path);
      const group = new FormGroup({});
      setUpFormContainer(group, dir);
      container.registerControl(dir.name, group);
      group.updateValueAndValidity({emitEvent: false});
    });
  }

  /**
   * @description
   * Removes the `NgModelGroup` directive instance from the form.
   *
   * @param dir The `NgModelGroup` directive instance.
   */
  removeFormGroup(dir: NgModelGroup): void {
    resolvedPromise.then(() => {
      const container = this._findContainer(dir.path);
      if (container) {
        container.removeControl(dir.name);
      }
    });
  }

  /**
   * @description
   * Retrieves the `FormGroup` for a provided `NgModelGroup` directive instance
   *
   * @param dir The `NgModelGroup` directive instance.
   */
  getFormGroup(dir: NgModelGroup): FormGroup {
    return <FormGroup>this.form.get(dir.path);
  }

  /**
   * Sets the new value for the provided `NgControl` directive.
   *
   * @param dir The `NgControl` directive instance.
   * @param value The new value for the directive's control.
   */
  updateModel(dir: NgControl, value: any): void {
    resolvedPromise.then(() => {
      const ctrl = <FormControl>this.form.get(dir.path!);
      ctrl.setValue(value);
    });
  }

  /**
   * @description
   * Sets the value for this `FormGroup`.
   *
   * @param value The new value
   */
  setValue(value: {[key: string]: any}): void {
    this.control.setValue(value);
  }

  /**
   * @description
   * Method called when the "submit" event is triggered on the form.
   * Triggers the `ngSubmit` emitter to emit the "submit" event as its payload.
   *
   * @param $event The "submit" event object
   */
  onSubmit($event: Event): boolean {
    this.submittedReactive.set(true);
    syncPendingControls(this.form, this._directives);
    this.ngSubmit.emit($event);
    this.form._events.next(new FormSubmittedEvent(this.control));
    // Forms with `method="dialog"` have some special behavior
    // that won't reload the page and that shouldn't be prevented.
    return ($event?.target as HTMLFormElement | null)?.method === 'dialog';
  }

  /**
   * @description
   * Method called when the "reset" event is triggered on the form.
   */
  onReset(): void {
    this.resetForm();
  }

  /**
   * @description
   * Resets the form to an initial value and resets its submitted status.
   *
   * @param value The new value for the form.
   */
  resetForm(value: any = undefined): void {
    this.form.reset(value);
    this.submittedReactive.set(false);
    this.form._events.next(new FormResetEvent(this.form));
  }

  private _setUpdateStrategy() {
    if (this.options && this.options.updateOn != null) {
      this.form._updateOn = this.options.updateOn;
    }
  }

  private _findContainer(path: string[]): FormGroup {
    path.pop();
    return path.length ? <FormGroup>this.form.get(path) : this.form;
  }
}
