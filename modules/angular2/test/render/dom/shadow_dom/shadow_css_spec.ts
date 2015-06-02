import {
  describe,
  beforeEach,
  it,
  expect,
  ddescribe,
  iit,
  SpyObject,
  el,
  normalizeCSS
} from 'angular2/test_lib';
import {ShadowCss} from 'angular2/src/render/dom/shadow_dom/shadow_css';

import {RegExpWrapper, StringWrapper, isPresent} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';

export function main() {
  describe('ShadowCss', function() {

    function s(css: string, contentAttr: string, hostAttr: string = '') {
      var shadowCss = new ShadowCss();
      var shim = shadowCss.shimCssText(css, contentAttr, hostAttr);
      var nlRegexp = RegExpWrapper.create('\\n');
      return normalizeCSS(StringWrapper.replaceAll(shim, nlRegexp, ''));
    }

    it('should handle empty string', () => { expect(s('', 'a')).toEqual(''); });

    it('should add an attribute to every rule', () => {
      var css = 'one {color: red;}two {color: red;}';
      var expected = 'one[a] {color:red;}two[a] {color:red;}';
      expect(s(css, 'a')).toEqual(expected);
    });

    it('should hanlde invalid css', () => {
      var css = 'one {color: red;}garbage';
      var expected = 'one[a] {color:red;}';
      expect(s(css, 'a')).toEqual(expected);
    });

    it('should add an attribute to every selector', () => {
      var css = 'one, two {color: red;}';
      var expected = 'one[a], two[a] {color:red;}';
      expect(s(css, 'a')).toEqual(expected);
    });

    it('should handle media rules', () => {
      var css = '@media screen and (max-width:800px) {div {font-size:50px;}}';
      var expected = '@media screen and (max-width:800px) {div[a] {font-size:50px;}}';
      expect(s(css, 'a')).toEqual(expected);
    });

    it('should handle media rules with simple rules', () => {
      var css = '@media screen and (max-width: 800px) {div {font-size: 50px;}} div {}';
      var expected = '@media screen and (max-width:800px) {div[a] {font-size:50px;}}div[a] {}';
      expect(s(css, 'a')).toEqual(expected);
    });

    // Check that the browser supports unprefixed CSS animation
    if (isPresent(DOM.defaultDoc().body.style) &&
        isPresent(DOM.defaultDoc().body.style.animationName)) {
      it('should handle keyframes rules', () => {
        var css = '@keyframes foo {0% {transform: translate(-50%) scaleX(0);}}';
        var passRe = RegExpWrapper.create(
            '@keyframes foo {\\s*0% {\\s*transform:translate\\(-50%\\) scaleX\\(0\\);\\s*}\\s*}');
        expect(RegExpWrapper.test(passRe, s(css, 'a'))).toEqual(true);
      });
    }

    if (DOM.getUserAgent().indexOf('AppleWebKit') > -1) {
      it('should handle -webkit-keyframes rules', () => {
        var css = '@-webkit-keyframes foo {0% {-webkit-transform: translate(-50%) scaleX(0);}}';
        var passRe = RegExpWrapper.create(
            '@-webkit-keyframes foo {\\s*0% {\\s*(-webkit-)*transform:translate\\(-50%\\) scaleX\\(0\\);\\s*}}');
        expect(RegExpWrapper.test(passRe, s(css, 'a'))).toEqual(true);
      });
    }

    it('should handle complicated selectors', () => {
      expect(s('one::before {}', 'a')).toEqual('one[a]::before {}');
      expect(s('one two {}', 'a')).toEqual('one[a] two[a] {}');
      expect(s('one>two {}', 'a')).toEqual('one[a] > two[a] {}');
      expect(s('one+two {}', 'a')).toEqual('one[a] + two[a] {}');
      expect(s('one~two {}', 'a')).toEqual('one[a] ~ two[a] {}');
      var res = s('.one.two > three {}', 'a');  // IE swap classes
      expect(res == '.one.two[a] > three[a] {}' || res == '.two.one[a] > three[a] {}')
          .toEqual(true);
      expect(s('one[attr="value"] {}', 'a')).toEqual('one[attr="value"][a] {}');
      expect(s('one[attr=value] {}', 'a')).toEqual('one[attr="value"][a] {}');
      expect(s('one[attr^="value"] {}', 'a')).toEqual('one[attr^="value"][a] {}');
      expect(s('one[attr$="value"] {}', 'a')).toEqual('one[attr$="value"][a] {}');
      expect(s('one[attr*="value"] {}', 'a')).toEqual('one[attr*="value"][a] {}');
      expect(s('one[attr|="value"] {}', 'a')).toEqual('one[attr|="value"][a] {}');
      expect(s('one[attr] {}', 'a')).toEqual('one[attr][a] {}');
      expect(s('[is="one"] {}', 'a')).toEqual('[is="one"][a] {}');
    });

    it('should handle :host', () => {
      expect(s(':host {}', 'a', 'a-host')).toEqual('[a-host] {}');
      expect(s(':host(.x,.y) {}', 'a', 'a-host')).toEqual('[a-host].x, [a-host].y {}');
      expect(s(':host(.x,.y) > .z {}', 'a', 'a-host'))
          .toEqual('[a-host].x > .z, [a-host].y > .z {}');
    });

    it('should handle :host-context', () => {
      expect(s(':host-context(.x) {}', 'a', 'a-host')).toEqual('[a-host].x, .x [a-host] {}');
      expect(s(':host-context(.x) > .y {}', 'a', 'a-host'))
          .toEqual('[a-host].x > .y, .x [a-host] > .y {}');
    });

    it('should support polyfill-next-selector', () => {
      var css = s("polyfill-next-selector {content: 'x > y'} z {}", 'a');
      expect(css).toEqual('x[a] > y[a] {}');

      css = s('polyfill-next-selector {content: "x > y"} z {}', 'a');
      expect(css).toEqual('x[a] > y[a] {}');
    });

    it('should support polyfill-unscoped-rule', () => {
      var css = s("polyfill-unscoped-rule {content: '#menu > .bar';color: blue;}", 'a');
      expect(StringWrapper.contains(css, '#menu > .bar {;color:blue;}')).toBeTruthy();

      css = s('polyfill-unscoped-rule {content: "#menu > .bar";color: blue;}', 'a');
      expect(StringWrapper.contains(css, '#menu > .bar {;color:blue;}')).toBeTruthy();
    });

    it('should support polyfill-rule', () => {
      var css = s("polyfill-rule {content: ':host.foo .bar';color: blue;}", 'a', 'a-host');
      expect(css).toEqual('[a-host].foo .bar {color:blue;}');

      css = s('polyfill-rule {content: ":host.foo .bar";color:blue;}', 'a', 'a-host');
      expect(css).toEqual('[a-host].foo .bar {color:blue;}');
    });

    it('should handle ::shadow', () => {
      var css = s('x::shadow > y {}', 'a');
      expect(css).toEqual('x[a] > y[a] {}');
    });

    it('should handle /deep/', () => {
      var css = s('x /deep/ y {}', 'a');
      expect(css).toEqual('x[a] y[a] {}');
    });

    it('should handle >>>', () => {
      var css = s('x >>> y {}', 'a');
      expect(css).toEqual('x[a] y[a] {}');
    });
  });
}
