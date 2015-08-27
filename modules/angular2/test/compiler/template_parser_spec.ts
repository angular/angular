import {ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach} from 'angular2/test_lib';

import {Parser, Lexer} from 'angular2/src/core/change_detection/change_detection';
import {TemplateParser, splitClasses} from 'angular2/src/compiler/template_parser';
import {HtmlParser} from 'angular2/src/compiler/html_parser';
import {DirectiveMetadata, TypeMeta} from 'angular2/src/compiler/api';
import {
  templateVisitAll,
  TemplateAstVisitor,
  TemplateAst,
  NgContentAst,
  EmbeddedTemplateAst,
  ElementAst,
  VariableAst,
  BoundEventAst,
  BoundPropertyAst,
  AttrAst,
  BoundTextAst,
  TextAst
} from 'angular2/src/compiler/template_ast';

import {Unparser} from '../core/change_detection/parser/unparser';

var expressionUnparser = new Unparser();

export function main() {
  describe('TemplateParser', () => {
    var domParser: HtmlParser;
    var parser: TemplateParser;

    beforeEach(() => {
      domParser = new HtmlParser();
      parser = new TemplateParser(new Parser(new Lexer()));
    });

    function parse(template: string, directives: DirectiveMetadata[]): TemplateAst[] {
      return parser.parse(domParser.parse(template, 'TestComp'), directives);
    }

    describe('parse', () => {
      describe('nodes without bindings', () => {

        it('should parse text nodes', () => {
          expect(humanizeTemplateAsts(parse('a', [])))
              .toEqual([[TextAst, 'a', 'TestComp > #text(a):nth-child(0)']]);
        });

        it('should parse elements with attributes', () => {
          expect(humanizeTemplateAsts(parse('<div a=b>', [])))
              .toEqual([
                [ElementAst, [], 'TestComp > div:nth-child(0)'],
                [AttrAst, 'a', 'b', 'TestComp > div:nth-child(0)[a=b]']
              ]);
        });
      });

      it('should parse ngContent', () => {
        var parsed = parse('<ng-content select="a">', []);
        expect(humanizeTemplateAsts(parsed))
            .toEqual([[NgContentAst, 'a', 'TestComp > ng-content:nth-child(0)']]);
      });

      it('should parse bound text nodes', () => {
        expect(humanizeTemplateAsts(parse('{{a}}', [])))
            .toEqual([[BoundTextAst, '{{ a }}', 'TestComp > #text({{a}}):nth-child(0)']]);
      });

      describe('property, event and variable bindings', () => {

        it('should parse bound properties via [...] and not report them as attributes', () => {
          expect(humanizeTemplateAsts(parse('<div [prop]="v">', [])))
              .toEqual([
                [ElementAst, [], 'TestComp > div:nth-child(0)'],
                [BoundPropertyAst, 'prop', 'v', 'TestComp > div:nth-child(0)[[prop]=v]']
              ]);
        });

        it('should camel case bound properties', () => {
          expect(humanizeTemplateAsts(parse('<div [some-prop]="v">', [])))
              .toEqual([
                [ElementAst, [], 'TestComp > div:nth-child(0)'],
                [BoundPropertyAst, 'someProp', 'v', 'TestComp > div:nth-child(0)[[some-prop]=v]']
              ]);
        });

        it('should parse bound properties via bind- and not report them as attributes', () => {
          expect(humanizeTemplateAsts(parse('<div bind-prop="v">', [])))
              .toEqual([
                [ElementAst, [], 'TestComp > div:nth-child(0)'],
                [BoundPropertyAst, 'prop', 'v', 'TestComp > div:nth-child(0)[bind-prop=v]']
              ]);
        });

        it('should parse bound properties via {{...}} and not report them as attributes', () => {
          expect(humanizeTemplateAsts(parse('<div prop="{{v}}">', [])))
              .toEqual([
                [ElementAst, [], 'TestComp > div:nth-child(0)'],
                [BoundPropertyAst, 'prop', '{{ v }}', 'TestComp > div:nth-child(0)[prop={{v}}]']
              ]);
        });

        it('should parse bound events via (...) and not report them as attributes', () => {
          expect(humanizeTemplateAsts(parse('<div (event)="v">', [])))
              .toEqual([
                [ElementAst, [], 'TestComp > div:nth-child(0)'],
                [BoundEventAst, 'event', 'v', 'TestComp > div:nth-child(0)[(event)=v]']
              ]);
        });

        it('should camel case event names', () => {
          expect(humanizeTemplateAsts(parse('<div (some-event)="v">', [])))
              .toEqual([
                [ElementAst, [], 'TestComp > div:nth-child(0)'],
                [BoundEventAst, 'someEvent', 'v', 'TestComp > div:nth-child(0)[(some-event)=v]']
              ]);
        });

        it('should parse bound events via on- and not report them as attributes', () => {
          expect(humanizeTemplateAsts(parse('<div on-event="v">', [])))
              .toEqual([
                [ElementAst, [], 'TestComp > div:nth-child(0)'],
                [BoundEventAst, 'event', 'v', 'TestComp > div:nth-child(0)[on-event=v]']
              ]);
        });

        it('should parse bound events and properties via [(...)] and not report them as attributes',
           () => {
             expect(humanizeTemplateAsts(parse('<div [(prop)]="v">', [])))
                 .toEqual([
                   [ElementAst, [], 'TestComp > div:nth-child(0)'],
                   [BoundPropertyAst, 'prop', 'v', 'TestComp > div:nth-child(0)[[(prop)]=v]'],
                   [
                     BoundEventAst,
                     'prop',
                     'v = $event',
                     'TestComp > div:nth-child(0)[[(prop)]=v]'
                   ]
                 ]);
           });

        it('should parse bound events and properties via bindon- and not report them as attributes',
           () => {
             expect(humanizeTemplateAsts(parse('<div bindon-prop="v">', [])))
                 .toEqual([
                   [ElementAst, [], 'TestComp > div:nth-child(0)'],
                   [BoundPropertyAst, 'prop', 'v', 'TestComp > div:nth-child(0)[bindon-prop=v]'],
                   [
                     BoundEventAst,
                     'prop',
                     'v = $event',
                     'TestComp > div:nth-child(0)[bindon-prop=v]'
                   ]
                 ]);
           });

        it('should parse variables via #... and not report them as attributes', () => {
          expect(humanizeTemplateAsts(parse('<div #a="b">', [])))
              .toEqual([
                [ElementAst, [], 'TestComp > div:nth-child(0)'],
                [VariableAst, 'a', 'b', 'TestComp > div:nth-child(0)[#a=b]']
              ]);
        });

        it('should parse variables via var-... and not report them as attributes', () => {
          expect(humanizeTemplateAsts(parse('<div var-a="b">', [])))
              .toEqual([
                [ElementAst, [], 'TestComp > div:nth-child(0)'],
                [VariableAst, 'a', 'b', 'TestComp > div:nth-child(0)[var-a=b]']
              ]);
        });

        it('should camel case variables', () => {
          expect(humanizeTemplateAsts(parse('<div var-some-a="b">', [])))
              .toEqual([
                [ElementAst, [], 'TestComp > div:nth-child(0)'],
                [VariableAst, 'someA', 'b', 'TestComp > div:nth-child(0)[var-some-a=b]']
              ]);
        });

        it('should use $implicit as variable name if none was specified', () => {
          expect(humanizeTemplateAsts(parse('<div var-a>', [])))
              .toEqual([
                [ElementAst, [], 'TestComp > div:nth-child(0)'],
                [VariableAst, 'a', '$implicit', 'TestComp > div:nth-child(0)[var-a=]']
              ]);
        });
      });

      describe('directives', () => {
        it('should locate directives ordered by typeName and components first', () => {
          var dirA =
              new DirectiveMetadata({selector: '[a=b]', type: new TypeMeta({typeName: 'DirA'})});
          var dirB =
              new DirectiveMetadata({selector: '[a]', type: new TypeMeta({typeName: 'DirB'})});
          var comp = new DirectiveMetadata(
              {selector: 'div', isComponent: true, type: new TypeMeta({typeName: 'ZComp'})});
          expect(humanizeTemplateAsts(parse('<div a="b">', [dirB, dirA, comp])))
              .toEqual([
                [ElementAst, [comp, dirA, dirB], 'TestComp > div:nth-child(0)'],
                [AttrAst, 'a', 'b', 'TestComp > div:nth-child(0)[a=b]']
              ]);
        });

        it('should locate directives in property bindings', () => {
          var dirA =
              new DirectiveMetadata({selector: '[a=b]', type: new TypeMeta({typeName: 'DirA'})});
          var dirB =
              new DirectiveMetadata({selector: '[b]', type: new TypeMeta({typeName: 'DirB'})});
          expect(humanizeTemplateAsts(parse('<div [a]="b">', [dirA, dirB])))
              .toEqual([
                [ElementAst, [dirA], 'TestComp > div:nth-child(0)'],
                [BoundPropertyAst, 'a', 'b', 'TestComp > div:nth-child(0)[[a]=b]']
              ]);
        });

        it('should locate directives in variable bindings', () => {
          var dirA =
              new DirectiveMetadata({selector: '[a=b]', type: new TypeMeta({typeName: 'DirA'})});
          var dirB =
              new DirectiveMetadata({selector: '[b]', type: new TypeMeta({typeName: 'DirB'})});
          expect(humanizeTemplateAsts(parse('<div #a="b">', [dirA, dirB])))
              .toEqual([
                [ElementAst, [dirA], 'TestComp > div:nth-child(0)'],
                [VariableAst, 'a', 'b', 'TestComp > div:nth-child(0)[#a=b]']
              ]);
        });
      });

      describe('explicit templates', () => {
        it('should create embedded templates for <template> elements', () => {
          expect(humanizeTemplateAsts(parse('<template></template>', [])))
              .toEqual([[EmbeddedTemplateAst, [], 'TestComp > template:nth-child(0)']]);
        });
      });

      describe('inline templates', () => {
        it('should wrap the element into an EmbeddedTemplateAST', () => {
          expect(humanizeTemplateAsts(parse('<div template>', [])))
              .toEqual([
                [EmbeddedTemplateAst, [], 'TestComp > div:nth-child(0)'],
                [ElementAst, [], 'TestComp > div:nth-child(0)']
              ]);
        });

        it('should parse bound properties', () => {
          expect(humanizeTemplateAsts(parse('<div template="ngIf test">', [])))
              .toEqual([
                [EmbeddedTemplateAst, [], 'TestComp > div:nth-child(0)'],
                [
                  BoundPropertyAst,
                  'ngIf',
                  'test',
                  'TestComp > div:nth-child(0)[template=ngIf test]'
                ],
                [ElementAst, [], 'TestComp > div:nth-child(0)']
              ]);
        });

        it('should parse variables via #...', () => {
          expect(humanizeTemplateAsts(parse('<div template="ngIf #a=b">', [])))
              .toEqual([
                [EmbeddedTemplateAst, [], 'TestComp > div:nth-child(0)'],
                [VariableAst, 'a', 'b', 'TestComp > div:nth-child(0)[template=ngIf #a=b]'],
                [ElementAst, [], 'TestComp > div:nth-child(0)']
              ]);
        });

        it('should parse variables via var ...', () => {
          expect(humanizeTemplateAsts(parse('<div template="ngIf var a=b">', [])))
              .toEqual([
                [EmbeddedTemplateAst, [], 'TestComp > div:nth-child(0)'],
                [VariableAst, 'a', 'b', 'TestComp > div:nth-child(0)[template=ngIf var a=b]'],
                [ElementAst, [], 'TestComp > div:nth-child(0)']
              ]);
        });

        describe('directives', () => {
          it('should locate directives in property bindings', () => {
            var dirA =
                new DirectiveMetadata({selector: '[a=b]', type: new TypeMeta({typeName: 'DirA'})});
            var dirB =
                new DirectiveMetadata({selector: '[b]', type: new TypeMeta({typeName: 'DirB'})});
            expect(humanizeTemplateAsts(parse('<div template="a b" b>', [dirA, dirB])))
                .toEqual([
                  [EmbeddedTemplateAst, [dirA], 'TestComp > div:nth-child(0)'],
                  [BoundPropertyAst, 'a', 'b', 'TestComp > div:nth-child(0)[template=a b]'],
                  [ElementAst, [dirB], 'TestComp > div:nth-child(0)'],
                  [AttrAst, 'b', '', 'TestComp > div:nth-child(0)[b=]']
                ]);
          });

          it('should locate directives in variable bindings', () => {
            var dirA =
                new DirectiveMetadata({selector: '[a=b]', type: new TypeMeta({typeName: 'DirA'})});
            var dirB =
                new DirectiveMetadata({selector: '[b]', type: new TypeMeta({typeName: 'DirB'})});
            expect(humanizeTemplateAsts(parse('<div template="#a=b" b>', [dirA, dirB])))
                .toEqual([
                  [EmbeddedTemplateAst, [dirA], 'TestComp > div:nth-child(0)'],
                  [VariableAst, 'a', 'b', 'TestComp > div:nth-child(0)[template=#a=b]'],
                  [ElementAst, [dirB], 'TestComp > div:nth-child(0)'],
                  [AttrAst, 'b', '', 'TestComp > div:nth-child(0)[b=]']
                ]);
          });

        });

        it('should work with *... and use the attribute name as property binding name', () => {
          expect(humanizeTemplateAsts(parse('<div *ng-if="test">', [])))
              .toEqual([
                [EmbeddedTemplateAst, [], 'TestComp > div:nth-child(0)'],
                [BoundPropertyAst, 'ngIf', 'test', 'TestComp > div:nth-child(0)[*ng-if=test]'],
                [ElementAst, [], 'TestComp > div:nth-child(0)']
              ]);
        });
      });

    });

    describe('splitClasses', () => {
      it('should keep an empty class', () => { expect(splitClasses('a')).toEqual(['a']); });

      it('should split 2 classes', () => { expect(splitClasses('a b')).toEqual(['a', 'b']); });

      it('should trim classes', () => { expect(splitClasses(' a  b ')).toEqual(['a', 'b']); });
    });
  });
}

