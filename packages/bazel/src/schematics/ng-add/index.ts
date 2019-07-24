/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
 * @fileoverview Schematics for ng-new project that builds with Bazel.
 */

import {JsonAstObject, parseJsonAst} from '@angular-devkit/core';
import {Rule, SchematicContext, SchematicsException, Tree, apply, applyTemplates, chain, mergeWith, url} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from '@angular-devkit/schematics/tasks';
import {getWorkspace, getWorkspacePath} from '@schematics/angular/utility/config';
import {findPropertyInAstObject, insertPropertyInAstObjectInOrder} from '@schematics/angular/utility/json-utils';
import {validateProjectName} from '@schematics/angular/utility/validation';

import {isJsonAstObject, removeKeyValueInAstObject, replacePropertyInAstObject} from '../utility/json-utils';
import {findE2eArchitect} from '../utility/workspace-utils';

import {Schema} from './schema';


/**
 * Packages that build under Bazel require additional dev dependencies. This
 * function adds those dependencies to "devDependencies" section in
 * package.json.
 */
function addDevDependenciesToPackageJson(options: Schema) {
  return (host: Tree) => {
    const packageJson = 'package.json';
    if (!host.exists(packageJson)) {
      throw new Error(`Could not find ${packageJson}`);
    }
    const packageJsonContent = host.read(packageJson);
    if (!packageJsonContent) {
      throw new Error('Failed to read package.json content');
    }
    const jsonAst = parseJsonAst(packageJsonContent.toString()) as JsonAstObject;
    const deps = findPropertyInAstObject(jsonAst, 'dependencies') as JsonAstObject;
    const devDeps = findPropertyInAstObject(jsonAst, 'devDependencies') as JsonAstObject;

    const angularCoreNode = findPropertyInAstObject(deps, '@angular/core');
    if (!angularCoreNode) {
      throw new Error('@angular/core dependency not found in package.json');
    }
    const angularCoreVersion = angularCoreNode.value as string;

    const devDependencies: {[k: string]: string} = {
      '@angular/bazel': angularCoreVersion,
      '@bazel/bazel': '^0.28.1',
      '@bazel/ibazel': '^0.10.2',
      '@bazel/karma': '0.34.0',
      '@bazel/protractor': '0.34.0',
      '@bazel/typescript': '0.34.0',
    };

    const recorder = host.beginUpdate(packageJson);
    for (const packageName of Object.keys(devDependencies)) {
      const existingDep = findPropertyInAstObject(deps, packageName);
      if (existingDep) {
        const content = packageJsonContent.toString();
        removeKeyValueInAstObject(recorder, content, deps, packageName);
      }
      const version = devDependencies[packageName];
      const indent = 4;
      if (findPropertyInAstObject(devDeps, packageName)) {
        replacePropertyInAstObject(recorder, devDeps, packageName, version, indent);
      } else {
        insertPropertyInAstObjectInOrder(recorder, devDeps, packageName, version, indent);
      }
    }
    host.commitUpdate(recorder);
    return host;
  };
}

/**
 * Append additional Javascript / Typescript files needed to compile an Angular
 * project under Bazel.
 */
function addFilesRequiredByBazel(options: Schema) {
  return (host: Tree) => {
    return mergeWith(apply(url('./files'), [
      applyTemplates({}),
    ]));
  };
}

/**
 * Append '/bazel-out' to the gitignore file.
 */
function updateGitignore() {
  return (host: Tree) => {
    const gitignore = '/.gitignore';
    if (!host.exists(gitignore)) {
      return host;
    }
    const gitIgnoreContentRaw = host.read(gitignore);
    if (!gitIgnoreContentRaw) {
      return host;
    }
    const gitIgnoreContent = gitIgnoreContentRaw.toString();
    if (gitIgnoreContent.includes('\n/bazel-out\n')) {
      return host;
    }
    const compiledOutput = '# compiled output\n';
    const index = gitIgnoreContent.indexOf(compiledOutput);
    const insertionIndex = index >= 0 ? index + compiledOutput.length : gitIgnoreContent.length;
    const recorder = host.beginUpdate(gitignore);
    recorder.insertRight(insertionIndex, '/bazel-out\n');
    host.commitUpdate(recorder);
    return host;
  };
}

/**
 * Change the architect in angular.json to use Bazel builder.
 */
function updateAngularJsonToUseBazelBuilder(options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const name = options.name !;
    const workspacePath = getWorkspacePath(host);
    if (!workspacePath) {
      throw new Error('Could not find angular.json');
    }
    const workspaceContent = host.read(workspacePath);
    if (!workspaceContent) {
      throw new Error('Failed to read angular.json content');
    }
    const workspaceJsonAst = parseJsonAst(workspaceContent.toString()) as JsonAstObject;
    const projects = findPropertyInAstObject(workspaceJsonAst, 'projects');
    if (!projects) {
      throw new SchematicsException('Expect projects in angular.json to be an Object');
    }
    const project = findPropertyInAstObject(projects as JsonAstObject, name);
    if (!project) {
      throw new SchematicsException(`Expected projects to contain ${name}`);
    }
    const recorder = host.beginUpdate(workspacePath);
    const indent = 8;
    const architect =
        findPropertyInAstObject(project as JsonAstObject, 'architect') as JsonAstObject;
    replacePropertyInAstObject(
        recorder, architect, 'build', {
          builder: '@angular/bazel:build',
          options: {
            targetLabel: '//src:prodapp',
            bazelCommand: 'build',
          },
          configurations: {
            production: {
              targetLabel: '//src:prodapp',
            },
          },
        },
        indent);
    replacePropertyInAstObject(
        recorder, architect, 'serve', {
          builder: '@angular/bazel:build',
          options: {
            targetLabel: '//src:devserver',
            bazelCommand: 'run',
            watch: true,
          },
          configurations: {
            production: {
              targetLabel: '//src:prodserver',
            },
          },
        },
        indent);

    if (findPropertyInAstObject(architect, 'test')) {
      replacePropertyInAstObject(
          recorder, architect, 'test', {
            builder: '@angular/bazel:build',
            options: {
              bazelCommand: 'test',
              targetLabel: '//src:test',
            },
          },
          indent);
    }

    const e2eArchitect = findE2eArchitect(workspaceJsonAst, name);
    if (e2eArchitect && findPropertyInAstObject(e2eArchitect, 'e2e')) {
      replacePropertyInAstObject(
          recorder, e2eArchitect, 'e2e', {
            builder: '@angular/bazel:build',
            options: {
              bazelCommand: 'test',
              targetLabel: '//e2e:devserver_test',
            },
            configurations: {
              production: {
                targetLabel: '//e2e:prodserver_test',
              },
            }
          },
          indent);
    }

    host.commitUpdate(recorder);
    return host;
  };
}

