/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @fileoverview
 * @suppress {globalThis}
 */

const NEWLINE = '\n';
const IGNORE_FRAMES: {[k: string]: true} = {};
const creationTrace = '__creationTrace__';
const ERROR_TAG = 'STACKTRACE TRACKING';
const SEP_TAG = '__SEP_TAG__';
let sepTemplate: string = SEP_TAG + '@[native]';

class LongStackTrace {
  error: Error = getStacktrace();
  timestamp: Date = new Date();
}

function getStacktraceWithUncaughtError(): Error {
  return new Error(ERROR_TAG);
}

function getStacktraceWithCaughtError(): Error {
  try {
    throw getStacktraceWithUncaughtError();
  } catch (err) {
    return err;
  }
}

// Some implementations of exception handling don't create a stack trace if the exception
// isn't thrown, however it's faster not to actually throw the exception.
const error = getStacktraceWithUncaughtError();
const caughtError = getStacktraceWithCaughtError();
const getStacktrace = error.stack ?
    getStacktraceWithUncaughtError :
    (caughtError.stack ? getStacktraceWithCaughtError : getStacktraceWithUncaughtError);

function getFrames(error: Error): string[] {
  return error.stack ? error.stack.split(NEWLINE) : [];
}

function addErrorStack(lines: string[], error: Error): void {
  let trace: string[] = getFrames(error);
  for (let i = 0; i < trace.length; i++) {
    const frame = trace[i];
    // Filter out the Frames which are part of stack capturing.
    if (!IGNORE_FRAMES.hasOwnProperty(frame)) {
      lines.push(trace[i]);
    }
  }
}

function renderLongStackTrace(frames: LongStackTrace[], stack?: string): string {
  const longTrace: string[] = [stack ? stack.trim() : ''];

  if (frames) {
    let timestamp = new Date().getTime();
    for (let i = 0; i < frames.length; i++) {
      const traceFrames: LongStackTrace = frames[i];
      const lastTime = traceFrames.timestamp;
      let separator =
          `____________________Elapsed ${timestamp - lastTime.getTime()} ms; At: ${lastTime}`;
      separator = separator.replace(/[^\w\d]/g, '_');
      longTrace.push(sepTemplate.replace(SEP_TAG, separator));
      addErrorStack(longTrace, traceFrames.error);

      timestamp = lastTime.getTime();
    }
  }

  return longTrace.join(NEWLINE);
}

// if Error.stackTraceLimit is 0, means stack trace
// is disabled, so we don't need to generate long stack trace
// this will improve performance in some test(some test will
// set stackTraceLimit to 0, https://github.com/angular/zone.js/issues/698
function stackTracesEnabled(): boolean {
  // Cast through any since this property only exists on Error in the nodejs
  // typings.
  return (Error as any).stackTraceLimit > 0;
}

type LongStackTraceZoneSpec = ZoneSpec&{longStackTraceLimit: number};

(Zone as any)['longStackTraceZoneSpec'] = <LongStackTraceZoneSpec>{
  name: 'long-stack-trace',
  longStackTraceLimit: 10,  // Max number of task to keep the stack trace for.
  // add a getLongStackTrace method in spec to
  // handle handled reject promise error.
  getLongStackTrace: function(error: Error): string |
      undefined {
        if (!error) {
          return undefined;
        }
        const trace = (error as any)[(Zone as any).__symbol__('currentTaskTrace')];
        if (!trace) {
          return error.stack;
        }
        return renderLongStackTrace(trace, error.stack);
      },

  onScheduleTask: function(
      parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task): any {
    if (stackTracesEnabled()) {
      const currentTask = Zone.currentTask;
      let trace = currentTask && currentTask.data && (currentTask.data as any)[creationTrace] || [];
      trace = [new LongStackTrace()].concat(trace);
      if (trace.length > this.longStackTraceLimit) {
        trace.length = this.longStackTraceLimit;
      }
      if (!task.data) task.data = {};
      if (task.type === 'eventTask') {
        // Fix issue https://github.com/angular/zone.js/issues/1195,
        // For event task of browser, by default, all task will share a
        // singleton instance of data object, we should create a new one here

        // The cast to `any` is required to workaround a closure bug which wrongly applies
        // URL sanitization rules to .data access.
        (task.data as any) = {...(task.data as any)};
      }
      (task.data as any)[creationTrace] = trace;
    }
    return parentZoneDelegate.scheduleTask(targetZone, task);
  },

  onHandleError: function(
      parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, error: any): boolean {
    if (stackTracesEnabled()) {
      const parentTask = Zone.currentTask || error.task;
      if (error instanceof Error && parentTask) {
        const longStack =
            renderLongStackTrace(parentTask.data && parentTask.data[creationTrace], error.stack);
        try {
          error.stack = (error as any).longStack = longStack;
        } catch (err) {
        }
      }
    }
    return parentZoneDelegate.handleError(targetZone, error);
  }
};

function captureStackTraces(stackTraces: string[][], count: number): void {
  if (count > 0) {
    stackTraces.push(getFrames((new LongStackTrace()).error));
    captureStackTraces(stackTraces, count - 1);
  }
}

function computeIgnoreFrames() {
  if (!stackTracesEnabled()) {
    return;
  }
  const frames: string[][] = [];
  captureStackTraces(frames, 2);
  const frames1 = frames[0];
  const frames2 = frames[1];
  for (let i = 0; i < frames1.length; i++) {
    const frame1 = frames1[i];
    if (frame1.indexOf(ERROR_TAG) == -1) {
      let match = frame1.match(/^\s*at\s+/);
      if (match) {
        sepTemplate = match[0] + SEP_TAG + ' (http://localhost)';
        break;
      }
    }
  }

  for (let i = 0; i < frames1.length; i++) {
    const frame1 = frames1[i];
    const frame2 = frames2[i];
    if (frame1 === frame2) {
      IGNORE_FRAMES[frame1] = true;
    } else {
      break;
    }
  }
}
computeIgnoreFrames();
