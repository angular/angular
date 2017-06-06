import { Type } from 'angular2/src/facade/lang';
import { PipeMetadata } from 'angular2/src/core/metadata';
import { ReflectorReader } from 'angular2/src/core/reflection/reflector_reader';
/**
 * Resolve a `Type` for {@link PipeMetadata}.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
export declare class PipeResolver {
    private _reflector;
    constructor(_reflector?: ReflectorReader);
    /**
     * Return {@link PipeMetadata} for a given `Type`.
     */
    resolve(type: Type): PipeMetadata;
}
export declare var CODEGEN_PIPE_RESOLVER: PipeResolver;
