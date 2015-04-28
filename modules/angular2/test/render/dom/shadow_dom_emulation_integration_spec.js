import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  el,
  elementText,
  expect,
  iit,
  inject,
  it,
  xit,
  SpyObject,
} from 'angular2/test_lib';

import {MapWrapper, ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {
  ProtoViewDto, ViewDefinition, RenderViewContainerRef, DirectiveMetadata
} from 'angular2/src/render/api';

import {EmulatedScopedShadowDomStrategy} from 'angular2/src/render/dom/shadow_dom/emulated_scoped_shadow_dom_strategy';
import {EmulatedUnscopedShadowDomStrategy} from 'angular2/src/render/dom/shadow_dom/emulated_unscoped_shadow_dom_strategy';
import {NativeShadowDomStrategy} from 'angular2/src/render/dom/shadow_dom/native_shadow_dom_strategy';
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {StyleUrlResolver} from 'angular2/src/render/dom/shadow_dom/style_url_resolver';
import {StyleInliner} from 'angular2/src/render/dom/shadow_dom/style_inliner';

import {IntegrationTestbed} from './integration_testbed';

export function main() {
  describe('ShadowDom integration tests', function() {
    var urlResolver, styleUrlResolver, styleInliner;
    var strategies = {
      "scoped" : () => new EmulatedScopedShadowDomStrategy(styleInliner, styleUrlResolver, null),
      "unscoped" : () => new EmulatedUnscopedShadowDomStrategy(styleUrlResolver, null)
    }
    if (DOM.supportsNativeShadowDOM()) {
      StringMapWrapper.set(strategies, "native", () => new NativeShadowDomStrategy(styleUrlResolver));
    }

    beforeEach( () => {
      urlResolver = new UrlResolver();
      styleUrlResolver = new StyleUrlResolver(urlResolver);
      styleInliner = new StyleInliner(null, styleUrlResolver, urlResolver);
    });


    StringMapWrapper.forEach(strategies,
      (strategyFactory, name) => {

      describe(`${name} shadow dom strategy`, () => {

        var testbed, renderer, rootEl, compile, compileRoot;

        function createRenderer({templates, viewCacheCapacity}) {
          testbed = new IntegrationTestbed({
            shadowDomStrategy: strategyFactory(),
            templates: ListWrapper.concat(templates, componentTemplates),
            viewCacheCapacity: viewCacheCapacity
          });
          renderer = testbed.renderer;
          compileRoot = (rootEl) => testbed.compileRoot(rootEl);
          compile = (componentId) => testbed.compile(componentId);
        }

        beforeEach( () => {
          rootEl = el('<div></div>');
        });

        it('should support simple components', inject([AsyncTestCompleter], (async) => {
          createRenderer({
            templates: [new ViewDefinition({
              componentId: 'main',
              template: '<simple>' +
                '<div>A</div>' +
                '</simple>',
              directives: [simple]
            })]
          });
          compileRoot(mainDir).then( (pv) => {
            renderer.createInPlaceHostView(null, rootEl, pv.render);

            expect(rootEl).toHaveText('SIMPLE(A)');

            async.done();
          });
        }));

        it('should not show the light dom event if there is not content tag', inject([AsyncTestCompleter], (async) => {
          createRenderer({
            templates: [new ViewDefinition({
              componentId: 'main',
              template: '<empty>' +
                '<div>A</div>' +
                '</empty>',
              directives: [empty]
            })]
          });
          compileRoot(mainDir).then( (pv) => {
            renderer.createInPlaceHostView(null, rootEl, pv.render);

            expect(rootEl).toHaveText('');

            async.done();
          });
        }));

        it('should support dynamic components', inject([AsyncTestCompleter], (async) => {
          createRenderer({
            templates: [new ViewDefinition({
              componentId: 'main',
              template: '<dynamic>' +
                '<div>A</div>' +
                '</dynamic>',
              directives: [dynamicComponent]
            })]
          });
          compileRoot(mainDir).then( (rootPv) => {
            compile('simple').then( (simplePv) => {
              var views = renderer.createInPlaceHostView(null, rootEl, rootPv.render);
              renderer.createDynamicComponentView(views[1], 0, simplePv.render);

              expect(rootEl).toHaveText('SIMPLE(A)');

              async.done();
            });
          });
        }));

        it('should support multiple content tags', inject([AsyncTestCompleter], (async) => {
          createRenderer({
            templates: [new ViewDefinition({
              componentId: 'main',
              template: '<multiple-content-tags>' +
                  '<div>B</div>' +
                  '<div>C</div>' +
                  '<div class="left">A</div>' +
                '</multiple-content-tags>',
              directives: [multipleContentTagsComponent]
            })]
          });
          compileRoot(mainDir).then( (pv) => {
            renderer.createInPlaceHostView(null, rootEl, pv.render);

            expect(rootEl).toHaveText('(A, BC)');

            async.done();
          });
        }));

        it('should redistribute only direct children', inject([AsyncTestCompleter], (async) => {
          createRenderer({
            templates: [new ViewDefinition({
              componentId: 'main',
              template: '<multiple-content-tags>' +
                '<div>B<div class="left">A</div></div>' +
                '<div>C</div>' +
                '</multiple-content-tags>',
              directives: [multipleContentTagsComponent]
            })]
          });
          compileRoot(mainDir).then( (pv) => {
            renderer.createInPlaceHostView(null, rootEl, pv.render);

            expect(rootEl).toHaveText('(, BAC)');

            async.done();
          });
        }));

        it("should redistribute direct child viewcontainers when the light dom changes", inject([AsyncTestCompleter], (async) => {
          createRenderer({
            templates: [new ViewDefinition({
              componentId: 'main',
              template: '<multiple-content-tags>' +
                '<div><div template="manual" class="left">A</div></div>' +
                '<div>B</div>' +
                '</multiple-content-tags>',
              directives: [multipleContentTagsComponent, manualViewportDirective]
            })]
          });
          compileRoot(mainDir).then( (pv) => {
            var viewRefs = renderer.createInPlaceHostView(null, rootEl, pv.render);
            var vcRef = new RenderViewContainerRef(viewRefs[1], 1);
            var vcProtoViewRef = pv.elementBinders[0].nestedProtoView
              .elementBinders[1].nestedProtoView.render;
            expect(rootEl).toHaveText('(, B)');

            renderer.createViewInContainer(vcRef, 0, vcProtoViewRef)[0];

            expect(rootEl).toHaveText('(, AB)');

            renderer.destroyViewInContainer(vcRef, 0);

            expect(rootEl).toHaveText('(, B)');

            async.done();
          });
        }));

        it("should redistribute when the light dom changes", inject([AsyncTestCompleter], (async) => {
          createRenderer({
            templates: [new ViewDefinition({
              componentId: 'main',
              template: '<multiple-content-tags>' +
                '<div template="manual" class="left">A</div>' +
                '<div>B</div>' +
                '</multiple-content-tags>',
              directives: [multipleContentTagsComponent, manualViewportDirective]
            })]
          });
          compileRoot(mainDir).then( (pv) => {
            var viewRefs = renderer.createInPlaceHostView(null, rootEl, pv.render);
            var vcRef = new RenderViewContainerRef(viewRefs[1], 1);
            var vcProtoViewRef = pv.elementBinders[0].nestedProtoView
              .elementBinders[1].nestedProtoView.render;
            expect(rootEl).toHaveText('(, B)');

            renderer.createViewInContainer(vcRef, 0, vcProtoViewRef)[0];

            expect(rootEl).toHaveText('(A, B)');

            renderer.destroyViewInContainer(vcRef, 0);

            expect(rootEl).toHaveText('(, B)');

            async.done();
          });
        }));

        it("should support nested components", inject([AsyncTestCompleter], (async) => {
          createRenderer({
            templates: [new ViewDefinition({
              componentId: 'main',
              template: '<outer-with-indirect-nested>' +
                '<div>A</div>' +
                '<div>B</div>' +
                '</outer-with-indirect-nested>',
              directives: [outerWithIndirectNestedComponent]
            })]
          });
          compileRoot(mainDir).then( (pv) => {
            renderer.createInPlaceHostView(null, rootEl, pv.render);

            expect(rootEl).toHaveText('OUTER(SIMPLE(AB))');

            async.done();
          });
        }));

        it("should support nesting with content being direct child of a nested component", inject([AsyncTestCompleter], (async) => {
          createRenderer({
            templates: [new ViewDefinition({
              componentId: 'main',
              template: '<outer>' +
                '<div template="manual" class="left">A</div>' +
                '<div>B</div>' +
                '<div>C</div>' +
                '</outer>',
              directives: [outerComponent, manualViewportDirective]
            })]
          });
          compileRoot(mainDir).then( (pv) => {
            var viewRefs = renderer.createInPlaceHostView(null, rootEl, pv.render);
            var vcRef = new RenderViewContainerRef(viewRefs[1], 1);
            var vcProtoViewRef = pv.elementBinders[0].nestedProtoView
              .elementBinders[1].nestedProtoView.render;
            expect(rootEl).toHaveText('OUTER(INNER(INNERINNER(,BC)))');

            renderer.createViewInContainer(vcRef, 0, vcProtoViewRef)[0];

            expect(rootEl).toHaveText('OUTER(INNER(INNERINNER(A,BC)))');
            async.done();
          });
        }));

        it('should redistribute when the shadow dom changes', inject([AsyncTestCompleter], (async) => {
          createRenderer({
            templates: [new ViewDefinition({
              componentId: 'main',
              template: '<conditional-content>' +
                '<div class="left">A</div>' +
                '<div>B</div>' +
                '<div>C</div>' +
                '</conditional-content>',
              directives: [conditionalContentComponent]
            })]
          });
          compileRoot(mainDir).then( (pv) => {
            var viewRefs = renderer.createInPlaceHostView(null, rootEl, pv.render);
            var vcRef = new RenderViewContainerRef(viewRefs[2], 0);
            var vcProtoViewRef = pv.elementBinders[0].nestedProtoView
              .elementBinders[0].nestedProtoView
              .elementBinders[0].nestedProtoView.render;

            expect(rootEl).toHaveText('(, ABC)');

            renderer.createViewInContainer(vcRef, 0, vcProtoViewRef)[0];

            expect(rootEl).toHaveText('(A, BC)');

            renderer.destroyViewInContainer(vcRef, 0);

            expect(rootEl).toHaveText('(, ABC)');

            async.done();
          });
        }));

        it("should support tabs with view caching", inject([AsyncTestCompleter], (async) => {
          createRenderer({
            templates: [new ViewDefinition({
              componentId: 'main',
              template:
                '(<tab><span>0</span></tab>'+
                '<tab><span>1</span></tab>'+
                '<tab><span>2</span></tab>)',
              directives: [tabComponent]
            })],
            viewCacheCapacity: 5
          });
          compileRoot(mainDir).then( (pv) => {
            var viewRefs = renderer.createInPlaceHostView(null, rootEl, pv.render);
            var vcRef0 = new RenderViewContainerRef(viewRefs[2], 0);
            var vcRef1 = new RenderViewContainerRef(viewRefs[3], 0);
            var vcRef2 = new RenderViewContainerRef(viewRefs[4], 0);
            var mainPv = pv.elementBinders[0].nestedProtoView;
            var pvRef = mainPv.elementBinders[0].nestedProtoView.elementBinders[0].nestedProtoView.render;

            expect(rootEl).toHaveText('()');

            renderer.createViewInContainer(vcRef0, 0, pvRef);

            expect(rootEl).toHaveText('(TAB(0))');

            renderer.destroyViewInContainer(vcRef0, 0);
            renderer.createViewInContainer(vcRef1, 0, pvRef);

            expect(rootEl).toHaveText('(TAB(1))');

            renderer.destroyViewInContainer(vcRef1, 0);
            renderer.createViewInContainer(vcRef2, 0, pvRef);

            expect(rootEl).toHaveText('(TAB(2))');

            async.done();
          });
        }));

        //Implement once ElementRef support changing a class
        //it("should redistribute when a class has been added or removed");
        //it('should not lose focus', () => {
        //  var temp = `<simple>aaa<input type="text" id="focused-input" ng-class="{'aClass' : showClass}"> bbb</simple>`;
        //
        //  compile(temp, (view, lc) => {
        //    var input = view.rootNodes[1];
        //    input.focus();
        //
        //    expect(document.activeElement.id).toEqual("focused-input");
        //
        //    // update class of input
        //
        //    expect(document.activeElement.id).toEqual("focused-input");
        //  });
        //});
      });
    });

  });
}


var mainDir = new DirectiveMetadata({
  selector: 'main',
  id: 'main',
  type: DirectiveMetadata.COMPONENT_TYPE
});

var simple = new DirectiveMetadata({
  selector: 'simple',
  id: 'simple',
  type: DirectiveMetadata.COMPONENT_TYPE
});

var empty = new DirectiveMetadata({
  selector: 'empty',
  id: 'empty',
  type: DirectiveMetadata.COMPONENT_TYPE
});

var dynamicComponent = new DirectiveMetadata({
  selector: 'dynamic',
  id: 'dynamic',
  type: DirectiveMetadata.COMPONENT_TYPE
});

var multipleContentTagsComponent = new DirectiveMetadata({
  selector: 'multiple-content-tags',
  id: 'multiple-content-tags',
  type: DirectiveMetadata.COMPONENT_TYPE
});

var manualViewportDirective = new DirectiveMetadata({
  selector: '[manual]',
  id: 'manual',
  type: DirectiveMetadata.VIEWPORT_TYPE
});

var outerWithIndirectNestedComponent = new DirectiveMetadata({
  selector: 'outer-with-indirect-nested',
  id: 'outer-with-indirect-nested',
  type: DirectiveMetadata.COMPONENT_TYPE
});

var outerComponent = new DirectiveMetadata({
  selector: 'outer',
  id: 'outer',
  type: DirectiveMetadata.COMPONENT_TYPE
});

var innerComponent = new DirectiveMetadata({
  selector: 'inner',
  id: 'inner',
  type: DirectiveMetadata.COMPONENT_TYPE
});

var innerInnerComponent = new DirectiveMetadata({
  selector: 'innerinner',
  id: 'innerinner',
  type: DirectiveMetadata.COMPONENT_TYPE
});

var conditionalContentComponent = new DirectiveMetadata({
  selector: 'conditional-content',
  id: 'conditional-content',
  type: DirectiveMetadata.COMPONENT_TYPE
});

var autoViewportDirective = new DirectiveMetadata({
  selector: '[auto]',
  id: '[auto]',
  type: DirectiveMetadata.VIEWPORT_TYPE
});

var tabGroupComponent = new DirectiveMetadata({
  selector: 'tab-group',
  id: 'tab-group',
  type: DirectiveMetadata.COMPONENT_TYPE
});

var tabComponent = new DirectiveMetadata({
  selector: 'tab',
  id: 'tab',
  type: DirectiveMetadata.COMPONENT_TYPE
});

var componentTemplates = [
  new ViewDefinition({
    componentId: 'simple',
    template: 'SIMPLE(<content></content>)',
    directives: []
  }),
  new ViewDefinition({
    componentId: 'empty',
    template: '',
    directives: []
  }),
  new ViewDefinition({
    componentId: 'multiple-content-tags',
    template: '(<content select=".left"></content>, <content></content>)',
    directives: []
  }),
  new ViewDefinition({
    componentId: 'outer-with-indirect-nested',
    template: 'OUTER(<simple><div><content></content></div></simple>)',
    directives: [simple]
  }),
  new ViewDefinition({
    componentId: 'outer',
    template: 'OUTER(<inner><content></content></inner>)',
    directives: [innerComponent]
  }),
  new ViewDefinition({
    componentId: 'inner',
    template: 'INNER(<innerinner><content></content></innerinner>)',
    directives: [innerInnerComponent]
  }),
  new ViewDefinition({
    componentId: 'innerinner',
    template: 'INNERINNER(<content select=".left"></content>,<content></content>)',
    directives: []
  }),
  new ViewDefinition({
    componentId: 'conditional-content',
    template: '<div>(<div *auto="cond"><content select=".left"></content></div>, <content></content>)</div>',
    directives: [autoViewportDirective]
  }),
  new ViewDefinition({
    componentId: 'tab-group',
    template: 'GROUP(<content></content>)',
    directives: []
  }),
  new ViewDefinition({
    componentId: 'tab',
    template: '<div><div *auto="cond">TAB(<content></content>)</div></div>',
    directives: [autoViewportDirective]
  })
];
