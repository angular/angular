/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
 * @fileoverview Schematics for ng-new project that builds with Bazel.
 */

import {JsonAstObject, parseJsonAst} from '@angular-devkit/core';
import {apply, applyTemplates, chain, mergeWith, Rule, SchematicContext, SchematicsException, Tree, url} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from '@angular-devkit/schematics/tasks';
import {getWorkspace, getWorkspacePath} from '@schematics/angular/utility/config';
import {addPackageJsonDependency, getPackageJsonDependency, NodeDependencyType, removePackageJsonDependency} from '@schematics/angular/utility/dependencies';
import {findPropertyInAstObject, insertPropertyInAstObjectInOrder} from '@schematics/angular/utility/json-utils';
import {validateProjectName} from '@schematics/angular/utility/validation';

import {isJsonAstObject, replacePropertyInAstObject} from '../utility/json-utils';
import {findE2eArchitect} from '../utility/workspace-utils';

import {Schema} from './schema';



/**
 * Packages that build under Bazel require additional dev dependencies. This
 * function adds those dependencies to "devDependencies" section in
 * package.json.
 */
function addDevDependenciesToPackageJson(options: Schema) {
  return (host: Tree) => {
    const angularCore = getPackageJsonDependency(host, '@angular/core');
    if (!angularCore) {
      throw new Error('@angular/core dependency not found in package.json');
    }

    // TODO: use a Record<string, string> when the tsc lib setting allows us
    const devDependencies: [string, string][] = [
      ['@angular/bazel', angularCore.version],
      ['@bazel/bazel', '2.1.0'],
      ['@bazel/ibazel', '0.12.3'],
      ['@bazel/karma', '1.6.0'],
      ['@bazel/protractor', '1.6.0'],
      ['@bazel/rollup', '1.6.0'],
      ['@bazel/terser', '1.6.0'],
      ['@bazel/typescript', '1.6.0'],
      ['history-server', '1.3.1'],
      ['html-insert-assets', '0.5.0'],
      ['karma', '4.4.1'],
      ['karma-chrome-launcher', '3.1.0'],
      ['karma-firefox-launcher', '1.2.0'],
      ['karma-jasmine', '2.0.1'],
      ['karma-requirejs', '1.1.0'],
      ['karma-sourcemap-loader', '0.3.7'],
      ['protractor', '5.4.2'],
      ['requirejs', '2.3.6'],
      ['rollup', '1.27.5'],
      ['rollup-plugin-commonjs', '10.1.0'],
      ['rollup-plugin-node-resolve', '5.2.0'],
      ['terser', '4.4.0'],
    ];

    for (const [name, version] of devDependencies) {
      const dep = getPackageJsonDependency(host, name);
      if (dep && dep.type !== NodeDependencyType.Dev) {
        removePackageJsonDependency(host, name);
      }

      addPackageJsonDependency(host, {
        name,
        version,
        type: NodeDependencyType.Dev,
        overwrite: true,
      });
    }
  };
}

/**
 * Remove packages that are not needed under Bazel.
 * @param options
 */
function removeObsoleteDependenciesFromPackageJson(options: Schema) {
  return (host: Tree) => {
    const depsToRemove = [
      '@angular-devkit/build-angular',
    ];

    for (const packageName of depsToRemove) {
      removePackageJsonDependency(host, packageName);
    }
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
  return (host: Tree) => {
    const name = options.name!;
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
        `${workspacePath}.bak`,
        '// This is a backup file of the original angular.json. ' +
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
    const rxjsNode = getPackageJsonDependency(host, 'rxjs');
    if (!rxjsNode) {
      throw new Error(`Failed to find rxjs dependency.`);
    }

    const match = rxjsNode.version.match(/(\d)+\.(\d)+.(\d)+$/);
    if (match) {
      const [_, major, minor] = match;
      if (major < '6' || (major === '6' && minor < '5')) {
        addPackageJsonDependency(host, {
          ...rxjsNode,
          version: '~6.5.3',
          overwrite: true,
        });
      }
    } else {
      context.logger.info(
          'Could not determine version of rxjs. \n' +
          'Please make sure that version is at least 6.5.3.');
    }
    return host;
  };
}

/**
 * When using Ivy, ngcc must be run as a postinstall step.
 * This function adds this postinstall step.
 */
function addPostinstallToRunNgcc() {
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
    const scripts = findPropertyInAstObject(jsonAst, 'scripts') as JsonAstObject;
    const recorder = host.beginUpdate(packageJson);
    // For bazel we need to compile the all files in place so we
    // don't use `--first-only` or `--create-ivy-entry-points`
    const ngccCommand = 'ngcc --properties es2015 browser module main';
    if (scripts) {
      const postInstall = findPropertyInAstObject(scripts, 'postinstall');
      if (postInstall && postInstall.value) {
        let value = postInstall.value as string;
        if (/\bngcc\b/.test(value)) {
          // `ngcc` is already in the postinstall script
          value =
              value.replace(/\s*--first-only\b/, '').replace(/\s*--create-ivy-entry-points\b/, '');
          replacePropertyInAstObject(recorder, scripts, 'postinstall', value);
        } else {
          const command = `${postInstall.value}; ${ngccCommand}`;
          replacePropertyInAstObject(recorder, scripts, 'postinstall', command);
        }
      } else {
        insertPropertyInAstObjectInOrder(recorder, scripts, 'postinstall', ngccCommand, 4);
      }
    } else {
      insertPropertyInAstObjectInOrder(
          recorder, jsonAst, 'scripts', {
            postinstall: ngccCommand,
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
      removeObsoleteDependenciesFromPackageJson(options),
      addPostinstallToRunNgcc(),
      backupAngularJson(),
      updateAngularJsonToUseBazelBuilder(options),
      updateGitignore(),
      upgradeRxjs(),
      installNodeModules(options),
    ]);
  };
}
