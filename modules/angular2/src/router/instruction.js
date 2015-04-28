import {Map, MapWrapper, StringMap, StringMapWrapper,  List, ListWrapper} from 'angular2/src/facade/collection';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {isPresent} from 'angular2/src/facade/lang';

export class RouteParams {
  params:Map<string, string>;
  constructor(params:StringMap) {
    this.params = params;
  }

  get(param:string) {
    return StringMapWrapper.get(this.params, param);
  }
}

export class Instruction {
  component:any;
  _children:Map<string, Instruction>;
  router:any;
  matchedUrl:string;
  params:Map<string, string>;

  constructor({params, component, children, matchedUrl}:{params:StringMap, component:any, children:Map, matchedUrl:string} = {}) {
    this.matchedUrl = matchedUrl;
    if (isPresent(children)) {
      this._children = children;
      var childUrl;
      StringMapWrapper.forEach(this._children, (child, _) => {
        childUrl = child.matchedUrl;
      });
      if (isPresent(childUrl)) {
        this.matchedUrl += childUrl;
      }
    } else {
      this._children = StringMapWrapper.create();
    }
    this.component = component;
    this.params = params;
  }

  getChildInstruction(outletName:string) {
    return StringMapWrapper.get(this._children, outletName);
  }

  forEachChild(fn:Function) {
    StringMapWrapper.forEach(this._children, fn);
  }

  mapChildrenAsync(fn):Promise {
    return mapObjAsync(this._children, fn);
  }

  /**
   * Takes a function:
   * (parent:Instruction, child:Instruction) => {}
   */
  traverseSync(fn:Function) {
    this.forEachChild((childInstruction, _) => fn(this, childInstruction));
    this.forEachChild((childInstruction, _) => childInstruction.traverseSync(fn));
  }
}

function mapObjAsync(obj:StringMap, fn) {
  return PromiseWrapper.all(mapObj(obj, fn));
}

function mapObj(obj:StringMap, fn):List {
  var result = ListWrapper.create();
  StringMapWrapper.forEach(obj, (value, key) => ListWrapper.push(result, fn(value, key)));
  return result;
}

export var noopInstruction = new Instruction();
