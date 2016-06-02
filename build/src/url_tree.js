"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var tree_1 = require('./utils/tree');
var collection_1 = require('./utils/collection');
var shared_1 = require('./shared');
function createEmptyUrlTree() {
    return new UrlTree(new tree_1.TreeNode(new UrlSegment("", {}, shared_1.PRIMARY_OUTLET), []), {}, null);
}
exports.createEmptyUrlTree = createEmptyUrlTree;
var UrlTree = (function (_super) {
    __extends(UrlTree, _super);
    function UrlTree(root, queryParameters, fragment) {
        _super.call(this, root);
        this.queryParameters = queryParameters;
        this.fragment = fragment;
    }
    return UrlTree;
}(tree_1.Tree));
exports.UrlTree = UrlTree;
var UrlSegment = (function () {
    function UrlSegment(path, parameters, outlet) {
        this.path = path;
        this.parameters = parameters;
        this.outlet = outlet;
    }
    UrlSegment.prototype.toString = function () {
        var params = [];
        for (var prop in this.parameters) {
            if (this.parameters.hasOwnProperty(prop)) {
                params.push(prop + "=" + this.parameters[prop]);
            }
        }
        var paramsString = params.length > 0 ? "(" + params.join(',') + ")" : '';
        var outlet = this.outlet === shared_1.PRIMARY_OUTLET ? '' : this.outlet + ":";
        return "" + outlet + this.path + paramsString;
    };
    return UrlSegment;
}());
exports.UrlSegment = UrlSegment;
function equalUrlSegments(a, b) {
    if (a.length !== b.length)
        return false;
    for (var i = 0; i < a.length; ++i) {
        if (a[i].path !== b[i].path)
            return false;
        if (!collection_1.shallowEqual(a[i].parameters, b[i].parameters))
            return false;
    }
    return true;
}
exports.equalUrlSegments = equalUrlSegments;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsX3RyZWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXJsX3RyZWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEscUJBQStCLGNBQWMsQ0FBQyxDQUFBO0FBQzlDLDJCQUE2QixvQkFBb0IsQ0FBQyxDQUFBO0FBQ2xELHVCQUErQixVQUFVLENBQUMsQ0FBQTtBQUUxQztJQUNFLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLGVBQVEsQ0FBYSxJQUFJLFVBQVUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLHVCQUFjLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDckcsQ0FBQztBQUZlLDBCQUFrQixxQkFFakMsQ0FBQTtBQUtEO0lBQTZCLDJCQUFnQjtJQUkzQyxpQkFBWSxJQUEwQixFQUFTLGVBQXdDLEVBQVMsUUFBdUI7UUFDckgsa0JBQU0sSUFBSSxDQUFDLENBQUM7UUFEaUMsb0JBQWUsR0FBZixlQUFlLENBQXlCO1FBQVMsYUFBUSxHQUFSLFFBQVEsQ0FBZTtJQUV2SCxDQUFDO0lBQ0gsY0FBQztBQUFELENBQUMsQUFQRCxDQUE2QixXQUFJLEdBT2hDO0FBUFksZUFBTyxVQU9uQixDQUFBO0FBRUQ7SUFJRSxvQkFBbUIsSUFBWSxFQUFTLFVBQW1DLEVBQVMsTUFBYztRQUEvRSxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVMsZUFBVSxHQUFWLFVBQVUsQ0FBeUI7UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFRO0lBQUcsQ0FBQztJQUV0Ryw2QkFBUSxHQUFSO1FBQ0UsSUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekMsTUFBTSxDQUFDLElBQUksQ0FBSSxJQUFJLFNBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUcsQ0FBQyxDQUFDO1lBQ2xELENBQUM7UUFDSCxDQUFDO1FBQ0QsSUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsTUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ3RFLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEtBQUssdUJBQWMsR0FBRyxFQUFFLEdBQU0sSUFBSSxDQUFDLE1BQU0sTUFBRyxDQUFDO1FBQ3ZFLE1BQU0sQ0FBQyxLQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLFlBQWMsQ0FBQztJQUNoRCxDQUFDO0lBQ0gsaUJBQUM7QUFBRCxDQUFDLEFBakJELElBaUJDO0FBakJZLGtCQUFVLGFBaUJ0QixDQUFBO0FBRUQsMEJBQWlDLENBQWUsRUFBRSxDQUFlO0lBQy9ELEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDeEMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDbEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUMxQyxFQUFFLENBQUMsQ0FBQyxDQUFDLHlCQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ3BFLENBQUM7SUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQVBlLHdCQUFnQixtQkFPL0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRyZWUsIFRyZWVOb2RlIH0gZnJvbSAnLi91dGlscy90cmVlJztcbmltcG9ydCB7IHNoYWxsb3dFcXVhbCB9IGZyb20gJy4vdXRpbHMvY29sbGVjdGlvbic7XG5pbXBvcnQgeyBQUklNQVJZX09VVExFVCB9IGZyb20gJy4vc2hhcmVkJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVtcHR5VXJsVHJlZSgpIHtcbiAgcmV0dXJuIG5ldyBVcmxUcmVlKG5ldyBUcmVlTm9kZTxVcmxTZWdtZW50PihuZXcgVXJsU2VnbWVudChcIlwiLCB7fSwgUFJJTUFSWV9PVVRMRVQpLCBbXSksIHt9LCBudWxsKTtcbn1cblxuLyoqXG4gKiBBIFVSTCBpbiB0aGUgdHJlZSBmb3JtLlxuICovXG5leHBvcnQgY2xhc3MgVXJsVHJlZSBleHRlbmRzIFRyZWU8VXJsU2VnbWVudD4ge1xuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihyb290OiBUcmVlTm9kZTxVcmxTZWdtZW50PiwgcHVibGljIHF1ZXJ5UGFyYW1ldGVyczoge1trZXk6IHN0cmluZ106IHN0cmluZ30sIHB1YmxpYyBmcmFnbWVudDogc3RyaW5nIHwgbnVsbCkge1xuICAgIHN1cGVyKHJvb3QpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBVcmxTZWdtZW50IHtcbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgY29uc3RydWN0b3IocHVibGljIHBhdGg6IHN0cmluZywgcHVibGljIHBhcmFtZXRlcnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LCBwdWJsaWMgb3V0bGV0OiBzdHJpbmcpIHt9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgY29uc3QgcGFyYW1zID0gW107XG4gICAgZm9yIChsZXQgcHJvcCBpbiB0aGlzLnBhcmFtZXRlcnMpIHtcbiAgICAgIGlmICh0aGlzLnBhcmFtZXRlcnMuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgcGFyYW1zLnB1c2goYCR7cHJvcH09JHt0aGlzLnBhcmFtZXRlcnNbcHJvcF19YCk7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHBhcmFtc1N0cmluZyA9IHBhcmFtcy5sZW5ndGggPiAwID8gYCgke3BhcmFtcy5qb2luKCcsJyl9KWAgOiAnJztcbiAgICBjb25zdCBvdXRsZXQgPSB0aGlzLm91dGxldCA9PT0gUFJJTUFSWV9PVVRMRVQgPyAnJyA6IGAke3RoaXMub3V0bGV0fTpgO1xuICAgIHJldHVybiBgJHtvdXRsZXR9JHt0aGlzLnBhdGh9JHtwYXJhbXNTdHJpbmd9YDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxVcmxTZWdtZW50cyhhOiBVcmxTZWdtZW50W10sIGI6IFVybFNlZ21lbnRbXSk6IGJvb2xlYW4ge1xuICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYS5sZW5ndGg7ICsraSkge1xuICAgIGlmIChhW2ldLnBhdGggIT09IGJbaV0ucGF0aCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmICghc2hhbGxvd0VxdWFsKGFbaV0ucGFyYW1ldGVycywgYltpXS5wYXJhbWV0ZXJzKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuIl19