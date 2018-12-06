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
import {forEach, last, shallowEqual} from './utils/collection';

export function createUrlTree(
    route: ActivatedRoute, urlTree: UrlTree, commands: any[], queryParams: Params,
    fragment: string): UrlTree {
  if (commands.length === 0) {
    return tree(urlTree.root, urlTree.root, urlTree, queryParams, fragment);
  }

  const nav = computeNavigation(commands);

  if (nav.toRoot()) {
    return tree(urlTree.root, new UrlSegmentGroup([], {}), urlTree, queryParams, fragment);
  }

  const startingPosition = findStartingPosition(nav, urlTree, route);

  const segmentGroup = startingPosition.processChildren ?
      updateSegmentGroupChildren(
          startingPosition.segmentGroup, startingPosition.index, nav.commands) :
      updateSegmentGroup(startingPosition.segmentGroup, startingPosition.index, nav.commands);
  return tree(startingPosition.segmentGroup, segmentGroup, urlTree, queryParams, fragment);
}

function isMatrixParams(command: any): boolean {
  return typeof command === 'object' && command != null && !command.outlets && !command.segmentPath;
}

function tree(
    oldSegmentGroup: UrlSegmentGroup, newSegmentGroup: UrlSegmentGroup, urlTree: UrlTree,
    queryParams: Params, fragment: string): UrlTree {
  let qp: any = {};
  if (queryParams) {
    forEach(queryParams, (value: any, name: any) => {
      qp[name] = Array.isArray(value) ? value.map((v: any) => `${v}`) : `${value}`;
    });
  }

  if (urlTree.root === oldSegmentGroup) {
    return new UrlTree(newSegmentGroup, qp, fragment);
  }

  return new UrlTree(replaceSegment(urlTree.root, oldSegmentGroup, newSegmentGroup), qp, fragment);
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

class Navigation {
  constructor(
      public isAbsolute: boolean, public numberOfDoubleDots: number, public commands: any[]) {
    if (isAbsolute && commands.length > 0 && isMatrixParams(commands[0])) {
      throw new Error('Root segment cannot have matrix parameters');
    }

    const cmdWithOutlet = commands.find(c => typeof c === 'object' && c != null && c.outlets);
    if (cmdWithOutlet && cmdWithOutlet !== last(commands)) {
      throw new Error('{outlets:{}} has to be the last command');
    }
  }

  public toRoot(): boolean {
    return this.isAbsolute && this.commands.length === 1 && this.commands[0] == '/';
  }
}

/** Transforms commands to a normalized `Navigation` */
function computeNavigation(commands: any[]): Navigation {
  if ((typeof commands[0] === 'string') && commands.length === 1 && commands[0] === '/') {
    return new Navigation(true, 0, commands);
  }

  let numberOfDoubleDots = 0;
  let isAbsolute = false;

  const res: any[] = commands.reduce((res, cmd, cmdIdx) => {
    if (typeof cmd === 'object' && cmd != null) {
      if (cmd.outlets) {
        const outlets: {[k: string]: any} = {};
        forEach(cmd.outlets, (commands: any, name: string) => {
          outlets[name] = typeof commands === 'string' ? commands.split('/') : commands;
        });
        return [...res, {outlets}];
      }

      if (cmd.segmentPath) {
        return [...res, cmd.segmentPath];
      }
    }

    if (!(typeof cmd === 'string')) {
      return [...res, cmd];
    }

    if (cmdIdx === 0) {
      cmd.split('/').forEach((urlPart, partIndex) => {
        if (partIndex == 0 && urlPart === '.') {
          // skip './a'
        } else if (partIndex == 0 && urlPart === '') {  //  '/a'
          isAbsolute = true;
        } else if (urlPart === '..') {  //  '../a'
          numberOfDoubleDots++;
        } else if (urlPart != '') {
          res.push(urlPart);
        }
      });

      return res;
    }

    return [...res, cmd];
  }, []);

  return new Navigation(isAbsolute, numberOfDoubleDots, res);
}

class Position {
  constructor(
      public segmentGroup: UrlSegmentGroup, public processChildren: boolean, public index: number) {
  }
}

function findStartingPosition(nav: Navigation, tree: UrlTree, route: ActivatedRoute): Position {
  if (nav.isAbsolute) {
    return new Position(tree.root, true, 0);
  }

  if (route.snapshot._lastPathIndex === -1) {
    return new Position(route.snapshot._urlSegment, true, 0);
  }

  const modifier = isMatrixParams(nav.commands[0]) ? 0 : 1;
  const index = route.snapshot._lastPathIndex + modifier;
  return createPositionApplyingDoubleDots(
      route.snapshot._urlSegment, index, nav.numberOfDoubleDots);
}

function createPositionApplyingDoubleDots(
    group: UrlSegmentGroup, index: number, numberOfDoubleDots: number): Position {
  let g = group;
  let ci = index;
  let dd = numberOfDoubleDots;
  while (dd > ci) {
    dd -= ci;
    g = g.parent !;
    if (!g) {
      throw new Error('Invalid number of \'../\'');
    }
    ci = g.segments.length;
  }
  return new Position(g, false, ci - dd);
}

function getPath(command: any): any {
  if (typeof command === 'object' && command != null && command.outlets) {
    return command.outlets[PRIMARY_OUTLET];
  }
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
  const slicedCommands = commands.slice(m.commandIndex);
  if (m.match && m.pathIndex < segmentGroup.segments.length) {
    const g = new UrlSegmentGroup(segmentGroup.segments.slice(0, m.pathIndex), {});
    g.children[PRIMARY_OUTLET] =
        new UrlSegmentGroup(segmentGroup.segments.slice(m.pathIndex), segmentGroup.children);
    return updateSegmentGroupChildren(g, 0, slicedCommands);
  } else if (m.match && slicedCommands.length === 0) {
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

  const noMatch = {match: false, pathIndex: 0, commandIndex: 0};
  while (currentPathIndex < segmentGroup.segments.length) {
    if (currentCommandIndex >= commands.length) return noMatch;
    const path = segmentGroup.segments[currentPathIndex];
    const curr = getPath(commands[currentCommandIndex]);
    const next =
        currentCommandIndex < commands.length - 1 ? commands[currentCommandIndex + 1] : null;

    if (currentPathIndex > 0 && curr === undefined) break;

    if (curr && next && (typeof next === 'object') && next.outlets === undefined) {
      if (!compare(curr, next, path)) return noMatch;
      currentCommandIndex += 2;
    } else {
      if (!compare(curr, {}, path)) return noMatch;
      currentCommandIndex++;
    }
    currentPathIndex++;
  }

  return {match: true, pathIndex: currentPathIndex, commandIndex: currentCommandIndex};
}

function createNewSegmentGroup(
    segmentGroup: UrlSegmentGroup, startIndex: number, commands: any[]): UrlSegmentGroup {
  const paths = segmentGroup.segments.slice(0, startIndex);

  let i = 0;
  while (i < commands.length) {
    if (typeof commands[i] === 'object' && commands[i].outlets !== undefined) {
      const children = createNewSegmentChildren(commands[i].outlets);
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

function createNewSegmentChildren(outlets: {[name: string]: any}): any {
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
