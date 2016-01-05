library angular2.src.core.linker.resolved_metadata_cache;

import "../di.dart" show Injectable;
import "package:angular2/src/facade/lang.dart" show Type, isBlank;
import "element.dart" show DirectiveProvider;
import "directive_resolver.dart"
    show DirectiveResolver, CODEGEN_DIRECTIVE_RESOLVER;
import "../pipes/pipe_provider.dart" show PipeProvider;
import "pipe_resolver.dart" show PipeResolver, CODEGEN_PIPE_RESOLVER;

@Injectable()
class ResolvedMetadataCache {
  DirectiveResolver _directiveResolver;
  PipeResolver _pipeResolver;
  Map<Type, DirectiveProvider> _directiveCache =
      new Map<Type, DirectiveProvider>();
  Map<Type, PipeProvider> _pipeCache = new Map<Type, PipeProvider>();
  ResolvedMetadataCache(this._directiveResolver, this._pipeResolver) {}
  DirectiveProvider getResolvedDirectiveMetadata(Type type) {
    var result = this._directiveCache[type];
    if (isBlank(result)) {
      result = DirectiveProvider.createFromType(
          type, this._directiveResolver.resolve(type));
      this._directiveCache[type] = result;
    }
    return result;
  }

  PipeProvider getResolvedPipeMetadata(Type type) {
    var result = this._pipeCache[type];
    if (isBlank(result)) {
      result =
          PipeProvider.createFromType(type, this._pipeResolver.resolve(type));
      this._pipeCache[type] = result;
    }
    return result;
  }
}

var CODEGEN_RESOLVED_METADATA_CACHE = new ResolvedMetadataCache(
    CODEGEN_DIRECTIVE_RESOLVER, CODEGEN_PIPE_RESOLVER);