/**
 * Create a backup for the original angular.json file in case user wants to
 * eject Bazel and revert to the original workflow.
 */
function backupAngularJson(): Rule {
  return (host: Tree, context: SchematicContext) => {
    const workspacePath = getWorkspacePath(host);
    if (!workspacePath) {
      return;
    }
    host.create(
        `${workspacePath}.bak`, '// This is a backup file of the original angular.json. ' +
            'This file is needed in case you want to revert to the workflow without Bazel.\n\n' +
            host.read(workspacePath));
  };
}

/**
 * @angular/bazel requires minimum version of rxjs to be 6.4.0. This function
 * upgrades the version of rxjs in package.json if necessary.
 */
function upgradeRxjs() {
  return (host: Tree, context: SchematicContext) => {
    const packageJson = 'package.json';
    if (!host.exists(packageJson)) {
      throw new Error(`Could not find ${packageJson}`);
    }
    const content = host.read(packageJson);
    if (!content) {
      throw new Error('Failed to read package.json content');
    }
    const jsonAst = parseJsonAst(content.toString());
    if (!isJsonAstObject(jsonAst)) {
      throw new Error(`Failed to parse JSON for ${packageJson}`);
    }
    const deps = findPropertyInAstObject(jsonAst, 'dependencies');
    if (!isJsonAstObject(deps)) {
      throw new Error(`Failed to find dependencies in ${packageJson}`);
    }
    const rxjs = findPropertyInAstObject(deps, 'rxjs');
    if (!rxjs) {
      throw new Error(`Failed to find rxjs in dependencies of ${packageJson}`);
    }
    const value = rxjs.value as string;  // value can be version or range
    const match = value.match(/(\d)+\.(\d)+.(\d)+$/);
    if (match) {
      const [_, major, minor] = match;
      if (major < '6' || (major === '6' && minor < '4')) {
        const recorder = host.beginUpdate(packageJson);
        replacePropertyInAstObject(recorder, deps, 'rxjs', '~6.4.0');
        host.commitUpdate(recorder);
      }
    } else {
      context.logger.info(
          'Could not determine version of rxjs. \n' +
          'Please make sure that version is at least 6.4.0.');
    }
    return host;
  };
}

/**
 * When using Angular NPM packages and building with AOT compilation, ngc
 * requires ngsumamry files but they are not shipped. This function adds a
 * postinstall step to generate these files.
 */
function addPostinstallToGenerateNgSummaries() {
  return (host: Tree, context: SchematicContext) => {
    if (!host.exists('angular-metadata.tsconfig.json')) {
      return;
    }
    const packageJson = 'package.json';
    if (!host.exists(packageJson)) {
      throw new Error(`Could not find ${packageJson}`);
    }
    const content = host.read(packageJson);
    if (!content) {
      throw new Error('Failed to read package.json content');
    }
    const jsonAst = parseJsonAst(content.toString());
    if (!isJsonAstObject(jsonAst)) {
      throw new Error(`Failed to parse JSON for ${packageJson}`);
    }
    const scripts = findPropertyInAstObject(jsonAst, 'scripts') as JsonAstObject;
    const recorder = host.beginUpdate(packageJson);
    if (scripts) {
      insertPropertyInAstObjectInOrder(
          recorder, scripts, 'postinstall', 'ngc -p ./angular-metadata.tsconfig.json', 4);
    } else {
      insertPropertyInAstObjectInOrder(
          recorder, jsonAst, 'scripts', {
            postinstall: 'ngc -p ./angular-metadata.tsconfig.json',
          },
          2);
    }
    host.commitUpdate(recorder);
    return host;
  };
}

/**
 * Schedule a task to perform npm / yarn install.
 */
function installNodeModules(options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (!options.skipInstall) {
      context.addTask(new NodePackageInstallTask());
    }
  };
}

export default function(options: Schema): Rule {
  return (host: Tree) => {
    options.name = options.name || getWorkspace(host).defaultProject;
    if (!options.name) {
      throw new Error('Please specify a project using "--name project-name"');
    }
    validateProjectName(options.name);

    return chain([
      addFilesRequiredByBazel(options),
      addDevDependenciesToPackageJson(options),
      addPostinstallToGenerateNgSummaries(),
      backupAngularJson(),
      updateAngularJsonToUseBazelBuilder(options),
      updateGitignore(),
      upgradeRxjs(),
      installNodeModules(options),
    ]);
  };
}
