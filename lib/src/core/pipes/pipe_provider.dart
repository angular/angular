library angular2.src.core.pipes.pipe_provider;

import "package:angular2/src/facade/lang.dart" show Type;
import "package:angular2/src/core/di/provider.dart"
    show ResolvedFactory, resolveProvider, ResolvedProvider_;
import "package:angular2/src/core/di.dart" show Key, ResolvedProvider, Provider;
import "../metadata/directives.dart" show PipeMetadata;

class PipeProvider extends ResolvedProvider_ {
  String name;
  bool pure;
  PipeProvider(this.name, this.pure, Key key,
      List<ResolvedFactory> resolvedFactories, bool multiBinding)
      : super(key, resolvedFactories, multiBinding) {
    /* super call moved to initializer */;
  }
  static PipeProvider createFromType(Type type, PipeMetadata metadata) {
    var provider = new Provider(type, useClass: type);
    var rb = resolveProvider(provider);
    return new PipeProvider(metadata.name, metadata.pure, rb.key,
        rb.resolvedFactories, rb.multiProvider);
  }
}
