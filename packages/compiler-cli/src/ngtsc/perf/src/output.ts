/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {MajorPhase, MinorPhase, Statistic} from './api';
import {PerfTracker} from './tracking';


export function printPerfDiagnostics(program: ts.Program, perf: PerfTracker): void {
  printTsPerfDiagnostics(program);
  console.log();
  printAngularPerfDiagnostics(perf);
}

export function printTsPerfDiagnostics(program: ts.Program): void {
  console.log('TypeScript Stats:');
  console.log(`  .ts Files (including internal): ${
      program.getSourceFiles().filter(sf => !sf.isDeclarationFile).length}`);
  console.log(
      `  .d.ts Files: ${program.getSourceFiles().filter(sf => sf.isDeclarationFile).length}`);
  console.log(`  Lines: ${linesInProgram(program)}`);
  console.log(`  Nodes: ${program.getNodeCount()}`);
  console.log(`  Identifiers: ${program.getIdentifierCount()}`);
  console.log(`  Symbols: ${program.getSymbolCount()}`);
  console.log(`  Types: ${program.getTypeCount()}`);
  console.log(`  Instantiations: ${program.getInstantiationCount()}`);
}

function printAngularPerfDiagnostics(perf: PerfTracker): void {
  const stat = (stat: Statistic) => perf.statistic(stat).count;
  const major = (major: MajorPhase) => Math.round(perf.getMajorTimeMicros(major) / 100) / 10;
  const minor = (minor: MinorPhase) => Math.round(perf.getMinorTimeMicros(minor) / 100) / 10;

  console.log('Angular performance:');
  console.log('  Counters:');
  console.log(`    Components: ${stat(Statistic.ComponentCount)}`);
  console.log(`      TemplateNodes:  ${stat(Statistic.TemplateNodeCount)}`);
  console.log(`    Directives: ${stat(Statistic.DirectiveCount)}`);
  console.log(`    Injectables: ${stat(Statistic.InjectableCount)}`);
  console.log(`    NgModules: ${stat(Statistic.NgModuleCount)}`);
  console.log(`    Pipes: ${stat(Statistic.PipeCount)}`);
  console.log();
  console.log(`    Files Emitted: ${stat(Statistic.FilesEmitted)}`);
  console.log();
  console.log('  Timing:');
  console.log(`    TypeScript: ${major(MajorPhase.TypeScript)} ms`);
  console.log(`    Analyze: ${major(MajorPhase.Analyze)} ms`);
  console.log(`    Resolve: ${major(MajorPhase.Resolve)} ms`);
  console.log(`    Template Type-Checking: ${major(MajorPhase.TemplateTypeChecking)} ms`);
  console.log(`    Compile: ${major(MajorPhase.Compile)} ms`);
  console.log();
  console.log(`    (unaccounted): ${major(MajorPhase.Default)} ms`);
  console.log();
  console.log(`    * Cycle Detection: ${minor(MinorPhase.CycleDetection)} ms`);
  console.log(`    * Partial Evaluation: ${minor(MinorPhase.PartialEvaluation)} ms`);
}

function linesInProgram(program: ts.Program): number {
  return program.getSourceFiles().reduce((count, sf) => count + linesInFile(sf), 0);
}

function linesInFile(sf: ts.SourceFile): number {
  return ts.getLineAndCharacterOfPosition(sf, sf.text.length).line;
}
