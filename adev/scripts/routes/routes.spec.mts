/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ALL_ITEMS,
  DOCS_SUB_NAVIGATION_DATA,
  FOOTER_NAVIGATION_DATA,
  REFERENCE_SUB_NAVIGATION_DATA,
  TUTORIALS_SUB_NAVIGATION_DATA,
} from '../../src/app/routing/navigation-entries/index.js';
import {NavigationItem} from '../../shared-docs/interfaces/index.js';
import {flatNavigationData, mapNavigationItemsToRoutes} from '../../shared-docs/utils/index.js';
import {existsSync} from 'fs';
import {join, resolve} from 'path';

describe('adev navigation and route generation smoke tests', () => {
  // Relative to adev/scripts/routes
  const contentRoot = resolve(process.cwd(), '../../src/content');

  function collectAllNavigationItems(items: NavigationItem[]): NavigationItem[] {
    const result: NavigationItem[] = [];
    for (const item of items) {
      result.push(item);
      if (item.children) {
        result.push(...collectAllNavigationItems(item.children));
      }
    }
    return result;
  }

  it('should have populated navigation collections', () => {
    expect(DOCS_SUB_NAVIGATION_DATA.length).toBeGreaterThan(0);
    expect(REFERENCE_SUB_NAVIGATION_DATA.length).toBeGreaterThan(0);
    expect(TUTORIALS_SUB_NAVIGATION_DATA.length).toBeGreaterThan(0);
    expect(FOOTER_NAVIGATION_DATA.length).toBeGreaterThan(0);
    expect(ALL_ITEMS.length).toBeGreaterThan(0);
  });

  it('should have existing markdown files for all navigation items with contentPath', () => {
    const allItems = collectAllNavigationItems(ALL_ITEMS);
    const missingContentFiles: string[] = [];

    for (const item of allItems) {
      if (item.contentPath) {
        const relativePath =
          item.contentPath.endsWith('.md') || item.contentPath.endsWith('.html')
            ? item.contentPath
            : `${item.contentPath}.md`;
        const filePath = join(contentRoot, relativePath);
        if (!existsSync(filePath)) {
          missingContentFiles.push(
            `${item.contentPath} (resolved: ${relativePath}, label: "${item.label}", path: "${item.path}")`,
          );
        }
      }
    }

    expect(missingContentFiles)
      .withContext(
        `Found navigation entries pointing to non-existent markdown content files:\n${missingContentFiles.join('\n')}`,
      )
      .toEqual([]);
  });

  it('should not have empty paths or malformed paths in navigation entries', () => {
    const allItems = collectAllNavigationItems(ALL_ITEMS);
    const malformedPaths: string[] = [];

    for (const item of allItems) {
      if (item.path !== undefined) {
        if (item.path.trim() === '') {
          malformedPaths.push(`Empty path for item "${item.label}"`);
        }
        if (item.path.startsWith('/') && !item.path.startsWith('//')) {
          malformedPaths.push(`Leading slash in path "${item.path}" for item "${item.label}"`);
        }
      }
    }

    expect(malformedPaths)
      .withContext(`Found malformed paths in navigation entries:\n${malformedPaths.join('\n')}`)
      .toEqual([]);
  });

  it('should not produce routes with external URLs when mapping navigation items', () => {
    const allFlatItems = flatNavigationData(ALL_ITEMS);
    const mappedRoutes = mapNavigationItemsToRoutes(allFlatItems, {});
    const externalRoutePaths: string[] = [];

    for (const route of mappedRoutes) {
      if (
        route.path &&
        (route.path.includes('://') ||
          route.path.startsWith('http:') ||
          route.path.startsWith('https:') ||
          route.path.startsWith('//') ||
          route.path.startsWith('mailto:'))
      ) {
        externalRoutePaths.push(route.path);
      }
    }

    expect(externalRoutePaths)
      .withContext(
        `Found external URLs in mapped Angular Router routes. External links in navigation items ` +
          `must not be converted into client routes, as static site prerendering will attempt ` +
          `to generate static pages for them and fail the build:\n${externalRoutePaths.join('\n')}`,
      )
      .toEqual([]);
  });

  it('should cover representative routes across all content sections', () => {
    const allItems = collectAllNavigationItems(ALL_ITEMS);
    const allPaths = new Set(allItems.map((item) => item.path).filter(Boolean));

    const representativePaths = [
      'overview',
      'installation',
      'essentials/signals',
      'guide/signals',
      'guide/components',
      'guide/http',
      'guide/routing',
      'tutorials/learn-angular',
      'tutorials/first-app',
      'tutorials/signals',
      'tutorials/deferrable-views',
      'tutorials/signal-forms',
      'press-kit',
      'license',
    ];

    for (const path of representativePaths) {
      expect(allPaths.has(path))
        .withContext(`Expected representative route path "${path}" to exist in navigation entries`)
        .toBe(true);
    }
  });
});
