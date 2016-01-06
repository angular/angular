import { Type } from 'angular2/src/facade/lang';
import { PipeMetadata } from 'angular2/src/core/metadata';
/**
 * Resolve a `Type` for {@link PipeMetadata}.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
export declare class PipeResolver {
    /**
     * Return {@link PipeMetadata} for a given `Type`.
     */
    resolve(type: Type): PipeMetadata;
}
export declare var CODEGEN_PIPE_RESOLVER: PipeResolver;
