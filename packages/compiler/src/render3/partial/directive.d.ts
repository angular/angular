import { R3CompiledExpression } from '../util';
import { R3DirectiveMetadata } from '../view/api';
import { DefinitionMap } from '../view/util';
import { R3DeclareDirectiveMetadata } from './api';
/**
 * Compile a directive declaration defined by the `R3DirectiveMetadata`.
 */
export declare function compileDeclareDirectiveFromMetadata(meta: R3DirectiveMetadata): R3CompiledExpression;
/**
 * Gathers the declaration fields for a directive into a `DefinitionMap`. This allows for reusing
 * this logic for components, as they extend the directive metadata.
 */
export declare function createDirectiveDefinitionMap(meta: R3DirectiveMetadata): DefinitionMap<R3DeclareDirectiveMetadata>;
