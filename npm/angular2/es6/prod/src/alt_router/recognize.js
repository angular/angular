import { RouteSegment, TreeNode, rootNode, RouteTree } from './segments';
import { RoutesMetadata } from './metadata/metadata';
import { isBlank, isPresent, stringify } from 'angular2/src/facade/lang';
import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { PromiseWrapper } from 'angular2/src/facade/promise';
import { BaseException } from 'angular2/src/facade/exceptions';
import { DEFAULT_OUTLET_NAME } from './constants';
import { reflector } from 'angular2/src/core/reflection/reflection';
// TODO: vsavkin: recognize should take the old tree and merge it
export function recognize(componentResolver, type, url) {
    let matched = new _MatchResult(type, [url.root], null, rootNode(url).children, []);
    return _constructSegment(componentResolver, matched).then(roots => new RouteTree(roots[0]));
}
function _recognize(componentResolver, parentType, url) {
    let metadata = _readMetadata(parentType); // should read from the factory instead
    if (isBlank(metadata)) {
        throw new BaseException(`Component '${stringify(parentType)}' does not have route configuration`);
    }
    let match;
    try {
        match = _match(metadata, url);
    }
    catch (e) {
        return PromiseWrapper.reject(e, null);
    }
    let main = _constructSegment(componentResolver, match);
    let aux = _recognizeMany(componentResolver, parentType, match.aux).then(_checkOutletNameUniqueness);
    return PromiseWrapper.all([main, aux]).then(ListWrapper.flatten);
}
function _recognizeMany(componentResolver, parentType, urls) {
    let recognized = urls.map(u => _recognize(componentResolver, parentType, u));
    return PromiseWrapper.all(recognized).then(ListWrapper.flatten);
}
function _constructSegment(componentResolver, matched) {
    return componentResolver.resolveComponent(matched.component)
        .then(factory => {
        let urlOutlet = matched.consumedUrlSegments.length === 0 ||
            isBlank(matched.consumedUrlSegments[0].outlet) ?
            DEFAULT_OUTLET_NAME :
            matched.consumedUrlSegments[0].outlet;
        let segment = new RouteSegment(matched.consumedUrlSegments, matched.parameters, urlOutlet, matched.component, factory);
        if (matched.leftOverUrl.length > 0) {
            return _recognizeMany(componentResolver, matched.component, matched.leftOverUrl)
                .then(children => [new TreeNode(segment, children)]);
        }
        else {
            return _recognizeLeftOvers(componentResolver, matched.component)
                .then(children => [new TreeNode(segment, children)]);
        }
    });
}
function _recognizeLeftOvers(componentResolver, parentType) {
    return componentResolver.resolveComponent(parentType)
        .then(factory => {
        let metadata = _readMetadata(parentType);
        if (isBlank(metadata)) {
            return [];
        }
        let r = metadata.routes.filter(r => r.path == "" || r.path == "/");
        if (r.length === 0) {
            return PromiseWrapper.resolve([]);
        }
        else {
            return _recognizeLeftOvers(componentResolver, r[0].component)
                .then(children => {
                return componentResolver.resolveComponent(r[0].component)
                    .then(factory => {
                    let segment = new RouteSegment([], null, DEFAULT_OUTLET_NAME, r[0].component, factory);
                    return [new TreeNode(segment, children)];
                });
            });
        }
    });
}
function _match(metadata, url) {
    for (let r of metadata.routes) {
        let matchingResult = _matchWithParts(r, url);
        if (isPresent(matchingResult)) {
            return matchingResult;
        }
    }
    let availableRoutes = metadata.routes.map(r => `'${r.path}'`).join(", ");
    throw new BaseException(`Cannot match any routes. Current segment: '${url.value}'. Available routes: [${availableRoutes}].`);
}
function _matchWithParts(route, url) {
    let path = route.path.startsWith("/") ? route.path.substring(1) : route.path;
    if (path == "*") {
        return new _MatchResult(route.component, [], null, [], []);
    }
    let parts = path.split("/");
    let positionalParams = {};
    let consumedUrlSegments = [];
    let lastParent = null;
    let lastSegment = null;
    let current = url;
    for (let i = 0; i < parts.length; ++i) {
        if (isBlank(current))
            return null;
        let p = parts[i];
        let isLastSegment = i === parts.length - 1;
        let isLastParent = i === parts.length - 2;
        let isPosParam = p.startsWith(":");
        if (!isPosParam && p != current.value.segment)
            return null;
        if (isLastSegment) {
            lastSegment = current;
        }
        if (isLastParent) {
            lastParent = current;
        }
        if (isPosParam) {
            positionalParams[p.substring(1)] = current.value.segment;
        }
        consumedUrlSegments.push(current.value);
        current = ListWrapper.first(current.children);
    }
    if (isPresent(current) && isBlank(current.value.segment)) {
        lastParent = lastSegment;
        lastSegment = current;
    }
    let p = lastSegment.value.parameters;
    let parameters = StringMapWrapper.merge(isBlank(p) ? {} : p, positionalParams);
    let axuUrlSubtrees = isPresent(lastParent) ? lastParent.children.slice(1) : [];
    return new _MatchResult(route.component, consumedUrlSegments, parameters, lastSegment.children, axuUrlSubtrees);
}
function _checkOutletNameUniqueness(nodes) {
    let names = {};
    nodes.forEach(n => {
        let segmentWithSameOutletName = names[n.value.outlet];
        if (isPresent(segmentWithSameOutletName)) {
            let p = segmentWithSameOutletName.stringifiedUrlSegments;
            let c = n.value.stringifiedUrlSegments;
            throw new BaseException(`Two segments cannot have the same outlet name: '${p}' and '${c}'.`);
        }
        names[n.value.outlet] = n.value;
    });
    return nodes;
}
class _MatchResult {
    constructor(component, consumedUrlSegments, parameters, leftOverUrl, aux) {
        this.component = component;
        this.consumedUrlSegments = consumedUrlSegments;
        this.parameters = parameters;
        this.leftOverUrl = leftOverUrl;
        this.aux = aux;
    }
}
function _readMetadata(componentType) {
    let metadata = reflector.annotations(componentType).filter(f => f instanceof RoutesMetadata);
    return ListWrapper.first(metadata);
}
