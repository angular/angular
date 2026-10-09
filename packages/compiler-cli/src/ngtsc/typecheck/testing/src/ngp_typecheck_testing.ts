/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ParseTemplateOptions, TypeCheckId, TypeCheckingConfig} from '@angular/compiler';
import path from 'path';
import ts from 'typescript';

import {ErrorCode} from '../../../diagnostics';
import {absoluteFrom, AbsoluteFsPath, getFileSystem} from '../../../file_system';
import {TestFile} from '../../../file_system/testing';
import {performNgpCompilationSync} from '../../../testing';
import {TemplateDiagnostic, TemplateTypeChecker} from '../../api';
import {TemplateCheck} from '../../extended/api';
import {ExtendedTemplateCheckerImpl} from '../../extended/src/extended_template_checker';
import {
  ALL_ENABLED_CONFIG,
  angularAnimationsDts,
  angularCoreDtsFiles,
  angularFormsDtsFiles,
  TestDeclaration,
  TypeCheckingTarget,
  typescriptLibDts,
} from '../index';

export interface NgpSetupContext {
  targets: TypeCheckingTarget[];
  overrides: {
    config?: Partial<TypeCheckingConfig>;
    options?: ts.CompilerOptions;
    parseOptions?: ParseTemplateOptions;
  };
  load: {forms?: boolean};
}

const ngpSetupContextByChecker = new WeakMap<TemplateTypeChecker, NgpSetupContext>();
let extendedCheckerPatchedForNgp = false;

export function registerNgpTypeCheckSetup(
  templateTypeChecker: TemplateTypeChecker,
  context: NgpSetupContext,
): void {
  ensureExtendedTemplateCheckerPatchedForNgp();
  ngpSetupContextByChecker.set(templateTypeChecker, context);
}

function ensureExtendedTemplateCheckerPatchedForNgp(): void {
  if (extendedCheckerPatchedForNgp) {
    return;
  }
  extendedCheckerPatchedForNgp = true;
  const origGetDiagnostics = ExtendedTemplateCheckerImpl.prototype.getDiagnosticsForComponent;
  ExtendedTemplateCheckerImpl.prototype.getDiagnosticsForComponent = function (
    this: ExtendedTemplateCheckerImpl,
    component: ts.ClassDeclaration,
  ): TemplateDiagnostic[] {
    const partialCtx = this['partialCtx'];
    const templateChecks = this['templateChecks'];
    const ctx = ngpSetupContextByChecker.get(partialCtx.templateTypeChecker);
    if (ctx !== undefined) {
      return runNgpForExtendedChecks(ctx, component, templateChecks);
    }
    return origGetDiagnostics.call(this, component);
  };
}

