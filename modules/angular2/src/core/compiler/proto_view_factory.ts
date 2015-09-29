import {ListWrapper, MapWrapper} from 'angular2/src/core/facade/collection';
import {isPresent, isBlank, Type, isArray, isNumber} from 'angular2/src/core/facade/lang';
import {reflector} from 'angular2/src/core/reflection/reflection';

import {
  ChangeDetection,
  DirectiveIndex,
  BindingRecord,
  DirectiveRecord,
  ProtoChangeDetector,
  ChangeDetectionStrategy,
  ChangeDetectorDefinition,
  ChangeDetectorGenConfig,
  ASTWithSource
} from 'angular2/src/core/change_detection/change_detection';

import {
  RenderDirectiveMetadata,
  RenderElementBinder,
  PropertyBindingType,
  DirectiveBinder,
  ProtoViewDto,
  ViewType,
  RenderProtoViewRef
} from 'angular2/src/core/render/api';

import {Injectable, Binding, resolveForwardRef, Inject} from 'angular2/src/core/di';

import {PipeBinding} from '../pipes/pipe_binding';
import {ProtoPipes} from '../pipes/pipes';

import {AppProtoView, AppProtoViewMergeInfo} from './view';
import {ElementBinder} from './element_binder';
import {ProtoElementInjector, DirectiveBinding} from './element_injector';
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
import {APP_ID} from 'angular2/src/core/render/dom/dom_tokens';


@Injectable()
export class ProtoViewFactory {
  private _cache: Map<number, AppProtoView> = new Map();
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
      result =
          new AppProtoView(templateData.commands, ViewType.HOST, true,
                           templateData.changeDetectorFactory, null, new ProtoPipes(new Map()));
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
                                               compiledTemplateData.styles);
      var boundPipes = this._flattenPipes(view).map(pipe => this._bindPipe(pipe));

      nestedProtoView = new AppProtoView(compiledTemplateData.commands, ViewType.COMPONENT, true,
                                         compiledTemplateData.changeDetectorFactory, null,
                                         ProtoPipes.fromBindings(boundPipes));
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


function createComponent(protoViewFactory: ProtoViewFactory, cmd: BeginComponentCmd): AppProtoView {
  return (<any>protoViewFactory)._createComponent(cmd);
}

function createEmbeddedTemplate(protoViewFactory: ProtoViewFactory, cmd: EmbeddedTemplateCmd,
                                parent: AppProtoView): AppProtoView {
  return (<any>protoViewFactory)._createEmbeddedTemplate(cmd, parent);
}

