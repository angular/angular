'use strict';var impl = require("./wtf_impl");
// Change exports to const once https://github.com/angular/ts2dart/issues/150
/**
 * True if WTF is enabled.
 */
exports.wtfEnabled = impl.detectWTF();
function noopScope(arg0, arg1) {
    return null;
}
/**
 * Create trace scope.
 *
 * Scopes must be strictly nested and are analogous to stack frames, but
 * do not have to follow the stack frames. Instead it is recommended that they follow logical
 * nesting. You may want to use
 * [Event
 * Signatures](http://google.github.io/tracing-framework/instrumenting-code.html#custom-events)
 * as they are defined in WTF.
 *
 * Used to mark scope entry. The return value is used to leave the scope.
 *
 *     var myScope = wtfCreateScope('MyClass#myMethod(ascii someVal)');
 *
 *     someMethod() {
 *        var s = myScope('Foo'); // 'Foo' gets stored in tracing UI
 *        // DO SOME WORK HERE
 *        return wtfLeave(s, 123); // Return value 123
 *     }
 *
 * Note, adding try-finally block around the work to ensure that `wtfLeave` gets called can
 * negatively impact the performance of your application. For this reason we recommend that
 * you don't add them to ensure that `wtfLeave` gets called. In production `wtfLeave` is a noop and
 * so try-finally block has no value. When debugging perf issues, skipping `wtfLeave`, do to
 * exception, will produce incorrect trace, but presence of exception signifies logic error which
 * needs to be fixed before the app should be profiled. Add try-finally only when you expect that
 * an exception is expected during normal execution while profiling.
 *
 */
exports.wtfCreateScope = exports.wtfEnabled ? impl.createScope : function (signature, flags) { return noopScope; };
/**
 * Used to mark end of Scope.
 *
 * - `scope` to end.
 * - `returnValue` (optional) to be passed to the WTF.
 *
 * Returns the `returnValue for easy chaining.
 */
exports.wtfLeave = exports.wtfEnabled ? impl.leave : function (s, r) { return r; };
/**
 * Used to mark Async start. Async are similar to scope but they don't have to be strictly nested.
 * The return value is used in the call to [endAsync]. Async ranges only work if WTF has been
 * enabled.
 *
 *     someMethod() {
 *        var s = wtfStartTimeRange('HTTP:GET', 'some.url');
 *        var future = new Future.delay(5).then((_) {
 *          wtfEndTimeRange(s);
 *        });
 *     }
 */
exports.wtfStartTimeRange = exports.wtfEnabled ? impl.startTimeRange : function (rangeType, action) { return null; };
/**
 * Ends a async time range operation.
 * [range] is the return value from [wtfStartTimeRange] Async ranges only work if WTF has been
 * enabled.
 */
