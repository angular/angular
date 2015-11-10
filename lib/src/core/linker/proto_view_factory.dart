library angular2.src.core.linker.proto_view_factory;

import "package:angular2/src/facade/lang.dart"
    show isPresent, isBlank, Type, isArray, isNumber;
import "package:angular2/src/core/render/api.dart"
    show RenderProtoViewRef, RenderComponentTemplate;
import "package:angular2/src/core/di.dart"
    show Optional, Injectable, Provider, resolveForwardRef, Inject;
import "../pipes/pipe_provider.dart" show PipeProvider;
import "../pipes/pipes.dart" show ProtoPipes;
import "view.dart" show AppProtoView, AppProtoViewMergeInfo, ViewType;
import "element_binder.dart" show ElementBinder;
import "element_injector.dart" show ProtoElementInjector, DirectiveProvider;
import "directive_resolver.dart" show DirectiveResolver;
import "view_resolver.dart" show ViewResolver;
import "pipe_resolver.dart" show PipeResolver;
import "../metadata/view.dart" show ViewMetadata, ViewEncapsulation;
import "package:angular2/src/core/ambient.dart" show AMBIENT_PIPES;
import "template_commands.dart"
    show
        visitAllCommands,
        CompiledComponentTemplate,
        CompiledHostTemplate,
        TemplateCmd,
        CommandVisitor,
        EmbeddedTemplateCmd,
        BeginComponentCmd,
        BeginElementCmd,
        IBeginElementCmd,
        TextCmd,
        NgContentCmd;
import "package:angular2/render.dart" show Renderer;
import "package:angular2/src/core/application_tokens.dart" show APP_ID;

@Injectable()
class ProtoViewFactory {
  Renderer _renderer;
  List<dynamic /* Type | List < dynamic > */ > _ambientPipes;
  DirectiveResolver _directiveResolver;
  ViewResolver _viewResolver;
  PipeResolver _pipeResolver;
  String _appId;
  Map<String, AppProtoView> _cache = new Map<String, AppProtoView>();
  num _nextTemplateId = 0;
  ProtoViewFactory(
      this._renderer,
      @Optional() @Inject(AMBIENT_PIPES) this._ambientPipes,
      this._directiveResolver,
      this._viewResolver,
      this._pipeResolver,
      @Inject(APP_ID) this._appId) {}
  clearCache() {
    this._cache.clear();
  }

  AppProtoView createHost(CompiledHostTemplate compiledHostTemplate) {
    var compiledTemplate = compiledHostTemplate.template;
    var result = this._cache[compiledTemplate.id];
    if (isBlank(result)) {
      Map<String, PipeProvider> emptyMap = {};
      var shortId = '''${ this . _appId}-${ this . _nextTemplateId ++}''';
      this._renderer.registerComponentTemplate(new RenderComponentTemplate(
          compiledTemplate.id,
          shortId,
          ViewEncapsulation.None,
          compiledTemplate.commands, []));
      result = new AppProtoView(
          compiledTemplate.id,
          compiledTemplate.commands,
          ViewType.HOST,
          true,
          compiledTemplate.changeDetectorFactory,
          null,
          new ProtoPipes(emptyMap));
      this._cache[compiledTemplate.id] = result;
    }
    return result;
  }

