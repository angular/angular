/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';
import {
  ImportManager,
  presetImportManagerForceNamespaceImports,
  translateType,
} from '../../translator';
/**
 * Keeps track of `DtsTransform`s per source file, so that it is known which source files need to
 * have their declaration file transformed.
 */
export class DtsTransformRegistry {
  ivyDeclarationTransforms = new Map();
  getIvyDeclarationTransform(sf) {
    if (!this.ivyDeclarationTransforms.has(sf)) {
      this.ivyDeclarationTransforms.set(sf, new IvyDeclarationDtsTransform());
    }
    return this.ivyDeclarationTransforms.get(sf);
  }
  /**
   * Gets the dts transforms to be applied for the given source file, or `null` if no transform is
   * necessary.
   */
  getAllTransforms(sf) {
    // No need to transform if it's not a declarations file, or if no changes have been requested
    // to the input file. Due to the way TypeScript afterDeclarations transformers work, the
    // `ts.SourceFile` path is the same as the original .ts. The only way we know it's actually a
    // declaration file is via the `isDeclarationFile` property.
    if (!sf.isDeclarationFile) {
      return null;
    }
    const originalSf = ts.getOriginalNode(sf);
    let transforms = null;
    if (this.ivyDeclarationTransforms.has(originalSf)) {
      transforms = [];
      transforms.push(this.ivyDeclarationTransforms.get(originalSf));
    }
    return transforms;
  }
}
export function declarationTransformFactory(
  transformRegistry,
  reflector,
  refEmitter,
  importRewriter,
) {
  return (context) => {
    const transformer = new DtsTransformer(context, reflector, refEmitter, importRewriter);
    return (fileOrBundle) => {
      if (ts.isBundle(fileOrBundle)) {
        // Only attempt to transform source files.
        return fileOrBundle;
      }
      const transforms = transformRegistry.getAllTransforms(fileOrBundle);
      if (transforms === null) {
        return fileOrBundle;
      }
      return transformer.transform(fileOrBundle, transforms);
    };
  };
}
/**
 * Processes .d.ts file text and adds static field declarations, with types.
 */
class DtsTransformer {
  ctx;
  reflector;
  refEmitter;
  importRewriter;
  constructor(ctx, reflector, refEmitter, importRewriter) {
    this.ctx = ctx;
    this.reflector = reflector;
    this.refEmitter = refEmitter;
    this.importRewriter = importRewriter;
  }
  /**
   * Transform the declaration file and add any declarations which were recorded.
   */
  transform(sf, transforms) {
    const imports = new ImportManager({
      ...presetImportManagerForceNamespaceImports,
      rewriter: this.importRewriter,
    });
    const visitor = (node) => {
      if (ts.isClassDeclaration(node)) {
        return this.transformClassDeclaration(node, transforms, imports);
      } else {
        // Otherwise return node as is.
        return ts.visitEachChild(node, visitor, this.ctx);
      }
    };
    // Recursively scan through the AST and process all nodes as desired.
    sf = ts.visitNode(sf, visitor, ts.isSourceFile) || sf;
    // Update/insert needed imports.
    return imports.transformTsFile(this.ctx, sf);
  }
  transformClassDeclaration(clazz, transforms, imports) {
    let newClazz = clazz;
    for (const transform of transforms) {
      if (transform.transformClass !== undefined) {
        newClazz = transform.transformClass(
          newClazz,
          newClazz.members,
          this.reflector,
          this.refEmitter,
          imports,
        );
      }
    }
    return newClazz;
  }
}
export class IvyDeclarationDtsTransform {
  declarationFields = new Map();
  addFields(decl, fields) {
    this.declarationFields.set(decl, fields);
  }
  transformClass(clazz, members, reflector, refEmitter, imports) {
    const original = ts.getOriginalNode(clazz);
    if (!this.declarationFields.has(original)) {
      return clazz;
    }
    const fields = this.declarationFields.get(original);
    const newMembers = fields.map((decl) => {
      const modifiers = [ts.factory.createModifier(ts.SyntaxKind.StaticKeyword)];
      const typeRef = translateType(
        decl.type,
        original.getSourceFile(),
        reflector,
        refEmitter,
        imports,
      );
      markForEmitAsSingleLine(typeRef);
      return ts.factory.createPropertyDeclaration(
        /* modifiers */ modifiers,
        /* name */ decl.name,
        /* questionOrExclamationToken */ undefined,
        /* type */ typeRef,
        /* initializer */ undefined,
      );
    });
    return ts.factory.updateClassDeclaration(
      /* node */ clazz,
      /* modifiers */ clazz.modifiers,
      /* name */ clazz.name,
      /* typeParameters */ clazz.typeParameters,
      /* heritageClauses */ clazz.heritageClauses,
      /* members */ [...members, ...newMembers],
    );
  }
}
function markForEmitAsSingleLine(node) {
  ts.setEmitFlags(node, ts.EmitFlags.SingleLine);
  ts.forEachChild(node, markForEmitAsSingleLine);
}
//# sourceMappingURL=declaration.js.map
