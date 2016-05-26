import { UrlTree, UrlSegment, equalUrlSegments } from './url_tree';
import { TreeNode, rootNode } from './utils/tree';
import { forEach, shallowEqual } from './utils/collection';
import { RouterState, ActivatedRoute } from './router_state';
import { Params, PRIMARY_OUTLET } from './shared';

export function createUrlTree(route: ActivatedRoute, urlTree: UrlTree, commands: any[], 
                              queryParameters: Params | undefined, fragment: string | undefined): UrlTree {
  if (commands.length === 0) {
    return tree(rootNode(urlTree), urlTree, queryParameters, fragment);
  }

  const normalizedCommands = normalizeCommands(commands);
  if (navigateToRoot(normalizedCommands)) {
    return tree(new TreeNode<UrlSegment>(urlTree.root, []), urlTree, queryParameters, fragment);
  }

  const startingNode = findStartingNode(normalizedCommands, urlTree, route);
  const updated = normalizedCommands.commands.length > 0 ?
      updateMany(startingNode.children.slice(0), normalizedCommands.commands) :
      [];
  const newRoot = constructNewTree(rootNode(urlTree), startingNode, updated);

  return tree(newRoot, urlTree, queryParameters, fragment);
}

function tree(root: TreeNode<UrlSegment>, urlTree: UrlTree, queryParameters: Params | undefined, fragment: string | undefined): UrlTree {
  const q = queryParameters ? stringify(queryParameters) : urlTree.queryParameters;
  const f = fragment ? fragment : urlTree.fragment;
  return new UrlTree(root, q, f);
}

function navigateToRoot(normalizedChange: NormalizedNavigationCommands): boolean {
  return normalizedChange.isAbsolute && normalizedChange.commands.length === 1 &&
    normalizedChange.commands[0] == "/";
}

class NormalizedNavigationCommands {
  constructor(public isAbsolute: boolean, public numberOfDoubleDots: number,
              public commands: any[]) {}
}

function normalizeCommands(commands: any[]): NormalizedNavigationCommands {
  if ((typeof commands[0] === "string") && commands.length === 1 && commands[0] == "/") {
    return new NormalizedNavigationCommands(true, 0, commands);
  }

  let numberOfDoubleDots = 0;
  let isAbsolute = false;
  const res = [];

  for (let i = 0; i < commands.length; ++i) {
    const c = commands[i];

    if (!(typeof c === "string")) {
      res.push(c);
      continue;
    }

    const parts = c.split('/');
    for (let j = 0; j < parts.length; ++j) {
      let cc = parts[j];

      // first exp is treated in a special way
      if (i == 0) {
        if (j == 0 && cc == ".") {  //  './a'
          // skip it
        } else if (j == 0 && cc == "") {  //  '/a'
          isAbsolute = true;
        } else if (cc == "..") {  //  '../a'
          numberOfDoubleDots++;
        } else if (cc != '') {
          res.push(cc);
        }

      } else {
        if (cc != '') {
          res.push(cc);
        }
      }
    }
  }

  return new NormalizedNavigationCommands(isAbsolute, numberOfDoubleDots, res);
}

function findStartingNode(normalizedChange: NormalizedNavigationCommands, urlTree: UrlTree,
                           route: ActivatedRoute): TreeNode<UrlSegment> {
  if (normalizedChange.isAbsolute) {
    return rootNode(urlTree);
  } else {
    const urlSegment =
      findUrlSegment(route, urlTree, normalizedChange.numberOfDoubleDots);
    return findMatchingNode(urlSegment, rootNode(urlTree));
  }
}

function findUrlSegment(route: ActivatedRoute, urlTree: UrlTree, numberOfDoubleDots: number): UrlSegment {
  const segments = (<any>route.urlSegments).value;
  const urlSegment = segments[segments.length - 1];
  const path = urlTree.pathFromRoot(urlSegment);
  if (path.length <= numberOfDoubleDots) {
    throw new Error("Invalid number of '../'");
  }
  return path[path.length - 1 - numberOfDoubleDots];
}

