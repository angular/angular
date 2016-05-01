import { BaseException } from 'angular2/src/facade/exceptions';
import { isPresent, isBlank, RegExpWrapper, Math } from 'angular2/src/facade/lang';
// asset:<package-name>/<realm>/<path-to-module>
var _ASSET_URL_RE = /asset:([^\/]+)\/([^\/]+)\/(.+)/g;
var _PATH_SEP = '/';
var _PATH_SEP_RE = /\//g;
export var ImportEnv;
(function (ImportEnv) {
    ImportEnv[ImportEnv["Dart"] = 0] = "Dart";
    ImportEnv[ImportEnv["JS"] = 1] = "JS";
})(ImportEnv || (ImportEnv = {}));
/**
 * Returns the module path to use for an import.
 */
export function getImportModulePath(moduleUrlStr, importedUrlStr, importEnv) {
    var absolutePathPrefix = importEnv === ImportEnv.Dart ? `package:` : '';
    var moduleUrl = _AssetUrl.parse(moduleUrlStr, false);
    var importedUrl = _AssetUrl.parse(importedUrlStr, true);
    if (isBlank(importedUrl)) {
        return importedUrlStr;
    }
    // Try to create a relative path first
    if (moduleUrl.firstLevelDir == importedUrl.firstLevelDir &&
        moduleUrl.packageName == importedUrl.packageName) {
        return getRelativePath(moduleUrl.modulePath, importedUrl.modulePath, importEnv);
    }
    else if (importedUrl.firstLevelDir == 'lib') {
        return `${absolutePathPrefix}${importedUrl.packageName}/${importedUrl.modulePath}`;
    }
    throw new BaseException(`Can't import url ${importedUrlStr} from ${moduleUrlStr}`);
}
class _AssetUrl {
    constructor(packageName, firstLevelDir, modulePath) {
        this.packageName = packageName;
        this.firstLevelDir = firstLevelDir;
        this.modulePath = modulePath;
    }
    static parse(url, allowNonMatching) {
        var match = RegExpWrapper.firstMatch(_ASSET_URL_RE, url);
        if (isPresent(match)) {
            return new _AssetUrl(match[1], match[2], match[3]);
        }
        if (allowNonMatching) {
            return null;
        }
        throw new BaseException(`Url ${url} is not a valid asset: url`);
    }
}
export function getRelativePath(modulePath, importedPath, importEnv) {
    var moduleParts = modulePath.split(_PATH_SEP_RE);
    var importedParts = importedPath.split(_PATH_SEP_RE);
    var longestPrefix = getLongestPathSegmentPrefix(moduleParts, importedParts);
    var resultParts = [];
    var goParentCount = moduleParts.length - 1 - longestPrefix;
    for (var i = 0; i < goParentCount; i++) {
        resultParts.push('..');
    }
    if (goParentCount <= 0 && importEnv === ImportEnv.JS) {
        resultParts.push('.');
    }
    for (var i = longestPrefix; i < importedParts.length; i++) {
        resultParts.push(importedParts[i]);
    }
    return resultParts.join(_PATH_SEP);
}
export function getLongestPathSegmentPrefix(arr1, arr2) {
    var prefixSize = 0;
    var minLen = Math.min(arr1.length, arr2.length);
    while (prefixSize < minLen && arr1[prefixSize] == arr2[prefixSize]) {
        prefixSize++;
    }
    return prefixSize;
}
