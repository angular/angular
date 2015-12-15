'use strict';var lang_1 = require('angular2/src/facade/lang');
var MODULE_REGEXP = /#MODULE\[([^\]]*)\]/g;
function moduleRef(moduleUrl) {
    return "#MODULE[" + moduleUrl + "]";
}
exports.moduleRef = moduleRef;
/**
 * Represents generated source code with module references. Internal to the Angular compiler.
 */
var SourceModule = (function () {
    function SourceModule(moduleUrl, sourceWithModuleRefs) {
        this.moduleUrl = moduleUrl;
        this.sourceWithModuleRefs = sourceWithModuleRefs;
    }
    SourceModule.prototype.getSourceWithImports = function () {
        var _this = this;
        var moduleAliases = {};
        var imports = [];
        var newSource = lang_1.StringWrapper.replaceAllMapped(this.sourceWithModuleRefs, MODULE_REGEXP, function (match) {
            var moduleUrl = match[1];
            var alias = moduleAliases[moduleUrl];
            if (lang_1.isBlank(alias)) {
                if (moduleUrl == _this.moduleUrl) {
                    alias = '';
                }
                else {
                    alias = "import" + imports.length;
                    imports.push([moduleUrl, alias]);
                }
                moduleAliases[moduleUrl] = alias;
            }
            return alias.length > 0 ? alias + "." : '';
        });
        return new SourceWithImports(newSource, imports);
    };
    return SourceModule;
})();
exports.SourceModule = SourceModule;
var SourceExpression = (function () {
    function SourceExpression(declarations, expression) {
        this.declarations = declarations;
        this.expression = expression;
    }
    return SourceExpression;
})();
exports.SourceExpression = SourceExpression;
var SourceExpressions = (function () {
    function SourceExpressions(declarations, expressions) {
        this.declarations = declarations;
        this.expressions = expressions;
    }
    return SourceExpressions;
})();
exports.SourceExpressions = SourceExpressions;
/**
 * Represents generated source code with imports. Internal to the Angular compiler.
 */
