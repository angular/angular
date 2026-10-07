/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {readConfiguration} from '@angular/compiler-cli';
import type {NgpCompilerOptions} from './compiler_options.js';

export interface WorkspaceConfig {
  workspaceRoot: string;
  projectRoot: string;
  tsConfig: string;
  entryPoint: string;
  indexHtml: string | null;
  assets: Array<string | {input: string; glob: string; output?: string}>;
  styles: Array<string | {input: string; bundleName?: string; inject?: boolean}>;
  angularCompilerOptions?: NgpCompilerOptions;
}

export function stripJsonComments(json: string): string {
  // Strip // and /* ... */ comments, safely ignoring strings
  return json.replace(/"(?:[^"\\]|\\.)*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => (g ? '' : m));
}

function pathExists(p: string) {
  return fs.access(p).then(
    () => true,
    () => false,
  );
}

export async function resolveWorkspaceConfig(targetPath: string): Promise<WorkspaceConfig | null> {
  const absoluteTarget = path.resolve(targetPath);
  const stat = await fs.stat(absoluteTarget).catch(() => null);
  const isFile = stat?.isFile() ?? false;

  let currentDir = isFile ? path.dirname(absoluteTarget) : absoluteTarget;

  let angularJsonPath = '';

  while (true) {
    const checkPath = path.join(currentDir, 'angular.json');
    if (await pathExists(checkPath)) {
      angularJsonPath = checkPath;
      break;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break; // Stop if we hit filesystem root
    currentDir = parentDir;
  }

  if (!angularJsonPath) {
    return null;
  }

  const workspaceRoot = path.dirname(angularJsonPath);
  const content = await fs.readFile(angularJsonPath, 'utf8');
  const cleanContent = stripJsonComments(content);
  let workspace: any;
  try {
    workspace = JSON.parse(cleanContent);
  } catch (e) {
    console.warn(`Warning: Failed to parse angular.json at ${angularJsonPath}`, e);
    return null;
  }

  const projects = workspace?.projects || {};
  const projectNames = Object.keys(projects);
  if (projectNames.length === 0) {
    throw new Error(`No projects found in ${angularJsonPath}`);
  }

  // 1. Find all projects that contain the target path
  let matchingProjects = projectNames.filter((n) => {
    const projectRootAbs = path.resolve(workspaceRoot, projects[n].root || '');
    const normalizedRoot =
      process.platform === 'win32' || process.platform === 'darwin'
        ? projectRootAbs.toLowerCase()
        : projectRootAbs;
    const normalizedTarget =
      process.platform === 'win32' || process.platform === 'darwin'
        ? absoluteTarget.toLowerCase()
        : absoluteTarget;
    const relativePath = path.relative(normalizedRoot, normalizedTarget);
    // Ensure the target is strictly inside or equal to the project root
    return !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
  });

  // Sort by root length descending to get the most specific match (e.g. 'projects/app' wins over '')
  matchingProjects.sort((a, b) => {
    const rootA = projects[a].root || '';
    const rootB = projects[b].root || '';
    return rootB.length - rootA.length;
  });

  let projectName = matchingProjects[0];

  // 2. Fallback to first Application project, or just the first project
  if (!projectName) {
    projectName =
      projectNames.find((n) => projects[n].projectType === 'application') || projectNames[0];
  }
  const project = projects[projectName];

  const buildTarget = project.architect?.build || project.targets?.build;
  if (!buildTarget) {
    throw new Error(`Project ${projectName} does not have a build target in ${angularJsonPath}`);
  }

  const options = buildTarget.options || {};

  if (!options.tsConfig) {
    throw new Error(
      `Project ${projectName} build target does not specify a tsConfig in ${angularJsonPath}`,
    );
  }

  // default to `browser` for newer builders (@angular/build:application), fallback to `main` for older ones
  const entryPoint = options.browser || options.main || 'src/main.ts';

  // indexHtml resolution (could be string or object `{input: string}`)
  let indexHtml: string | null = null;
  if (options.index) {
    indexHtml = typeof options.index === 'string' ? options.index : options.index.input;
  } else {
    // Implicit defaults if it physically exists
    const projectRootAbs = path.resolve(workspaceRoot, project.root || '');
    for (const implicitIndex of ['src/index.html', 'index.html']) {
      if (await pathExists(path.join(projectRootAbs, implicitIndex))) {
        indexHtml = path.join(project.root || '', implicitIndex);
        break;
      }
    }
  }

  const absTsConfig = path.resolve(workspaceRoot, options.tsConfig);
  let angularCompilerOptions: NgpCompilerOptions = {};
  try {
    const parsedConfig = readConfiguration(absTsConfig);
    angularCompilerOptions = parsedConfig.options;
  } catch (e) {
    console.warn(`Warning: Failed to read tsconfig options at ${absTsConfig}`, e);
  }

  return {
    workspaceRoot,
    projectRoot: path.resolve(workspaceRoot, project.root || ''),
    tsConfig: absTsConfig,
    entryPoint: path.resolve(workspaceRoot, entryPoint),
    indexHtml: indexHtml ? path.resolve(workspaceRoot, indexHtml) : null,
    assets: options.assets || [],
    styles: options.styles || [],
    angularCompilerOptions,
  };
}
