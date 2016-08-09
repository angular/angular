/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ActivatedRoute} from './router_state';
import {PRIMARY_OUTLET, Params} from './shared';
import {UrlSegment, UrlSegmentGroup, UrlTree} from './url_tree';
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
    return tree(urlTree.root, new UrlSegmentGroup([], {}), urlTree, queryParams, fragment);
  }

  const startingPosition = findStartingPosition(normalizedCommands, urlTree, route);
  const segmentGroup = startingPosition.processChildren ?
      updateSegmentGroupChildren(
          startingPosition.segmentGroup, startingPosition.index, normalizedCommands.commands) :
      updateSegmentGroup(
          startingPosition.segmentGroup, startingPosition.index, normalizedCommands.commands);
  return tree(startingPosition.segmentGroup, segmentGroup, urlTree, queryParams, fragment);
}

function validateCommands(n: NormalizedNavigationCommands): void {
  if (n.isAbsolute && n.commands.length > 0 && isMatrixParams(n.commands[0])) {
    throw new Error('Root segment cannot have matrix parameters');
  }

  const c = n.commands.filter(c => typeof c === 'object' && c.outlets !== undefined);
  if (c.length > 0 && c[0] !== n.commands[n.commands.length - 1]) {
    throw new Error('{outlets:{}} has to be the last command');
  }
}

function isMatrixParams(command: any): boolean {
  return typeof command === 'object' && command.outlets === undefined &&
      command.segmentPath === undefined;
}

function tree(
    oldSegmentGroup: UrlSegmentGroup, newSegmentGroup: UrlSegmentGroup, urlTree: UrlTree,
    queryParams: Params, fragment: string): UrlTree {
  if (urlTree.root === oldSegmentGroup) {
    return new UrlTree(newSegmentGroup, stringify(queryParams), fragment);
  } else {
    return new UrlTree(
        replaceSegment(urlTree.root, oldSegmentGroup, newSegmentGroup), stringify(queryParams),
        fragment);
  }
}

function replaceSegment(
    current: UrlSegmentGroup, oldSegment: UrlSegmentGroup,
    newSegment: UrlSegmentGroup): UrlSegmentGroup {
  const children: {[key: string]: UrlSegmentGroup} = {};
  forEach(current.children, (c: UrlSegmentGroup, outletName: string) => {
    if (c === oldSegment) {
      children[outletName] = newSegment;
    } else {
      children[outletName] = replaceSegment(c, oldSegment, newSegment);
    }
  });
  return new UrlSegmentGroup(current.segments, children);
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

    if (typeof c === 'object' && c.outlets !== undefined) {
      const r: {[k: string]: any} = {};
      forEach(c.outlets, (commands: any, name: string) => {
        if (typeof commands === 'string') {
          r[name] = commands.split('/');
        } else {
          r[name] = commands;
        }
      });
      res.push({outlets: r});
      continue;
    }

    if (typeof c === 'object' && c.segmentPath !== undefined) {
      res.push(c.segmentPath);
      continue;
    }

    if (!(typeof c === 'string')) {
      res.push(c);
      continue;
    }

    if (i === 0) {
      const parts = c.split('/');
      for (let j = 0; j < parts.length; ++j) {
        let cc = parts[j];

        if (j == 0 && cc == '.') {  //  './a'
          // skip it
        } else if (j == 0 && cc == '') {  //  '/a'
          isAbsolute = true;
        } else if (cc == '..') {  //  '../a'
          numberOfDoubleDots++;
        } else if (cc != '') {
          res.push(cc);
        }
      }
    } else {
      res.push(c);
    }
  }

  return new NormalizedNavigationCommands(isAbsolute, numberOfDoubleDots, res);
}

class Position {
  constructor(
      public segmentGroup: UrlSegmentGroup, public processChildren: boolean, public index: number) {
  }
}

function findStartingPosition(
    normalizedChange: NormalizedNavigationCommands, urlTree: UrlTree,
    route: ActivatedRoute): Position {
  if (normalizedChange.isAbsolute) {
    return new Position(urlTree.root, true, 0);
  } else if (route.snapshot._lastPathIndex === -1) {
    return new Position(route.snapshot._urlSegment, true, 0);
  } else {
    const modifier = isMatrixParams(normalizedChange.commands[0]) ? 0 : 1;
    const index = route.snapshot._lastPathIndex + modifier;
    return createPositionApplyingDoubleDots(
        route.snapshot._urlSegment, index, normalizedChange.numberOfDoubleDots);
  }
}

function createPositionApplyingDoubleDots(
    group: UrlSegmentGroup, index: number, numberOfDoubleDots: number): Position {
  let g = group;
  let ci = index;
  let dd = numberOfDoubleDots;
  while (dd > ci) {
    dd -= ci;
    g = g.parent;
    if (!g) {
      throw new Error('Invalid number of \'../\'');
    }
    ci = g.segments.length;
  }
  return new Position(g, false, ci - dd);
}

