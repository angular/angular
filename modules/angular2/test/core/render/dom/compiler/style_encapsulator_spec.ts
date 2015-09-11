import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  xit,
  SpyObject,
} from 'angular2/test_lib';

import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {CompilePipeline} from 'angular2/src/core/render/dom/compiler/compile_pipeline';

import {MapWrapper, ListWrapper} from 'angular2/src/core/facade/collection';
import {
  ProtoViewBuilder,
  ElementBinderBuilder
} from 'angular2/src/core/render/dom/view/proto_view_builder';
import {ViewDefinition, ViewType, ViewEncapsulation} from 'angular2/src/core/render/api';

import {StyleEncapsulator} from 'angular2/src/core/render/dom/compiler/style_encapsulator';
import {MockStep} from './pipeline_spec';

export function main() {
  describe('StyleEncapsulator', () => {
    var componentIdCache;

    beforeEach(() => { componentIdCache = new Map(); });

    function createPipeline(viewDef: ViewDefinition) {
      return new CompilePipeline([
        new MockStep((parent, current, control) => {
          var tagName = DOM.tagName(current.element).toLowerCase();
          if (tagName.startsWith('comp-')) {
            current.bindElement().setComponentId(tagName);
          }
        }),
        new StyleEncapsulator('someapp', viewDef, componentIdCache)
      ]);
    }

    function createViewDefinition(encapsulation: ViewEncapsulation, componentId: string):
        ViewDefinition {
      return new ViewDefinition({encapsulation: encapsulation, componentId: componentId});
    }

    function processStyles(encapsulation: ViewEncapsulation, componentId: string, styles: string[]):
        string[] {
      var viewDef = createViewDefinition(encapsulation, componentId);
      return createPipeline(viewDef).processStyles(styles);
    }

    function processElements(encapsulation: ViewEncapsulation, componentId: string,
                             template: Element, viewType: ViewType = ViewType.COMPONENT):
        ProtoViewBuilder {
      var viewDef = createViewDefinition(encapsulation, componentId);
      var compileElements = createPipeline(viewDef).processElements(template, viewType, viewDef);
      return compileElements[0].inheritedProtoView;
    }

    describe('ViewEncapsulation.None', () => {
      it('should not change the styles', () => {
        var cs = processStyles(ViewEncapsulation.None, 'someComponent', ['.one {}']);
        expect(cs[0]).toEqual('.one {}');
      });
    });

    describe('ViewEncapsulation.Native', () => {
      it('should not change the styles', () => {
        var cs = processStyles(ViewEncapsulation.Native, 'someComponent', ['.one {}']);
        expect(cs[0]).toEqual('.one {}');
      });
    });

    describe('ViewEncapsulation.Emulated', () => {
      it('should scope styles', () => {
        var cs = processStyles(ViewEncapsulation.Emulated, 'someComponent', ['.foo {} :host {}']);
        expect(cs[0]).toEqual(".foo[_ngcontent-someapp-0] {\n\n}\n\n[_nghost-someapp-0] {\n\n}");
      });

      it('should return the same style given the same component', () => {
        var style = '.foo {} :host {}';
        var cs1 = processStyles(ViewEncapsulation.Emulated, 'someComponent', [style]);
        var cs2 = processStyles(ViewEncapsulation.Emulated, 'someComponent', [style]);

        expect(cs1[0]).toEqual(cs2[0]);
      });

      it('should return different styles given different components', () => {
        var style = '.foo {} :host {}';
        var cs1 = processStyles(ViewEncapsulation.Emulated, 'someComponent1', [style]);
        var cs2 = processStyles(ViewEncapsulation.Emulated, 'someComponent2', [style]);

        expect(cs1[0]).not.toEqual(cs2[0]);
      });

      it('should add a host attribute to component proto views', () => {
        var template = DOM.createTemplate('<div></div>');
        var protoViewBuilder =
            processElements(ViewEncapsulation.Emulated, 'someComponent', template);
        expect(protoViewBuilder.hostAttributes.get('_nghost-someapp-0')).toEqual('');
      });

      it('should not add a host attribute to embedded proto views', () => {
        var template = DOM.createTemplate('<div></div>');
        var protoViewBuilder = processElements(ViewEncapsulation.Emulated, 'someComponent',
                                               template, ViewType.EMBEDDED);
        expect(protoViewBuilder.hostAttributes.size).toBe(0);
      });

      it('should not add a host attribute to host proto views', () => {
        var template = DOM.createTemplate('<div></div>');
        var protoViewBuilder =
            processElements(ViewEncapsulation.Emulated, 'someComponent', template, ViewType.HOST);
        expect(protoViewBuilder.hostAttributes.size).toBe(0);
      });

      it('should add an attribute to the content elements', () => {
        var template = DOM.createTemplate('<div></div>');
        processElements(ViewEncapsulation.Emulated, 'someComponent', template);
        expect(DOM.getInnerHTML(template)).toEqual('<div _ngcontent-someapp-0=""></div>');
      });

      it('should not add an attribute to the content elements for host views', () => {
        var template = DOM.createTemplate('<div></div>');
        processElements(ViewEncapsulation.Emulated, 'someComponent', template, ViewType.HOST);
        expect(DOM.getInnerHTML(template)).toEqual('<div></div>');
      });
    });
  });
}
