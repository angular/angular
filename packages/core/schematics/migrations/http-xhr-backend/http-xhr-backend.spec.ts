/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom} from '@angular/compiler-cli';
import {initMockFileSystem} from '@angular/compiler-cli/private/testing';
import {runTsurgeMigration} from '../../utils/tsurge/testing';
import {XhrBackendMigration} from './migration';

describe('http fetch backend migration', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  it('should update an empty provideHttpClient', async () => {
    const {fs} = await runTsurgeMigration(new XhrBackendMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: `
        import {AppConfig} from '@angular/core';
        import {provideHttpClient} from '@angular/common/http';
        
        const config: AppConfig = [
          provideHttpClient(),
        ]
          `,
      },
    ]);

    const actual = fs.readFile(absoluteFrom('/index.ts'));
    expect(actual).toContain('provideHttpClient(withXhr())');
  });

  it('should update provideHttpClient without withFetch', async () => {
    const {fs} = await runTsurgeMigration(new XhrBackendMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: `
        import {AppConfig} from '@angular/core';
        import {provideHttpClient, withInterceptorsFromDi, withXsrfConfiguration} from '@angular/common/http';

        const config: AppConfig = [
          provideHttpClient(withInterceptorsFromDi(), withXsrfConfiguration({})),
        ]
          `,
      },
    ]);

    const actual = fs.readFile(absoluteFrom('/index.ts'));
    expect(actual).toContain(
      'provideHttpClient(withXhr(), withInterceptorsFromDi(), withXsrfConfiguration({}))',
    );
    expect(actual).toMatch(/import \{.*withXhr.*\}/);
  });

  it('should update provideHttpClient to remove withFetch', async () => {
    const {fs} = await runTsurgeMigration(new XhrBackendMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: `
        import {AppConfig} from '@angular/core';
        import {provideHttpClient, withFetch, withInterceptorsFromDi, withXsrfConfiguration} from '@angular/common/http';

        const config: AppConfig = [
          provideHttpClient(withFetch(), withInterceptorsFromDi(), withXsrfConfiguration({})),
        ]
          `,
      },
    ]);

    const actual = fs.readFile(absoluteFrom('/index.ts'));
    expect(actual).toContain(
      'provideHttpClient(withInterceptorsFromDi(), withXsrfConfiguration({}))',
    );
    expect(actual).not.toContain('withFetch');
  });

  it('should update provideHttpClient to remove withFetch as only arg', async () => {
    const {fs} = await runTsurgeMigration(new XhrBackendMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: `
        import {AppConfig} from '@angular/core';
        import {provideHttpClient, withFetch, withInterceptorsFromDi, withXsrfConfiguration} from '@angular/common/http';

        const config: AppConfig = [
          provideHttpClient(withFetch()),
        ]
          `,
      },
    ]);

    const actual = fs.readFile(absoluteFrom('/index.ts'));
    expect(actual).toContain('provideHttpClient()');
    expect(actual).not.toContain('withFetch');
  });

  it('should not update provideHttpClient if withXhr is already present', async () => {
    const {fs} = await runTsurgeMigration(new XhrBackendMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: `
        import {AppConfig} from '@angular/core';
        import {provideHttpClient, withXhr, withInterceptorsFromDi, withXsrfConfiguration} from '@angular/common/http';

        const config: AppConfig = [
          provideHttpClient(withXhr(), withInterceptorsFromDi(), withXsrfConfiguration({})),
        ]
          `,
      },
    ]);

    const actual = fs.readFile(absoluteFrom('/index.ts'));
    expect(actual).toContain(
      'provideHttpClient(withXhr(), withInterceptorsFromDi(), withXsrfConfiguration({})),',
    );
    expect(actual).not.toContain('withFetch');
  });
});