class _ProtoViewInitializer implements CommandVisitor {
  variableLocations: Map<string, number> = new Map();
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
  var componentDirectiveBinding: DirectiveBinding = null;
  var isEmbeddedTemplate = false;
  var directiveBindings: DirectiveBinding[] =
      beginElementCmd.directives.map(type => bindDirective(directiveResolver, type));
  if (beginElementCmd instanceof BeginComponentCmd) {
    componentDirectiveBinding = directiveBindings[0];
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
  if (directiveBindings.length > 0 || hasVariables || isEmbeddedTemplate) {
    var directiveVariableBindings = new Map();
    if (!isEmbeddedTemplate) {
      directiveVariableBindings =
          createDirectiveVariableBindings(beginElementCmd.variableNameAndValues, directiveBindings);
    }
    protoElementInjector = ProtoElementInjector.create(
        parentProtoElementInjector, boundElementIndex, directiveBindings,
        isPresent(componentDirectiveBinding), distanceToParentPei, directiveVariableBindings);
    protoElementInjector.attributes = arrayToMap(beginElementCmd.attrNameAndValues, false);
  }

  return new ElementBinder(boundElementIndex, parentElementBinder, distanceToParentBinder,
                           protoElementInjector, componentDirectiveBinding, nestedProtoView);
}

function bindDirective(directiveResolver: DirectiveResolver, type: Type): DirectiveBinding {
  let annotation = directiveResolver.resolve(type);
  return DirectiveBinding.createFromType(type, annotation);
}

export function createDirectiveVariableBindings(variableNameAndValues: Array<string | number>,
                                                directiveBindings: DirectiveBinding[]):
    Map<string, number> {
  var directiveVariableBindings = new Map();
  for (var i = 0; i < variableNameAndValues.length; i += 2) {
    var templateName = variableNameAndValues[i];
    var dirIndex = variableNameAndValues[i + 1];
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
  var result = new Map();
  for (var i = 0; i < arr.length; i += 2) {
    if (inverse) {
      result.set(arr[i + 1], arr[i]);
    } else {
      result.set(arr[i], arr[i + 1]);
    }
  }
  return result;
}

function _flattenList(tree: any[], out: Array<Type | Binding | any[]>): void {
  for (var i = 0; i < tree.length; i++) {
    var item = resolveForwardRef(tree[i]);
    if (isArray(item)) {
      _flattenList(item, out);
    } else {
      out.push(item);
    }
  }
}


export class BindingRecordsCreator {
  _directiveRecordsMap: Map<number, DirectiveRecord> = new Map();

  getEventBindingRecords(elementBinders: RenderElementBinder[],
                         allDirectiveMetadatas: RenderDirectiveMetadata[]): BindingRecord[] {
    var res = [];
    for (var boundElementIndex = 0; boundElementIndex < elementBinders.length;
         boundElementIndex++) {
      var renderElementBinder = elementBinders[boundElementIndex];

      this._createTemplateEventRecords(res, renderElementBinder, boundElementIndex);
      this._createHostEventRecords(res, renderElementBinder, allDirectiveMetadatas,
                                   boundElementIndex);
    }
    return res;
  }

  private _createTemplateEventRecords(res: BindingRecord[],
                                      renderElementBinder: RenderElementBinder,
                                      boundElementIndex: number): void {
    renderElementBinder.eventBindings.forEach(eb => {
      res.push(BindingRecord.createForEvent(eb.source, eb.fullName, boundElementIndex));
    });
  }

  private _createHostEventRecords(res: BindingRecord[], renderElementBinder: RenderElementBinder,
                                  allDirectiveMetadatas: RenderDirectiveMetadata[],
                                  boundElementIndex: number): void {
    for (var i = 0; i < renderElementBinder.directives.length; ++i) {
      var dir = renderElementBinder.directives[i];
      var directiveMetadata = allDirectiveMetadatas[dir.directiveIndex];
      var dirRecord = this._getDirectiveRecord(boundElementIndex, i, directiveMetadata);
      dir.eventBindings.forEach(heb => {
        res.push(BindingRecord.createForHostEvent(heb.source, heb.fullName, dirRecord));
      });
    }
  }

  getPropertyBindingRecords(textBindings: ASTWithSource[], elementBinders: RenderElementBinder[],
                            allDirectiveMetadatas: RenderDirectiveMetadata[]): BindingRecord[] {
    var bindings = [];

    this._createTextNodeRecords(bindings, textBindings);
    for (var boundElementIndex = 0; boundElementIndex < elementBinders.length;
         boundElementIndex++) {
      var renderElementBinder = elementBinders[boundElementIndex];
      this._createElementPropertyRecords(bindings, boundElementIndex, renderElementBinder);
      this._createDirectiveRecords(bindings, boundElementIndex, renderElementBinder.directives,
                                   allDirectiveMetadatas);
    }

    return bindings;
  }

  getDirectiveRecords(elementBinders: RenderElementBinder[],
                      allDirectiveMetadatas: RenderDirectiveMetadata[]): DirectiveRecord[] {
    var directiveRecords = [];

    for (var elementIndex = 0; elementIndex < elementBinders.length; ++elementIndex) {
      var dirs = elementBinders[elementIndex].directives;
      for (var dirIndex = 0; dirIndex < dirs.length; ++dirIndex) {
        directiveRecords.push(this._getDirectiveRecord(
            elementIndex, dirIndex, allDirectiveMetadatas[dirs[dirIndex].directiveIndex]));
      }
    }

    return directiveRecords;
  }

  _createTextNodeRecords(bindings: BindingRecord[], textBindings: ASTWithSource[]) {
    for (var i = 0; i < textBindings.length; i++) {
      bindings.push(BindingRecord.createForTextNode(textBindings[i], i));
    }
  }

  _createElementPropertyRecords(bindings: BindingRecord[], boundElementIndex: number,
                                renderElementBinder: RenderElementBinder) {
    ListWrapper.forEach(renderElementBinder.propertyBindings, (binding) => {
      if (binding.type === PropertyBindingType.PROPERTY) {
        bindings.push(BindingRecord.createForElementProperty(binding.astWithSource,
                                                             boundElementIndex, binding.property));
      } else if (binding.type === PropertyBindingType.ATTRIBUTE) {
        bindings.push(BindingRecord.createForElementAttribute(binding.astWithSource,
                                                              boundElementIndex, binding.property));
      } else if (binding.type === PropertyBindingType.CLASS) {
        bindings.push(BindingRecord.createForElementClass(binding.astWithSource, boundElementIndex,
                                                          binding.property));
      } else if (binding.type === PropertyBindingType.STYLE) {
        bindings.push(BindingRecord.createForElementStyle(binding.astWithSource, boundElementIndex,
                                                          binding.property, binding.unit));
      }
    });
  }

  _createDirectiveRecords(bindings: BindingRecord[], boundElementIndex: number,
                          directiveBinders: DirectiveBinder[],
                          allDirectiveMetadatas: RenderDirectiveMetadata[]) {
    for (var i = 0; i < directiveBinders.length; i++) {
      var directiveBinder = directiveBinders[i];
      var directiveMetadata = allDirectiveMetadatas[directiveBinder.directiveIndex];
      var directiveRecord = this._getDirectiveRecord(boundElementIndex, i, directiveMetadata);

      // directive properties
      MapWrapper.forEach(directiveBinder.propertyBindings, (astWithSource, propertyName) => {
        // TODO: these setters should eventually be created by change detection, to make
        // it monomorphic!
        var setter = reflector.setter(propertyName);
        bindings.push(
            BindingRecord.createForDirective(astWithSource, propertyName, setter, directiveRecord));
      });

      if (directiveRecord.callOnChanges) {
        bindings.push(BindingRecord.createDirectiveOnChanges(directiveRecord));
      }
      if (directiveRecord.callOnInit) {
        bindings.push(BindingRecord.createDirectiveOnInit(directiveRecord));
      }
      if (directiveRecord.callDoCheck) {
        bindings.push(BindingRecord.createDirectiveDoCheck(directiveRecord));
      }
    }

    for (var i = 0; i < directiveBinders.length; i++) {
      var directiveBinder = directiveBinders[i];
      // host properties
      ListWrapper.forEach(directiveBinder.hostPropertyBindings, (binding) => {
        var dirIndex = new DirectiveIndex(boundElementIndex, i);
        if (binding.type === PropertyBindingType.PROPERTY) {
          bindings.push(BindingRecord.createForHostProperty(dirIndex, binding.astWithSource,
                                                            binding.property));
        } else if (binding.type === PropertyBindingType.ATTRIBUTE) {
          bindings.push(BindingRecord.createForHostAttribute(dirIndex, binding.astWithSource,
                                                             binding.property));
        } else if (binding.type === PropertyBindingType.CLASS) {
          bindings.push(
              BindingRecord.createForHostClass(dirIndex, binding.astWithSource, binding.property));
        } else if (binding.type === PropertyBindingType.STYLE) {
          bindings.push(BindingRecord.createForHostStyle(dirIndex, binding.astWithSource,
                                                         binding.property, binding.unit));
        }
      });
    }
  }

  _getDirectiveRecord(boundElementIndex: number, directiveIndex: number,
                      directiveMetadata: RenderDirectiveMetadata): DirectiveRecord {
    var id = boundElementIndex * 100 + directiveIndex;

    if (!this._directiveRecordsMap.has(id)) {
      this._directiveRecordsMap.set(
          id, new DirectiveRecord({
            directiveIndex: new DirectiveIndex(boundElementIndex, directiveIndex),
            callAfterContentInit: directiveMetadata.callAfterContentInit,
            callAfterContentChecked: directiveMetadata.callAfterContentChecked,
            callAfterViewInit: directiveMetadata.callAfterViewInit,
            callAfterViewChecked: directiveMetadata.callAfterViewChecked,
            callOnChanges: directiveMetadata.callOnChanges,
            callDoCheck: directiveMetadata.callDoCheck,
            callOnInit: directiveMetadata.callOnInit,
            changeDetection: directiveMetadata.changeDetection
          }));
    }

    return this._directiveRecordsMap.get(id);
  }
}

/**
 * Returns the data needed to create ChangeDetectors
 * for the given ProtoView and all nested ProtoViews.
 */
export function getChangeDetectorDefinitions(
    hostComponentMetadata: RenderDirectiveMetadata, rootRenderProtoView: ProtoViewDto,
    allRenderDirectiveMetadata: RenderDirectiveMetadata[], genConfig: ChangeDetectorGenConfig):
    ChangeDetectorDefinition[] {
  var nestedPvsWithIndex = _collectNestedProtoViews(rootRenderProtoView);
  var nestedPvVariableNames = _collectNestedProtoViewsVariableNames(nestedPvsWithIndex);
  return _getChangeDetectorDefinitions(hostComponentMetadata, nestedPvsWithIndex,
                                       nestedPvVariableNames, allRenderDirectiveMetadata,
                                       genConfig);
}

function _collectNestedProtoViews(
    renderProtoView: ProtoViewDto, parentIndex: number = null, boundElementIndex = null,
    result: RenderProtoViewWithIndex[] = null): RenderProtoViewWithIndex[] {
  if (isBlank(result)) {
    result = [];
  }
  // reserve the place in the array
  result.push(
      new RenderProtoViewWithIndex(renderProtoView, result.length, parentIndex, boundElementIndex));
  var currentIndex = result.length - 1;
  var childBoundElementIndex = 0;
  ListWrapper.forEach(renderProtoView.elementBinders, (elementBinder) => {
    if (isPresent(elementBinder.nestedProtoView)) {
      _collectNestedProtoViews(elementBinder.nestedProtoView, currentIndex, childBoundElementIndex,
                               result);
    }
    childBoundElementIndex++;
  });
  return result;
}

function _getChangeDetectorDefinitions(
    hostComponentMetadata: RenderDirectiveMetadata, nestedPvsWithIndex: RenderProtoViewWithIndex[],
    nestedPvVariableNames: string[][], allRenderDirectiveMetadata: RenderDirectiveMetadata[],
    genConfig: ChangeDetectorGenConfig): ChangeDetectorDefinition[] {
  return ListWrapper.map(nestedPvsWithIndex, (pvWithIndex) => {
    var elementBinders = pvWithIndex.renderProtoView.elementBinders;
    var bindingRecordsCreator = new BindingRecordsCreator();
    var propBindingRecords = bindingRecordsCreator.getPropertyBindingRecords(
        pvWithIndex.renderProtoView.textBindings, elementBinders, allRenderDirectiveMetadata);
    var eventBindingRecords =
        bindingRecordsCreator.getEventBindingRecords(elementBinders, allRenderDirectiveMetadata);
    var directiveRecords =
        bindingRecordsCreator.getDirectiveRecords(elementBinders, allRenderDirectiveMetadata);
    var strategyName = ChangeDetectionStrategy.Default;
    if (pvWithIndex.renderProtoView.type === ViewType.COMPONENT) {
      strategyName = hostComponentMetadata.changeDetection;
    }
    var id = _protoViewId(hostComponentMetadata, pvWithIndex);
    var variableNames = nestedPvVariableNames[pvWithIndex.index];
    return new ChangeDetectorDefinition(id, strategyName, variableNames, propBindingRecords,
                                        eventBindingRecords, directiveRecords, genConfig);
  });
}

function _protoViewId(hostComponentMetadata: RenderDirectiveMetadata,
                      pvWithIndex: RenderProtoViewWithIndex): string {
  var typeString;
  if (pvWithIndex.renderProtoView.type === ViewType.COMPONENT) {
    typeString = 'comp';
  } else if (pvWithIndex.renderProtoView.type === ViewType.HOST) {
    typeString = 'host';
  } else {
    typeString = 'embedded';
  }
  return `${hostComponentMetadata.id}_${typeString}_${pvWithIndex.index}`;
}

function _collectNestedProtoViewsVariableNames(nestedPvsWithIndex: RenderProtoViewWithIndex[]):
    string[][] {
  var nestedPvVariableNames = ListWrapper.createFixedSize(nestedPvsWithIndex.length);
  ListWrapper.forEach(nestedPvsWithIndex, (pvWithIndex) => {
    var parentVariableNames =
        isPresent(pvWithIndex.parentIndex) ? nestedPvVariableNames[pvWithIndex.parentIndex] : null;
    nestedPvVariableNames[pvWithIndex.index] =
        _createVariableNames(parentVariableNames, pvWithIndex.renderProtoView);
  });
  return nestedPvVariableNames;
}

function _createVariableNames(parentVariableNames: string[], renderProtoView): string[] {
  var res = isBlank(parentVariableNames) ? <string[]>[] : ListWrapper.clone(parentVariableNames);
  MapWrapper.forEach(renderProtoView.variableBindings,
                     (mappedName, varName) => { res.push(mappedName); });
  ListWrapper.forEach(renderProtoView.elementBinders, binder => {
    MapWrapper.forEach(binder.variableBindings,
                       (mappedName: string, varName: string) => { res.push(mappedName); });
  });
  return res;
}

class RenderProtoViewWithIndex {
  constructor(public renderProtoView: ProtoViewDto, public index: number,
              public parentIndex: number, public boundElementIndex: number) {}
}
