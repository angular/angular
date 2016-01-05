library angular2.src.core.linker.compiler;

import "package:angular2/src/core/linker/view_ref.dart" show HostViewFactoryRef;
import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/facade/lang.dart" show Type, isBlank, stringify;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/facade/async.dart" show Future, PromiseWrapper;
import "package:angular2/src/core/reflection/reflection.dart" show reflector;
import "package:angular2/src/core/linker/view.dart" show HostViewFactory;
import "package:angular2/src/core/linker/view_ref.dart"
    show HostViewFactoryRef_;

/**
 * Low-level service for compiling [Component]s into [ProtoViewRef ProtoViews]s, which
 * can later be used to create and render a Component instance.
 *
 * Most applications should instead use higher-level [DynamicComponentLoader] service, which
 * both compiles and instantiates a Component.
 */
abstract class Compiler {
  Future<HostViewFactoryRef> compileInHost(Type componentType);
  clearCache();
}

bool isHostViewFactory(dynamic type) {
  return type is HostViewFactory;
}

@Injectable()
class Compiler_ extends Compiler {
  Future<HostViewFactoryRef_> compileInHost(Type componentType) {
    var metadatas = reflector.annotations(componentType);
    var hostViewFactory =
        metadatas.firstWhere(isHostViewFactory, orElse: () => null);
    if (isBlank(hostViewFactory)) {
      throw new BaseException(
          '''No precompiled component ${ stringify ( componentType )} found''');
    }
    return PromiseWrapper.resolve(new HostViewFactoryRef_(hostViewFactory));
  }

  clearCache() {}
}
