/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {NavigationItem} from '@angular/docs';

import {PagePrefix} from '../../src/app/core/enums/pages';

import type {TutorialNavigationData, TutorialNavigationItem, TutorialStep} from './tutorials-types';
import {createDirectoryAndWriteFile} from './utils/filesystem';
import {TUTORIALS_ROUTES_NODE_PATH} from './utils/node-constants';

/** the step is used only in this function to sort the nav items */
export type TutorialNavigationItemWithStep = TutorialNavigationItem & {
  tutorialData: TutorialNavigationData & {
    step: TutorialStep['step'];
  };
};

export async function buildTutorialsNavigationItems(
  initialNavigationItems: TutorialNavigationItemWithStep[],
) {
  const sortedInitialNavigationItems = initialNavigationItems.sort((a, b) => {
    if (!a.tutorialData?.step || !b.tutorialData?.step) return 0;

    if (a.tutorialData.step < b.tutorialData.step) return -1;
    else if (a.tutorialData.step > b.tutorialData.step) return 1;

    return 0;
  });

  const addTutorialPagePrefixToNavItemPath = (path: string) => `${PagePrefix.TUTORIALS}/${path}`;

  const navItemMap = new Map<NavigationItem['path'], TutorialNavigationItem>();

  for (const navItem of sortedInitialNavigationItems) {
    const pathParts = navItem.path.split('/');
    const topLevelPath = pathParts[0];
    const topLevelNavItem = navItemMap.get(topLevelPath);

    const isNavItemTopLevelPath = pathParts.length === 1;

    const newNavItem: TutorialNavigationItem = {
      path: addTutorialPagePrefixToNavItemPath(navItem.path),
      label: navItem.label,
      contentPath: navItem.contentPath,
      tutorialData: navItem.tutorialData,
    };

    if (!topLevelNavItem) {
      // create new map entry
      navItemMap.set(
        topLevelPath,
        isNavItemTopLevelPath ? newNavItem : ({children: [newNavItem]} as TutorialNavigationItem),
      );
    } else if (isNavItemTopLevelPath) {
      // add top level path to existing map entry
      navItemMap.set(topLevelPath, {
        ...newNavItem,
        ...topLevelNavItem,
      });
    } else if (!topLevelNavItem.children) {
      // create children in existing map entry
      topLevelNavItem.children = [newNavItem];

      navItemMap.set(topLevelPath, topLevelNavItem);
    } else {
      // add children to existing map entry
      topLevelNavItem.children.push(newNavItem);

      navItemMap.set(topLevelPath, topLevelNavItem);
    }
  }

  const tutorialNavigationItems = Array.from(navItemMap.values());

  await createDirectoryAndWriteFile(
    TUTORIALS_ROUTES_NODE_PATH,
    JSON.stringify(tutorialNavigationItems),
  );
}
