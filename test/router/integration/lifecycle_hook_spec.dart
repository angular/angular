library angular2.test.router.integration.lifecycle_hook_spec;

import "package:angular2/testing_internal.dart"
    show
        ComponentFixture,
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
        beforeEachProviders,
        it,
        xit;
import "package:angular2/core.dart"
    show provide, Component, Injector, Inject, View;
import "package:angular2/src/facade/lang.dart" show isPresent;
import "package:angular2/src/facade/async.dart"
    show
        Future,
        PromiseWrapper,
        PromiseCompleter,
        EventEmitter,
        ObservableWrapper;
import "package:angular2/router.dart"
    show Router, RouterOutlet, RouterLink, RouteParams;
import "package:angular2/src/router/route_config_decorator.dart"
    show RouteConfig, Route, AuxRoute, AsyncRoute, Redirect;
import "package:angular2/src/router/interfaces.dart"
    show OnActivate, OnDeactivate, OnReuse, CanDeactivate, CanReuse;
import "package:angular2/src/router/lifecycle_annotations.dart"
    show CanActivate;
import "package:angular2/src/router/instruction.dart" show ComponentInstruction;
import "util.dart" show TEST_ROUTER_PROVIDERS, RootCmp, compile;

var cmpInstanceCount;
List<String> log;
EventEmitter<dynamic> eventBus;
PromiseCompleter<dynamic> completer;
main() {
  describe("Router lifecycle hooks", () {
    TestComponentBuilder tcb;
    ComponentFixture fixture;
    var rtr;
    beforeEachProviders(() => TEST_ROUTER_PROVIDERS);
    beforeEach(inject([TestComponentBuilder, Router], (tcBuilder, router) {
      tcb = tcBuilder;
      rtr = router;
      cmpInstanceCount = 0;
      log = [];
      eventBus = new EventEmitter();
    }));
    it(
        "should call the routerOnActivate hook",
        inject([AsyncTestCompleter], (async) {
          compile(tcb).then((rtc) {
            fixture = rtc;
          })
              .then((_) => rtr
                  .config([new Route(path: "/...", component: LifecycleCmp)]))
              .then((_) => rtr.navigateByUrl("/on-activate"))
              .then((_) {
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement)
                .toHaveText("activate cmp");
            expect(log).toEqual(["activate: null -> /on-activate"]);
            async.done();
          });
        }));
    it(
        "should wait for a parent component's routerOnActivate hook to resolve before calling its child's",
        inject([AsyncTestCompleter], (async) {
          compile(tcb).then((rtc) {
            fixture = rtc;
          })
              .then((_) => rtr
                  .config([new Route(path: "/...", component: LifecycleCmp)]))
              .then((_) {
            ObservableWrapper.subscribe(eventBus, (ev) {
              if (ev.startsWith("parent activate")) {
                completer.resolve(true);
              }
            });
            rtr.navigateByUrl("/parent-activate/child-activate").then((_) {
              fixture.detectChanges();
              expect(fixture.debugElement.nativeElement)
                  .toHaveText("parent {activate cmp}");
              expect(log).toEqual([
                "parent activate: null -> /parent-activate",
                "activate: null -> /child-activate"
              ]);
              async.done();
            });
          });
        }));
    it(
        "should call the routerOnDeactivate hook",
        inject([AsyncTestCompleter], (async) {
          compile(tcb).then((rtc) {
            fixture = rtc;
          })
              .then((_) => rtr
                  .config([new Route(path: "/...", component: LifecycleCmp)]))
              .then((_) => rtr.navigateByUrl("/on-deactivate"))
              .then((_) => rtr.navigateByUrl("/a"))
              .then((_) {
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement).toHaveText("A");
            expect(log).toEqual(["deactivate: /on-deactivate -> /a"]);
            async.done();
          });
        }));
    it(
        "should wait for a child component's routerOnDeactivate hook to resolve before calling its parent's",
        inject([AsyncTestCompleter], (async) {
          compile(tcb).then((rtc) {
            fixture = rtc;
          })
              .then((_) => rtr
                  .config([new Route(path: "/...", component: LifecycleCmp)]))
              .then((_) =>
                  rtr.navigateByUrl("/parent-deactivate/child-deactivate"))
              .then((_) {
            ObservableWrapper.subscribe(eventBus, (ev) {
              if (ev.startsWith("deactivate")) {
                completer.resolve(true);
                fixture.detectChanges();
                expect(fixture.debugElement.nativeElement)
                    .toHaveText("parent {deactivate cmp}");
              }
            });
            rtr.navigateByUrl("/a").then((_) {
              fixture.detectChanges();
              expect(fixture.debugElement.nativeElement).toHaveText("A");
              expect(log).toEqual([
                "deactivate: /child-deactivate -> null",
                "parent deactivate: /parent-deactivate -> /a"
              ]);
              async.done();
            });
          });
        }));
    it(
        "should reuse a component when the routerCanReuse hook returns true",
        inject([AsyncTestCompleter], (async) {
          compile(tcb).then((rtc) {
            fixture = rtc;
          })
              .then((_) => rtr
                  .config([new Route(path: "/...", component: LifecycleCmp)]))
              .then((_) => rtr.navigateByUrl("/on-reuse/1/a"))
              .then((_) {
            fixture.detectChanges();
            expect(log).toEqual([]);
            expect(fixture.debugElement.nativeElement).toHaveText("reuse {A}");
            expect(cmpInstanceCount).toBe(1);
          }).then((_) => rtr.navigateByUrl("/on-reuse/2/b")).then((_) {
            fixture.detectChanges();
            expect(log).toEqual(["reuse: /on-reuse/1 -> /on-reuse/2"]);
            expect(fixture.debugElement.nativeElement).toHaveText("reuse {B}");
            expect(cmpInstanceCount).toBe(1);
            async.done();
          });
        }));
    it(
        "should not reuse a component when the routerCanReuse hook returns false",
        inject([AsyncTestCompleter], (async) {
          compile(tcb).then((rtc) {
            fixture = rtc;
          })
              .then((_) => rtr
                  .config([new Route(path: "/...", component: LifecycleCmp)]))
              .then((_) => rtr.navigateByUrl("/never-reuse/1/a"))
              .then((_) {
            fixture.detectChanges();
            expect(log).toEqual([]);
            expect(fixture.debugElement.nativeElement).toHaveText("reuse {A}");
            expect(cmpInstanceCount).toBe(1);
          }).then((_) => rtr.navigateByUrl("/never-reuse/2/b")).then((_) {
            fixture.detectChanges();
            expect(log).toEqual([]);
            expect(fixture.debugElement.nativeElement).toHaveText("reuse {B}");
            expect(cmpInstanceCount).toBe(2);
            async.done();
          });
        }));
    it(
        "should navigate when routerCanActivate returns true",
        inject([AsyncTestCompleter], (async) {
          compile(tcb).then((rtc) {
            fixture = rtc;
          })
              .then((_) => rtr
                  .config([new Route(path: "/...", component: LifecycleCmp)]))
              .then((_) {
            ObservableWrapper.subscribe(eventBus, (ev) {
              if (ev.startsWith("routerCanActivate")) {
                completer.resolve(true);
              }
            });
            rtr.navigateByUrl("/can-activate/a").then((_) {
              fixture.detectChanges();
              expect(fixture.debugElement.nativeElement)
                  .toHaveText("routerCanActivate {A}");
              expect(log).toEqual(["routerCanActivate: null -> /can-activate"]);
              async.done();
            });
          });
        }));
    it(
        "should not navigate when routerCanActivate returns false",
        inject([AsyncTestCompleter], (async) {
          compile(tcb).then((rtc) {
            fixture = rtc;
          })
              .then((_) => rtr
                  .config([new Route(path: "/...", component: LifecycleCmp)]))
              .then((_) {
            ObservableWrapper.subscribe(eventBus, (ev) {
              if (ev.startsWith("routerCanActivate")) {
                completer.resolve(false);
              }
            });
            rtr.navigateByUrl("/can-activate/a").then((_) {
              fixture.detectChanges();
              expect(fixture.debugElement.nativeElement).toHaveText("");
              expect(log).toEqual(["routerCanActivate: null -> /can-activate"]);
              async.done();
            });
          });
        }));
    it(
        "should navigate away when routerCanDeactivate returns true",
        inject([AsyncTestCompleter], (async) {
          compile(tcb).then((rtc) {
            fixture = rtc;
          })
              .then((_) => rtr
                  .config([new Route(path: "/...", component: LifecycleCmp)]))
              .then((_) => rtr.navigateByUrl("/can-deactivate/a"))
              .then((_) {
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement)
                .toHaveText("routerCanDeactivate {A}");
            expect(log).toEqual([]);
            ObservableWrapper.subscribe(eventBus, (ev) {
              if (ev.startsWith("routerCanDeactivate")) {
                completer.resolve(true);
              }
            });
            rtr.navigateByUrl("/a").then((_) {
              fixture.detectChanges();
              expect(fixture.debugElement.nativeElement).toHaveText("A");
              expect(log)
                  .toEqual(["routerCanDeactivate: /can-deactivate -> /a"]);
              async.done();
            });
          });
        }));
    it(
        "should not navigate away when routerCanDeactivate returns false",
        inject([AsyncTestCompleter], (async) {
          compile(tcb).then((rtc) {
            fixture = rtc;
          })
              .then((_) => rtr
                  .config([new Route(path: "/...", component: LifecycleCmp)]))
              .then((_) => rtr.navigateByUrl("/can-deactivate/a"))
              .then((_) {
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement)
                .toHaveText("routerCanDeactivate {A}");
            expect(log).toEqual([]);
            ObservableWrapper.subscribe(eventBus, (ev) {
              if (ev.startsWith("routerCanDeactivate")) {
                completer.resolve(false);
              }
            });
            rtr.navigateByUrl("/a").then((_) {
              fixture.detectChanges();
              expect(fixture.debugElement.nativeElement)
                  .toHaveText("routerCanDeactivate {A}");
              expect(log)
                  .toEqual(["routerCanDeactivate: /can-deactivate -> /a"]);
              async.done();
            });
          });
        }));
    it(
        "should run activation and deactivation hooks in the correct order",
        inject([AsyncTestCompleter], (async) {
          compile(tcb).then((rtc) {
            fixture = rtc;
          })
              .then((_) => rtr
                  .config([new Route(path: "/...", component: LifecycleCmp)]))
              .then((_) => rtr.navigateByUrl("/activation-hooks/child"))
              .then((_) {
            expect(log).toEqual([
              "routerCanActivate child: null -> /child",
              "routerCanActivate parent: null -> /activation-hooks",
              "routerOnActivate parent: null -> /activation-hooks",
              "routerOnActivate child: null -> /child"
            ]);
            log = [];
            return rtr.navigateByUrl("/a");
          }).then((_) {
            expect(log).toEqual([
              "routerCanDeactivate parent: /activation-hooks -> /a",
              "routerCanDeactivate child: /child -> null",
              "routerOnDeactivate child: /child -> null",
              "routerOnDeactivate parent: /activation-hooks -> /a"
            ]);
            async.done();
          });
        }));
    it(
        "should only run reuse hooks when reusing",
        inject([AsyncTestCompleter], (async) {
          compile(tcb).then((rtc) {
            fixture = rtc;
          })
              .then((_) => rtr
                  .config([new Route(path: "/...", component: LifecycleCmp)]))
              .then((_) => rtr.navigateByUrl("/reuse-hooks/1"))
              .then((_) {
            expect(log).toEqual([
              "routerCanActivate: null -> /reuse-hooks/1",
              "routerOnActivate: null -> /reuse-hooks/1"
            ]);
            ObservableWrapper.subscribe(eventBus, (ev) {
              if (ev.startsWith("routerCanReuse")) {
                completer.resolve(true);
              }
            });
            log = [];
            return rtr.navigateByUrl("/reuse-hooks/2");
          }).then((_) {
            expect(log).toEqual([
              "routerCanReuse: /reuse-hooks/1 -> /reuse-hooks/2",
              "routerOnReuse: /reuse-hooks/1 -> /reuse-hooks/2"
            ]);
            async.done();
          });
        }));
    it(
        "should not run reuse hooks when not reusing",
        inject([AsyncTestCompleter], (async) {
          compile(tcb)
              .then((_) => rtr
                  .config([new Route(path: "/...", component: LifecycleCmp)]))
              .then((_) => rtr.navigateByUrl("/reuse-hooks/1"))
              .then((_) {
            expect(log).toEqual([
              "routerCanActivate: null -> /reuse-hooks/1",
              "routerOnActivate: null -> /reuse-hooks/1"
            ]);
            ObservableWrapper.subscribe(eventBus, (ev) {
              if (ev.startsWith("routerCanReuse")) {
                completer.resolve(false);
              }
            });
            log = [];
            return rtr.navigateByUrl("/reuse-hooks/2");
          }).then((_) {
            expect(log).toEqual([
              "routerCanReuse: /reuse-hooks/1 -> /reuse-hooks/2",
              "routerCanActivate: /reuse-hooks/1 -> /reuse-hooks/2",
              "routerCanDeactivate: /reuse-hooks/1 -> /reuse-hooks/2",
              "routerOnDeactivate: /reuse-hooks/1 -> /reuse-hooks/2",
              "routerOnActivate: /reuse-hooks/1 -> /reuse-hooks/2"
            ]);
            async.done();
          });
        }));
  });
}