  AppProtoView _createComponent(BeginComponentCmd cmd) {
    var nestedProtoView = this._cache[cmd.templateId];
    if (isBlank(nestedProtoView)) {
      var component = cmd.directives[0];
      var view = this._viewResolver.resolve(component);
      var compiledTemplate = cmd.templateGetter();
      var styles = _flattenStyleArr(compiledTemplate.styles, []);
      var shortId = '''${ this . _appId}-${ this . _nextTemplateId ++}''';
      this._renderer.registerComponentTemplate(new RenderComponentTemplate(
          compiledTemplate.id,
          shortId,
          cmd.encapsulation,
          compiledTemplate.commands,
          styles));
      var boundPipes =
          this._flattenPipes(view).map((pipe) => this._bindPipe(pipe)).toList();
      nestedProtoView = new AppProtoView(
          compiledTemplate.id,
          compiledTemplate.commands,
          ViewType.COMPONENT,
          true,
          compiledTemplate.changeDetectorFactory,
          null,
          ProtoPipes.fromProviders(boundPipes));
      // Note: The cache is updated before recursing

      // to be able to resolve cycles
      this._cache[compiledTemplate.id] = nestedProtoView;
      this._initializeProtoView(nestedProtoView, null);
    }
    return nestedProtoView;
  }

  AppProtoView _createEmbeddedTemplate(
      EmbeddedTemplateCmd cmd, AppProtoView parent) {
    var nestedProtoView = new AppProtoView(
        parent.templateId,
        cmd.children,
        ViewType.EMBEDDED,
        cmd.isMerged,
        cmd.changeDetectorFactory,
        arrayToMap(cmd.variableNameAndValues, true),
        new ProtoPipes(parent.pipes.config));
    if (cmd.isMerged) {
      this.initializeProtoViewIfNeeded(nestedProtoView);
    }
    return nestedProtoView;
  }

  initializeProtoViewIfNeeded(AppProtoView protoView) {
    if (!protoView.isInitialized()) {
      var render = this
          ._renderer
          .createProtoView(protoView.templateId, protoView.templateCmds);
      this._initializeProtoView(protoView, render);
    }
  }

  _initializeProtoView(AppProtoView protoView, RenderProtoViewRef render) {
    var initializer =
        new _ProtoViewInitializer(protoView, this._directiveResolver, this);
    visitAllCommands(initializer, protoView.templateCmds);
    var mergeInfo = new AppProtoViewMergeInfo(
        initializer.mergeEmbeddedViewCount,
        initializer.mergeElementCount,
        initializer.mergeViewCount);
    protoView.init(render, initializer.elementBinders,
        initializer.boundTextCount, mergeInfo, initializer.variableLocations);
  }

  PipeProvider _bindPipe(typeOrProvider) {
    var meta = this._pipeResolver.resolve(typeOrProvider);
    return PipeProvider.createFromType(typeOrProvider, meta);
  }

  List<dynamic> _flattenPipes(ViewMetadata view) {
    var pipes = [];
    if (isPresent(this._ambientPipes)) {
      _flattenArray(this._ambientPipes, pipes);
    }
    if (isPresent(view.pipes)) {
      _flattenArray(view.pipes, pipes);
    }
    return pipes;
  }
}

AppProtoView createComponent(
    ProtoViewFactory protoViewFactory, BeginComponentCmd cmd) {
  return ((protoViewFactory as dynamic))._createComponent(cmd);
}

AppProtoView createEmbeddedTemplate(ProtoViewFactory protoViewFactory,
    EmbeddedTemplateCmd cmd, AppProtoView parent) {
  return ((protoViewFactory as dynamic))._createEmbeddedTemplate(cmd, parent);
}

class _ProtoViewInitializer implements CommandVisitor {
  AppProtoView _protoView;
  DirectiveResolver _directiveResolver;
  ProtoViewFactory _protoViewFactory;
  Map<String, num> variableLocations = new Map<String, num>();
  num boundTextCount = 0;
  num boundElementIndex = 0;
  List<ElementBinder> elementBinderStack = [];
  num distanceToParentElementBinder = 0;
  num distanceToParentProtoElementInjector = 0;
  List<ElementBinder> elementBinders = [];
  num mergeEmbeddedViewCount = 0;
  num mergeElementCount = 0;
  num mergeViewCount = 1;
  _ProtoViewInitializer(
      this._protoView, this._directiveResolver, this._protoViewFactory) {}
  dynamic visitText(TextCmd cmd, dynamic context) {
    if (cmd.isBound) {
      this.boundTextCount++;
    }
    return null;
  }

