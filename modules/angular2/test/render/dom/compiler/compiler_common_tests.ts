import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  IS_DARTIUM,
  it,
} from 'angular2/test_lib';

import {DOM} from 'angular2/src/dom/dom_adapter';
import {List, ListWrapper, Map, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {Type, isBlank, stringify, isPresent, BaseException} from 'angular2/src/facade/lang';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';

import {DomCompiler} from 'angular2/src/render/dom/compiler/compiler';
import {
  ProtoViewDto,
  ViewDefinition,
  DirectiveMetadata,
  ViewType,
  ViewEncapsulation
} from 'angular2/src/render/api';
import {CompileStep} from 'angular2/src/render/dom/compiler/compile_step';
import {CompileStepFactory} from 'angular2/src/render/dom/compiler/compile_step_factory';
import {ElementSchemaRegistry} from 'angular2/src/render/dom/schema/element_schema_registry';
import {ViewLoader, TemplateAndStyles} from 'angular2/src/render/dom/compiler/view_loader';

import {resolveInternalDomProtoView} from 'angular2/src/render/dom/view/proto_view';
import {SharedStylesHost} from 'angular2/src/render/dom/view/shared_styles_host';
import {TemplateCloner} from 'angular2/src/render/dom/template_cloner';

import {MockStep} from './pipeline_spec';

export function runCompilerCommonTests() {
  describe('DomCompiler', function() {
    var mockStepFactory: MockStepFactory;
    var sharedStylesHost: SharedStylesHost;

    beforeEach(() => {sharedStylesHost = new SharedStylesHost()});

    function createCompiler(processElementClosure = null, processStyleClosure = null,
                            urlData = null) {
      if (isBlank(urlData)) {
        urlData = new Map();
      }
      var tplLoader = new FakeViewLoader(urlData);
      mockStepFactory =
          new MockStepFactory([new MockStep(processElementClosure, processStyleClosure)]);
      return new DomCompiler(new ElementSchemaRegistry(), new TemplateCloner(-1), mockStepFactory,
                             tplLoader, sharedStylesHost);
    }

    describe('compile', () => {

      it('should run the steps and build the AppProtoView of the root element',
         inject([AsyncTestCompleter], (async) => {
           var compiler = createCompiler((parent, current, control) => {
             current.inheritedProtoView.bindVariable('b', 'a');
           });
           compiler.compile(
                       new ViewDefinition({componentId: 'someComponent', template: '<div></div>'}))
               .then((protoView) => {
                 expect(protoView.variableBindings)
                     .toEqual(MapWrapper.createFromStringMap({'a': 'b'}));
                 async.done();
               });
         }));

      it('should run the steps and build the proto view', inject([AsyncTestCompleter], (async) => {
           var compiler = createCompiler((parent, current, control) => {
             current.inheritedProtoView.bindVariable('b', 'a');
           });

           var dirMetadata = DirectiveMetadata.create(
               {id: 'id', selector: 'custom', type: DirectiveMetadata.COMPONENT_TYPE});
           compiler.compileHost(dirMetadata)
               .then((protoView) => {
                 expect(DOM.tagName(DOM.firstChild(DOM.content(templateRoot(protoView))))
                            .toLowerCase())
                     .toEqual('custom');
                 expect(mockStepFactory.viewDef.directives).toEqual([dirMetadata]);
                 expect(protoView.variableBindings)
                     .toEqual(MapWrapper.createFromStringMap({'a': 'b'}));
                 async.done();
               });
         }));

      it('should use the inline template and compile in sync',
         inject([AsyncTestCompleter], (async) => {
           var compiler = createCompiler(EMPTY_STEP);
           compiler.compile(
                       new ViewDefinition({componentId: 'someId', template: 'inline component'}))
               .then((protoView) => {
                 expect(DOM.getInnerHTML(templateRoot(protoView))).toEqual('inline component');
                 async.done();
               });
         }));

      it('should load url templates', inject([AsyncTestCompleter], (async) => {
           var urlData = MapWrapper.createFromStringMap({'someUrl': 'url component'});
           var compiler = createCompiler(EMPTY_STEP, null, urlData);
           compiler.compile(new ViewDefinition({componentId: 'someId', templateAbsUrl: 'someUrl'}))
               .then((protoView) => {
                 expect(DOM.getInnerHTML(templateRoot(protoView))).toEqual('url component');
                 async.done();
               });
         }));

      it('should report loading errors', inject([AsyncTestCompleter], (async) => {
           var compiler = createCompiler(EMPTY_STEP, null, new Map());
           PromiseWrapper.catchError(
               compiler.compile(
                   new ViewDefinition({componentId: 'someId', templateAbsUrl: 'someUrl'})),
               (e) => {
                 expect(e.message).toEqual(
                     'Failed to load the template for "someId" : Failed to fetch url "someUrl"');
                 async.done();
                 return null;
               });
         }));

      it('should return ProtoViews of type COMPONENT_VIEW_TYPE',
         inject([AsyncTestCompleter], (async) => {
           var compiler = createCompiler(EMPTY_STEP);
           compiler.compile(
                       new ViewDefinition({componentId: 'someId', template: 'inline component'}))
               .then((protoView) => {
                 expect(protoView.type).toEqual(ViewType.COMPONENT);
                 async.done();
               });
         }));

    });

    describe('compileHost', () => {

      it('should return ProtoViews of type HOST_VIEW_TYPE',
         inject([AsyncTestCompleter], (async) => {
           var compiler = createCompiler(EMPTY_STEP);
           compiler.compileHost(someComponent)
               .then((protoView) => {
                 expect(protoView.type).toEqual(ViewType.HOST);
                 async.done();
               });
         }));

    });

    describe('compile styles', () => {
      it('should run the steps', inject([AsyncTestCompleter], (async) => {
           var compiler = createCompiler(null, (style) => { return style + 'b {};'; });
           compiler.compile(new ViewDefinition(
                                {componentId: 'someComponent', template: '', styles: ['a {};']}))
               .then((protoViewDto) => {
                 expect(sharedStylesHost.getAllStyles()).toEqual(['a {};b {};']);
                 async.done();
               });
         }));

      it('should store the styles in the SharedStylesHost for ViewEncapsulation.NONE',
         inject([AsyncTestCompleter], (async) => {
           var compiler = createCompiler();
           compiler.compile(new ViewDefinition({
                     componentId: 'someComponent',
                     template: '',
                     styles: ['a {};'],
                     encapsulation: ViewEncapsulation.NONE
                   }))
               .then((protoViewDto) => {
                 expect(DOM.getInnerHTML(templateRoot(protoViewDto))).toEqual('');
                 expect(sharedStylesHost.getAllStyles()).toEqual(['a {};']);
                 async.done();
               });
         }));

      it('should store the styles in the SharedStylesHost for ViewEncapsulation.EMULATED',
         inject([AsyncTestCompleter], (async) => {
           var compiler = createCompiler();
           compiler.compile(new ViewDefinition({
                     componentId: 'someComponent',
                     template: '',
                     styles: ['a {};'],
                     encapsulation: ViewEncapsulation.EMULATED
                   }))
               .then((protoViewDto) => {
                 expect(DOM.getInnerHTML(templateRoot(protoViewDto))).toEqual('');
                 expect(sharedStylesHost.getAllStyles()).toEqual(['a {};']);
                 async.done();
               });
         }));

      if (DOM.supportsNativeShadowDOM()) {
        it('should store the styles in the template for ViewEncapsulation.NATIVE',
           inject([AsyncTestCompleter], (async) => {
             var compiler = createCompiler();
             compiler.compile(new ViewDefinition({
                       componentId: 'someComponent',
                       template: '',
                       styles: ['a {};'],
                       encapsulation: ViewEncapsulation.NATIVE
                     }))
                 .then((protoViewDto) => {
                   expect(DOM.getInnerHTML(templateRoot(protoViewDto)))
                       .toEqual('<style>a {};</style>');
                   expect(sharedStylesHost.getAllStyles()).toEqual([]);
                   async.done();
                 });
           }));
      }

      it('should default to ViewEncapsulation.NONE if no styles are specified',
         inject([AsyncTestCompleter], (async) => {
           var compiler = createCompiler();
           compiler.compile(
                       new ViewDefinition({componentId: 'someComponent', template: '', styles: []}))
               .then((protoView) => {
                 expect(mockStepFactory.viewDef.encapsulation).toBe(ViewEncapsulation.NONE);
                 async.done();
               });
         }));

      it('should default to ViewEncapsulation.EMULATED if styles are specified',
         inject([AsyncTestCompleter], (async) => {
           var compiler = createCompiler();
           compiler.compile(new ViewDefinition(
                                {componentId: 'someComponent', template: '', styles: ['a {};']}))
               .then((protoView) => {
                 expect(mockStepFactory.viewDef.encapsulation).toBe(ViewEncapsulation.EMULATED);
                 async.done();
               });
         }));

    });

    describe('mergeProtoViews', () => {
      it('should store the styles of the merged ProtoView in the SharedStylesHost',
         inject([AsyncTestCompleter], (async) => {
           var compiler = createCompiler();
           compiler.compile(new ViewDefinition(
                                {componentId: 'someComponent', template: '', styles: ['a {};']}))
               .then(protoViewDto => compiler.mergeProtoViewsRecursively([protoViewDto.render]))
               .then(_ => {
                 expect(sharedStylesHost.getAllStyles()).toEqual(['a {};']);
                 async.done();
               });
         }));

    });

  });
}

function templateRoot(protoViewDto: ProtoViewDto): Element {
  var pv = resolveInternalDomProtoView(protoViewDto.render);
  return (<Element>pv.cloneableTemplate);
}

class MockStepFactory extends CompileStepFactory {
  steps: List<CompileStep>;
  subTaskPromises: List<Promise<any>>;
  viewDef: ViewDefinition;

  constructor(steps) {
    super();
    this.steps = steps;
  }
  createSteps(viewDef): List<CompileStep> {
    this.viewDef = viewDef;
    return this.steps;
  }
}

var EMPTY_STEP = (parent, current, control) => {
  if (isPresent(parent)) {
    current.inheritedProtoView = parent.inheritedProtoView;
  }
};

class FakeViewLoader extends ViewLoader {
  _urlData: Map<string, string>;
  constructor(urlData) {
    super(null, null, null);
    this._urlData = urlData;
  }

  load(viewDef): Promise<any> {
    var styles = isPresent(viewDef.styles) ? viewDef.styles : [];
    if (isPresent(viewDef.template)) {
      return PromiseWrapper.resolve(new TemplateAndStyles(viewDef.template, styles));
    }

    if (isPresent(viewDef.templateAbsUrl)) {
      var content = this._urlData.get(viewDef.templateAbsUrl);
      return isPresent(content) ?
                 PromiseWrapper.resolve(new TemplateAndStyles(content, styles)) :
                 PromiseWrapper.reject(`Failed to fetch url "${viewDef.templateAbsUrl}"`, null);
    }

    throw new BaseException('View should have either the templateUrl or template property set');
  }
}

var someComponent = DirectiveMetadata.create(
    {selector: 'some-comp', id: 'someComponent', type: DirectiveMetadata.COMPONENT_TYPE});
