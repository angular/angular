import {
  RootTestComponent,
  AsyncTestCompleter,
  TestComponentBuilder,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  beforeEachBindings,
  it,
  xit
} from 'angular2/testing_internal';

import {provide, Component, Injector, Inject, View} from 'angular2/core';
import {isPresent} from 'angular2/src/core/facade/lang';
import {
  Promise,
  PromiseWrapper,
  PromiseCompleter,
  EventEmitter,
  ObservableWrapper
} from 'angular2/src/core/facade/async';

import {RootRouter} from 'angular2/src/router/router';
import {Router, RouterOutlet, RouterLink, RouteParams, ROUTE_DATA} from 'angular2/router';
import {
  RouteConfig,
  Route,
  AuxRoute,
  AsyncRoute,
  Redirect
} from 'angular2/src/router/route_config_decorator';

import {SpyLocation} from 'angular2/src/mock/location_mock';
import {Location} from 'angular2/src/router/location';
import {RouteRegistry} from 'angular2/src/router/route_registry';
import {
  OnActivate,
  OnDeactivate,
  OnReuse,
  CanDeactivate,
  CanReuse
} from 'angular2/src/router/interfaces';
import {CanActivate} from 'angular2/src/router/lifecycle_annotations';
import {ComponentInstruction} from 'angular2/src/router/instruction';
import {DirectiveResolver} from 'angular2/src/core/linker/directive_resolver';

var cmpInstanceCount;
var log: string[];
var eventBus: EventEmitter<any>;
var completer: PromiseCompleter<any>;

