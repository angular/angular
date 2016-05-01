import { UrlSegment, TreeNode, rootNode, UrlTree } from './segments';
import { BaseException } from 'angular2/src/facade/exceptions';
import { isBlank, isPresent, RegExpWrapper } from 'angular2/src/facade/lang';
export class RouterUrlSerializer {
}
export class DefaultRouterUrlSerializer extends RouterUrlSerializer {
    parse(url) {
        let root = new _UrlParser().parse(url);
        return new UrlTree(root);
    }
    serialize(tree) { return _serializeUrlTreeNode(rootNode(tree)); }
}
function _serializeUrlTreeNode(node) {
    return `${node.value}${_serializeChildren(node)}`;
}
function _serializeUrlTreeNodes(nodes) {
    let main = nodes[0].value.toString();
    let auxNodes = nodes.slice(1);
    let aux = auxNodes.length > 0 ? `(${auxNodes.map(_serializeUrlTreeNode).join("//")})` : "";
    let children = _serializeChildren(nodes[0]);
    return `${main}${aux}${children}`;
}
function _serializeChildren(node) {
    if (node.children.length > 0) {
        let slash = isBlank(node.children[0].value.segment) ? "" : "/";
        return `${slash}${_serializeUrlTreeNodes(node.children)}`;
    }
    else {
        return "";
    }
}
var SEGMENT_RE = RegExpWrapper.create('^[^\\/\\(\\)\\?;=&#]+');
function matchUrlSegment(str) {
    var match = RegExpWrapper.firstMatch(SEGMENT_RE, str);
    return isPresent(match) ? match[0] : '';
}
var QUERY_PARAM_VALUE_RE = RegExpWrapper.create('^[^\\(\\)\\?;&#]+');
function matchUrlQueryParamValue(str) {
    var match = RegExpWrapper.firstMatch(QUERY_PARAM_VALUE_RE, str);
    return isPresent(match) ? match[0] : '';
}
class _UrlParser {
    peekStartsWith(str) { return this._remaining.startsWith(str); }
    capture(str) {
        if (!this._remaining.startsWith(str)) {
            throw new BaseException(`Expected "${str}".`);
        }
        this._remaining = this._remaining.substring(str.length);
    }
    parse(url) {
        this._remaining = url;
        if (url == '' || url == '/') {
            return new TreeNode(new UrlSegment('', null, null), []);
        }
        else {
            return this.parseRoot();
        }
    }
    parseRoot() {
        let segments = this.parseSegments();
        let queryParams = this.peekStartsWith('?') ? this.parseQueryParams() : null;
        return new TreeNode(new UrlSegment('', queryParams, null), segments);
    }
    parseSegments(outletName = null) {
        if (this._remaining.length == 0) {
            return [];
        }
        if (this.peekStartsWith('/')) {
            this.capture('/');
        }
        var path = matchUrlSegment(this._remaining);
        this.capture(path);
        if (path.indexOf(":") > -1) {
            let parts = path.split(":");
            outletName = parts[0];
            path = parts[1];
        }
        var matrixParams = null;
        if (this.peekStartsWith(';')) {
            matrixParams = this.parseMatrixParams();
        }
        var aux = [];
        if (this.peekStartsWith('(')) {
            aux = this.parseAuxiliaryRoutes();
        }
        var children = [];
        if (this.peekStartsWith('/') && !this.peekStartsWith('//')) {
            this.capture('/');
            children = this.parseSegments();
        }
        if (isPresent(matrixParams)) {
            let matrixParamsSegment = new UrlSegment(null, matrixParams, null);
            let matrixParamsNode = new TreeNode(matrixParamsSegment, children);
            let segment = new UrlSegment(path, null, outletName);
            return [new TreeNode(segment, [matrixParamsNode].concat(aux))];
        }
        else {
            let segment = new UrlSegment(path, null, outletName);
            let node = new TreeNode(segment, children);
            return [node].concat(aux);
        }
    }
    parseQueryParams() {
        var params = {};
        this.capture('?');
        this.parseQueryParam(params);
        while (this._remaining.length > 0 && this.peekStartsWith('&')) {
            this.capture('&');
            this.parseQueryParam(params);
        }
        return params;
    }
    parseMatrixParams() {
        var params = {};
        while (this._remaining.length > 0 && this.peekStartsWith(';')) {
            this.capture(';');
            this.parseParam(params);
        }
        return params;
    }
    parseParam(params) {
        var key = matchUrlSegment(this._remaining);
        if (isBlank(key)) {
            return;
        }
        this.capture(key);
        var value = "true";
        if (this.peekStartsWith('=')) {
            this.capture('=');
            var valueMatch = matchUrlSegment(this._remaining);
            if (isPresent(valueMatch)) {
                value = valueMatch;
                this.capture(value);
            }
        }
        params[key] = value;
    }
    parseQueryParam(params) {
        var key = matchUrlSegment(this._remaining);
        if (isBlank(key)) {
            return;
        }
        this.capture(key);
        var value = "true";
        if (this.peekStartsWith('=')) {
            this.capture('=');
            var valueMatch = matchUrlQueryParamValue(this._remaining);
            if (isPresent(valueMatch)) {
                value = valueMatch;
                this.capture(value);
            }
        }
        params[key] = value;
    }
    parseAuxiliaryRoutes() {
        var segments = [];
        this.capture('(');
        while (!this.peekStartsWith(')') && this._remaining.length > 0) {
            segments = segments.concat(this.parseSegments("aux"));
            if (this.peekStartsWith('//')) {
                this.capture('//');
            }
        }
        this.capture(')');
        return segments;
    }
}
