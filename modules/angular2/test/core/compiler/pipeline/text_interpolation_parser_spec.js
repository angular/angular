import {describe, beforeEach, expect, it, iit, ddescribe, el} from 'angular2/test_lib';
import {TextInterpolationParser} from 'angular2/src/core/compiler/pipeline/text_interpolation_parser';
import {CompilePipeline} from 'angular2/src/core/compiler/pipeline/compile_pipeline';
import {DOM} from 'angular2/src/facade/dom';
import {MapWrapper} from 'angular2/src/facade/collection';
import {Lexer, Parser} from 'angular2/change_detection';
import {CompileElement} from 'angular2/src/core/compiler/pipeline/compile_element';
import {CompileStep} from 'angular2/src/core/compiler/pipeline/compile_step'
import {CompileControl} from 'angular2/src/core/compiler/pipeline/compile_control';
import {IgnoreChildrenStep} from './pipeline_spec';

export function main() {
  describe('TextInterpolationParser', () => {
    function createPipeline(ignoreBindings = false) {
      return new CompilePipeline([
        new MockStep((parent, current, control) => { current.ignoreBindings = ignoreBindings; }),
        new IgnoreChildrenStep(),
        new TextInterpolationParser(new Parser(new Lexer()), null)
      ]);
    }

    it('should not look for text interpolation when ignoreBindings is true', () => {
      var results = createPipeline(true).process(el('<div>{{expr1}}<span></span>{{expr2}}</div>'));
      expect(results[0].textNodeBindings).toBe(null);
    });

    it('should find text interpolation in normal elements', () => {
      var results = createPipeline().process(el('<div>{{expr1}}<span></span>{{expr2}}</div>'));
      var bindings = results[0].textNodeBindings;
      expect(MapWrapper.get(bindings, 0).source).toEqual("{{expr1}}");
      expect(MapWrapper.get(bindings, 2).source).toEqual("{{expr2}}");
    });

    it('should find text interpolation in template elements', () => {
      var results = createPipeline().process(el('<template>{{expr1}}<span></span>{{expr2}}</template>'));
      var bindings = results[0].textNodeBindings;
      expect(MapWrapper.get(bindings, 0).source).toEqual("{{expr1}}");
      expect(MapWrapper.get(bindings, 2).source).toEqual("{{expr2}}");
    });

    it('should allow multiple expressions', () => {
      var results = createPipeline().process(el('<div>{{expr1}}{{expr2}}</div>'));
      var bindings = results[0].textNodeBindings;
      expect(MapWrapper.get(bindings, 0).source).toEqual("{{expr1}}{{expr2}}");
    });

    it('should not interpolate when compileChildren is false', () => {
      var results = createPipeline().process(el('<div>{{included}}<span ignore-children>{{excluded}}</span></div>'));
      var bindings = results[0].textNodeBindings;
      expect(MapWrapper.get(bindings, 0).source).toEqual("{{included}}");
      expect(results[1].textNodeBindings).toBe(null);
    });

    it('should allow fixed text before, in between and after expressions', () => {
      var results = createPipeline().process(el('<div>a{{expr1}}b{{expr2}}c</div>'));
      var bindings = results[0].textNodeBindings;
      expect(MapWrapper.get(bindings, 0).source).toEqual("a{{expr1}}b{{expr2}}c");
    });

    it('should escape quotes in fixed parts', () => {
      var results = createPipeline().process(el("<div>'\"a{{expr1}}</div>"));
      expect(MapWrapper.get(results[0].textNodeBindings, 0).source).toEqual("'\"a{{expr1}}");
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
