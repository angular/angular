import * as impl from "./wtf_impl";
// Change exports to const once https://github.com/angular/ts2dart/issues/150
/**
 * True if WTF is enabled.
 */
export var wtfEnabled = impl.detectWTF();
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
export var wtfCreateScope = wtfEnabled ? impl.createScope : (signature, flags) => noopScope;
/**
 * Used to mark end of Scope.
 *
 * - `scope` to end.
 * - `returnValue` (optional) to be passed to the WTF.
 *
 * Returns the `returnValue for easy chaining.
 */
export var wtfLeave = wtfEnabled ? impl.leave : (s, r) => r;
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
export var wtfStartTimeRange = wtfEnabled ? impl.startTimeRange : (rangeType, action) => null;
/**
 * Ends a async time range operation.
 * [range] is the return value from [wtfStartTimeRange] Async ranges only work if WTF has been
 * enabled.
 */
export var wtfEndTimeRange = wtfEnabled ? impl.endTimeRange : (r) => null;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL3Byb2ZpbGUvcHJvZmlsZS50cyJdLCJuYW1lcyI6WyJub29wU2NvcGUiXSwibWFwcGluZ3MiOiJBQUFzQyxPQUUvQixLQUFLLElBQUksTUFBTSxZQUFZO0FBRWxDLDZFQUE2RTtBQUU3RTs7R0FFRztBQUNILFdBQVcsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUV6QyxtQkFBbUIsSUFBVSxFQUFFLElBQVU7SUFDdkNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0FBQ2RBLENBQUNBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E0Qkc7QUFDSCxXQUFXLGNBQWMsR0FDckIsVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxTQUFpQixFQUFFLEtBQVcsS0FBSyxTQUFTLENBQUM7QUFFbEY7Ozs7Ozs7R0FPRztBQUNILFdBQVcsUUFBUSxHQUNmLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBTSxFQUFFLENBQU8sS0FBSyxDQUFDLENBQUM7QUFFckQ7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxXQUFXLGlCQUFpQixHQUN4QixVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLFNBQWlCLEVBQUUsTUFBYyxLQUFLLElBQUksQ0FBQztBQUVuRjs7OztHQUlHO0FBQ0gsV0FBVyxlQUFlLEdBQXlCLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBTSxLQUNILElBQUksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB7V3RmU2NvcGVGbn0gZnJvbSAnLi93dGZfaW1wbCc7XG5cbmltcG9ydCAqIGFzIGltcGwgZnJvbSBcIi4vd3RmX2ltcGxcIjtcblxuLy8gQ2hhbmdlIGV4cG9ydHMgdG8gY29uc3Qgb25jZSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci90czJkYXJ0L2lzc3Vlcy8xNTBcblxuLyoqXG4gKiBUcnVlIGlmIFdURiBpcyBlbmFibGVkLlxuICovXG5leHBvcnQgdmFyIHd0ZkVuYWJsZWQgPSBpbXBsLmRldGVjdFdURigpO1xuXG5mdW5jdGlvbiBub29wU2NvcGUoYXJnMD86IGFueSwgYXJnMT86IGFueSk6IGFueSB7XG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIENyZWF0ZSB0cmFjZSBzY29wZS5cbiAqXG4gKiBTY29wZXMgbXVzdCBiZSBzdHJpY3RseSBuZXN0ZWQgYW5kIGFyZSBhbmFsb2dvdXMgdG8gc3RhY2sgZnJhbWVzLCBidXRcbiAqIGRvIG5vdCBoYXZlIHRvIGZvbGxvdyB0aGUgc3RhY2sgZnJhbWVzLiBJbnN0ZWFkIGl0IGlzIHJlY29tbWVuZGVkIHRoYXQgdGhleSBmb2xsb3cgbG9naWNhbFxuICogbmVzdGluZy4gWW91IG1heSB3YW50IHRvIHVzZVxuICogW0V2ZW50XG4gKiBTaWduYXR1cmVzXShodHRwOi8vZ29vZ2xlLmdpdGh1Yi5pby90cmFjaW5nLWZyYW1ld29yay9pbnN0cnVtZW50aW5nLWNvZGUuaHRtbCNjdXN0b20tZXZlbnRzKVxuICogYXMgdGhleSBhcmUgZGVmaW5lZCBpbiBXVEYuXG4gKlxuICogVXNlZCB0byBtYXJrIHNjb3BlIGVudHJ5LiBUaGUgcmV0dXJuIHZhbHVlIGlzIHVzZWQgdG8gbGVhdmUgdGhlIHNjb3BlLlxuICpcbiAqICAgICB2YXIgbXlTY29wZSA9IHd0ZkNyZWF0ZVNjb3BlKCdNeUNsYXNzI215TWV0aG9kKGFzY2lpIHNvbWVWYWwpJyk7XG4gKlxuICogICAgIHNvbWVNZXRob2QoKSB7XG4gKiAgICAgICAgdmFyIHMgPSBteVNjb3BlKCdGb28nKTsgLy8gJ0ZvbycgZ2V0cyBzdG9yZWQgaW4gdHJhY2luZyBVSVxuICogICAgICAgIC8vIERPIFNPTUUgV09SSyBIRVJFXG4gKiAgICAgICAgcmV0dXJuIHd0ZkxlYXZlKHMsIDEyMyk7IC8vIFJldHVybiB2YWx1ZSAxMjNcbiAqICAgICB9XG4gKlxuICogTm90ZSwgYWRkaW5nIHRyeS1maW5hbGx5IGJsb2NrIGFyb3VuZCB0aGUgd29yayB0byBlbnN1cmUgdGhhdCBgd3RmTGVhdmVgIGdldHMgY2FsbGVkIGNhblxuICogbmVnYXRpdmVseSBpbXBhY3QgdGhlIHBlcmZvcm1hbmNlIG9mIHlvdXIgYXBwbGljYXRpb24uIEZvciB0aGlzIHJlYXNvbiB3ZSByZWNvbW1lbmQgdGhhdFxuICogeW91IGRvbid0IGFkZCB0aGVtIHRvIGVuc3VyZSB0aGF0IGB3dGZMZWF2ZWAgZ2V0cyBjYWxsZWQuIEluIHByb2R1Y3Rpb24gYHd0ZkxlYXZlYCBpcyBhIG5vb3AgYW5kXG4gKiBzbyB0cnktZmluYWxseSBibG9jayBoYXMgbm8gdmFsdWUuIFdoZW4gZGVidWdnaW5nIHBlcmYgaXNzdWVzLCBza2lwcGluZyBgd3RmTGVhdmVgLCBkbyB0b1xuICogZXhjZXB0aW9uLCB3aWxsIHByb2R1Y2UgaW5jb3JyZWN0IHRyYWNlLCBidXQgcHJlc2VuY2Ugb2YgZXhjZXB0aW9uIHNpZ25pZmllcyBsb2dpYyBlcnJvciB3aGljaFxuICogbmVlZHMgdG8gYmUgZml4ZWQgYmVmb3JlIHRoZSBhcHAgc2hvdWxkIGJlIHByb2ZpbGVkLiBBZGQgdHJ5LWZpbmFsbHkgb25seSB3aGVuIHlvdSBleHBlY3QgdGhhdFxuICogYW4gZXhjZXB0aW9uIGlzIGV4cGVjdGVkIGR1cmluZyBub3JtYWwgZXhlY3V0aW9uIHdoaWxlIHByb2ZpbGluZy5cbiAqXG4gKi9cbmV4cG9ydCB2YXIgd3RmQ3JlYXRlU2NvcGU6IChzaWduYXR1cmU6IHN0cmluZywgZmxhZ3M/OiBhbnkpID0+IGltcGwuV3RmU2NvcGVGbiA9XG4gICAgd3RmRW5hYmxlZCA/IGltcGwuY3JlYXRlU2NvcGUgOiAoc2lnbmF0dXJlOiBzdHJpbmcsIGZsYWdzPzogYW55KSA9PiBub29wU2NvcGU7XG5cbi8qKlxuICogVXNlZCB0byBtYXJrIGVuZCBvZiBTY29wZS5cbiAqXG4gKiAtIGBzY29wZWAgdG8gZW5kLlxuICogLSBgcmV0dXJuVmFsdWVgIChvcHRpb25hbCkgdG8gYmUgcGFzc2VkIHRvIHRoZSBXVEYuXG4gKlxuICogUmV0dXJucyB0aGUgYHJldHVyblZhbHVlIGZvciBlYXN5IGNoYWluaW5nLlxuICovXG5leHBvcnQgdmFyIHd0ZkxlYXZlOjxUPihzY29wZTogYW55LCByZXR1cm5WYWx1ZT86IFQpID0+IFQgPVxuICAgIHd0ZkVuYWJsZWQgPyBpbXBsLmxlYXZlIDogKHM6IGFueSwgcj86IGFueSkgPT4gcjtcblxuLyoqXG4gKiBVc2VkIHRvIG1hcmsgQXN5bmMgc3RhcnQuIEFzeW5jIGFyZSBzaW1pbGFyIHRvIHNjb3BlIGJ1dCB0aGV5IGRvbid0IGhhdmUgdG8gYmUgc3RyaWN0bHkgbmVzdGVkLlxuICogVGhlIHJldHVybiB2YWx1ZSBpcyB1c2VkIGluIHRoZSBjYWxsIHRvIFtlbmRBc3luY10uIEFzeW5jIHJhbmdlcyBvbmx5IHdvcmsgaWYgV1RGIGhhcyBiZWVuXG4gKiBlbmFibGVkLlxuICpcbiAqICAgICBzb21lTWV0aG9kKCkge1xuICogICAgICAgIHZhciBzID0gd3RmU3RhcnRUaW1lUmFuZ2UoJ0hUVFA6R0VUJywgJ3NvbWUudXJsJyk7XG4gKiAgICAgICAgdmFyIGZ1dHVyZSA9IG5ldyBGdXR1cmUuZGVsYXkoNSkudGhlbigoXykge1xuICogICAgICAgICAgd3RmRW5kVGltZVJhbmdlKHMpO1xuICogICAgICAgIH0pO1xuICogICAgIH1cbiAqL1xuZXhwb3J0IHZhciB3dGZTdGFydFRpbWVSYW5nZTogKHJhbmdlVHlwZTogc3RyaW5nLCBhY3Rpb246IHN0cmluZykgPT4gYW55ID1cbiAgICB3dGZFbmFibGVkID8gaW1wbC5zdGFydFRpbWVSYW5nZSA6IChyYW5nZVR5cGU6IHN0cmluZywgYWN0aW9uOiBzdHJpbmcpID0+IG51bGw7XG5cbi8qKlxuICogRW5kcyBhIGFzeW5jIHRpbWUgcmFuZ2Ugb3BlcmF0aW9uLlxuICogW3JhbmdlXSBpcyB0aGUgcmV0dXJuIHZhbHVlIGZyb20gW3d0ZlN0YXJ0VGltZVJhbmdlXSBBc3luYyByYW5nZXMgb25seSB3b3JrIGlmIFdURiBoYXMgYmVlblxuICogZW5hYmxlZC5cbiAqL1xuZXhwb3J0IHZhciB3dGZFbmRUaW1lUmFuZ2U6IChyYW5nZTogYW55KSA9PiB2b2lkID0gd3RmRW5hYmxlZCA/IGltcGwuZW5kVGltZVJhbmdlIDogKHI6IGFueSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xuIl19