import { TreeNode, UrlSegment, rootNode, UrlTree } from './segments';
import { isBlank, isPresent, isString, isStringMap } from 'angular2/src/facade/lang';
import { ListWrapper } from 'angular2/src/facade/collection';
export function link(segment, routeTree, urlTree, change) {
    if (change.length === 0)
        return urlTree;
    let startingNode;
    let normalizedChange;
    if (isString(change[0]) && change[0].startsWith("./")) {
        normalizedChange = ["/", change[0].substring(2)].concat(change.slice(1));
        startingNode = _findStartingNode(_findUrlSegment(segment, routeTree), rootNode(urlTree));
    }
    else if (isString(change[0]) && change.length === 1 && change[0] == "/") {
        normalizedChange = change;
        startingNode = rootNode(urlTree);
    }
    else if (isString(change[0]) && !change[0].startsWith("/")) {
        normalizedChange = ["/"].concat(change);
        startingNode = _findStartingNode(_findUrlSegment(segment, routeTree), rootNode(urlTree));
    }
    else {
        normalizedChange = ["/"].concat(change);
        startingNode = rootNode(urlTree);
    }
    let updated = _update(startingNode, normalizedChange);
    let newRoot = _constructNewTree(rootNode(urlTree), startingNode, updated);
    return new UrlTree(newRoot);
}
function _findUrlSegment(segment, routeTree) {
    let s = segment;
    let res = null;
    while (isBlank(res)) {
        res = ListWrapper.last(s.urlSegments);
        s = routeTree.parent(s);
    }
    return res;
}
function _findStartingNode(segment, node) {
    if (node.value === segment)
        return node;
    for (var c of node.children) {
        let r = _findStartingNode(segment, c);
        if (isPresent(r))
            return r;
    }
    return null;
}
function _constructNewTree(node, original, updated) {
    if (node === original) {
        return new TreeNode(node.value, updated.children);
    }
    else {
        return new TreeNode(node.value, node.children.map(c => _constructNewTree(c, original, updated)));
    }
}
function _update(node, changes) {
    let rest = changes.slice(1);
    let outlet = _outlet(changes);
    let segment = _segment(changes);
    if (isString(segment) && segment[0] == "/")
        segment = segment.substring(1);
    // reach the end of the tree => create new tree nodes.
    if (isBlank(node)) {
        let urlSegment = new UrlSegment(segment, null, outlet);
        let children = rest.length === 0 ? [] : [_update(null, rest)];
        return new TreeNode(urlSegment, children);
    }
    else if (outlet != node.value.outlet) {
        return node;
    }
    else {
        let urlSegment = isStringMap(segment) ? new UrlSegment(null, segment, null) :
            new UrlSegment(segment, null, outlet);
        if (rest.length === 0) {
            return new TreeNode(urlSegment, []);
        }
        return new TreeNode(urlSegment, _updateMany(ListWrapper.clone(node.children), rest));
    }
}
function _updateMany(nodes, changes) {
    let outlet = _outlet(changes);
    let nodesInRightOutlet = nodes.filter(c => c.value.outlet == outlet);
    if (nodesInRightOutlet.length > 0) {
        let nodeRightOutlet = nodesInRightOutlet[0]; // there can be only one
        nodes[nodes.indexOf(nodeRightOutlet)] = _update(nodeRightOutlet, changes);
    }
    else {
        nodes.push(_update(null, changes));
    }
    return nodes;
}
function _segment(changes) {
    if (!isString(changes[0]))
        return changes[0];
    let parts = changes[0].toString().split(":");
    return parts.length > 1 ? parts[1] : changes[0];
}
function _outlet(changes) {
    if (!isString(changes[0]))
        return null;
    let parts = changes[0].toString().split(":");
    return parts.length > 1 ? parts[0] : null;
}
