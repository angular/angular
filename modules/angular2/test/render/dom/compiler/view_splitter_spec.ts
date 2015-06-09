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

import {Lexer, Parser} from 'angular2/change_detection';

export function main() {
  describe('ViewSplitter', () => {

    function createPipeline() {
      return new CompilePipeline([new ViewSplitter(new Parser(new Lexer()))]);
    }

    describe('<template> elements', () => {

      it('should move the content into a new <template> element and mark that as viewRoot', () => {
        var rootElement = el('<div><template if="true">a</template></div>');
        var results = createPipeline().process(rootElement);

        expect(stringifyElement(results[1].element))
            .toEqual('<template class="ng-binding" if="true"></template>');
        expect(results[1].isViewRoot).toBe(false);
        expect(stringifyElement(results[2].element)).toEqual('<template>a</template>');
        expect(results[2].isViewRoot).toBe(true);
      });

      it('should mark the new <template> element as viewRoot', () => {
        var rootElement = el('<div><template if="true">a</template></div>');
        var results = createPipeline().process(rootElement);
        expect(results[2].isViewRoot).toBe(true);
      });

      it('should not wrap the root element', () => {
        var rootElement = el('<div></div>');
        var results = createPipeline().process(rootElement);
        expect(results.length).toBe(1);
        expect(stringifyElement(rootElement)).toEqual('<div></div>');
      });

      it('should copy over the elementDescription', () => {
        var rootElement = el('<div><template if="true">a</template></div>');
        var results = createPipeline().process(rootElement);
        expect(results[2].elementDescription).toBe(results[1].elementDescription);
      });

      it('should clean out the inheritedElementBinder', () => {
        var rootElement = el('<div><template if="true">a</template></div>');
        var results = createPipeline().process(rootElement);
        expect(results[2].inheritedElementBinder).toBe(null);
      });

      it('should create a nestedProtoView', () => {
        var rootElement = el('<div><template if="true">a</template></div>');
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
        var rootElement = el('<div><span template=""></span></div>');
        var originalChild = rootElement.childNodes[0];
        var results = createPipeline().process(rootElement);
        expect(results[0].element).toBe(rootElement);
        expect(stringifyElement(results[0].element))
            .toEqual('<div><template class="ng-binding"></template></div>');
        expect(stringifyElement(results[2].element)).toEqual('<span template=""></span>');
        expect(results[2].element).toBe(originalChild);
      });

      it('should work with top-level template node', () => {
        var rootElement = el('<template><div template>x</div></template>');
        var originalChild = DOM.content(rootElement).childNodes[0];
        var results = createPipeline().process(rootElement);

        expect(results[0].element).toBe(rootElement);
        expect(results[0].isViewRoot).toBe(true);
        expect(results[2].isViewRoot).toBe(true);
        expect(stringifyElement(results[0].element))
            .toEqual('<template><template class="ng-binding"></template></template>');
        expect(results[2].element).toBe(originalChild);
      });

      it('should mark the element as viewRoot', () => {
        var rootElement = el('<div><div template></div></div>');
        var results = createPipeline().process(rootElement);
        expect(results[2].isViewRoot).toBe(true);
      });

      it('should add property bindings from the template attribute', () => {
        var rootElement = el('<div><div template="some-prop:expr"></div></div>');
        var results = createPipeline().process(rootElement);
        expect(
            MapWrapper.get(results[1].inheritedElementBinder.propertyBindings, 'someProp').source)
            .toEqual('expr');
        expect(MapWrapper.get(results[1].attrs(), 'some-prop')).toEqual('expr');
      });

      it('should add variable mappings from the template attribute to the nestedProtoView', () => {
        var rootElement = el('<div><div template="var var-name=mapName"></div></div>');
        var results = createPipeline().process(rootElement);
        expect(results[2].inheritedProtoView.variableBindings)
            .toEqual(MapWrapper.createFromStringMap({'mapName': 'varName'}));
      });

      it('should add entries without value as attributes to the element', () => {
        var rootElement = el('<div><div template="varname"></div></div>');
        var results = createPipeline().process(rootElement);
        expect(MapWrapper.get(results[1].attrs(), 'varname')).toEqual('');
        expect(results[1].inheritedElementBinder.propertyBindings).toEqual(MapWrapper.create());
        expect(results[1].inheritedElementBinder.variableBindings).toEqual(MapWrapper.create());
      });

      it('should iterate properly after a template dom modification', () => {
        var rootElement = el('<div><div template></div><after></after></div>');
        var results = createPipeline().process(rootElement);
        // 1 root + 2 initial + 1 generated template elements
        expect(results.length).toEqual(4);
      });

      it('should copy over the elementDescription', () => {
        var rootElement = el('<div><span template=""></span></div>');
        var results = createPipeline().process(rootElement);
        expect(results[2].elementDescription).toBe(results[1].elementDescription);
      });

      it('should clean out the inheritedElementBinder', () => {
        var rootElement = el('<div><span template=""></span></div>');
        var results = createPipeline().process(rootElement);
        expect(results[2].inheritedElementBinder).toBe(null);
      });

      it('should create a nestedProtoView', () => {
        var rootElement = el('<div><span template=""></span></div>');
        var results = createPipeline().process(rootElement);
        expect(results[2].inheritedProtoView).not.toBe(null);
        expect(results[2].inheritedProtoView)
            .toBe(results[1].inheritedElementBinder.nestedProtoView);
        expect(stringifyElement(results[2].inheritedProtoView.rootElement))
            .toEqual('<span template=""></span>');
      });

    });

    describe('elements with *directive_name attribute', () => {

      it('should replace the element with an empty <template> element', () => {
        var rootElement = el('<div><span *ng-if></span></div>');
        var originalChild = rootElement.childNodes[0];
        var results = createPipeline().process(rootElement);
        expect(results[0].element).toBe(rootElement);
        expect(stringifyElement(results[0].element))
            .toEqual('<div><template class="ng-binding" ng-if=""></template></div>');
        expect(stringifyElement(results[2].element)).toEqual('<span *ng-if=""></span>');
        expect(results[2].element).toBe(originalChild);
      });

      it('should mark the element as viewRoot', () => {
        var rootElement = el('<div><div *foo="bar"></div></div>');
        var results = createPipeline().process(rootElement);
        expect(results[2].isViewRoot).toBe(true);
      });

      it('should work with top-level template node', () => {
        var rootElement = el('<template><div *foo>x</div></template>');
        var originalChild = DOM.content(rootElement).childNodes[0];
        var results = createPipeline().process(rootElement);

        expect(results[0].element).toBe(rootElement);
        expect(results[0].isViewRoot).toBe(true);
        expect(results[2].isViewRoot).toBe(true);
        expect(stringifyElement(results[0].element))
            .toEqual('<template><template class="ng-binding" foo=""></template></template>');
        expect(results[2].element).toBe(originalChild);
      });

      it('should add property bindings from the template attribute', () => {
        var rootElement = el('<div><div *prop="expr"></div></div>');
        var results = createPipeline().process(rootElement);
        expect(MapWrapper.get(results[1].inheritedElementBinder.propertyBindings, 'prop').source)
            .toEqual('expr');
        expect(MapWrapper.get(results[1].attrs(), 'prop')).toEqual('expr');
      });

      it('should add variable mappings from the template attribute to the nestedProtoView', () => {
        var rootElement = el('<div><div *foreach="var varName=mapName"></div></div>');
        var results = createPipeline().process(rootElement);
        expect(results[2].inheritedProtoView.variableBindings)
            .toEqual(MapWrapper.createFromStringMap({'mapName': 'varName'}));
      });

      it('should add entries without value as attribute to the element', () => {
        var rootElement = el('<div><div *varname></div></div>');
        var results = createPipeline().process(rootElement);
        expect(MapWrapper.get(results[1].attrs(), 'varname')).toEqual('');
        expect(results[1].inheritedElementBinder.propertyBindings).toEqual(MapWrapper.create());
        expect(results[1].inheritedElementBinder.variableBindings).toEqual(MapWrapper.create());
      });

      it('should iterate properly after a template dom modification', () => {
        var rootElement = el('<div><div *foo></div><after></after></div>');
        var results = createPipeline().process(rootElement);
        // 1 root + 2 initial + 1 generated template elements
        expect(results.length).toEqual(4);
      });

      it('should copy over the elementDescription', () => {
        var rootElement = el('<div><span *foo></span></div>');
        var results = createPipeline().process(rootElement);
        expect(results[2].elementDescription).toBe(results[1].elementDescription);
      });

      it('should clean out the inheritedElementBinder', () => {
        var rootElement = el('<div><span *foo></span></div>');
        var results = createPipeline().process(rootElement);
        expect(results[2].inheritedElementBinder).toBe(null);
      });

      it('should create a nestedProtoView', () => {
        var rootElement = el('<div><span *foo></span></div>');
        var results = createPipeline().process(rootElement);
        expect(results[2].inheritedProtoView).not.toBe(null);
        expect(results[2].inheritedProtoView)
            .toBe(results[1].inheritedElementBinder.nestedProtoView);
        expect(stringifyElement(results[2].inheritedProtoView.rootElement))
            .toEqual('<span *foo=""></span>');
      });

    });

  });
}
