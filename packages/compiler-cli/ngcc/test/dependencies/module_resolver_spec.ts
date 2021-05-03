/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, getFileSystem} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadTestFiles} from '../../../src/ngtsc/testing';
import {ModuleResolver, ResolvedDeepImport, ResolvedExternalModule, ResolvedRelativeModule} from '../../src/dependencies/module_resolver';

runInEachFileSystem(() => {
  describe('ModuleResolver', () => {
    let _: typeof absoluteFrom;

    beforeEach(() => {
      _ = absoluteFrom;
      loadTestFiles([
        {name: _('/libs/local-package/package.json'), contents: 'PACKAGE.JSON for local-package'},
        {name: _('/libs/local-package/index.js'), contents: `import {X} from './x';`},
        {name: _('/libs/local-package/x.js'), contents: `export class X {}`},
        {name: _('/libs/local-package/sub-folder/index.js'), contents: `import {X} from '../x';`},
        {
          name: _('/libs/local-package/node_modules/package-1/sub-folder/index.js'),
          contents: `export class Z {}`
        },
        {
          name: _('/libs/local-package/node_modules/package-1/package.json'),
          contents: 'PACKAGE.JSON for package-1'
        },
        {
          name: _('/libs/node_modules/package-2/package.json'),
          contents: 'PACKAGE.JSON for package-2'
        },
        {
          name: _('/libs/node_modules/package-2/node_modules/package-3/package.json'),
          contents: 'PACKAGE.JSON for package-3'
        },
        {name: _('/dist/package-4/x.js'), contents: `export class X {}`},
        {name: _('/dist/package-4/package.json'), contents: 'PACKAGE.JSON for package-4'},
        {
          name: _('/dist/package-4/sub-folder/index.js'),
          contents: `import {X} from '@shared/package-4/x';`
        },
        {name: _('/dist/package-4/secondary-entry-point/x.js'), contents: `export class X {}`},
        {
          name: _('/dist/package-4/secondary-entry-point/package.json'),
          contents: 'PACKAGE.JSON for secondary-entry-point'
        },
        {
          name: _('/dist/sub-folder/package-4/package.json'),
          contents: 'PACKAGE.JSON for package-4'
        },
        {
          name: _('/dist/sub-folder/package-5/package.json'),
          contents: 'PACKAGE.JSON for package-5'
        },
        {
          name: _('/dist/sub-folder/package-5/post-fix/package.json'),
          contents: 'PACKAGE.JSON for package-5/post-fix'
        },
        {
          name: _('/node_modules/top-package/package.json'),
          contents: 'PACKAGE.JSON for top-package'
        },
      ]);
    });

    describe('resolveModuleImport()', () => {
      describe('with relative paths', () => {
        it('should resolve sibling, child and aunt modules', () => {
          const resolver = new ModuleResolver(getFileSystem());

          // With relative file paths.
          expect(resolver.resolveModuleImport('./x', _('/libs/local-package/index.js')))
              .toEqual(new ResolvedRelativeModule(_('/libs/local-package/x.js')));
          expect(resolver.resolveModuleImport('./sub-folder', _('/libs/local-package/index.js')))
              .toEqual(new ResolvedRelativeModule(_('/libs/local-package/sub-folder/index.js')));
          expect(resolver.resolveModuleImport('../x', _('/libs/local-package/sub-folder/index.js')))
              .toEqual(new ResolvedRelativeModule(_('/libs/local-package/x.js')));

          // With absolute file paths.
          expect(resolver.resolveModuleImport(
                     _('/libs/local-package/x'), _('/libs/local-package/index.js')))
              .toEqual(new ResolvedRelativeModule(_('/libs/local-package/x.js')));
          expect(resolver.resolveModuleImport(
                     _('/libs/local-package/sub-folder'), _('/libs/local-package/index.js')))
              .toEqual(new ResolvedRelativeModule(_('/libs/local-package/sub-folder/index.js')));
          expect(resolver.resolveModuleImport(
                     _('/libs/local-package/x'), _('/libs/local-package/sub-folder/index.js')))
              .toEqual(new ResolvedRelativeModule(_('/libs/local-package/x.js')));
        });

        it('should return `null` if the resolved module relative module does not exist', () => {
          const resolver = new ModuleResolver(getFileSystem());
          expect(resolver.resolveModuleImport('./y', _('/libs/local-package/index.js'))).toBe(null);
        });

        it('should resolve modules that already include an extension', () => {
          const resolver = new ModuleResolver(getFileSystem());
          expect(resolver.resolveModuleImport('./x.js', _('/libs/local-package/index.js')))
              .toEqual(new ResolvedRelativeModule(_('/libs/local-package/x.js')));
        });
      });

      describe('with non-mapped external paths', () => {
        it('should resolve to the package.json of a local node_modules package', () => {
          const resolver = new ModuleResolver(getFileSystem());
          expect(resolver.resolveModuleImport('package-1', _('/libs/local-package/index.js')))
              .toEqual(new ResolvedExternalModule(_('/libs/local-package/node_modules/package-1')));
          expect(resolver.resolveModuleImport(
                     'package-1', _('/libs/local-package/sub-folder/index.js')))
              .toEqual(new ResolvedExternalModule(_('/libs/local-package/node_modules/package-1')));
          expect(resolver.resolveModuleImport('package-1', _('/libs/local-package/x.js')))
              .toEqual(new ResolvedExternalModule(_('/libs/local-package/node_modules/package-1')));
        });

        it('should resolve to the package.json of a higher node_modules package', () => {
          const resolver = new ModuleResolver(getFileSystem());
          expect(resolver.resolveModuleImport('package-2', _('/libs/local-package/index.js')))
              .toEqual(new ResolvedExternalModule(_('/libs/node_modules/package-2')));
          expect(resolver.resolveModuleImport('top-package', _('/libs/local-package/index.js')))
              .toEqual(new ResolvedExternalModule(_('/node_modules/top-package')));
        });

        it('should return `null` if the package cannot be found', () => {
          const resolver = new ModuleResolver(getFileSystem());
          expect(resolver.resolveModuleImport('missing-2', _('/libs/local-package/index.js')))
              .toBe(null);
        });

        it('should return `null` if the package is not accessible because it is in a inner node_modules package',
           () => {
             const resolver = new ModuleResolver(getFileSystem());
             expect(resolver.resolveModuleImport('package-3', _('/libs/local-package/index.js')))
                 .toBe(null);
           });

        it('should identify deep imports into an external module', () => {
          const resolver = new ModuleResolver(getFileSystem());
          expect(resolver.resolveModuleImport(
                     'package-1/sub-folder', _('/libs/local-package/index.js')))
              .toEqual(new ResolvedDeepImport(
                  _('/libs/local-package/node_modules/package-1/sub-folder')));
        });
      });

      describe('with mapped path external modules', () => {
        it('should resolve to the package.json of simple mapped packages', () => {
          const resolver = new ModuleResolver(
              getFileSystem(), {baseUrl: '/dist', paths: {'*': ['*', 'sub-folder/*']}});

          expect(resolver.resolveModuleImport('package-4', _('/libs/local-package/index.js')))
              .toEqual(new ResolvedExternalModule(_('/dist/package-4')));

          expect(resolver.resolveModuleImport('package-5', _('/libs/local-package/index.js')))
              .toEqual(new ResolvedExternalModule(_('/dist/sub-folder/package-5')));
        });

        it('should select the best match by the length of prefix before the *', () => {
          const resolver = new ModuleResolver(getFileSystem(), {
            baseUrl: '/dist',
            paths: {
              '@lib/*': ['*'],
              '@lib/sub-folder/*': ['*'],
            }
          });

          // We should match the second path (e.g. `'@lib/sub-folder/*'`), which will actually map
          // to `*` and so the final resolved path will not include the `sub-folder` segment.
          expect(resolver.resolveModuleImport(
                     '@lib/sub-folder/package-4', _('/libs/local-package/index.js')))
              .toEqual(new ResolvedExternalModule(_('/dist/package-4')));
        });

        it('should follow the ordering of `paths` when matching mapped packages', () => {
          let resolver: ModuleResolver;

          const fs = getFileSystem();
          resolver =
              new ModuleResolver(fs, {baseUrl: '/dist', paths: {'*': ['*', 'sub-folder/*']}});
          expect(resolver.resolveModuleImport('package-4', _('/libs/local-package/index.js')))
              .toEqual(new ResolvedExternalModule(_('/dist/package-4')));

          resolver =
              new ModuleResolver(fs, {baseUrl: '/dist', paths: {'*': ['sub-folder/*', '*']}});
          expect(resolver.resolveModuleImport('package-4', _('/libs/local-package/index.js')))
              .toEqual(new ResolvedExternalModule(_('/dist/sub-folder/package-4')));
        });

        it('should resolve packages when the path mappings have post-fixes', () => {
          const resolver = new ModuleResolver(
              getFileSystem(), {baseUrl: '/dist', paths: {'*': ['sub-folder/*/post-fix']}});
          expect(resolver.resolveModuleImport('package-5', _('/libs/local-package/index.js')))
              .toEqual(new ResolvedExternalModule(_('/dist/sub-folder/package-5/post-fix')));
        });

        it('should match paths against complex path matchers', () => {
          const resolver = new ModuleResolver(
              getFileSystem(), {baseUrl: '/dist', paths: {'@shared/*': ['sub-folder/*']}});
          expect(
              resolver.resolveModuleImport('@shared/package-4', _('/libs/local-package/index.js')))
              .toEqual(new ResolvedExternalModule(_('/dist/sub-folder/package-4')));
          expect(resolver.resolveModuleImport('package-5', _('/libs/local-package/index.js')))
              .toBe(null);
        });

        it('should resolve path as "relative" if the mapped path is inside the current package',
           () => {
             const resolver = new ModuleResolver(
                 getFileSystem(), {baseUrl: '/dist', paths: {'@shared/*': ['*']}});
             expect(resolver.resolveModuleImport(
                        '@shared/package-4/x', _('/dist/package-4/sub-folder/index.js')))
                 .toEqual(new ResolvedRelativeModule(_('/dist/package-4/x.js')));
           });

        it('should resolve paths where the wildcard matches more than one path segment', () => {
          const resolver = new ModuleResolver(
              getFileSystem(), {baseUrl: '/dist', paths: {'@shared/*/post-fix': ['*/post-fix']}});
          expect(resolver.resolveModuleImport(
                     '@shared/sub-folder/package-5/post-fix',
                     _('/dist/package-4/sub-folder/index.js')))
              .toEqual(new ResolvedExternalModule(_('/dist/sub-folder/package-5/post-fix')));
        });

        it('should resolve primary entry-points if they match non-wildcards exactly', () => {
          const resolver = new ModuleResolver(
              getFileSystem(), {baseUrl: '/dist', paths: {'package-4': ['package-4']}});
          expect(resolver.resolveModuleImport('package-4', _('/libs/local-package/index.js')))
              .toEqual(new ResolvedExternalModule(_('/dist/package-4')));
          expect(resolver.resolveModuleImport(
                     'package-4/secondary-entry-point', _('/libs/local-package/index.js')))
              .toEqual(null);
        });

        it('should resolve secondary entry-points if wildcards match', () => {
          const resolver = new ModuleResolver(getFileSystem(), {
            baseUrl: '/dist',
            paths: {'package-4': ['package-4'], 'package-4/*': ['package-4/*']}
          });
          expect(resolver.resolveModuleImport('package-4', _('/libs/local-package/index.js')))
              .toEqual(new ResolvedExternalModule(_('/dist/package-4')));
          expect(resolver.resolveModuleImport(
                     'package-4/secondary-entry-point', _('/libs/local-package/index.js')))
              .toEqual(new ResolvedExternalModule(_('/dist/package-4/secondary-entry-point')));
        });

        it('should resolve secondary-entry-points referenced from their primary entry-point',
           () => {
             const resolver = new ModuleResolver(getFileSystem(), {
               baseUrl: '/dist',
               paths: {'package-4': ['package-4'], 'package-4/*': ['package-4/*']}
             });
             expect(resolver.resolveModuleImport(
                        'package-4/secondary-entry-point', _('/dist/package-4/index.js')))
                 .toEqual(new ResolvedExternalModule(_('/dist/package-4/secondary-entry-point')));
           });
      });

      describe('with mapped path relative paths', () => {
        it('should resolve to a relative file if found via a paths mapping', () => {
          const resolver = new ModuleResolver(
              getFileSystem(), {baseUrl: '/', paths: {'mapped/*': ['libs/local-package/*']}});

          expect(resolver.resolveModuleImport('mapped/x', _('/libs/local-package/index.js')))
              .toEqual(new ResolvedRelativeModule(_('/libs/local-package/x.js')));
        });
      });
    });
  });
});
