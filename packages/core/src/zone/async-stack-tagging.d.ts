/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
interface ConsoleWithAsyncTagging {
    createTask(name: string): ConsoleTask;
}
interface ConsoleTask {
    run<T>(f: () => T): T;
}
interface ZoneConsoleTask extends Task {
    consoleTask?: ConsoleTask;
}
export declare class AsyncStackTaggingZoneSpec implements ZoneSpec {
    createTask: ConsoleWithAsyncTagging['createTask'];
    constructor(namePrefix: string, consoleAsyncStackTaggingImpl?: ConsoleWithAsyncTagging);
    name: string;
    onScheduleTask(delegate: ZoneDelegate, _current: Zone, target: Zone, task: ZoneConsoleTask): Task;
    onInvokeTask(delegate: ZoneDelegate, _currentZone: Zone, targetZone: Zone, task: ZoneConsoleTask, applyThis: any, applyArgs?: any[]): any;
}
export {};
