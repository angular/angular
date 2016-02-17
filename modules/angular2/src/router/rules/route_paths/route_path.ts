import {Url} from '../../url_parser';

export interface UrlParams { [key: string]: any }

export class MatchedUrl {
  constructor(public urlPath: string, public urlParams: string[], public allParams: UrlParams,
              public auxiliary: Url[], public rest: Url) {}
}


export class GeneratedUrl {
  constructor(public urlPath: string, public urlParams: UrlParams) {}
}

export interface RoutePath {
  specificity: string;
  terminal: boolean;
  hash: string;
  matchUrl(url: Url): MatchedUrl;
  generateUrl(params: UrlParams): GeneratedUrl;
  toString(): string;
}