@Component(selector: "a-cmp", template: "A")
class A {}

@Component(selector: "b-cmp", template: "B")
class B {}

logHook(String name, ComponentInstruction next, ComponentInstruction prev) {
  var message = name +
      ": " +
      (isPresent(prev) ? ("/" + prev.urlPath) : "null") +
      " -> " +
      (isPresent(next) ? ("/" + next.urlPath) : "null");
  log.add(message);
  ObservableWrapper.callEmit(eventBus, message);
}

@Component(selector: "activate-cmp", template: "activate cmp")
class ActivateCmp implements OnActivate {
  routerOnActivate(ComponentInstruction next, ComponentInstruction prev) {
    logHook("activate", next, prev);
  }
}

@Component(
    selector: "parent-activate-cmp",
    template: '''parent {<router-outlet></router-outlet>}''',
    directives: const [RouterOutlet])
@RouteConfig(
    const [const Route(path: "/child-activate", component: ActivateCmp)])
class ParentActivateCmp implements OnActivate {
  Future<dynamic> routerOnActivate(
      ComponentInstruction next, ComponentInstruction prev) {
    completer = PromiseWrapper.completer();
    logHook("parent activate", next, prev);
    return completer.promise;
  }
}

@Component(selector: "deactivate-cmp", template: "deactivate cmp")
class DeactivateCmp implements OnDeactivate {
  routerOnDeactivate(ComponentInstruction next, ComponentInstruction prev) {
    logHook("deactivate", next, prev);
  }
}

