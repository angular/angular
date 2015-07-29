import {Injectable} from 'angular2/di';

import {PromiseWrapper, Promise} from 'angular2/src/facade/async';
import {BaseException, isPresent} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {
  ViewDefinition,
  ProtoViewDto,
  ViewType,
  DirectiveMetadata,
  RenderCompiler,
  RenderProtoViewRef,
  RenderProtoViewMergeMapping
} from '../../api';
import {CompilePipeline} from './compile_pipeline';
import {ViewLoader} from 'angular2/src/render/dom/compiler/view_loader';
import {CompileStepFactory, DefaultStepFactory} from './compile_step_factory';
import {Parser} from 'angular2/src/change_detection/change_detection';
import {ShadowDomStrategy} from '../shadow_dom/shadow_dom_strategy';
import {ElementSchemaRegistry} from '../schema/element_schema_registry';
import * as pvm from '../view/proto_view_merger';

/**
 * The compiler loads and translates the html templates of components into
 * nested ProtoViews. To decompose its functionality it uses
 * the CompilePipeline and the CompileSteps.
 */
export class DomCompiler extends RenderCompiler {
  constructor(public _stepFactory: CompileStepFactory, public _viewLoader: ViewLoader,
              private _schemaRegistry: ElementSchemaRegistry, public _useNativeShadowDom: boolean) {
    super();
  }

  compile(view: ViewDefinition): Promise<ProtoViewDto> {
    var tplPromise = this._viewLoader.load(view);
    return PromiseWrapper.then(
        tplPromise, (el) => this._compileTemplate(view, el, ViewType.COMPONENT), (e) => {
          throw new BaseException(`Failed to load the template for "${view.componentId}" : ${e}`);
          return null;
        });
  }

  compileHost(directiveMetadata: DirectiveMetadata): Promise<ProtoViewDto> {
    var hostViewDef = new ViewDefinition({
      componentId: directiveMetadata.id,
      templateAbsUrl: null, template: null,
      styles: null,
      styleAbsUrls: null,
      directives: [directiveMetadata]
    });
    var template = DOM.createTemplate('');
    DOM.appendChild(DOM.content(template), DOM.createElement(directiveMetadata.selector));
    return this._compileTemplate(hostViewDef, template, ViewType.HOST);
  }

  mergeProtoViewsRecursively(
      protoViewRefs: List<RenderProtoViewRef | List<any>>): Promise<RenderProtoViewMergeMapping> {
    return PromiseWrapper.resolve(pvm.mergeProtoViewsRecursively(protoViewRefs));
  }

  _compileTemplate(viewDef: ViewDefinition, tplElement,
                   protoViewType: ViewType): Promise<ProtoViewDto> {
    var pipeline = new CompilePipeline(this._schemaRegistry, this._stepFactory.createSteps(viewDef),
                                       this._useNativeShadowDom);
    var compileElements = pipeline.process(tplElement, protoViewType, viewDef.componentId);

    return PromiseWrapper.resolve(compileElements[0].inheritedProtoView.build());
  }
}

@Injectable()
export class DefaultDomCompiler extends DomCompiler {
  constructor(parser: Parser, shadowDomStrategy: ShadowDomStrategy, viewLoader: ViewLoader,
              schemaRegistry: ElementSchemaRegistry) {
    super(new DefaultStepFactory(parser, shadowDomStrategy), viewLoader, schemaRegistry,
          shadowDomStrategy.hasNativeContentElement());
  }
}
