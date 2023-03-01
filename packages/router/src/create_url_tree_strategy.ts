/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';

import {createSegmentGroupFromRoute, createUrlTree, createUrlTreeFromSegmentGroup} from './create_url_tree';
import {ActivatedRoute, RouterState} from './router_state';
import {Params} from './shared';
import {UrlSegmentGroup, UrlTree} from './url_tree';

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

@Injectable()
export class LegacyCreateUrlTree implements CreateUrlTreeStrategy {
  createUrlTree(
      relativeTo: ActivatedRoute|null|undefined, currentState: RouterState, currentUrlTree: UrlTree,
      commands: any[], queryParams: Params|null, fragment: string|null): UrlTree {
    const a = relativeTo || currentState.root;
    const tree = createUrlTree(a, currentUrlTree, commands, queryParams, fragment);
    if (NG_DEV_MODE) {
      const treeFromSnapshotStrategy = new CreateUrlTreeUsingSnapshot().createUrlTree(
          relativeTo, currentState, currentUrlTree, commands, queryParams, fragment);
      if (treeFromSnapshotStrategy.toString() !== tree.toString()) {
        let warningString = `The navigation to ${tree.toString()} will instead go to ${
            treeFromSnapshotStrategy.toString()} in an upcoming version of Angular.`;
        if (!!relativeTo) {
          warningString += ' `relativeTo` might need to be removed from the `UrlCreationOptions`.';
        }
        tree._warnIfUsedForNavigation = warningString;
      }
    }
    return tree;
  }
}

@Injectable()
export class CreateUrlTreeUsingSnapshot implements CreateUrlTreeStrategy {
  createUrlTree(
      relativeTo: ActivatedRoute|null|undefined, currentState: RouterState, currentUrlTree: UrlTree,
      commands: any[], queryParams: Params|null, fragment: string|null): UrlTree {
    let relativeToUrlSegmentGroup: UrlSegmentGroup|undefined;
    try {
      const relativeToSnapshot = relativeTo ? relativeTo.snapshot : currentState.snapshot.root;
      relativeToUrlSegmentGroup = createSegmentGroupFromRoute(relativeToSnapshot);
    } catch (e: unknown) {
      // This is strictly for backwards compatibility with tests that create
      // invalid `ActivatedRoute` mocks.
      // Note: the difference between having this fallback for invalid `ActivatedRoute` setups and
      // just throwing is ~500 test failures. Fixing all of those tests by hand is not feasible at
      // the moment.
      if (typeof commands[0] !== 'string' || !commands[0].startsWith('/')) {
        // Navigations that were absolute in the old way of creating UrlTrees
        // would still work because they wouldn't attempt to match the
        // segments in the `ActivatedRoute` to the `currentUrlTree` but
        // instead just replace the root segment with the navigation result.
        // Non-absolute navigations would fail to apply the commands because
        // the logic could not find the segment to replace (so they'd act like there were no
        // commands).
        commands = [];
      }
      relativeToUrlSegmentGroup = currentUrlTree.root;
    }
    return createUrlTreeFromSegmentGroup(
        relativeToUrlSegmentGroup, commands, queryParams, fragment);
  }
}

@Injectable({providedIn: 'root', useClass: CreateUrlTreeUsingSnapshot})
export abstract class CreateUrlTreeStrategy {
  abstract createUrlTree(
      relativeTo: ActivatedRoute|null|undefined, currentState: RouterState, currentUrlTree: UrlTree,
      commands: any[], queryParams: Params|null, fragment: string|null): UrlTree;
}
