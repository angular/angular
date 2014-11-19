import {describe, beforeEach, it, expect, iit, ddescribe} from 'test_lib/test_lib';
import {isPresent} from 'facade/lang';
import {MapWrapper} from 'facade/collection';

import {ViewSplitter} from 'core/compiler/pipeline/view_splitter';
import {CompilePipeline} from 'core/compiler/pipeline/compile_pipeline';
import {DOM, TemplateElement} from 'facade/dom';

import {Parser} from 'change_detection/parser/parser';
import {ClosureMap} from 'change_detection/parser/closure_map';
import {Lexer} from 'change_detection/parser/lexer';

export function main() {
  describe('ViewSplitter', () => {

    function createPipeline() {
      return new CompilePipeline([new ViewSplitter(new Parser(new Lexer(), new ClosureMap()))]);
    }

    it('should mark root elements as viewRoot', () => {
      var rootElement = createElement('<div></div>');
      var results = createPipeline().process(rootElement);
      expect(results[0].isViewRoot).toBe(true);
    });

    it('should mark <template> elements as viewRoot', () => {
      var rootElement = createElement('<div><template></template></div>');
      var results = createPipeline().process(rootElement);
      expect(results[1].isViewRoot).toBe(true);
    });

    describe('elements with template attribute', () => {

      it('should insert an empty <template> element', () => {
        var rootElement = createElement('<div><div template></div></div>');
        var originalChild = rootElement.childNodes[0];
        var results = createPipeline().process(rootElement);
        expect(results[0].element).toBe(rootElement);
        expect(results[1].element instanceof TemplateElement).toBe(true);
        expect(DOM.getInnerHTML(results[1].element)).toEqual('');
        expect(results[2].element).toBe(originalChild);
      });

      it('should mark the element as viewRoot', () => {
        var rootElement = createElement('<div><div template></div></div>');
        var results = createPipeline().process(rootElement);
        expect(results[2].isViewRoot).toBe(true);
      });

      it('should add property bindings from the template attribute', () => {
        var rootElement = createElement('<div><div template="prop:expr"></div></div>');
        var results = createPipeline().process(rootElement);
        expect(MapWrapper.get(results[1].propertyBindings, 'prop').source).toEqual('expr');
      });

      it('should add variable mappings from the template attribute', () => {
        var rootElement = createElement('<div><div template="varName #mapName"></div></div>');
        var results = createPipeline().process(rootElement);
        expect(results[1].variableBindings).toEqual(MapWrapper.createFromStringMap({'varName': 'mapName'}));
      });

    });

  });
}

function createElement(html) {
  return DOM.createTemplate(html).content.firstChild;
}
