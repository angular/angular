library angular2.src.core.linker.compiler;

import "package:angular2/src/core/linker/view_ref.dart" show ProtoViewRef;
import "package:angular2/src/core/linker/proto_view_factory.dart"
    show ProtoViewFactory;
import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/facade/lang.dart" show Type, isBlank, stringify;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/facade/async.dart" show Future, PromiseWrapper;
import "package:angular2/src/core/reflection/reflection.dart" show reflector;
import "package:angular2/src/core/linker/template_commands.dart"
    show CompiledHostTemplate;

/**
 * Low-level service for compiling [Component]s into [ProtoViewRef ProtoViews]s, which
 * can later be used to create and render a Component instance.
 *
 * Most applications should instead use higher-level [DynamicComponentLoader] service, which
 * both compiles and instantiates a Component.
 */
abstract class Compiler {
  Future<ProtoViewRef> compileInHost(Type componentType);
  clearCache();
}

bool _isCompiledHostTemplate(dynamic type) {
  return type is CompiledHostTemplate;
}

@Injectable()
class Compiler_ extends Compiler {
  ProtoViewFactory _protoViewFactory;
  Compiler_(this._protoViewFactory) : super() {
    /* super call moved to initializer */;
  }
  Future<ProtoViewRef> compileInHost(Type componentType) {
    var metadatas = reflector.annotations(componentType);
    var compiledHostTemplate =
        metadatas.firstWhere(_isCompiledHostTemplate, orElse: () => null);
    if (isBlank(compiledHostTemplate)) {
      throw new BaseException(
          '''No precompiled template for component ${ stringify ( componentType )} found''');
    }
    return PromiseWrapper.resolve(this._createProtoView(compiledHostTemplate));
  }

  ProtoViewRef _createProtoView(CompiledHostTemplate compiledHostTemplate) {
    return this._protoViewFactory.createHost(compiledHostTemplate).ref;
  }

  clearCache() {
    this._protoViewFactory.clearCache();
  }
}

ProtoViewRef internalCreateProtoView(
    Compiler compiler, CompiledHostTemplate compiledHostTemplate) {
  return ((compiler as dynamic))._createProtoView(compiledHostTemplate);
}
