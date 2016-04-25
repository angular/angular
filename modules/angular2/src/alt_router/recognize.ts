import {RouteSegment, UrlSegment, Tree, TreeNode, rootNode} from './segments';
import {RoutesMetadata, RouteMetadata} from './metadata/metadata';
import {Type, isBlank, isPresent, stringify} from 'angular2/src/facade/lang';
import {ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {PromiseWrapper} from 'angular2/src/facade/promise';
import {BaseException} from 'angular2/src/facade/exceptions';
import {ComponentResolver} from 'angular2/core';
import {DEFAULT_OUTLET_NAME} from './constants';
import {reflector} from 'angular2/src/core/reflection/reflection';

export function recognize(componentResolver: ComponentResolver, type: Type,
                          url: Tree<UrlSegment>): Promise<Tree<RouteSegment>> {
  return componentResolver.resolveComponent(type).then(factory => {
    let segment =
        new RouteSegment([url.root], url.root.parameters, DEFAULT_OUTLET_NAME, type, factory);
    return _recognizeMany(componentResolver, type, rootNode(url).children)
        .then(children => new Tree<RouteSegment>(new TreeNode<RouteSegment>(segment, children)));
  });
}

function _recognize(componentResolver: ComponentResolver, parentType: Type,
                    url: TreeNode<UrlSegment>): Promise<TreeNode<RouteSegment>[]> {
  let metadata = _readMetadata(parentType);  // should read from the factory instead

  let match;
  try {
    match = _match(metadata, url);
  } catch (e) {
    return PromiseWrapper.reject(e, null);
  }

  let main = _constructSegment(componentResolver, match);
  let aux =
      _recognizeMany(componentResolver, parentType, match.aux).then(_checkOutletNameUniqueness);
  return PromiseWrapper.all([main, aux]).then(ListWrapper.flatten);
}

function _recognizeMany(componentResolver: ComponentResolver, parentType: Type,
                        urls: TreeNode<UrlSegment>[]): Promise<TreeNode<RouteSegment>[]> {
  let recognized = urls.map(u => _recognize(componentResolver, parentType, u));
  return PromiseWrapper.all(recognized).then(ListWrapper.flatten);
}

function _constructSegment(componentResolver: ComponentResolver,
                           matched: _MatchResult): Promise<TreeNode<RouteSegment>[]> {
  return componentResolver.resolveComponent(matched.route.component)
      .then(factory => {
        let segment = new RouteSegment(matched.consumedUrlSegments, matched.parameters,
                                       matched.consumedUrlSegments[0].outlet,
                                       matched.route.component, factory);

        if (isPresent(matched.leftOverUrl)) {
          return _recognize(componentResolver, matched.route.component, matched.leftOverUrl)
              .then(children => [new TreeNode<RouteSegment>(segment, children)]);
        } else {
          return [new TreeNode<RouteSegment>(segment, [])];
        }
      });
}

function _match(metadata: RoutesMetadata, url: TreeNode<UrlSegment>): _MatchResult {
  for (let r of metadata.routes) {
    let matchingResult = _matchWithParts(r, url);
    if (isPresent(matchingResult)) {
      return matchingResult;
    }
  }
  throw new BaseException("Cannot match any routes");
}

function _matchWithParts(route: RouteMetadata, url: TreeNode<UrlSegment>): _MatchResult {
  let parts = route.path.split("/");
  let positionalParams = {};
  let consumedUrlSegments = [];

  let lastParent: TreeNode<UrlSegment> = null;
  let lastSegment: TreeNode<UrlSegment> = null;

  let current = url;
  for (let i = 0; i < parts.length; ++i) {
    let p = parts[i];
    let isLastSegment = i === parts.length - 1;
    let isLastParent = i === parts.length - 2;
    let isPosParam = p.startsWith(":");

    if (isBlank(current)) return null;
    if (!isPosParam && p != current.value.segment) return null;
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

  let parameters = <{[key: string]: string}>StringMapWrapper.merge(lastSegment.value.parameters,
                                                                   positionalParams);
  let axuUrlSubtrees = isPresent(lastParent) ? lastParent.children.slice(1) : [];
  return new _MatchResult(route, consumedUrlSegments, parameters, current, axuUrlSubtrees);
}

function _checkOutletNameUniqueness(nodes: TreeNode<RouteSegment>[]): TreeNode<RouteSegment>[] {
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
  constructor(public route: RouteMetadata, public consumedUrlSegments: UrlSegment[],
              public parameters: {[key: string]: string}, public leftOverUrl: TreeNode<UrlSegment>,
              public aux: TreeNode<UrlSegment>[]) {}
}

function _readMetadata(componentType: Type) {
  let metadata = reflector.annotations(componentType).filter(f => f instanceof RoutesMetadata);
  if (metadata.length === 0) {
    throw new BaseException(
        `Component '${stringify(componentType)}' does not have route configuration`);
  }
  return metadata[0];
}