function getPath(command: any): any {
  return `${command}`;
}

function getOutlets(commands: any[]): {[k: string]: any[]} {
  if (!(typeof commands[0] === 'object')) return {[PRIMARY_OUTLET]: commands};
  if (commands[0].outlets === undefined) return {[PRIMARY_OUTLET]: commands};
  return commands[0].outlets;
}

function updateSegmentGroup(
    segmentGroup: UrlSegmentGroup, startIndex: number, commands: any[]): UrlSegmentGroup {
  if (!segmentGroup) {
    segmentGroup = new UrlSegmentGroup([], {});
  }
  if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
    return updateSegmentGroupChildren(segmentGroup, startIndex, commands);
  }

  const m = prefixedWith(segmentGroup, startIndex, commands);
  const slicedCommands = commands.slice(m.lastIndex);

  if (m.match && slicedCommands.length === 0) {
    return new UrlSegmentGroup(segmentGroup.segments, {});
  } else if (m.match && !segmentGroup.hasChildren()) {
    return createNewSegmentGroup(segmentGroup, startIndex, commands);
  } else if (m.match) {
    return updateSegmentGroupChildren(segmentGroup, 0, slicedCommands);
  } else {
    return createNewSegmentGroup(segmentGroup, startIndex, commands);
  }
}

function updateSegmentGroupChildren(
    segmentGroup: UrlSegmentGroup, startIndex: number, commands: any[]): UrlSegmentGroup {
  if (commands.length === 0) {
    return new UrlSegmentGroup(segmentGroup.segments, {});
  } else {
    const outlets = getOutlets(commands);
    const children: {[key: string]: UrlSegmentGroup} = {};

    forEach(outlets, (commands: any, outlet: string) => {
      if (commands !== null) {
        children[outlet] = updateSegmentGroup(segmentGroup.children[outlet], startIndex, commands);
      }
    });

    forEach(segmentGroup.children, (child: UrlSegmentGroup, childOutlet: string) => {
      if (outlets[childOutlet] === undefined) {
        children[childOutlet] = child;
      }
    });
    return new UrlSegmentGroup(segmentGroup.segments, children);
  }
}

function prefixedWith(segmentGroup: UrlSegmentGroup, startIndex: number, commands: any[]) {
  let currentCommandIndex = 0;
  let currentPathIndex = startIndex;

  const noMatch = {match: false, lastIndex: 0};
  while (currentPathIndex < segmentGroup.segments.length) {
    if (currentCommandIndex >= commands.length) return noMatch;
    const path = segmentGroup.segments[currentPathIndex];
    const curr = getPath(commands[currentCommandIndex]);
    const next =
        currentCommandIndex < commands.length - 1 ? commands[currentCommandIndex + 1] : null;

    if (curr && next && (typeof next === 'object') && next.outlets === undefined) {
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

function createNewSegmentGroup(
    segmentGroup: UrlSegmentGroup, startIndex: number, commands: any[]): UrlSegmentGroup {
  const paths = segmentGroup.segments.slice(0, startIndex);

  let i = 0;
  while (i < commands.length) {
    if (typeof commands[i] === 'object' && commands[i].outlets !== undefined) {
      const children = createNewSegmentChldren(commands[i].outlets);
      return new UrlSegmentGroup(paths, children);
    }

    // if we start with an object literal, we need to reuse the path part from the segment
    if (i === 0 && isMatrixParams(commands[0])) {
      const p = segmentGroup.segments[startIndex];
      paths.push(new UrlSegment(p.path, commands[0]));
      i++;
      continue;
    }

    const curr = getPath(commands[i]);
    const next = (i < commands.length - 1) ? commands[i + 1] : null;
    if (curr && next && isMatrixParams(next)) {
      paths.push(new UrlSegment(curr, stringify(next)));
      i += 2;
    } else {
      paths.push(new UrlSegment(curr, {}));
      i++;
    }
  }
  return new UrlSegmentGroup(paths, {});
}

function createNewSegmentChldren(outlets: {[name: string]: any}): any {
  const children: {[key: string]: UrlSegmentGroup} = {};
  forEach(outlets, (commands: any, outlet: string) => {
    if (commands !== null) {
      children[outlet] = createNewSegmentGroup(new UrlSegmentGroup([], {}), 0, commands);
    }
  });
  return children;
}

function stringify(params: {[key: string]: any}): {[key: string]: string} {
  const res: {[key: string]: string} = {};
  forEach(params, (v: any, k: string) => res[k] = `${v}`);
  return res;
}

function compare(path: string, params: {[key: string]: any}, segment: UrlSegment): boolean {
  return path == segment.path && shallowEqual(params, segment.parameters);
}