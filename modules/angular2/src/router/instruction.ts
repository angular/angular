import {
  Map,
  MapWrapper,
  StringMap,
  StringMapWrapper,
  List,
  ListWrapper
} from 'angular2/src/facade/collection';
import {isPresent, normalizeBlank} from 'angular2/src/facade/lang';

export class RouteParams {
  constructor(public params: StringMap<string, string>) {}

  get(param: string): string { return normalizeBlank(StringMapWrapper.get(this.params, param)); }
}

/**
 * An `Instruction` represents the component hierarchy of the application based on a given route
 */
export class Instruction {
  component: any;
  child: Instruction;

  // the part of the URL captured by this instruction
  capturedUrl: string;

  // the part of the URL captured by this instruction and all children
  accumulatedUrl: string;

  params: StringMap<string, string>;
  reuse: boolean;
  specificity: number;

  constructor({params, component, child, matchedUrl, parentSpecificity}: {
    params?: StringMap<string, any>,
    component?: any,
    child?: Instruction,
    matchedUrl?: string,
    parentSpecificity?: number
  } = {}) {
    this.reuse = false;
    this.capturedUrl = matchedUrl;
    this.accumulatedUrl = matchedUrl;
    this.specificity = parentSpecificity;
    if (isPresent(child)) {
      this.child = child;
      this.specificity += child.specificity;
      var childUrl = child.accumulatedUrl;
      if (isPresent(childUrl)) {
        this.accumulatedUrl += childUrl;
      }
    } else {
      this.child = null;
    }
    this.component = component;
    this.params = params;
  }

  hasChild(): boolean { return isPresent(this.child); }

  /**
   * Takes a currently active instruction and sets a reuse flag on each of this instruction's
   * children
   */
  reuseComponentsFrom(oldInstruction: Instruction): void {
    var nextInstruction = this;
    while (nextInstruction.reuse = shouldReuseComponent(nextInstruction, oldInstruction) &&
                                   isPresent(oldInstruction = oldInstruction.child) &&
                                   isPresent(nextInstruction = nextInstruction.child))
      ;
  }
}

function shouldReuseComponent(instr1: Instruction, instr2: Instruction): boolean {
  return instr1.component == instr2.component &&
         StringMapWrapper.equals(instr1.params, instr2.params);
}
