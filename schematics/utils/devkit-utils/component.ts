import { normalize } from '@angular-devkit/core';
import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  apply,
  branchAndMerge,
  chain,
  filter,
  mergeWith,
  move,
  noop,
  template,
  url,
} from '@angular-devkit/schematics';
import 'rxjs/add/operator/merge';
import * as ts from 'typescript';
import * as stringUtils from '@schematics/angular/strings';
import { addDeclarationToModule, addExportToModule } from './ast-utils';
import { InsertChange } from './change';
import { buildRelativePath, findModuleFromOptions } from './find-module';


function addDeclarationToNgModule(options: any): Rule {
  return (host: Tree) => {
    if (options.skipImport || !options.module) {
      return host;
    }

    const modulePath = options.module;
    const text = host.read(modulePath);
    if (text === null) {
      throw new SchematicsException(`File ${modulePath} does not exist.`);
    }
    const sourceText = text.toString('utf-8');
    const source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);

    const componentPath = `/${options.sourceDir}/${options.path}/`
                          + (options.flat ? '' : stringUtils.dasherize(options.name) + '/')
                          + stringUtils.dasherize(options.name)
                          + '.component';
    const relativePath = buildRelativePath(modulePath, componentPath);
    const classifiedName = stringUtils.classify(`${options.name}Component`);
    const declarationChanges = addDeclarationToModule(source,
                                                      modulePath,
                                                      classifiedName,
                                                      relativePath);

    const declarationRecorder = host.beginUpdate(modulePath);
    for (const change of declarationChanges) {
      if (change instanceof InsertChange) {
        declarationRecorder.insertLeft(change.pos, change.toAdd);
      }
    }
    host.commitUpdate(declarationRecorder);

    if (options.export) {
      // Need to refresh the AST because we overwrote the file in the host.
      const text = host.read(modulePath);
      if (text === null) {
        throw new SchematicsException(`File ${modulePath} does not exist.`);
      }
      const sourceText = text.toString('utf-8');
      const source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);

      const exportRecorder = host.beginUpdate(modulePath);
      const exportChanges = addExportToModule(source, modulePath,
                                              stringUtils.classify(`${options.name}Component`),
                                              relativePath);

      for (const change of exportChanges) {
        if (change instanceof InsertChange) {
          exportRecorder.insertLeft(change.pos, change.toAdd);
        }
      }
      host.commitUpdate(exportRecorder);
    }


    return host;
  };
}


function buildSelector(options: any) {
  let selector = stringUtils.dasherize(options.name);
  if (options.prefix) {
    selector = `${options.prefix}-${selector}`;
  }

  return selector;
}


export function buildComponent(options: any): Rule {
  const sourceDir = options.sourceDir;
  if (!sourceDir) {
    throw new SchematicsException(`sourceDir option is required.`);
  }

  return (host: Tree, context: SchematicContext) => {
    options.selector = options.selector || buildSelector(options);
    options.path = options.path ? normalize(options.path) : options.path;
    options.module = findModuleFromOptions(host, options);

    const templateSource = apply(url('./files'), [
      options.spec ? noop() : filter(path => !path.endsWith('.spec.ts')),
      options.inlineStyle ? filter(path => !path.endsWith('.__styleext__')) : noop(),
      options.inlineTemplate ? filter(path => !path.endsWith('.html')) : noop(),
      template({
        ...stringUtils,
        'if-flat': (s: string) => options.flat ? '' : s,
        ...options,
      }),
      move(sourceDir),
    ]);

    return chain([
      branchAndMerge(chain([
        addDeclarationToNgModule(options),
        mergeWith(templateSource),
      ])),
    ])(host, context);
  };
}
