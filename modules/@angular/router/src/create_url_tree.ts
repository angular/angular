/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ActivatedRoute} from './router_state';
import {PRIMARY_OUTLET, Params} from './shared';
import {UrlPathWithParams, UrlSegment, UrlTree} from './url_tree';
import {forEach, shallowEqual} from './utils/collection';

export function createUrlTree(
    route: ActivatedRoute, urlTree: UrlTree, commands: any[], queryParams: Params,
    fragment: string): UrlTree {
  if (commands.length === 0) {
    return tree(urlTree.root, urlTree.root, urlTree, queryParams, fragment);
  }

  const normalizedCommands = normalizeCommands(commands);
  validateCommands(normalizedCommands);

  if (navigateToRoot(normalizedCommands)) {
    return tree(urlTree.root, new UrlSegment([], {}), urlTree, queryParams, fragment);
  }

  const startingPosition = findStartingPosition(normalizedCommands, urlTree, route);
  const segment = startingPosition.processChildren ?
      updateSegmentChildren(
          startingPosition.segment, startingPosition.index, normalizedCommands.commands) :
      updateSegment(startingPosition.segment, startingPosition.index, normalizedCommands.commands);
  return tree(startingPosition.segment, segment, urlTree, queryParams, fragment);
}

function validateCommands(n: NormalizedNavigationCommands): void {
  if (n.isAbsolute && n.commands.length > 0 && (typeof n.commands[0] === 'object')) {
    throw new Error('Root segment cannot have matrix parameters');
  }
}

function tree(
    oldSegment: UrlSegment, newSegment: UrlSegment, urlTree: UrlTree, queryParams: Params,
    fragment: string): UrlTree {
  const q = queryParams ? stringify(queryParams) : urlTree.queryParams;
  const f = fragment ? fragment : urlTree.fragment;

  if (urlTree.root === oldSegment) {
    return new UrlTree(newSegment, q, f);
  } else {
    return new UrlTree(replaceSegment(urlTree.root, oldSegment, newSegment), q, f);
  }
}

function replaceSegment(
    current: UrlSegment, oldSegment: UrlSegment, newSegment: UrlSegment): UrlSegment {
  const children: {[key: string]: UrlSegment} = {};
  forEach(current.children, (c: UrlSegment, outletName: string) => {
    if (c === oldSegment) {
      children[outletName] = newSegment;
    } else {
      children[outletName] = replaceSegment(c, oldSegment, newSegment);
    }
  });
  return new UrlSegment(current.pathsWithParams, children);
}

function navigateToRoot(normalizedChange: NormalizedNavigationCommands): boolean {
  return normalizedChange.isAbsolute && normalizedChange.commands.length === 1 &&
      normalizedChange.commands[0] == '/';
}

class NormalizedNavigationCommands {
  constructor(
      public isAbsolute: boolean, public numberOfDoubleDots: number, public commands: any[]) {}
}

