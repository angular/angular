/**
 * In some cases it is desirable to override the exported implementation and constructor for a symbol.
 * This is useful for a few reasons:
 * - A symbol could have multiple constructors
 * - It is possible to disambiguate multiple different signatures from a single polymorphic constructor
 * - The return type of the overridden constructor can differ (e.g. `Foo<T|null>` vs `Foo<T>`)
 * 
 * This looks like the following:
 * 
 * ```
 * export interface Foo {
 *   bar();
 * }
 * 
 * export class FooImpl {
 *   bar() {}
 * }
 * 
 * export interface FooCtor {
 *   new(): Foo;
 * }
 * 
 * export const Foo: FooCtor = FooImpl as FooCtor;
 * ```
 * 
 * This processor will correct the docs for symbol `Foo` by copying them over from `FooImpl`
 * to the exported symbol `Foo`. The processor will also copy all documented constructor overrides from `FooCtor`.
 * 
 * In order to use this processor, annotate the exported constant with `@overriddenImplementation`,
 * and mark the implementation and constructor types as `@internal`. Place the desired
 * documentation on the implementation class.
 */
 module.exports = function mergeOverriddenImplementation(getDocFromAlias, log) {
  return {
    $runAfter: ['tags-extracted', 'ids-computed'],
    $runBefore: ['filterPrivateDocs'],
    propertiesToKeep: [
      'name', 'id', 'aliases', 'fileInfo', 'startingLine', 'endingLine',
      'path', 'originalModule', 'outputPath', 'privateExport', 'moduleDoc'
    ],
    $process(docs) {
      docs.forEach(doc => {
        if (doc.overriddenImplementation) {          
          // Check the AST is of the expected expression shape, and extract the identifiers.
          const symbolAstObjects = [doc.declaration?.name, doc.declaration?.type, doc.declaration?.initializer?.expression];
          if (symbolAstObjects.some(symbol => symbol === undefined)) {
            throw new Error('@overriddenImplementation must have format `export const Foo: FooCtor = FooImpl as FooCtor;`');
          }

          // Convert the AST nodes into docs.
          const symbolNames = symbolAstObjects.map(s => s.getText());
          const symbolDocArrays = symbolNames.map(symbol => getDocFromAlias(symbol));
          for (let i = 0; i < symbolDocArrays.length; i++) {
            if (symbolDocArrays[i].length === 0) {
              throw new Error(`@overriddenImplementation failed to find a doc for ${symbolNames[i]}. Are you sure this symbol is documented and exported?`);
            }
            if (symbolDocArrays[i].length >= 2) {
              throw new Error(`@overriddenImplementation found multiple docs for ${symbolNames[i]}. You may only have one documented symbol for each.`);
            }
          }
          const symbolDocs = symbolDocArrays.map(a => a[0]);
          const exportedNameDoc = symbolDocs[0];
          const ctorDoc = symbolDocs[1];
          const implDoc = symbolDocs[2];

          // Clean out the unwanted properties from the exported doc.
          Object.keys(doc).forEach(key => {
            if (!this.propertiesToKeep.includes(key)) {
              delete doc[key];
            }
          });

          // Copy over all the properties from the implementation doc.
          Object.keys(implDoc).forEach(key => {
            if (!this.propertiesToKeep.includes(key)) {
              exportedNameDoc[key] = implDoc[key];
            }
          });

          // Copy the constructor overrides from the constructor doc, if any are present.
          if (!ctorDoc.members || ctorDoc.members.length !== 1 || !ctorDoc.members[0].name.includes('new')) {
            throw new Error(`@overriddenImplementation requires that the provided constructor ${symbolNames[1]} have exactly one member called "new", possibly with multiple overrides.`);
          }
          exportedNameDoc.constructorDoc = ctorDoc.members[0];

          // Mark symbols other than the exported name as internal.
          if (!ctorDoc.internal) {
            log.warn(`Constructor doc ${symbolNames[1]} was not marked '@internal'; adding this annotation.`);
            ctorDoc.internal = true;
          }
          if (!implDoc.internal) {
            log.warn(`Implementation doc ${symbolNames[2]} was not marked '@internal'; adding this annotation.`);
            implDoc.internal = true;
          }

          // The exported doc should not be private, unlike the implementation doc.
          exportedNameDoc.privateExport = false;
          exportedNameDoc.internal = false;
        }
      });
    }
  };
};
