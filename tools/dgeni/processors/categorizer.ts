import {Processor, DocCollection} from 'dgeni';
import {ClassExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassExportDoc';
import {PropertyMemberDoc} from 'dgeni-packages/typescript/api-doc-types/PropertyMemberDoc';
import {
  NormalizedMethodMemberDoc,
  normalizeMethodParameters
} from '../common/normalize-method-parameters';
import {
  decorateDeprecatedDoc,
  getDirectiveInputAlias,
  getDirectiveOutputAlias,
  getDirectiveSelectors,
  getMetadataProperty,
  isDirective,
  isDirectiveInput,
  isDirectiveOutput,
  isMethod,
  isNgModule,
  isProperty,
  isService
} from '../common/decorators';
import {MethodMemberDoc} from 'dgeni-packages/typescript/api-doc-types/MethodMemberDoc';
import {dgeniAccessorsParse} from '../common/dgeni-accessors-parse';
import {sortCategorizedMembers} from '../common/sort-members';

export interface CategorizedClassDoc extends ClassExportDoc {
  methods: CategorizedMethodMemberDoc[];
  properties: CategorizedPropertyMemberDoc[];
  isDirective: boolean;
  isService: boolean;
  isNgModule: boolean;
  isDeprecated: boolean;
  directiveExportAs?: string | null;
  directiveSelectors?: string[];
}

export interface CategorizedPropertyMemberDoc extends PropertyMemberDoc {
  description: string;
  isDeprecated: boolean;
  isDirectiveInput: boolean;
  isDirectiveOutput: boolean;
  directiveInputAlias: string;
  directiveOutputAlias: string;
}

export interface CategorizedMethodMemberDoc extends NormalizedMethodMemberDoc {
  showReturns: boolean;
  isDeprecated: boolean;
}

/**
 * Processor to add properties to docs objects.
 *
 * isMethod     | Whether the doc is for a method on a class.
 * isDirective  | Whether the doc is for a @Component or a @Directive
 * isService    | Whether the doc is for an @Injectable
 * isNgModule   | Whether the doc is for an NgModule
 */
export class Categorizer implements Processor {
  name = 'categorizer';
  $runBefore = ['docs-processed'];

  $process(docs: DocCollection) {
    docs.filter(doc => doc.docType === 'class').forEach(doc => this.decorateClassDoc(doc));
  }

  /**
   * Decorates all class docs inside of the dgeni pipeline.
   * - Methods and properties of a class-doc will be extracted into separate variables.
   * - Identifies directives, services or NgModules and marks them them in class-doc.
   */
  private decorateClassDoc(classDoc: CategorizedClassDoc) {
    // Resolve all methods and properties from the classDoc.
    classDoc.methods = classDoc.members
      .filter(isMethod)
      .filter(filterDuplicateMembers) as CategorizedMethodMemberDoc[];

    classDoc.properties = classDoc.members
      .filter(isProperty)
      .filter(filterDuplicateMembers) as CategorizedPropertyMemberDoc[];

    // Call decorate hooks that can modify the method and property docs.
    classDoc.methods.forEach(doc => this.decorateMethodDoc(doc));
    classDoc.properties.forEach(doc => this.decoratePropertyDoc(doc));

    decorateDeprecatedDoc(classDoc);

    // Sort members
    classDoc.methods.sort(sortCategorizedMembers);
    classDoc.properties.sort(sortCategorizedMembers);

    // Categorize the current visited classDoc into its Angular type.
    if (isDirective(classDoc)) {
      classDoc.isDirective = true;
      classDoc.directiveExportAs = getMetadataProperty(classDoc, 'exportAs');
      classDoc.directiveSelectors =  getDirectiveSelectors(classDoc);
    } else if (isService(classDoc)) {
      classDoc.isService = true;
    } else if (isNgModule(classDoc)) {
      classDoc.isNgModule = true;
    }
  }

  /**
   * Method that will be called for each method doc. The parameters for the method-docs
   * will be normalized, so that they can be easily used inside of dgeni templates.
   */
  private decorateMethodDoc(methodDoc: CategorizedMethodMemberDoc) {
    normalizeMethodParameters(methodDoc);
    decorateDeprecatedDoc(methodDoc);

    // Mark methods with a `void` return type so we can omit show the return type in the docs.
    methodDoc.showReturns = methodDoc.type ? methodDoc.type !== 'void' : false;
  }

  /**
   * Method that will be called for each property doc. Properties that are Angular inputs or
   * outputs will be marked. Aliases for the inputs or outputs will be stored as well.
   */
  private decoratePropertyDoc(propertyDoc: CategorizedPropertyMemberDoc) {
    decorateDeprecatedDoc(propertyDoc);
    dgeniAccessorsParse(propertyDoc);

    propertyDoc.isDirectiveInput = isDirectiveInput(propertyDoc);
    propertyDoc.directiveInputAlias = getDirectiveInputAlias(propertyDoc);

    propertyDoc.isDirectiveOutput = isDirectiveOutput(propertyDoc);
    propertyDoc.directiveOutputAlias = getDirectiveOutputAlias(propertyDoc);
  }
}

/** Filters any duplicate classDoc members from an array */
function filterDuplicateMembers(item: MethodMemberDoc, _index: number, array: MethodMemberDoc[]) {
  return array.filter((memberDoc) => memberDoc.name === item.name)[0] === item;
}
