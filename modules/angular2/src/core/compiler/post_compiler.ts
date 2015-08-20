import {Injectable, Binding, resolveForwardRef, Inject} from 'angular2/di';

import {List, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {isPresent, isBlank, BaseException, assertionsEnabled, stringify, Type, isArray, normalizeBlank, isType} from 'angular2/src/facade/lang';
import {reflector} from 'angular2/src/reflection/reflection';

import {PipeBinding} from '../pipes/pipe_binding';
import {ProtoPipes} from '../pipes/pipes';

import {RenderDirectiveMetadata, ViewType, RenderProtoViewRef} from 'angular2/src/render/api';
import {AppProtoView, AppProtoViewMergeInfo} from './view';
import {ProtoViewRef} from './view_ref';
import {ElementBinder} from './element_binder';
import {ProtoElementInjector, DirectiveBinding} from './element_injector';
import {DirectiveResolver} from './directive_resolver';
import {ViewResolver} from './view_resolver';
import {PipeResolver} from './pipe_resolver';
import {ComponentMetadata} from '../metadata/directives';
import {ViewMetadata} from '../metadata/view';
import {DEFAULT_PIPES_TOKEN} from 'angular2/pipes';

import {
  ChangeDetection,
  ChangeDetectorDefinition
} from 'angular2/src/change_detection/change_detection';

import {TemplateCmd, CommonBeginElementCmd, EmbeddedTemplateCmd, BeginComponentCmd, createEndComponentCmd, TextCmd,
  isBeginElement, isEndElement, isText} from './template_commands';

import {TemplateRegistry} from './template_registry';
import {CompilerCache} from './compiler_cache';

import {Renderer, RenderTemplateCmdType} from 'angular2/render';

@Injectable()
export class PostCompiler {
  private _defaultPipes: Type[];
  
  /**
   * @private
   */
  constructor(private _renderer:Renderer, private _cache: CompilerCache, private _changeDetection: ChangeDetection,
      private _directiveResolver: DirectiveResolver, private _viewResolver: ViewResolver, private _pipeResolver: PipeResolver,
      private _templateRegistry: TemplateRegistry, @Inject(DEFAULT_PIPES_TOKEN) defaultPipes: Type[]) {
    this._defaultPipes = defaultPipes;
  }
  
  compileHost(componentType: Type): ProtoViewRef {
    var protoViewId = `${stringify(componentType)}_host_0`;    
    var protoView = this._cache.getProtoView(protoViewId);
    if (isBlank(protoView)) {
      var annotation = <ComponentMetadata> this._directiveResolver.resolve(componentType);
      var cmds = [
        // TODO: support components with arbitrary css selectors!
        new BeginComponentCmd(`${stringify(componentType)}_comp_0`, annotation.selector, [], [], [], [componentType], false, null),
        createEndComponentCmd()
      ];
      protoView = this._createAppProtoView(protoViewId, ViewType.HOST, false, null, cmds,  ProtoPipes.fromBindings([]));
    }
    return protoView.ref;
  }
  
  private _createComponentProtoView(bc:BeginComponentCmd): AppProtoView {
    var protoView = this._cache.getProtoView(bc.templateId);
    var component = bc.directives[0];
    if (isBlank(protoView)) {
      var view = this._viewResolver.resolve(component);
      var cmds = this._templateRegistry.getTemplate(bc.templateId);
      var styles = this._templateRegistry.getSharedStyles(bc.templateId);
      this._renderer.addComponentTemplate(bc.templateId, cmds, styles);
      var boundPipes = this._flattenPipes(view).map(pipe => this._bindPipe(pipe));
      protoView = this._createAppProtoView(bc.templateId, ViewType.COMPONENT, true, null, cmds, ProtoPipes.fromBindings(boundPipes));
      // Note: The cache is updated inside of _createAppProtoView before recursing
      // to be able to resolve cycles                
      this._initializeProtoView(protoView, null);
    }
    return protoView;
  }
    
  private _createEmbeddedProtoView(et:EmbeddedTemplateCmd, parentProtoView:AppProtoView) {
    var embeddedProtoView = this._createAppProtoView(et.templateId, ViewType.EMBEDDED, et.isMerged,
      arrayToMap(et.variables), et.content, new ProtoPipes(parentProtoView.pipes.config));
    if (et.isMerged) {
      this._initializeProtoView(embeddedProtoView, null);
    }
    return embeddedProtoView;
  }

  private _createAppProtoView(protoViewId: string, protoViewType: ViewType, isMergable:boolean,
                     templateVariableBindings: Map<string, string>,
                     templateCmds: TemplateCmd[], protoPipes: ProtoPipes): AppProtoView {
    var protoChangeDetector = this._changeDetection.createProtoChangeDetector(new ChangeDetectorDefinition(protoViewId, null, null, null, null, null, null));
    var protoView = new AppProtoView(protoViewId, templateCmds,
        protoViewType, isMergable,
        protoChangeDetector, templateVariableBindings, protoPipes);
    // cache before we recurse so that we can resolve cycles!
    this._cache.setProtView(protoView);
    return protoView;        
  }
  
  initializeProtoViewIfNeeded(protoView: AppProtoView) {
    if (!protoView.isInitialized()) {
      var render = this._renderer.createProtoView(protoView.templateCmds);
      this._initializeProtoView(protoView, render);
    }
  }
  
  private _initializeProtoView(protoView: AppProtoView, render: RenderProtoViewRef) {
    var variableLocations:Map<string, number> = new Map();
    var boundTextCount = 0;
    var boundElementIndex = 0;
    var elementBinderStack:ElementBinder[] = [];
    var distanceToParentElementBinder = 0;
    var distanceToParentProtoElementInjector = 0;
    var templateCmds = protoView.templateCmds;
    var elementBinders = [];
    var mergeEmbeddedViewCount = 0;
    var mergeElementCount = 0;
    var mergeViewCount = 1;
    for (var cmdIdx=0; cmdIdx<templateCmds.length; cmdIdx++) {
      var cmd = templateCmds[cmdIdx];
      var type = cmd.type;
      if (isBeginElement(type)) {
        var beginElement = <CommonBeginElementCmd> cmd;
        var elementBinder:ElementBinder = null;
        var protoElementInjector: ProtoElementInjector = null;
        if (beginElement.isBound) {
          mergeElementCount++;
          var nestedProtoView: AppProtoView = null;
          if (type === RenderTemplateCmdType.BEGIN_COMPONENT) {
            var bc = <BeginComponentCmd> beginElement;
            nestedProtoView = this._createComponentProtoView(bc);
          } else if (type === RenderTemplateCmdType.EMBEDDED_TEMPLATE) {
            var et = <EmbeddedTemplateCmd> beginElement;
            nestedProtoView = this._createEmbeddedProtoView(et, protoView);
            if (et.isMerged) {
              mergeEmbeddedViewCount++;
            }
          }
          if (isPresent(nestedProtoView) && nestedProtoView.isMergable) {
            mergeElementCount += nestedProtoView.mergeInfo.elementCount;
            mergeViewCount += nestedProtoView.mergeInfo.viewCount;
            mergeEmbeddedViewCount += nestedProtoView.mergeInfo.embeddedViewCount;
          }
          elementBinder =
              _createElementBinder(this._directiveResolver, nestedProtoView, elementBinderStack, boundElementIndex, distanceToParentElementBinder, distanceToParentProtoElementInjector, beginElement);
          elementBinders.push(elementBinder);
          protoElementInjector = elementBinder.protoElementInjector;
          for (var i=0; i<beginElement.attrs.length; i+=2) {
            variableLocations.set(beginElement.attrs[i+1], boundElementIndex);
          }
          boundElementIndex++;          
        }
        distanceToParentElementBinder = isPresent(elementBinder) ? 0 : distanceToParentElementBinder+1;
        distanceToParentProtoElementInjector = isPresent(protoElementInjector) ? 0 : distanceToParentProtoElementInjector+1;
        elementBinderStack.push(elementBinder);
      } else if (isEndElement(type)) {          
        var parentElementBinder = elementBinderStack.pop();
        var parentProtoElementInjector = isPresent(parentElementBinder) ? parentElementBinder.protoElementInjector : null;
        distanceToParentElementBinder = isPresent(parentElementBinder) ? parentElementBinder.distanceToParent : distanceToParentElementBinder-1;
        distanceToParentProtoElementInjector = isPresent(parentProtoElementInjector) ? parentProtoElementInjector.distanceToParent : distanceToParentProtoElementInjector-1;
      } else if (isText(type)) {
        var textCmd = <TextCmd> cmd;
        if (textCmd.isBound) {
          boundTextCount++;          
        }
      }
    }    
    var mergeInfo = new AppProtoViewMergeInfo(mergeEmbeddedViewCount, mergeElementCount, mergeViewCount);
    protoView.init(render, elementBinders, boundTextCount, mergeInfo, variableLocations);
  }
  
  private _bindPipe(typeOrBinding): PipeBinding {
    let meta = this._pipeResolver.resolve(typeOrBinding);
    return PipeBinding.createFromType(typeOrBinding, meta);
  }  

  private _flattenPipes(view: ViewMetadata): any[] {
    if (isBlank(view.pipes)) return this._defaultPipes;
    var pipes = ListWrapper.clone(this._defaultPipes);
    _flattenList(view.pipes, pipes);
    return pipes;
  }
}


function _createElementBinder(directiveResolver: DirectiveResolver, nestedProtoView: AppProtoView, elementBinderStack:ElementBinder[], boundElementIndex: number, distanceToParentBinder: number, distanceToParentPei: number,
                              beginElementCmd:CommonBeginElementCmd):ElementBinder {
      
  var parentElementBinder = null;
  var parentProtoElementInjector = null;
  if (distanceToParentBinder > 0) {
    parentElementBinder = elementBinderStack[elementBinderStack.length - distanceToParentBinder];
  } else {
    distanceToParentBinder = -1;
  }
  if (distanceToParentPei > 0) {
    var peiBinder = elementBinderStack[elementBinderStack.length - distanceToParentPei];
    if (isPresent(peiBinder)) {
      parentProtoElementInjector = peiBinder.protoElementInjector;      
    } else {
      distanceToParentPei = -1;
    }
  } else {
    distanceToParentPei = -1;
  }
  var componentDirectiveBinding:DirectiveBinding = null;
  var templateDirectiveBinding:DirectiveBinding = null;
  var directiveBindings:DirectiveBinding[] = beginElementCmd.directives.map( typeOrBinding => bindDirective(directiveResolver, typeOrBinding) );
  if (beginElementCmd.type === RenderTemplateCmdType.BEGIN_COMPONENT) {
    var bc = <BeginComponentCmd> beginElementCmd;
    componentDirectiveBinding = directiveBindings[0];
  } else if (beginElementCmd.type === RenderTemplateCmdType.EMBEDDED_TEMPLATE) {
    var et = <EmbeddedTemplateCmd> beginElementCmd;
    templateDirectiveBinding = directiveBindings[0];
  }
  
  var protoElementInjector = null;
  // Create a protoElementInjector for any element that either has bindings *or* has one
  // or more var- defined *or* for <template> elements:
  // - Elements with a var- defined need a their own element injector
  //   so that, when hydrating, $implicit can be set to the element.
  // - <template> elements need their own ElementInjector so that we can query their TemplateRef
  var hasVariables = beginElementCmd.variables.length > 0;
  if (directiveBindings.length > 0 || hasVariables ||
      isPresent(templateDirectiveBinding)) {
    var directiveVariableBindings =
        createDirectiveVariableBindings(beginElementCmd.variables, directiveBindings);
    protoElementInjector =
        ProtoElementInjector.create(parentProtoElementInjector, boundElementIndex,
                                    directiveBindings, isPresent(componentDirectiveBinding),
                                    distanceToParentPei, directiveVariableBindings);
    protoElementInjector.attributes = arrayToMap(beginElementCmd.attrs);
  }    
        
  var elb = new ElementBinder(boundElementIndex, parentElementBinder, distanceToParentBinder,
                                     protoElementInjector, componentDirectiveBinding);
  // TODO: Move this into the ElementBinder constructor!
  elb.nestedProtoView = nestedProtoView;
  return elb;
}

function bindDirective(directiveResolver:DirectiveResolver, directiveTypeOrBinding:Type | Binding): DirectiveBinding {
  if (directiveTypeOrBinding instanceof Binding) {
    let annotation = directiveResolver.resolve(directiveTypeOrBinding.token);
    return DirectiveBinding.createFromBinding(directiveTypeOrBinding, annotation);
  } else {
    let annotation = directiveResolver.resolve(<Type>directiveTypeOrBinding);
    return DirectiveBinding.createFromType(<Type>directiveTypeOrBinding, annotation);
  }
}

export function createDirectiveVariableBindings(variableBindings: string[],
                                                directiveBindings: List<DirectiveBinding>):
    Map<string, number> {
  var directiveVariableBindings = new Map();
  for (var i=0; i<variableBindings.length; i++) {
    var exportAs = variableBindings[i];
    var templateName = variableBindings[i+1];
    var dirIndex = _findDirectiveIndexByExportAs(directiveBindings, exportAs);
    directiveVariableBindings.set(templateName, dirIndex);
  }
  return directiveVariableBindings;
}

function _findDirectiveIndexByExportAs(directiveBindings, exportAs) {
  var matchedDirectiveIndex = null;
  var matchedDirective;

  for (var i = 0; i < directiveBindings.length; ++i) {
    var directive = directiveBindings[i];

    if (_directiveExportAs(directive) == exportAs) {
      if (isPresent(matchedDirective)) {
        throw new BaseException(
            `More than one directive have exportAs = '${exportAs}'. Directives: [${matchedDirective.displayName}, ${directive.displayName}]`);
      }

      matchedDirectiveIndex = i;
      matchedDirective = directive;
    }
  }

  if (isBlank(matchedDirective) && exportAs !== "$implicit") {
    throw new BaseException(`Cannot find directive with exportAs = '${exportAs}'`);
  }

  return matchedDirectiveIndex;
}

function _directiveExportAs(directive): string {
  var directiveExportAs = directive.metadata.exportAs;
  if (isBlank(directiveExportAs) &&
      directive.metadata.type === RenderDirectiveMetadata.COMPONENT_TYPE) {
    return "$implicit";
  } else {
    return directiveExportAs;
  }
}


function arrayToMap(arr: string[]):Map<string, string> {
  var result = new Map();
  for (var i=0; i<arr.length; i+=2) {
    result.set(arr[i], arr[i+1]);
  }
  return result;
}

function _flattenList(tree: List<any>, out: List<Type | Binding | List<any>>): void {
  for (var i = 0; i < tree.length; i++) {
    var item = resolveForwardRef(tree[i]);
    if (isArray(item)) {
      _flattenList(item, out);
    } else {
      out.push(item);
    }
  }
}
