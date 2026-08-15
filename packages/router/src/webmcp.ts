/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {declareExperimentalWebMcpTool, inject, provideEnvironmentInitializer} from '@angular/core';
import {Router} from './router';
import {Routes} from './models';
import {routerFeature, RouterFeature, RouterFeatureKind} from './provide_router';

/**
 * A Router feature that provides WebMCP routing tools to browser-side AI assistants.
 *
 * @experimental
 */
export type WebMcpRouterToolsFeature = RouterFeature<RouterFeatureKind.WebMcpRouterToolsFeature>;

function getPaths(routes: Routes, parentPath = ''): string[] {
  const paths: string[] = [];
  for (const route of routes) {
    let currentPath = parentPath;
    if (route.path !== undefined) {
      currentPath = parentPath ? `${parentPath}/${route.path}` : route.path;
      if (route.path !== '**') {
        let normalizedPath = currentPath.startsWith('/') ? currentPath : `/${currentPath}`;
        // Replace multiple consecutive slashes with a single slash
        normalizedPath = normalizedPath.replace(/\/+/g, '/');
        // Strip trailing slash unless it is the root path "/"
        if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
          normalizedPath = normalizedPath.slice(0, -1);
        }
        paths.push(normalizedPath);
      }
    }
    if (route.children) {
      paths.push(...getPaths(route.children, currentPath));
    }
    if (route._loadedRoutes) {
      paths.push(...getPaths(route._loadedRoutes, currentPath));
    }
  }
  return Array.from(new Set(paths)).sort();
}

/**
 * Enables WebMCP tools for the Angular Router, allowing browser-side AI assistants
 * to list available routes and navigate between them.
 *
 * @returns A router feature that registers the WebMCP routing tools.
 * @experimental
 */
export function withExperimentalWebMcpRouterTools(): WebMcpRouterToolsFeature {
  return routerFeature(RouterFeatureKind.WebMcpRouterToolsFeature, [
    provideEnvironmentInitializer(() => {
      const router = inject(Router);

      // Tool to list loaded/configured routes
      declareExperimentalWebMcpTool({
        name: 'router.list_routes',
        description: 'Lists all available routes/paths configured in the application.',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
        execute: () => {
          const paths = getPaths(router.config);
          return {
            content: [
              {
                type: 'text',
                text: `Available paths:\n${paths.map((p) => `- ${p}`).join('\n')}`,
              },
            ],
          };
        },
      });

      // Tool to navigate to a path/URL
      declareExperimentalWebMcpTool({
        name: 'router.navigate',
        description: 'Navigates the application to the specified path or URL.',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The URL or path to navigate to, e.g., "/dashboard" or "/profile".',
            },
          },
          required: ['url'],
          additionalProperties: false,
        },
        execute: async ({url}) => {
          if (typeof url !== 'string') {
            throw new Error('Invalid URL provided.');
          }
          const success = await router.navigateByUrl(url);
          return {
            content: [
              {
                type: 'text',
                text: success ? `Successfully navigated to ${url}` : `Failed to navigate to ${url}`,
              },
            ],
          };
        },
      });
    }),
  ]);
}