@Component(selector: "deactivate-cmp", template: "deactivate cmp")
class WaitDeactivateCmp implements OnDeactivate {
  Future<dynamic> routerOnDeactivate(
      ComponentInstruction next, ComponentInstruction prev) {
    completer = PromiseWrapper.completer();
    logHook("deactivate", next, prev);
    return completer.promise;
  }
}

@Component(
    selector: "parent-deactivate-cmp",
    template: '''parent {<router-outlet></router-outlet>}''',
    directives: const [RouterOutlet])
@RouteConfig(const [
  const Route(path: "/child-deactivate", component: WaitDeactivateCmp)
])
class ParentDeactivateCmp implements OnDeactivate {
  routerOnDeactivate(ComponentInstruction next, ComponentInstruction prev) {
    logHook("parent deactivate", next, prev);
  }
}

@Component(
    selector: "reuse-cmp",
    template: '''reuse {<router-outlet></router-outlet>}''',
    directives: const [RouterOutlet])
@RouteConfig(const [
  const Route(path: "/a", component: A),
  const Route(path: "/b", component: B)
])
class ReuseCmp implements OnReuse, CanReuse {
  ReuseCmp() {
    cmpInstanceCount += 1;
  }
  routerCanReuse(ComponentInstruction next, ComponentInstruction prev) {
    return true;
  }