export function compileTargetsWithNgp(
  targets: TypeCheckingTarget[],
  overrides: {
    config?: Partial<TypeCheckingConfig>;
    options?: ts.CompilerOptions;
    parseOptions?: ParseTemplateOptions;
  } = {},
  load: {forms?: boolean} = {},
): readonly ts.Diagnostic[] {
  const fs = getFileSystem();
  const allDeclarations: TestDeclaration[] = [];
  for (const t of targets) {
    if (t.declarations) {
      allDeclarations.push(...t.declarations);
    }
  }
  const allDecls = collectAllTestDeclarations(allDeclarations);
  const declsByFile = new Map<AbsoluteFsPath, Map<string, TestDeclaration>>();
  for (const decl of allDecls) {
    const file = decl.file ?? targets[0]?.fileName ?? absoluteFrom('/main.ts');
    let map = declsByFile.get(file);
    if (!map) {
      map = new Map();
      declsByFile.set(file, map);
    }
    map.set(decl.name, decl);
  }

  const files: TestFile[] = [
    typescriptLibDts(),
    ...angularCoreDtsFiles(),
    angularAnimationsDts(),
    ...(load.forms ? angularFormsDtsFiles() : []),
  ];
  const rootNames: string[] = [
    absoluteFrom('/lib.d.ts'),
    absoluteFrom('/node_modules/@angular/animations/index.d.ts'),
  ];

  for (const target of targets) {
    let rawSource = target.source;
    if (rawSource === undefined) {
      rawSource = `export const MODULE = true;\n`;
      if (target.templates) {
        for (const className of Object.keys(target.templates)) {
          rawSource += `export class ${className} {}\n`;
        }
      }
    }

    const fileDecls = declsByFile.get(target.fileName) ?? new Map<string, TestDeclaration>();
    const isDts = target.fileName.endsWith('.d.ts');
    const sf = ts.createSourceFile(target.fileName, rawSource, ts.ScriptTarget.Latest, true);
    const replacements: {start: number; end: number; text: string}[] = [];

    const targetDecls = target.declarations ?? [];
    const externalImports: string[] = [];
    const topLevelImportNames: string[] = [];
    for (const decl of targetDecls) {
      topLevelImportNames.push(decl.name);
      if (decl.file && decl.file !== target.fileName) {
        const rel = path.posix
          .relative(path.posix.dirname(target.fileName), decl.file)
          .replace(/(\.d)?\.ts$/, '');
        const moduleSpec = rel.startsWith('.') ? rel : './' + rel;
        externalImports.push(`import {${decl.name}} from ${JSON.stringify(moduleSpec)};`);
      }
    }

    for (const stmt of sf.statements) {
      if (!ts.isClassDeclaration(stmt) || !stmt.name) {
        continue;
      }
      const clsName = stmt.name.text;
      if (target.templates && clsName in target.templates) {
        const templateHtml = target.templates[clsName];
        const templateFilePath = absoluteFrom(
          `${path.posix.dirname(target.fileName)}/${clsName}.html`,
        );
        files.push({name: templateFilePath, contents: templateHtml});
        const importsProp =
          topLevelImportNames.length > 0 ? `, imports: [${topLevelImportNames.join(', ')}]` : '';
        const selector =
          clsName === 'TestComponent' ? 'test-cmp' : `test-cmp-${clsName.toLowerCase()}`;
        const compDecorator = `@ɵNgpComponent({selector: ${JSON.stringify(selector)}, templateUrl: './${clsName}.html', standalone: true${importsProp}})\n`;
        replacements.push({
          start: stmt.getStart(sf),
          end: stmt.getStart(sf),
          text: compDecorator,
        });
      } else if (fileDecls.has(clsName)) {
        const decl = fileDecls.get(clsName)!;
        if (isDts) {
          replacements.push({
            start: stmt.end - 1,
            end: stmt.end - 1,
            text: synthesizeDtsStaticDeclaration(decl, stmt),
          });
        } else {
          const decoratorText = `${synthesizeTsDecoratorForDeclaration(decl, stmt)}\n`;
          const updatedClassText = synthesizeSignalInitializerMembers(decl, stmt, sf);
          replacements.push({
            start: stmt.getStart(sf),
            end: stmt.end,
            text: decoratorText + updatedClassText,
          });
        }
      }
    }

    replacements.sort((a, b) => b.start - a.start);
    let updated = rawSource;
    for (const rep of replacements) {
      updated = updated.slice(0, rep.start) + rep.text + updated.slice(rep.end);
    }
    if (isDts) {
      if (fileDecls.size > 0) {
        updated = `import * as ɵNgpCore from '@angular/core';\n` + updated;
      }
    } else {
      updated =
        `import {Component as ɵNgpComponent, Directive as ɵNgpDirective, Pipe as ɵNgpPipe, Input as ɵNgpInput, input as ɵngpInput, model as ɵngpModel} from '@angular/core';\n` +
        externalImports.join('\n') +
        '\n' +
        updated;
    }

    files.push({name: target.fileName, contents: updated});
    rootNames.push(target.fileName);
  }

  for (const file of files) {
    fs.ensureDir(fs.dirname(file.name));
    fs.writeFile(file.name, file.contents);
  }

  const fullConfig: TypeCheckingConfig = {
    ...ALL_ENABLED_CONFIG,
    ...(overrides.config ?? {}),
  };

  const compilerOptions: ts.CompilerOptions = {
    noLib: true,
    experimentalDecorators: true,
    strict: false,
    strictNullChecks: true,
    skipLibCheck: true,
    noImplicitAny: true,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    ...(overrides.options ?? {}),
  };

  const {diagnostics} = performNgpCompilationSync({
    fs,
    basePath: absoluteFrom('/'),
    tsconfigPath: absoluteFrom('/tsconfig.json'),
    rootNames,
    options: compilerOptions,
    emit: false,
    tcbConfigOverride: fullConfig,
    templateDiagnosticsOnly: true,
  });
  return diagnostics;
}

