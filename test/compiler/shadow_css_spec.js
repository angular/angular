var testing_internal_1 = require('angular2/testing_internal');
var shadow_css_1 = require('angular2/src/compiler/shadow_css');
var lang_1 = require('angular2/src/facade/lang');
function main() {
    testing_internal_1.describe('ShadowCss', function () {
        function s(css, contentAttr, hostAttr) {
            if (hostAttr === void 0) { hostAttr = ''; }
            var shadowCss = new shadow_css_1.ShadowCss();
            var shim = shadowCss.shimCssText(css, contentAttr, hostAttr);
            var nlRegexp = /\n/g;
            return testing_internal_1.normalizeCSS(lang_1.StringWrapper.replaceAll(shim, nlRegexp, ''));
        }
        testing_internal_1.it('should handle empty string', function () { testing_internal_1.expect(s('', 'a')).toEqual(''); });
        testing_internal_1.it('should add an attribute to every rule', function () {
            var css = 'one {color: red;}two {color: red;}';
            var expected = 'one[a] {color:red;}two[a] {color:red;}';
            testing_internal_1.expect(s(css, 'a')).toEqual(expected);
        });
        testing_internal_1.it('should handle invalid css', function () {
            var css = 'one {color: red;}garbage';
            var expected = 'one[a] {color:red;}garbage';
            testing_internal_1.expect(s(css, 'a')).toEqual(expected);
        });
        testing_internal_1.it('should add an attribute to every selector', function () {
            var css = 'one, two {color: red;}';
            var expected = 'one[a], two[a] {color:red;}';
            testing_internal_1.expect(s(css, 'a')).toEqual(expected);
        });
        testing_internal_1.it('should support newlines in the selector and content ', function () {
            var css = 'one, \ntwo {\ncolor: red;}';
            var expected = 'one[a], two[a] {color:red;}';
            testing_internal_1.expect(s(css, 'a')).toEqual(expected);
        });
        testing_internal_1.it('should handle media rules', function () {
            var css = '@media screen and (max-width:800px, max-height:100%) {div {font-size:50px;}}';
            var expected = '@media screen and (max-width:800px, max-height:100%) {div[a] {font-size:50px;}}';
            testing_internal_1.expect(s(css, 'a')).toEqual(expected);
        });
        testing_internal_1.it('should handle media rules with simple rules', function () {
            var css = '@media screen and (max-width: 800px) {div {font-size: 50px;}} div {}';
            var expected = '@media screen and (max-width:800px) {div[a] {font-size:50px;}} div[a] {}';
            testing_internal_1.expect(s(css, 'a')).toEqual(expected);
        });
        // Check that the browser supports unprefixed CSS animation
        testing_internal_1.it('should handle keyframes rules', function () {
            var css = '@keyframes foo {0% {transform:translate(-50%) scaleX(0);}}';
            testing_internal_1.expect(s(css, 'a')).toEqual(css);
        });
        testing_internal_1.it('should handle -webkit-keyframes rules', function () {
            var css = '@-webkit-keyframes foo {0% {-webkit-transform:translate(-50%) scaleX(0);}}';
            testing_internal_1.expect(s(css, 'a')).toEqual(css);
        });
        testing_internal_1.it('should handle complicated selectors', function () {
            testing_internal_1.expect(s('one::before {}', 'a')).toEqual('one[a]::before {}');
            testing_internal_1.expect(s('one two {}', 'a')).toEqual('one[a] two[a] {}');
            testing_internal_1.expect(s('one > two {}', 'a')).toEqual('one[a] > two[a] {}');
            testing_internal_1.expect(s('one + two {}', 'a')).toEqual('one[a] + two[a] {}');
            testing_internal_1.expect(s('one ~ two {}', 'a')).toEqual('one[a] ~ two[a] {}');
            var res = s('.one.two > three {}', 'a'); // IE swap classes
            testing_internal_1.expect(res == '.one.two[a] > three[a] {}' || res == '.two.one[a] > three[a] {}')
                .toEqual(true);
            testing_internal_1.expect(s('one[attr="value"] {}', 'a')).toEqual('one[attr="value"][a] {}');
            testing_internal_1.expect(s('one[attr=value] {}', 'a')).toEqual('one[attr="value"][a] {}');
            testing_internal_1.expect(s('one[attr^="value"] {}', 'a')).toEqual('one[attr^="value"][a] {}');
            testing_internal_1.expect(s('one[attr$="value"] {}', 'a')).toEqual('one[attr$="value"][a] {}');
            testing_internal_1.expect(s('one[attr*="value"] {}', 'a')).toEqual('one[attr*="value"][a] {}');
            testing_internal_1.expect(s('one[attr|="value"] {}', 'a')).toEqual('one[attr|="value"][a] {}');
            testing_internal_1.expect(s('one[attr] {}', 'a')).toEqual('one[attr][a] {}');
            testing_internal_1.expect(s('[is="one"] {}', 'a')).toEqual('[is="one"][a] {}');
        });
        testing_internal_1.it('should handle :host', function () {
            testing_internal_1.expect(s(':host {}', 'a', 'a-host')).toEqual('[a-host] {}');
            testing_internal_1.expect(s(':host(.x,.y) {}', 'a', 'a-host')).toEqual('[a-host].x, [a-host].y {}');
            testing_internal_1.expect(s(':host(.x,.y) > .z {}', 'a', 'a-host'))
                .toEqual('[a-host].x > .z, [a-host].y > .z {}');
        });
        testing_internal_1.it('should handle :host-context', function () {
            testing_internal_1.expect(s(':host-context(.x) {}', 'a', 'a-host')).toEqual('[a-host].x, .x [a-host] {}');
            testing_internal_1.expect(s(':host-context(.x) > .y {}', 'a', 'a-host'))
                .toEqual('[a-host].x > .y, .x [a-host] > .y {}');
        });
        testing_internal_1.it('should support polyfill-next-selector', function () {
            var css = s("polyfill-next-selector {content: 'x > y'} z {}", 'a');
            testing_internal_1.expect(css).toEqual('x[a] > y[a]{}');
            css = s('polyfill-next-selector {content: "x > y"} z {}', 'a');
            testing_internal_1.expect(css).toEqual('x[a] > y[a]{}');
        });
        testing_internal_1.it('should support polyfill-unscoped-rule', function () {
            var css = s("polyfill-unscoped-rule {content: '#menu > .bar';color: blue;}", 'a');
            testing_internal_1.expect(lang_1.StringWrapper.contains(css, '#menu > .bar {;color:blue;}')).toBeTruthy();
            css = s('polyfill-unscoped-rule {content: "#menu > .bar";color: blue;}', 'a');
            testing_internal_1.expect(lang_1.StringWrapper.contains(css, '#menu > .bar {;color:blue;}')).toBeTruthy();
        });
        testing_internal_1.it('should support multiple instances polyfill-unscoped-rule', function () {
            var css = s("polyfill-unscoped-rule {content: 'foo';color: blue;}" +
                "polyfill-unscoped-rule {content: 'bar';color: blue;}", 'a');
            testing_internal_1.expect(lang_1.StringWrapper.contains(css, 'foo {;color:blue;}')).toBeTruthy();
            testing_internal_1.expect(lang_1.StringWrapper.contains(css, 'bar {;color:blue;}')).toBeTruthy();
        });
        testing_internal_1.it('should support polyfill-rule', function () {
            var css = s("polyfill-rule {content: ':host.foo .bar';color: blue;}", 'a', 'a-host');
            testing_internal_1.expect(css).toEqual('[a-host].foo .bar {;color:blue;}');
            css = s('polyfill-rule {content: ":host.foo .bar";color:blue;}', 'a', 'a-host');
            testing_internal_1.expect(css).toEqual('[a-host].foo .bar {;color:blue;}');
        });
        testing_internal_1.it('should handle ::shadow', function () {
            var css = s('x::shadow > y {}', 'a');
            testing_internal_1.expect(css).toEqual('x[a] > y[a] {}');
        });
        testing_internal_1.it('should handle /deep/', function () {
            var css = s('x /deep/ y {}', 'a');
            testing_internal_1.expect(css).toEqual('x[a] y[a] {}');
        });
        testing_internal_1.it('should handle >>>', function () {
            var css = s('x >>> y {}', 'a');
            testing_internal_1.expect(css).toEqual('x[a] y[a] {}');
        });
        testing_internal_1.it('should pass through @import directives', function () {
            var styleStr = '@import url("https://fonts.googleapis.com/css?family=Roboto");';
            var css = s(styleStr, 'a');
            testing_internal_1.expect(css).toEqual(styleStr);
        });
        testing_internal_1.it('should shim rules after @import', function () {
            var styleStr = '@import url("a"); div {}';
            var css = s(styleStr, 'a');
            testing_internal_1.expect(css).toEqual('@import url("a"); div[a] {}');
        });
        testing_internal_1.it('should leave calc() unchanged', function () {
            var styleStr = 'div {height:calc(100% - 55px);}';
            var css = s(styleStr, 'a');
            testing_internal_1.expect(css).toEqual('div[a] {height:calc(100% - 55px);}');
        });
        testing_internal_1.it('should strip comments', function () { testing_internal_1.expect(s('/* x */b {c}', 'a')).toEqual('b[a] {c}'); });
        testing_internal_1.it('should ignore special characters in comments', function () { testing_internal_1.expect(s('/* {;, */b {c}', 'a')).toEqual('b[a] {c}'); });
        testing_internal_1.it('should support multiline comments', function () { testing_internal_1.expect(s('/* \n */b {c}', 'a')).toEqual('b[a] {c}'); });
    });
    testing_internal_1.describe('processRules', function () {
        testing_internal_1.describe('parse rules', function () {
            function captureRules(input) {
                var result = [];
                shadow_css_1.processRules(input, function (cssRule) {
                    result.push(cssRule);
                    return cssRule;
                });
                return result;
            }
            testing_internal_1.it('should work with empty css', function () { testing_internal_1.expect(captureRules('')).toEqual([]); });
            testing_internal_1.it('should capture a rule without body', function () { testing_internal_1.expect(captureRules('a;')).toEqual([new shadow_css_1.CssRule('a', '')]); });
            testing_internal_1.it('should capture css rules with body', function () { testing_internal_1.expect(captureRules('a {b}')).toEqual([new shadow_css_1.CssRule('a', 'b')]); });
            testing_internal_1.it('should capture css rules with nested rules', function () {
                testing_internal_1.expect(captureRules('a {b {c}} d {e}'))
                    .toEqual([new shadow_css_1.CssRule('a', 'b {c}'), new shadow_css_1.CssRule('d', 'e')]);
            });
            testing_internal_1.it('should capture mutiple rules where some have no body', function () {
                testing_internal_1.expect(captureRules('@import a ; b {c}'))
                    .toEqual([new shadow_css_1.CssRule('@import a', ''), new shadow_css_1.CssRule('b', 'c')]);
            });
        });
        testing_internal_1.describe('modify rules', function () {
            testing_internal_1.it('should allow to change the selector while preserving whitespaces', function () {
                testing_internal_1.expect(shadow_css_1.processRules('@import a; b {c {d}} e {f}', function (cssRule) { return new shadow_css_1.CssRule(cssRule.selector + '2', cssRule.content); }))
                    .toEqual('@import a2; b2 {c {d}} e2 {f}');
            });
            testing_internal_1.it('should allow to change the content', function () {
                testing_internal_1.expect(shadow_css_1.processRules('a {b}', function (cssRule) { return new shadow_css_1.CssRule(cssRule.selector, cssRule.content + '2'); }))
                    .toEqual('a {b2}');
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=shadow_css_spec.js.map