  dynamic visitNgContent(NgContentCmd cmd, dynamic context) {
    return null;
  }

  dynamic visitBeginElement(BeginElementCmd cmd, dynamic context) {
    if (cmd.isBound) {
      this._visitBeginBoundElement(cmd, null);
    } else {
      this._visitBeginElement(cmd, null, null);
    }
    return null;
  }

  dynamic visitEndElement(dynamic context) {
    return this._visitEndElement();
  }

  dynamic visitBeginComponent(BeginComponentCmd cmd, dynamic context) {
    var nestedProtoView = createComponent(this._protoViewFactory, cmd);
    return this._visitBeginBoundElement(cmd, nestedProtoView);
  }

  dynamic visitEndComponent(dynamic context) {
    return this._visitEndElement();
  }

  dynamic visitEmbeddedTemplate(EmbeddedTemplateCmd cmd, dynamic context) {
    var nestedProtoView =
        createEmbeddedTemplate(this._protoViewFactory, cmd, this._protoView);
    if (cmd.isMerged) {
      this.mergeEmbeddedViewCount++;
    }
    this._visitBeginBoundElement(cmd, nestedProtoView);
    return this._visitEndElement();
  }

  dynamic _visitBeginBoundElement(
      IBeginElementCmd cmd, AppProtoView nestedProtoView) {
    if (isPresent(nestedProtoView) && nestedProtoView.isMergable) {
      this.mergeElementCount += nestedProtoView.mergeInfo.elementCount;
      this.mergeViewCount += nestedProtoView.mergeInfo.viewCount;
      this.mergeEmbeddedViewCount +=
          nestedProtoView.mergeInfo.embeddedViewCount;
    }
    var elementBinder = _createElementBinder(
        this._directiveResolver,
        nestedProtoView,
        this.elementBinderStack,
        this.boundElementIndex,
        this.distanceToParentElementBinder,
        this.distanceToParentProtoElementInjector,
        cmd);
    this.elementBinders.add(elementBinder);
    var protoElementInjector = elementBinder.protoElementInjector;
    for (var i = 0; i < cmd.variableNameAndValues.length; i += 2) {
      this.variableLocations[(cmd.variableNameAndValues[i] as String)] =
          this.boundElementIndex;
    }
    this.boundElementIndex++;
    this.mergeElementCount++;
    return this._visitBeginElement(cmd, elementBinder, protoElementInjector);
  }

  dynamic _visitBeginElement(IBeginElementCmd cmd, ElementBinder elementBinder,
      ProtoElementInjector protoElementInjector) {
    this.distanceToParentElementBinder =
        isPresent(elementBinder) ? 1 : this.distanceToParentElementBinder + 1;
    this.distanceToParentProtoElementInjector = isPresent(protoElementInjector)
        ? 1
        : this.distanceToParentProtoElementInjector + 1;
    this.elementBinderStack.add(elementBinder);
    return null;
  }

  dynamic _visitEndElement() {
    var parentElementBinder = this.elementBinderStack.removeLast();
    var parentProtoElementInjector = isPresent(parentElementBinder)
        ? parentElementBinder.protoElementInjector
        : null;
    this.distanceToParentElementBinder = isPresent(parentElementBinder)
        ? parentElementBinder.distanceToParent
        : this.distanceToParentElementBinder - 1;
    this.distanceToParentProtoElementInjector =
        isPresent(parentProtoElementInjector)
            ? parentProtoElementInjector.distanceToParent
            : this.distanceToParentProtoElementInjector - 1;
    return null;
  }
}

