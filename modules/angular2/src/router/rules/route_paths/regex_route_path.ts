import {RegExpWrapper, isBlank} from 'angular2/src/facade/lang';
import {Url, RootUrl, serializeParams} from '../../url_parser';
import {RoutePath, GeneratedUrl, MatchedUrl, UrlParams} from './route_path';


export interface RegexSerializer { (params: UrlParams): GeneratedUrl }

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
    var match = RegExpWrapper.firstMatch(this._regex, urlPath);

    if (isBlank(match)) {
      return null;
    }

    var params: UrlParams = {};

    for (let i = 0; i < match.length; i += 1) {
      params[i.toString()] = match[i];
    }

    return new MatchedUrl(urlPath, [], params, [], null);
  }

  generateUrl(params: UrlParams): GeneratedUrl { return this._serializer(params); }

  toString() {
    return this._reString;
  }
}