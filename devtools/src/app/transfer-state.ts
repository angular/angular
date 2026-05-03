/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HttpClient} from '@angular/common/http';
import {APP_ID, DOCUMENT, inject, makeStateKey, TransferState} from '@angular/core';

/**
 * This function serializes the transfer state into the DOM.
 */
export async function serializeTransferState(): Promise<void> {
  const doc = inject(DOCUMENT);
  const appId = inject(APP_ID);
  const transferState = inject(TransferState);
  const httpClient = inject(HttpClient);

  // Object
  transferState.set(makeStateKey<any>('obj'), {
    appName: 'DevTools',
    appVersion: '0.0.1',
    appDescription: 'Angular DevTools',
  });

  // Array of primitives
  transferState.set(makeStateKey<any>('arr'), [1, 2, 3, 4, 5]);

  // Primitives — exercise each badge color and primitive renderer
  transferState.set(makeStateKey<any>('flag'), true);
  transferState.set(makeStateKey<any>('count'), 42);
  transferState.set(makeStateKey<any>('largeNumber'), 1234567890);
  transferState.set(makeStateKey<any>('greeting'), 'Hello, world!');
  transferState.set(makeStateKey<any>('nothing'), null);

  // Empty containers — exercise "{}" / "[]" preview
  transferState.set(makeStateKey<any>('emptyObj'), {});
  transferState.set(makeStateKey<any>('emptyArr'), []);

  // Unicode — exercises UTF-8 byte size (multi-byte characters)
  transferState.set(makeStateKey<any>('unicode'), '안녕하세요 🅰️ Angular ✨');

  // Long string — exercises wrapping and size (~500 B → kilobyte threshold nearby)
  transferState.set(
    makeStateKey<any>('longString'),
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
      'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ' +
      'ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit ' +
      'esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non ' +
      'proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  );

  // Mixed array — primitives, null, and a nested object
  transferState.set(makeStateKey<any>('mixedArr'), [1, 'two', true, null, {three: 3}, [4, 5, 6]]);

  // Deeply nested object — exercises tree expansion levels
  transferState.set(makeStateKey<any>('deepNested'), {
    level1: {
      level2: {
        level3: {
          level4: {
            level5: {
              message: 'You found me!',
              path: ['level1', 'level2', 'level3', 'level4', 'level5'],
            },
          },
        },
      },
    },
  });

  // Realistic API response — paginated list of objects, ~1.5 KB
  transferState.set(makeStateKey<any>('articles'), {
    page: 1,
    pageSize: 5,
    total: 47,
    items: [
      {
        id: 'a1',
        title: 'Introducing Signals in Angular',
        author: 'Alex',
        published: '2024-02-12',
        tags: ['angular', 'reactivity', 'signals'],
        readTime: 8,
      },
      {
        id: 'a2',
        title: 'Server-Side Rendering Deep Dive',
        author: 'Jordan',
        published: '2024-03-04',
        tags: ['ssr', 'hydration'],
        readTime: 12,
      },
      {
        id: 'a3',
        title: 'Migrating to Standalone Components',
        author: 'Riley',
        published: '2024-04-19',
        tags: ['migration', 'standalone'],
        readTime: 6,
      },
      {
        id: 'a4',
        title: 'The New Control Flow Syntax',
        author: 'Sam',
        published: '2024-05-01',
        tags: ['template-syntax', 'control-flow'],
        readTime: 5,
      },
      {
        id: 'a5',
        title: 'Building Production-Grade Forms',
        author: 'Casey',
        published: '2024-05-22',
        tags: ['forms', 'validation', 'a11y'],
        readTime: 14,
      },
    ],
  });

  // Object with many keys — exercises long-list rendering
  transferState.set(
    makeStateKey<any>('featureFlags'),
    Object.fromEntries(
      Array.from({length: 24}, (_, i) => [`feature_${String(i).padStart(2, '0')}`, i % 3 === 0]),
    ),
  );

  // Large array — exercises long-list rendering and Array(N) preview
  transferState.set(
    makeStateKey<any>('numbers'),
    Array.from({length: 50}, (_, i) => i * i),
  );

  // Serialized of the TransferState into the DOM.
  const content = transferState.toJson();
  const script = doc.createElement('script');
  script.textContent = content;

  script.id = appId + '-state';
  script.setAttribute('type', 'application/json');

  doc.body.appendChild(script);
}