ElementBinder _createElementBinder(
    DirectiveResolver directiveResolver,
    AppProtoView nestedProtoView,
    List<ElementBinder> elementBinderStack,
    num boundElementIndex,
    num distanceToParentBinder,
    num distanceToParentPei,
    IBeginElementCmd beginElementCmd) {
  ElementBinder parentElementBinder = null;
  ProtoElementInjector parentProtoElementInjector = null;
  if (distanceToParentBinder > 0) {
    parentElementBinder =
        elementBinderStack[elementBinderStack.length - distanceToParentBinder];
  }
  if (isBlank(parentElementBinder)) {
    distanceToParentBinder = -1;
  }
  if (distanceToParentPei > 0) {
    var peiBinder =
        elementBinderStack[elementBinderStack.length - distanceToParentPei];
    if (isPresent(peiBinder)) {
      parentProtoElementInjector = peiBinder.protoElementInjector;
    }
  }
  if (isBlank(parentProtoElementInjector)) {
    distanceToParentPei = -1;
  }
  DirectiveProvider componentDirectiveProvider = null;
  var isEmbeddedTemplate = false;
  List<DirectiveProvider> directiveProviders = beginElementCmd.directives
      .map((type) => provideDirective(directiveResolver, type))
      .toList();
  if (beginElementCmd is BeginComponentCmd) {
    componentDirectiveProvider = directiveProviders[0];
  } else if (beginElementCmd is EmbeddedTemplateCmd) {
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
    var directiveVariableBindings = new Map<String, num>();
    if (!isEmbeddedTemplate) {
      directiveVariableBindings = createDirectiveVariableBindings(
          beginElementCmd.variableNameAndValues, directiveProviders);
    }
    protoElementInjector = ProtoElementInjector.create(
        parentProtoElementInjector,
        boundElementIndex,
        directiveProviders,
        isPresent(componentDirectiveProvider),
        distanceToParentPei,
        directiveVariableBindings);
    protoElementInjector.attributes =
        arrayToMap(beginElementCmd.attrNameAndValues, false);
  }
  return new ElementBinder(
      boundElementIndex,
      parentElementBinder,
      distanceToParentBinder,
      protoElementInjector,
      componentDirectiveProvider,
      nestedProtoView);
}

DirectiveProvider provideDirective(
    DirectiveResolver directiveResolver, Type type) {
  var annotation = directiveResolver.resolve(type);
  return DirectiveProvider.createFromType(type, annotation);
}

Map<String, num> createDirectiveVariableBindings(
    List<dynamic /* String | num */ > variableNameAndValues,
    List<DirectiveProvider> directiveProviders) {
  var directiveVariableBindings = new Map<String, num>();
  for (var i = 0; i < variableNameAndValues.length; i += 2) {
    var templateName = (variableNameAndValues[i] as String);
    var dirIndex = (variableNameAndValues[i + 1] as num);
    if (isNumber(dirIndex)) {
      directiveVariableBindings[templateName] = dirIndex;
    } else {
      // a variable without a directive index -> reference the element
      directiveVariableBindings[templateName] = null;
    }
  }
  return directiveVariableBindings;
}

Map<String, String> arrayToMap(List<String> arr, bool inverse) {
  var result = new Map<String, String>();
  for (var i = 0; i < arr.length; i += 2) {
    if (inverse) {
      result[arr[i + 1]] = arr[i];
    } else {
      result[arr[i]] = arr[i + 1];
    }
  }
  return result;
}

void _flattenArray(List<dynamic> tree,
    List<dynamic /* Type | Provider | List < dynamic > */ > out) {
  for (var i = 0; i < tree.length; i++) {
    var item = resolveForwardRef(tree[i]);
    if (isArray(item)) {
      _flattenArray(item, out);
    } else {
      out.add(item);
    }
  }
}

List<String> _flattenStyleArr(
    List<dynamic /* String | List < dynamic > */ > arr, List<String> out) {
  for (var i = 0; i < arr.length; i++) {
    var entry = arr[i];
    if (isArray(entry)) {
      _flattenStyleArr((entry as List<dynamic>), out);
    } else {
      out.add((entry as String));
    }
  }
  return out;
}
