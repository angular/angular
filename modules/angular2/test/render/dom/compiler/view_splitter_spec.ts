import {
  describe,
  beforeEach,
  it,
  expect,
  iit,
  ddescribe,
  el,
  stringifyElement
} from 'angular2/test_lib';
import {MapWrapper} from 'angular2/src/facade/collection';

import {ViewSplitter} from 'angular2/src/render/dom/compiler/view_splitter';
import {CompilePipeline} from 'angular2/src/render/dom/compiler/compile_pipeline';
import {ProtoViewDto, ViewType} from 'angular2/src/render/api';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {MockElementSchemaRegistry} from 'angular2/src/mock/element_schema_registry_mock';

import {Lexer, Parser} from 'angular2/src/change_detection/change_detection';

export function main() {
  describe('ViewSplitter', () => {

    function createPipeline() {
      return new CompilePipeline(new MockElementSchemaRegistry(),
                                 [new ViewSplitter(new Parser(new Lexer()))]);
    }

    describe('<template> elements', () => {

      it('should move the content into a new <template> element and mark that as viewRoot', () => {
        var rootElement = DOM.createTemplate('<template if="true">a</template>');
        var results = createPipeline().process(rootElement);

        expect(stringifyElement(results[1].element))
            .toEqual('<template class="ng-binding" if="true"></template>');
        expect(results[1].isViewRoot).toBe(false);
        expect(stringifyElement(results[2].element)).toEqual('<template>a</template>');
        expect(results[2].isViewRoot).toBe(true);
      });

      it('should mark the new <template> element as viewRoot', () => {
        var rootElement = DOM.createTemplate('<template if="true">a</template>');
        var results = createPipeline().process(rootElement);
        expect(results[2].isViewRoot).toBe(true);
      });

      it('should not wrap the root element', () => {
        var rootElement = DOM.createTemplate('');
        var results = createPipeline().process(rootElement);
        expect(results.length).toBe(1);
        expect(stringifyElement(rootElement)).toEqual('<template></template>');
      });

      it('should copy over the elementDescription', () => {
        var rootElement = DOM.createTemplate('<template if="true">a</template>');
        var results = createPipeline().process(rootElement);
        expect(results[2].elementDescription).toBe(results[1].elementDescription);
      });

      it('should clean out the inheritedElementBinder', () => {
        var rootElement = DOM.createTemplate('<template if="true">a</template>');
        var results = createPipeline().process(rootElement);
        expect(results[2].inheritedElementBinder).toBe(null);
      });

      it('should create a nestedProtoView', () => {
        var rootElement = DOM.createTemplate('<template if="true">a</template>');
        var results = createPipeline().process(rootElement);
        expect(results[2].inheritedProtoView).not.toBe(null);
        expect(results[2].inheritedProtoView)
            .toBe(results[1].inheritedElementBinder.nestedProtoView);
        expect(results[2].inheritedProtoView.type).toBe(ViewType.EMBEDDED);
        expect(stringifyElement(results[2].inheritedProtoView.rootElement))
            .toEqual('<template>a</template>');
      });

    });

    describe('elements with template attribute', () => {

      it('should replace the element with an empty <template> element', () => {
        var rootElement = DOM.createTemplate('<span template=""></span>');
        var originalChild = DOM.firstChild(DOM.content(rootElement));
        var results = createPipeline().process(rootElement);
        expect(results[0].element).toBe(rootElement);
        expect(stringifyElement(results[0].element))
            .toEqual('<template><template class="ng-binding"></template></template>');
        expect(stringifyElement(results[2].element))
            .toEqual('<template><span template=""></span></template>');
        expect(DOM.firstChild(DOM.content(results[2].element))).toBe(originalChild);
      });

      it('should work with top-level template node', () => {
        var rootElement = DOM.createTemplate('<div template>x</div>');
        var originalChild = DOM.content(rootElement).childNodes[0];
        var results = createPipeline().process(rootElement);

        expect(results[0].element).toBe(rootElement);
        expect(results[0].isViewRoot).toBe(true);
        expect(results[2].isViewRoot).toBe(true);
        expect(stringifyElement(results[0].element))
            .toEqual('<template><template class="ng-binding"></template></template>');
        expect(DOM.firstChild(DOM.content(results[2].element))).toBe(originalChild);
      });

      it('should mark the element as viewRoot', () => {
        var rootElement = DOM.createTemplate('<div template></div>');
        var results = createPipeline().process(rootElement);
        expect(results[2].isViewRoot).toBe(true);
      });

      it('should add property bindings from the template attribute', () => {
        var rootElement = DOM.createTemplate('<div template="some-prop:expr"></div>');
        var results = createPipeline().process(rootElement);
        expect(results[1].inheritedElementBinder.propertyBindings.get('someProp').source)
            .toEqual('expr');
        expect(results[1].attrs().get('some-prop')).toEqual('expr');
      });

      it('should add variable mappings from the template attribute to the nestedProtoView', () => {
        var rootElement = DOM.createTemplate('<div template="var var-name=mapName"></div>');
        var results = createPipeline().process(rootElement);
        expect(results[2].inheritedProtoView.variableBindings)
            .toEqual(MapWrapper.createFromStringMap({'mapName': 'varName'}));
      });

      it('should add entries without value as attributes to the element', () => {
        var rootElement = DOM.createTemplate('<div template="varname"></div>');
        var results = createPipeline().process(rootElement);
        expect(results[1].attrs().get('varname')).toEqual('');
        expect(results[1].inheritedElementBinder.propertyBindings).toEqual(new Map());
        expect(results[1].inheritedElementBinder.variableBindings).toEqual(new Map());
      });

      it('should iterate properly after a template dom modification', () => {
        var rootElement = DOM.createTemplate('<div template></div><after></after>');
        var results = createPipeline().process(rootElement);
        // 1 root + 2 initial + 2 generated template elements
        expect(results.length).toEqual(5);
      });

      it('should copy over the elementDescription', () => {
        var rootElement = DOM.createTemplate('<span template=""></span>');
        var results = createPipeline().process(rootElement);
        expect(results[2].elementDescription).toBe(results[1].elementDescription);
      });

      it('should clean out the inheritedElementBinder', () => {
        var rootElement = DOM.createTemplate('<span template=""></span>');
        var results = createPipeline().process(rootElement);
        expect(results[2].inheritedElementBinder).toBe(null);
      });

      it('should create a nestedProtoView', () => {
        var rootElement = DOM.createTemplate('<span template=""></span>');
        var results = createPipeline().process(rootElement);
        expect(results[2].inheritedProtoView).not.toBe(null);
        expect(results[2].inheritedProtoView)
            .toBe(results[1].inheritedElementBinder.nestedProtoView);
        expect(stringifyElement(results[2].inheritedProtoView.rootElement))
            .toEqual('<template><span template=""></span></template>');
      });

    });

    describe('elements with *directive_name attribute', () => {

      it('should replace the element with an empty <template> element', () => {
        var rootElement = DOM.createTemplate('<span *ng-if></span>');
        var originalChild = DOM.firstChild(DOM.content(rootElement));
        var results = createPipeline().process(rootElement);
        expect(results[0].element).toBe(rootElement);
        expect(stringifyElement(results[0].element))
            .toEqual('<template><template class="ng-binding" ng-if=""></template></template>');
        expect(stringifyElement(results[2].element))
            .toEqual('<template><span *ng-if=""></span></template>');
        expect(DOM.firstChild(DOM.content(results[2].element))).toBe(originalChild);
      });

      it('should mark the element as viewRoot', () => {
        var rootElement = DOM.createTemplate('<div *foo="bar"></div>');
        var results = createPipeline().process(rootElement);
        expect(results[2].isViewRoot).toBe(true);
      });

      it('should work with top-level template node', () => {
        var rootElement = DOM.createTemplate('<div *foo>x</div>');
        var originalChild = DOM.content(rootElement).childNodes[0];
        var results = createPipeline().process(rootElement);

        expect(results[0].element).toBe(rootElement);
        expect(results[0].isViewRoot).toBe(true);
        expect(results[2].isViewRoot).toBe(true);
        expect(stringifyElement(results[0].element))
            .toEqual('<template><template class="ng-binding" foo=""></template></template>');
        expect(DOM.firstChild(DOM.content(results[2].element))).toBe(originalChild);
      });

      it('should add property bindings from the template attribute', () => {
        var rootElement = DOM.createTemplate('<div *prop="expr"></div>');
        var results = createPipeline().process(rootElement);
        expect(results[1].inheritedElementBinder.propertyBindings.get('prop').source)
            .toEqual('expr');
        expect(results[1].attrs().get('prop')).toEqual('expr');
      });

      it('should add variable mappings from the template attribute to the nestedProtoView', () => {
        var rootElement = DOM.createTemplate('<div *foreach="var varName=mapName"></div>');
        var results = createPipeline().process(rootElement);
        expect(results[2].inheritedProtoView.variableBindings)
            .toEqual(MapWrapper.createFromStringMap({'mapName': 'varName'}));
      });

      it('should add entries without value as attribute to the element', () => {
        var rootElement = DOM.createTemplate('<div *varname></div>');
        var results = createPipeline().process(rootElement);
        expect(results[1].attrs().get('varname')).toEqual('');
        expect(results[1].inheritedElementBinder.propertyBindings).toEqual(new Map());
        expect(results[1].inheritedElementBinder.variableBindings).toEqual(new Map());
      });

      it('should iterate properly after a template dom modification', () => {
        var rootElement = DOM.createTemplate('<div *foo></div><after></after>');
        var results = createPipeline().process(rootElement);
        // 1 root + 2 initial + 2 generated template elements
        expect(results.length).toEqual(5);
      });

      it('should copy over the elementDescription', () => {
        var rootElement = DOM.createTemplate('<span *foo></span>');
        var results = createPipeline().process(rootElement);
        expect(results[2].elementDescription).toBe(results[1].elementDescription);
      });

      it('should clean out the inheritedElementBinder', () => {
        var rootElement = DOM.createTemplate('<span *foo></span>');
        var results = createPipeline().process(rootElement);
        expect(results[2].inheritedElementBinder).toBe(null);
      });

      it('should create a nestedProtoView', () => {
        var rootElement = DOM.createTemplate('<span *foo></span>');
        var results = createPipeline().process(rootElement);
        expect(results[2].inheritedProtoView).not.toBe(null);
        expect(results[2].inheritedProtoView)
            .toBe(results[1].inheritedElementBinder.nestedProtoView);
        expect(stringifyElement(results[2].inheritedProtoView.rootElement))
            .toEqual('<template><span *foo=""></span></template>');
      });

    });

  });
}
