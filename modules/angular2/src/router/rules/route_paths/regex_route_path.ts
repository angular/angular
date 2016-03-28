import {RegExpWrapper, RegExpMatcherWrapper, isBlank} from 'angular2/src/facade/lang';
import {Url, RootUrl} from '../../url_parser';
import {RoutePath, GeneratedUrl, MatchedUrl} from './route_path';


export interface RegexSerializer { (params: {[key: string]: any}): GeneratedUrl; }

export class RegexRoutePath implements RoutePath {
  public hash: string;
  public terminal: boolean = true;
  public specificity: string = '2';

  private _regex: RegExp;

  constructor(private _reString: string, private _serializer: RegexSerializer) {
    this.hash = this._reString;
    this._regex = RegExpWrapper.create(this._reString);
  }

  matchUrl(url: Url): MatchedUrl {
    var urlPath = url.toString();
    var params: {[key: string]: string} = {};
    var matcher = RegExpWrapper.matcher(this._regex, urlPath);
    var match = RegExpMatcherWrapper.next(matcher);

    if (isBlank(match)) {
      return null;
    }

    for (let i = 0; i < match.length; i += 1) {
      params[i.toString()] = match[i];
    }

    return new MatchedUrl(urlPath, [], params, [], null);
  }

  generateUrl(params: {[key: string]: any}): GeneratedUrl { return this._serializer(params); }

  toString(): string { return this._reString; }
}