exports.wtfEndTimeRange = exports.wtfEnabled ? impl.endTimeRange : function (r) {
    return null;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL3Byb2ZpbGUvcHJvZmlsZS50cyJdLCJuYW1lcyI6WyJub29wU2NvcGUiXSwibWFwcGluZ3MiOiJBQUVBLElBQVksSUFBSSxXQUFNLFlBQVksQ0FBQyxDQUFBO0FBRW5DLDZFQUE2RTtBQUU3RTs7R0FFRztBQUNRLGtCQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBRXpDLG1CQUFtQixJQUFVLEVBQUUsSUFBVTtJQUN2Q0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7QUFDZEEsQ0FBQ0E7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTRCRztBQUNRLHNCQUFjLEdBQ3JCLGtCQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFDLFNBQWlCLEVBQUUsS0FBVyxJQUFLLE9BQUEsU0FBUyxFQUFULENBQVMsQ0FBQztBQUVsRjs7Ozs7OztHQU9HO0FBQ1EsZ0JBQVEsR0FDZixrQkFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBQyxDQUFNLEVBQUUsQ0FBTyxJQUFLLE9BQUEsQ0FBQyxFQUFELENBQUMsQ0FBQztBQUVyRDs7Ozs7Ozs7Ozs7R0FXRztBQUNRLHlCQUFpQixHQUN4QixrQkFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsVUFBQyxTQUFpQixFQUFFLE1BQWMsSUFBSyxPQUFBLElBQUksRUFBSixDQUFJLENBQUM7QUFFbkY7Ozs7R0FJRztBQUNRLHVCQUFlLEdBQXlCLGtCQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxVQUFDLENBQU07V0FDSCxJQUFJO0FBQUosQ0FBSSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IHtXdGZTY29wZUZufSBmcm9tICcuL3d0Zl9pbXBsJztcblxuaW1wb3J0ICogYXMgaW1wbCBmcm9tIFwiLi93dGZfaW1wbFwiO1xuXG4vLyBDaGFuZ2UgZXhwb3J0cyB0byBjb25zdCBvbmNlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL3RzMmRhcnQvaXNzdWVzLzE1MFxuXG4vKipcbiAqIFRydWUgaWYgV1RGIGlzIGVuYWJsZWQuXG4gKi9cbmV4cG9ydCB2YXIgd3RmRW5hYmxlZCA9IGltcGwuZGV0ZWN0V1RGKCk7XG5cbmZ1bmN0aW9uIG5vb3BTY29wZShhcmcwPzogYW55LCBhcmcxPzogYW55KTogYW55IHtcbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogQ3JlYXRlIHRyYWNlIHNjb3BlLlxuICpcbiAqIFNjb3BlcyBtdXN0IGJlIHN0cmljdGx5IG5lc3RlZCBhbmQgYXJlIGFuYWxvZ291cyB0byBzdGFjayBmcmFtZXMsIGJ1dFxuICogZG8gbm90IGhhdmUgdG8gZm9sbG93IHRoZSBzdGFjayBmcmFtZXMuIEluc3RlYWQgaXQgaXMgcmVjb21tZW5kZWQgdGhhdCB0aGV5IGZvbGxvdyBsb2dpY2FsXG4gKiBuZXN0aW5nLiBZb3UgbWF5IHdhbnQgdG8gdXNlXG4gKiBbRXZlbnRcbiAqIFNpZ25hdHVyZXNdKGh0dHA6Ly9nb29nbGUuZ2l0aHViLmlvL3RyYWNpbmctZnJhbWV3b3JrL2luc3RydW1lbnRpbmctY29kZS5odG1sI2N1c3RvbS1ldmVudHMpXG4gKiBhcyB0aGV5IGFyZSBkZWZpbmVkIGluIFdURi5cbiAqXG4gKiBVc2VkIHRvIG1hcmsgc2NvcGUgZW50cnkuIFRoZSByZXR1cm4gdmFsdWUgaXMgdXNlZCB0byBsZWF2ZSB0aGUgc2NvcGUuXG4gKlxuICogICAgIHZhciBteVNjb3BlID0gd3RmQ3JlYXRlU2NvcGUoJ015Q2xhc3MjbXlNZXRob2QoYXNjaWkgc29tZVZhbCknKTtcbiAqXG4gKiAgICAgc29tZU1ldGhvZCgpIHtcbiAqICAgICAgICB2YXIgcyA9IG15U2NvcGUoJ0ZvbycpOyAvLyAnRm9vJyBnZXRzIHN0b3JlZCBpbiB0cmFjaW5nIFVJXG4gKiAgICAgICAgLy8gRE8gU09NRSBXT1JLIEhFUkVcbiAqICAgICAgICByZXR1cm4gd3RmTGVhdmUocywgMTIzKTsgLy8gUmV0dXJuIHZhbHVlIDEyM1xuICogICAgIH1cbiAqXG4gKiBOb3RlLCBhZGRpbmcgdHJ5LWZpbmFsbHkgYmxvY2sgYXJvdW5kIHRoZSB3b3JrIHRvIGVuc3VyZSB0aGF0IGB3dGZMZWF2ZWAgZ2V0cyBjYWxsZWQgY2FuXG4gKiBuZWdhdGl2ZWx5IGltcGFjdCB0aGUgcGVyZm9ybWFuY2Ugb2YgeW91ciBhcHBsaWNhdGlvbi4gRm9yIHRoaXMgcmVhc29uIHdlIHJlY29tbWVuZCB0aGF0XG4gKiB5b3UgZG9uJ3QgYWRkIHRoZW0gdG8gZW5zdXJlIHRoYXQgYHd0ZkxlYXZlYCBnZXRzIGNhbGxlZC4gSW4gcHJvZHVjdGlvbiBgd3RmTGVhdmVgIGlzIGEgbm9vcCBhbmRcbiAqIHNvIHRyeS1maW5hbGx5IGJsb2NrIGhhcyBubyB2YWx1ZS4gV2hlbiBkZWJ1Z2dpbmcgcGVyZiBpc3N1ZXMsIHNraXBwaW5nIGB3dGZMZWF2ZWAsIGRvIHRvXG4gKiBleGNlcHRpb24sIHdpbGwgcHJvZHVjZSBpbmNvcnJlY3QgdHJhY2UsIGJ1dCBwcmVzZW5jZSBvZiBleGNlcHRpb24gc2lnbmlmaWVzIGxvZ2ljIGVycm9yIHdoaWNoXG4gKiBuZWVkcyB0byBiZSBmaXhlZCBiZWZvcmUgdGhlIGFwcCBzaG91bGQgYmUgcHJvZmlsZWQuIEFkZCB0cnktZmluYWxseSBvbmx5IHdoZW4geW91IGV4cGVjdCB0aGF0XG4gKiBhbiBleGNlcHRpb24gaXMgZXhwZWN0ZWQgZHVyaW5nIG5vcm1hbCBleGVjdXRpb24gd2hpbGUgcHJvZmlsaW5nLlxuICpcbiAqL1xuZXhwb3J0IHZhciB3dGZDcmVhdGVTY29wZTogKHNpZ25hdHVyZTogc3RyaW5nLCBmbGFncz86IGFueSkgPT4gaW1wbC5XdGZTY29wZUZuID1cbiAgICB3dGZFbmFibGVkID8gaW1wbC5jcmVhdGVTY29wZSA6IChzaWduYXR1cmU6IHN0cmluZywgZmxhZ3M/OiBhbnkpID0+IG5vb3BTY29wZTtcblxuLyoqXG4gKiBVc2VkIHRvIG1hcmsgZW5kIG9mIFNjb3BlLlxuICpcbiAqIC0gYHNjb3BlYCB0byBlbmQuXG4gKiAtIGByZXR1cm5WYWx1ZWAgKG9wdGlvbmFsKSB0byBiZSBwYXNzZWQgdG8gdGhlIFdURi5cbiAqXG4gKiBSZXR1cm5zIHRoZSBgcmV0dXJuVmFsdWUgZm9yIGVhc3kgY2hhaW5pbmcuXG4gKi9cbmV4cG9ydCB2YXIgd3RmTGVhdmU6PFQ+KHNjb3BlOiBhbnksIHJldHVyblZhbHVlPzogVCkgPT4gVCA9XG4gICAgd3RmRW5hYmxlZCA/IGltcGwubGVhdmUgOiAoczogYW55LCByPzogYW55KSA9PiByO1xuXG4vKipcbiAqIFVzZWQgdG8gbWFyayBBc3luYyBzdGFydC4gQXN5bmMgYXJlIHNpbWlsYXIgdG8gc2NvcGUgYnV0IHRoZXkgZG9uJ3QgaGF2ZSB0byBiZSBzdHJpY3RseSBuZXN0ZWQuXG4gKiBUaGUgcmV0dXJuIHZhbHVlIGlzIHVzZWQgaW4gdGhlIGNhbGwgdG8gW2VuZEFzeW5jXS4gQXN5bmMgcmFuZ2VzIG9ubHkgd29yayBpZiBXVEYgaGFzIGJlZW5cbiAqIGVuYWJsZWQuXG4gKlxuICogICAgIHNvbWVNZXRob2QoKSB7XG4gKiAgICAgICAgdmFyIHMgPSB3dGZTdGFydFRpbWVSYW5nZSgnSFRUUDpHRVQnLCAnc29tZS51cmwnKTtcbiAqICAgICAgICB2YXIgZnV0dXJlID0gbmV3IEZ1dHVyZS5kZWxheSg1KS50aGVuKChfKSB7XG4gKiAgICAgICAgICB3dGZFbmRUaW1lUmFuZ2Uocyk7XG4gKiAgICAgICAgfSk7XG4gKiAgICAgfVxuICovXG5leHBvcnQgdmFyIHd0ZlN0YXJ0VGltZVJhbmdlOiAocmFuZ2VUeXBlOiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nKSA9PiBhbnkgPVxuICAgIHd0ZkVuYWJsZWQgPyBpbXBsLnN0YXJ0VGltZVJhbmdlIDogKHJhbmdlVHlwZTogc3RyaW5nLCBhY3Rpb246IHN0cmluZykgPT4gbnVsbDtcblxuLyoqXG4gKiBFbmRzIGEgYXN5bmMgdGltZSByYW5nZSBvcGVyYXRpb24uXG4gKiBbcmFuZ2VdIGlzIHRoZSByZXR1cm4gdmFsdWUgZnJvbSBbd3RmU3RhcnRUaW1lUmFuZ2VdIEFzeW5jIHJhbmdlcyBvbmx5IHdvcmsgaWYgV1RGIGhhcyBiZWVuXG4gKiBlbmFibGVkLlxuICovXG5leHBvcnQgdmFyIHd0ZkVuZFRpbWVSYW5nZTogKHJhbmdlOiBhbnkpID0+IHZvaWQgPSB3dGZFbmFibGVkID8gaW1wbC5lbmRUaW1lUmFuZ2UgOiAocjogYW55KSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGw7XG4iXX0=