// #docplaster
// #docregion schematics-imports, schema-imports, workspace
import {
  Rule, Tree, SchematicsException,
  apply, url, applyTemplates, move,
  chain, mergeWith
} from '@angular-devkit/schematics';

import { strings, normalize, virtualFs, workspaces } from '@angular-devkit/core';
// #enddocregion schematics-imports

import { Schema as MyServiceSchema } from './schema';
// #enddocregion schema-imports

function createHost(tree: Tree): workspaces.WorkspaceHost {
  return {
    async readFile(path: string): Promise<string> {
      const data = tree.read(path);
      if (!data) {
        throw new SchematicsException('File not found.');
      }
      return virtualFs.fileBufferToString(data);
    },
    async writeFile(path: string, data: string): Promise<void> {
      return tree.overwrite(path, data);
    },
    async isDirectory(path: string): Promise<boolean> {
      return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;
    },
    async isFile(path: string): Promise<boolean> {
      return tree.exists(path);
    },
  };
}

export function myService(options: MyServiceSchema): Rule {
  return async (tree: Tree) => {
    const host = createHost(tree);
    const { workspace } = await workspaces.readWorkspace('/', host);

// #enddocregion workspace

// #docregion project-info
// #docregion project-fallback
    if (!options.project) {
      options.project = workspace.extensions.defaultProject;
    }
// #enddocregion project-fallback

    const project = workspace.projects.get(options.project);
    if (!project) {
      throw new SchematicsException(`Invalid project name: ${options.project}`);
    }

    const projectType = project.extensions.projectType === 'application' ? 'app' : 'lib';
// #enddocregion project-info

// #docregion path
    if (options.path === undefined) {
      options.path = `${project.sourceRoot}/${projectType}`;
    }
// #enddocregion path

// #docregion template
    const templateSource = apply(url('./files'), [
      applyTemplates({
        classify: strings.classify,
        dasherize: strings.dasherize,
        name: options.name
      }),
      move(normalize(options.path as string))
    ]);
// #enddocregion template

// #docregion chain
    return chain([
      mergeWith(templateSource)
    ]);
// #enddocregion chain
// #docregion workspace
  };
}
