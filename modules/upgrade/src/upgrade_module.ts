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
  ViewRef
} from 'angular2/angular2';
import {applicationDomBindings} from 'angular2/src/core/application_common';
import {applicationCommonBindings} from '../../angular2/src/core/application_ref';
import {compilerBindings} from 'angular2/src/compiler/compiler';

import {getComponentSelector} from './metadata';
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
    var selector: string = getComponentSelector(type);
    var factory: Function = ng1ComponentDirective(selector, type, `${this.idPrefix}${selector}_c`);
    this.ng1Module.directive(selector, <any[]>factory);
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
        protoViewRefMap[getComponentSelector(types[i])] = protoViews[i];
      }
      return protoViewRefMap;
    }, onError);
  }
}

interface ProtoViewRefMap {
  [selector: string]: ProtoViewRef
}

function ng1ComponentDirective(selector: string, type: Type, idPrefix: string): Function {
  directiveFactory.$inject = [PROTO_VIEW_REF_MAP, APP_VIEW_MANAGER];
  function directiveFactory(protoViewRefMap: ProtoViewRefMap, viewManager: AppViewManager):
      angular.IDirective {
    var protoView: ProtoViewRef = protoViewRefMap[selector];
    if (!protoView) throw new Error('Expecting ProtoViewRef for: ' + selector);
    var idCount = 0;
    return {
      restrict: 'E',
      require: REQUIRE_INJECTOR,
      link: (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes,
             parentInjector: any, transclude: angular.ITranscludeFunction): void => {
        var id = element[0].id = idPrefix + (idCount++);
        var componentScope = scope.$new();
        componentScope.$watch(() => changeDetector.detectChanges());
        var childInjector =
            parentInjector.resolveAndCreateChild([bind(NG1_SCOPE).toValue(componentScope)]);
        var hostViewRef = viewManager.createRootHostView(protoView, '#' + id, childInjector);
        var changeDetector: ChangeDetectorRef = hostViewRef.changeDetectorRef;
        element.bind('$remove', () => viewManager.destroyRootHostView(hostViewRef));
      }
    };
  }
  return directiveFactory;
}

export class UpgradeRef {
  readyFn: Function;

  ready(fn: Function) { this.readyFn = fn; }
}
