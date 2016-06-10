import {
  AsyncTestCompleter,
  beforeEach,
  beforeEachProviders,
  expect,
  iit,
  flushMicrotasks,
  inject,
  it,
  TestComponentBuilder,
  ComponentFixture,
  xit,
  describe,
  ddescribe
} from 'angular2/testing_internal';

import {PromiseWrapper} from 'angular2/src/facade/async';
import {ListWrapper} from 'angular2/src/facade/collection';

import {ComponentResolver, ComponentFactory, Component} from 'angular2/core';
import {
  Router,
  Route,
  RouterOutlet,
  RouteConfig,
  OnActivate,
  ComponentInstruction
} from 'angular2/router';
import {TEST_ROUTER_PROVIDERS, compile} from './util';
import * as route_config_impl from 'angular2/src/router/route_config/route_config_impl';

export function main() {
  describe('Router with ComponentFactories', () => {
    var fixture: ComponentFixture;
    var tcb: TestComponentBuilder;
    var rtr: Router;
    var cr: ComponentResolver;

    beforeEachProviders(() => TEST_ROUTER_PROVIDERS);

    beforeEach(inject([TestComponentBuilder, Router, ComponentResolver],
                      (tcBuilder, router, componentResolver) => {
                        tcb = tcBuilder;
                        rtr = router;
                        cr = componentResolver;

                        log = [];
                      }));

    function resolveCompFactoryRecursive(
        cmp: any, cmpFactories: Map<any, ComponentFactory>): ComponentFactory {
      var cmpFactory = cmpFactories.get(cmp);
      var newMeta = cmpFactory.metadata.map((meta) => {
        if (meta instanceof route_config_impl.RouteConfig) {
          var configs: any[] = meta.configs;
          meta = new route_config_impl.RouteConfig(
              configs.map((route) => new Route({
                            path: route.path,
                            component: resolveCompFactoryRecursive(route.component, cmpFactories)
                          })));
        }
        return meta;
      });
      return ComponentFactory.cloneWithMetadata(cmpFactory, newMeta);
    }

    function init(mainComp: any): Promise<ComponentFactory> {
      return PromiseWrapper.all(ALL_COMPONENTS.map((cmp) => cr.resolveComponent(cmp)))
          .then((cmpFactories) => {
            var cmpFactoriesMap = new Map<any, ComponentFactory>();
            ListWrapper.forEachWithIndex(
                ALL_COMPONENTS, (cmp, index) => { cmpFactoriesMap.set(cmp, cmpFactories[index]); });
            return resolveCompFactoryRecursive(mainComp, cmpFactoriesMap);
          });
    }

    it('should support routing to a ComponentFactory', inject([AsyncTestCompleter], (async) => {
         var cf: ComponentFactory;
         compile(tcb)
             .then((rtc) => {
               fixture = rtc;
               return init(MainCmp);
             })
             .then((mainCmpFactory) =>
                       rtr.config([new Route({path: '/...', component: mainCmpFactory})]))
             .then((_) => rtr.navigateByUrl('/hello'))
             .then((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement).toHaveText('hello');
               async.done();
             });
       }));

    it('should call the routerOnActivate hook', inject([AsyncTestCompleter], (async) => {
         compile(tcb)
             .then((rtc) => {
               fixture = rtc;
               return init(MainCmp);
             })
             .then((mainCmpFactory) =>
                       rtr.config([new Route({path: '/...', component: mainCmpFactory})]))
             .then((_) => rtr.navigateByUrl('/on-activate'))
             .then((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement).toHaveText('activate cmp');
               expect(log.length).toBe(1);
               expect(log[0][0]).toEqual('activate');
               expect(log[0][1].componentType).toBeAnInstanceOf(ComponentFactory);
               expect(log[0][1].componentType.componentType).toBe(ActivateCmp);
               async.done();
             });
       }));


  });
}

var log: any[];

@Component({selector: 'activate-cmp', template: 'activate cmp'})
class ActivateCmp implements OnActivate {
  routerOnActivate(next: ComponentInstruction, prev: ComponentInstruction) {
    log.push(['activate', next, prev]);
  }
}

@Component({selector: 'hello-cmp', template: 'hello'})
class HelloCmp {
}

@Component({
  selector: 'lifecycle-cmp',
  template: `<router-outlet></router-outlet>`,
  directives: [RouterOutlet]
})
@RouteConfig([
  new Route({path: '/hello', component: HelloCmp}),
  new Route({path: '/on-activate', component: ActivateCmp}),
])
class MainCmp {
}

var ALL_COMPONENTS = [MainCmp, ActivateCmp, HelloCmp];
