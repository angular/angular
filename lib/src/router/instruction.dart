library angular2.src.router.instruction;

import "package:angular2/src/facade/collection.dart"
    show Map, MapWrapper, StringMapWrapper, ListWrapper;
import "package:angular2/src/facade/exceptions.dart" show unimplemented;
import "package:angular2/src/facade/lang.dart" show isPresent, isBlank, Type;
import "package:angular2/src/facade/async.dart" show Future;
import "path_recognizer.dart" show PathRecognizer;
import "url_parser.dart" show Url;

/**
 * `RouteParams` is an immutable map of parameters for the given route
 * based on the url matcher and optional parameters for that route.
 *
 * You can inject `RouteParams` into the constructor of a component to use it.
 *
 * ### Example
 *
 * ```
 * import {bootstrap, Component} from 'angular2/angular2';
 * import {Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig} from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {path: '/user/:id', component: UserCmp, as: 'UserCmp'},
 * ])
 * class AppCmp {}
 *
 * @Component({ template: 'user: {{id}}' })
 * class UserCmp {
 *   id: string;
 *   constructor(params: RouteParams) {
 *     this.id = params.get('id');
 *   }
 * }
 *
 * bootstrap(AppCmp, ROUTER_PROVIDERS);
 * ```
 */
class RouteParams {
  Map<String, String> params;
  RouteParams(this.params) {}
  String get(String param) {
    return StringMapWrapper.get(this.params, param);
  }
}

/**
 * `RouteData` is an immutable map of additional data you can configure in your [Route].
 *
 * You can inject `RouteData` into the constructor of a component to use it.
 *
 * ## Example
 *
 * ```
 * import {bootstrap, Component, View} from 'angular2/angular2';
 * import {Router, ROUTER_DIRECTIVES, routerBindings, RouteConfig} from 'angular2/router';
 *
 * @Component({...})
 * @View({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {path: '/user/:id', component: UserCmp, as: 'UserCmp', data: {isAdmin: true}},
 * ])
 * class AppCmp {}
 *
 * @Component({...})
 * @View({ template: 'user: {{isAdmin}}' })
 * class UserCmp {
 *   string: isAdmin;
 *   constructor(data: RouteData) {
 *     this.isAdmin = data.get('isAdmin');
 *   }
 * }
 *
 * bootstrap(AppCmp, routerBindings(AppCmp));
 * ```
 */
class RouteData {
  Map<String, dynamic> data;
  RouteData([this.data = const {}]) {}
  dynamic get(String key) {
    return StringMapWrapper.get(this.data, key);
  }
}

var BLANK_ROUTE_DATA = new RouteData();

/**
 * `Instruction` is a tree of [ComponentInstruction]s with all the information needed
 * to transition each component in the app to a given route, including all auxiliary routes.
 *
 * `Instruction`s can be created using [Router#generate], and can be used to
 * perform route changes with [Router#navigateByInstruction].
 *
 * ### Example
 *
 * ```
 * import {bootstrap, Component} from 'angular2/angular2';
 * import {Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig} from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   constructor(router: Router) {
 *     var instruction = router.generate(['/MyRoute']);
 *     router.navigateByInstruction(instruction);
 *   }
 * }
 *
 * bootstrap(AppCmp, ROUTER_PROVIDERS);
 * ```
 */
class Instruction {
  ComponentInstruction component;
  Instruction child;
  Map<String, Instruction> auxInstruction;
  Instruction(this.component, this.child, this.auxInstruction) {}
  /**
   * Returns a new instruction that shares the state of the existing instruction, but with
   * the given child [Instruction] replacing the existing child.
   */
  Instruction replaceChild(Instruction child) {
    return new Instruction(this.component, child, this.auxInstruction);
  }
}

/**
 * Represents a partially completed instruction during recognition that only has the
 * primary (non-aux) route instructions matched.
 *
 * `PrimaryInstruction` is an internal class used by `RouteRecognizer` while it's
 * figuring out where to navigate.
 */
class PrimaryInstruction {
  ComponentInstruction component;
  PrimaryInstruction child;
  List<Url> auxUrls;
  PrimaryInstruction(this.component, this.child, this.auxUrls) {}
}

