/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/

/**
 * @fileoverview Externs for zone.js
 * @see https://github.com/angular/zone.js
 * @externs
 */

/**
 * @interface
 */
var Zone = function() {};
/**
 * @type {!Zone} The parent Zone.
 */
Zone.prototype.parent;
/**
 * @type {!string} The Zone name (useful for debugging)
 */
Zone.prototype.name;

Zone.assertZonePatched = function() {};

Zone.__symbol__ = function(name) {};

Zone.__load_patch = function(name, fn) {};

/**
 * @type {!Zone} Returns the current [Zone]. Returns the current zone. The only way to change
 * the current zone is by invoking a run() method, which will update the current zone for the
 * duration of the run method callback.
 */
Zone.current;

/**
 * @type {Task} The task associated with the current execution.
 */
Zone.currentTask;

/**
 *  @type {!Zone} Return the root zone.
 */
Zone.root;

/**
 * Returns a value associated with the `key`.
 *
 * If the current zone does not have a key, the request is delegated to the parent zone. Use
 * [ZoneSpec.properties] to configure the set of properties associated with the current zone.
 *
 * @param {!string} key The key to retrieve.
 * @returns {?} The value for the key, or `undefined` if not found.
 */
Zone.prototype.get = function(key) {};

/**
 * Returns a Zone which defines a `key`.
 *
 * Recursively search the parent Zone until a Zone which has a property `key` is found.
 *
 * @param {!string} key The key to use for identification of the returned zone.
 * @returns {?Zone} The Zone which defines the `key`, `null` if not found.
 */
Zone.prototype.getZoneWith = function(key) {};

/**
 * Used to create a child zone.
 *
 * @param {!ZoneSpec} zoneSpec A set of rules which the child zone should follow.
 * @returns {!Zone} A new child zone.
 */
Zone.prototype.fork = function(zoneSpec) {};

/**
 * Wraps a callback function in a new function which will properly restore the current zone upon
 * invocation.
 *
 * The wrapped function will properly forward `this` as well as `arguments` to the `callback`.
 *
 * Before the function is wrapped the zone can intercept the `callback` by declaring
 * [ZoneSpec.onIntercept].
 *
 * @param {!Function} callback the function which will be wrapped in the zone.
 * @param {!string=} source A unique debug location of the API being wrapped.
 * @returns {!Function} A function which will invoke the `callback` through [Zone.runGuarded].
 */
Zone.prototype.wrap = function(callback, source) {};

/**
 * Invokes a function in a given zone.
 *
 * The invocation of `callback` can be intercepted be declaring [ZoneSpec.onInvoke].
 *
 * @param {!Function} callback The function to invoke.
 * @param {?Object=} applyThis
 * @param {?Array=} applyArgs
 * @param {?string=} source A unique debug location of the API being invoked.
 * @returns {*} Value from the `callback` function.
 */
Zone.prototype.run = function(callback, applyThis, applyArgs, source) {};

/**
 * Invokes a function in a given zone and catches any exceptions.
 *
 * Any exceptions thrown will be forwarded to [Zone.HandleError].
 *
 * The invocation of `callback` can be intercepted be declaring [ZoneSpec.onInvoke]. The
 * handling of exceptions can intercepted by declaring [ZoneSpec.handleError].
 *
 * @param {!Function} callback The function to invoke.
 * @param {?Object=} applyThis
 * @param {?Array=} applyArgs
 * @param {?string=} source A unique debug location of the API being invoked.
 * @returns {*} Value from the `callback` function.
 */
Zone.prototype.runGuarded = function(callback, applyThis, applyArgs, source) {};

/**
 * Execute the Task by restoring the [Zone.currentTask] in the Task's zone.
 *
 * @param {!Task} task
 * @param {?Object=} applyThis
 * @param {?Array=} applyArgs
 * @returns {*}
 */
Zone.prototype.runTask = function(task, applyThis, applyArgs) {};

/**
 * @param {string} source
 * @param {!Function} callback
 * @param {?TaskData=} data
 * @param {?function(!Task)=} customSchedule
 * @return {!MicroTask} microTask
 */
