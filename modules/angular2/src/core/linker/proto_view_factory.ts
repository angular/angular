import {ListWrapper} from 'angular2/src/core/facade/collection';
import {isPresent, isBlank, Type, isArray, isNumber} from 'angular2/src/core/facade/lang';

import {RenderProtoViewRef} from 'angular2/src/core/render/api';

import {Injectable, Provider, resolveForwardRef, Inject} from 'angular2/src/core/di';

import {PipeProvider} from '../pipes/pipe_provider';
import {ProtoPipes} from '../pipes/pipes';

import {AppProtoView, AppProtoViewMergeInfo, ViewType} from './view';
import {ElementBinder} from './element_binder';
import {ProtoElementInjector, DirectiveProvider} from './element_injector';
import {DirectiveResolver} from './directive_resolver';
import {ViewResolver} from './view_resolver';
import {PipeResolver} from './pipe_resolver';
import {ViewMetadata} from '../metadata/view';
import {DEFAULT_PIPES_TOKEN} from 'angular2/src/core/pipes';

import {
  visitAllCommands,
  CompiledTemplate,
  CompiledHostTemplate,
  TemplateCmd,
  CommandVisitor,
  EmbeddedTemplateCmd,
  BeginComponentCmd,
  BeginElementCmd,
  IBeginElementCmd,
  TextCmd,
  NgContentCmd
} from './template_commands';

import {Renderer} from 'angular2/render';
import {APP_ID} from 'angular2/src/core/application_tokens';


@Injectable()
export class ProtoViewFactory {
  private _cache: Map<number, AppProtoView> = new Map<number, AppProtoView>();
  private _defaultPipes: Type[];
  private _appId: string;

  constructor(private _renderer: Renderer, @Inject(DEFAULT_PIPES_TOKEN) defaultPipes: Type[],
              private _directiveResolver: DirectiveResolver, private _viewResolver: ViewResolver,
              private _pipeResolver: PipeResolver, @Inject(APP_ID) appId: string) {
    this._defaultPipes = defaultPipes;
    this._appId = appId;
  }

  clearCache() { this._cache.clear(); }

  createHost(compiledHostTemplate: CompiledHostTemplate): AppProtoView {
    var compiledTemplate = compiledHostTemplate.getTemplate();
    var result = this._cache.get(compiledTemplate.id);
    if (isBlank(result)) {
      var templateData = compiledTemplate.getData(this._appId);
      var emptyMap: {[key: string]: PipeProvider} = {};
      result = new AppProtoView(templateData.commands, ViewType.HOST, true,
                                templateData.changeDetectorFactory, null, new ProtoPipes(emptyMap));
      this._cache.set(compiledTemplate.id, result);
    }
    return result;
  }

  private _createComponent(cmd: BeginComponentCmd): AppProtoView {
    var nestedProtoView = this._cache.get(cmd.templateId);
    if (isBlank(nestedProtoView)) {
      var component = cmd.directives[0];
      var view = this._viewResolver.resolve(component);
      var compiledTemplateData = cmd.template.getData(this._appId);

      this._renderer.registerComponentTemplate(cmd.templateId, compiledTemplateData.commands,
                                               compiledTemplateData.styles, cmd.nativeShadow);
      var boundPipes = this._flattenPipes(view).map(pipe => this._bindPipe(pipe));

      nestedProtoView = new AppProtoView(compiledTemplateData.commands, ViewType.COMPONENT, true,
                                         compiledTemplateData.changeDetectorFactory, null,
                                         ProtoPipes.fromProviders(boundPipes));
      // Note: The cache is updated before recursing
      // to be able to resolve cycles
      this._cache.set(cmd.template.id, nestedProtoView);
      this._initializeProtoView(nestedProtoView, null);
    }
    return nestedProtoView;
  }

  private _createEmbeddedTemplate(cmd: EmbeddedTemplateCmd, parent: AppProtoView): AppProtoView {
    var nestedProtoView = new AppProtoView(
        cmd.children, ViewType.EMBEDDED, cmd.isMerged, cmd.changeDetectorFactory,
        arrayToMap(cmd.variableNameAndValues, true), new ProtoPipes(parent.pipes.config));
    if (cmd.isMerged) {
      this.initializeProtoViewIfNeeded(nestedProtoView);
    }
    return nestedProtoView;
  }

  initializeProtoViewIfNeeded(protoView: AppProtoView) {
    if (!protoView.isInitialized()) {
      var render = this._renderer.createProtoView(protoView.templateCmds);
      this._initializeProtoView(protoView, render);
    }
  }

  private _initializeProtoView(protoView: AppProtoView, render: RenderProtoViewRef) {
    var initializer = new _ProtoViewInitializer(protoView, this._directiveResolver, this);
    visitAllCommands(initializer, protoView.templateCmds);
    var mergeInfo =
        new AppProtoViewMergeInfo(initializer.mergeEmbeddedViewCount, initializer.mergeElementCount,
                                  initializer.mergeViewCount);
    protoView.init(render, initializer.elementBinders, initializer.boundTextCount, mergeInfo,
                   initializer.variableLocations);
  }