function runNgpForExtendedChecks(
  ctx: NgpSetupContext,
  component: ts.ClassDeclaration,
  templateChecks: Map<TemplateCheck<ErrorCode>, ts.DiagnosticCategory>,
): TemplateDiagnostic[] {
  const componentName = component.name?.text;
  if (!componentName || templateChecks.size === 0) {
    return [];
  }

  const diagnostics = compileTargetsWithNgp(ctx.targets, ctx.overrides, ctx.load);
  const configuredByNgCode = new Map<number, ts.DiagnosticCategory>();
  for (const [check, category] of templateChecks.entries()) {
    configuredByNgCode.set(-990000 - Number(check.code), category);
  }

  const out: TemplateDiagnostic[] = [];
  for (const d of diagnostics) {
    if (configuredByNgCode.has(d.code)) {
      const category = configuredByNgCode.get(d.code)!;
      const sourceFile = component.getSourceFile();
      out.push({
        ...d,
        file: d.file ?? sourceFile,
        start: d.start ?? 0,
        length: d.length ?? 0,
        category,
        sourceFile,
        typeCheckId: 'tcb' as TypeCheckId,
      });
    }
  }
  return out;
}

function collectAllTestDeclarations(declarations: TestDeclaration[]): TestDeclaration[] {
  const result: TestDeclaration[] = [];
  const seen = new Set<string>();
  const visit = (decl: TestDeclaration) => {
    const key = `${decl.file ?? '/main.ts'}#${decl.name}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    if (decl.type === 'directive' && decl.hostDirectives) {
      for (const hd of decl.hostDirectives) {
        visit(hd.directive);
      }
    }
    result.push(decl);
  };
  for (const decl of declarations) {
    visit(decl);
  }
  return result;
}

function synthesizeTsDecoratorForDeclaration(
  decl: TestDeclaration,
  classNode?: ts.ClassDeclaration,
): string {
  if (decl.type === 'pipe') {
    const standalone = decl.isStandalone ?? true;
    return `@ɵNgpPipe({name: ${JSON.stringify(decl.pipeName)}, standalone: ${standalone}})`;
  }
  const declaredPropNames = new Set<string>();
  if (classNode) {
    for (const member of classNode.members) {
      if (member.name && ts.isIdentifier(member.name)) {
        declaredPropNames.add(member.name.text);
      }
    }
  }
  const props: string[] = [];
  if (decl.selector !== null && (decl.selector !== '' || !(decl.isStandalone ?? true))) {
    props.push(`selector: ${JSON.stringify(decl.selector)}`);
  }
  props.push(`standalone: ${decl.isStandalone ?? true}`);
  if (decl.exportAs && decl.exportAs.length > 0) {
    props.push(`exportAs: ${JSON.stringify(decl.exportAs.join(','))}`);
  }
  if (decl.inputs) {
    const inputEntries: string[] = [];
    for (const [fieldName, mapping] of Object.entries(decl.inputs)) {
      const classProp = typeof mapping === 'string' ? fieldName : mapping.classPropertyName;
      // If the property is declared on the class (and not explicitly marked as undeclared),
      // synthesizeSignalInitializerMembers will attach `@ɵNgpInput` or `= ɵngpInput(...)`
      // directly on the class property so `ng-analyze` records `property_span` and checks
      // access modifiers and literal types.
      if (declaredPropNames.has(classProp) && !decl.undeclaredInputFields?.includes(classProp)) {
        continue;
      }
      if (typeof mapping === 'string') {
        inputEntries.push(
          `{name: ${JSON.stringify(fieldName)}, alias: ${JSON.stringify(mapping)}, required: false}`,
        );
      } else if (!mapping.isSignal) {
        inputEntries.push(
          `{name: ${JSON.stringify(mapping.classPropertyName)}, alias: ${JSON.stringify(
            mapping.bindingPropertyName,
          )}, required: ${Boolean(mapping.required)}}`,
        );
      }
    }
    if (inputEntries.length > 0) {
      props.push(`inputs: [${inputEntries.join(', ')}]`);
    }
  }
  if (decl.outputs) {
    const outputEntries: string[] = [];
    for (const [fieldName, bindingName] of Object.entries(decl.outputs)) {
      outputEntries.push(
        fieldName === bindingName
          ? JSON.stringify(fieldName)
          : JSON.stringify(`${fieldName}: ${bindingName}`),
      );
    }
    if (outputEntries.length > 0) {
      props.push(`outputs: [${outputEntries.join(', ')}]`);
    }
  }
  if (decl.hostDirectives && decl.hostDirectives.length > 0) {
    const hdEntries = decl.hostDirectives.map((hd) => {
      const hdProps = [`directive: ${hd.directive.name}`];
      if (hd.inputs) {
        hdProps.push(`inputs: ${JSON.stringify(hd.inputs)}`);
      }
      if (hd.outputs) {
        hdProps.push(`outputs: ${JSON.stringify(hd.outputs)}`);
      }
      return `{${hdProps.join(', ')}}`;
    });
    props.push(`hostDirectives: [${hdEntries.join(', ')}]`);
  }
  if (decl.isComponent) {
    props.push(`template: ''`);
    return `@ɵNgpComponent({${props.join(', ')}})`;
  }
  return `@ɵNgpDirective({${props.join(', ')}})`;
}

function synthesizeSignalInitializerMembers(
  decl: TestDeclaration,
  classNode: ts.ClassDeclaration,
  sf: ts.SourceFile,
): string {
  const fullClassText = sf.text.slice(classNode.getStart(sf), classNode.end);
  if (decl.type !== 'directive' || !decl.inputs) {
    return fullClassText;
  }
  const classStart = classNode.getStart(sf);
  const memberInsertions: {pos: number; text: string}[] = [];

  for (const member of classNode.members) {
    if (!ts.isPropertyDeclaration(member) || !member.name || !ts.isIdentifier(member.name)) {
      continue;
    }
    const propName = member.name.text;
    if (decl.undeclaredInputFields?.includes(propName)) {
      continue;
    }
    const mappingEntry = Object.entries(decl.inputs).find(([k, v]) =>
      typeof v === 'object' ? v.classPropertyName === propName || k === propName : k === propName,
    );
    if (!mappingEntry) {
      continue;
    }
    const [fieldName, mapping] = mappingEntry;
    if (typeof mapping === 'object' && mapping.isSignal) {
      if (member.initializer !== undefined) {
        continue;
      }
      const typeText = member.type ? member.type.getText(sf) : '';
      const isModel = /\bModelSignal\b/.test(typeText);
      const callExpr = isModel
        ? mapping.required
          ? `ɵngpModel.required({alias: ${JSON.stringify(mapping.bindingPropertyName)}})`
          : `ɵngpModel(undefined as any, {alias: ${JSON.stringify(mapping.bindingPropertyName)}})`
        : mapping.required
          ? `ɵngpInput.required({alias: ${JSON.stringify(mapping.bindingPropertyName)}})`
          : `ɵngpInput(undefined as any, {alias: ${JSON.stringify(mapping.bindingPropertyName)}})`;

      const insertPos = member.type ? member.type.end : member.name.end;
      memberInsertions.push({
        pos: insertPos - classStart,
        text: ` = ${callExpr} as any`,
      });
    } else {
      const alias = typeof mapping === 'string' ? mapping : mapping.bindingPropertyName;
      const required = typeof mapping === 'object' ? Boolean(mapping.required) : false;
      const transformExpr =
        typeof mapping === 'object' && mapping.transform != null
          ? `, transform: null as unknown as ${mapping.transform.type}`
          : '';
      const decoratorCall =
        alias === fieldName && !required && !transformExpr
          ? `@ɵNgpInput() `
          : `@ɵNgpInput({alias: ${JSON.stringify(alias)}, required: ${required}${transformExpr}}) `;
      memberInsertions.push({
        pos: member.getStart(sf) - classStart,
        text: decoratorCall,
      });
    }
  }

  memberInsertions.sort((a, b) => b.pos - a.pos);
  let updated = fullClassText;
  for (const ins of memberInsertions) {
    updated = updated.slice(0, ins.pos) + ins.text + updated.slice(ins.pos);
  }
  return updated;
}

function synthesizeDtsStaticDeclaration(
  decl: TestDeclaration,
  classNode: ts.ClassDeclaration,
): string {
  const typeParamNames = classNode.typeParameters?.map((tp) => tp.name.text) ?? [];
  const typeWithParams =
    typeParamNames.length > 0
      ? `${decl.name}<${typeParamNames.map(() => 'any').join(', ')}>`
      : decl.name;
  if (decl.type === 'pipe') {
    const standalone = decl.isStandalone ?? true;
    return `\n  static ɵpipe: ɵNgpCore.ɵɵPipeDeclaration<${typeWithParams}, ${JSON.stringify(
      decl.pipeName,
    )}, ${standalone}>;\n`;
  }
  const declaredPropNames = new Set<string>();
  for (const member of classNode.members) {
    if (member.name && ts.isIdentifier(member.name)) {
      declaredPropNames.add(member.name.text);
    }
  }
  const missingPropDecls: string[] = [];
  const selectorType = decl.selector ? JSON.stringify(decl.selector) : 'never';
  const exportAsType =
    decl.exportAs && decl.exportAs.length > 0
      ? `[${decl.exportAs.map((e) => JSON.stringify(e)).join(', ')}]`
      : 'never';
  const inputProps: string[] = [];
  if (decl.inputs) {
    for (const [fieldName, mapping] of Object.entries(decl.inputs)) {
      const classProp = typeof mapping === 'string' ? fieldName : mapping.classPropertyName;
      if (!declaredPropNames.has(classProp)) {
        missingPropDecls.push(`  ${classProp}: any;`);
        declaredPropNames.add(classProp);
      }
      if (typeof mapping === 'string') {
        inputProps.push(
          `${JSON.stringify(fieldName)}: { alias: ${JSON.stringify(
            mapping,
          )}; required: false; isSignal: false; }`,
        );
      } else {
        inputProps.push(
          `${JSON.stringify(mapping.classPropertyName)}: { alias: ${JSON.stringify(
            mapping.bindingPropertyName,
          )}; required: ${Boolean(mapping.required)}; isSignal: ${Boolean(mapping.isSignal)}; }`,
        );
      }
    }
  }
  const inputsType = `{ ${inputProps.join('; ')} }`;
  const outputProps: string[] = [];
  if (decl.outputs) {
    for (const [fieldName, bindingName] of Object.entries(decl.outputs)) {
      outputProps.push(`${JSON.stringify(fieldName)}: ${JSON.stringify(bindingName)}`);
    }
  }
  const outputsType = `{ ${outputProps.join('; ')} }`;
  const standaloneType = (decl.isStandalone ?? true) ? 'true' : 'false';
  const extraPropsPrefix = missingPropDecls.length > 0 ? `\n${missingPropDecls.join('\n')}` : '';
  if (decl.isComponent) {
    const ngContentType =
      decl.ngContentSelectors && decl.ngContentSelectors.length > 0
        ? `[${decl.ngContentSelectors.map((s) => JSON.stringify(s)).join(', ')}]`
        : 'never';
    return `${extraPropsPrefix}\n  static ɵcmp: ɵNgpCore.ɵɵComponentDeclaration<${typeWithParams}, ${selectorType}, ${exportAsType}, ${inputsType}, ${outputsType}, never, ${ngContentType}, ${standaloneType}, never>;\n`;
  }
  return `${extraPropsPrefix}\n  static ɵdir: ɵNgpCore.ɵɵDirectiveDeclaration<${typeWithParams}, ${selectorType}, ${exportAsType}, ${inputsType}, ${outputsType}, never, never, ${standaloneType}, never>;\n`;
}
