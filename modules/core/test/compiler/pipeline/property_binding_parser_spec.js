import {describe, beforeEach, it, expect, iit, ddescribe} from 'test_lib/test_lib';
import {PropertyBindingParser} from 'core/compiler/pipeline/property_binding_parser';
import {CompilePipeline} from 'core/compiler/pipeline/compile_pipeline';
import {DOM} from 'facade/dom';
import {MapWrapper} from 'facade/collection';

export function main() {
  describe('PropertyBindingParser', () => {
    function createPipeline() {
      return new CompilePipeline([new PropertyBindingParser()]);
    }

    it('should detect [] syntax', () => {
      var results = createPipeline().process(createElement('<div [a]="b"></div>'));
      expect(MapWrapper.get(results[0].propertyBindings, 'a')).toEqual('b');
    });

    it('should detect bind- syntax', () => {
      var results = createPipeline().process(createElement('<div bind-a="b"></div>'));
      expect(MapWrapper.get(results[0].propertyBindings, 'a')).toEqual('b');
    });
  });
}

function createElement(html) {
  return DOM.createTemplate(html).content.firstChild;
}
