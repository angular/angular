import {describe, beforeEach, expect, it, iit, ddescribe, el} from 'angular2/test_lib';
import {TextInterpolationParser} from 'angular2/src/render/dom/compiler/text_interpolation_parser';
import {CompilePipeline} from 'angular2/src/render/dom/compiler/compile_pipeline';
import {MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {Lexer, Parser} from 'angular2/change_detection';
import {CompileElement} from 'angular2/src/render/dom/compiler/compile_element';
import {CompileStep} from 'angular2/src/render/dom/compiler/compile_step'
import {CompileControl} from 'angular2/src/render/dom/compiler/compile_control';
import {IgnoreChildrenStep} from './pipeline_spec';

export function main() {
  describe('TextInterpolationParser', () => {
    function createPipeline(ignoreBindings = false) {
      return new CompilePipeline([
        new MockStep((parent, current, control) => { current.ignoreBindings = ignoreBindings; }),
        new IgnoreChildrenStep(),
        new TextInterpolationParser(new Parser(new Lexer()))
      ]);
    }

    function process(element, ignoreBindings = false) {
      return ListWrapper.map(
        createPipeline(ignoreBindings).process(element),
        (compileElement) => compileElement.inheritedElementBinder
      );
    }

    function assertTextBinding(elementBinder, bindingIndex, nodeIndex, expression) {
      expect(elementBinder.textBindings[bindingIndex].source).toEqual(expression);
      expect(elementBinder.textBindingIndices[bindingIndex]).toEqual(nodeIndex);
    }

    it('should not look for text interpolation when ignoreBindings is true', () => {
      var results = process(el('<div>{{expr1}}<span></span>{{expr2}}</div>'), true);
      expect(results[0]).toEqual(null);
    });

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

class MockStep extends CompileStep {
  processClosure:Function;
  constructor(process) {
    super();
    this.processClosure = process;
  }
  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    this.processClosure(parent, current, control);
  }
}
