import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {BaseException} from 'angular2/src/facade/exceptions';
import {PromiseWrapper} from 'angular2/src/facade/promise';
import {Map} from 'angular2/src/facade/collection';

import {RouteHandler} from './route_handlers/route_handler';
import {Url, serializeParams} from '../url_parser';
import {ComponentInstruction} from '../instruction';
import {ParamRoutePath} from './param_route_path';
import {GeneratedUrl, UrlParams} from './route_path';


// RouteMatch objects hold information about a match between a rule and a URL
export abstract class RouteMatch {}

export class PathMatch extends RouteMatch {
  constructor(public instruction: ComponentInstruction, public remaining: Url,
              public remainingAux: Url[]) {
    super();
  }
}

export class RedirectMatch extends RouteMatch {
  constructor(public redirectTo: any[], public specificity) { super(); }
}

// Rules are responsible for recognizing URL segments and generating instructions
export interface AbstractRule {
  hash: string;
  path: string;
  recognize(beginningSegment: Url): Promise<RouteMatch>;
  generate(params: {[key: string]: any}): ComponentInstruction;
}

export class RedirectRule implements AbstractRule {
  private _pathRecognizer: ParamRoutePath;
  public hash: string;

  constructor(public path: string, public redirectTo: any[]) {
    this._pathRecognizer = new ParamRoutePath(path);
    this.hash = this._pathRecognizer.hash;
  }

  /**
   * Returns `null` or a `ParsedUrl` representing the new path to match
   */
  recognize(beginningSegment: Url): Promise<RouteMatch> {
    var match = null;
    if (isPresent(this._pathRecognizer.matchUrl(beginningSegment))) {
      match = new RedirectMatch(this.redirectTo, this._pathRecognizer.specificity);
    }
    return PromiseWrapper.resolve(match);
  }

  generate(params: {[key: string]: any}): ComponentInstruction {
    throw new BaseException(`Tried to generate a redirect.`);
  }
}


// represents something like '/foo/:bar'
export class RouteRule implements AbstractRule {
  specificity: string;
  terminal: boolean;
  hash: string;

  private _cache: Map<string, ComponentInstruction> = new Map<string, ComponentInstruction>();
  private _pathRecognizer: ParamRoutePath;

  // TODO: cache component instruction instances by params and by ParsedUrl instance

  constructor(public path: string, public handler: RouteHandler) {
    this._pathRecognizer = new ParamRoutePath(path);
    this.specificity = this._pathRecognizer.specificity;
    this.hash = this._pathRecognizer.hash;
    this.terminal = this._pathRecognizer.terminal;
  }

  recognize(beginningSegment: Url): Promise<RouteMatch> {
    var res = this._pathRecognizer.matchUrl(beginningSegment);
    if (isBlank(res)) {
      return null;
    }

    return this.handler.resolveComponentType().then((_) => {
      var componentInstruction = this._getInstruction(res.urlPath, res.urlParams, res.allParams);
      return new PathMatch(componentInstruction, res.rest, res.auxiliary);
    });
  }

  generate(params: {[key: string]: any}): ComponentInstruction {
    var generated = this._pathRecognizer.generateUrl(params);
    var urlPath = generated.urlPath;
    var urlParams = generated.urlParams;
    return this._getInstruction(urlPath, urlParams, params);
  }

  generateComponentPathValues(params: {[key: string]: any}): GeneratedUrl {
    return this._pathRecognizer.generateUrl(params);
  }

  private _getInstruction(urlPath: string, urlParams: UrlParams,
                          params: {[key: string]: any}): ComponentInstruction {
    if (isBlank(this.handler.componentType)) {
      throw new BaseException(`Tried to get instruction before the type was loaded.`);
    }
    var serializedParams = serializeParams(urlParams);

    var hashKey = urlPath + '?' + serializedParams.join('?');
    if (this._cache.has(hashKey)) {
      return this._cache.get(hashKey);
    }
    var instruction = new ComponentInstruction(urlPath, serializedParams, this.handler.data,
                                               this.handler.componentType, this.terminal,
                                               this.specificity, params);
    this._cache.set(hashKey, instruction);

    return instruction;
  }
}
