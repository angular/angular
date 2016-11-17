/**
 * Subset of lib.es2015.core.d.ts typings.
 * Angular should not require use of ES6 runtime but some API usages are already present.
 * See https://github.com/angular/angular/issues/5242
 * TODO(alexeagle): remove methods below which may not be present in targeted browser
 */

interface Function {
    /**
      * Returns the name of the function. Function names are read-only and can not be changed.
      */
    readonly name: string;
}