String stringifyInstruction(Instruction instruction) {
  return stringifyInstructionPath(instruction) +
      stringifyInstructionQuery(instruction);
}

String stringifyInstructionPath(Instruction instruction) {
  return instruction.component.urlPath +
      stringifyAux(instruction) +
      stringifyPrimaryPrefixed(instruction.child);
}

String stringifyInstructionQuery(Instruction instruction) {
  return instruction.component.urlParams.length > 0
      ? ("?" + instruction.component.urlParams.join("&"))
      : "";
}

String stringifyPrimaryPrefixed(Instruction instruction) {
  var primary = stringifyPrimary(instruction);
  if (primary.length > 0) {
    primary = "/" + primary;
  }
  return primary;
}

String stringifyPrimary(Instruction instruction) {
  if (isBlank(instruction)) {
    return "";
  }
  var params = instruction.component.urlParams.length > 0
      ? (";" + instruction.component.urlParams.join(";"))
      : "";
  return instruction.component.urlPath +
      params +
      stringifyAux(instruction) +
      stringifyPrimaryPrefixed(instruction.child);
}

String stringifyAux(Instruction instruction) {
  var routes = [];
  StringMapWrapper.forEach(instruction.auxInstruction, (auxInstruction, _) {
    routes.add(stringifyPrimary(auxInstruction));
  });
  if (routes.length > 0) {
    return "(" + routes.join("//") + ")";
  }
  return "";
}

/**
 * A `ComponentInstruction` represents the route state for a single component. An `Instruction` is
 * composed of a tree of these `ComponentInstruction`s.
 *
 * `ComponentInstructions` is a public API. Instances of `ComponentInstruction` are passed
 * to route lifecycle hooks, like [CanActivate].
 *
 * `ComponentInstruction`s are [https://en.wikipedia.org/wiki/Hash_consing](hash consed). You should
 * never construct one yourself with "new." Instead, rely on [Router/PathRecognizer] to
 * construct `ComponentInstruction`s.
 *
 * You should not modify this object. It should be treated as immutable.
 */
abstract class ComponentInstruction {
  bool reuse = false;
  String urlPath;
  List<String> urlParams;
  Map<String, dynamic> params;
  /**
   * Returns the component type of the represented route, or `null` if this instruction
   * hasn't been resolved.
   */
  get componentType {
    return unimplemented();
  }

  /**
   * Returns a promise that will resolve to component type of the represented route.
   * If this instruction references an [AsyncRoute], the `loader` function of that route
   * will run.
   */
  Future<Type> resolveComponentType();
  /**
   * Returns the specificity of the route associated with this `Instruction`.
   */
  get specificity {
    return unimplemented();
  }

  /**
   * Returns `true` if the component type of this instruction has no child [RouteConfig],
   * or `false` if it does.
   */
  get terminal {
    return unimplemented();
  }

  /**
   * Returns the route data of the given route that was specified in the [RouteDefinition],
   * or an empty object if no route data was specified.
   */
  RouteData get routeData {
    return unimplemented();
  }
}

class ComponentInstruction_ extends ComponentInstruction {
  PathRecognizer _recognizer;
  RouteData _routeData;
  ComponentInstruction_(
      String urlPath, List<String> urlParams, this._recognizer,
      [Map<String, dynamic> params = null])
      : super() {
    /* super call moved to initializer */;
    this.urlPath = urlPath;
    this.urlParams = urlParams;
    this.params = params;
    if (isPresent(this._recognizer.handler.data)) {
      this._routeData = new RouteData(this._recognizer.handler.data);
    } else {
      this._routeData = BLANK_ROUTE_DATA;
    }
  }
  get componentType {
    return this._recognizer.handler.componentType;
  }

  Future<Type> resolveComponentType() {
    return this._recognizer.handler.resolveComponentType();
  }

  get specificity {
    return this._recognizer.specificity;
  }

  get terminal {
    return this._recognizer.terminal;
  }

  RouteData get routeData {
    return this._routeData;
  }
}
