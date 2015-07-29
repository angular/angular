import {Injectable} from 'angular2/di';

import {PromiseWrapper, Promise} from 'angular2/src/facade/async';
import {BaseException, isPresent, isBlank} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {
  ViewDefinition,
  ProtoViewDto,
  ViewType,
  DirectiveMetadata,
  RenderCompiler,
  RenderProtoViewRef,
  RenderProtoViewMergeMapping,
  ViewEncapsulation
} from '../../api';
import {CompilePipeline} from './compile_pipeline';
import {ViewLoader, TemplateAndStyles} from 'angular2/src/render/dom/compiler/view_loader';
import {CompileStepFactory, DefaultStepFactory} from './compile_step_factory';
import {ElementSchemaRegistry} from '../schema/element_schema_registry';
import {Parser} from 'angular2/src/change_detection/change_detection';
import * as pvm from '../view/proto_view_merger';
import {DOCUMENT_TOKEN, APP_ID_TOKEN} from '../dom_tokens';
import {Inject} from 'angular2/di';
import {SharedStylesHost} from '../view/shared_styles_host';
import {prependAll} from '../util';

/**
 * The compiler loads and translates the html templates of components into
 * nested ProtoViews. To decompose its functionality it uses
 * the CompilePipeline and the CompileSteps.
 */
export class DomCompiler extends RenderCompiler {
  constructor(private _schemaRegistry: ElementSchemaRegistry,
              private _stepFactory: CompileStepFactory, private _viewLoader: ViewLoader,
              private _sharedStylesHost: SharedStylesHost) {
    super();
  }

  compile(view: ViewDefinition): Promise<ProtoViewDto> {
    var tplPromise = this._viewLoader.load(view);
    return PromiseWrapper.then(
        tplPromise, (tplAndStyles: TemplateAndStyles) =>
                        this._compileView(view, tplAndStyles, ViewType.COMPONENT),
        (e) => {
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
      directives: [directiveMetadata],
      encapsulation: ViewEncapsulation.NONE
    });
    return this._compileView(
        hostViewDef, new TemplateAndStyles(
                         `<${directiveMetadata.selector}></${directiveMetadata.selector}>`, []),
        ViewType.HOST);
  }

  mergeProtoViewsRecursively(
      protoViewRefs: List<RenderProtoViewRef | List<any>>): Promise<RenderProtoViewMergeMapping> {
    return PromiseWrapper.resolve(pvm.mergeProtoViewsRecursively(protoViewRefs));
  }

  _compileView(viewDef: ViewDefinition, templateAndStyles: TemplateAndStyles,
               protoViewType: ViewType): Promise<ProtoViewDto> {
    if (viewDef.encapsulation === ViewEncapsulation.EMULATED &&
        templateAndStyles.styles.length === 0) {
      viewDef = this._normalizeViewEncapsulationIfThereAreNoStyles(viewDef);
    }
    var pipeline = new CompilePipeline(this._stepFactory.createSteps(viewDef));

    var compiledStyles = pipeline.processStyles(templateAndStyles.styles);
    var compileElements = pipeline.processElements(DOM.createTemplate(templateAndStyles.template),
                                                   protoViewType, viewDef);
    if (viewDef.encapsulation === ViewEncapsulation.NATIVE) {
      prependAll(DOM.content(compileElements[0].element),
                 compiledStyles.map(style => DOM.createStyleElement(style)));
    } else {
      this._sharedStylesHost.addStyles(compiledStyles);
    }

    return PromiseWrapper.resolve(
        compileElements[0].inheritedProtoView.build(this._schemaRegistry));
  }

  _normalizeViewEncapsulationIfThereAreNoStyles(viewDef: ViewDefinition): ViewDefinition {
    if (viewDef.encapsulation === ViewEncapsulation.EMULATED) {
      return new ViewDefinition({
        componentId: viewDef.componentId,
        templateAbsUrl: viewDef.templateAbsUrl, template: viewDef.template,
        styleAbsUrls: viewDef.styleAbsUrls,
        styles: viewDef.styles,
        directives: viewDef.directives,
        encapsulation: ViewEncapsulation.NONE
      });
    } else {
      return viewDef;
    }
  }
}

@Injectable()
export class DefaultDomCompiler extends DomCompiler {
  constructor(schemaRegistry: ElementSchemaRegistry, parser: Parser, viewLoader: ViewLoader,
              sharedStylesHost: SharedStylesHost, @Inject(APP_ID_TOKEN) appId: any) {
    super(schemaRegistry, new DefaultStepFactory(parser, appId), viewLoader, sharedStylesHost);
  }
}