Zone.prototype.scheduleMicroTask = function(source, callback, data, customSchedule) {};

/**
 * @param {string} source
 * @param {!Function} callback
 * @param {?TaskData=} data
 * @param {?function(!Task)=} customSchedule
 * @param {?function(!Task)=} customCancel
 * @return {!MacroTask} macroTask
 */
Zone.prototype.scheduleMacroTask = function(source, callback, data, customSchedule, customCancel) {
};

/**
 * @param {string} source
 * @param {!Function} callback
 * @param {?TaskData=} data
 * @param {?function(!Task)=} customSchedule
 * @param {?function(!Task)=} customCancel
 * @return {!EventTask} eventTask
 */
Zone.prototype.scheduleEventTask = function(source, callback, data, customSchedule, customCancel) {
};

/**
 * @param {!Task} task
 * @return {!Task} task
 */
Zone.prototype.scheduleTask = function(task) {};

/**
 * @param {!Task} task
 * @return {!Task} task
 */
Zone.prototype.cancelTask = function(task) {};

/**
 * @record
 */
var ZoneSpec = function() {};
/**
 * @type {!string} The name of the zone. Usefull when debugging Zones.
 */
ZoneSpec.prototype.name;

/**
 * @type {Object<string, Object>|undefined} A set of properties to be associated with Zone. Use
 * [Zone.get] to retrieve them.
 */
ZoneSpec.prototype.properties;

/**
 * Allows the interception of zone forking.
 *
 * When the zone is being forked, the request is forwarded to this method for interception.
 *
 * @type {
 *   undefined|?function(ZoneDelegate, Zone, Zone, ZoneSpec): Zone
 * }
 */
ZoneSpec.prototype.onFork;

/**
 * Allows the interception of the wrapping of the callback.
 *
 * When the zone is being forked, the request is forwarded to this method for interception.
 *
 * @type {
 *   undefined|?function(ZoneDelegate, Zone, Zone, Function, string): Function
 * }
 */
ZoneSpec.prototype.onIntercept;

/**
 * Allows interception of the callback invocation.
 *
 * @type {
 *   undefined|?function(ZoneDelegate, Zone, Zone, Function, Object, Array, string): *
 * }
 */
ZoneSpec.prototype.onInvoke;

/**
 * Allows interception of the error handling.
 *
 * @type {
 *   undefined|?function(ZoneDelegate, Zone, Zone, Object): boolean
 * }
 */
ZoneSpec.prototype.onHandleError;

/**
 * Allows interception of task scheduling.
 *
 * @type {
 *   undefined|?function(ZoneDelegate, Zone, Zone, Task): Task
 * }
 */
ZoneSpec.prototype.onScheduleTask;

/**
 * Allows interception of task invoke.
 *
 * @type {
 *   undefined|?function(ZoneDelegate, Zone, Zone, Task, Object, Array): *
 * }
 */
ZoneSpec.prototype.onInvokeTask;

/**
 * Allows interception of task cancelation.
 *
 * @type {
 *   undefined|?function(ZoneDelegate, Zone, Zone, Task): *
 * }
 */
ZoneSpec.prototype.onCancelTask;
/**
 * Notifies of changes to the task queue empty status.
 *
 * @type {
 *   undefined|?function(ZoneDelegate, Zone, Zone, HasTaskState)
 * }
 */
ZoneSpec.prototype.onHasTask;

/**
 * @interface
 */
var ZoneDelegate = function() {};
/**
 * @type {!Zone} zone
 */
ZoneDelegate.prototype.zone;
/**
 * @param {!Zone} targetZone the [Zone] which originally received the request.
 * @param {!ZoneSpec} zoneSpec the argument passed into the `fork` method.
 * @returns {!Zone} the new forked zone
 */
ZoneDelegate.prototype.fork = function(targetZone, zoneSpec) {};
/**
 * @param {!Zone} targetZone the [Zone] which originally received the request.
 * @param {!Function} callback the callback function passed into `wrap` function
 * @param {string=} source the argument passed into the `wrap` method.
 * @returns {!Function}
 */
