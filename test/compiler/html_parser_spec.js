var testing_internal_1 = require('angular2/testing_internal');
var html_parser_1 = require('angular2/src/compiler/html_parser');
var html_ast_1 = require('angular2/src/compiler/html_ast');
function main() {
    testing_internal_1.describe('DomParser', function () {
        var parser;
        testing_internal_1.beforeEach(function () { parser = new html_parser_1.HtmlParser(); });
        testing_internal_1.describe('parse', function () {
            testing_internal_1.describe('text nodes', function () {
                testing_internal_1.it('should parse root level text nodes', function () {
                    testing_internal_1.expect(humanizeDom(parser.parse('a', 'TestComp')))
                        .toEqual([[html_ast_1.HtmlTextAst, 'a', 'TestComp > #text(a):nth-child(0)']]);
                });
                testing_internal_1.it('should parse text nodes inside regular elements', function () {
                    testing_internal_1.expect(humanizeDom(parser.parse('<div>a</div>', 'TestComp')))
                        .toEqual([
                        [html_ast_1.HtmlElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [html_ast_1.HtmlTextAst, 'a', 'TestComp > div:nth-child(0) > #text(a):nth-child(0)']
                    ]);
                });
                testing_internal_1.it('should parse text nodes inside template elements', function () {
                    testing_internal_1.expect(humanizeDom(parser.parse('<template>a</template>', 'TestComp')))
                        .toEqual([
                        [html_ast_1.HtmlElementAst, 'template', 'TestComp > template:nth-child(0)'],
                        [html_ast_1.HtmlTextAst, 'a', 'TestComp > template:nth-child(0) > #text(a):nth-child(0)']
                    ]);
                });
            });
            testing_internal_1.describe('elements', function () {
                testing_internal_1.it('should parse root level elements', function () {
                    testing_internal_1.expect(humanizeDom(parser.parse('<div></div>', 'TestComp')))
                        .toEqual([[html_ast_1.HtmlElementAst, 'div', 'TestComp > div:nth-child(0)']]);
                });
                testing_internal_1.it('should parse elements inside of regular elements', function () {
                    testing_internal_1.expect(humanizeDom(parser.parse('<div><span></span></div>', 'TestComp')))
                        .toEqual([
                        [html_ast_1.HtmlElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [html_ast_1.HtmlElementAst, 'span', 'TestComp > div:nth-child(0) > span:nth-child(0)']
                    ]);
                });
                testing_internal_1.it('should parse elements inside of template elements', function () {
                    testing_internal_1.expect(humanizeDom(parser.parse('<template><span></span></template>', 'TestComp')))
                        .toEqual([
                        [html_ast_1.HtmlElementAst, 'template', 'TestComp > template:nth-child(0)'],
                        [html_ast_1.HtmlElementAst, 'span', 'TestComp > template:nth-child(0) > span:nth-child(0)']
                    ]);
                });
            });
            testing_internal_1.describe('attributes', function () {
                testing_internal_1.it('should parse attributes on regular elements', function () {
                    testing_internal_1.expect(humanizeDom(parser.parse('<div k="v"></div>', 'TestComp')))
                        .toEqual([
                        [html_ast_1.HtmlElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [html_ast_1.HtmlAttrAst, 'k', 'v', 'TestComp > div:nth-child(0)[k=v]']
                    ]);
                });
                testing_internal_1.it('should parse attributes on svg elements case sensitive', function () {
                    testing_internal_1.expect(humanizeDom(parser.parse('<svg viewBox="0"></svg>', 'TestComp')))
                        .toEqual([
                        [html_ast_1.HtmlElementAst, 'svg', 'TestComp > svg:nth-child(0)'],
                        [html_ast_1.HtmlAttrAst, 'viewBox', '0', 'TestComp > svg:nth-child(0)[viewBox=0]']
                    ]);
                });
                testing_internal_1.it('should parse attributes on template elements', function () {
                    testing_internal_1.expect(humanizeDom(parser.parse('<template k="v"></template>', 'TestComp')))
                        .toEqual([
                        [html_ast_1.HtmlElementAst, 'template', 'TestComp > template:nth-child(0)'],
                        [html_ast_1.HtmlAttrAst, 'k', 'v', 'TestComp > template:nth-child(0)[k=v]']
                    ]);
                });
            });
        });
        testing_internal_1.describe('unparse', function () {
            testing_internal_1.it('should unparse text nodes', function () { testing_internal_1.expect(parser.unparse(parser.parse('a', null))).toEqual('a'); });
            testing_internal_1.it('should unparse elements', function () { testing_internal_1.expect(parser.unparse(parser.parse('<a></a>', null))).toEqual('<a></a>'); });
            testing_internal_1.it('should unparse attributes', function () {
                testing_internal_1.expect(parser.unparse(parser.parse('<div a b="c"></div>', null)))
                    .toEqual('<div a="" b="c"></div>');
            });
            testing_internal_1.it('should unparse nested elements', function () {
                testing_internal_1.expect(parser.unparse(parser.parse('<div><a></a></div>', null)))
                    .toEqual('<div><a></a></div>');
            });
            testing_internal_1.it('should unparse nested text nodes', function () {
                testing_internal_1.expect(parser.unparse(parser.parse('<div>a</div>', null))).toEqual('<div>a</div>');
            });
        });
    });
}
exports.main = main;
function humanizeDom(asts) {
    var humanizer = new Humanizer();
    html_ast_1.htmlVisitAll(humanizer, asts);
    return humanizer.result;
}
var Humanizer = (function () {
    function Humanizer() {
        this.result = [];
    }
    Humanizer.prototype.visitElement = function (ast, context) {
        this.result.push([html_ast_1.HtmlElementAst, ast.name, ast.sourceInfo]);
        html_ast_1.htmlVisitAll(this, ast.attrs);
        html_ast_1.htmlVisitAll(this, ast.children);
        return null;
    };
    Humanizer.prototype.visitAttr = function (ast, context) {
        this.result.push([html_ast_1.HtmlAttrAst, ast.name, ast.value, ast.sourceInfo]);
        return null;
    };
    Humanizer.prototype.visitText = function (ast, context) {
        this.result.push([html_ast_1.HtmlTextAst, ast.value, ast.sourceInfo]);
        return null;
    };
    return Humanizer;
})();
//# sourceMappingURL=html_parser_spec.js.map