library angular2.src.compiler.runtime_compiler;

import "package:angular2/src/core/linker/compiler.dart"
    show Compiler, Compiler_, internalCreateProtoView;
import "package:angular2/src/core/linker/view_ref.dart" show ProtoViewRef;
import "package:angular2/src/core/linker/proto_view_factory.dart"
    show ProtoViewFactory;
import "template_compiler.dart" show TemplateCompiler;
import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/facade/lang.dart" show Type;
import "package:angular2/src/facade/async.dart" show Future, PromiseWrapper;

abstract class RuntimeCompiler extends Compiler {}

@Injectable()
class RuntimeCompiler_ extends Compiler_ implements RuntimeCompiler {
  TemplateCompiler _templateCompiler;
  RuntimeCompiler_(ProtoViewFactory _protoViewFactory, this._templateCompiler)
      : super(_protoViewFactory) {
    /* super call moved to initializer */;
  }
  Future<ProtoViewRef> compileInHost(Type componentType) {
    return this
        ._templateCompiler
        .compileHostComponentRuntime(componentType)
        .then((compiledHostTemplate) =>
            internalCreateProtoView(this, compiledHostTemplate));
  }

  clearCache() {
    super.clearCache();
    this._templateCompiler.clearCache();
  }
}
