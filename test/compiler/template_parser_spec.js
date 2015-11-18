var testing_internal_1 = require('angular2/testing_internal');
var di_1 = require('angular2/src/core/di');
var test_bindings_1 = require('./test_bindings');
var template_parser_1 = require('angular2/src/compiler/template_parser');
var directive_metadata_1 = require('angular2/src/compiler/directive_metadata');
var template_ast_1 = require('angular2/src/compiler/template_ast');
var element_schema_registry_1 = require('angular2/src/compiler/schema/element_schema_registry');
var schema_registry_mock_1 = require('./schema_registry_mock');
var unparser_1 = require('../core/change_detection/parser/unparser');
var expressionUnparser = new unparser_1.Unparser();
function main() {
    testing_internal_1.describe('TemplateParser', function () {
        testing_internal_1.beforeEachBindings(function () { return [
            test_bindings_1.TEST_PROVIDERS,
            di_1.provide(element_schema_registry_1.ElementSchemaRegistry, {
                useValue: new schema_registry_mock_1.MockSchemaRegistry({ 'invalidProp': false }, { 'mappedAttr': 'mappedProp' })
            })
        ]; });
        var parser;
        var ngIf;
        testing_internal_1.beforeEach(testing_internal_1.inject([template_parser_1.TemplateParser], function (_parser) {
            parser = _parser;
            ngIf = directive_metadata_1.CompileDirectiveMetadata.create({ selector: '[ng-if]', type: new directive_metadata_1.CompileTypeMetadata({ name: 'NgIf' }), inputs: ['ngIf'] });
        }));
        function parse(template, directives) {
            return parser.parse(template, directives, 'TestComp');
        }
        testing_internal_1.describe('parse', function () {
            testing_internal_1.describe('nodes without bindings', function () {
                testing_internal_1.it('should parse text nodes', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('a', [])))
                        .toEqual([[template_ast_1.TextAst, 'a', 'TestComp > #text(a):nth-child(0)']]);
                });
                testing_internal_1.it('should parse elements with attributes', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div a=b>', [])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [template_ast_1.AttrAst, 'a', 'b', 'TestComp > div:nth-child(0)[a=b]']
                    ]);
                });
            });
            testing_internal_1.it('should parse ngContent', function () {
                var parsed = parse('<ng-content select="a">', []);
                testing_internal_1.expect(humanizeTemplateAsts(parsed))
                    .toEqual([[template_ast_1.NgContentAst, 'TestComp > ng-content:nth-child(0)']]);
            });
            testing_internal_1.it('should parse bound text nodes', function () {
                testing_internal_1.expect(humanizeTemplateAsts(parse('{{a}}', [])))
                    .toEqual([[template_ast_1.BoundTextAst, '{{ a }}', 'TestComp > #text({{a}}):nth-child(0)']]);
            });
            testing_internal_1.describe('bound properties', function () {
                testing_internal_1.it('should parse and camel case bound properties', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div [some-prop]="v">', [])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [
                            template_ast_1.BoundElementPropertyAst,
                            template_ast_1.PropertyBindingType.Property,
                            'someProp',
                            'v',
                            null,
                            'TestComp > div:nth-child(0)[[some-prop]=v]'
                        ]
                    ]);
                });
                testing_internal_1.it('should normalize property names via the element schema', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div [mapped-attr]="v">', [])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [
                            template_ast_1.BoundElementPropertyAst,
                            template_ast_1.PropertyBindingType.Property,
                            'mappedProp',
                            'v',
                            null,
                            'TestComp > div:nth-child(0)[[mapped-attr]=v]'
                        ]
                    ]);
                });
                testing_internal_1.it('should parse and camel case bound attributes', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div [attr.some-attr]="v">', [])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [
                            template_ast_1.BoundElementPropertyAst,
                            template_ast_1.PropertyBindingType.Attribute,
                            'someAttr',
                            'v',
                            null,
                            'TestComp > div:nth-child(0)[[attr.some-attr]=v]'
                        ]
                    ]);
                });
                testing_internal_1.it('should parse and dash case bound classes', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div [class.some-class]="v">', [])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [
                            template_ast_1.BoundElementPropertyAst,
                            template_ast_1.PropertyBindingType.Class,
                            'some-class',
                            'v',
                            null,
                            'TestComp > div:nth-child(0)[[class.some-class]=v]'
                        ]
                    ]);
                });
                testing_internal_1.it('should parse and camel case bound styles', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div [style.some-style]="v">', [])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [
                            template_ast_1.BoundElementPropertyAst,
                            template_ast_1.PropertyBindingType.Style,
                            'someStyle',
                            'v',
                            null,
                            'TestComp > div:nth-child(0)[[style.some-style]=v]'
                        ]
                    ]);
                });
                testing_internal_1.it('should parse bound properties via [...] and not report them as attributes', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div [prop]="v">', [])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [
                            template_ast_1.BoundElementPropertyAst,
                            template_ast_1.PropertyBindingType.Property,
                            'prop',
                            'v',
                            null,
                            'TestComp > div:nth-child(0)[[prop]=v]'
                        ]
                    ]);
                });
                testing_internal_1.it('should parse bound properties via bind- and not report them as attributes', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div bind-prop="v">', [])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [
                            template_ast_1.BoundElementPropertyAst,
                            template_ast_1.PropertyBindingType.Property,
                            'prop',
                            'v',
                            null,
                            'TestComp > div:nth-child(0)[bind-prop=v]'
                        ]
                    ]);
                });
                testing_internal_1.it('should parse bound properties via {{...}} and not report them as attributes', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div prop="{{v}}">', [])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [
                            template_ast_1.BoundElementPropertyAst,
                            template_ast_1.PropertyBindingType.Property,
                            'prop',
                            '{{ v }}',
                            null,
                            'TestComp > div:nth-child(0)[prop={{v}}]'
                        ]
                    ]);
                });
            });
            testing_internal_1.describe('events', function () {
                testing_internal_1.it('should parse bound events with a target', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div (window:event)="v">', [])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [
                            template_ast_1.BoundEventAst,
                            'event',
                            'window',
                            'v',
                            'TestComp > div:nth-child(0)[(window:event)=v]'
                        ]
                    ]);
                });
                testing_internal_1.it('should parse bound events via (...) and not report them as attributes', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div (event)="v">', [])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [template_ast_1.BoundEventAst, 'event', null, 'v', 'TestComp > div:nth-child(0)[(event)=v]']
                    ]);
                });
                testing_internal_1.it('should camel case event names', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div (some-event)="v">', [])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [
                            template_ast_1.BoundEventAst,
                            'someEvent',
                            null,
                            'v',
                            'TestComp > div:nth-child(0)[(some-event)=v]'
                        ]
                    ]);
                });
                testing_internal_1.it('should parse bound events via on- and not report them as attributes', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div on-event="v">', [])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [template_ast_1.BoundEventAst, 'event', null, 'v', 'TestComp > div:nth-child(0)[on-event=v]']
                    ]);
                });
                testing_internal_1.it('should allow events on explicit embedded templates that are emitted by a directive', function () {
                    var dirA = directive_metadata_1.CompileDirectiveMetadata.create({
                        selector: 'template',
                        outputs: ['e'],
                        type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirA' })
                    });
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<template (e)="f"></template>', [dirA])))
                        .toEqual([
                        [template_ast_1.EmbeddedTemplateAst, 'TestComp > template:nth-child(0)'],
                        [template_ast_1.BoundEventAst, 'e', null, 'f', 'TestComp > template:nth-child(0)[(e)=f]'],
                        [template_ast_1.DirectiveAst, dirA, 'TestComp > template:nth-child(0)'],
                    ]);
                });
            });
            testing_internal_1.describe('bindon', function () {
                testing_internal_1.it('should parse bound events and properties via [(...)] and not report them as attributes', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div [(prop)]="v">', [])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [
                            template_ast_1.BoundElementPropertyAst,
                            template_ast_1.PropertyBindingType.Property,
                            'prop',
                            'v',
                            null,
                            'TestComp > div:nth-child(0)[[(prop)]=v]'
                        ],
                        [
                            template_ast_1.BoundEventAst,
                            'propChange',
                            null,
                            'v = $event',
                            'TestComp > div:nth-child(0)[[(prop)]=v]'
                        ]
                    ]);
                });
                testing_internal_1.it('should parse bound events and properties via bindon- and not report them as attributes', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div bindon-prop="v">', [])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [
                            template_ast_1.BoundElementPropertyAst,
                            template_ast_1.PropertyBindingType.Property,
                            'prop',
                            'v',
                            null,
                            'TestComp > div:nth-child(0)[bindon-prop=v]'
                        ],
                        [
                            template_ast_1.BoundEventAst,
                            'propChange',
                            null,
                            'v = $event',
                            'TestComp > div:nth-child(0)[bindon-prop=v]'
                        ]
                    ]);
                });
            });
            testing_internal_1.describe('directives', function () {
                testing_internal_1.it('should locate directives components first and ordered by the directives array in the View', function () {
                    var dirA = directive_metadata_1.CompileDirectiveMetadata.create({ selector: '[a]', type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirA' }) });
                    var dirB = directive_metadata_1.CompileDirectiveMetadata.create({ selector: '[b]', type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirB' }) });
                    var dirC = directive_metadata_1.CompileDirectiveMetadata.create({ selector: '[c]', type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirC' }) });
                    var comp = directive_metadata_1.CompileDirectiveMetadata.create({
                        selector: 'div',
                        isComponent: true,
                        type: new directive_metadata_1.CompileTypeMetadata({ name: 'ZComp' }),
                        template: new directive_metadata_1.CompileTemplateMetadata({ ngContentSelectors: [] })
                    });
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div a c b>', [dirA, dirB, dirC, comp])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [template_ast_1.AttrAst, 'a', '', 'TestComp > div:nth-child(0)[a=]'],
                        [template_ast_1.AttrAst, 'b', '', 'TestComp > div:nth-child(0)[b=]'],
                        [template_ast_1.AttrAst, 'c', '', 'TestComp > div:nth-child(0)[c=]'],
                        [template_ast_1.DirectiveAst, comp, 'TestComp > div:nth-child(0)'],
                        [template_ast_1.DirectiveAst, dirA, 'TestComp > div:nth-child(0)'],
                        [template_ast_1.DirectiveAst, dirB, 'TestComp > div:nth-child(0)'],
                        [template_ast_1.DirectiveAst, dirC, 'TestComp > div:nth-child(0)']
                    ]);
                });
                testing_internal_1.it('should locate directives in property bindings', function () {
                    var dirA = directive_metadata_1.CompileDirectiveMetadata.create({ selector: '[a=b]', type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirA' }) });
                    var dirB = directive_metadata_1.CompileDirectiveMetadata.create({ selector: '[b]', type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirB' }) });
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div [a]="b">', [dirA, dirB])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [
                            template_ast_1.BoundElementPropertyAst,
                            template_ast_1.PropertyBindingType.Property,
                            'a',
                            'b',
                            null,
                            'TestComp > div:nth-child(0)[[a]=b]'
                        ],
                        [template_ast_1.DirectiveAst, dirA, 'TestComp > div:nth-child(0)']
                    ]);
                });
                testing_internal_1.it('should parse directive host properties', function () {
                    var dirA = directive_metadata_1.CompileDirectiveMetadata.create({
                        selector: 'div',
                        type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirA' }),
                        host: { '[a]': 'expr' }
                    });
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div></div>', [dirA])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [template_ast_1.DirectiveAst, dirA, 'TestComp > div:nth-child(0)'],
                        [
                            template_ast_1.BoundElementPropertyAst,
                            template_ast_1.PropertyBindingType.Property,
                            'a',
                            'expr',
                            null,
                            'TestComp > div:nth-child(0)'
                        ]
                    ]);
                });
                testing_internal_1.it('should parse directive host listeners', function () {
                    var dirA = directive_metadata_1.CompileDirectiveMetadata.create({
                        selector: 'div',
                        type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirA' }),
                        host: { '(a)': 'expr' }
                    });
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div></div>', [dirA])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [template_ast_1.DirectiveAst, dirA, 'TestComp > div:nth-child(0)'],
                        [template_ast_1.BoundEventAst, 'a', null, 'expr', 'TestComp > div:nth-child(0)']
                    ]);
                });
                testing_internal_1.it('should parse directive properties', function () {
                    var dirA = directive_metadata_1.CompileDirectiveMetadata.create({ selector: 'div', type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirA' }), inputs: ['aProp'] });
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div [a-prop]="expr"></div>', [dirA])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [template_ast_1.DirectiveAst, dirA, 'TestComp > div:nth-child(0)'],
                        [
                            template_ast_1.BoundDirectivePropertyAst,
                            'aProp',
                            'expr',
                            'TestComp > div:nth-child(0)[[a-prop]=expr]'
                        ]
                    ]);
                });
                testing_internal_1.it('should parse renamed directive properties', function () {
                    var dirA = directive_metadata_1.CompileDirectiveMetadata.create({ selector: 'div', type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirA' }), inputs: ['b:a'] });
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div [a]="expr"></div>', [dirA])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [template_ast_1.DirectiveAst, dirA, 'TestComp > div:nth-child(0)'],
                        [template_ast_1.BoundDirectivePropertyAst, 'b', 'expr', 'TestComp > div:nth-child(0)[[a]=expr]']
                    ]);
                });
                testing_internal_1.it('should parse literal directive properties', function () {
                    var dirA = directive_metadata_1.CompileDirectiveMetadata.create({ selector: 'div', type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirA' }), inputs: ['a'] });
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div a="literal"></div>', [dirA])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [template_ast_1.AttrAst, 'a', 'literal', 'TestComp > div:nth-child(0)[a=literal]'],
                        [template_ast_1.DirectiveAst, dirA, 'TestComp > div:nth-child(0)'],
                        [
                            template_ast_1.BoundDirectivePropertyAst,
                            'a',
                            '"literal"',
                            'TestComp > div:nth-child(0)[a=literal]'
                        ]
                    ]);
                });
                testing_internal_1.it('should favor explicit bound properties over literal properties', function () {
                    var dirA = directive_metadata_1.CompileDirectiveMetadata.create({ selector: 'div', type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirA' }), inputs: ['a'] });
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div a="literal" [a]="\'literal2\'"></div>', [dirA])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [template_ast_1.AttrAst, 'a', 'literal', 'TestComp > div:nth-child(0)[a=literal]'],
                        [template_ast_1.DirectiveAst, dirA, 'TestComp > div:nth-child(0)'],
                        [
                            template_ast_1.BoundDirectivePropertyAst,
                            'a',
                            '"literal2"',
                            'TestComp > div:nth-child(0)[[a]=\'literal2\']'
                        ]
                    ]);
                });
                testing_internal_1.it('should support optional directive properties', function () {
                    var dirA = directive_metadata_1.CompileDirectiveMetadata.create({ selector: 'div', type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirA' }), inputs: ['a'] });
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div></div>', [dirA])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [template_ast_1.DirectiveAst, dirA, 'TestComp > div:nth-child(0)']
                    ]);
                });
            });
            testing_internal_1.describe('variables', function () {
                testing_internal_1.it('should parse variables via #... and not report them as attributes', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div #a>', [])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [template_ast_1.VariableAst, 'a', '', 'TestComp > div:nth-child(0)[#a=]']
                    ]);
                });
                testing_internal_1.it('should parse variables via var-... and not report them as attributes', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div var-a>', [])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [template_ast_1.VariableAst, 'a', '', 'TestComp > div:nth-child(0)[var-a=]']
                    ]);
                });
                testing_internal_1.it('should camel case variables', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div var-some-a>', [])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [template_ast_1.VariableAst, 'someA', '', 'TestComp > div:nth-child(0)[var-some-a=]']
                    ]);
                });
                testing_internal_1.it('should assign variables with empty value to the element', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div #a></div>', [])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [template_ast_1.VariableAst, 'a', '', 'TestComp > div:nth-child(0)[#a=]']
                    ]);
                });
                testing_internal_1.it('should assign variables to directives via exportAs', function () {
                    var dirA = directive_metadata_1.CompileDirectiveMetadata.create({ selector: '[a]', type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirA' }), exportAs: 'dirA' });
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div a #a="dirA"></div>', [dirA])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [template_ast_1.AttrAst, 'a', '', 'TestComp > div:nth-child(0)[a=]'],
                        [template_ast_1.DirectiveAst, dirA, 'TestComp > div:nth-child(0)'],
                        [template_ast_1.VariableAst, 'a', 'dirA', 'TestComp > div:nth-child(0)[#a=dirA]']
                    ]);
                });
                testing_internal_1.it('should report variables with values that dont match a directive as errors', function () {
                    testing_internal_1.expect(function () { return parse('<div #a="dirA"></div>', []); }).toThrowError("Template parse errors:\nThere is no directive with \"exportAs\" set to \"dirA\" at TestComp > div:nth-child(0)[#a=dirA]");
                });
                testing_internal_1.it('should allow variables with values that dont match a directive on embedded template elements', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<template #a="b"></template>', [])))
                        .toEqual([
                        [template_ast_1.EmbeddedTemplateAst, 'TestComp > template:nth-child(0)'],
                        [template_ast_1.VariableAst, 'a', 'b', 'TestComp > template:nth-child(0)[#a=b]']
                    ]);
                });
                testing_internal_1.it('should assign variables with empty value to components', function () {
                    var dirA = directive_metadata_1.CompileDirectiveMetadata.create({
                        selector: '[a]',
                        isComponent: true,
                        type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirA' }),
                        exportAs: 'dirA',
                        template: new directive_metadata_1.CompileTemplateMetadata({ ngContentSelectors: [] })
                    });
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div a #a></div>', [dirA])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                        [template_ast_1.AttrAst, 'a', '', 'TestComp > div:nth-child(0)[a=]'],
                        [template_ast_1.VariableAst, 'a', '', 'TestComp > div:nth-child(0)[#a=]'],
                        [template_ast_1.DirectiveAst, dirA, 'TestComp > div:nth-child(0)'],
                        [template_ast_1.VariableAst, 'a', '', 'TestComp > div:nth-child(0)[#a=]']
                    ]);
                });
            });
            testing_internal_1.describe('explicit templates', function () {
                testing_internal_1.it('should create embedded templates for <template> elements', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<template></template>', [])))
                        .toEqual([[template_ast_1.EmbeddedTemplateAst, 'TestComp > template:nth-child(0)']]);
                });
            });
            testing_internal_1.describe('inline templates', function () {
                testing_internal_1.it('should wrap the element into an EmbeddedTemplateAST', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div template>', [])))
                        .toEqual([
                        [template_ast_1.EmbeddedTemplateAst, 'TestComp > div:nth-child(0)'],
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)']
                    ]);
                });
                testing_internal_1.it('should parse bound properties', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div template="ngIf test">', [ngIf])))
                        .toEqual([
                        [template_ast_1.EmbeddedTemplateAst, 'TestComp > div:nth-child(0)'],
                        [template_ast_1.DirectiveAst, ngIf, 'TestComp > div:nth-child(0)'],
                        [
                            template_ast_1.BoundDirectivePropertyAst,
                            'ngIf',
                            'test',
                            'TestComp > div:nth-child(0)[template=ngIf test]'
                        ],
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)']
                    ]);
                });
                testing_internal_1.it('should parse variables via #...', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div template="ngIf #a=b">', [])))
                        .toEqual([
                        [template_ast_1.EmbeddedTemplateAst, 'TestComp > div:nth-child(0)'],
                        [template_ast_1.VariableAst, 'a', 'b', 'TestComp > div:nth-child(0)[template=ngIf #a=b]'],
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)']
                    ]);
                });
                testing_internal_1.it('should parse variables via var ...', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div template="ngIf var a=b">', [])))
                        .toEqual([
                        [template_ast_1.EmbeddedTemplateAst, 'TestComp > div:nth-child(0)'],
                        [template_ast_1.VariableAst, 'a', 'b', 'TestComp > div:nth-child(0)[template=ngIf var a=b]'],
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)']
                    ]);
                });
                testing_internal_1.describe('directives', function () {
                    testing_internal_1.it('should locate directives in property bindings', function () {
                        var dirA = directive_metadata_1.CompileDirectiveMetadata.create({ selector: '[a=b]', type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirA' }), inputs: ['a'] });
                        var dirB = directive_metadata_1.CompileDirectiveMetadata.create({ selector: '[b]', type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirB' }) });
                        testing_internal_1.expect(humanizeTemplateAsts(parse('<div template="a b" b>', [dirA, dirB])))
                            .toEqual([
                            [template_ast_1.EmbeddedTemplateAst, 'TestComp > div:nth-child(0)'],
                            [template_ast_1.DirectiveAst, dirA, 'TestComp > div:nth-child(0)'],
                            [
                                template_ast_1.BoundDirectivePropertyAst,
                                'a',
                                'b',
                                'TestComp > div:nth-child(0)[template=a b]'
                            ],
                            [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                            [template_ast_1.AttrAst, 'b', '', 'TestComp > div:nth-child(0)[b=]'],
                            [template_ast_1.DirectiveAst, dirB, 'TestComp > div:nth-child(0)']
                        ]);
                    });
                    testing_internal_1.it('should locate directives in variable bindings', function () {
                        var dirA = directive_metadata_1.CompileDirectiveMetadata.create({ selector: '[a=b]', type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirA' }) });
                        var dirB = directive_metadata_1.CompileDirectiveMetadata.create({ selector: '[b]', type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirB' }) });
                        testing_internal_1.expect(humanizeTemplateAsts(parse('<div template="#a=b" b>', [dirA, dirB])))
                            .toEqual([
                            [template_ast_1.EmbeddedTemplateAst, 'TestComp > div:nth-child(0)'],
                            [template_ast_1.VariableAst, 'a', 'b', 'TestComp > div:nth-child(0)[template=#a=b]'],
                            [template_ast_1.DirectiveAst, dirA, 'TestComp > div:nth-child(0)'],
                            [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                            [template_ast_1.AttrAst, 'b', '', 'TestComp > div:nth-child(0)[b=]'],
                            [template_ast_1.DirectiveAst, dirB, 'TestComp > div:nth-child(0)']
                        ]);
                    });
                });
                testing_internal_1.it('should work with *... and use the attribute name as property binding name', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div *ng-if="test">', [ngIf])))
                        .toEqual([
                        [template_ast_1.EmbeddedTemplateAst, 'TestComp > div:nth-child(0)'],
                        [template_ast_1.DirectiveAst, ngIf, 'TestComp > div:nth-child(0)'],
                        [
                            template_ast_1.BoundDirectivePropertyAst,
                            'ngIf',
                            'test',
                            'TestComp > div:nth-child(0)[*ng-if=test]'
                        ],
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)']
                    ]);
                });
                testing_internal_1.it('should work with *... and empty value', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<div *ng-if>', [ngIf])))
                        .toEqual([
                        [template_ast_1.EmbeddedTemplateAst, 'TestComp > div:nth-child(0)'],
                        [template_ast_1.DirectiveAst, ngIf, 'TestComp > div:nth-child(0)'],
                        [template_ast_1.BoundDirectivePropertyAst, 'ngIf', 'null', 'TestComp > div:nth-child(0)[*ng-if=]'],
                        [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)']
                    ]);
                });
            });
        });
        testing_internal_1.describe('content projection', function () {
            function createComp(selector, ngContentSelectors) {
                return directive_metadata_1.CompileDirectiveMetadata.create({
                    selector: selector,
                    isComponent: true,
                    type: new directive_metadata_1.CompileTypeMetadata({ name: 'SomeComp' }),
                    template: new directive_metadata_1.CompileTemplateMetadata({ ngContentSelectors: ngContentSelectors })
                });
            }
            testing_internal_1.describe('project text nodes', function () {
                testing_internal_1.it('should project text nodes with wildcard selector', function () {
                    testing_internal_1.expect(humanizeContentProjection(parse('<div>hello</div>', [createComp('div', ['*'])])))
                        .toEqual([['div', null], ['#text(hello)', 0]]);
                });
            });
            testing_internal_1.describe('project elements', function () {
                testing_internal_1.it('should project elements with wildcard selector', function () {
                    testing_internal_1.expect(humanizeContentProjection(parse('<div><span></span></div>', [createComp('div', ['*'])])))
                        .toEqual([['div', null], ['span', 0]]);
                });
                testing_internal_1.it('should project elements with css selector', function () {
                    testing_internal_1.expect(humanizeContentProjection(parse('<div><a x></a><b></b></div>', [createComp('div', ['a[x]'])])))
                        .toEqual([['div', null], ['a', 0], ['b', null]]);
                });
            });
            testing_internal_1.describe('embedded templates', function () {
                testing_internal_1.it('should project embedded templates with wildcard selector', function () {
                    testing_internal_1.expect(humanizeContentProjection(parse('<div><template></template></div>', [createComp('div', ['*'])])))
                        .toEqual([['div', null], ['template', 0]]);
                });
                testing_internal_1.it('should project embedded templates with css selector', function () {
                    testing_internal_1.expect(humanizeContentProjection(parse('<div><template x></template><template></template></div>', [createComp('div', ['template[x]'])])))
                        .toEqual([['div', null], ['template', 0], ['template', null]]);
                });
            });
            testing_internal_1.describe('ng-content', function () {
                testing_internal_1.it('should project ng-content with wildcard selector', function () {
                    testing_internal_1.expect(humanizeContentProjection(parse('<div><ng-content></ng-content></div>', [createComp('div', ['*'])])))
                        .toEqual([['div', null], ['ng-content', 0]]);
                });
                testing_internal_1.it('should project ng-content with css selector', function () {
                    testing_internal_1.expect(humanizeContentProjection(parse('<div><ng-content x></ng-content><ng-content></ng-content></div>', [createComp('div', ['ng-content[x]'])])))
                        .toEqual([['div', null], ['ng-content', 0], ['ng-content', null]]);
                });
            });
            testing_internal_1.it('should project into the first matching ng-content', function () {
                testing_internal_1.expect(humanizeContentProjection(parse('<div>hello<b></b><a></a></div>', [createComp('div', ['a', 'b', '*'])])))
                    .toEqual([['div', null], ['#text(hello)', 2], ['b', 1], ['a', 0]]);
            });
            testing_internal_1.it('should project into wildcard ng-content last', function () {
                testing_internal_1.expect(humanizeContentProjection(parse('<div>hello<a></a></div>', [createComp('div', ['*', 'a'])])))
                    .toEqual([['div', null], ['#text(hello)', 0], ['a', 1]]);
            });
            testing_internal_1.it('should only project direct child nodes', function () {
                testing_internal_1.expect(humanizeContentProjection(parse('<div><span><a></a></span><a></a></div>', [createComp('div', ['a'])])))
                    .toEqual([['div', null], ['span', null], ['a', null], ['a', 0]]);
            });
            testing_internal_1.it('should project nodes of nested components', function () {
                testing_internal_1.expect(humanizeContentProjection(parse('<a><b>hello</b></a>', [createComp('a', ['*']), createComp('b', ['*'])])))
                    .toEqual([['a', null], ['b', 0], ['#text(hello)', 0]]);
            });
            testing_internal_1.it('should project children of components with ng-non-bindable', function () {
                testing_internal_1.expect(humanizeContentProjection(parse('<div ng-non-bindable>{{hello}}<span></span></div>', [createComp('div', ['*'])])))
                    .toEqual([['div', null], ['#text({{hello}})', 0], ['span', 0]]);
            });
        });
        testing_internal_1.describe('splitClasses', function () {
            testing_internal_1.it('should keep an empty class', function () { testing_internal_1.expect(template_parser_1.splitClasses('a')).toEqual(['a']); });
            testing_internal_1.it('should split 2 classes', function () { testing_internal_1.expect(template_parser_1.splitClasses('a b')).toEqual(['a', 'b']); });
            testing_internal_1.it('should trim classes', function () { testing_internal_1.expect(template_parser_1.splitClasses(' a  b ')).toEqual(['a', 'b']); });
        });
        testing_internal_1.describe('error cases', function () {
            testing_internal_1.it('should throw on invalid property names', function () {
                testing_internal_1.expect(function () { return parse('<div [invalid-prop]></div>', []); }).toThrowError("Template parse errors:\nCan't bind to 'invalidProp' since it isn't a known native property in TestComp > div:nth-child(0)[[invalid-prop]=]");
            });
            testing_internal_1.it('should report errors in expressions', function () {
                testing_internal_1.expect(function () { return parse('<div [prop]="a b"></div>', []); }).toThrowErrorWith("Template parse errors:\nParser Error: Unexpected token 'b' at column 3 in [a b] in TestComp > div:nth-child(0)[[prop]=a b]");
            });
            testing_internal_1.it('should not throw on invalid property names if the property is used by a directive', function () {
                var dirA = directive_metadata_1.CompileDirectiveMetadata.create({
                    selector: 'div',
                    type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirA' }),
                    inputs: ['invalidProp']
                });
                testing_internal_1.expect(function () { return parse('<div [invalid-prop]></div>', [dirA]); }).not.toThrow();
            });
            testing_internal_1.it('should not allow more than 1 component per element', function () {
                var dirA = directive_metadata_1.CompileDirectiveMetadata.create({
                    selector: 'div',
                    isComponent: true,
                    type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirA' }),
                    template: new directive_metadata_1.CompileTemplateMetadata({ ngContentSelectors: [] })
                });
                var dirB = directive_metadata_1.CompileDirectiveMetadata.create({
                    selector: 'div',
                    isComponent: true,
                    type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirB' }),
                    template: new directive_metadata_1.CompileTemplateMetadata({ ngContentSelectors: [] })
                });
                testing_internal_1.expect(function () { return parse('<div>', [dirB, dirA]); }).toThrowError("Template parse errors:\nMore than one component: DirB,DirA in TestComp > div:nth-child(0)");
            });
            testing_internal_1.it('should not allow components or element bindings nor dom events on explicit embedded templates', function () {
                var dirA = directive_metadata_1.CompileDirectiveMetadata.create({
                    selector: '[a]',
                    isComponent: true,
                    type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirA' }),
                    template: new directive_metadata_1.CompileTemplateMetadata({ ngContentSelectors: [] })
                });
                testing_internal_1.expect(function () { return parse('<template [a]="b" (e)="f"></template>', [dirA]); })
                    .toThrowError("Template parse errors:\nEvent binding e not emitted by any directive on an embedded template in TestComp > template:nth-child(0)\nComponents on an embedded template: DirA in TestComp > template:nth-child(0)\nProperty binding a not used by any directive on an embedded template in TestComp > template:nth-child(0)[[a]=b]");
            });
            testing_internal_1.it('should not allow components or element bindings on inline embedded templates', function () {
                var dirA = directive_metadata_1.CompileDirectiveMetadata.create({
                    selector: '[a]',
                    isComponent: true,
                    type: new directive_metadata_1.CompileTypeMetadata({ name: 'DirA' }),
                    template: new directive_metadata_1.CompileTemplateMetadata({ ngContentSelectors: [] })
                });
                testing_internal_1.expect(function () { return parse('<div *a="b">', [dirA]); }).toThrowError("Template parse errors:\nComponents on an embedded template: DirA in TestComp > div:nth-child(0)\nProperty binding a not used by any directive on an embedded template in TestComp > div:nth-child(0)[*a=b]");
            });
        });
        testing_internal_1.describe('ignore elements', function () {
            testing_internal_1.it('should ignore <script> elements but include them for source info', function () {
                testing_internal_1.expect(humanizeTemplateAsts(parse('<script></script>a', [])))
                    .toEqual([[template_ast_1.TextAst, 'a', 'TestComp > #text(a):nth-child(1)']]);
            });
            testing_internal_1.it('should ignore <style> elements but include them for source info', function () {
                testing_internal_1.expect(humanizeTemplateAsts(parse('<style></style>a', [])))
                    .toEqual([[template_ast_1.TextAst, 'a', 'TestComp > #text(a):nth-child(1)']]);
            });
            testing_internal_1.describe('<link rel="stylesheet">', function () {
                testing_internal_1.it('should keep <link rel="stylesheet"> elements if they have an absolute non package: url', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<link rel="stylesheet" href="http://someurl"></link>a', [])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'link', 'TestComp > link:nth-child(0)'],
                        [
                            template_ast_1.AttrAst,
                            'href',
                            'http://someurl',
                            'TestComp > link:nth-child(0)[href=http://someurl]'
                        ],
                        [template_ast_1.AttrAst, 'rel', 'stylesheet', 'TestComp > link:nth-child(0)[rel=stylesheet]'],
                        [template_ast_1.TextAst, 'a', 'TestComp > #text(a):nth-child(1)']
                    ]);
                });
                testing_internal_1.it('should keep <link rel="stylesheet"> elements if they have no uri', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<link rel="stylesheet"></link>a', [])))
                        .toEqual([
                        [template_ast_1.ElementAst, 'link', 'TestComp > link:nth-child(0)'],
                        [template_ast_1.AttrAst, 'rel', 'stylesheet', 'TestComp > link:nth-child(0)[rel=stylesheet]'],
                        [template_ast_1.TextAst, 'a', 'TestComp > #text(a):nth-child(1)']
                    ]);
                });
                testing_internal_1.it('should ignore <link rel="stylesheet"> elements if they have a relative uri', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<link rel="stylesheet" href="./other.css"></link>a', [])))
                        .toEqual([[template_ast_1.TextAst, 'a', 'TestComp > #text(a):nth-child(1)']]);
                });
                testing_internal_1.it('should ignore <link rel="stylesheet"> elements if they have a package: uri', function () {
                    testing_internal_1.expect(humanizeTemplateAsts(parse('<link rel="stylesheet" href="package:somePackage"></link>a', [])))
                        .toEqual([[template_ast_1.TextAst, 'a', 'TestComp > #text(a):nth-child(1)']]);
                });
            });
            testing_internal_1.it('should ignore bindings on children of elements with ng-non-bindable', function () {
                testing_internal_1.expect(humanizeTemplateAsts(parse('<div ng-non-bindable>{{b}}</div>', [])))
                    .toEqual([
                    [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                    [template_ast_1.AttrAst, 'ng-non-bindable', '', 'TestComp > div:nth-child(0)[ng-non-bindable=]'],
                    [template_ast_1.TextAst, '{{b}}', 'TestComp > div:nth-child(0) > #text({{b}}):nth-child(0)']
                ]);
            });
            testing_internal_1.it('should keep nested children of elements with ng-non-bindable', function () {
                testing_internal_1.expect(humanizeTemplateAsts(parse('<div ng-non-bindable><span>{{b}}</span></div>', [])))
                    .toEqual([
                    [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                    [template_ast_1.AttrAst, 'ng-non-bindable', '', 'TestComp > div:nth-child(0)[ng-non-bindable=]'],
                    [template_ast_1.ElementAst, 'span', 'TestComp > div:nth-child(0) > span:nth-child(0)'],
                    [
                        template_ast_1.TextAst,
                        '{{b}}',
                        'TestComp > div:nth-child(0) > span:nth-child(0) > #text({{b}}):nth-child(0)'
                    ]
                ]);
            });
            testing_internal_1.it('should ignore <script> elements inside of elements with ng-non-bindable but include them for source info', function () {
                testing_internal_1.expect(humanizeTemplateAsts(parse('<div ng-non-bindable><script></script>a</div>', [])))
                    .toEqual([
                    [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                    [template_ast_1.AttrAst, 'ng-non-bindable', '', 'TestComp > div:nth-child(0)[ng-non-bindable=]'],
                    [template_ast_1.TextAst, 'a', 'TestComp > div:nth-child(0) > #text(a):nth-child(1)']
                ]);
            });
            testing_internal_1.it('should ignore <style> elements inside of elements with ng-non-bindable but include them for source info', function () {
                testing_internal_1.expect(humanizeTemplateAsts(parse('<div ng-non-bindable><style></style>a</div>', [])))
                    .toEqual([
                    [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                    [template_ast_1.AttrAst, 'ng-non-bindable', '', 'TestComp > div:nth-child(0)[ng-non-bindable=]'],
                    [template_ast_1.TextAst, 'a', 'TestComp > div:nth-child(0) > #text(a):nth-child(1)']
                ]);
            });
            testing_internal_1.it('should ignore <link rel="stylesheet"> elements inside of elements with ng-non-bindable but include them for source info', function () {
                testing_internal_1.expect(humanizeTemplateAsts(parse('<div ng-non-bindable><link rel="stylesheet"></link>a</div>', [])))
                    .toEqual([
                    [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                    [template_ast_1.AttrAst, 'ng-non-bindable', '', 'TestComp > div:nth-child(0)[ng-non-bindable=]'],
                    [template_ast_1.TextAst, 'a', 'TestComp > div:nth-child(0) > #text(a):nth-child(1)']
                ]);
            });
            testing_internal_1.it('should convert <ng-content> elements into regular elements inside of elements with ng-non-bindable but include them for source info', function () {
                testing_internal_1.expect(humanizeTemplateAsts(parse('<div ng-non-bindable><ng-content></ng-content>a</div>', [])))
                    .toEqual([
                    [template_ast_1.ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                    [template_ast_1.AttrAst, 'ng-non-bindable', '', 'TestComp > div:nth-child(0)[ng-non-bindable=]'],
                    [
                        template_ast_1.ElementAst,
                        'ng-content',
                        'TestComp > div:nth-child(0) > ng-content:nth-child(0)'
                    ],
                    [template_ast_1.TextAst, 'a', 'TestComp > div:nth-child(0) > #text(a):nth-child(1)']
                ]);
            });
        });
    });
}
exports.main = main;
function humanizeTemplateAsts(templateAsts) {
    var humanizer = new TemplateHumanizer();
    template_ast_1.templateVisitAll(humanizer, templateAsts);
    return humanizer.result;
}
exports.humanizeTemplateAsts = humanizeTemplateAsts;
var TemplateHumanizer = (function () {
    function TemplateHumanizer() {
        this.result = [];
    }
    TemplateHumanizer.prototype.visitNgContent = function (ast, context) {
        this.result.push([template_ast_1.NgContentAst, ast.sourceInfo]);
        return null;
    };
    TemplateHumanizer.prototype.visitEmbeddedTemplate = function (ast, context) {
        this.result.push([template_ast_1.EmbeddedTemplateAst, ast.sourceInfo]);
        template_ast_1.templateVisitAll(this, ast.attrs);
        template_ast_1.templateVisitAll(this, ast.outputs);
        template_ast_1.templateVisitAll(this, ast.vars);
        template_ast_1.templateVisitAll(this, ast.directives);
        template_ast_1.templateVisitAll(this, ast.children);
        return null;
    };
    TemplateHumanizer.prototype.visitElement = function (ast, context) {
        this.result.push([template_ast_1.ElementAst, ast.name, ast.sourceInfo]);
        template_ast_1.templateVisitAll(this, ast.attrs);
        template_ast_1.templateVisitAll(this, ast.inputs);
        template_ast_1.templateVisitAll(this, ast.outputs);
        template_ast_1.templateVisitAll(this, ast.exportAsVars);
        template_ast_1.templateVisitAll(this, ast.directives);
        template_ast_1.templateVisitAll(this, ast.children);
        return null;
    };
    TemplateHumanizer.prototype.visitVariable = function (ast, context) {
        this.result.push([template_ast_1.VariableAst, ast.name, ast.value, ast.sourceInfo]);
        return null;
    };
    TemplateHumanizer.prototype.visitEvent = function (ast, context) {
        this.result.push([
            template_ast_1.BoundEventAst,
            ast.name,
            ast.target,
            expressionUnparser.unparse(ast.handler),
            ast.sourceInfo
        ]);
        return null;
    };
    TemplateHumanizer.prototype.visitElementProperty = function (ast, context) {
        this.result.push([
            template_ast_1.BoundElementPropertyAst,
            ast.type,
            ast.name,
            expressionUnparser.unparse(ast.value),
            ast.unit,
            ast.sourceInfo
        ]);
        return null;
    };
    TemplateHumanizer.prototype.visitAttr = function (ast, context) {
        this.result.push([template_ast_1.AttrAst, ast.name, ast.value, ast.sourceInfo]);
        return null;
    };
    TemplateHumanizer.prototype.visitBoundText = function (ast, context) {
        this.result.push([template_ast_1.BoundTextAst, expressionUnparser.unparse(ast.value), ast.sourceInfo]);
        return null;
    };
    TemplateHumanizer.prototype.visitText = function (ast, context) {
        this.result.push([template_ast_1.TextAst, ast.value, ast.sourceInfo]);
        return null;
    };
    TemplateHumanizer.prototype.visitDirective = function (ast, context) {
        this.result.push([template_ast_1.DirectiveAst, ast.directive, ast.sourceInfo]);
        template_ast_1.templateVisitAll(this, ast.inputs);
        template_ast_1.templateVisitAll(this, ast.hostProperties);
        template_ast_1.templateVisitAll(this, ast.hostEvents);
        template_ast_1.templateVisitAll(this, ast.exportAsVars);
        return null;
    };
    TemplateHumanizer.prototype.visitDirectiveProperty = function (ast, context) {
        this.result.push([
            template_ast_1.BoundDirectivePropertyAst,
            ast.directiveName,
            expressionUnparser.unparse(ast.value),
            ast.sourceInfo
        ]);
        return null;
    };
    return TemplateHumanizer;
})();
function humanizeContentProjection(templateAsts) {
    var humanizer = new TemplateContentProjectionHumanizer();
    template_ast_1.templateVisitAll(humanizer, templateAsts);
    return humanizer.result;
}
var TemplateContentProjectionHumanizer = (function () {
    function TemplateContentProjectionHumanizer() {
        this.result = [];
    }
    TemplateContentProjectionHumanizer.prototype.visitNgContent = function (ast, context) {
        this.result.push(['ng-content', ast.ngContentIndex]);
        return null;
    };
    TemplateContentProjectionHumanizer.prototype.visitEmbeddedTemplate = function (ast, context) {
        this.result.push(['template', ast.ngContentIndex]);
        template_ast_1.templateVisitAll(this, ast.children);
        return null;
    };
    TemplateContentProjectionHumanizer.prototype.visitElement = function (ast, context) {
        this.result.push([ast.name, ast.ngContentIndex]);
        template_ast_1.templateVisitAll(this, ast.children);
        return null;
    };
    TemplateContentProjectionHumanizer.prototype.visitVariable = function (ast, context) { return null; };
    TemplateContentProjectionHumanizer.prototype.visitEvent = function (ast, context) { return null; };
    TemplateContentProjectionHumanizer.prototype.visitElementProperty = function (ast, context) { return null; };
    TemplateContentProjectionHumanizer.prototype.visitAttr = function (ast, context) { return null; };
    TemplateContentProjectionHumanizer.prototype.visitBoundText = function (ast, context) {
        this.result.push([("#text(" + expressionUnparser.unparse(ast.value) + ")"), ast.ngContentIndex]);
        return null;
    };
    TemplateContentProjectionHumanizer.prototype.visitText = function (ast, context) {
        this.result.push([("#text(" + ast.value + ")"), ast.ngContentIndex]);
        return null;
    };
    TemplateContentProjectionHumanizer.prototype.visitDirective = function (ast, context) { return null; };
    TemplateContentProjectionHumanizer.prototype.visitDirectiveProperty = function (ast, context) { return null; };
    return TemplateContentProjectionHumanizer;
})();
//# sourceMappingURL=template_parser_spec.js.map