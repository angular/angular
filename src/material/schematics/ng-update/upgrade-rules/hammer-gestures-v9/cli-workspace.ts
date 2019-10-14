/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WorkspaceProject, WorkspaceSchema} from '@schematics/angular/utility/workspace-models';
import {isAbsolute, relative} from 'path';
import * as ts from 'typescript';

/** Finds all projects which contain the given path. */
export function getMatchingProjectsByPath(
    workspace: WorkspaceSchema, searchPath: string): WorkspaceProject[] {
  const projectNames = Object.keys(workspace.projects);
  const isProjectMatching = (relativeProjectPath: string): boolean => {
    // Build the relative path from the real project path to the
    // possible project path based on the specified search path.
    const relativePath = relative(relativeProjectPath, searchPath);
    // If the relative path does not start with two dots and is not absolute, we
    // know that the search path is inside the given project path.
    return !relativePath.startsWith('..') && !isAbsolute(relativePath);
  };

  return projectNames.map(name => workspace.projects[name])
      .filter(p => isProjectMatching(p.root))
      .sort((a, b) => b.root.length - a.root.length);
}

/**
 * Gets the matching Angular CLI workspace project from the given program. Project
 * is determined by checking root file names of the program against project paths.
 *
 * If there is only one project set up, the project will be returned regardless of
 * whether it matches any of the specified program files.
 */
export function getProjectFromProgram(
    workspace: WorkspaceSchema, program: ts.Program): WorkspaceProject|null {
  const projectNames = Object.keys(workspace.projects);

  // If there is only one project, we just return it without looking
  // for other matching projects.
  if (projectNames.length === 1) {
    return workspace.projects[projectNames[0]];
  }

  const basePath = program.getCurrentDirectory();
  // Go through the root file names of the program and return the first project
  // that matches a given root file. We can't just take any arbitrary file in the
  // list since sometimes there can be root files which do not belong to any project.
  for (let filePath of program.getRootFileNames()) {
    const matchingProjects = getMatchingProjectsByPath(workspace, relative(basePath, filePath));
    if (matchingProjects.length) {
      return matchingProjects[0];
    }
  }
  return null;
}
