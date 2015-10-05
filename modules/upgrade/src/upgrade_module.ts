///<reference path="../typings/angularjs/angular.d.ts"/>

import {
  platform,
  PlatformRef,
  ApplicationRef,
  ComponentRef,
  bind,
  Directive,
  Component,
  Inject,
  View,
  Type,
  PlatformRef,
  ApplicationRef,
  ChangeDetectorRef,
  AppViewManager,
  NgZone,
  Injector,
  Compiler,
  ProtoViewRef,
  ElementRef,
  HostViewRef,
  ViewRef,
  SimpleChange
} from 'angular2/angular2';
import {applicationDomBindings} from 'angular2/src/core/application_common';
import {applicationCommonBindings} from '../../angular2/src/core/application_ref';
import {compilerBindings} from 'angular2/src/core/compiler/compiler';

import {getComponentInfo, ComponentInfo} from './metadata';
import {onError} from './util';
export const INJECTOR = 'ng2.Injector';
export const APP_VIEW_MANAGER = 'ng2.AppViewManager';
export const NG2_COMPILER = 'ng2.Compiler';
export const NG2_ZONE = 'ng2.NgZone';
export const PROTO_VIEW_REF_MAP = 'ng2.ProtoViewRefMap';

const NG1_REQUIRE_INJECTOR_REF = '$' + INJECTOR + 'Controller';
const NG1_SCOPE = '$scope';
const NG1_COMPILE = '$compile';
const NG1_INJECTOR = '$injector';
const NG1_PARSE = '$parse';
const REQUIRE_INJECTOR = '^' + INJECTOR;

var moduleCount: number = 0;
const CAMEL_CASE = /([A-Z])/g;

export function createUpgradeModule(): UpgradeModule {
  var prefix = `NG2_UPGRADE_m${moduleCount++}_`;
  return new UpgradeModule(prefix, angular.module(prefix, []));
}


export class UpgradeModule {
  componentTypes: Array<Type> = [];

  constructor(public idPrefix: string, public ng1Module: angular.IModule) {}

  importNg2Component(type: Type): UpgradeModule {
    this.componentTypes.push(type);
    var info: ComponentInfo = getComponentInfo(type);
    var factory: Function = ng1ComponentDirective(info, `${this.idPrefix}${info.selector}_c`);
    this.ng1Module.directive(info.selector, <any[]>factory);
    return this;
  }

  exportAsNg2Component(name: string): Type {
    return Directive({
             selector: name.replace(CAMEL_CASE, (all, next: string) => '-' + next.toLowerCase())
           })
        .Class({
          constructor: [
            new Inject(NG1_COMPILE),
            new Inject(NG1_SCOPE),
            ElementRef,
            function(compile: angular.ICompileService, scope: angular.IScope,
                     elementRef: ElementRef) { compile(elementRef.nativeElement)(scope); }
          ]
        });
  }

  bootstrap(element: Element, modules?: any[],
            config?: angular.IAngularBootstrapConfig): UpgradeRef {
    var upgrade = new UpgradeRef();
    var ng1Injector: angular.auto.IInjectorService = null;
    var bindings = [
      applicationCommonBindings(),
      applicationDomBindings(),
      compilerBindings(),
      bind(NG1_INJECTOR).toFactory(() => ng1Injector),
      bind(NG1_COMPILE).toFactory(() => ng1Injector.get(NG1_COMPILE))
    ];

    var platformRef: PlatformRef = platform();
    var applicationRef: ApplicationRef = platformRef.application(bindings);
    var injector: Injector = applicationRef.injector;
    var ngZone: NgZone = injector.get(NgZone);
    var compiler: Compiler = injector.get(Compiler);
    this.compileNg2Components(compiler).then((protoViewRefMap: ProtoViewRefMap) => {
      ngZone.run(() => {
        this.ng1Module.value(INJECTOR, injector)
            .value(NG2_ZONE, ngZone)
            .value(NG2_COMPILER, compiler)
            .value(PROTO_VIEW_REF_MAP, protoViewRefMap)
            .value(APP_VIEW_MANAGER, injector.get(AppViewManager))
            .run([
              '$injector',
              '$rootScope',
              (injector: angular.auto.IInjectorService, rootScope: angular.IRootScopeService) => {
                ng1Injector = injector;
                ngZone.overrideOnTurnDone(() => rootScope.$apply());
              }
            ]);

        modules = modules ? [].concat(modules) : [];
        modules.push(this.idPrefix);
        angular.element(element).data(NG1_REQUIRE_INJECTOR_REF, injector);
        angular.bootstrap(element, modules, config);

        upgrade.readyFn && upgrade.readyFn();
      });
    });
    return upgrade;
  }

