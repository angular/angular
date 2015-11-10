var testing_internal_1 = require('angular2/testing_internal');
var html_parser_1 = require('angular2/src/compiler/html_parser');
var template_preparser_1 = require('angular2/src/compiler/template_preparser');
function main() {
    testing_internal_1.describe('preparseElement', function () {
        var htmlParser;
        testing_internal_1.beforeEach(testing_internal_1.inject([html_parser_1.HtmlParser], function (_htmlParser) { htmlParser = _htmlParser; }));
        function preparse(html) {
            return template_preparser_1.preparseElement(htmlParser.parse(html, '')[0]);
        }
        testing_internal_1.it('should detect script elements', testing_internal_1.inject([html_parser_1.HtmlParser], function (htmlParser) {
            testing_internal_1.expect(preparse('<script>').type).toBe(template_preparser_1.PreparsedElementType.SCRIPT);
        }));
        testing_internal_1.it('should detect style elements', testing_internal_1.inject([html_parser_1.HtmlParser], function (htmlParser) {
            testing_internal_1.expect(preparse('<style>').type).toBe(template_preparser_1.PreparsedElementType.STYLE);
        }));
        testing_internal_1.it('should detect stylesheet elements', testing_internal_1.inject([html_parser_1.HtmlParser], function (htmlParser) {
            testing_internal_1.expect(preparse('<link rel="stylesheet">').type).toBe(template_preparser_1.PreparsedElementType.STYLESHEET);
            testing_internal_1.expect(preparse('<link rel="stylesheet" href="someUrl">').hrefAttr).toEqual('someUrl');
            testing_internal_1.expect(preparse('<link rel="someRel">').type).toBe(template_preparser_1.PreparsedElementType.OTHER);
        }));
        testing_internal_1.it('should detect ng-content elements', testing_internal_1.inject([html_parser_1.HtmlParser], function (htmlParser) {
            testing_internal_1.expect(preparse('<ng-content>').type).toBe(template_preparser_1.PreparsedElementType.NG_CONTENT);
        }));
        testing_internal_1.it('should normalize ng-content.select attribute', testing_internal_1.inject([html_parser_1.HtmlParser], function (htmlParser) {
            testing_internal_1.expect(preparse('<ng-content>').selectAttr).toEqual('*');
            testing_internal_1.expect(preparse('<ng-content select>').selectAttr).toEqual('*');
            testing_internal_1.expect(preparse('<ng-content select="*">').selectAttr).toEqual('*');
        }));
    });
}
exports.main = main;
//# sourceMappingURL=template_preparser_spec.js.map