  routerOnReuse(ComponentInstruction next, ComponentInstruction prev) {
    logHook("reuse", next, prev);
  }
}

@Component(
    selector: "never-reuse-cmp",
    template: '''reuse {<router-outlet></router-outlet>}''',
    directives: const [RouterOutlet])
@RouteConfig(const [
  const Route(path: "/a", component: A),
  const Route(path: "/b", component: B)
])
class NeverReuseCmp implements OnReuse, CanReuse {
  NeverReuseCmp() {
    cmpInstanceCount += 1;
  }
  routerCanReuse(ComponentInstruction next, ComponentInstruction prev) {
    return false;
  }

  routerOnReuse(ComponentInstruction next, ComponentInstruction prev) {
    logHook("reuse", next, prev);
  }
}

@Component(
    selector: "can-activate-cmp",
    template: '''routerCanActivate {<router-outlet></router-outlet>}''',
    directives: const [RouterOutlet])
@RouteConfig(const [
  const Route(path: "/a", component: A),
  const Route(path: "/b", component: B)
])
@CanActivate(CanActivateCmp.routerCanActivate)
class CanActivateCmp {
  static Future<bool> routerCanActivate(
      ComponentInstruction next, ComponentInstruction prev) {
    completer = PromiseWrapper.completer();
    logHook("routerCanActivate", next, prev);
    return completer.promise;
  }
}

@Component(
    selector: "can-deactivate-cmp",
    template: '''routerCanDeactivate {<router-outlet></router-outlet>}''',
    directives: const [RouterOutlet])
