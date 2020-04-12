/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <reference types="node" />
import * as fs from 'fs';
import * as ts from 'typescript';
import {resolve} from '../../file_system';
import {PerfRecorder} from './api';
import {HrTime, mark, timeSinceInMicros} from './clock';

export class PerfTracker implements PerfRecorder {
  private nextSpanId = 1;
  private log: PerfLogEvent[] = [];

  readonly enabled = true;

  private constructor(private zeroTime: HrTime) {}

  static zeroedToNow(): PerfTracker { return new PerfTracker(mark()); }

  mark(name: string, node?: ts.SourceFile|ts.Declaration, category?: string, detail?: string):
      void {
    const msg = this.makeLogMessage(PerfLogEventType.MARK, name, node, category, detail, undefined);
    this.log.push(msg);
  }

  start(name: string, node?: ts.SourceFile|ts.Declaration, category?: string, detail?: string):
      number {
    const span = this.nextSpanId++;
    const msg = this.makeLogMessage(PerfLogEventType.SPAN_OPEN, name, node, category, detail, span);
    this.log.push(msg);
    return span;
  }

  stop(span: number): void {
    this.log.push({
      type: PerfLogEventType.SPAN_CLOSE,
      span,
      stamp: timeSinceInMicros(this.zeroTime),
    });
  }

  private makeLogMessage(
      type: PerfLogEventType, name: string, node: ts.SourceFile|ts.Declaration|undefined,
      category: string|undefined, detail: string|undefined, span: number|undefined): PerfLogEvent {
    const msg: PerfLogEvent = {
      type,
      name,
      stamp: timeSinceInMicros(this.zeroTime),
    };
    if (category !== undefined) {
      msg.category = category;
    }
    if (detail !== undefined) {
      msg.detail = detail;
    }
    if (span !== undefined) {
      msg.span = span;
    }
    if (node !== undefined) {
      msg.file = node.getSourceFile().fileName;
      if (!ts.isSourceFile(node)) {
        const name = ts.getNameOfDeclaration(node);
        if (name !== undefined && ts.isIdentifier(name)) {
          msg.declaration = name.text;
        }
      }
    }
    return msg;
  }

  asJson(): unknown { return this.log; }

  serializeToFile(target: string, host: ts.CompilerHost): void {
    const json = JSON.stringify(this.log, null, 2);

    if (target.startsWith('ts:')) {
      target = target.substr('ts:'.length);
      const outFile = resolve(host.getCurrentDirectory(), target);
      host.writeFile(outFile, json, false);
    } else {
      const outFile = resolve(host.getCurrentDirectory(), target);
      fs.writeFileSync(outFile, json);
    }
  }
}

export interface PerfLogEvent {
  name?: string;
  span?: number;
  file?: string;
  declaration?: string;
  type: PerfLogEventType;
  category?: string;
  detail?: string;
  stamp: number;
}

export enum PerfLogEventType {
  SPAN_OPEN,
  SPAN_CLOSE,
  MARK,
}
