import {ClassExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassExportDoc';
import {ClassLikeExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassLikeExportDoc';
import {PropertyMemberDoc} from 'dgeni-packages/typescript/api-doc-types/PropertyMemberDoc';
import {NormalizedMethodMemberDoc} from './normalize-method-parameters';

/** Extended Dgeni class-like document that includes separated class members. */
export interface CategorizedClassLikeDoc extends ClassLikeExportDoc {
  methods: CategorizedMethodMemberDoc[];
  properties: CategorizedPropertyMemberDoc[];
  isDeprecated: boolean;
}

/** Extended Dgeni class document that includes extracted Angular metadata. */
export interface CategorizedClassDoc extends ClassExportDoc, CategorizedClassLikeDoc {
  isDirective: boolean;
  isService: boolean;
  isNgModule: boolean;
  directiveExportAs?: string | null;
  directiveSelectors?: string[];
  extendedDoc: ClassLikeExportDoc | null;
}

/** Extended Dgeni property-member document that includes extracted Angular metadata. */
export interface CategorizedPropertyMemberDoc extends PropertyMemberDoc {
  description: string;
  isDeprecated: boolean;
  isDirectiveInput: boolean;
  isDirectiveOutput: boolean;
  directiveInputAlias: string;
  directiveOutputAlias: string;
}

/** Extended Dgeni method-member document that simplifies logic for the Dgeni template. */
export interface CategorizedMethodMemberDoc extends NormalizedMethodMemberDoc {
  showReturns: boolean;
  isDeprecated: boolean;
}
