import {HostTree} from '@angular-devkit/schematics';
import {UnitTestTree} from '@angular-devkit/schematics/testing';
import {getProjectTsConfigPaths} from './project-tsconfig-paths';

describe('ng-update project-tsconfig-paths', () => {
  let testTree: UnitTestTree;

  beforeEach(() => {
    testTree = new UnitTestTree(new HostTree());
  });

  it('should detect build tsconfig path inside of angular.json file', () => {
    testTree.create('/my-custom-config.json', '');
    testTree.create('/angular.json', JSON.stringify({
      projects: {my_name: {architect: {build: {options: {tsConfig: './my-custom-config.json'}}}}}
    }));

    expect(getProjectTsConfigPaths(testTree)).toEqual(['my-custom-config.json']);
  });

  it('should detect test tsconfig path inside of .angular.json file', () => {
    testTree.create('/my-test-config.json', '');
    testTree.create('/.angular.json', JSON.stringify({
      projects: {with_tests: {architect: {test: {options: {tsConfig: './my-test-config.json'}}}}}
    }));

    expect(getProjectTsConfigPaths(testTree)).toEqual(['my-test-config.json']);
  });

  it('should detect common tsconfigs if no workspace config could be found', () => {
    testTree.create('/tsconfig.json', '');
    testTree.create('/src/tsconfig.json', '');
    testTree.create('/src/tsconfig.app.json', '');

    expect(getProjectTsConfigPaths(testTree)).toEqual([
      'tsconfig.json', 'src/tsconfig.json', 'src/tsconfig.app.json'
    ]);
  });

  it('should not return duplicate tsconfig files', () => {
    testTree.create('/tsconfig.json', '');
    testTree.create('/.angular.json', JSON.stringify({
      projects: {app: {architect: {test: {options: {tsConfig: 'tsconfig.json'}}}}}
    }));

    expect(getProjectTsConfigPaths(testTree)).toEqual(['tsconfig.json']);
  });
});
