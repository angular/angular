import {IMPLEMENTS, print} from 'angular2/src/facade/lang';
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {
  isPresent,
  isBlank,
  RegExpWrapper,
  StringWrapper,
  BaseException
} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {Injectable} from 'angular2/di';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';
import {reflector} from 'angular2/src/reflection/reflection';
import {BrowserDomAdapter} from 'angular2/src/dom/browser_adapter';


export function commonDemoSetup(): void {
  BrowserDomAdapter.makeCurrent();
  reflector.reflectionCapabilities = new ReflectionCapabilities();
}

@Injectable()
export class DemoUrlResolver extends UrlResolver {
  static a;

  isInPubServe: boolean;

  constructor() {
    super();
    if (isBlank(UrlResolver.a)) {
      UrlResolver.a = DOM.createElement('a');
    }
    this.isInPubServe = _isInPubServe();
  }

  resolve(baseUrl: string, url: string): string {
    if (isBlank(baseUrl)) {
      DOM.resolveAndSetHref(UrlResolver.a, url, null);
      return DOM.getHref(UrlResolver.a);
    }

    if (isBlank(url) || url == '') {
      return baseUrl;
    }

    if (url[0] == '/') {
      throw new BaseException(`Could not resolve the url ${url} from ${baseUrl}`);
    }

    var m = RegExpWrapper.firstMatch(_schemeRe, url);

    if (isPresent(m[1])) {
      return url;
    }

    if (StringWrapper.startsWith(url, './')) {
      return `${baseUrl}/${url}`;
    }

    // Whether the `examples/` dir is being directly served (as the server root).
    // For cases when this is not true AND we're in pub-serve, `examples/` needs to be
    // prepended to the URL.
    var isDirectlyServingExamplesDir = !StringWrapper.contains(baseUrl, 'examples/');

    if (this.isInPubServe && isDirectlyServingExamplesDir) {
      return `/packages/${url}`;
    } else if (this.isInPubServe) {
      return `/examples/packages/${url}`;
    } else {
      return `/${url}`;
    }
  }
}

var _schemeRe = RegExpWrapper.create('^([^:/?#]+:)?');

// TODO: remove this hack when http://dartbug.com/23128 is fixed
function _isInPubServe(): boolean {
  try {
    int.parse('123');
    print('>> Running in Dart');
    return true;
  } catch (_) {
    print('>> Running in JS');
    return false;
  }
}
