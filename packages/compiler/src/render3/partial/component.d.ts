import * as o from '../../output/output_ast';
import { R3CompiledExpression } from '../util';
import { R3ComponentMetadata, R3TemplateDependencyMetadata } from '../view/api';
import { ParsedTemplate } from '../view/template';
import { DefinitionMap } from '../view/util';
import { R3DeclareComponentMetadata } from './api';
export interface DeclareComponentTemplateInfo {
    /**
     * The string contents of the template.
     *
     * This is the "logical" template string, after expansion of any escaped characters (for inline
     * templates). This may differ from the actual template bytes as they appear in the .ts file.
     */
    content: string;
    /**
     * A full path to the file which contains the template.
     *
     * This can be either the original .ts file if the template is inline, or the .html file if an
     * external file was used.
     */
    sourceUrl: string;
    /**
     * Whether the template was inline (using `template`) or external (using `templateUrl`).
     */
    isInline: boolean;
    /**
     * If the template was defined inline by a direct string literal, then this is that literal
     * expression. Otherwise `null`, if the template was not defined inline or was not a literal.
     */
    inlineTemplateLiteralExpression: o.Expression | null;
}
/**
 * Compile a component declaration defined by the `R3ComponentMetadata`.
 */
export declare function compileDeclareComponentFromMetadata(meta: R3ComponentMetadata<R3TemplateDependencyMetadata>, template: ParsedTemplate, additionalTemplateInfo: DeclareComponentTemplateInfo): R3CompiledExpression;
/**
 * Gathers the declaration fields for a component into a `DefinitionMap`.
 */
export declare function createComponentDefinitionMap(meta: R3ComponentMetadata<R3TemplateDependencyMetadata>, template: ParsedTemplate, templateInfo: DeclareComponentTemplateInfo): DefinitionMap<R3DeclareComponentMetadata>;
