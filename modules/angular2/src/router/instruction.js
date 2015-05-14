import {Map, MapWrapper, StringMap, StringMapWrapper, List, ListWrapper} from 'angular2/src/facade/collection';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {isPresent, normalizeBlank} from 'angular2/src/facade/lang';

export class RouteParams {
  params:StringMap<string, string>;

  constructor(params:StringMap) {
    this.params = params;
  }

  get(param:string): string {
    return normalizeBlank(StringMapWrapper.get(this.params, param));
  }
}

export class Instruction {
  component:any;
  _children:Map<string, Instruction>;

  // the part of the URL captured by this instruction
  capturedUrl:string;

  // the part of the URL captured by this instruction and all children
  accumulatedUrl:string;

  params:Map<string, string>;
  reuse:boolean;
  cost:number;

  constructor({params, component, children, matchedUrl, parentCost}:{params:StringMap, component:any, children:StringMap, matchedUrl:string, cost:number} = {}) {
    this.reuse = false;
    this.capturedUrl = matchedUrl;
    this.accumulatedUrl = matchedUrl;
    this.cost = parentCost;
    if (isPresent(children)) {
      this._children = children;
      var childUrl;
      StringMapWrapper.forEach(this._children, (child, _) => {
        childUrl = child.accumulatedUrl;
        this.cost += child.cost;
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

  hasChild(outletName:string):Instruction {
    return StringMapWrapper.contains(this._children, outletName);
  }

  getChild(outletName:string):Instruction {
    return StringMapWrapper.get(this._children, outletName);
  }

  forEachChild(fn:Function): void {
    StringMapWrapper.forEach(this._children, fn);
  }

  /**
   * Does a synchronous, breadth-first traversal of the graph of instructions.
   * Takes a function with signature:
   * (parent:Instruction, child:Instruction) => {}
   */
  traverseSync(fn:Function): void {
    this.forEachChild(fn);
    this.forEachChild((childInstruction, _) => childInstruction.traverseSync(fn));
  }


  /**
   * Takes a currently active instruction and sets a reuse flag on this instruction
   */
  reuseComponentsFrom(oldInstruction:Instruction): void {
    this.traverseSync((childInstruction, outletName) => {
      var oldInstructionChild = oldInstruction.getChild(outletName);
      if (shouldReuseComponent(childInstruction, oldInstructionChild)) {
        childInstruction.reuse = true;
      }
    });
  }
}

function shouldReuseComponent(instr1:Instruction, instr2:Instruction): boolean {
  return instr1.component == instr2.component &&
    StringMapWrapper.equals(instr1.params, instr2.params);
}

function mapObjAsync(obj:StringMap, fn): Promise {
  return PromiseWrapper.all(mapObj(obj, fn));
}

function mapObj(obj:StringMap, fn: Function):List {
  var result = ListWrapper.create();
  StringMapWrapper.forEach(obj, (value, key) => ListWrapper.push(result, fn(value, key)));
  return result;
}
