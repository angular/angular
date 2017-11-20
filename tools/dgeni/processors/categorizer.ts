import {DocCollection, Processor} from 'dgeni';
import {MethodMemberDoc} from 'dgeni-packages/typescript/api-doc-types/MethodMemberDoc';
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
import {
  CategorizedClassDoc,
  CategorizedClassLikeDoc,
  CategorizedMethodMemberDoc,
  CategorizedPropertyMemberDoc
} from '../common/dgeni-definitions';
import {normalizeMethodParameters} from '../common/normalize-method-parameters';
import {sortCategorizedMembers} from '../common/sort-members';


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
    docs
      .filter(doc => doc.docType === 'class' || doc.docType === 'interface')
      .forEach(doc => this.decorateClassLikeDoc(doc));
  }

  /**
   * Decorates all class and interface docs inside of the dgeni pipeline.
   * - Members of a class and interface document will be extracted into separate variables.
   */
  private decorateClassLikeDoc(classLikeDoc: CategorizedClassLikeDoc) {
    // Resolve all methods and properties from the classDoc.
    classLikeDoc.methods = classLikeDoc.members
      .filter(isMethod)
      .filter(filterDuplicateMembers) as CategorizedMethodMemberDoc[];

    classLikeDoc.properties = classLikeDoc.members
      .filter(isProperty)
      .filter(filterDuplicateMembers) as CategorizedPropertyMemberDoc[];

    // Call decorate hooks that can modify the method and property docs.
    classLikeDoc.methods.forEach(doc => this.decorateMethodDoc(doc));
    classLikeDoc.properties.forEach(doc => this.decoratePropertyDoc(doc));

    decorateDeprecatedDoc(classLikeDoc);

    // Sort members
    classLikeDoc.methods.sort(sortCategorizedMembers);
    classLikeDoc.properties.sort(sortCategorizedMembers);

    // Special decorations for real class documents that don't apply for interfaces.
    if (classLikeDoc.docType === 'class') {
      this.decorateClassDoc(classLikeDoc as CategorizedClassDoc);
    }
  }

  /**
   * Decorates all Dgeni class documents for a simpler use inside of the template.
   * - Identifies directives, services or NgModules and marks them them inside of the doc.
   * - Links the Dgeni document to the Dgeni document that the current class extends from.
   */
  private decorateClassDoc(classDoc: CategorizedClassDoc) {
    // Classes can only extend a single class. This means that there can't be multiple extend
    // clauses for the Dgeni document. To make the template syntax simpler and more readable,
    // store the extended class in a variable.
    classDoc.extendedDoc = classDoc.extendsClauses[0] ? classDoc.extendsClauses[0].doc! : null;

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
