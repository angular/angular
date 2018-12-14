import {ClassExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassExportDoc';
import {ClassLikeExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassLikeExportDoc';
import {ConstExportDoc} from 'dgeni-packages/typescript/api-doc-types/ConstExportDoc';
import {PropertyMemberDoc} from 'dgeni-packages/typescript/api-doc-types/PropertyMemberDoc';
import {TypeAliasExportDoc} from 'dgeni-packages/typescript/api-doc-types/TypeAliasExportDoc';
import {ParsedDecorator} from 'dgeni-packages/typescript/services/TsParser/getDecorators';
import {FunctionExportDoc} from 'dgeni-packages/typescript/api-doc-types/FunctionExportDoc';
import {MethodMemberDoc} from 'dgeni-packages/typescript/api-doc-types/MethodMemberDoc';
import {NormalizedFunctionParameters} from './normalize-function-parameters';

/** Interface that describes categorized docs that can be deprecated. */
export interface DeprecationInfo {
  isDeprecated: boolean;
  breakingChange: string | null;
}

/** Interface that describes Dgeni documents that have decorators. */
export interface HasDecoratorsDoc {
  decorators?: ParsedDecorator[] | undefined;
}

/** Extended Dgeni class-like document that includes separated class members. */
export interface CategorizedClassLikeDoc extends ClassLikeExportDoc, DeprecationInfo {
  methods: CategorizedMethodMemberDoc[];
  properties: CategorizedPropertyMemberDoc[];
}

/** Extended Dgeni class document that includes extracted Angular metadata. */
export interface CategorizedClassDoc extends ClassExportDoc, CategorizedClassLikeDoc {
  isDirective: boolean;
  isService: boolean;
  isNgModule: boolean;
  directiveExportAs?: string | null;
  directiveSelectors?: string[];
  directiveMetadata: Map<string, any> | null;
  extendedDoc: ClassLikeExportDoc | null;
}

/** Extended Dgeni property-member document that includes extracted Angular metadata. */
export interface CategorizedPropertyMemberDoc extends PropertyMemberDoc, DeprecationInfo {
  description: string;
  isDirectiveInput: boolean;
  isDirectiveOutput: boolean;
  directiveInputAlias: string;
  directiveOutputAlias: string;
}

/** Extended Dgeni method-member document that simplifies logic for the Dgeni template. */
export interface CategorizedMethodMemberDoc
    extends NormalizedFunctionParameters, MethodMemberDoc, DeprecationInfo {}

/** Extended Dgeni function export document that simplifies logic for the Dgeni template. */
export interface CategorizedFunctionExportDoc
    extends NormalizedFunctionParameters, FunctionExportDoc, DeprecationInfo {}

/** Extended Dgeni const export document that simplifies logic for the Dgeni template. */
export interface CategorizedConstExportDoc extends ConstExportDoc, DeprecationInfo {}

/** Extended Dgeni type alias document that includes more information when rendering. */
export interface CategorizedTypeAliasExportDoc extends TypeAliasExportDoc, DeprecationInfo {}
