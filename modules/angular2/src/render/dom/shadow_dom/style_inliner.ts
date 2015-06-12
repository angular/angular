import {Injectable} from 'angular2/di';
import {XHR} from 'angular2/src/render/xhr';
import {ListWrapper} from 'angular2/src/facade/collection';

import {UrlResolver} from 'angular2/src/services/url_resolver';
import {StyleUrlResolver} from './style_url_resolver';

import {
  isBlank,
  isPresent,
  RegExp,
  RegExpWrapper,
  StringWrapper,
  normalizeBlank,
} from 'angular2/src/facade/lang';
import {
  Promise,
  PromiseWrapper,
} from 'angular2/src/facade/async';

/**
 * Inline @import rules in the given CSS.
 *
 * When an @import rules is inlined, it's url are rewritten.
 */
@Injectable()
export class StyleInliner {
  constructor(public _xhr: XHR, public _styleUrlResolver: StyleUrlResolver,
              public _urlResolver: UrlResolver) {}

  /**
   * Inline the @imports rules in the given CSS text.
   *
   * The baseUrl is required to rewrite URLs in the inlined content.
   *
   * @param {string} cssText
   * @param {string} baseUrl
   * @returns {*} a Promise<string> when @import rules are present, a string otherwise
   */
  inlineImports(cssText: string, baseUrl: string): Promise<string>| string {
    return this._inlineImports(cssText, baseUrl, []);
  }

  _inlineImports(cssText: string, baseUrl: string, inlinedUrls: List<string>): Promise<string>|
      string {
    var partIndex = 0;
    var parts = StringWrapper.split(cssText, _importRe);

    if (parts.length === 1) {
      // no @import rule found, return the original css
      return cssText;
    }

    var promises = [];

    while (partIndex < parts.length - 1) {
      // prefix is the content before the @import rule
      var prefix = parts[partIndex];
      // rule is the parameter of the @import rule
      var rule = parts[partIndex + 1];
      var url = _extractUrl(rule);
      if (isPresent(url)) {
        url = this._urlResolver.resolve(baseUrl, url);
      }
      var mediaQuery = _extractMediaQuery(rule);
      var promise;

      if (isBlank(url)) {
        promise = PromiseWrapper.resolve(`/* Invalid import rule: "@import ${rule};" */`);
      } else if (ListWrapper.contains(inlinedUrls, url)) {
        // The current import rule has already been inlined, return the prefix only
        // Importing again might cause a circular dependency
        promise = PromiseWrapper.resolve(prefix);
      } else {
        ListWrapper.push(inlinedUrls, url);
        promise = PromiseWrapper.then(this._xhr.get(url), (rawCss) => {
          // resolve nested @import rules
          var inlinedCss = this._inlineImports(rawCss, url, inlinedUrls);
          if (PromiseWrapper.isPromise(inlinedCss)) {
            // wait until nested @import are inlined
            return (<Promise<string>>inlinedCss)
                .then((css) => {return prefix + this._transformImportedCss(css, mediaQuery, url) +
                                       '\n'});
          } else {
            // there are no nested @import, return the css
            return prefix + this._transformImportedCss(<string>inlinedCss, mediaQuery, url) + '\n';
          }
        }, (error) => `/* failed to import ${url} */\n`);
      }
      ListWrapper.push(promises, promise);
      partIndex += 2;
    }

    return PromiseWrapper.all(promises).then(function(cssParts) {
      var cssText = cssParts.join('');
      if (partIndex < parts.length) {
        // append then content located after the last @import rule
        cssText += parts[partIndex];
      }
      return cssText;
    });
  }

  _transformImportedCss(css: string, mediaQuery: string, url: string): string {
    css = this._styleUrlResolver.resolveUrls(css, url);
    return _wrapInMediaRule(css, mediaQuery);
  }
}

// Extracts the url from an import rule, supported formats:
// - 'url' / "url",
// - url(url) / url('url') / url("url")
function _extractUrl(importRule: string): string {
  var match = RegExpWrapper.firstMatch(_urlRe, importRule);
  if (isBlank(match)) return null;
  return isPresent(match[1]) ? match[1] : match[2];
}

// Extracts the media query from an import rule.
// Returns null when there is no media query.
function _extractMediaQuery(importRule: string): string {
  var match = RegExpWrapper.firstMatch(_mediaQueryRe, importRule);
  if (isBlank(match)) return null;
  var mediaQuery = match[1].trim();
  return (mediaQuery.length > 0) ? mediaQuery : null;
}

// Wraps the css in a media rule when the media query is not null
function _wrapInMediaRule(css: string, query: string): string {
  return (isBlank(query)) ? css : `@media ${query} {\n${css}\n}`;
}

var _importRe = RegExpWrapper.create('@import\\s+([^;]+);');
var _urlRe = RegExpWrapper.create(
    'url\\(\\s*?[\'"]?([^\'")]+)[\'"]?|' +  // url(url) or url('url') or url("url")
    '[\'"]([^\'")]+)[\'"]'                  // "url" or 'url'
    );
var _mediaQueryRe = RegExpWrapper.create('[\'"][^\'"]+[\'"]\\s*\\)?\\s*(.*)');