ZoneDelegate.prototype.intercept = function(targetZone, callback, source) {};

/**
 * @param {Zone} targetZone the [Zone] which originally received the request.
 * @param {!Function} callback the callback which will be invoked.
 * @param {?Object=} applyThis the argument passed into the `run` method.
 * @param {?Array=} applyArgs the argument passed into the `run` method.
 * @param {?string=} source the argument passed into the `run` method.
 * @returns {*}
 */
ZoneDelegate.prototype.invoke = function(targetZone, callback, applyThis, applyArgs, source) {};
/**
 * @param {!Zone} targetZone the [Zone] which originally received the request.
 * @param {!Object} error the argument passed into the `handleError` method.
 * @returns {boolean}
 */
ZoneDelegate.prototype.handleError = function(targetZone, error) {};
/**
 * @param {!Zone} targetZone the [Zone] which originally received the request.
 * @param {!Task} task the argument passed into the `scheduleTask` method.
 * @returns {!Task} task
 */
ZoneDelegate.prototype.scheduleTask = function(targetZone, task) {};
/**
 * @param {!Zone} targetZone The [Zone] which originally received the request.
 * @param {!Task} task The argument passed into the `scheduleTask` method.
 * @param {?Object=} applyThis The argument passed into the `run` method.
 * @param {?Array=} applyArgs The argument passed into the `run` method.
 * @returns {*}
 */
ZoneDelegate.prototype.invokeTask = function(targetZone, task, applyThis, applyArgs) {};
/**
 * @param {!Zone} targetZone The [Zone] which originally received the request.
 * @param {!Task} task The argument passed into the `cancelTask` method.
 * @returns {*}
 */
ZoneDelegate.prototype.cancelTask = function(targetZone, task) {};
/**
 * @param {!Zone} targetZone The [Zone] which originally received the request.
 * @param {!HasTaskState} hasTaskState
 */
ZoneDelegate.prototype.hasTask = function(targetZone, hasTaskState) {};

/**
 * @interface
 */
var HasTaskState = function() {};

/**
 * @type {boolean}
 */
HasTaskState.prototype.microTask;
/**
 * @type {boolean}
 */
HasTaskState.prototype.macroTask;
/**
 * @type {boolean}
 */
HasTaskState.prototype.eventTask;
/**
 * @type {TaskType}
 */
HasTaskState.prototype.change;

/**
 * @interface
 */
var TaskType = function() {};

/**
 * @interface
 */
var TaskState = function() {};

/**
 * @interface
 */
var TaskData = function() {};
/**
 * @type {boolean|undefined}
 */
TaskData.prototype.isPeriodic;
/**
 * @type {number|undefined}
 */
TaskData.prototype.delay;
/**
 * @type {number|undefined}
 */
TaskData.prototype.handleId;

/**
 * @interface
 */
var Task = function() {};
/**
 * @type {TaskType}
 */
Task.prototype.type;
/**
 * @type {TaskState}
 */
Task.prototype.state;
/**
 * @type {string}
 */
Task.prototype.source;
/**
 * @type {Function}
 */
Task.prototype.invoke;
/**
 * @type {Function}
 */
Task.prototype.callback;
/**
 * @type {TaskData}
 */
Task.prototype.data;
/**
 * @param {!Task} task
 */
Task.prototype.scheduleFn = function(task) {};
/**
 * @param {!Task} task
 */
Task.prototype.cancelFn = function(task) {};
/**
 * @type {Zone}
 */
Task.prototype.zone;
/**
 * @type {number}
 */
Task.prototype.runCount;
Task.prototype.cancelSchduleRequest = function() {};

/**
 * @interface
 * @extends {Task}
 */
var MicroTask = function() {};
/**
 * @interface
 * @extends {Task}
 */
var MacroTask = function() {};
/**
 * @interface
 * @extends {Task}
 */
var EventTask = function() {};

/**
 * @type {?string}
 */
Error.prototype.zoneAwareStack;

/**
 * @type {?string}
 */
Error.prototype.originalStack;
