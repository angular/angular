import {getTypeText} from 'dgeni-packages/typescript/services/TsParser/getTypeText';
import {getDecorators} from 'dgeni-packages/typescript/services/TsParser/getDecorators';
import {
  ClassDeclaration,
  SyntaxKind,
  GetAccessorDeclaration,
  SetAccessorDeclaration,
  Symbol,
  displayPartsToString
} from 'typescript';
import {CategorizedPropertyMemberDoc} from '../processors/categorizer';

/**
 * Accessors are not being parsed properly within the latest Dgeni-packages version.
 * This function re-analyzes the accessors and resolves the necessary API docs information.
 * See: https://github.com/angular/dgeni-packages/issues/246
 */
export function dgeniAccessorsParse(propertyDoc: CategorizedPropertyMemberDoc) {
  if ((propertyDoc.isGetAccessor || propertyDoc.isSetAccessor) && !propertyDoc.type) {
    const classDeclaration = propertyDoc.containerDoc.symbol.valueDeclaration as ClassDeclaration;

    // Walk through every TypeScript member node of the class declaration and filter for accessors
    // with a name that match the current property member. For accessors there may be two
    // declarations with the same name but with different type information.
    classDeclaration.members
      .filter((member: any) => member.kind === SyntaxKind.GetAccessor ||
        member.kind === SyntaxKind.SetAccessor)
      .filter((member: any) => member.name && member.name.text === propertyDoc.name)
      .forEach((member: GetAccessorDeclaration|SetAccessorDeclaration) => {
        if (member.type) {
          // If there is a type specified for the current member, then this node is a getter
          // declaration and its type describes the property.
          propertyDoc.type = getTypeText(member.type, []);
          propertyDoc.decorators = getDecorators(member);
        } else if (member.parameters.length === 1 && member.parameters[0].type) {
          const type = member.parameters[0].type;

          // If there is a type specified for the first parameter of the property, then this
          // can be considered a setter and the type of the parameter would describe the actual
          // property. Transforming the type node to a string is done by the `getTypeText` function
          // from Dgeni Packages.
          if (type) {
            propertyDoc.type = getTypeText(type, []);
            propertyDoc.decorators = getDecorators(member);
          }
        }

        // If the current property document doesn't have any description set and the current
        // TypeScript has a symbol from the TypeChecker, we can try to find a documentation
        // comment on that symbol.
        if (!propertyDoc.description && (member as any).symbol) {
          const memberSymbol = (member as any).symbol as Symbol;
          propertyDoc.description = displayPartsToString(memberSymbol.getDocumentationComment());
        }
      });

    if (!propertyDoc.type) {
      console.warn(`Could not find type information for property "${propertyDoc.name}" in ` +
        `${propertyDoc.fileInfo.relativePath}:${propertyDoc.startingLine}`);
    }
  }
}
