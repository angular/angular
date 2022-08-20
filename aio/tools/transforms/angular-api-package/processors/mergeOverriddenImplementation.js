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
 * /**
 * * @overriddenImplementation FooCtor
 * *\/
 * export interface Foo {
 *   bar();
 * }
 *
 * type FooInterface = Foo;
 *
 * export class FooImpl { ... }
 *
 * export interface FooCtor {
 *   new(): Foo;
 * }
 *
 * export const Foo: FooCtor =
    (class Foo implements FooInterface { ... }
 * ```
 *
 * This processor will extend the docs for symbol `Foo` by copying all documented constructor overrides from `FooCtor`.
 *
 * In order to use this processor, annotate the exported interface with `@overriddenImplementation`. Place the desired
 * documentation on the interface and constructor signatures.
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
          // Convert the specified name into a doc.
          const ctorDocArray = getDocFromAlias(doc.overriddenImplementation);
            if (ctorDocArray.length === 0) {
              throw new Error(`@overriddenImplementation failed to find a doc for ${doc.overriddenImplementation}. Are you sure this symbol is documented and exported?`);
            }
            if (ctorDocArray.length >= 2) {
              throw new Error(`@overriddenImplementation found multiple docs for ${doc.overriddenImplementation}. You may only have one documented symbol for each.`);
            }

          const ctorDoc = ctorDocArray[0];

          // Copy the constructor overrides from the constructor doc, if any are present.
          if (!ctorDoc.members || ctorDoc.members.length === 0 || !ctorDoc.members[0].name.includes('new')) {
            throw new Error(`@overriddenImplementation requires that the provided constructor ${ctorDoc.id} have a member called "new", possibly with multiple overrides.`);
          }
          doc.constructorDoc = ctorDoc.members[0];

          // Mark the constructor doc internal.
          if (!ctorDoc.internal && !ctorDoc.privateExport) {
            log.warn(
                `Constructor doc ${ctorDoc.id} was not marked as internal (either via an ` +
                '\'@internal\' annotation or a \'ɵ\' prefix). Marking it as internal.');
            ctorDoc.internal = true;
          }

          // The exported doc should not be private.
          doc.privateExport = false;
          doc.internal = false;
        }
      });
    }
  };
};
