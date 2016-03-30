import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {BaseException} from 'angular2/src/facade/exceptions';
import {PromiseWrapper} from 'angular2/src/facade/promise';
import {Map} from 'angular2/src/facade/collection';

import {RouteHandler} from './route_handlers/route_handler';
import {Url, convertUrlParamsToArray} from '../url_parser';
import {ComponentInstruction} from '../instruction';
import {RoutePath} from './route_paths/route_path';
import {GeneratedUrl} from './route_paths/route_path';


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
  public hash: string;

  constructor(private _pathRecognizer: RoutePath, public redirectTo: any[]) {
    this.hash = this._pathRecognizer.hash;
  }

  get path() { return this._pathRecognizer.toString(); }
  set path(val) { throw new BaseException('you cannot set the path of a RedirectRule directly'); }

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

  // TODO: cache component instruction instances by params and by ParsedUrl instance

  constructor(private _routePath: RoutePath, public handler: RouteHandler,
              private _routeName: string) {
    this.specificity = this._routePath.specificity;
    this.hash = this._routePath.hash;
    this.terminal = this._routePath.terminal;
  }

  get path() { return this._routePath.toString(); }
  set path(val) { throw new BaseException('you cannot set the path of a RouteRule directly'); }

  recognize(beginningSegment: Url): Promise<RouteMatch> {
    var res = this._routePath.matchUrl(beginningSegment);
    if (isBlank(res)) {
      return null;
    }

    return this.handler.resolveComponentType().then((_) => {
      var componentInstruction = this._getInstruction(res.urlPath, res.urlParams, res.allParams);
      return new PathMatch(componentInstruction, res.rest, res.auxiliary);
    });
  }

  generate(params: {[key: string]: any}): ComponentInstruction {
    var generated = this._routePath.generateUrl(params);
    var urlPath = generated.urlPath;
    var urlParams = generated.urlParams;
    return this._getInstruction(urlPath, convertUrlParamsToArray(urlParams), params);
  }

  generateComponentPathValues(params: {[key: string]: any}): GeneratedUrl {
    return this._routePath.generateUrl(params);
  }

  private _getInstruction(urlPath: string, urlParams: string[],
                          params: {[key: string]: any}): ComponentInstruction {
    if (isBlank(this.handler.componentType)) {
      throw new BaseException(`Tried to get instruction before the type was loaded.`);
    }
    var hashKey = urlPath + '?' + urlParams.join('&');
    if (this._cache.has(hashKey)) {
      return this._cache.get(hashKey);
    }
    var instruction =
        new ComponentInstruction(urlPath, urlParams, this.handler.data, this.handler.componentType,
                                 this.terminal, this.specificity, params, this._routeName);
    this._cache.set(hashKey, instruction);

    return instruction;
  }
}
