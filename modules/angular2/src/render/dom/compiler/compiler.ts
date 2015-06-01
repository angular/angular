import {Injectable} from 'angular2/di';

import {PromiseWrapper, Promise} from 'angular2/src/facade/async';
import {BaseException, isPresent} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {
  ViewDefinition,
  ProtoViewDto,
  DirectiveMetadata,
  RenderCompiler,
  RenderProtoViewRef
} from '../../api';
import {CompilePipeline} from './compile_pipeline';
import {TemplateLoader} from 'angular2/src/render/dom/compiler/template_loader';
import {CompileStepFactory, DefaultStepFactory} from './compile_step_factory';
import {Parser} from 'angular2/change_detection';
import {ShadowDomStrategy} from '../shadow_dom/shadow_dom_strategy';

/**
 * The compiler loads and translates the html templates of components into
 * nested ProtoViews. To decompose its functionality it uses
 * the CompilePipeline and the CompileSteps.
 */
export class DomCompiler extends RenderCompiler {
  _templateLoader: TemplateLoader;
  _stepFactory: CompileStepFactory;

  constructor(stepFactory: CompileStepFactory, templateLoader: TemplateLoader) {
    super();
    this._templateLoader = templateLoader;
    this._stepFactory = stepFactory;
  }

  compile(template: ViewDefinition): Promise<ProtoViewDto> {
    var tplPromise = this._templateLoader.load(template);
    return PromiseWrapper.then(
        tplPromise, (el) => this._compileTemplate(template, el, ProtoViewDto.COMPONENT_VIEW_TYPE),
        (e) => {
          throw new BaseException(
              `Failed to load the template for "${template.componentId}" : ${e}`);
        });
  }

  compileHost(directiveMetadata: DirectiveMetadata): Promise<ProtoViewDto> {
    var hostViewDef = new ViewDefinition({
      componentId: directiveMetadata.id,
      absUrl: null, template: null,
      directives: [directiveMetadata]
    });
    var element = DOM.createElement(directiveMetadata.selector);
    return this._compileTemplate(hostViewDef, element, ProtoViewDto.HOST_VIEW_TYPE);
  }

  _compileTemplate(viewDef: ViewDefinition, tplElement,
                   protoViewType: number): Promise<ProtoViewDto> {
    var subTaskPromises = [];
    var pipeline = new CompilePipeline(this._stepFactory.createSteps(viewDef, subTaskPromises));
    var compileElements = pipeline.process(tplElement, protoViewType, viewDef.componentId);

    var protoView = compileElements[0].inheritedProtoView.build();

    if (subTaskPromises.length > 0) {
      return PromiseWrapper.all(subTaskPromises).then((_) => protoView);
    } else {
      return PromiseWrapper.resolve(protoView);
    }
  }
}

@Injectable()
export class DefaultDomCompiler extends DomCompiler {
  constructor(parser: Parser, shadowDomStrategy: ShadowDomStrategy,
              templateLoader: TemplateLoader) {
    super(new DefaultStepFactory(parser, shadowDomStrategy), templateLoader);
  }
}
