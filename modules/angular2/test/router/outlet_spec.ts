import {
  AsyncTestCompleter,
  TestComponentBuilder,
  asNativeElements,
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
} from 'angular2/test_lib';

import {Injector, bind} from 'angular2/di';
import {Component, View} from 'angular2/metadata';
import {CONST, NumberWrapper, isPresent} from 'angular2/src/facade/lang';
import {
  Promise,
  PromiseWrapper,
  PromiseCompleter,
  EventEmitter,
  ObservableWrapper
} from 'angular2/src/facade/async';

import {RootRouter} from 'angular2/src/router/router';
import {Pipeline} from 'angular2/src/router/pipeline';
import {Router, RouterOutlet, RouterLink, RouteParams} from 'angular2/router';
import {
  RouteConfig,
  Route,
  AuxRoute,
  AsyncRoute,
  Redirect
} from 'angular2/src/router/route_config_decorator';

import {DOM} from 'angular2/src/dom/dom_adapter';

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
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';

var cmpInstanceCount;
var log: List<string>;
var eventBus: EventEmitter;
var completer: PromiseCompleter<any>;

export function main() {
  describe('Outlet Directive', () => {

    var tcb: TestComponentBuilder;
    var rootTC, rtr, location;

    beforeEachBindings(() => [
      Pipeline,
      RouteRegistry,
      DirectiveResolver,
      bind(Location).toClass(SpyLocation),
      bind(Router)
          .toFactory((registry, pipeline,
                      location) => { return new RootRouter(registry, pipeline, location, MyComp); },
                     [RouteRegistry, Pipeline, Location])
    ]);

    beforeEach(inject([TestComponentBuilder, Router, Location], (tcBuilder, router, loc) => {
      tcb = tcBuilder;
      rtr = router;
      location = loc;
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

    it('should work in a simple case', inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config([new Route({path: '/test', component: HelloCmp})]))
             .then((_) => rtr.navigate('/test'))
             .then((_) => {
               rootTC.detectChanges();
               expect(rootTC.nativeElement).toHaveText('hello');
               async.done();
             });
       }));


    it('should navigate between components with different parameters',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config([new Route({path: '/user/:name', component: UserCmp})]))
             .then((_) => rtr.navigate('/user/brian'))
             .then((_) => {
               rootTC.detectChanges();
               expect(rootTC.nativeElement).toHaveText('hello brian');
             })
             .then((_) => rtr.navigate('/user/igor'))
             .then((_) => {
               rootTC.detectChanges();
               expect(rootTC.nativeElement).toHaveText('hello igor');
               async.done();
             });
       }));


    it('should work with child routers', inject([AsyncTestCompleter], (async) => {
         compile('outer { <router-outlet></router-outlet> }')
             .then((_) => rtr.config([new Route({path: '/a/...', component: ParentCmp})]))
             .then((_) => rtr.navigate('/a/b'))
             .then((_) => {
               rootTC.detectChanges();
               expect(rootTC.nativeElement).toHaveText('outer { inner { hello } }');
               async.done();
             });
       }));


    it('should work with redirects', inject([AsyncTestCompleter, Location], (async, location) => {
         compile()
             .then((_) => rtr.config([
               new Redirect({path: '/original', redirectTo: '/redirected'}),
               new Route({path: '/redirected', component: A})
             ]))
             .then((_) => rtr.navigate('/original'))
             .then((_) => {
               rootTC.detectChanges();
               expect(rootTC.nativeElement).toHaveText('A');
               expect(location.urlChanges).toEqual(['/redirected']);
               async.done();
             });
       }));

    function getHref(tc) {
      return DOM.getAttribute(tc.componentViewChildren[0].nativeElement, 'href');
    }

    it('should generate absolute hrefs that include the base href',
       inject([AsyncTestCompleter], (async) => {
         location.setBaseHref('/my/base');
         compile('<a href="hello" [router-link]="[\'./user\']"></a>')
             .then((_) => rtr.config([new Route({path: '/user', component: UserCmp, as: 'user'})]))
             .then((_) => rtr.navigate('/a/b'))
             .then((_) => {
               rootTC.detectChanges();
               expect(getHref(rootTC)).toEqual('/my/base/user');
               async.done();
             });
       }));


    it('should generate link hrefs without params', inject([AsyncTestCompleter], (async) => {
         compile('<a href="hello" [router-link]="[\'./user\']"></a>')
             .then((_) => rtr.config([new Route({path: '/user', component: UserCmp, as: 'user'})]))
             .then((_) => rtr.navigate('/a/b'))
             .then((_) => {
               rootTC.detectChanges();
               expect(getHref(rootTC)).toEqual('/user');
               async.done();
             });
       }));


    it('should reuse common parent components', inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config([new Route({path: '/team/:id/...', component: TeamCmp})]))
             .then((_) => rtr.navigate('/team/angular/user/rado'))
             .then((_) => {
               rootTC.detectChanges();
               expect(cmpInstanceCount).toBe(1);
               expect(rootTC.nativeElement).toHaveText('team angular { hello rado }');
             })
             .then((_) => rtr.navigate('/team/angular/user/victor'))
             .then((_) => {
               rootTC.detectChanges();
               expect(cmpInstanceCount).toBe(1);
               expect(rootTC.nativeElement).toHaveText('team angular { hello victor }');
               async.done();
             });
       }));


    it('should generate link hrefs with params', inject([AsyncTestCompleter], (async) => {
         compile('<a href="hello" [router-link]="[\'./user\', {name: name}]">{{name}}</a>')
             .then((_) => rtr.config(
                       [new Route({path: '/user/:name', component: UserCmp, as: 'user'})]))
             .then((_) => rtr.navigate('/a/b'))
             .then((_) => {
               rootTC.componentInstance.name = 'brian';
               rootTC.detectChanges();
               expect(rootTC.nativeElement).toHaveText('brian');
               expect(DOM.getAttribute(rootTC.componentViewChildren[0].nativeElement, 'href'))
                   .toEqual('/user/brian');
               async.done();
             });
       }));

    it('should generate link hrefs from a child to its sibling',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config(
                       [new Route({path: '/page/:number', component: SiblingPageCmp, as: 'page'})]))
             .then((_) => rtr.navigate('/page/1'))
             .then((_) => {
               rootTC.detectChanges();
               expect(DOM.getAttribute(
                          rootTC.componentViewChildren[1].componentViewChildren[0].nativeElement,
                          'href'))
                   .toEqual('/page/2');
               async.done();
             });
       }));

    it('should generate relative links preserving the existing parent route',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => rtr.config(
                       [new Route({path: '/book/:title/...', component: BookCmp, as: 'book'})]))
             .then((_) => rtr.navigate('/book/1984/page/1'))
             .then((_) => {
               rootTC.detectChanges();
               expect(DOM.getAttribute(
                          rootTC.componentViewChildren[1].componentViewChildren[0].nativeElement,
                          'href'))
                   .toEqual('/book/1984/page/100');

               expect(DOM.getAttribute(rootTC.componentViewChildren[1]
                                           .componentViewChildren[2]
                                           .componentViewChildren[0]
                                           .nativeElement,
                                       'href'))
                   .toEqual('/book/1984/page/2');
               async.done();
             });
       }));


    describe('lifecycle hooks', () => {
      it('should call the onActivate hook', inject([AsyncTestCompleter], (async) => {
           compile()
               .then((_) => rtr.config([new Route({path: '/...', component: LifecycleCmp})]))
               .then((_) => rtr.navigate('/on-activate'))
               .then((_) => {
                 rootTC.detectChanges();
                 expect(rootTC.nativeElement).toHaveText('activate cmp');
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
                 rtr.navigate('/parent-activate/child-activate')
                     .then((_) => {
                       rootTC.detectChanges();
                       expect(rootTC.nativeElement).toHaveText('parent {activate cmp}');
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
               .then((_) => rtr.navigate('/on-deactivate'))
               .then((_) => rtr.navigate('/a'))
               .then((_) => {
                 rootTC.detectChanges();
                 expect(rootTC.nativeElement).toHaveText('A');
                 expect(log).toEqual(['deactivate: /on-deactivate -> /a']);
                 async.done();
               });
         }));

      it('should wait for a child component\'s onDeactivate hook to resolve before calling its parent\'s',
         inject([AsyncTestCompleter], (async) => {
           compile()
               .then((_) => rtr.config([new Route({path: '/...', component: LifecycleCmp})]))
               .then((_) => rtr.navigate('/parent-deactivate/child-deactivate'))
               .then((_) => {
                 ObservableWrapper.subscribe<string>(eventBus, (ev) => {
                   if (ev.startsWith('deactivate')) {
                     completer.resolve(true);
                     rootTC.detectChanges();
                     expect(rootTC.nativeElement).toHaveText('parent {deactivate cmp}');
                   }
                 });
                 rtr.navigate('/a').then((_) => {
                   rootTC.detectChanges();
                   expect(rootTC.nativeElement).toHaveText('A');
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
               .then((_) => rtr.navigate('/on-reuse/1/a'))
               .then((_) => {
                 rootTC.detectChanges();
                 expect(log).toEqual([]);
                 expect(rootTC.nativeElement).toHaveText('reuse {A}');
                 expect(cmpInstanceCount).toBe(1);
               })
               .then((_) => rtr.navigate('/on-reuse/2/b'))
               .then((_) => {
                 rootTC.detectChanges();
                 expect(log).toEqual(['reuse: /on-reuse/1 -> /on-reuse/2']);
                 expect(rootTC.nativeElement).toHaveText('reuse {B}');
                 expect(cmpInstanceCount).toBe(1);
                 async.done();
               });
         }));


      it('should not reuse a component when the canReuse hook returns false',
         inject([AsyncTestCompleter], (async) => {
           compile()
               .then((_) => rtr.config([new Route({path: '/...', component: LifecycleCmp})]))
               .then((_) => rtr.navigate('/never-reuse/1/a'))
               .then((_) => {
                 rootTC.detectChanges();
                 expect(log).toEqual([]);
                 expect(rootTC.nativeElement).toHaveText('reuse {A}');
                 expect(cmpInstanceCount).toBe(1);
               })
               .then((_) => rtr.navigate('/never-reuse/2/b'))
               .then((_) => {
                 rootTC.detectChanges();
                 expect(log).toEqual([]);
                 expect(rootTC.nativeElement).toHaveText('reuse {B}');
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
                 rtr.navigate('/can-activate/a')
                     .then((_) => {
                       rootTC.detectChanges();
                       expect(rootTC.nativeElement).toHaveText('canActivate {A}');
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
                 rtr.navigate('/can-activate/a')
                     .then((_) => {
                       rootTC.detectChanges();
                       expect(rootTC.nativeElement).toHaveText('');
                       expect(log).toEqual(['canActivate: null -> /can-activate']);
                       async.done();
                     });
               });
         }));

      it('should navigate away when canDeactivate returns true',
         inject([AsyncTestCompleter], (async) => {
           compile()
               .then((_) => rtr.config([new Route({path: '/...', component: LifecycleCmp})]))
               .then((_) => rtr.navigate('/can-deactivate/a'))
               .then((_) => {
                 rootTC.detectChanges();
                 expect(rootTC.nativeElement).toHaveText('canDeactivate {A}');
                 expect(log).toEqual([]);

                 ObservableWrapper.subscribe<string>(eventBus, (ev) => {
                   if (ev.startsWith('canDeactivate')) {
                     completer.resolve(true);
                   }
                 });

                 rtr.navigate('/a').then((_) => {
                   rootTC.detectChanges();
                   expect(rootTC.nativeElement).toHaveText('A');
                   expect(log).toEqual(['canDeactivate: /can-deactivate -> /a']);
                   async.done();
                 });
               });
         }));

      it('should not navigate away when canDeactivate returns false',
         inject([AsyncTestCompleter], (async) => {
           compile()
               .then((_) => rtr.config([new Route({path: '/...', component: LifecycleCmp})]))
               .then((_) => rtr.navigate('/can-deactivate/a'))
               .then((_) => {
                 rootTC.detectChanges();
                 expect(rootTC.nativeElement).toHaveText('canDeactivate {A}');
                 expect(log).toEqual([]);

                 ObservableWrapper.subscribe<string>(eventBus, (ev) => {
                   if (ev.startsWith('canDeactivate')) {
                     completer.resolve(false);
                   }
                 });

                 rtr.navigate('/a').then((_) => {
                   rootTC.detectChanges();
                   expect(rootTC.nativeElement).toHaveText('canDeactivate {A}');
                   expect(log).toEqual(['canDeactivate: /can-deactivate -> /a']);
                   async.done();
                 });
               });
         }));


      it('should run activation and deactivation hooks in the correct order',
         inject([AsyncTestCompleter], (async) => {
           compile()
               .then((_) => rtr.config([new Route({path: '/...', component: LifecycleCmp})]))
               .then((_) => rtr.navigate('/activation-hooks/child'))
               .then((_) => {
                 expect(log).toEqual([
                   'canActivate child: null -> /child',
                   'canActivate parent: null -> /activation-hooks',
                   'onActivate parent: null -> /activation-hooks',
                   'onActivate child: null -> /child'
                 ]);

                 log = [];
                 return rtr.navigate('/a');
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
               .then((_) => rtr.navigate('/reuse-hooks/1'))
               .then((_) => {
                 expect(log).toEqual(
                     ['canActivate: null -> /reuse-hooks/1', 'onActivate: null -> /reuse-hooks/1']);

                 ObservableWrapper.subscribe<string>(eventBus, (ev) => {
                   if (ev.startsWith('canReuse')) {
                     completer.resolve(true);
                   }
                 });


                 log = [];
                 return rtr.navigate('/reuse-hooks/2');
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
               .then((_) => rtr.navigate('/reuse-hooks/1'))
               .then((_) => {
                 expect(log).toEqual(
                     ['canActivate: null -> /reuse-hooks/1', 'onActivate: null -> /reuse-hooks/1']);

                 ObservableWrapper.subscribe<string>(eventBus, (ev) => {
                   if (ev.startsWith('canReuse')) {
                     completer.resolve(false);
                   }
                 });

                 log = [];
                 return rtr.navigate('/reuse-hooks/2');
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

    describe('when clicked', () => {

      var clickOnElement = function(view) {
        var anchorEl = rootTC.componentViewChildren[0].nativeElement;
        var dispatchedEvent = DOM.createMouseEvent('click');
        DOM.dispatchEvent(anchorEl, dispatchedEvent);
        return dispatchedEvent;
      };

      it('should navigate to link hrefs without params', inject([AsyncTestCompleter], (async) => {
           compile('<a href="hello" [router-link]="[\'./user\']"></a>')
               .then((_) =>
                         rtr.config([new Route({path: '/user', component: UserCmp, as: 'user'})]))
               .then((_) => rtr.navigate('/a/b'))
               .then((_) => {
                 rootTC.detectChanges();

                 var dispatchedEvent = clickOnElement(rootTC);
                 expect(DOM.isPrevented(dispatchedEvent)).toBe(true);

                 // router navigation is async.
                 rtr.subscribe((_) => {
                   expect(location.urlChanges).toEqual(['/user']);
                   async.done();
                 });
               });
         }));

      it('should navigate to link hrefs in presence of base href',
         inject([AsyncTestCompleter], (async) => {
           location.setBaseHref('/base');
           compile('<a href="hello" [router-link]="[\'./user\']"></a>')
               .then((_) =>
                         rtr.config([new Route({path: '/user', component: UserCmp, as: 'user'})]))
               .then((_) => rtr.navigate('/a/b'))
               .then((_) => {
                 rootTC.detectChanges();

                 var dispatchedEvent = clickOnElement(rootTC);
                 expect(DOM.isPrevented(dispatchedEvent)).toBe(true);

                 // router navigation is async.
                 rtr.subscribe((_) => {
                   expect(location.urlChanges).toEqual(['/base/user']);
                   async.done();
                 });
               });
         }));
    });

    describe('auxillary routes', () => {
      it('should recognize a simple case', inject([AsyncTestCompleter], (async) => {
           compile()
               .then((_) => rtr.config([new Route({path: '/...', component: AuxCmp})]))
               .then((_) => rtr.navigate('/hello(modal)'))
               .then((_) => {
                 rootTC.detectChanges();
                 expect(rootTC.nativeElement).toHaveText('main {hello} | aux {modal}');
                 async.done();
               });
         }));
    });
  });
}


@Component({selector: 'hello-cmp'})
@View({template: "{{greeting}}"})
class HelloCmp {
  greeting: string;
  constructor() { this.greeting = "hello"; }
}


@Component({selector: 'a-cmp'})
@View({template: "A"})
class A {
}


@Component({selector: 'b-cmp'})
@View({template: "B"})
class B {
}


@Component({selector: 'user-cmp'})
@View({template: "hello {{user}}"})
class UserCmp {
  user: string;
  constructor(params: RouteParams) { this.user = params.get('name'); }
}


@Component({selector: 'page-cmp'})
@View({
  template:
      `page #{{pageNumber}} | <a href="hello" [router-link]="[\'../page\', {number: nextPage}]">next</a>`,
  directives: [RouterLink]
})
class SiblingPageCmp {
  pageNumber: number;
  nextPage: number;
  constructor(params: RouteParams) {
    this.pageNumber = NumberWrapper.parseInt(params.get('number'), 10);
    this.nextPage = this.pageNumber + 1;
  }
}

@Component({selector: 'book-cmp'})
@View({
  template: `<a href="hello" [router-link]="[\'./page\', {number: 100}]">{{title}}</a> |
    <router-outlet></router-outlet>`,
  directives: [RouterLink, RouterOutlet]
})
@RouteConfig([new Route({path: '/page/:number', component: SiblingPageCmp, as: 'page'})])
class BookCmp {
  title: string;
  constructor(params: RouteParams) { this.title = params.get('title'); }
}


@Component({selector: 'parent-cmp'})
@View({template: "inner { <router-outlet></router-outlet> }", directives: [RouterOutlet]})
@RouteConfig([new Route({path: '/b', component: HelloCmp})])
class ParentCmp {
  constructor() {}
}


@Component({selector: 'team-cmp'})
@View({template: "team {{id}} { <router-outlet></router-outlet> }", directives: [RouterOutlet]})
@RouteConfig([new Route({path: '/user/:name', component: UserCmp})])
class TeamCmp {
  id: string;
  constructor(params: RouteParams) {
    this.id = params.get('id');
    cmpInstanceCount += 1;
  }
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

@Component({selector: 'modal-cmp'})
@View({template: "modal"})
class ModalCmp {
}

@Component({selector: 'aux-cmp'})
@View({
  template:
      `main {<router-outlet></router-outlet>} | aux {<router-outlet name="modal"></router-outlet>}`,
  directives: [RouterOutlet]
})
@RouteConfig([
  new Route({path: '/hello', component: HelloCmp}),
  new AuxRoute({path: '/modal', component: ModalCmp})
])
class AuxCmp {
}
