import {describe, beforeEach, expect, it, iit, ddescribe, el} from 'angular2/test_lib';
import {TextInterpolationParser} from 'angular2/src/render/dom/compiler/text_interpolation_parser';
import {CompilePipeline} from 'angular2/src/render/dom/compiler/compile_pipeline';
import {MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {Lexer, Parser, ASTWithSource} from 'angular2/src/change_detection/change_detection';
import {IgnoreChildrenStep} from './pipeline_spec';
import {
  ProtoViewBuilder,
  ElementBinderBuilder
} from 'angular2/src/render/dom/view/proto_view_builder';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {MockElementSchemaRegistry} from 'angular2/src/mock/element_schema_registry_mock';

export function main() {
  describe('TextInterpolationParser', () => {
    function createPipeline() {
      return new CompilePipeline(
          new MockElementSchemaRegistry(),
          [new IgnoreChildrenStep(), new TextInterpolationParser(new Parser(new Lexer()))]);
    }

    function process(templateString: string): ProtoViewBuilder {
      var compileElements = createPipeline().process(DOM.createTemplate(templateString));
      return compileElements[0].inheritedProtoView;
    }

    function assertRootTextBinding(protoViewBuilder: ProtoViewBuilder, nodeIndex: number,
                                   expression: string) {
      var node = DOM.childNodes(DOM.templateAwareRoot(protoViewBuilder.rootElement))[nodeIndex];
      expect(protoViewBuilder.rootTextBindings.get(node).source).toEqual(expression);
    }

    function assertElementTextBinding(elementBinderBuilder: ElementBinderBuilder, nodeIndex: number,
                                      expression: string) {
      var node = DOM.childNodes(DOM.templateAwareRoot(elementBinderBuilder.element))[nodeIndex];
      expect(elementBinderBuilder.textBindings.get(node).source).toEqual(expression);
    }

    it('should find root text interpolations', () => {
      var result = process('{{expr1}}{{expr2}}<div></div>{{expr3}}');
      assertRootTextBinding(result, 0, "{{expr1}}{{expr2}}");
      assertRootTextBinding(result, 2, "{{expr3}}");
    });

    it('should find text interpolation in normal elements', () => {
      var result = process('<div>{{expr1}}<span></span>{{expr2}}</div>');
      assertElementTextBinding(result.elements[0], 0, "{{expr1}}");
      assertElementTextBinding(result.elements[0], 2, "{{expr2}}");
    });

    it('should allow multiple expressions', () => {
      var result = process('<div>{{expr1}}{{expr2}}</div>');
      assertElementTextBinding(result.elements[0], 0, "{{expr1}}{{expr2}}");
    });

    it('should not interpolate when compileChildren is false', () => {
      var results = process('<div>{{included}}<span ignore-children>{{excluded}}</span></div>');
      assertElementTextBinding(results.elements[0], 0, "{{included}}");
      expect(results.elements.length).toBe(1);
      expect(results.elements[0].textBindings.size).toBe(1);
    });

    it('should allow fixed text before, in between and after expressions', () => {
      var result = process('<div>a{{expr1}}b{{expr2}}c</div>');
      assertElementTextBinding(result.elements[0], 0, "a{{expr1}}b{{expr2}}c");
    });

    it('should escape quotes in fixed parts', () => {
      var result = process("<div>'\"a{{expr1}}</div>");
      assertElementTextBinding(result.elements[0], 0, "'\"a{{expr1}}");
    });
  });
}
