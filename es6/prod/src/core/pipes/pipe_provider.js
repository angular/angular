import { resolveProvider, ResolvedProvider_ } from 'angular2/src/core/di/provider';
import { Provider } from 'angular2/src/core/di';
export class PipeProvider extends ResolvedProvider_ {
    constructor(name, pure, key, resolvedFactories, multiBinding) {
        super(key, resolvedFactories, multiBinding);
        this.name = name;
        this.pure = pure;
    }
    static createFromType(type, metadata) {
        var provider = new Provider(type, { useClass: type });
        var rb = resolveProvider(provider);
        return new PipeProvider(metadata.name, metadata.pure, rb.key, rb.resolvedFactories, rb.multiProvider);
    }
}