export function main() {
  describe('Router lifecycle hooks', () => {

    var tcb: TestComponentBuilder;
    var rootTC: RootTestComponent;
    var rtr;

    beforeEachBindings(() => [
      RouteRegistry,
      DirectiveResolver,
      provide(Location, {useClass: SpyLocation}),
      provide(Router,
              {
                useFactory:
                    (registry, location) => { return new RootRouter(registry, location, MyComp); },
                deps: [RouteRegistry, Location]
              })
    ]);

    beforeEach(inject([TestComponentBuilder, Router], (tcBuilder, router) => {
      tcb = tcBuilder;
      rtr = router;
      cmpInstanceCount = 0;
      log = [];
      eventBus = new EventEmitter();
    }));

    function compile(template: string = "<router-outlet></router-outlet>") {
      return tcb.overrideView(MyComp, new View({
                                template: ('<div>' + template + '</div>'),
                                directives: [RouterOutlet, RouterLink]
                              }))
          .createAsync(MyComp)
          .then((tc) => { rootTC = tc; });
    }

    it('should call the onActivate hook', inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config([new Route({path: '/...', component: LifecycleCmp})]))
             .then((_) => rtr.navigateByUrl('/on-activate'))
             .then((_) => {
               rootTC.detectChanges();
               expect(rootTC.debugElement.nativeElement).toHaveText('activate cmp');
               expect(log).toEqual(['activate: null -> /on-activate']);
               async.done();
             });
       }));

    it('should wait for a parent component\'s onActivate hook to resolve before calling its child\'s',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config([new Route({path: '/...', component: LifecycleCmp})]))
             .then((_) => {
               ObservableWrapper.subscribe<string>(eventBus, (ev) => {
                 if (ev.startsWith('parent activate')) {
                   completer.resolve(true);
                 }
               });
               rtr.navigateByUrl('/parent-activate/child-activate')
                   .then((_) => {
                     rootTC.detectChanges();
                     expect(rootTC.debugElement.nativeElement).toHaveText('parent {activate cmp}');
                     expect(log).toEqual([
                       'parent activate: null -> /parent-activate',
                       'activate: null -> /child-activate'
                     ]);
                     async.done();
                   });
             });
       }));

    it('should call the onDeactivate hook', inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config([new Route({path: '/...', component: LifecycleCmp})]))
             .then((_) => rtr.navigateByUrl('/on-deactivate'))
             .then((_) => rtr.navigateByUrl('/a'))
             .then((_) => {
               rootTC.detectChanges();
               expect(rootTC.debugElement.nativeElement).toHaveText('A');
               expect(log).toEqual(['deactivate: /on-deactivate -> /a']);
               async.done();
             });
       }));

    it('should wait for a child component\'s onDeactivate hook to resolve before calling its parent\'s',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config([new Route({path: '/...', component: LifecycleCmp})]))
             .then((_) => rtr.navigateByUrl('/parent-deactivate/child-deactivate'))
             .then((_) => {
               ObservableWrapper.subscribe<string>(eventBus, (ev) => {
                 if (ev.startsWith('deactivate')) {
                   completer.resolve(true);
                   rootTC.detectChanges();
                   expect(rootTC.debugElement.nativeElement).toHaveText('parent {deactivate cmp}');
                 }
               });
               rtr.navigateByUrl('/a').then((_) => {
                 rootTC.detectChanges();
                 expect(rootTC.debugElement.nativeElement).toHaveText('A');
                 expect(log).toEqual([
                   'deactivate: /child-deactivate -> null',
                   'parent deactivate: /parent-deactivate -> /a'
                 ]);
                 async.done();
               });
             });
       }));

    it('should reuse a component when the canReuse hook returns true',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config([new Route({path: '/...', component: LifecycleCmp})]))
             .then((_) => rtr.navigateByUrl('/on-reuse/1/a'))
             .then((_) => {
               rootTC.detectChanges();
               expect(log).toEqual([]);
               expect(rootTC.debugElement.nativeElement).toHaveText('reuse {A}');
               expect(cmpInstanceCount).toBe(1);
             })
             .then((_) => rtr.navigateByUrl('/on-reuse/2/b'))
             .then((_) => {
               rootTC.detectChanges();
               expect(log).toEqual(['reuse: /on-reuse/1 -> /on-reuse/2']);
               expect(rootTC.debugElement.nativeElement).toHaveText('reuse {B}');
               expect(cmpInstanceCount).toBe(1);
               async.done();
             });
       }));


    it('should not reuse a component when the canReuse hook returns false',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config([new Route({path: '/...', component: LifecycleCmp})]))
             .then((_) => rtr.navigateByUrl('/never-reuse/1/a'))
             .then((_) => {
               rootTC.detectChanges();
               expect(log).toEqual([]);
               expect(rootTC.debugElement.nativeElement).toHaveText('reuse {A}');
               expect(cmpInstanceCount).toBe(1);
             })
             .then((_) => rtr.navigateByUrl('/never-reuse/2/b'))
             .then((_) => {
               rootTC.detectChanges();
               expect(log).toEqual([]);
               expect(rootTC.debugElement.nativeElement).toHaveText('reuse {B}');
               expect(cmpInstanceCount).toBe(2);
               async.done();
             });
       }));


    it('should navigate when canActivate returns true', inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config([new Route({path: '/...', component: LifecycleCmp})]))
             .then((_) => {
               ObservableWrapper.subscribe<string>(eventBus, (ev) => {
                 if (ev.startsWith('canActivate')) {
                   completer.resolve(true);
                 }
               });
               rtr.navigateByUrl('/can-activate/a')
                   .then((_) => {
                     rootTC.detectChanges();
                     expect(rootTC.debugElement.nativeElement).toHaveText('canActivate {A}');
                     expect(log).toEqual(['canActivate: null -> /can-activate']);
                     async.done();
                   });
             });
       }));

    it('should not navigate when canActivate returns false',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config([new Route({path: '/...', component: LifecycleCmp})]))
             .then((_) => {
               ObservableWrapper.subscribe<string>(eventBus, (ev) => {
                 if (ev.startsWith('canActivate')) {
                   completer.resolve(false);
                 }
               });
               rtr.navigateByUrl('/can-activate/a')
                   .then((_) => {
                     rootTC.detectChanges();
                     expect(rootTC.debugElement.nativeElement).toHaveText('');
                     expect(log).toEqual(['canActivate: null -> /can-activate']);
                     async.done();
                   });
             });
       }));

    it('should navigate away when canDeactivate returns true',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config([new Route({path: '/...', component: LifecycleCmp})]))
             .then((_) => rtr.navigateByUrl('/can-deactivate/a'))
             .then((_) => {
               rootTC.detectChanges();
               expect(rootTC.debugElement.nativeElement).toHaveText('canDeactivate {A}');
               expect(log).toEqual([]);

               ObservableWrapper.subscribe<string>(eventBus, (ev) => {
                 if (ev.startsWith('canDeactivate')) {
                   completer.resolve(true);
                 }
               });

               rtr.navigateByUrl('/a').then((_) => {
                 rootTC.detectChanges();
                 expect(rootTC.debugElement.nativeElement).toHaveText('A');
                 expect(log).toEqual(['canDeactivate: /can-deactivate -> /a']);
                 async.done();
               });
             });
       }));

    it('should not navigate away when canDeactivate returns false',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config([new Route({path: '/...', component: LifecycleCmp})]))
             .then((_) => rtr.navigateByUrl('/can-deactivate/a'))
             .then((_) => {
               rootTC.detectChanges();
               expect(rootTC.debugElement.nativeElement).toHaveText('canDeactivate {A}');
               expect(log).toEqual([]);

               ObservableWrapper.subscribe<string>(eventBus, (ev) => {
                 if (ev.startsWith('canDeactivate')) {
                   completer.resolve(false);
                 }
               });

               rtr.navigateByUrl('/a').then((_) => {
                 rootTC.detectChanges();
                 expect(rootTC.debugElement.nativeElement).toHaveText('canDeactivate {A}');
                 expect(log).toEqual(['canDeactivate: /can-deactivate -> /a']);
                 async.done();
               });
             });
       }));


    it('should run activation and deactivation hooks in the correct order',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config([new Route({path: '/...', component: LifecycleCmp})]))
             .then((_) => rtr.navigateByUrl('/activation-hooks/child'))
             .then((_) => {
               expect(log).toEqual([
                 'canActivate child: null -> /child',
                 'canActivate parent: null -> /activation-hooks',
                 'onActivate parent: null -> /activation-hooks',
                 'onActivate child: null -> /child'
               ]);

               log = [];
               return rtr.navigateByUrl('/a');
             })
             .then((_) => {
               expect(log).toEqual([
                 'canDeactivate parent: /activation-hooks -> /a',
                 'canDeactivate child: /child -> null',
                 'onDeactivate child: /child -> null',
                 'onDeactivate parent: /activation-hooks -> /a'
               ]);
               async.done();
             });
       }));

    it('should only run reuse hooks when reusing', inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config([new Route({path: '/...', component: LifecycleCmp})]))
             .then((_) => rtr.navigateByUrl('/reuse-hooks/1'))
             .then((_) => {
               expect(log).toEqual(
                   ['canActivate: null -> /reuse-hooks/1', 'onActivate: null -> /reuse-hooks/1']);

               ObservableWrapper.subscribe<string>(eventBus, (ev) => {
                 if (ev.startsWith('canReuse')) {
                   completer.resolve(true);
                 }
               });


               log = [];
               return rtr.navigateByUrl('/reuse-hooks/2');
             })
             .then((_) => {
               expect(log).toEqual([
                 'canReuse: /reuse-hooks/1 -> /reuse-hooks/2',
                 'onReuse: /reuse-hooks/1 -> /reuse-hooks/2'
               ]);
               async.done();
             });
       }));

    it('should not run reuse hooks when not reusing', inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config([new Route({path: '/...', component: LifecycleCmp})]))
             .then((_) => rtr.navigateByUrl('/reuse-hooks/1'))
             .then((_) => {
               expect(log).toEqual(
                   ['canActivate: null -> /reuse-hooks/1', 'onActivate: null -> /reuse-hooks/1']);

               ObservableWrapper.subscribe<string>(eventBus, (ev) => {
                 if (ev.startsWith('canReuse')) {
                   completer.resolve(false);
                 }
               });

               log = [];
               return rtr.navigateByUrl('/reuse-hooks/2');
             })
             .then((_) => {
               expect(log).toEqual([
                 'canReuse: /reuse-hooks/1 -> /reuse-hooks/2',
                 'canActivate: /reuse-hooks/1 -> /reuse-hooks/2',
                 'canDeactivate: /reuse-hooks/1 -> /reuse-hooks/2',
                 'onDeactivate: /reuse-hooks/1 -> /reuse-hooks/2',
                 'onActivate: /reuse-hooks/1 -> /reuse-hooks/2'
               ]);
               async.done();
             });
       }));
  });
}


