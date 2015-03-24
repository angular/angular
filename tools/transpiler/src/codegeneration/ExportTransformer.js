import {ParseTreeTransformer} from './ParseTreeTransformer';
import {Map} from 'traceur/src/runtime/polyfills/Map';
import {
  ExportDeclaration,
  ExportSpecifierSet,
  NamedExport,
  EmptyStatement
} from 'traceur/src/syntax/trees/ParseTrees';
import {
  IMPORT_DECLARATION,
  NAMED_EXPORT
} from 'traceur/src/syntax/trees/ParseTreeType';


// Return the index of the first item that is not of IMPORT_DECLARATION type.
function getIndexOfFirstNonImportStatement(items) {
  var index = 0;

  while (index < items.length && items[index].type === IMPORT_DECLARATION) {
    index++;
  }

  return index;
}


/**
 * Transforms re-exports:
 * ```
 * import {Foo} from './foo';
 * import {Bar} from './bar';
 * var localVar = true;
 *
 * export {Foo, Bar, localVar}
 *
 * ===>
 *
 * import {Foo} from './foo';
 * import {Bar} from './bar';
 * var localVar = true;
 *
 * export {Foo} from './foo';
 * export {Bar} from './bar';
 * ```
 *
 * In Dart, all variables defined in the root context of a module that don't start with
 * an underscore are exported. Thus we just drop the "export" keyword for the locally defined vars.
 * Variables imported from other modules need to be exported with `export './foo' show Foo`.
 * This transformer drops the local exports and add the information about module path for the
 * imported variables.
 */
export class ExportTransformer extends ParseTreeTransformer {
  constructor(idGenerator, reporter) {
    super(idGenerator);
    this.reporter_ = reporter;
    this.importedVars_ = null;
    this.collectedExports_ = null;
  }

  transformModule(tree) {
    // New context for each file (module).
    this.importedVars_ = new Map();
    this.collectedExports_ = [];

    tree = super.transformModule(tree);

    // In Dart, imports and exports have to be at the top, before any other statement.
    // Insert the collected exports before the first non-import statement (after all imports).
    var items = tree.scriptItemList;
    var index = getIndexOfFirstNonImportStatement(items);
    tree.scriptItemList = items.slice(0, index).concat(this.collectedExports_, items.slice(index));

    return tree;
  }

  // For each imported variable, store the module path where it comes from.
  // For instance, `import {Foo} from './foo'` will map 'Foo' -> './foo'.
  // TODO(vojta): deal with `import * as m from './foo'`.
  transformImportDeclaration(tree) {
    tree.importClause.specifiers.forEach((specifier) => {
      this.importedVars_.set(specifier.binding.binding.identifierToken.value, tree.moduleSpecifier);
    });

    return tree;
  }

  transformExportDeclaration(tree) {
    if (tree.declaration.type === NAMED_EXPORT && tree.declaration.moduleSpecifier === null) {
      // export {...}
      tree.declaration.specifierSet.specifiers.forEach((specifier) => {
        // Filter out local variables, keep only imported ones.
        if (!this.importedVars_.has(specifier.lhs.value)) {
          return;
        }

        // For each specifier, create a new ExportDeclaration and attach the module path (collected
        // in `transformImportDeclaration`) to it.
        this.collectedExports_.push(new ExportDeclaration(tree.location,
            new NamedExport(tree.declaration.location, this.importedVars_.get(specifier.lhs.value),
              new ExportSpecifierSet(tree.declaration.specifierSet.location, [specifier])),
            tree.annotations));
      });

      return new EmptyStatement(tree.location);
    }

    return tree;
  }
}
