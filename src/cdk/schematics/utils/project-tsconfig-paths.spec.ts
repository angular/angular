import {HostTree} from '@angular-devkit/schematics';
import {UnitTestTree} from '@angular-devkit/schematics/testing';
import {WorkspacePath} from '../update-tool/file-system';
import {getTargetTsconfigPath, getWorkspaceConfigGracefully} from './project-tsconfig-paths';

describe('project tsconfig paths', () => {
  let testTree: UnitTestTree;

  beforeEach(() => {
    testTree = new UnitTestTree(new HostTree());
  });

  it('should detect build tsconfig path inside of angular.json file', async () => {
    testTree.create('/my-custom-config.json', '');
    testTree.create(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {
          my_name: {
            architect: {build: {options: {tsConfig: './my-custom-config.json'}}},
            root: 'projects/my_name',
          },
        },
      }),
    );

    const config = await getWorkspaceConfigGracefully(testTree);
    expect(config).not.toBeNull();
    expect(getTargetTsconfigPath(config!.projects!.get('my_name')!, 'build')).toEqual(
      'my-custom-config.json' as WorkspacePath,
    );
  });

  it('should be able to read workspace configuration which is using JSONC features', async () => {
    testTree.create('/my-build-config.json', '');
    testTree.create(
      '/angular.json',
      `{
      // Comments are only supported in JSONC.
      "version": 1,
      "projects": {
        "with_tests": {
          "targets": {
            "build": {
              "options": {
                "tsConfig": "./my-build-config.json"
              }
            }
          }
          "root": "projects/with_tests"
        }
      }
    }`,
    );

    const config = await getWorkspaceConfigGracefully(testTree);
    expect(config).not.toBeNull();
    expect(getTargetTsconfigPath(config!.projects.get('with_tests')!, 'build')).toEqual(
      'my-build-config.json' as WorkspacePath,
    );
  });

  it('should detect test tsconfig path inside of angular.json file', async () => {
    testTree.create('/my-test-config.json', '');
    testTree.create(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {
          my_name: {
            architect: {test: {options: {tsConfig: './my-test-config.json'}}},
            root: 'projects/my_name',
          },
        },
      }),
    );

    const config = await getWorkspaceConfigGracefully(testTree);
    expect(config).not.toBeNull();
    expect(getTargetTsconfigPath(config!.projects.get('my_name')!, 'test')).toEqual(
      'my-test-config.json' as WorkspacePath,
    );
  });

  it('should detect test tsconfig path inside of .angular.json file', async () => {
    testTree.create('/my-test-config.json', '');
    testTree.create(
      '/.angular.json',
      JSON.stringify({
        version: 1,
        projects: {
          with_tests: {
            architect: {test: {options: {tsConfig: './my-test-config.json'}}},
            root: 'projects/with_tests',
          },
        },
      }),
    );

    const config = await getWorkspaceConfigGracefully(testTree);
    expect(config).not.toBeNull();
    expect(getTargetTsconfigPath(config!.projects.get('with_tests')!, 'test')).toEqual(
      'my-test-config.json' as WorkspacePath,
    );
  });
});
