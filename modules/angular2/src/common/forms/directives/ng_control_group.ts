import {OnInit, OnDestroy} from 'angular2/lifecycle_hooks';
import {Directive} from 'angular2/src/core/metadata';
import {Optional, Inject, Host, SkipSelf, forwardRef, Provider} from 'angular2/src/core/di';
import {ListWrapper} from 'angular2/src/facade/collection';
import {CONST_EXPR} from 'angular2/src/facade/lang';

import {ControlContainer} from './control_container';
import {controlPath, composeValidators, composeAsyncValidators} from './shared';
import {ControlGroup} from '../model';
import {Form} from './form_interface';
import {Validators, NG_VALIDATORS, NG_ASYNC_VALIDATORS} from '../validators';

const controlGroupProvider =
    CONST_EXPR(new Provider(ControlContainer, {useExisting: forwardRef(() => NgControlGroup)}));

/**
 * Creates and binds a control group to a DOM element.
 *
 * This directive can only be used as a child of {@link NgForm} or {@link NgFormModel}.
 *
 * # Example ([live demo](http://plnkr.co/edit/7EJ11uGeaggViYM6T5nq?p=preview))
 *
 * ```typescript
 * @Component({
 *   selector: 'my-app',
 *   directives: [FORM_DIRECTIVES],
 * })
 * @View({
 *   template: `
 *     <div>
 *       <h2>Angular2 Control &amp; ControlGroup Example</h2>
 *       <form #f="form">
 *         <div ng-control-group="name" #cg-name="form">
 *           <h3>Enter your name:</h3>
 *           <p>First: <input ng-control="first" required></p>
 *           <p>Middle: <input ng-control="middle"></p>
 *           <p>Last: <input ng-control="last" required></p>
 *         </div>
 *         <h3>Name value:</h3>
 *         <pre>{{valueOf(cgName)}}</pre>
 *         <p>Name is {{cgName?.control?.valid ? "valid" : "invalid"}}</p>
 *         <h3>What's your favorite food?</h3>
 *         <p><input ng-control="food"></p>
 *         <h3>Form value</h3>
 *         <pre>{{valueOf(f)}}</pre>
 *       </form>
 *     </div>
 *   `,
 *   directives: [FORM_DIRECTIVES]
 * })
 * export class App {
 *   valueOf(cg: NgControlGroup): string {
 *     if (cg.control == null) {
 *       return null;
 *     }
 *     return JSON.stringify(cg.control.value, null, 2);
 *   }
 * }
 * ```
 *
 * This example declares a control group for a user's name. The value and validation state of
 * this group can be accessed separately from the overall form.
 */
@Directive({
  selector: '[ng-control-group]',
  providers: [controlGroupProvider],
  inputs: ['name: ng-control-group'],
  exportAs: 'form'
})
export class NgControlGroup extends ControlContainer implements OnInit,
    OnDestroy {
  /** @internal */
  _parent: ControlContainer;

  constructor(@Host() @SkipSelf() parent: ControlContainer,
              @Optional() @Inject(NG_VALIDATORS) private _validators: any[],
              @Optional() @Inject(NG_ASYNC_VALIDATORS) private _asyncValidators: any[]) {
    super();
    this._parent = parent;
  }

  onInit(): void { this.formDirective.addControlGroup(this); }

  onDestroy(): void { this.formDirective.removeControlGroup(this); }

  /**
   * Get the {@link ControlGroup} backing this binding.
   */
  get control(): ControlGroup { return this.formDirective.getControlGroup(this); }

  /**
   * Get the path to this control group.
   */
  get path(): string[] { return controlPath(this.name, this._parent); }

  /**
   * Get the {@link Form} to which this group belongs.
   */
  get formDirective(): Form { return this._parent.formDirective; }

  get validator(): Function { return composeValidators(this._validators); }

  get asyncValidator(): Function { return composeAsyncValidators(this._asyncValidators); }
}
