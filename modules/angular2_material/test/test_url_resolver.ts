import {UrlResolver} from 'angular2/src/core/services/url_resolver';

export class TestUrlResolver extends UrlResolver {
  constructor() {
    super();
  }

  resolve(baseUrl: string, url: string): string {
    // The standard UrlResolver looks for "package:" templateUrls in
    // node_modules, however in our repo we host material widgets at the root.
    if (url.startsWith('package:angular2_material/')) {
      return '/base/dist/js/dev/es5/' + url.substring(8);
    }
    return super.resolve(baseUrl, url);
  }
}