  private compileNg2Components(compiler: Compiler): Promise<ProtoViewRefMap> {
    var promises: Array<Promise<ProtoViewRef>> = [];
    var types = this.componentTypes;
    for (var i = 0; i < types.length; i++) {
      promises.push(compiler.compileInHost(types[i]));
    }
    return Promise.all(promises).then((protoViews: Array<ProtoViewRef>) => {
      var protoViewRefMap: ProtoViewRefMap = {};
      var types = this.componentTypes;
      for (var i = 0; i < protoViews.length; i++) {
        protoViewRefMap[getComponentInfo(types[i]).selector] = protoViews[i];
      }
      return protoViewRefMap;
    }, onError);
  }
}

interface ProtoViewRefMap {
  [selector: string]: ProtoViewRef
}

function ng1ComponentDirective(info: ComponentInfo, idPrefix: string): Function {
  directiveFactory.$inject = [PROTO_VIEW_REF_MAP, APP_VIEW_MANAGER, NG1_PARSE];
  function directiveFactory(protoViewRefMap: ProtoViewRefMap, viewManager: AppViewManager,
                            parse: angular.IParseService): angular.IDirective {
    var protoView: ProtoViewRef = protoViewRefMap[info.selector];
    if (!protoView) throw new Error('Expecting ProtoViewRef for: ' + info.selector);
    var idCount = 0;
    return {
      restrict: 'E',
      require: REQUIRE_INJECTOR,
      link: (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes,
             parentInjector: any, transclude: angular.ITranscludeFunction): void => {
        var facade =
            new Ng2ComponentFacade(element[0].id = idPrefix + (idCount++), info, element, attrs,
                                   scope, <Injector>parentInjector, parse, viewManager, protoView);

        facade.setupInputs();
        facade.bootstrapNg2();
        facade.setupOutputs();
        facade.registerCleanup();
      }
    };
  }
  return directiveFactory;
}

class Ng2ComponentFacade {
  component: any = null;
  inputChangeCount: number = 0;
  inputChanges: StringMap<string, SimpleChange> = null;
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
        attrs.$observe(input.attr, ((prop) => {
                         var prevValue = this;
                         return (value) => {
                           if (this.inputChanges != null) {
                             this.inputChangeCount++;
                             this.inputChanges[prop] =
                                 new Ng1Change(value, prevValue == this ? value : prevValue);
                             prevValue = value;
                           }
                           this.component[prop] = value;
                         }
                       })(input.prop));
      } else if (attrs.hasOwnProperty(input.bindAttr)) {
        expr = attrs[input.bindAttr];
      } else if (attrs.hasOwnProperty(input.bracketAttr)) {
        expr = attrs[input.bracketAttr];
      } else if (attrs.hasOwnProperty(input.bindonAttr)) {
        expr = attrs[input.bindonAttr];
      } else if (attrs.hasOwnProperty(input.bracketParanAttr)) {
        expr = attrs[input.bracketParanAttr];
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
      } else if (attrs.hasOwnProperty(output.bracketParanAttr)) {
        expr = attrs[output.bracketParanAttr];
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
          throw new Error(
              `Missing emitter '${output.prop}' on component '${this.input.selector}'!`);
        }
      }
    }
  }

  registerCleanup() {
    this.element.bind('$remove', () => this.viewManager.destroyRootHostView(this.hostViewRef));
  }
}

export class Ng1Change implements SimpleChange {
  constructor(public previousValue: any, public currentValue: any) {}

  isFirstChange(): boolean { return this.previousValue === this.currentValue; }
}


export class UpgradeRef {
  readyFn: Function;

  ready(fn: Function) { this.readyFn = fn; }
}
