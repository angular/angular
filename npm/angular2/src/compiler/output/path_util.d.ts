export declare enum ImportEnv {
    Dart = 0,
    JS = 1,
}
/**
 * Returns the module path to use for an import.
 */
export declare function getImportModulePath(moduleUrlStr: string, importedUrlStr: string, importEnv: ImportEnv): string;
export declare function getRelativePath(modulePath: string, importedPath: string, importEnv: ImportEnv): string;
export declare function getLongestPathSegmentPrefix(arr1: string[], arr2: string[]): number;
