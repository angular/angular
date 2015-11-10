library angular2.src.core.pipes.pipes;

import "package:angular2/src/facade/lang.dart" show isBlank, isPresent, Type;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "package:angular2/src/facade/collection.dart" show StringMapWrapper;
import "package:angular2/src/core/di.dart"
    show
        Injectable,
        OptionalMetadata,
        SkipSelfMetadata,
        Provider,
        Injector,
        bind;
import "pipe_provider.dart" show PipeProvider;
import "package:angular2/src/core/change_detection/pipes.dart" as cd;

class ProtoPipes {
  Map<String, PipeProvider> config;
  static ProtoPipes fromProviders(List<PipeProvider> providers) {
    Map<String, PipeProvider> config = {};
    providers.forEach((b) => config[b.name] = b);
    return new ProtoPipes(config);
  }

  ProtoPipes(
      /**
      * Map of [PipeMetadata] names to [PipeMetadata] implementations.
      */
      this.config) {
    this.config = config;
  }
  PipeProvider get(String name) {
    var provider = this.config[name];
    if (isBlank(provider)) throw new BaseException(
        '''Cannot find pipe \'${ name}\'.''');
    return provider;
  }
}

class Pipes implements cd.Pipes {
  ProtoPipes proto;
  Injector injector;
  /** @internal */
  Map<String, cd.SelectedPipe> _config = {};
  Pipes(this.proto, this.injector) {}
  cd.SelectedPipe get(String name) {
    var cached = StringMapWrapper.get(this._config, name);
    if (isPresent(cached)) return cached;
    var p = this.proto.get(name);
    var transform = this.injector.instantiateResolved(p);
    var res = new cd.SelectedPipe(transform, p.pure);
    if (p.pure) {
      StringMapWrapper.set(this._config, name, res);
    }
    return res;
  }
}