  private _bindPipe(typeOrProvider): PipeProvider {
    let meta = this._pipeResolver.resolve(typeOrProvider);
    return PipeProvider.createFromType(typeOrProvider, meta);
  }

  private _flattenPipes(view: ViewMetadata): any[] {
    if (isBlank(view.pipes)) return this._defaultPipes;
    var pipes = ListWrapper.clone(this._defaultPipes);
    _flattenList(view.pipes, pipes);
    return pipes;
  }
}


function createComponent(protoViewFactory: ProtoViewFactory, cmd: BeginComponentCmd): AppProtoView {
  return (<any>protoViewFactory)._createComponent(cmd);
}

function createEmbeddedTemplate(protoViewFactory: ProtoViewFactory, cmd: EmbeddedTemplateCmd,
                                parent: AppProtoView): AppProtoView {
  return (<any>protoViewFactory)._createEmbeddedTemplate(cmd, parent);
}

class _ProtoViewInitializer implements CommandVisitor {
  variableLocations: Map<string, number> = new Map<string, number>();
  boundTextCount: number = 0;
  boundElementIndex: number = 0;
  elementBinderStack: ElementBinder[] = [];
  distanceToParentElementBinder: number = 0;
  distanceToParentProtoElementInjector: number = 0;
  elementBinders: ElementBinder[] = [];
  mergeEmbeddedViewCount: number = 0;
  mergeElementCount: number = 0;
  mergeViewCount: number = 1;

  constructor(private _protoView: AppProtoView, private _directiveResolver: DirectiveResolver,
              private _protoViewFactory: ProtoViewFactory) {}

  visitText(cmd: TextCmd, context: any): any {
    if (cmd.isBound) {
      this.boundTextCount++;
    }
    return null;
  }
  visitNgContent(cmd: NgContentCmd, context: any): any { return null; }
  visitBeginElement(cmd: BeginElementCmd, context: any): any {
    if (cmd.isBound) {
      this._visitBeginBoundElement(cmd, null);
    } else {
      this._visitBeginElement(cmd, null, null);
    }
    return null;
  }
  visitEndElement(context: any): any { return this._visitEndElement(); }
  visitBeginComponent(cmd: BeginComponentCmd, context: any): any {
    var nestedProtoView = createComponent(this._protoViewFactory, cmd);
    return this._visitBeginBoundElement(cmd, nestedProtoView);
  }
  visitEndComponent(context: any): any { return this._visitEndElement(); }
  visitEmbeddedTemplate(cmd: EmbeddedTemplateCmd, context: any): any {
    var nestedProtoView = createEmbeddedTemplate(this._protoViewFactory, cmd, this._protoView);
    if (cmd.isMerged) {
      this.mergeEmbeddedViewCount++;
    }
    this._visitBeginBoundElement(cmd, nestedProtoView);
    return this._visitEndElement();
  }

  private _visitBeginBoundElement(cmd: IBeginElementCmd, nestedProtoView: AppProtoView): any {
    if (isPresent(nestedProtoView) && nestedProtoView.isMergable) {
      this.mergeElementCount += nestedProtoView.mergeInfo.elementCount;
      this.mergeViewCount += nestedProtoView.mergeInfo.viewCount;
      this.mergeEmbeddedViewCount += nestedProtoView.mergeInfo.embeddedViewCount;
    }
    var elementBinder = _createElementBinder(
        this._directiveResolver, nestedProtoView, this.elementBinderStack, this.boundElementIndex,
        this.distanceToParentElementBinder, this.distanceToParentProtoElementInjector, cmd);
    this.elementBinders.push(elementBinder);
    var protoElementInjector = elementBinder.protoElementInjector;
    for (var i = 0; i < cmd.variableNameAndValues.length; i += 2) {
      this.variableLocations.set(<string>cmd.variableNameAndValues[i], this.boundElementIndex);
    }
    this.boundElementIndex++;
    this.mergeElementCount++;
    return this._visitBeginElement(cmd, elementBinder, protoElementInjector);
  }

  private _visitBeginElement(cmd: IBeginElementCmd, elementBinder: ElementBinder,
                             protoElementInjector: ProtoElementInjector): any {
    this.distanceToParentElementBinder =
        isPresent(elementBinder) ? 1 : this.distanceToParentElementBinder + 1;
    this.distanceToParentProtoElementInjector =
        isPresent(protoElementInjector) ? 1 : this.distanceToParentProtoElementInjector + 1;
    this.elementBinderStack.push(elementBinder);
    return null;
  }

