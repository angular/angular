library angular2.src.compiler.runtime_compiler;

import "package:angular2/src/core/linker/compiler.dart"
    show Compiler, Compiler_;
import "package:angular2/src/core/linker/view_ref.dart"
    show HostViewFactoryRef, HostViewFactoryRef_;
import "template_compiler.dart" show TemplateCompiler;
import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/facade/lang.dart" show Type;
import "package:angular2/src/facade/async.dart" show Future, PromiseWrapper;

abstract class RuntimeCompiler extends Compiler {
  Future<HostViewFactoryRef> compileInHost(Type componentType);
  clearCache();
}

@Injectable()
class RuntimeCompiler_ extends Compiler_ implements RuntimeCompiler {
  TemplateCompiler _templateCompiler;
  RuntimeCompiler_(this._templateCompiler) : super() {
    /* super call moved to initializer */;
  }
  Future<HostViewFactoryRef_> compileInHost(Type componentType) {
    return this
        ._templateCompiler
        .compileHostComponentRuntime(componentType)
        .then((hostViewFactory) => new HostViewFactoryRef_(hostViewFactory));
  }

  clearCache() {
    super.clearCache();
    this._templateCompiler.clearCache();
  }
}