export function humanizeTemplateAsts(templateAsts: TemplateAst[]): any[] {
  var humanizer = new TemplateHumanizer();
  templateVisitAll(humanizer, templateAsts);
  return humanizer.result;
}

class TemplateHumanizer implements TemplateAstVisitor {
  result: any[] = [];
  visitNgContent(ast: NgContentAst): any {
    this.result.push([NgContentAst, ast.select, ast.sourceInfo]);
    return null;
  }
  visitEmbeddedTemplate(ast: EmbeddedTemplateAst): any {
    this.result.push([EmbeddedTemplateAst, ast.directives, ast.sourceInfo]);
    templateVisitAll(this, ast.attrs);
    templateVisitAll(this, ast.properties);
    templateVisitAll(this, ast.vars);
    templateVisitAll(this, ast.children);
    return null;
  }
  visitElement(ast: ElementAst): any {
    this.result.push([ElementAst, ast.directives, ast.sourceInfo]);
    templateVisitAll(this, ast.attrs);
    templateVisitAll(this, ast.properties);
    templateVisitAll(this, ast.events);
    templateVisitAll(this, ast.vars);
    templateVisitAll(this, ast.children);
    return null;
  }
  visitVariable(ast: VariableAst): any {
    this.result.push([VariableAst, ast.name, ast.value, ast.sourceInfo]);
    return null;
  }
  visitEvent(ast: BoundEventAst): any {
    this.result.push(
        [BoundEventAst, ast.name, expressionUnparser.unparse(ast.handler), ast.sourceInfo]);
    return null;
  }
  visitProperty(ast: BoundPropertyAst): any {
    this.result.push(
        [BoundPropertyAst, ast.name, expressionUnparser.unparse(ast.value), ast.sourceInfo]);
    return null;
  }
  visitAttr(ast: AttrAst): any {
    this.result.push([AttrAst, ast.name, ast.value, ast.sourceInfo]);
    return null;
  }
  visitBoundText(ast: BoundTextAst): any {
    this.result.push([BoundTextAst, expressionUnparser.unparse(ast.value), ast.sourceInfo]);
    return null;
  }
  visitText(ast: TextAst): any {
    this.result.push([TextAst, ast.value, ast.sourceInfo]);
    return null;
  }
}