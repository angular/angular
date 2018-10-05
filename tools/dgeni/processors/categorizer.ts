import {DocCollection, Processor} from 'dgeni';
import {MemberDoc} from 'dgeni-packages/typescript/api-doc-types/MemberDoc';
import {
  decorateDeprecatedDoc,
  getDirectiveSelectors,
  isDirective,
  isMethod,
  isNgModule,
  isProperty,
  isService,
} from '../common/decorators';
import {
  CategorizedClassDoc,
  CategorizedClassLikeDoc,
  CategorizedConstExportDoc,
  CategorizedFunctionExportDoc,
  CategorizedMethodMemberDoc,
  CategorizedPropertyMemberDoc,
  CategorizedTypeAliasExportDoc,
} from '../common/dgeni-definitions';
import {getDirectiveMetadata} from '../common/directive-metadata';
import {normalizeFunctionParameters} from '../common/normalize-function-parameters';
import {getInputBindingData, getOutputBindingData} from '../common/property-bindings';
import {sortCategorizedMethodMembers, sortCategorizedPropertyMembers} from '../common/sort-members';


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

    docs
      .filter(doc => doc.docType === 'function')
      .forEach(doc => this.decorateFunctionExportDoc(doc));

    docs
      .filter(doc => doc.docType === 'const')
      .forEach(doc => this.decorateConstExportDoc(doc));

    docs
      .filter(doc => doc.docType === 'type-alias')
      .forEach(doc => this.decorateTypeAliasExportDoc(doc));
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

    // Special decorations for real class documents that don't apply for interfaces.
    if (classLikeDoc.docType === 'class') {
      this.decorateClassDoc(classLikeDoc as CategorizedClassDoc);
      this.replaceMethodsWithOverload(classLikeDoc as CategorizedClassDoc);
    }

    // Call decorate hooks that can modify the method and property docs.
    classLikeDoc.methods.forEach(doc => this.decorateMethodDoc(doc));
    classLikeDoc.properties.forEach(doc => this.decoratePropertyDoc(doc));

    decorateDeprecatedDoc(classLikeDoc);

    // Sort members
    classLikeDoc.methods.sort(sortCategorizedMethodMembers);
    classLikeDoc.properties.sort(sortCategorizedPropertyMembers);
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
    classDoc.directiveMetadata = getDirectiveMetadata(classDoc);

    // Categorize the current visited classDoc into its Angular type.
    if (isDirective(classDoc) && classDoc.directiveMetadata) {
      classDoc.isDirective = true;
      classDoc.directiveExportAs = classDoc.directiveMetadata.get('exportAs');
      classDoc.directiveSelectors = getDirectiveSelectors(classDoc);
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
    normalizeFunctionParameters(methodDoc);
    decorateDeprecatedDoc(methodDoc);
  }

  /**
   * Method that will be called for each function export doc. The parameters for the functions
   * will be normalized, so that they can be easily used inside of Dgeni templates.
   */
  private decorateFunctionExportDoc(functionDoc: CategorizedFunctionExportDoc) {
    normalizeFunctionParameters(functionDoc);
    decorateDeprecatedDoc(functionDoc);
  }

  /**
   * Method that will be called for each const export document. We decorate the const
   * documents with a property that states whether the constant is deprecated or not.
   */
  private decorateConstExportDoc(doc: CategorizedConstExportDoc) {
    decorateDeprecatedDoc(doc);
  }

  /**
   * Method that will be called for each type-alias export document. We decorate the type-alias
   * documents with a property that states whether the type-alias is deprecated or not.
   */
  private decorateTypeAliasExportDoc(doc: CategorizedTypeAliasExportDoc) {
    decorateDeprecatedDoc(doc);
  }

  /**
   * Method that will be called for each property doc. Properties that are Angular inputs or
   * outputs will be marked. Aliases for the inputs or outputs will be stored as well.
   */
  private decoratePropertyDoc(propertyDoc: CategorizedPropertyMemberDoc) {
    decorateDeprecatedDoc(propertyDoc);

    const metadata = propertyDoc.containerDoc.docType === 'class' ?
        (propertyDoc.containerDoc as CategorizedClassDoc).directiveMetadata : null;

    const inputMetadata = metadata ? getInputBindingData(propertyDoc, metadata) : null;
    const outputMetadata = metadata ? getOutputBindingData(propertyDoc, metadata) : null;

    propertyDoc.isDirectiveInput = !!inputMetadata;
    propertyDoc.directiveInputAlias = (inputMetadata && inputMetadata.alias) || '';

    propertyDoc.isDirectiveOutput = !!outputMetadata;
    propertyDoc.directiveOutputAlias = (outputMetadata && outputMetadata.alias) || '';
  }

  /**
   * Walks through every method of the specified class doc and replaces the method
   * with its referenced overload method definitions, if the method is having overload definitions.
   */
  private replaceMethodsWithOverload(classDoc: CategorizedClassDoc) {
    const methodsToAdd: CategorizedMethodMemberDoc[] = [];

    classDoc.methods.forEach((methodDoc, index) => {
      if (methodDoc.overloads.length > 0) {

        // Add each method overload to the methods that will be shown in the docs.
        // Note that we cannot add the overloads immediately to the methods array because
        // that would cause the iteration to visit the new overloads.
        methodsToAdd.push(...methodDoc.overloads as CategorizedMethodMemberDoc[]);

        // Remove the base method for the overloads from the documentation.
        classDoc.methods.splice(index, 1);
      }
    });

    classDoc.methods.push(...methodsToAdd);
  }
}

/** Filters any duplicate classDoc members from an array */
function filterDuplicateMembers(item: MemberDoc, _index: number, array: MemberDoc[]) {
  return array.filter((memberDoc) => memberDoc.name === item.name)[0] === item;
}
