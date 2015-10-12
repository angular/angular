///<reference path="./angular.d.ts"/>

import {
  bind,
  provide,
  platform,
  ApplicationRef,
  AppViewManager,
  Compiler,
  Injector,
  NgZone,
  PlatformRef,
  ProtoViewRef,
  Type
} from 'angular2/angular2';
import {applicationDomBindings} from 'angular2/src/core/application_common';
import {applicationCommonBindings} from 'angular2/src/core/application_ref';
import {compilerProviders} from 'angular2/src/core/compiler/compiler';

import {getComponentInfo, ComponentInfo} from './metadata';
import {onError} from './util';
import {
  NG1_COMPILE,
  NG1_INJECTOR,
  NG1_PARSE,
  NG1_ROOT_SCOPE,
  NG1_REQUIRE_INJECTOR_REF,
  NG1_SCOPE,
  NG2_APP_VIEW_MANAGER,
  NG2_COMPILER,
  NG2_INJECTOR,
  NG2_PROTO_VIEW_REF_MAP,
  NG2_ZONE,
  REQUIRE_INJECTOR
} from './constants';
import {Ng2ComponentFacade} from './ng2_facade';
import {ExportedNg1Component} from './ng1_facade';

var moduleCount: number = 0;

export function createUpgradeModule(): UpgradeModule {
  var prefix = `NG2_UPGRADE_m${moduleCount++}_`;
  return new UpgradeModule(prefix, angular.module(prefix, []));
}

export class UpgradeModule {
  importedNg2Components: Type[] = [];
  exportedNg1Components: {[name: string]: ExportedNg1Component} = {}

  constructor(public idPrefix: string, public ng1Module: angular.IModule) {}

  importNg2Component(type: Type): UpgradeModule {
    this.importedNg2Components.push(type);
    var info: ComponentInfo = getComponentInfo(type);
    var factory: Function = ng1ComponentDirective(info, `${this.idPrefix}${info.selector}_c`);
    this.ng1Module.directive(info.selector, <any>factory);
    return this;
  }

  exportAsNg2Component(name: string): Type {
    if ((<any>this.exportedNg1Components).hasOwnProperty(name)) {
      return this.exportedNg1Components[name].type;
    } else {
      return (this.exportedNg1Components[name] = new ExportedNg1Component(name)).type;
    }
  }

  bootstrap(element: Element, modules?: any[],
            config?: angular.IAngularBootstrapConfig): UpgradeRef {
    var upgrade = new UpgradeRef();
    var ng1Injector: angular.auto.IInjectorService = null;
    var bindings = [
      applicationCommonBindings(),
      applicationDomBindings(),
      compilerProviders(),
      provide(NG1_INJECTOR, {useFactory: () => ng1Injector}),
      provide(NG1_COMPILE, {useFactory: () => ng1Injector.get(NG1_COMPILE)})
    ];

    var platformRef: PlatformRef = platform();
    var applicationRef: ApplicationRef = platformRef.application(bindings);
    var injector: Injector = applicationRef.injector;
    var ngZone: NgZone = injector.get(NgZone);
    var compiler: Compiler = injector.get(Compiler);
    var delayApplyExps: Function[] = [];
    var original$applyFn: Function;
    var rootScopePrototype: any;
    var rootScope: angular.IRootScopeService;
    var protoViewRefMap: ProtoViewRefMap = {};
    ngZone.run(() => {
      this.ng1Module.value(NG2_INJECTOR, injector)
          .value(NG2_ZONE, ngZone)
          .value(NG2_COMPILER, compiler)
          .value(NG2_PROTO_VIEW_REF_MAP, protoViewRefMap)
          .value(NG2_APP_VIEW_MANAGER, injector.get(AppViewManager))
          .config([
            '$provide',
            (provide) => {
              provide.decorator(NG1_ROOT_SCOPE, [
                '$delegate',
                function(rootScopeDelegate: angular.IRootScopeService) {
                  rootScopePrototype = rootScopeDelegate.constructor.prototype;
                  if (rootScopePrototype.hasOwnProperty('$apply')) {
                    original$applyFn = rootScopePrototype.$apply;
                    rootScopePrototype.$apply = (exp) => delayApplyExps.push(exp);
                  } else {
                    throw new Error("Failed to find '$apply' on '$rootScope'!");
                  }
                  return rootScope = rootScopeDelegate;
                }
              ]);
            }
          ])
          .run([
            '$injector',
            '$rootScope',
            (injector: angular.auto.IInjectorService, rootScope: angular.IRootScopeService) => {
              ng1Injector = injector;
              ngZone.overrideOnTurnDone(() => rootScope.$apply());
              ExportedNg1Component.resolve(this.exportedNg1Components, injector);
            }
          ]);

      modules = modules ? [].concat(modules) : [];
      modules.push(this.idPrefix);
      angular.element(element).data(NG1_REQUIRE_INJECTOR_REF, injector);
      angular.bootstrap(element, modules, config);
    });
    this.compileNg2Components(compiler, protoViewRefMap)
        .then((protoViewRefMap: ProtoViewRefMap) => {
          ngZone.run(() => {
            rootScopePrototype.$apply = original$applyFn;  // restore original $apply
            while (delayApplyExps.length) {
              rootScope.$apply(delayApplyExps.shift());
            }
            upgrade.readyFn && upgrade.readyFn();
          });
        });
    return upgrade;
  }

  private compileNg2Components(compiler: Compiler,
                               protoViewRefMap: ProtoViewRefMap): Promise<ProtoViewRefMap> {
    var promises: Array<Promise<ProtoViewRef>> = [];
    var types = this.importedNg2Components;
    for (var i = 0; i < types.length; i++) {
      promises.push(compiler.compileInHost(types[i]));
    }
    return Promise.all(promises).then((protoViews: Array<ProtoViewRef>) => {
      var types = this.importedNg2Components;
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
  directiveFactory.$inject = [NG2_PROTO_VIEW_REF_MAP, NG2_APP_VIEW_MANAGER, NG1_PARSE];
  function directiveFactory(protoViewRefMap: ProtoViewRefMap, viewManager: AppViewManager,
                            parse: angular.IParseService): angular.IDirective {
    var protoView: ProtoViewRef = protoViewRefMap[info.selector];
    if (!protoView) throw new Error('Expecting ProtoViewRef for: ' + info.selector);
    var idCount = 0;
    return {
      restrict: 'E',
      require: REQUIRE_INJECTOR,
      link: {
        post: (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes,
               parentInjector: any, transclude: angular.ITranscludeFunction): void => {
          var domElement = <any>element[0];
          var facade =
              new Ng2ComponentFacade(idPrefix + (idCount++), info, element, attrs, scope,
                                     <Injector>parentInjector, parse, viewManager, protoView);
          facade.setupInputs();
          facade.bootstrapNg2();
          facade.projectContent();
          facade.setupOutputs();
          facade.registerCleanup();
        }
      }
    };
  }
  return directiveFactory;
}

export class UpgradeRef {
  readyFn: Function;

  ready(fn: Function) { this.readyFn = fn; }
}