  private _visitEndElement(): any {
    var parentElementBinder = this.elementBinderStack.pop();
    var parentProtoElementInjector =
        isPresent(parentElementBinder) ? parentElementBinder.protoElementInjector : null;
    this.distanceToParentElementBinder = isPresent(parentElementBinder) ?
                                             parentElementBinder.distanceToParent :
                                             this.distanceToParentElementBinder - 1;
    this.distanceToParentProtoElementInjector = isPresent(parentProtoElementInjector) ?
                                                    parentProtoElementInjector.distanceToParent :
                                                    this.distanceToParentProtoElementInjector - 1;
    return null;
  }
}


function _createElementBinder(directiveResolver: DirectiveResolver, nestedProtoView: AppProtoView,
                              elementBinderStack: ElementBinder[], boundElementIndex: number,
                              distanceToParentBinder: number, distanceToParentPei: number,
                              beginElementCmd: IBeginElementCmd): ElementBinder {
  var parentElementBinder: ElementBinder = null;
  var parentProtoElementInjector: ProtoElementInjector = null;
  if (distanceToParentBinder > 0) {
    parentElementBinder = elementBinderStack[elementBinderStack.length - distanceToParentBinder];
  }
  if (isBlank(parentElementBinder)) {
    distanceToParentBinder = -1;
  }
  if (distanceToParentPei > 0) {
    var peiBinder = elementBinderStack[elementBinderStack.length - distanceToParentPei];
    if (isPresent(peiBinder)) {
      parentProtoElementInjector = peiBinder.protoElementInjector;
    }
  }
  if (isBlank(parentProtoElementInjector)) {
    distanceToParentPei = -1;
  }
  var componentDirectiveProvider: DirectiveProvider = null;
  var isEmbeddedTemplate = false;
  var directiveProviders: DirectiveProvider[] =
      beginElementCmd.directives.map(type => provideDirective(directiveResolver, type));
  if (beginElementCmd instanceof BeginComponentCmd) {
    componentDirectiveProvider = directiveProviders[0];
  } else if (beginElementCmd instanceof EmbeddedTemplateCmd) {
    isEmbeddedTemplate = true;
  }

  var protoElementInjector = null;
  // Create a protoElementInjector for any element that either has bindings *or* has one
  // or more var- defined *or* for <template> elements:
  // - Elements with a var- defined need a their own element injector
  //   so that, when hydrating, $implicit can be set to the element.
  // - <template> elements need their own ElementInjector so that we can query their TemplateRef
  var hasVariables = beginElementCmd.variableNameAndValues.length > 0;
  if (directiveProviders.length > 0 || hasVariables || isEmbeddedTemplate) {
    var directiveVariableBindings = new Map<string, number>();
    if (!isEmbeddedTemplate) {
      directiveVariableBindings = createDirectiveVariableBindings(
          beginElementCmd.variableNameAndValues, directiveProviders);
    }
    protoElementInjector = ProtoElementInjector.create(
        parentProtoElementInjector, boundElementIndex, directiveProviders,
        isPresent(componentDirectiveProvider), distanceToParentPei, directiveVariableBindings);
    protoElementInjector.attributes = arrayToMap(beginElementCmd.attrNameAndValues, false);
  }

  return new ElementBinder(boundElementIndex, parentElementBinder, distanceToParentBinder,
                           protoElementInjector, componentDirectiveProvider, nestedProtoView);
}

function provideDirective(directiveResolver: DirectiveResolver, type: Type): DirectiveProvider {
  let annotation = directiveResolver.resolve(type);
  return DirectiveProvider.createFromType(type, annotation);
}

export function createDirectiveVariableBindings(variableNameAndValues: Array<string | number>,
                                                directiveProviders: DirectiveProvider[]):
    Map<string, number> {
  var directiveVariableBindings = new Map<string, number>();
  for (var i = 0; i < variableNameAndValues.length; i += 2) {
    var templateName = <string>variableNameAndValues[i];
    var dirIndex = <number>variableNameAndValues[i + 1];
    if (isNumber(dirIndex)) {
      directiveVariableBindings.set(templateName, dirIndex);
    } else {
      // a variable without a directive index -> reference the element
      directiveVariableBindings.set(templateName, null);
    }
  }
  return directiveVariableBindings;
}


function arrayToMap(arr: string[], inverse: boolean): Map<string, string> {
  var result = new Map<string, string>();
  for (var i = 0; i < arr.length; i += 2) {
    if (inverse) {
      result.set(arr[i + 1], arr[i]);
    } else {
      result.set(arr[i], arr[i + 1]);
    }
  }
  return result;
}

function _flattenList(tree: any[], out: Array<Type | Provider | any[]>): void {
  for (var i = 0; i < tree.length; i++) {
    var item = resolveForwardRef(tree[i]);
    if (isArray(item)) {
      _flattenList(item, out);
    } else {
      out.push(item);
    }
  }
}
