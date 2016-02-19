import {Injectable} from '../di';
import {Type, isBlank} from 'angular2/src/facade/lang';
import {DirectiveProvider} from './element';
import {DirectiveResolver, CODEGEN_DIRECTIVE_RESOLVER} from './directive_resolver';
import {PipeProvider} from '../pipes/pipe_provider';
import {PipeResolver, CODEGEN_PIPE_RESOLVER} from './pipe_resolver';

@Injectable()
export class ResolvedMetadataCache {
  private _directiveCache: Map<Type, DirectiveProvider> = new Map<Type, DirectiveProvider>();
  private _pipeCache: Map<Type, PipeProvider> = new Map<Type, PipeProvider>();

  constructor(private _directiveResolver: DirectiveResolver, private _pipeResolver: PipeResolver) {}

  getResolvedDirectiveMetadata(type: Type): DirectiveProvider {
    var result = this._directiveCache.get(type);
    if (isBlank(result)) {
      result = DirectiveProvider.createFromType(type, this._directiveResolver.resolve(type));
      this._directiveCache.set(type, result);
    }
    return result;
  }

  getResolvedPipeMetadata(type: Type): PipeProvider {
    var result = this._pipeCache.get(type);
    if (isBlank(result)) {
      result = PipeProvider.createFromType(type, this._pipeResolver.resolve(type));
      this._pipeCache.set(type, result);
    }
    return result;
  }
}

export var CODEGEN_RESOLVED_METADATA_CACHE =
    new ResolvedMetadataCache(CODEGEN_DIRECTIVE_RESOLVER, CODEGEN_PIPE_RESOLVER);
