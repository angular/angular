// #docplaster
// #docregion schematics-imports, schema-imports, workspace
import {
  SchematicsException,
  apply,
  url,
  applyTemplates,
  move,
  chain,
  mergeWith,
} from '@angular-devkit/schematics';
import {strings, normalize, virtualFs, workspaces} from '@angular-devkit/core';
// #enddocregion schema-imports
function createHost(tree) {
  return {
    async readFile(path) {
      const data = tree.read(path);
      if (!data) {
        throw new SchematicsException('File not found.');
      }
      return virtualFs.fileBufferToString(data);
    },
    async writeFile(path, data) {
      return tree.overwrite(path, data);
    },
    async isDirectory(path) {
      return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;
    },
    async isFile(path) {
      return tree.exists(path);
    },
  };
}
export function myService(options) {
  return async (tree) => {
    const host = createHost(tree);
    const {workspace} = await workspaces.readWorkspace('/', host);
    // #enddocregion workspace
    // #docregion project-info
    const project = options.project != null ? workspace.projects.get(options.project) : null;
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
        name: options.name,
      }),
      move(normalize(options.path)),
    ]);
    // #enddocregion template
    // #docregion chain
    return chain([mergeWith(templateSource)]);
    // #enddocregion chain
    // #docregion workspace
  };
}
//# sourceMappingURL=index.js.map
