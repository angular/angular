import {describe, beforeEach, expect, it, iit, ddescribe, el} from 'test_lib/test_lib';
import {TextInterpolationParser} from 'core/compiler/pipeline/text_interpolation_parser';
import {CompilePipeline} from 'core/compiler/pipeline/compile_pipeline';
import {DOM} from 'facade/dom';
import {MapWrapper} from 'facade/collection';

import {Lexer, Parser} from 'change_detection/change_detection';
import {IgnoreChildrenStep} from './pipeline_spec';

export function main() {
  describe('TextInterpolationParser', () => {
    function createPipeline() {
      return new CompilePipeline([
        new IgnoreChildrenStep(),
        new TextInterpolationParser(new Parser(new Lexer()), null)
      ]);
    }

    it('should find text interpolation in normal elements', () => {
      var results = createPipeline().process(el('<div>{{expr1}}<span></span>{{expr2}}</div>'));
      var bindings = results[0].textNodeBindings;
      expect(MapWrapper.get(bindings, 0).source).toEqual("(expr1)");
      expect(MapWrapper.get(bindings, 2).source).toEqual("(expr2)");
    });

    it('should find text interpolation in template elements', () => {
      var results = createPipeline().process(el('<template>{{expr1}}<span></span>{{expr2}}</template>'));
      var bindings = results[0].textNodeBindings;
      expect(MapWrapper.get(bindings, 0).source).toEqual("(expr1)");
      expect(MapWrapper.get(bindings, 2).source).toEqual("(expr2)");
    });

    it('should allow multiple expressions', () => {
      var results = createPipeline().process(el('<div>{{expr1}}{{expr2}}</div>'));
      var bindings = results[0].textNodeBindings;
      expect(MapWrapper.get(bindings, 0).source).toEqual("(expr1)+(expr2)");
    });

    it('should not interpolate when compileChildren is false', () => {
      var results = createPipeline().process(el('<div>{{included}}<span ignore-children>{{excluded}}</span></div>'));
      var bindings = results[0].textNodeBindings;
      expect(MapWrapper.get(bindings, 0).source).toEqual("(included)");
      expect(results[1].textNodeBindings).toBe(null);
    });

    it('should allow fixed text before, in between and after expressions', () => {
      var results = createPipeline().process(el('<div>a{{expr1}}b{{expr2}}c</div>'));
      var bindings = results[0].textNodeBindings;
      expect(MapWrapper.get(bindings, 0).source).toEqual("'a'+(expr1)+'b'+(expr2)+'c'");
    });

    it('should escape quotes in fixed parts', () => {
      var results = createPipeline().process(el("<div>'\"a{{expr1}}</div>"));
      expect(MapWrapper.get(results[0].textNodeBindings, 0).source).toEqual("'\\'\"a'+(expr1)");
    });
  });
}