@Component({selector: 'a-cmp'})
@View({template: "A"})
class A {
}


@Component({selector: 'b-cmp'})
@View({template: "B"})
class B {
}


@Component({selector: 'my-comp'})
class MyComp {
  name;
}

function logHook(name: string, next: ComponentInstruction, prev: ComponentInstruction) {
  var message = name + ': ' + (isPresent(prev) ? ('/' + prev.urlPath) : 'null') + ' -> ' +
                (isPresent(next) ? ('/' + next.urlPath) : 'null');
  log.push(message);
  ObservableWrapper.callNext(eventBus, message);
}

@Component({selector: 'activate-cmp'})
@View({template: 'activate cmp'})
class ActivateCmp implements OnActivate {
  onActivate(next: ComponentInstruction, prev: ComponentInstruction) {
    logHook('activate', next, prev);
  }
}

@Component({selector: 'parent-activate-cmp'})
@View({template: `parent {<router-outlet></router-outlet>}`, directives: [RouterOutlet]})
@RouteConfig([new Route({path: '/child-activate', component: ActivateCmp})])
class ParentActivateCmp implements OnActivate {
  onActivate(next: ComponentInstruction, prev: ComponentInstruction): Promise<any> {
    completer = PromiseWrapper.completer();
    logHook('parent activate', next, prev);
    return completer.promise;
  }
}

