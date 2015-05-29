import {
  Map,
  MapWrapper,
  StringMap,
  StringMapWrapper,
  List,
  ListWrapper
} from 'angular2/src/facade/collection';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
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
  private _children: StringMap<string, Instruction>;

  // the part of the URL captured by this instruction
  capturedUrl: string;

  // the part of the URL captured by this instruction and all children
  accumulatedUrl: string;

  params: StringMap<string, string>;
  reuse: boolean;
  specificity: number;

  constructor({params, component, children, matchedUrl, parentSpecificity}: {
    params?: StringMap<string, any>,
    component?: any,
    children?: StringMap<string, Instruction>,
    matchedUrl?: string,
    parentSpecificity?: number
  } = {}) {
    this.reuse = false;
    this.capturedUrl = matchedUrl;
    this.accumulatedUrl = matchedUrl;
    this.specificity = parentSpecificity;
    if (isPresent(children)) {
      this._children = children;
      var childUrl;
      StringMapWrapper.forEach(this._children, (child, _) => {
        childUrl = child.accumulatedUrl;
        this.specificity += child.specificity;
      });
      if (isPresent(childUrl)) {
        this.accumulatedUrl += childUrl;
      }
    } else {
      this._children = StringMapWrapper.create();
    }
    this.component = component;
    this.params = params;
  }

  hasChild(outletName: string): boolean {
    return StringMapWrapper.contains(this._children, outletName);
  }

  /**
   * Returns the child instruction with the given outlet name
   */
  getChild(outletName: string): Instruction {
    return StringMapWrapper.get(this._children, outletName);
  }

  /**
   * (child:Instruction, outletName:string) => {}
   */
  forEachChild(fn: Function): void { StringMapWrapper.forEach(this._children, fn); }

  /**
   * Does a synchronous, breadth-first traversal of the graph of instructions.
   * Takes a function with signature:
   * (child:Instruction, outletName:string) => {}
   */
  traverseSync(fn: Function): void {
    this.forEachChild(fn);
    this.forEachChild((childInstruction, _) => childInstruction.traverseSync(fn));
  }


  /**
   * Takes a currently active instruction and sets a reuse flag on each of this instruction's
   * children
   */
  reuseComponentsFrom(oldInstruction: Instruction): void {
    this.traverseSync((childInstruction, outletName) => {
      var oldInstructionChild = oldInstruction.getChild(outletName);
      if (shouldReuseComponent(childInstruction, oldInstructionChild)) {
        childInstruction.reuse = true;
      }
    });
  }
}

function shouldReuseComponent(instr1: Instruction, instr2: Instruction): boolean {
  return instr1.component == instr2.component &&
         StringMapWrapper.equals(instr1.params, instr2.params);
}

function mapObjAsync(obj: StringMap<string, any>, fn): Promise<List<any>> {
  return PromiseWrapper.all(mapObj(obj, fn));
}

function mapObj(obj: StringMap<any, any>, fn: Function): List<any> {
  var result = ListWrapper.create();
  StringMapWrapper.forEach(obj, (value, key) => ListWrapper.push(result, fn(value, key)));
  return result;
}
