/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ConstantPool } from '../../../constant_pool';
import { SecurityContext } from '../../../core';
import * as e from '../../../expression_parser/ast';
import * as i18n from '../../../i18n/i18n_ast';
import * as o from '../../../output/output_ast';
import * as t from '../../../render3/r3_ast';
import { R3ComponentDeferMetadata } from '../../../render3/view/api';
import { BindingParser } from '../../../template_parser/binding_parser';
import * as ir from '../ir';
import { TemplateCompilationMode, ComponentCompilationJob, HostBindingCompilationJob } from './compilation';
export declare function isI18nRootNode(meta?: i18n.I18nMeta): meta is i18n.Message;
export declare function isSingleI18nIcu(meta?: i18n.I18nMeta): meta is i18n.I18nMeta & {
    nodes: [i18n.Icu];
};
/**
 * Process a template AST and convert it into a `ComponentCompilation` in the intermediate
 * representation.
 * TODO: Refactor more of the ingestion code into phases.
 */
export declare function ingestComponent(componentName: string, template: t.Node[], constantPool: ConstantPool, compilationMode: TemplateCompilationMode, relativeContextFilePath: string, i18nUseExternalIds: boolean, deferMeta: R3ComponentDeferMetadata, allDeferrableDepsFn: o.ReadVarExpr | null, relativeTemplatePath: string | null, enableDebugLocations: boolean): ComponentCompilationJob;
export interface HostBindingInput {
    componentName: string;
    componentSelector: string;
    properties: e.ParsedProperty[] | null;
    attributes: {
        [key: string]: o.Expression;
    };
    events: e.ParsedEvent[] | null;
}
/**
 * Process a host binding AST and convert it into a `HostBindingCompilationJob` in the intermediate
 * representation.
 */
export declare function ingestHostBinding(input: HostBindingInput, bindingParser: BindingParser, constantPool: ConstantPool): HostBindingCompilationJob;
export declare function ingestDomProperty(job: HostBindingCompilationJob, property: e.ParsedProperty, bindingKind: ir.BindingKind, securityContexts: SecurityContext[]): void;
export declare function ingestHostAttribute(job: HostBindingCompilationJob, name: string, value: o.Expression, securityContexts: SecurityContext[]): void;
export declare function ingestHostEvent(job: HostBindingCompilationJob, event: e.ParsedEvent): void;
