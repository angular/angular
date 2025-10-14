import { R3PipeMetadata } from '../r3_pipe_compiler';
import { R3CompiledExpression } from '../util';
import { DefinitionMap } from '../view/util';
import { R3DeclarePipeMetadata } from './api';
/**
 * Compile a Pipe declaration defined by the `R3PipeMetadata`.
 */
export declare function compileDeclarePipeFromMetadata(meta: R3PipeMetadata): R3CompiledExpression;
/**
 * Gathers the declaration fields for a Pipe into a `DefinitionMap`.
 */
export declare function createPipeDefinitionMap(meta: R3PipeMetadata): DefinitionMap<R3DeclarePipeMetadata>;
