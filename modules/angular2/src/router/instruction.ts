import {
  Map,
  MapWrapper,
  StringMap,
  StringMapWrapper,
  ListWrapper
} from 'angular2/src/core/facade/collection';
import {isPresent, isBlank, normalizeBlank, Type} from 'angular2/src/core/facade/lang';
import {Promise} from 'angular2/src/core/facade/async';

import {PathRecognizer} from './path_recognizer';
import {Url} from './url_parser';

export class RouteParams {
  constructor(public params: StringMap<string, string>) {}

  get(param: string): string { return normalizeBlank(StringMapWrapper.get(this.params, param)); }
}

/**
 * `Instruction` is a tree of `ComponentInstructions`, with all the information needed
 * to transition each component in the app to a given route, including all auxiliary routes.
 *
 * This is a public API.
 */
export class Instruction {
  constructor(public component: ComponentInstruction, public child: Instruction,
              public auxInstruction: StringMap<string, Instruction>) {}

  replaceChild(child: Instruction): Instruction {
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
export class PrimaryInstruction {
  constructor(public component: ComponentInstruction, public child: PrimaryInstruction,
              public auxUrls: Url[]) {}
}

export function stringifyInstruction(instruction: Instruction): string {
  var params = instruction.component.urlParams.length > 0 ?
                   ('?' + instruction.component.urlParams.join('&')) :
                   '';

  return instruction.component.urlPath + stringifyAux(instruction) +
         stringifyPrimary(instruction.child) + params;
}

function stringifyPrimary(instruction: Instruction): string {
  if (isBlank(instruction)) {
    return '';
  }
  var params = instruction.component.urlParams.length > 0 ?
                   (';' + instruction.component.urlParams.join(';')) :
                   '';
  return '/' + instruction.component.urlPath + params + stringifyAux(instruction) +
         stringifyPrimary(instruction.child);
}

function stringifyAux(instruction: Instruction): string {
  var routes = [];
  StringMapWrapper.forEach(instruction.auxInstruction, (auxInstruction, _) => {
    routes.push(stringifyPrimary(auxInstruction));
  });
  if (routes.length > 0) {
    return '(' + routes.join('//') + ')';
  }
  return '';
}


/**
 * A `ComponentInstruction` represents the route state for a single component. An `Instruction` is
 * composed of a tree of these `ComponentInstruction`s.
 *
 * `ComponentInstructions` is a public API. Instances of `ComponentInstruction` are passed
 * to route lifecycle hooks, like {@link CanActivate}.
 *
 * `ComponentInstruction`s are [https://en.wikipedia.org/wiki/Hash_consing](hash consed). You should
 * never construct one yourself with "new." Instead, rely on {@link PathRecognizer} to construct
 * `ComponentInstruction`s.
 *
 * You should not modify this object. It should be treated as immutable.
 */
export class ComponentInstruction {
  reuse: boolean = false;

  constructor(public urlPath: string, public urlParams: string[],
              private _recognizer: PathRecognizer, public params: StringMap<string, any> = null) {}

  get componentType() { return this._recognizer.handler.componentType; }

  resolveComponentType(): Promise<Type> { return this._recognizer.handler.resolveComponentType(); }

  get specificity() { return this._recognizer.specificity; }

  get terminal() { return this._recognizer.terminal; }

  routeData(): Object { return this._recognizer.handler.data; }
}
