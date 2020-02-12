import {HostTree} from '@angular-devkit/schematics';
import {UnitTestTree} from '@angular-devkit/schematics/testing';
import {getTargetTsconfigPath, getWorkspaceConfigGracefully} from './project-tsconfig-paths';

describe('project tsconfig paths', () => {
  let testTree: UnitTestTree;

  beforeEach(() => { testTree = new UnitTestTree(new HostTree()); });

  it('should detect build tsconfig path inside of angular.json file', () => {
    testTree.create('/my-custom-config.json', '');
    testTree.create('/angular.json', JSON.stringify({
      projects:
        {my_name: {architect: {build: {options: {tsConfig: './my-custom-config.json'}}}}}
    }));

    const config = getWorkspaceConfigGracefully(testTree);
    expect(config).not.toBeNull();
    expect(getTargetTsconfigPath(config!.projects['my_name'], 'build'))
      .toEqual('my-custom-config.json');
  });

  it('should be able to read workspace configuration which is using JSON5 features', () => {
    testTree.create('/my-build-config.json', '');
    testTree.create('/angular.json', `{
      // Comments, unquoted properties or trailing commas are only supported in JSON5.
      projects: {
        with_tests: {
          targets: {
            build: {
              options: {
                tsConfig: './my-build-config.json',
              }
            }
          }
        }
      },
    }`);

    const config = getWorkspaceConfigGracefully(testTree);
    expect(config).not.toBeNull();
    expect(getTargetTsconfigPath(config!.projects['with_tests'], 'build'))
      .toEqual('my-build-config.json');
  });

  it('should detect test tsconfig path inside of angular.json file', () => {
    testTree.create('/my-test-config.json', '');
    testTree.create('/angular.json', JSON.stringify({
      projects: {my_name: {architect: {test: {options: {tsConfig: './my-test-config.json'}}}}}
    }));

    const config = getWorkspaceConfigGracefully(testTree);
    expect(config).not.toBeNull();
    expect(getTargetTsconfigPath(config!.projects['my_name'], 'test'))
      .toEqual('my-test-config.json');
  });

  it('should detect test tsconfig path inside of .angular.json file', () => {
    testTree.create('/my-test-config.json', '');
    testTree.create('/.angular.json', JSON.stringify({
      projects:
        {with_tests: {architect: {test: {options: {tsConfig: './my-test-config.json'}}}}}
    }));

    const config = getWorkspaceConfigGracefully(testTree);
    expect(config).not.toBeNull();
    expect(getTargetTsconfigPath(config!.projects['with_tests'], 'test'))
      .toEqual('my-test-config.json');
  });
});
