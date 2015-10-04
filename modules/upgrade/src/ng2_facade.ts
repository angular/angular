import {
  bind,
  AppViewManager,
  ChangeDetectorRef,
  HostViewRef,
  Injector,
  ProtoViewRef,
  SimpleChange
} from 'angular2/angular2';
import {NG1_SCOPE} from './constants';
import {ComponentInfo} from './metadata';

const INITIAL_VALUE = {
  __UNINITIALIZED__: true
};

export class Ng2ComponentFacade {
  component: any = null;
  inputChangeCount: number = 0;
  inputChanges: {[key: string]: SimpleChange} = null;
  hostViewRef: HostViewRef = null;
  changeDetector: ChangeDetectorRef = null;
  componentScope: angular.IScope;

  constructor(private id: string, private info: ComponentInfo,
              private element: angular.IAugmentedJQuery, private attrs: angular.IAttributes,
              private scope: angular.IScope, private parentInjector: Injector,
              private parse: angular.IParseService, private viewManager: AppViewManager,
              private protoView: ProtoViewRef) {
    this.componentScope = scope.$new();
  }

  bootstrapNg2() {
    var childInjector =
        this.parentInjector.resolveAndCreateChild([bind(NG1_SCOPE).toValue(this.componentScope)]);
    this.hostViewRef =
        this.viewManager.createRootHostView(this.protoView, '#' + this.id, childInjector);
    var hostElement = this.viewManager.getHostElement(this.hostViewRef);
    this.changeDetector = this.hostViewRef.changeDetectorRef;
    this.component = this.viewManager.getComponent(hostElement);
  }

  setupInputs() {
    var attrs = this.attrs;
    var inputs = this.info.inputs;
    for (var i = 0; i < inputs.length; i++) {
      var input = inputs[i];
      var expr = null;
      if (attrs.hasOwnProperty(input.attr)) {
        var observeFn = ((prop) => {
          var prevValue = INITIAL_VALUE;
          return (value) => {
            if (this.inputChanges !== null) {
              this.inputChangeCount++;
              this.inputChanges[prop] =
                  new Ng1Change(value, prevValue === INITIAL_VALUE ? value : prevValue);
              prevValue = value;
            }
            this.component[prop] = value;
          }
        })(input.prop);
        attrs.$observe(input.attr, observeFn);
      } else if (attrs.hasOwnProperty(input.bindAttr)) {
        expr = attrs[input.bindAttr];
      } else if (attrs.hasOwnProperty(input.bracketAttr)) {
        expr = attrs[input.bracketAttr];
      } else if (attrs.hasOwnProperty(input.bindonAttr)) {
        expr = attrs[input.bindonAttr];
      } else if (attrs.hasOwnProperty(input.bracketParenAttr)) {
        expr = attrs[input.bracketParenAttr];
      }
      if (expr != null) {
        var watchFn = ((prop) => (value, prevValue) => {
          if (this.inputChanges != null) {
            this.inputChangeCount++;
            this.inputChanges[prop] = new Ng1Change(prevValue, value);
          }
          this.component[prop] = value;
        })(input.prop);
        this.componentScope.$watch(expr, watchFn);
      }
    }

    var prototype = this.info.type.prototype;
    if (prototype && prototype.onChanges) {
      // Detect: OnChanges interface
      this.inputChanges = {};
      this.componentScope.$watch(() => this.inputChangeCount, () => {
        var inputChanges = this.inputChanges;
        this.inputChanges = {};
        this.component.onChanges(inputChanges);
      });
    }
    this.componentScope.$watch(() => this.changeDetector.detectChanges());
  }

  setupOutputs() {
    var attrs = this.attrs;
    var outputs = this.info.outputs;
    for (var j = 0; j < outputs.length; j++) {
      var output = outputs[j];
      var expr = null;
      var assignExpr = false;
      if (attrs.hasOwnProperty(output.onAttr)) {
        expr = attrs[output.onAttr];
      } else if (attrs.hasOwnProperty(output.parenAttr)) {
        expr = attrs[output.parenAttr];
      } else if (attrs.hasOwnProperty(output.bindonAttr)) {
        expr = attrs[output.bindonAttr];
        assignExpr = true;
      } else if (attrs.hasOwnProperty(output.bracketParenAttr)) {
        expr = attrs[output.bracketParenAttr];
        assignExpr = true;
      }

      if (expr != null && assignExpr != null) {
        var getter = this.parse(expr);
        var setter = getter.assign;
        if (assignExpr && !setter) {
          throw new Error(`Expression '${expr}' is not assignable!`);
        }
        var emitter = this.component[output.prop];
        if (emitter) {
          emitter.observer({
            next: assignExpr ? ((setter) => (value) => setter(this.scope, value))(setter) :
                               ((getter) => (value) => getter(this.scope, {$event: value}))(getter)
          });
        } else {
          throw new Error(`Missing emitter '${output.prop}' on component '${this.info.selector}'!`);
        }
      }
    }
  }

  registerCleanup() {
    this.element.bind('$remove', () => this.viewManager.destroyRootHostView(this.hostViewRef));
  }
}

class Ng1Change implements SimpleChange {
  constructor(public previousValue: any, public currentValue: any) {}

  isFirstChange(): boolean { return this.previousValue === this.currentValue; }
}
