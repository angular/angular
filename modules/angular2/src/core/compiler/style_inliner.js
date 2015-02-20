import {XHR} from 'angular2/src/core/compiler/xhr/xhr';

import {ListWrapper} from 'angular2/src/facade/collection';
import {
  isBlank,
  RegExp,
  RegExpWrapper,
  StringWrapper,
  normalizeBlank,
} from 'angular2/src/facade/lang';
import {
  Promise,
  PromiseWrapper,
} from 'angular2/src/facade/async';

export class StyleInliner {
  _xhr: XHR;

  constructor(xhr: XHR) {
    this._xhr = xhr;
  }

  // TODO(vicb): handle base url
  // TODO(vicb): Union types: returns either a Promise<string> or a string
  inlineImports(cssText: string) {
    return this._inlineImports(cssText, []);
  }

  _inlineImports(cssText: string, inlinedUrls: List<string>) {
    var partIndex = 0;
    var parts = StringWrapper.split(cssText, _importRe);

    if (parts.length === 1) {
      // no @import rule found, return the original css
      return cssText;
    }

    var promises = [];

    while (partIndex < parts.length - 1) {
      var prefix = parts[partIndex];
      var rule = parts[partIndex + 1];
      var url = _extractUrl(rule);
      var mediaQuery = _extractMediaQuery(rule);

      var promise;
      if (isBlank(url) || ListWrapper.contains(inlinedUrls, url)) {
        // The current import rule has already been inlined, return the prefix only
        // Importing again might cause a circular dependency
        promise = PromiseWrapper.resolve(prefix);
      } else {
        ListWrapper.push(inlinedUrls, url);
        promise = PromiseWrapper.then(
          this._xhr.get(url),
          (css) => {
            // resolve nested @import rules
            css = this._inlineImports(css, inlinedUrls);
            if (PromiseWrapper.isPromise(css)) {
              // wait until nested @import are inlined
              return css.then((css) => prefix + _wrapInMediaRule(css, mediaQuery)+ '\n') ;
            } else {
              // there are no nested @import, return the css
              return prefix + _wrapInMediaRule(css, mediaQuery) + '\n';
            }
          },
          (error) => `/* failed to import ${url} */\n`
        );
      }
      ListWrapper.push(promises, promise);
      partIndex += 2;
    }

    return PromiseWrapper.then(
      PromiseWrapper.all(promises),
      function (cssParts) {
        var cssText = cssParts.join('');
        if (partIndex < parts.length) {
          // append whatever css located after the last @import rule
          cssText += parts[partIndex];
        }
        return cssText;
      },
      function(e) {
        throw 'error';
      }
    );
  }
}

// Extracts the url from an import rule, supported formats:
// - 'url' / "url",
// - url('url') / url("url")
function _extractUrl(importRule: string): string {
  var match = RegExpWrapper.firstMatch(_urlRe, importRule);
  if (isBlank(match)) return null;
  return match[1];
}

// Extracts the media query from an import rule.
// Returns null when there is no media query.
function _extractMediaQuery(importRule: string): string {
  var match = RegExpWrapper.firstMatch(_mediaQueryRe, importRule);
  if (isBlank(match)) return null;
  var mediaQuery = match[1].trim();
  return (mediaQuery.length > 0) ? mediaQuery: null;
}

// Wraps the css in a media rule when the media query is not null
function _wrapInMediaRule(css: string, query: string) {
  return (isBlank(query)) ? css : `@media ${query} {\n${css}\n}`;
}

var _importRe = RegExpWrapper.create('@import\\s+([^;]+);');
var _urlRe = RegExpWrapper.create('(?:url\\(\\s*)?[\'"]([^\'"]+)[\'"]');
var _mediaQueryRe = RegExpWrapper.create('[\'"][^\'"]+[\'"]\\s*\\)?\\s*(.*)');
