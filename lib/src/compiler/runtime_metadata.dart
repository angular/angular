library angular2.src.compiler.runtime_metadata;

import "package:angular2/src/core/di.dart" show resolveForwardRef;
import "package:angular2/src/facade/lang.dart"
    show Type, isBlank, isPresent, isArray, stringify, RegExpWrapper;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "directive_metadata.dart" as cpl;
import "package:angular2/src/core/metadata/directives.dart" as md;
import "package:angular2/src/core/linker/directive_resolver.dart"
    show DirectiveResolver;
import "package:angular2/src/core/linker/pipe_resolver.dart" show PipeResolver;
import "package:angular2/src/core/linker/view_resolver.dart" show ViewResolver;
import "package:angular2/src/core/metadata/view.dart" show ViewMetadata;
import "package:angular2/src/core/linker/directive_lifecycle_reflector.dart"
    show hasLifecycleHook;
import "package:angular2/src/core/linker/interfaces.dart"
    show LifecycleHooks, LIFECYCLE_HOOKS_VALUES;
import "package:angular2/src/core/reflection/reflection.dart" show reflector;
import "package:angular2/src/core/di.dart" show Injectable, Inject, Optional;
import "package:angular2/src/core/platform_directives_and_pipes.dart"
    show PLATFORM_DIRECTIVES, PLATFORM_PIPES;
import "util.dart" show MODULE_SUFFIX;
import "package:angular2/src/compiler/url_resolver.dart" show getUrlScheme;

@Injectable()
class RuntimeMetadataResolver {
  DirectiveResolver _directiveResolver;
  PipeResolver _pipeResolver;
  ViewResolver _viewResolver;
  List<Type> _platformDirectives;
  List<Type> _platformPipes;
  var _directiveCache = new Map<Type, cpl.CompileDirectiveMetadata>();
  var _pipeCache = new Map<Type, cpl.CompilePipeMetadata>();
  RuntimeMetadataResolver(
      this._directiveResolver,
      this._pipeResolver,
      this._viewResolver,
      @Optional() @Inject(PLATFORM_DIRECTIVES) this._platformDirectives,
      @Optional() @Inject(PLATFORM_PIPES) this._platformPipes) {}
  cpl.CompileDirectiveMetadata getDirectiveMetadata(Type directiveType) {
    var meta = this._directiveCache[directiveType];
    if (isBlank(meta)) {
      var dirMeta = this._directiveResolver.resolve(directiveType);
      var moduleUrl = null;
      var templateMeta = null;
      var changeDetectionStrategy = null;
      if (dirMeta is md.ComponentMetadata) {
        var cmpMeta = (dirMeta as md.ComponentMetadata);
        moduleUrl = calcModuleUrl(directiveType, cmpMeta);
        var viewMeta = this._viewResolver.resolve(directiveType);
        templateMeta = new cpl.CompileTemplateMetadata(
            encapsulation: viewMeta.encapsulation,
            template: viewMeta.template,
            templateUrl: viewMeta.templateUrl,
            styles: viewMeta.styles,
            styleUrls: viewMeta.styleUrls);
        changeDetectionStrategy = cmpMeta.changeDetection;
      }
      meta = cpl.CompileDirectiveMetadata.create(
          selector: dirMeta.selector,
          exportAs: dirMeta.exportAs,
          isComponent: isPresent(templateMeta),
          dynamicLoadable: true,
          type: new cpl.CompileTypeMetadata(
              name: stringify(directiveType),
              moduleUrl: moduleUrl,
              runtime: directiveType),
          template: templateMeta,
          changeDetection: changeDetectionStrategy,
          inputs: dirMeta.inputs,
          outputs: dirMeta.outputs,
          host: dirMeta.host,
          lifecycleHooks: LIFECYCLE_HOOKS_VALUES
              .where((hook) => hasLifecycleHook(hook, directiveType))
              .toList());
      this._directiveCache[directiveType] = meta;
    }
    return meta;
  }

  cpl.CompilePipeMetadata getPipeMetadata(Type pipeType) {
    var meta = this._pipeCache[pipeType];
    if (isBlank(meta)) {
      var pipeMeta = this._pipeResolver.resolve(pipeType);
      var moduleUrl = reflector.importUri(pipeType);
      meta = new cpl.CompilePipeMetadata(
          type: new cpl.CompileTypeMetadata(
              name: stringify(pipeType),
              moduleUrl: moduleUrl,
              runtime: pipeType),
          name: pipeMeta.name,
          pure: pipeMeta.pure);
      this._pipeCache[pipeType] = meta;
    }
    return meta;
  }

  List<cpl.CompileDirectiveMetadata> getViewDirectivesMetadata(Type component) {
    var view = this._viewResolver.resolve(component);
    var directives = flattenDirectives(view, this._platformDirectives);
    for (var i = 0; i < directives.length; i++) {
      if (!isValidType(directives[i])) {
        throw new BaseException(
            '''Unexpected directive value \'${ stringify ( directives [ i ] )}\' on the View of component \'${ stringify ( component )}\'''');
      }
    }
    return directives.map((type) => this.getDirectiveMetadata(type)).toList();
  }

  List<cpl.CompilePipeMetadata> getViewPipesMetadata(Type component) {
    var view = this._viewResolver.resolve(component);
    var pipes = flattenPipes(view, this._platformPipes);
    for (var i = 0; i < pipes.length; i++) {
      if (!isValidType(pipes[i])) {
        throw new BaseException(
            '''Unexpected piped value \'${ stringify ( pipes [ i ] )}\' on the View of component \'${ stringify ( component )}\'''');
      }
    }
    return pipes.map((type) => this.getPipeMetadata(type)).toList();
  }
}

List<Type> flattenDirectives(
    ViewMetadata view, List<dynamic> platformDirectives) {
  var directives = [];
  if (isPresent(platformDirectives)) {
    flattenArray(platformDirectives, directives);
  }
  if (isPresent(view.directives)) {
    flattenArray(view.directives, directives);
  }
  return directives;
}

List<Type> flattenPipes(ViewMetadata view, List<dynamic> platformPipes) {
  var pipes = [];
  if (isPresent(platformPipes)) {
    flattenArray(platformPipes, pipes);
  }
  if (isPresent(view.pipes)) {
    flattenArray(view.pipes, pipes);
  }
  return pipes;
}

void flattenArray(
    List<dynamic> tree, List<dynamic /* Type | List < dynamic > */ > out) {
  for (var i = 0; i < tree.length; i++) {
    var item = resolveForwardRef(tree[i]);
    if (isArray(item)) {
      flattenArray(item, out);
    } else {
      out.add(item);
    }
  }
}

bool isValidType(Type value) {
  return isPresent(value) && (value is Type);
}

String calcModuleUrl(Type type, md.ComponentMetadata cmpMetadata) {
  var moduleId = cmpMetadata.moduleId;
  if (isPresent(moduleId)) {
    var scheme = getUrlScheme(moduleId);
    return isPresent(scheme) && scheme.length > 0
        ? moduleId
        : '''package:${ moduleId}${ MODULE_SUFFIX}''';
  } else {
    return reflector.importUri(type);
  }
}