@Component({selector: 'deactivate-cmp'})
@View({template: 'deactivate cmp'})
class DeactivateCmp implements OnDeactivate {
  onDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
    logHook('deactivate', next, prev);
  }
}

@Component({selector: 'deactivate-cmp'})
@View({template: 'deactivate cmp'})
class WaitDeactivateCmp implements OnDeactivate {
  onDeactivate(next: ComponentInstruction, prev: ComponentInstruction): Promise<any> {
    completer = PromiseWrapper.completer();
    logHook('deactivate', next, prev);
    return completer.promise;
  }
}

@Component({selector: 'parent-deactivate-cmp'})
@View({template: `parent {<router-outlet></router-outlet>}`, directives: [RouterOutlet]})
@RouteConfig([new Route({path: '/child-deactivate', component: WaitDeactivateCmp})])
class ParentDeactivateCmp implements OnDeactivate {
  onDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
    logHook('parent deactivate', next, prev);
  }
}

@Component({selector: 'reuse-cmp'})
@View({template: `reuse {<router-outlet></router-outlet>}`, directives: [RouterOutlet]})
@RouteConfig([new Route({path: '/a', component: A}), new Route({path: '/b', component: B})])
class ReuseCmp implements OnReuse, CanReuse {
  constructor() { cmpInstanceCount += 1; }
  canReuse(next: ComponentInstruction, prev: ComponentInstruction) { return true; }
  onReuse(next: ComponentInstruction, prev: ComponentInstruction) { logHook('reuse', next, prev); }
}

@Component({selector: 'never-reuse-cmp'})
@View({template: `reuse {<router-outlet></router-outlet>}`, directives: [RouterOutlet]})
@RouteConfig([new Route({path: '/a', component: A}), new Route({path: '/b', component: B})])
class NeverReuseCmp implements OnReuse, CanReuse {
  constructor() { cmpInstanceCount += 1; }
  canReuse(next: ComponentInstruction, prev: ComponentInstruction) { return false; }
  onReuse(next: ComponentInstruction, prev: ComponentInstruction) { logHook('reuse', next, prev); }
}

@Component({selector: 'can-activate-cmp'})
@View({template: `canActivate {<router-outlet></router-outlet>}`, directives: [RouterOutlet]})
@RouteConfig([new Route({path: '/a', component: A}), new Route({path: '/b', component: B})])
@CanActivate(CanActivateCmp.canActivate)
class CanActivateCmp {
  static canActivate(next: ComponentInstruction, prev: ComponentInstruction): Promise<boolean> {
    completer = PromiseWrapper.completer();
    logHook('canActivate', next, prev);
    return completer.promise;
  }
}

