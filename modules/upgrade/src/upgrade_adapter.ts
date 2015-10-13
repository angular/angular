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
import {DowngradeNg2ComponentAdapter} from './downgrade_ng2_adapter';
import {UpgradeNg1ComponentAdapterBuilder} from './upgrade_ng1_adapter';

var upgradeCount: number = 0;

/**
 * Use `UpgradeAdapter` to allow AngularJS v1 and Angular v2 to coexist in a single application.
 *
 * The `UpgradeAdapter` allows:
 * 1. creation of Angular v2 component from AngularJS v1 component directive
 *    (See [UpgradeAdapter#upgradeNg1Component()])
 * 2. creation of AngularJS v1 directive from Angular v2 component.
 *    (See [UpgradeAdapter#downgradeNg2Component()])
 * 3. Bootstrapping of a hybrid Angular application which contains both of the frameworks
 *    coexisting in a single application.
 *
 * ## Mental Model
 *
 * When reasoning about how a hybrid application works it is useful to have a mental model which
 * describes what is happening and explains what is happening at the lowest level.
 *
 * 1. There are two independent frameworks running in a single application, each framework treats
 *    the other as a black box.
 * 2. Each DOM element on the page is owned exactly by one framework. Whichever framework
 *    instantiated the element is the owner. Each framework only updates/interacts with its own
 *    DOM elements and ignores others.
 * 3. AngularJS v1 directives always execute inside AngularJS v1 framework codebase regardless of
 *    where they are instantiated.
 * 4. Angular v2 components always execute inside Angular v2 framework codebase regardless of
 *    where they are instantiated.
 * 5. An AngularJS v1 component can be upgraded to an Angular v2 component. This creates an
 *    Angular v2 directive, which bootstraps the AngularJS v1 component directive in that location.
 * 6. An Angular v2 component can be downgraded to an AngularJS v1 component directive. This creates
 *    an AngularJS v1 directive, which bootstraps the Angular v2 component in that location.
 * 7. Whenever an adapter component is instantiated the host element is owned by the the framework
 *    doing the instantiation. The other framework then instantiates and owns the view for that
 *    component. This implies that component bindings will always follow the semantics of the
 *    instantiation framework, but with Angular v2 syntax.
 * 8. AngularJS v1 is always bootstrapped first and owns the bottom most view.
 *
 * ## Example
 *
 * ```
 * var adapter = new UpgradeAdapter();
 * var module = angular.module('myExample', []);
 *
 * module.directive('ng1', function() {
 *   return {
 *      scope: { title: '@' },
 *      template: 'ng1[Hello {{title}}!](<span ng-transclude></span>)'
 *   };
 * });
 *
 *
 * @Component({
 *   selector: 'ng2',
 *   inputs: ['name'],
 *   template: 'ng2[<ng1 [title]="name">transclude</ng1>](<ng-content></ng-content>)',
 *   directives: [adapter.upgradeNg1Component('ng1')]
 * })
 * class Ng2 {
 * }
 *
 * document.body = '<ng2 name="World">project</ng2>';
 *
 * adapter.bootstrap(document.body, ['myExample']).ready(function() {
 *   expect(document.body.textContent).toEqual(
 *       "ng2[ng1[Hello World!](transclude)](project)");
 * });
 * ```
 */
export class UpgradeAdapter {
  /* @internal */
  private idPrefix: string = `NG2_UPGRADE_${upgradeCount++}_`;
  /* @internal */
  private upgradedComponents: Type[] = [];
  /* @internal */
  private downgradedComponents: {[name: string]: UpgradeNg1ComponentAdapterBuilder} = {};

  downgradeNg2Component(type: Type): Function {
    this.upgradedComponents.push(type);
    var info: ComponentInfo = getComponentInfo(type);
    return ng1ComponentDirective(info, `${this.idPrefix}${info.selector}_c`);
  }

  upgradeNg1Component(name: string): Type {
    if ((<any>this.downgradedComponents).hasOwnProperty(name)) {
      return this.downgradedComponents[name].type;
    } else {
      return (this.downgradedComponents[name] = new UpgradeNg1ComponentAdapterBuilder(name)).type;
    }
  }

  bootstrap(element: Element, modules?: any[],
            config?: angular.IAngularBootstrapConfig): UpgradeRef {
    var upgrade = new UpgradeRef();
    var ng1Injector: angular.auto.IInjectorService = null;
    var platformRef: PlatformRef = platform();
    var applicationRef: ApplicationRef = platformRef.application([
      applicationCommonBindings(),
      applicationDomBindings(),
      compilerProviders(),
      provide(NG1_INJECTOR, {useFactory: () => ng1Injector}),
      provide(NG1_COMPILE, {useFactory: () => ng1Injector.get(NG1_COMPILE)})
    ]);
    var injector: Injector = applicationRef.injector;
    var ngZone: NgZone = injector.get(NgZone);
    var compiler: Compiler = injector.get(Compiler);
    var delayApplyExps: Function[] = [];
    var original$applyFn: Function;
    var rootScopePrototype: any;
    var rootScope: angular.IRootScopeService;
    var protoViewRefMap: ProtoViewRefMap = {};
    var ng1Module = angular.module(this.idPrefix, modules);
    ng1Module.value(NG2_INJECTOR, injector)
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
            UpgradeNg1ComponentAdapterBuilder.resolve(this.downgradedComponents, injector);
          }
        ]);

    angular.element(element).data(NG1_REQUIRE_INJECTOR_REF, injector);
    ngZone.run(() => { angular.bootstrap(element, [this.idPrefix], config); });
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

  /* @internal */
  private compileNg2Components(compiler: Compiler,
                               protoViewRefMap: ProtoViewRefMap): Promise<ProtoViewRefMap> {
    var promises: Array<Promise<ProtoViewRef>> = [];
    var types = this.upgradedComponents;
    for (var i = 0; i < types.length; i++) {
      promises.push(compiler.compileInHost(types[i]));
    }
    return Promise.all(promises).then((protoViews: Array<ProtoViewRef>) => {
      var types = this.upgradedComponents;
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
          var facade = new DowngradeNg2ComponentAdapter(idPrefix + (idCount++), info, element,
                                                        attrs, scope, <Injector>parentInjector,
                                                        parse, viewManager, protoView);
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
