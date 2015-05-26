import {describe, beforeEach, expect, it, iit, ddescribe, el} from 'angular2/test_lib';
import {TextInterpolationParser} from 'angular2/src/render/dom/compiler/text_interpolation_parser';
import {CompilePipeline} from 'angular2/src/render/dom/compiler/compile_pipeline';
import {MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {Lexer, Parser} from 'angular2/change_detection';
import {IgnoreChildrenStep} from './pipeline_spec';
import {ElementBinderBuilder} from 'angular2/src/render/dom/view/proto_view_builder';

export function main() {
  describe('TextInterpolationParser', () => {
    function createPipeline() {
      return new CompilePipeline(
          [new IgnoreChildrenStep(), new TextInterpolationParser(new Parser(new Lexer()))]);
    }

    function process(element): List<ElementBinderBuilder> {
      return ListWrapper.map(createPipeline().process(element),
                             (compileElement) => compileElement.inheritedElementBinder);
    }

    function assertTextBinding(elementBinder, bindingIndex, nodeIndex, expression) {
      expect(elementBinder.textBindings[bindingIndex].source).toEqual(expression);
      expect(elementBinder.textBindingIndices[bindingIndex]).toEqual(nodeIndex);
    }

    it('should find text interpolation in normal elements', () => {
      var result = process(el('<div>{{expr1}}<span></span>{{expr2}}</div>'))[0];
      assertTextBinding(result, 0, 0, "{{expr1}}");
      assertTextBinding(result, 1, 2, "{{expr2}}");
    });

    it('should find text interpolation in template elements', () => {
      var result = process(el('<template>{{expr1}}<span></span>{{expr2}}</template>'))[0];
      assertTextBinding(result, 0, 0, "{{expr1}}");
      assertTextBinding(result, 1, 2, "{{expr2}}");
    });

    it('should allow multiple expressions', () => {
      var result = process(el('<div>{{expr1}}{{expr2}}</div>'))[0];
      assertTextBinding(result, 0, 0, "{{expr1}}{{expr2}}");
    });

    it('should not interpolate when compileChildren is false', () => {
      var results = process(el('<div>{{included}}<span ignore-children>{{excluded}}</span></div>'));
      assertTextBinding(results[0], 0, 0, "{{included}}");
      expect(results[1]).toBe(results[0]);
    });

    it('should allow fixed text before, in between and after expressions', () => {
      var result = process(el('<div>a{{expr1}}b{{expr2}}c</div>'))[0];
      assertTextBinding(result, 0, 0, "a{{expr1}}b{{expr2}}c");
    });

    it('should escape quotes in fixed parts', () => {
      var result = process(el("<div>'\"a{{expr1}}</div>"))[0];
      assertTextBinding(result, 0, 0, "'\"a{{expr1}}");
    });
  });
}