function normalizeCommands(commands: any[]): NormalizedNavigationCommands {
  if ((typeof commands[0] === 'string') && commands.length === 1 && commands[0] == '/') {
    return new NormalizedNavigationCommands(true, 0, commands);
  }

  let numberOfDoubleDots = 0;
  let isAbsolute = false;
  const res: any[] = [];

  for (let i = 0; i < commands.length; ++i) {
    const c = commands[i];

    if (!(typeof c === 'string')) {
      res.push(c);
      continue;
    }

    const parts = c.split('/');
    for (let j = 0; j < parts.length; ++j) {
      let cc = parts[j];

      // first exp is treated in a special way
      if (i == 0) {
        if (j == 0 && cc == '.') {  //  './a'
          // skip it
        } else if (j == 0 && cc == '') {  //  '/a'
          isAbsolute = true;
        } else if (cc == '..') {  //  '../a'
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

class Position {
  constructor(public segment: UrlSegment, public processChildren: boolean, public index: number) {}
}

function findStartingPosition(
    normalizedChange: NormalizedNavigationCommands, urlTree: UrlTree,
    route: ActivatedRoute): Position {
  if (normalizedChange.isAbsolute) {
    return new Position(urlTree.root, true, 0);
  } else if (route.snapshot._lastPathIndex === -1) {
    return new Position(route.snapshot._urlSegment, true, 0);
  } else if (route.snapshot._lastPathIndex + 1 - normalizedChange.numberOfDoubleDots >= 0) {
    return new Position(
        route.snapshot._urlSegment, false,
        route.snapshot._lastPathIndex + 1 - normalizedChange.numberOfDoubleDots);
  } else {
    throw new Error('Invalid number of \'../\'');
  }
}

function getPath(command: any): any {
  if (!(typeof command === 'string')) return command.toString();
  const parts = command.toString().split(':');
  return parts.length > 1 ? parts[1] : command;
}

function getOutlet(commands: any[]): string {
  if (!(typeof commands[0] === 'string')) return PRIMARY_OUTLET;
  const parts = commands[0].toString().split(':');
  return parts.length > 1 ? parts[0] : PRIMARY_OUTLET;
}

function updateSegment(segment: UrlSegment, startIndex: number, commands: any[]): UrlSegment {
  if (!segment) {
    segment = new UrlSegment([], {});
  }
  if (segment.pathsWithParams.length === 0 && segment.hasChildren()) {
    return updateSegmentChildren(segment, startIndex, commands);
  }
  const m = prefixedWith(segment, startIndex, commands);
  const slicedCommands = commands.slice(m.lastIndex);

  if (m.match && slicedCommands.length === 0) {
    return new UrlSegment(segment.pathsWithParams, {});
  } else if (m.match && !segment.hasChildren()) {
    return createNewSegment(segment, startIndex, commands);
  } else if (m.match) {
    return updateSegmentChildren(segment, 0, slicedCommands);
  } else {
    return createNewSegment(segment, startIndex, commands);
  }
}

function updateSegmentChildren(
    segment: UrlSegment, startIndex: number, commands: any[]): UrlSegment {
  if (commands.length === 0) {
    return new UrlSegment(segment.pathsWithParams, {});
  } else {
    const outlet = getOutlet(commands);
    const children: {[key: string]: UrlSegment} = {};
    children[outlet] = updateSegment(segment.children[outlet], startIndex, commands);
    forEach(segment.children, (child: UrlSegment, childOutlet: string) => {
      if (childOutlet !== outlet) {
        children[childOutlet] = child;
      }
    });
    return new UrlSegment(segment.pathsWithParams, children);
  }
}

function prefixedWith(segment: UrlSegment, startIndex: number, commands: any[]) {
  let currentCommandIndex = 0;
  let currentPathIndex = startIndex;

  const noMatch = {match: false, lastIndex: 0};
  while (currentPathIndex < segment.pathsWithParams.length) {
    if (currentCommandIndex >= commands.length) return noMatch;
    const path = segment.pathsWithParams[currentPathIndex];
    const curr = getPath(commands[currentCommandIndex]);
    const next =
        currentCommandIndex < commands.length - 1 ? commands[currentCommandIndex + 1] : null;

    if (curr && next && (typeof next === 'object')) {
      if (!compare(curr, next, path)) return noMatch;
      currentCommandIndex += 2;
    } else {
      if (!compare(curr, {}, path)) return noMatch;
      currentCommandIndex++;
    }
    currentPathIndex++;
  }

  return {match: true, lastIndex: currentCommandIndex};
}

function createNewSegment(segment: UrlSegment, startIndex: number, commands: any[]): UrlSegment {
  const paths = segment.pathsWithParams.slice(0, startIndex);
  let i = 0;
  while (i < commands.length) {
    // if we start with an object literal, we need to reuse the path part from the segment
    if (i === 0 && (typeof commands[0] === 'object')) {
      const p = segment.pathsWithParams[startIndex];
      paths.push(new UrlPathWithParams(p.path, commands[0]));
      i++;
      continue;
    }

    const curr = getPath(commands[i]);
    const next = (i < commands.length - 1) ? commands[i + 1] : null;
    if (curr && next && (typeof next === 'object')) {
      paths.push(new UrlPathWithParams(curr, stringify(next)));
      i += 2;
    } else {
      paths.push(new UrlPathWithParams(curr, {}));
      i++;
    }
  }
  return new UrlSegment(paths, {});
}

function stringify(params: {[key: string]: any}): {[key: string]: string} {
  const res: {[key: string]: string} = {};
  forEach(params, (v: any, k: string) => res[k] = `${v}`);
  return res;
}

function compare(
    path: string, params: {[key: string]: any}, pathWithParams: UrlPathWithParams): boolean {
  return path == pathWithParams.path && shallowEqual(params, pathWithParams.parameters);
}