@Component({selector: 'can-deactivate-cmp'})
@View({template: `canDeactivate {<router-outlet></router-outlet>}`, directives: [RouterOutlet]})
@RouteConfig([new Route({path: '/a', component: A}), new Route({path: '/b', component: B})])
class CanDeactivateCmp implements CanDeactivate {
  canDeactivate(next: ComponentInstruction, prev: ComponentInstruction): Promise<boolean> {
    completer = PromiseWrapper.completer();
    logHook('canDeactivate', next, prev);
    return completer.promise;
  }
}

@Component({selector: 'all-hooks-child-cmp'})
@View({template: `child`})
@CanActivate(AllHooksChildCmp.canActivate)
class AllHooksChildCmp implements CanDeactivate, OnDeactivate, OnActivate {
  canDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
    logHook('canDeactivate child', next, prev);
    return true;
  }

  onDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
    logHook('onDeactivate child', next, prev);
  }

  static canActivate(next: ComponentInstruction, prev: ComponentInstruction) {
    logHook('canActivate child', next, prev);
    return true;
  }

  onActivate(next: ComponentInstruction, prev: ComponentInstruction) {
    logHook('onActivate child', next, prev);
  }
}

@Component({selector: 'all-hooks-parent-cmp'})
@View({template: `<router-outlet></router-outlet>`, directives: [RouterOutlet]})
@RouteConfig([new Route({path: '/child', component: AllHooksChildCmp})])
@CanActivate(AllHooksParentCmp.canActivate)
class AllHooksParentCmp implements CanDeactivate, OnDeactivate, OnActivate {
  canDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
    logHook('canDeactivate parent', next, prev);
    return true;
  }

  onDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
    logHook('onDeactivate parent', next, prev);
  }

  static canActivate(next: ComponentInstruction, prev: ComponentInstruction) {
    logHook('canActivate parent', next, prev);
    return true;
  }

  onActivate(next: ComponentInstruction, prev: ComponentInstruction) {
    logHook('onActivate parent', next, prev);
  }
}

@Component({selector: 'reuse-hooks-cmp'})
@View({template: 'reuse hooks cmp'})
@CanActivate(ReuseHooksCmp.canActivate)
class ReuseHooksCmp implements OnActivate, OnReuse, OnDeactivate, CanReuse, CanDeactivate {
  canReuse(next: ComponentInstruction, prev: ComponentInstruction): Promise<any> {
    completer = PromiseWrapper.completer();
    logHook('canReuse', next, prev);
    return completer.promise;
  }

  onReuse(next: ComponentInstruction, prev: ComponentInstruction) {
    logHook('onReuse', next, prev);
  }

  canDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
    logHook('canDeactivate', next, prev);
    return true;
  }

  onDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
    logHook('onDeactivate', next, prev);
  }

  static canActivate(next: ComponentInstruction, prev: ComponentInstruction) {
    logHook('canActivate', next, prev);
    return true;
  }

  onActivate(next: ComponentInstruction, prev: ComponentInstruction) {
    logHook('onActivate', next, prev);
  }
}

@Component({selector: 'lifecycle-cmp'})
@View({template: `<router-outlet></router-outlet>`, directives: [RouterOutlet]})
@RouteConfig([
  new Route({path: '/a', component: A}),
  new Route({path: '/on-activate', component: ActivateCmp}),
  new Route({path: '/parent-activate/...', component: ParentActivateCmp}),
  new Route({path: '/on-deactivate', component: DeactivateCmp}),
  new Route({path: '/parent-deactivate/...', component: ParentDeactivateCmp}),
  new Route({path: '/on-reuse/:number/...', component: ReuseCmp}),
  new Route({path: '/never-reuse/:number/...', component: NeverReuseCmp}),
  new Route({path: '/can-activate/...', component: CanActivateCmp}),
  new Route({path: '/can-deactivate/...', component: CanDeactivateCmp}),
  new Route({path: '/activation-hooks/...', component: AllHooksParentCmp}),
  new Route({path: '/reuse-hooks/:number', component: ReuseHooksCmp})
])
class LifecycleCmp {
}
