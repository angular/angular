import {UrlSegment, Tree} from './segments';
import {BaseException} from 'angular2/src/facade/exceptions';

export abstract class RouterUrlParser { abstract parse(url: string): Tree<UrlSegment>; }

export class DefaultRouterUrlParser extends RouterUrlParser {
  parse(url: string): Tree<UrlSegment> {
    if (url.length === 0) {
      throw new BaseException(`Invalid url '${url}'`);
    }
    return new Tree<UrlSegment>(this._parseNodes(url));
  }

  private _parseNodes(url: string): UrlSegment[] {
    let index = url.indexOf("/", 1);
    let children: UrlSegment[];
    let currentUrl;
    if (index > -1) {
      children = this._parseNodes(url.substring(index + 1));
      currentUrl = url.substring(0, index);
    } else {
      children = [];
      currentUrl = url;
    }
    return [new UrlSegment(currentUrl, {}, "")].concat(children);
  }
}