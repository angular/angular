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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsX3RyZWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXJsX3RyZWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEscUJBQStCLGNBQWMsQ0FBQyxDQUFBO0FBQzlDLDJCQUE2QixvQkFBb0IsQ0FBQyxDQUFBO0FBQ2xELHVCQUErQixVQUFVLENBQUMsQ0FBQTtBQUUxQztJQUNFLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLGVBQVEsQ0FBYSxJQUFJLFVBQVUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLHVCQUFjLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDckcsQ0FBQztBQUZlLDBCQUFrQixxQkFFakMsQ0FBQTtBQUtEO0lBQTZCLDJCQUFnQjtJQUMzQyxpQkFBWSxJQUEwQixFQUFTLGVBQXdDLEVBQVMsUUFBdUI7UUFDckgsa0JBQU0sSUFBSSxDQUFDLENBQUM7UUFEaUMsb0JBQWUsR0FBZixlQUFlLENBQXlCO1FBQVMsYUFBUSxHQUFSLFFBQVEsQ0FBZTtJQUV2SCxDQUFDO0lBQ0gsY0FBQztBQUFELENBQUMsQUFKRCxDQUE2QixXQUFJLEdBSWhDO0FBSlksZUFBTyxVQUluQixDQUFBO0FBRUQ7SUFDRSxvQkFBbUIsSUFBWSxFQUFTLFVBQW1DLEVBQVMsTUFBYztRQUEvRSxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVMsZUFBVSxHQUFWLFVBQVUsQ0FBeUI7UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFRO0lBQUcsQ0FBQztJQUV0Ryw2QkFBUSxHQUFSO1FBQ0UsSUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekMsTUFBTSxDQUFDLElBQUksQ0FBSSxJQUFJLFNBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUcsQ0FBQyxDQUFDO1lBQ2xELENBQUM7UUFDSCxDQUFDO1FBQ0QsSUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsTUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ3RFLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEtBQUssdUJBQWMsR0FBRyxFQUFFLEdBQU0sSUFBSSxDQUFDLE1BQU0sTUFBRyxDQUFDO1FBQ3ZFLE1BQU0sQ0FBQyxLQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLFlBQWMsQ0FBQztJQUNoRCxDQUFDO0lBQ0gsaUJBQUM7QUFBRCxDQUFDLEFBZEQsSUFjQztBQWRZLGtCQUFVLGFBY3RCLENBQUE7QUFFRCwwQkFBaUMsQ0FBZSxFQUFFLENBQWU7SUFDL0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUN4QyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNsQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQzFDLEVBQUUsQ0FBQyxDQUFDLENBQUMseUJBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDcEUsQ0FBQztJQUNELE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBUGUsd0JBQWdCLG1CQU8vQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVHJlZSwgVHJlZU5vZGUgfSBmcm9tICcuL3V0aWxzL3RyZWUnO1xuaW1wb3J0IHsgc2hhbGxvd0VxdWFsIH0gZnJvbSAnLi91dGlscy9jb2xsZWN0aW9uJztcbmltcG9ydCB7IFBSSU1BUllfT1VUTEVUIH0gZnJvbSAnLi9zaGFyZWQnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRW1wdHlVcmxUcmVlKCkge1xuICByZXR1cm4gbmV3IFVybFRyZWUobmV3IFRyZWVOb2RlPFVybFNlZ21lbnQ+KG5ldyBVcmxTZWdtZW50KFwiXCIsIHt9LCBQUklNQVJZX09VVExFVCksIFtdKSwge30sIG51bGwpO1xufVxuXG4vKipcbiAqIEEgVVJMIGluIHRoZSB0cmVlIGZvcm0uXG4gKi9cbmV4cG9ydCBjbGFzcyBVcmxUcmVlIGV4dGVuZHMgVHJlZTxVcmxTZWdtZW50PiB7XG4gIGNvbnN0cnVjdG9yKHJvb3Q6IFRyZWVOb2RlPFVybFNlZ21lbnQ+LCBwdWJsaWMgcXVlcnlQYXJhbWV0ZXJzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSwgcHVibGljIGZyYWdtZW50OiBzdHJpbmcgfCBudWxsKSB7XG4gICAgc3VwZXIocm9vdCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFVybFNlZ21lbnQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcGF0aDogc3RyaW5nLCBwdWJsaWMgcGFyYW1ldGVyczoge1trZXk6IHN0cmluZ106IHN0cmluZ30sIHB1YmxpYyBvdXRsZXQ6IHN0cmluZykge31cblxuICB0b1N0cmluZygpIHtcbiAgICBjb25zdCBwYXJhbXMgPSBbXTtcbiAgICBmb3IgKGxldCBwcm9wIGluIHRoaXMucGFyYW1ldGVycykge1xuICAgICAgaWYgKHRoaXMucGFyYW1ldGVycy5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICBwYXJhbXMucHVzaChgJHtwcm9wfT0ke3RoaXMucGFyYW1ldGVyc1twcm9wXX1gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcGFyYW1zU3RyaW5nID0gcGFyYW1zLmxlbmd0aCA+IDAgPyBgKCR7cGFyYW1zLmpvaW4oJywnKX0pYCA6ICcnO1xuICAgIGNvbnN0IG91dGxldCA9IHRoaXMub3V0bGV0ID09PSBQUklNQVJZX09VVExFVCA/ICcnIDogYCR7dGhpcy5vdXRsZXR9OmA7XG4gICAgcmV0dXJuIGAke291dGxldH0ke3RoaXMucGF0aH0ke3BhcmFtc1N0cmluZ31gO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbFVybFNlZ21lbnRzKGE6IFVybFNlZ21lbnRbXSwgYjogVXJsU2VnbWVudFtdKTogYm9vbGVhbiB7XG4gIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKGFbaV0ucGF0aCAhPT0gYltpXS5wYXRoKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKCFzaGFsbG93RXF1YWwoYVtpXS5wYXJhbWV0ZXJzLCBiW2ldLnBhcmFtZXRlcnMpKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG4iXX0=