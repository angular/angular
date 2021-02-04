/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {createHash} from 'crypto';

import {absoluteFrom, getFileSystem, ReadonlyFileSystem} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadTestFiles} from '../../../src/ngtsc/testing';
import {DEFAULT_NGCC_CONFIG, NgccConfiguration, NgccProjectConfig, ProcessLockingConfiguration, RawNgccPackageConfig} from '../../src/packages/configuration';


runInEachFileSystem(() => {
  let _Abs: typeof absoluteFrom;
  let fs: ReadonlyFileSystem;

  beforeEach(() => {
    _Abs = absoluteFrom;
    fs = getFileSystem();
  });

  describe('NgccConfiguration', () => {
    describe('constructor', () => {
      it('should error if a project level config file is badly formatted', () => {
        loadTestFiles([{name: _Abs('/project-1/ngcc.config.js'), contents: `bad js code`}]);
        expect(() => new NgccConfiguration(fs, _Abs('/project-1')))
            .toThrowError(`Invalid project configuration file at "${
                _Abs('/project-1/ngcc.config.js')}": Unexpected identifier`);
      });
    });

    describe('hash', () => {
      it('should compute a hash from the loaded and processed project configuration', () => {
        const project1 = _Abs('/project-1');
        const project1Config = fs.resolve(project1, 'ngcc.config.js');

        loadTestFiles([{
          name: project1Config,
          contents: `
            module.exports = {
              packages: {
                'package-1': {entryPoints: {'./entry-point-1': {}}},
              },
            };`
        }]);
        const project1Conf = new NgccConfiguration(fs, project1);
        const expectedProject1Config =
            `{"packages":{"package-1":[{"entryPoints":{"./entry-point-1":{}},"versionRange":"*"}]},"locking":{}}`;
        expect(project1Conf.hash)
            .toEqual(createHash('md5').update(expectedProject1Config).digest('hex'));

        const project2 = _Abs('/project-2');
        const project2Config = fs.resolve(project2, 'ngcc.config.js');

        loadTestFiles([{
          name: project2Config,
          contents: `
              module.exports = {
                packages: {
                  'package-1': {entryPoints: {'./entry-point-1': {ignore: true}}},
                },
              };`
        }]);
        const project2Conf = new NgccConfiguration(fs, project2);
        const expectedProject2Config =
            `{"packages":{"package-1":[{"entryPoints":{"./entry-point-1":{"ignore":true}},"versionRange":"*"}]},"locking":{}}`;
        expect(project2Conf.hash)
            .toEqual(createHash('md5').update(expectedProject2Config).digest('hex'));
      });

      it('should compute a hash even if there is no project configuration', () => {
        loadTestFiles([{name: _Abs('/project-1/empty.js'), contents: ``}]);
        const configuration = new NgccConfiguration(fs, _Abs('/project-1'));
        expect(configuration.hash)
            .toEqual(createHash('md5')
                         .update(JSON.stringify({packages: {}, locking: {}}))
                         .digest('hex'));
      });
    });

    describe('getPackageConfig()', () => {
      describe('at the package level', () => {
        it('should return configuration for a package found in a package level file, with a matching version',
           () => {
             loadTestFiles(packageWithConfigFiles('package-1', 'entry-point-1', '1.0.0'));
             const readFileSpy = spyOn(fs, 'readFile').and.callThrough();
             const configuration = new NgccConfiguration(fs, _Abs('/project-1'));
             const config = configuration.getPackageConfig(
                 'package-1', _Abs('/project-1/node_modules/package-1'), '1.0.0');

             expect(config).toEqual(jasmine.objectContaining({
               ignorableDeepImportMatchers: [],
               entryPoints: new Map([
                 [_Abs('/project-1/node_modules/package-1/entry-point-1'), {}],
               ]),
             }));
             expect(readFileSpy)
                 .toHaveBeenCalledWith(_Abs('/project-1/node_modules/package-1/ngcc.config.js'));
           });

        it('should cope with configurations missing an `entryPoints` property', () => {
          loadTestFiles([
            {
              name: _Abs('/project-1/node_modules/package-1/package.json'),
              contents: '{"version": "1.0.0"}',
            },
            {
              name: _Abs('/project-1/node_modules/package-1/ngcc.config.js'),
              contents: `
                module.exports = {
                  ignorableDeepImportMatchers: [ /xxx/ ],
                };
              `,
            },
          ]);

          const configuration = new NgccConfiguration(fs, _Abs('/project-1'));
          const config = configuration.getPackageConfig(
              'package-1', _Abs('/project-1/node_modules/package-1'), '1.0.0');

          expect(config).toEqual(jasmine.objectContaining({
            ignorableDeepImportMatchers: [/xxx/],
            entryPoints: new Map(),
          }));
        });

        it('should read extra package config from package level file', () => {
          loadTestFiles(packageWithConfigFiles(
              'package-1', 'entry-point-1', '1.0.0', 'ignorableDeepImportMatchers: [ /xxx/ ]'));
          const configuration = new NgccConfiguration(fs, _Abs('/project-1'));
          const config = configuration.getPackageConfig(
              'package-1', _Abs('/project-1/node_modules/package-1'), '1.0.0');

          expect(config).toEqual(jasmine.objectContaining({
            ignorableDeepImportMatchers: [/xxx/],
            entryPoints: new Map([
              [_Abs('/project-1/node_modules/package-1/entry-point-1'), {}],
            ]),
          }));
        });

        it('should used cached configuration for a package if available', () => {
          loadTestFiles(packageWithConfigFiles('package-1', 'entry-point-1', '1.0.0'));
          const configuration = new NgccConfiguration(fs, _Abs('/project-1'));

          // Populate the cache
          configuration.getPackageConfig(
              'package-1', _Abs('/project-1/node_modules/package-1'), '1.0.0');

          const readFileSpy = spyOn(fs, 'readFile').and.callThrough();
          const config = configuration.getPackageConfig(
              'package-1', _Abs('/project-1/node_modules/package-1'), '1.0.0');

          expect(config).toEqual(jasmine.objectContaining({
            ignorableDeepImportMatchers: [],
            entryPoints: new Map([
              [_Abs('/project-1/node_modules/package-1/entry-point-1'), {}],
            ]),
          }));
          expect(readFileSpy).not.toHaveBeenCalled();
        });

        it('should return an empty configuration object if there is no matching configuration for the package',
           () => {
             loadTestFiles(packageWithConfigFiles('package-2', 'entry-point-1', '1.0.0'));
             const configuration = new NgccConfiguration(fs, _Abs('/project-1'));
             const config = configuration.getPackageConfig(
                 'package-1', _Abs('/project-1/node_modules/package-1'), '1.0.0');
             expect(config).toEqual(jasmine.objectContaining({
               ignorableDeepImportMatchers: [],
               entryPoints: new Map(),
             }));
           });

        it('should error if a package level config file is badly formatted', () => {
          loadTestFiles([{
            name: _Abs('/project-1/node_modules/package-1/ngcc.config.js'),
            contents: `bad js code`
          }]);
          const configuration = new NgccConfiguration(fs, _Abs('/project-1'));
          expect(
              () => configuration.getPackageConfig(
                  'package-1', _Abs('/project-1/node_modules/package-1'), '1.0.0'))
              .toThrowError(`Invalid package configuration file at "${
                  _Abs(
                      '/project-1/node_modules/package-1/ngcc.config.js')}": Unexpected identifier`);
        });

        it('should correctly differentiate packages in nested `node_modules/`', () => {
          loadTestFiles([
            ...packageWithConfigFiles('package-1', 'entry-point-1', '1.0.0'),
            ...packageWithConfigFiles('package-2/node_modules/package-1', 'entry-point-2', '2.0.0'),
          ]);

          const configuration = new NgccConfiguration(fs, _Abs('/project-1'));

          expect(configuration.getPackageConfig(
                     'package-1', _Abs('/project-1/node_modules/package-1'), '1.0.0'))
              .toEqual(jasmine.objectContaining({
                ignorableDeepImportMatchers: [],
                entryPoints: new Map([
                  [_Abs('/project-1/node_modules/package-1/entry-point-1'), {}],
                ]),
              }));

          expect(configuration.getPackageConfig(
                     'package-1', _Abs('/project-1/node_modules/package-2/node_modules/package-1'),
                     '2.0.0'))
              .toEqual(jasmine.objectContaining({
                ignorableDeepImportMatchers: [],
                entryPoints: new Map([
                  [
                    _Abs('/project-1/node_modules/package-2/node_modules/package-1/entry-point-2'),
                    {},
                  ],
                ]),
              }));

          // It should also be able to return a cached config for a package name/version
          // combination, but adjust the entry-point paths.
          // NOTE: While the package does not exist on the test file system, we are able to retrieve
          //       the config from cache.
          expect(configuration.getPackageConfig(
                     'package-1', _Abs('/project-1/node_modules/package-3/node_modules/package-1'),
                     '1.0.0'))
              .toEqual(jasmine.objectContaining({
                ignorableDeepImportMatchers: [],
                entryPoints: new Map([
                  [
                    _Abs('/project-1/node_modules/package-3/node_modules/package-1/entry-point-1'),
                    {},
                  ],
                ]),
              }));
        });
      });

      describe('at the project level', () => {
        it('should return configuration for a package found in a project level file', () => {
          loadTestFiles([{
            name: _Abs('/project-1/ngcc.config.js'),
            contents: `
              module.exports = {
                packages: {
                  'package-1': {
                    entryPoints: {
                      './entry-point-1': {}
                    },
                    ignorableDeepImportMatchers: [ /xxx/ ],
                  },
                },
              };`
          }]);
          const configuration = new NgccConfiguration(fs, _Abs('/project-1'));
          const config = configuration.getPackageConfig(
              'package-1', _Abs('/project-1/node_modules/package-1'), '1.0.0');
          expect(config).toEqual(jasmine.objectContaining({
            ignorableDeepImportMatchers: [/xxx/],
            entryPoints: new Map([
              [_Abs('/project-1/node_modules/package-1/entry-point-1'), {}],
            ]),
          }));
        });

        it('should cope with configurations missing an `entryPoints` property', () => {
          loadTestFiles([
            {
              name: _Abs('/project-1/ngcc.config.js'),
              contents: `
                module.exports = {
                  packages: {
                    'package-1': {
                      ignorableDeepImportMatchers: [ /xxx/ ],
                    },
                  },
                };
              `,
            },
          ]);

          const configuration = new NgccConfiguration(fs, _Abs('/project-1'));
          const config = configuration.getPackageConfig(
              'package-1', _Abs('/project-1/node_modules/package-1'), '1.0.0');

          expect(config).toEqual(jasmine.objectContaining({
            ignorableDeepImportMatchers: [/xxx/],
            entryPoints: new Map(),
          }));
        });

        it('should return configuration for the correct version of a package found in a project level file',
           () => {
             loadTestFiles([{
               name: _Abs('/project-1/ngcc.config.js'),
               contents: `
              module.exports = {
                packages: {
                  'package-1@1.0.0': {
                    entryPoints: {
                      './entry-point-1': {}
                    },
                  },
                  'package-1@2.*': {
                    entryPoints: {
                      './entry-point-2': {}
                    },
                  },
                  'package-1@^3.2.0': {
                    entryPoints: {
                      './entry-point-3': {}
                    },
                  },
                },
              };`
             }]);
             const configuration = new NgccConfiguration(fs, _Abs('/project-1'));

             expect(configuration.getPackageConfig(
                        'package-1', _Abs('/project-1/node_modules/package-1'), '1.0.0'))
                 .toEqual(jasmine.objectContaining({
                   ignorableDeepImportMatchers: [],
                   entryPoints: new Map([
                     [_Abs('/project-1/node_modules/package-1/entry-point-1'), {}],
                   ]),
                 }));
             expect(configuration.getPackageConfig(
                        'package-1', _Abs('/project-1/node_modules/package-1'), '2.5.0'))
                 .toEqual(jasmine.objectContaining({
                   ignorableDeepImportMatchers: [],
                   entryPoints: new Map([
                     [_Abs('/project-1/node_modules/package-1/entry-point-2'), {}],
                   ]),
                 }));
             expect(configuration.getPackageConfig(
                        'package-1', _Abs('/project-1/node_modules/package-1'), '3.2.5'))
                 .toEqual(jasmine.objectContaining({
                   ignorableDeepImportMatchers: [],
                   entryPoints: new Map([
                     [_Abs('/project-1/node_modules/package-1/entry-point-3'), {}],
                   ]),
                 }));
             expect(configuration.getPackageConfig(
                        'package-1', _Abs('/project-1/node_modules/package-1'), '4.0.0'))
                 .toEqual(jasmine.objectContaining({
                   ignorableDeepImportMatchers: [],
                   entryPoints: new Map(),
                 }));
           });

        it('should correctly handle pre-release versions and version ranges', () => {
          loadTestFiles([
            {
              name: _Abs('/project-1/ngcc.config.js'),
              contents: `
                module.exports = {
                  packages: {
                    'package-1': {
                      entryPoints: {
                        './entry-point-1': {},
                      },
                    },
                    'package-2@1.0.0-beta.2': {
                      entryPoints: {
                        './entry-point-2': {},
                      },
                    },
                    'package-3@>=1.0.0-beta.2': {
                      entryPoints: {
                        './entry-point-3': {},
                      },
                    },
                  },
                };
              `,
            },
          ]);

          const NO_CONFIG = jasmine.objectContaining({
            ignorableDeepImportMatchers: [],
            entryPoints: new Map(),
          });
          const PACKAGE_1_CONFIG = jasmine.objectContaining({
            ignorableDeepImportMatchers: [],
            entryPoints: new Map([
              [_Abs('/project-1/node_modules/package-1/entry-point-1'), {}],
            ]),
          });
          const PACKAGE_2_CONFIG = jasmine.objectContaining({
            ignorableDeepImportMatchers: [],
            entryPoints: new Map([
              [_Abs('/project-1/node_modules/package-2/entry-point-2'), {}],
            ]),
          });
          const PACKAGE_3_CONFIG = jasmine.objectContaining({
            ignorableDeepImportMatchers: [],
            entryPoints: new Map([
              [_Abs('/project-1/node_modules/package-3/entry-point-3'), {}],
            ]),
          });

          const configuration = new NgccConfiguration(fs, _Abs('/project-1'));
          const getConfig = (packageName: string, version: string|null) =>
              configuration.getPackageConfig(
                  packageName, _Abs(`/project-1/node_modules/${packageName}`), version);

          // Default version range: *
          expect(getConfig('package-1', '1.0.0-beta.2'))
              .toEqual(PACKAGE_1_CONFIG, 'Config for package-1@1.0.0-beta.2');

          // Version range: 1.0.0-beta.2
          expect(getConfig('package-2', '1.0.0-beta.2'))
              .toEqual(PACKAGE_2_CONFIG, 'Config for package-2@1.0.0-beta.2');

          expect(getConfig('package-2', '1.0.0')).toEqual(NO_CONFIG, 'Config for package-2@1.0.0');

          expect(getConfig('package-2', null))
              .toEqual(PACKAGE_2_CONFIG, 'Config for package-2@null');

          // Version range: >=1.0.0-beta.2
          expect(getConfig('package-3', '1.0.0-beta.2'))
              .toEqual(PACKAGE_3_CONFIG, 'Config for package-3@1.0.0-beta.2');

          expect(getConfig('package-3', '1.0.0'))
              .toEqual(PACKAGE_3_CONFIG, 'Config for package-3@1.0.0');

          expect(getConfig('package-3', '2.0.0'))
              .toEqual(PACKAGE_3_CONFIG, 'Config for package-3@2.0.0');

          expect(getConfig('package-3', '1.0.0-beta.1'))
              .toEqual(NO_CONFIG, 'Config for package-3@1.0.0-beta.1');

          expect(getConfig('package-3', '0.9.99'))
              .toEqual(NO_CONFIG, 'Config for package-3@0.9.99');
        });

        it('should not get confused by the @ in namespaced packages', () => {
          loadTestFiles([{
            name: _Abs('/project-1/ngcc.config.js'),
            contents: `
              module.exports = {
                packages: {
                  '@angular/common': {
                    entryPoints: {
                      '.': {}
                    },
                  },
                },
              };`
          }]);
          const configuration = new NgccConfiguration(fs, _Abs('/project-1'));

          expect(configuration.getPackageConfig(
                     '@angular/common', _Abs('/project-1/node_modules/@angular/common'), '1.0.0'))
              .toEqual(jasmine.objectContaining({
                ignorableDeepImportMatchers: [],
                entryPoints: new Map([
                  [_Abs('/project-1/node_modules/@angular/common'), {}],
                ]),
              }));
        });

        it('should override package level config with project level config per package', () => {
          loadTestFiles([{
            name: _Abs('/project-1/ngcc.config.js'),
            contents: `
              module.exports = {
                packages: {
                  'package-2': {
                    entryPoints: {
                      './project-setting-entry-point': {}
                    },
                  },
                },
              };`,
          }]);
          loadTestFiles(
              packageWithConfigFiles('package-1', 'package-setting-entry-point', '1.0.0'));
          loadTestFiles(
              packageWithConfigFiles('package-2', 'package-setting-entry-point', '1.0.0'));

          const readFileSpy = spyOn(fs, 'readFile').and.callThrough();
          const configuration = new NgccConfiguration(fs, _Abs('/project-1'));
          expect(readFileSpy).toHaveBeenCalledWith(_Abs('/project-1/ngcc.config.js'));

          const package1Config = configuration.getPackageConfig(
              'package-1', _Abs('/project-1/node_modules/package-1'), '1.0.0');
          expect(package1Config).toEqual(jasmine.objectContaining({
            ignorableDeepImportMatchers: [],
            entryPoints: new Map([
              [_Abs('/project-1/node_modules/package-1/package-setting-entry-point'), {}],
            ]),
          }));
          expect(readFileSpy)
              .toHaveBeenCalledWith(_Abs('/project-1/node_modules/package-1/ngcc.config.js'));

          // Note that for `package-2` only the project level entry-point is left.
          // This is because overriding happens for packages as a whole and there is no attempt to
          // merge entry-points.
          const package2Config = configuration.getPackageConfig(
              'package-2', _Abs('/project-1/node_modules/package-2'), '1.0.0');
          expect(package2Config).toEqual(jasmine.objectContaining({
            ignorableDeepImportMatchers: [],
            entryPoints: new Map([
              [_Abs('/project-1/node_modules/package-2/project-setting-entry-point'), {}],
            ]),
          }));
          expect(readFileSpy)
              .not.toHaveBeenCalledWith(_Abs('/project-1/node_modules/package-2/ngcc.config.js'));
        });

        it('should correctly match packages in nested `node_modules/` (and adjust entry-point paths)',
           () => {
             loadTestFiles([
               {
                 name: _Abs('/project-1/ngcc.config.js'),
                 contents: `
                   module.exports = {
                     packages: {
                       'package-1': {
                         entryPoints: {
                           '.': {},
                           'foo': {},
                           './bar': {},
                         },
                       },
                     },
                   };
                 `,
               },
             ]);

             const configuration = new NgccConfiguration(fs, _Abs('/project-1'));

             expect(configuration.getPackageConfig(
                        'package-1', _Abs('/project-1/node_modules/package-1'), '1.0.0'))
                 .toEqual(jasmine.objectContaining({
                   ignorableDeepImportMatchers: [],
                   entryPoints: new Map([
                     [_Abs('/project-1/node_modules/package-1'), {}],
                     [_Abs('/project-1/node_modules/package-1/foo'), {}],
                     [_Abs('/project-1/node_modules/package-1/bar'), {}],
                   ]),
                 }));

             expect(configuration.getPackageConfig(
                        'package-1',
                        _Abs('/project-1/node_modules/other-package/node_modules/package-1'),
                        '2.0.0'))
                 .toEqual(jasmine.objectContaining({
                   ignorableDeepImportMatchers: [],
                   entryPoints: new Map([
                     [_Abs('/project-1/node_modules/other-package/node_modules/package-1'), {}],
                     [_Abs('/project-1/node_modules/other-package/node_modules/package-1/foo'), {}],
                     [_Abs('/project-1/node_modules/other-package/node_modules/package-1/bar'), {}],
                   ]),
                 }));
           });
      });

      describe('at the default level', () => {
        const originalDefaultConfig = JSON.stringify(DEFAULT_NGCC_CONFIG.packages);
        beforeEach(() => {
          DEFAULT_NGCC_CONFIG.packages!['package-1'] = {
            entryPoints: {'./default-level-entry-point': {}},
          };
        });
        afterEach(
            () => DEFAULT_NGCC_CONFIG.packages =
                JSON.parse(originalDefaultConfig) as NgccProjectConfig['packages']);

        it('should return configuration for a package found in the default config', () => {
          const readFileSpy = spyOn(fs, 'readFile').and.callThrough();
          const configuration = new NgccConfiguration(fs, _Abs('/project-1'));
          expect(readFileSpy).not.toHaveBeenCalled();

          const config = configuration.getPackageConfig(
              'package-1', _Abs('/project-1/node_modules/package-1'), '1.0.0');
          expect(config).toEqual(jasmine.objectContaining({
            ignorableDeepImportMatchers: [],
            entryPoints: new Map([
              [_Abs('/project-1/node_modules/package-1/default-level-entry-point'), {}],
            ]),
          }));
        });

        it('should cope with configurations missing an `entryPoints` property', () => {
          DEFAULT_NGCC_CONFIG.packages!['package-1'] = {
            ignorableDeepImportMatchers: [/xxx/],
          };

          const configuration = new NgccConfiguration(fs, _Abs('/project-1'));
          const config = configuration.getPackageConfig(
              'package-1', _Abs('/project-1/node_modules/package-1'), '1.0.0');

          expect(config).toEqual(jasmine.objectContaining({
            ignorableDeepImportMatchers: [/xxx/],
            entryPoints: new Map(),
          }));
        });

        it('should override default level config with package level config, if provided', () => {
          loadTestFiles(packageWithConfigFiles('package-1', 'package-level-entry-point', '1.0.0'));
          const configuration = new NgccConfiguration(fs, _Abs('/project-1'));
          const config = configuration.getPackageConfig(
              'package-1', _Abs('/project-1/node_modules/package-1'), '1.0.0');
          // Note that only the package-level-entry-point is left.
          // This is because overriding happens for packages as a whole and there is no attempt to
          // merge entry-points.
          expect(config).toEqual(jasmine.objectContaining({
            ignorableDeepImportMatchers: [],
            entryPoints: new Map([
              [_Abs('/project-1/node_modules/package-1/package-level-entry-point'), {}],
            ]),
          }));
        });

        it('should override default level config with project level config, if provided', () => {
          loadTestFiles(packageWithConfigFiles('package-1', 'package-level-entry-point', '1.0.0'));
          loadTestFiles([
            {
              name: _Abs('/project-1/node_modules/package-1/ngcc.config.js'),
              contents: `
            module.exports = {
              entryPoints: {'./package-level-entry-point': {}},
            };`,
            },
            {
              name: _Abs('/project-1/ngcc.config.js'),
              contents: `
            module.exports = {
              packages: {
                'package-1': {
                  entryPoints: {
                    './project-level-entry-point': {}
                  },
                },
              },
            };`,
            },
          ]);

          const configuration = new NgccConfiguration(fs, _Abs('/project-1'));
          const config = configuration.getPackageConfig(
              'package-1', _Abs('/project-1/node_modules/package-1'), '1.0.0');
          // Note that only the project-level-entry-point is left.
          // This is because overriding happens for packages as a whole and there is no attempt to
          // merge entry-points.
          expect(config).toEqual(jasmine.objectContaining({
            ignorableDeepImportMatchers: [],
            entryPoints: new Map([
              [_Abs('/project-1/node_modules/package-1/project-level-entry-point'), {}],
            ]),
          }));
        });

        it('should correctly handle pre-release versions and version ranges', () => {
          Object.assign(DEFAULT_NGCC_CONFIG.packages, {
            'package-1': {
              entryPoints: {
                './entry-point-1': {},
              },
            },
            'package-2@1.0.0-beta.2': {
              entryPoints: {
                './entry-point-2': {},
              },
            },
            'package-3@>=1.0.0-beta.2': {
              entryPoints: {
                './entry-point-3': {},
              },
            },
          });

          const NO_CONFIG = jasmine.objectContaining({
            ignorableDeepImportMatchers: [],
            entryPoints: new Map(),
          });
          const PACKAGE_1_CONFIG = jasmine.objectContaining({
            ignorableDeepImportMatchers: [],
            entryPoints: new Map([
              [_Abs('/project-1/node_modules/package-1/entry-point-1'), {}],
            ]),
          });
          const PACKAGE_2_CONFIG = jasmine.objectContaining({
            ignorableDeepImportMatchers: [],
            entryPoints: new Map([
              [_Abs('/project-1/node_modules/package-2/entry-point-2'), {}],
            ]),
          });
          const PACKAGE_3_CONFIG = jasmine.objectContaining({
            ignorableDeepImportMatchers: [],
            entryPoints: new Map([
              [_Abs('/project-1/node_modules/package-3/entry-point-3'), {}],
            ]),
          });

          const configuration = new NgccConfiguration(fs, _Abs('/project-1'));
          const getConfig = (packageName: string, version: string|null) =>
              configuration.getPackageConfig(
                  packageName, _Abs(`/project-1/node_modules/${packageName}`), version);

          // Default version range: *
          expect(getConfig('package-1', '1.0.0-beta.2'))
              .toEqual(PACKAGE_1_CONFIG, 'Config for package-1@1.0.0-beta.2');

          // Version range: 1.0.0-beta.2
          expect(getConfig('package-2', '1.0.0-beta.2'))
              .toEqual(PACKAGE_2_CONFIG, 'Config for package-2@1.0.0-beta.2');

          expect(getConfig('package-2', '1.0.0')).toEqual(NO_CONFIG, 'Config for package-2@1.0.0');

          expect(getConfig('package-2', null))
              .toEqual(PACKAGE_2_CONFIG, 'Config for package-2@null');

          // Version range: >=1.0.0-beta.2
          expect(getConfig('package-3', '1.0.0-beta.2'))
              .toEqual(PACKAGE_3_CONFIG, 'Config for package-3@1.0.0-beta.2');

          expect(getConfig('package-3', '1.0.0'))
              .toEqual(PACKAGE_3_CONFIG, 'Config for package-3@1.0.0');

          expect(getConfig('package-3', '2.0.0'))
              .toEqual(PACKAGE_3_CONFIG, 'Config for package-3@2.0.0');

          expect(getConfig('package-3', '1.0.0-beta.1'))
              .toEqual(NO_CONFIG, 'Config for package-3@1.0.0-beta.1');

          expect(getConfig('package-3', '0.9.99'))
              .toEqual(NO_CONFIG, 'Config for package-3@0.9.99');
        });

        it('should correctly match packages in nested `node_modules/` (and adjust entry-point paths)',
           () => {
             DEFAULT_NGCC_CONFIG.packages!['package-1'] = {
               entryPoints: {
                 '.': {},
                 'foo': {},
                 './bar': {},
               },
             };

             const configuration = new NgccConfiguration(fs, _Abs('/project-1'));

             expect(configuration.getPackageConfig(
                        'package-1', _Abs('/project-1/node_modules/package-1'), '1.0.0'))
                 .toEqual(jasmine.objectContaining({
                   ignorableDeepImportMatchers: [],
                   entryPoints: new Map([
                     [_Abs('/project-1/node_modules/package-1'), {}],
                     [_Abs('/project-1/node_modules/package-1/foo'), {}],
                     [_Abs('/project-1/node_modules/package-1/bar'), {}],
                   ]),
                 }));

             expect(configuration.getPackageConfig(
                        'package-1',
                        _Abs('/project-1/node_modules/other-package/node_modules/package-1'),
                        '2.0.0'))
                 .toEqual(jasmine.objectContaining({
                   ignorableDeepImportMatchers: [],
                   entryPoints: new Map([
                     [_Abs('/project-1/node_modules/other-package/node_modules/package-1'), {}],
                     [_Abs('/project-1/node_modules/other-package/node_modules/package-1/foo'), {}],
                     [_Abs('/project-1/node_modules/other-package/node_modules/package-1/bar'), {}],
                   ]),
                 }));
           });
      });
    });

    describe('getLockingConfig()', () => {
      let originalDefaultConfig: ProcessLockingConfiguration|undefined;
      beforeEach(() => {
        originalDefaultConfig = DEFAULT_NGCC_CONFIG.locking;
        DEFAULT_NGCC_CONFIG.locking = {retryAttempts: 17, retryDelay: 400};
      });
      afterEach(() => DEFAULT_NGCC_CONFIG.locking = originalDefaultConfig);

      it('should return configuration for locking found in a project level file', () => {
        loadTestFiles([{
          name: _Abs('/project-1/ngcc.config.js'),
          contents: `
                module.exports = {
                  locking: {
                    retryAttempts: 4,
                    retryDelay: 56,
                  },
                };`
        }]);
        const configuration = new NgccConfiguration(fs, _Abs('/project-1'));
        const config = configuration.getLockingConfig();
        expect(config).toEqual({
          retryAttempts: 4,
          retryDelay: 56,
        });
      });

      it('should return configuration for locking partially found in a project level file', () => {
        loadTestFiles([{
          name: _Abs('/project-1/ngcc.config.js'),
          contents: `
              module.exports = {
                locking: {
                  retryAttempts: 4,
                },
              };`
        }]);
        const configuration = new NgccConfiguration(fs, _Abs('/project-1'));
        const config = configuration.getLockingConfig();
        expect(config).toEqual({
          retryAttempts: 4,
          retryDelay: 400,
        });
      });

      it('should return default configuration for locking if no project level file', () => {
        const configuration = new NgccConfiguration(fs, _Abs('/project-1'));
        const config = configuration.getLockingConfig();
        expect(config).toEqual({
          retryAttempts: 17,
          retryDelay: 400,
        });
      });
    });
  });

  function packageWithConfigFiles(
      packageName: string, entryPointName: string, version: string, extraConfig: string = '') {
    return [
      {
        name: _Abs(`/project-1/node_modules/${packageName}/ngcc.config.js`),
        contents: `
        module.exports = {
          entryPoints: { './${entryPointName}': {} },
          ${extraConfig}
        };`
      },
      {
        name: _Abs(`/project-1/node_modules/${packageName}/package.json`),
        contents: `{ "version": "${version}" }`
      }
    ];
  }
});