function findMatchingNode(segment: UrlSegment, node: TreeNode<UrlSegment>): TreeNode<UrlSegment> {
  if (node.value === segment) return node;
  for (let c of node.children) {
    const r = findMatchingNode(segment, c);
    if (r) return r;
  }
  throw new Error(`Cannot find url segment '${segment}'`);
}

function constructNewTree(node: TreeNode<UrlSegment>, original: TreeNode<UrlSegment>,
                          updated: TreeNode<UrlSegment>[]): TreeNode<UrlSegment> {
  if (node === original) {
    return new TreeNode<UrlSegment>(node.value, updated);
  } else {
    return new TreeNode<UrlSegment>(
      node.value, node.children.map(c => constructNewTree(c, original, updated)));
  }
}

function updateMany(nodes: TreeNode<UrlSegment>[], commands: any[]): TreeNode<UrlSegment>[] {
  const outlet = getOutlet(commands);
  const nodesInRightOutlet = nodes.filter(c => c.value.outlet === outlet);
  if (nodesInRightOutlet.length > 0) {
    const nodeRightOutlet = nodesInRightOutlet[0];  // there can be only one
    nodes[nodes.indexOf(nodeRightOutlet)] = update(nodeRightOutlet, commands);
  } else {
    nodes.push(update(null, commands));
  }
  return nodes;
}

function getPath(commands: any[]): any {
  if (!(typeof commands[0] === "string")) return commands[0];
  const parts = commands[0].toString().split(":");
  return parts.length > 1 ? parts[1] : commands[0];
}

function getOutlet(commands: any[]): string {
  if (!(typeof commands[0] === "string")) return PRIMARY_OUTLET;
  const parts = commands[0].toString().split(":");
  return parts.length > 1 ? parts[0] : PRIMARY_OUTLET;
}

function update(node: TreeNode<UrlSegment>|null, commands: any[]): TreeNode<UrlSegment> {
  const rest = commands.slice(1);
  const next = rest.length === 0 ? null : rest[0];
  const outlet = getOutlet(commands);
  const path = getPath(commands);

  // reach the end of the tree => create new tree nodes.
  if (!node && !(typeof next === 'object')) {
    const urlSegment = new UrlSegment(path, {}, outlet);
    const children = rest.length === 0 ? [] : [update(null, rest)];
    return new TreeNode<UrlSegment>(urlSegment, children);

  } else if (!node && typeof next === 'object') {
    const urlSegment = new UrlSegment(path, stringify(next), outlet);
    return recurse(urlSegment, node, rest.slice(1));

    // different outlet => preserve the subtree
  } else if (node && outlet !== node.value.outlet) {
    return node;

    // params command
  } else if (node && typeof path === 'object') {
    const newSegment = new UrlSegment(node.value.path, stringify(path), node.value.outlet);
    return recurse(newSegment, node, rest);

    // next one is a params command && can reuse the node
  } else if (node && typeof next === 'object' && compare(path, stringify(next), node.value)) {
    return recurse(node.value, node, rest.slice(1));

    // next one is a params command && cannot reuse the node
  } else if (node && typeof next === 'object') {
    const urlSegment = new UrlSegment(path, stringify(next), outlet);
    return recurse(urlSegment, node, rest.slice(1));

    // next one is not a params command && can reuse the node
  } else if (node && compare(path, {}, node.value)) {
    return recurse(node.value, node, rest);

    // next one is not a params command && cannot reuse the node
  } else {
    const urlSegment = new UrlSegment(path, {}, outlet);
    return recurse(urlSegment, node, rest);
  }
}

function stringify(params: {[key: string]: any}): {[key: string]: string} {
  const res = {};
  forEach(params, (v, k) => res[k] = v.toString());
  return res;
}

function compare(path: string, params: {[key: string]: any}, segment: UrlSegment): boolean {
  return path == segment.path && shallowEqual(params, segment.parameters);
}

function recurse(urlSegment: UrlSegment, node: TreeNode<UrlSegment> | null,
                  rest: any[]): TreeNode<UrlSegment> {
  if (rest.length === 0) {
    return new TreeNode<UrlSegment>(urlSegment, []);
  }
  const children = node ? node.children.slice(0) : [];
  return new TreeNode<UrlSegment>(urlSegment, updateMany(children, rest));
}