@RouteConfig(const [
  const Route(path: "/a", component: A),
  const Route(path: "/b", component: B)
])
class CanDeactivateCmp implements CanDeactivate {
  Future<bool> routerCanDeactivate(
      ComponentInstruction next, ComponentInstruction prev) {
    completer = PromiseWrapper.completer();
    logHook("routerCanDeactivate", next, prev);
    return completer.promise;
  }
}

@Component(selector: "all-hooks-child-cmp", template: '''child''')
@CanActivate(AllHooksChildCmp.routerCanActivate)
class AllHooksChildCmp implements CanDeactivate, OnDeactivate, OnActivate {
  routerCanDeactivate(ComponentInstruction next, ComponentInstruction prev) {
    logHook("routerCanDeactivate child", next, prev);
    return true;
  }

  routerOnDeactivate(ComponentInstruction next, ComponentInstruction prev) {
    logHook("routerOnDeactivate child", next, prev);
  }

  static routerCanActivate(
      ComponentInstruction next, ComponentInstruction prev) {
    logHook("routerCanActivate child", next, prev);
    return true;
  }

  routerOnActivate(ComponentInstruction next, ComponentInstruction prev) {
    logHook("routerOnActivate child", next, prev);
  }
}

@Component(
    selector: "all-hooks-parent-cmp",
    template: '''<router-outlet></router-outlet>''',
    directives: const [RouterOutlet])
@RouteConfig(const [const Route(path: "/child", component: AllHooksChildCmp)])
@CanActivate(AllHooksParentCmp.routerCanActivate)
class AllHooksParentCmp implements CanDeactivate, OnDeactivate, OnActivate {
  routerCanDeactivate(ComponentInstruction next, ComponentInstruction prev) {
    logHook("routerCanDeactivate parent", next, prev);
    return true;
  }

  routerOnDeactivate(ComponentInstruction next, ComponentInstruction prev) {
    logHook("routerOnDeactivate parent", next, prev);
  }

  static routerCanActivate(
      ComponentInstruction next, ComponentInstruction prev) {
    logHook("routerCanActivate parent", next, prev);
    return true;
  }

  routerOnActivate(ComponentInstruction next, ComponentInstruction prev) {
    logHook("routerOnActivate parent", next, prev);
  }
}

@Component(selector: "reuse-hooks-cmp", template: "reuse hooks cmp")
@CanActivate(ReuseHooksCmp.routerCanActivate)
class ReuseHooksCmp
    implements OnActivate, OnReuse, OnDeactivate, CanReuse, CanDeactivate {
  Future<dynamic> routerCanReuse(
      ComponentInstruction next, ComponentInstruction prev) {
    completer = PromiseWrapper.completer();
    logHook("routerCanReuse", next, prev);
    return completer.promise;
  }

  routerOnReuse(ComponentInstruction next, ComponentInstruction prev) {
    logHook("routerOnReuse", next, prev);
  }

  routerCanDeactivate(ComponentInstruction next, ComponentInstruction prev) {
    logHook("routerCanDeactivate", next, prev);
    return true;
  }

  routerOnDeactivate(ComponentInstruction next, ComponentInstruction prev) {
    logHook("routerOnDeactivate", next, prev);
  }

  static routerCanActivate(
      ComponentInstruction next, ComponentInstruction prev) {
    logHook("routerCanActivate", next, prev);
    return true;
  }

  routerOnActivate(ComponentInstruction next, ComponentInstruction prev) {
    logHook("routerOnActivate", next, prev);
  }
}

@Component(
    selector: "lifecycle-cmp",
    template: '''<router-outlet></router-outlet>''',
    directives: const [RouterOutlet])
@RouteConfig(const [
  const Route(path: "/a", component: A),
  const Route(path: "/on-activate", component: ActivateCmp),
  const Route(path: "/parent-activate/...", component: ParentActivateCmp),
  const Route(path: "/on-deactivate", component: DeactivateCmp),
  const Route(path: "/parent-deactivate/...", component: ParentDeactivateCmp),
  const Route(path: "/on-reuse/:number/...", component: ReuseCmp),
  const Route(path: "/never-reuse/:number/...", component: NeverReuseCmp),
  const Route(path: "/can-activate/...", component: CanActivateCmp),
  const Route(path: "/can-deactivate/...", component: CanDeactivateCmp),
  const Route(path: "/activation-hooks/...", component: AllHooksParentCmp),
  const Route(path: "/reuse-hooks/:number", component: ReuseHooksCmp)
])
class LifecycleCmp {}
