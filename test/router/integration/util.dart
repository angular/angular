library angular2.test.router.integration.util;

import "package:angular2/core.dart" show provide, Provider, Component, View;
import "package:angular2/src/facade/lang.dart" show Type, isBlank;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
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
        inject,
        beforeEachProviders,
        it,
        xit;
import "package:angular2/src/router/router.dart" show RootRouter;
import "package:angular2/router.dart"
    show Router, ROUTER_DIRECTIVES, ROUTER_PRIMARY_COMPONENT;
import "package:angular2/src/mock/location_mock.dart" show SpyLocation;
import "package:angular2/src/router/location.dart" show Location;
import "package:angular2/src/router/route_registry.dart" show RouteRegistry;
import "package:angular2/src/core/linker/directive_resolver.dart"
    show DirectiveResolver;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
export "package:angular2/testing_internal.dart" show ComponentFixture;

/**
 * Router test helpers and fixtures
 */
@Component(
    selector: "root-comp",
    template: '''<router-outlet></router-outlet>''',
    directives: const [ROUTER_DIRECTIVES])
class RootCmp {
  String name;
}

compile(TestComponentBuilder tcb,
    [String template = "<router-outlet></router-outlet>"]) {
  return tcb
      .overrideTemplate(RootCmp, ("<div>" + template + "</div>"))
      .createAsync(RootCmp);
}

var TEST_ROUTER_PROVIDERS = [
  RouteRegistry,
  DirectiveResolver,
  provide(Location, useClass: SpyLocation),
  provide(ROUTER_PRIMARY_COMPONENT, useValue: RootCmp),
  provide(Router, useClass: RootRouter)
];
clickOnElement(anchorEl) {
  var dispatchedEvent = DOM.createMouseEvent("click");
  DOM.dispatchEvent(anchorEl, dispatchedEvent);
  return dispatchedEvent;
}

getHref(elt) {
  return DOM.getAttribute(elt, "href");
}

/**
 * Router integration suite DSL
 */
var specNameBuilder = [];
// we add the specs themselves onto this map
var specs = {};
void describeRouter(String description, Function fn, [exclusive = false]) {
  var specName = descriptionToSpecName(description);
  specNameBuilder.add(specName);
  describe(description, fn);
  specNameBuilder.removeLast();
}

void ddescribeRouter(String description, Function fn, [exclusive = false]) {
  describeRouter(description, fn, true);
}

void describeWithAndWithout(String description, Function fn) {
  // the "without" case is usually simpler, so we opt to run this spec first
  describeWithout(description, fn);
  describeWith(description, fn);
}

void describeWith(String description, Function fn) {
  var specName = "with " + description;
  specNameBuilder.add(specName);
  describe(specName, fn);
  specNameBuilder.removeLast();
}

void describeWithout(String description, Function fn) {
  var specName = "without " + description;
  specNameBuilder.add(specName);
  describe(specName, fn);
  specNameBuilder.removeLast();
}

String descriptionToSpecName(String description) {
  return spaceCaseToCamelCase(description);
}

// this helper looks up the suite registered from the "impl" folder in this directory
itShouldRoute() {
  var specSuiteName = spaceCaseToCamelCase(specNameBuilder.join(" "));
  var spec = specs[specSuiteName];
  if (isBlank(spec)) {
    throw new BaseException(
        '''Router integration spec suite "${ specSuiteName}" was not found.''');
  } else {
    // todo: remove spec from map, throw if there are extra left over??
    spec();
  }
}

String spaceCaseToCamelCase(String str) {
  var words = str.split(" ");
  var first = words.removeAt(0);
  return first + words.map(title).toList().join("");
}

String title(String str) {
  return str[0].toUpperCase() + str.substring(1);
}
