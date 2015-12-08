library angular2.src.common.forms.directives.ng_control_group;

import "package:angular2/core.dart"
    show
        OnInit,
        OnDestroy,
        Directive,
        Optional,
        Inject,
        Host,
        SkipSelf,
        Provider,
        Self;
import "control_container.dart" show ControlContainer;
import "shared.dart"
    show controlPath, composeValidators, composeAsyncValidators;
import "../model.dart" show ControlGroup;
import "form_interface.dart" show Form;
import "../validators.dart" show Validators, NG_VALIDATORS, NG_ASYNC_VALIDATORS;

const controlGroupProvider =
    const Provider(ControlContainer, useExisting: NgControlGroup);

/**
 * Creates and binds a control group to a DOM element.
 *
 * This directive can only be used as a child of [NgForm] or [NgFormModel].
 *
 * ### Example ([live demo](http://plnkr.co/edit/7EJ11uGeaggViYM6T5nq?p=preview))
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
@Directive(
    selector: "[ng-control-group]",
    providers: const [controlGroupProvider],
    inputs: const ["name: ng-control-group"],
    exportAs: "form")
class NgControlGroup extends ControlContainer implements OnInit, OnDestroy {
  List<dynamic> _validators;
  List<dynamic> _asyncValidators;
  /** @internal */
  ControlContainer _parent;
  NgControlGroup(
      @Host() @SkipSelf() ControlContainer parent,
      @Optional() @Self() @Inject(NG_VALIDATORS) this._validators,
      @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) this._asyncValidators)
      : super() {
    /* super call moved to initializer */;
    this._parent = parent;
  }
  void ngOnInit() {
    this.formDirective.addControlGroup(this);
  }

  void ngOnDestroy() {
    this.formDirective.removeControlGroup(this);
  }

  /**
   * Get the [ControlGroup] backing this binding.
   */
  ControlGroup get control {
    return this.formDirective.getControlGroup(this);
  }

  /**
   * Get the path to this control group.
   */
  List<String> get path {
    return controlPath(this.name, this._parent);
  }

  /**
   * Get the [Form] to which this group belongs.
   */
  Form get formDirective {
    return this._parent.formDirective;
  }

  Function get validator {
    return composeValidators(this._validators);
  }

  Function get asyncValidator {
    return composeAsyncValidators(this._asyncValidators);
  }
}
