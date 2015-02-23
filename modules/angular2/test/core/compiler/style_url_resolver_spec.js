import {describe, it, expect, beforeEach, ddescribe, iit, xit, el} from 'angular2/test_lib';
import {StyleUrlResolver} from 'angular2/src/core/compiler/style_url_resolver';

import {UrlResolver} from 'angular2/src/core/compiler/url_resolver';

export function main() {
  describe('StyleUrlResolver', () => {
    it('should resolve urls', () => {
      var styleUrlResolver = new StyleUrlResolver(new FakeUrlResolver());
      var css = `
      @import '1.css';
      @import "2.css";
      @import url('3.css');
      @import url("4.css");

      .foo {
        background-image: url("double.jpg");
        background-image: url('simple.jpg');
      }`;
      var expectedCss = `
      @import 'base/1.css';
      @import 'base/2.css';
      @import url('base/3.css');
      @import url('base/4.css');

      .foo {
        background-image: url('base/double.jpg');
        background-image: url('base/simple.jpg');
      }`;

      var resolvedCss = styleUrlResolver.resolveUrls(css, 'base');
      expect(resolvedCss).toEqual(expectedCss);
    });
  });
}

class FakeUrlResolver extends UrlResolver {
  resolve(baseUrl: string, url: string): string {
    return baseUrl + '/' + url;
  }
}
