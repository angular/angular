/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import type {WebContainer} from '@webcontainer/api';

import {TypingsLoader} from './typings-loader.service';

describe('TypingsLoader', () => {
  let service: TypingsLoader;

  const fakePackageJson = {
    exports: {
      '.': {
        types: './dist/*.d.ts',
      },
      './something': {
        types: 'something/index.d.ts',
        default: 'something/index.js',
        esm: 'something/index.mjs',
      },
    },
  };

  const fakeTypeDefinitionFiles = ['file.d.ts'];
  const fakeFiles = [...fakeTypeDefinitionFiles, 'file.js', 'file.mjs'];

  const fakeFileContent = 'content';

  const fakeWebContainer = {
    fs: {
      readFile: (path: string) => {
        if (path.endsWith('package.json')) {
          return Promise.resolve(JSON.stringify(fakePackageJson));
        } else {
          return Promise.resolve(fakeFileContent);
        }
      },
      readdir: (path: string) => {
        return Promise.resolve(fakeFiles.map((file) => `${path}/${file}`));
      },
    },
  } as unknown as WebContainer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypingsLoader);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should read files from directory', async () => {
    await service.retrieveTypeDefinitions(fakeWebContainer);

    expect(
      service.typings().some(({path}) => path.endsWith(fakeTypeDefinitionFiles[0])),
    ).toBeTrue();
  });

  it('should only contain type definitions files', async () => {
    await service.retrieveTypeDefinitions(fakeWebContainer);

    for (const {path} of service.typings()) {
      expect(path.endsWith('.d.ts')).toBeTrue();
    }
  });

  it('should skip library if its package.json can not be found', async () => {
    const libraryThatIsNotADependency = service['librariesToGetTypesFrom'][0];

    const fakeWebContainerThatThrowsWithPackageJson = {
      fs: {
        readFile: (path: string) => {
          if (path.endsWith('package.json')) {
            if (path.includes(libraryThatIsNotADependency)) return Promise.reject(Error('ENOENT'));
            else return Promise.resolve(JSON.stringify(fakePackageJson));
          } else {
            return Promise.resolve(fakeFileContent);
          }
        },
        readdir: (path: string) => {
          return Promise.resolve(fakeFiles.map((file) => `${path}/${file}`));
        },
      },
    } as unknown as WebContainer;

    await service.retrieveTypeDefinitions(fakeWebContainerThatThrowsWithPackageJson);

    for (const {path} of service.typings()) {
      expect(path.includes(libraryThatIsNotADependency)).toBe(false);
    }
  });
});
