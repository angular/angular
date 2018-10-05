import {DocCollection, Processor} from 'dgeni';
import {Type, TypeChecker, TypeFormatFlags} from 'dgeni-packages/node_modules/typescript';
import {ConstExportDoc} from 'dgeni-packages/typescript/api-doc-types/ConstExportDoc';

/**
 * Processor that works around a Dgeni TypeScript package issue where the type of a constant export
 * is automatically truncated.
 *
 * Truncation of the type strings is causing unexpected results and also results in
 * misleading documentation. See https://github.com/angular/dgeni-packages/issues/276
 */
export class NoTruncateConstTypeProcessor implements Processor {
  name = 'no-truncate-const-type';
  $runBefore = ['categorizer'];

  $process(docs: DocCollection) {
    return docs
      .filter(doc => doc.docType === 'const')
      .forEach(doc => doc.type && this.refreshResolvedTypeString(doc));
  }

  /** Refreshes the determined type string of the specified export const document. */
  private refreshResolvedTypeString(doc: ConstExportDoc) {
    const {variableDeclaration, typeChecker} = doc;

    // Logic is aligned with the actual logic from the ConstExportDoc.
    // dgeni-packages#typescript/src/api-doc-types/ConstExportDoc.ts#L22
    if (variableDeclaration.type) {
      doc.type = this.typeToString(
          typeChecker, typeChecker.getTypeFromTypeNode(variableDeclaration.type));
    } else if (variableDeclaration.initializer) {
      doc.type = this.typeToString(
          typeChecker, typeChecker.getTypeAtLocation(variableDeclaration.initializer));
    }
  }

  /** Converts the specified type to a string that represents the type declaration. */
  private typeToString(typeChecker: TypeChecker, type: Type): string {
    return typeChecker.typeToString(type, undefined, TypeFormatFlags.NoTruncation);
  }
}
