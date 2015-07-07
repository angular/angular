import {
  Map,
  MapWrapper,
  StringMap,
  StringMapWrapper,
  List,
  ListWrapper
} from 'angular2/src/facade/collection';
import {isPresent, isBlank, normalizeBlank} from 'angular2/src/facade/lang';

import {PathRecognizer} from './path_recognizer';

export class RouteParams {
  constructor(public params: StringMap<string, string>) {}

  get(param: string): string { return normalizeBlank(StringMapWrapper.get(this.params, param)); }
}


/**
 * An `Instruction` represents the component hierarchy of the application based on a given route
 */
export class Instruction {
  // "capturedUrl" is the part of the URL captured by this instruction
  // "accumulatedUrl" is the part of the URL captured by this instruction and all children
  accumulatedUrl: string;
  reuse: boolean = false;
  specificity: number;

  private _params: StringMap<string, string>;

  constructor(public component: any, public capturedUrl: string,
              private _recognizer: PathRecognizer, public child: Instruction = null) {
    this.accumulatedUrl = capturedUrl;
    this.specificity = _recognizer.specificity;
    if (isPresent(child)) {
      this.child = child;
      this.specificity += child.specificity;
      var childUrl = child.accumulatedUrl;
      if (isPresent(childUrl)) {
        this.accumulatedUrl += childUrl;
      }
    }
  }

  params(): StringMap<string, string> {
    if (isBlank(this._params)) {
      this._params = this._recognizer.parseParams(this.capturedUrl);
    }
    return this._params;
  }
}