var SourceWithImports = (function () {
    function SourceWithImports(source, imports) {
        this.source = source;
        this.imports = imports;
    }
    return SourceWithImports;
})();
exports.SourceWithImports = SourceWithImports;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlX21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21waWxlci9zb3VyY2VfbW9kdWxlLnRzIl0sIm5hbWVzIjpbIm1vZHVsZVJlZiIsIlNvdXJjZU1vZHVsZSIsIlNvdXJjZU1vZHVsZS5jb25zdHJ1Y3RvciIsIlNvdXJjZU1vZHVsZS5nZXRTb3VyY2VXaXRoSW1wb3J0cyIsIlNvdXJjZUV4cHJlc3Npb24iLCJTb3VyY2VFeHByZXNzaW9uLmNvbnN0cnVjdG9yIiwiU291cmNlRXhwcmVzc2lvbnMiLCJTb3VyY2VFeHByZXNzaW9ucy5jb25zdHJ1Y3RvciIsIlNvdXJjZVdpdGhJbXBvcnRzIiwiU291cmNlV2l0aEltcG9ydHMuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiJBQUFBLHFCQUFxQywwQkFBMEIsQ0FBQyxDQUFBO0FBRWhFLElBQUksYUFBYSxHQUFHLHNCQUFzQixDQUFDO0FBRTNDLG1CQUEwQixTQUFTO0lBQ2pDQSxNQUFNQSxDQUFDQSxhQUFXQSxTQUFTQSxNQUFHQSxDQUFDQTtBQUNqQ0EsQ0FBQ0E7QUFGZSxpQkFBUyxZQUV4QixDQUFBO0FBRUQ7O0dBRUc7QUFDSDtJQUNFQyxzQkFBbUJBLFNBQWlCQSxFQUFTQSxvQkFBNEJBO1FBQXREQyxjQUFTQSxHQUFUQSxTQUFTQSxDQUFRQTtRQUFTQSx5QkFBb0JBLEdBQXBCQSxvQkFBb0JBLENBQVFBO0lBQUdBLENBQUNBO0lBRTdFRCwyQ0FBb0JBLEdBQXBCQTtRQUFBRSxpQkFtQkNBO1FBbEJDQSxJQUFJQSxhQUFhQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUN2QkEsSUFBSUEsT0FBT0EsR0FBZUEsRUFBRUEsQ0FBQ0E7UUFDN0JBLElBQUlBLFNBQVNBLEdBQ1RBLG9CQUFhQSxDQUFDQSxnQkFBZ0JBLENBQUNBLElBQUlBLENBQUNBLG9CQUFvQkEsRUFBRUEsYUFBYUEsRUFBRUEsVUFBQ0EsS0FBS0E7WUFDN0VBLElBQUlBLFNBQVNBLEdBQUdBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3pCQSxJQUFJQSxLQUFLQSxHQUFHQSxhQUFhQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtZQUNyQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25CQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxJQUFJQSxLQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDaENBLEtBQUtBLEdBQUdBLEVBQUVBLENBQUNBO2dCQUNiQSxDQUFDQTtnQkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0JBQ05BLEtBQUtBLEdBQUdBLFdBQVNBLE9BQU9BLENBQUNBLE1BQVFBLENBQUNBO29CQUNsQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25DQSxDQUFDQTtnQkFDREEsYUFBYUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsS0FBS0EsQ0FBQ0E7WUFDbkNBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLEdBQU1BLEtBQUtBLE1BQUdBLEdBQUdBLEVBQUVBLENBQUNBO1FBQzdDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxpQkFBaUJBLENBQUNBLFNBQVNBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO0lBQ25EQSxDQUFDQTtJQUNIRixtQkFBQ0E7QUFBREEsQ0FBQ0EsQUF2QkQsSUF1QkM7QUF2Qlksb0JBQVksZUF1QnhCLENBQUE7QUFFRDtJQUNFRywwQkFBbUJBLFlBQXNCQSxFQUFTQSxVQUFrQkE7UUFBakRDLGlCQUFZQSxHQUFaQSxZQUFZQSxDQUFVQTtRQUFTQSxlQUFVQSxHQUFWQSxVQUFVQSxDQUFRQTtJQUFHQSxDQUFDQTtJQUMxRUQsdUJBQUNBO0FBQURBLENBQUNBLEFBRkQsSUFFQztBQUZZLHdCQUFnQixtQkFFNUIsQ0FBQTtBQUVEO0lBQ0VFLDJCQUFtQkEsWUFBc0JBLEVBQVNBLFdBQXFCQTtRQUFwREMsaUJBQVlBLEdBQVpBLFlBQVlBLENBQVVBO1FBQVNBLGdCQUFXQSxHQUFYQSxXQUFXQSxDQUFVQTtJQUFHQSxDQUFDQTtJQUM3RUQsd0JBQUNBO0FBQURBLENBQUNBLEFBRkQsSUFFQztBQUZZLHlCQUFpQixvQkFFN0IsQ0FBQTtBQUVEOztHQUVHO0FBQ0g7SUFDRUUsMkJBQW1CQSxNQUFjQSxFQUFTQSxPQUFtQkE7UUFBMUNDLFdBQU1BLEdBQU5BLE1BQU1BLENBQVFBO1FBQVNBLFlBQU9BLEdBQVBBLE9BQU9BLENBQVlBO0lBQUdBLENBQUNBO0lBQ25FRCx3QkFBQ0E7QUFBREEsQ0FBQ0EsQUFGRCxJQUVDO0FBRlkseUJBQWlCLG9CQUU3QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtTdHJpbmdXcmFwcGVyLCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG52YXIgTU9EVUxFX1JFR0VYUCA9IC8jTU9EVUxFXFxbKFteXFxdXSopXFxdL2c7XG5cbmV4cG9ydCBmdW5jdGlvbiBtb2R1bGVSZWYobW9kdWxlVXJsKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAjTU9EVUxFWyR7bW9kdWxlVXJsfV1gO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgZ2VuZXJhdGVkIHNvdXJjZSBjb2RlIHdpdGggbW9kdWxlIHJlZmVyZW5jZXMuIEludGVybmFsIHRvIHRoZSBBbmd1bGFyIGNvbXBpbGVyLlxuICovXG5leHBvcnQgY2xhc3MgU291cmNlTW9kdWxlIHtcbiAgY29uc3RydWN0b3IocHVibGljIG1vZHVsZVVybDogc3RyaW5nLCBwdWJsaWMgc291cmNlV2l0aE1vZHVsZVJlZnM6IHN0cmluZykge31cblxuICBnZXRTb3VyY2VXaXRoSW1wb3J0cygpOiBTb3VyY2VXaXRoSW1wb3J0cyB7XG4gICAgdmFyIG1vZHVsZUFsaWFzZXMgPSB7fTtcbiAgICB2YXIgaW1wb3J0czogc3RyaW5nW11bXSA9IFtdO1xuICAgIHZhciBuZXdTb3VyY2UgPVxuICAgICAgICBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGxNYXBwZWQodGhpcy5zb3VyY2VXaXRoTW9kdWxlUmVmcywgTU9EVUxFX1JFR0VYUCwgKG1hdGNoKSA9PiB7XG4gICAgICAgICAgdmFyIG1vZHVsZVVybCA9IG1hdGNoWzFdO1xuICAgICAgICAgIHZhciBhbGlhcyA9IG1vZHVsZUFsaWFzZXNbbW9kdWxlVXJsXTtcbiAgICAgICAgICBpZiAoaXNCbGFuayhhbGlhcykpIHtcbiAgICAgICAgICAgIGlmIChtb2R1bGVVcmwgPT0gdGhpcy5tb2R1bGVVcmwpIHtcbiAgICAgICAgICAgICAgYWxpYXMgPSAnJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGFsaWFzID0gYGltcG9ydCR7aW1wb3J0cy5sZW5ndGh9YDtcbiAgICAgICAgICAgICAgaW1wb3J0cy5wdXNoKFttb2R1bGVVcmwsIGFsaWFzXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtb2R1bGVBbGlhc2VzW21vZHVsZVVybF0gPSBhbGlhcztcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGFsaWFzLmxlbmd0aCA+IDAgPyBgJHthbGlhc30uYCA6ICcnO1xuICAgICAgICB9KTtcbiAgICByZXR1cm4gbmV3IFNvdXJjZVdpdGhJbXBvcnRzKG5ld1NvdXJjZSwgaW1wb3J0cyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNvdXJjZUV4cHJlc3Npb24ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZGVjbGFyYXRpb25zOiBzdHJpbmdbXSwgcHVibGljIGV4cHJlc3Npb246IHN0cmluZykge31cbn1cblxuZXhwb3J0IGNsYXNzIFNvdXJjZUV4cHJlc3Npb25zIHtcbiAgY29uc3RydWN0b3IocHVibGljIGRlY2xhcmF0aW9uczogc3RyaW5nW10sIHB1YmxpYyBleHByZXNzaW9uczogc3RyaW5nW10pIHt9XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBnZW5lcmF0ZWQgc291cmNlIGNvZGUgd2l0aCBpbXBvcnRzLiBJbnRlcm5hbCB0byB0aGUgQW5ndWxhciBjb21waWxlci5cbiAqL1xuZXhwb3J0IGNsYXNzIFNvdXJjZVdpdGhJbXBvcnRzIHtcbiAgY29uc3RydWN0b3IocHVibGljIHNvdXJjZTogc3RyaW5nLCBwdWJsaWMgaW1wb3J0czogc3RyaW5nW11bXSkge31cbn1cbiJdfQ==