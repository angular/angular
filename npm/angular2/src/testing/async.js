'use strict';"use strict";
/**
 * Wraps a test function in an asynchronous test zone. The test will automatically
 * complete when all asynchronous calls within this zone are done. Can be used
 * to wrap an {@link inject} call.
 *
 * Example:
 *
 * ```
 * it('...', async(inject([AClass], (object) => {
 *   object.doSomething.then(() => {
 *     expect(...);
 *   })
 * });
 * ```
 */
function async(fn) {
    return function () {
        return new Promise(function (finishCallback, failCallback) {
            var AsyncTestZoneSpec = Zone['AsyncTestZoneSpec'];
            var testZoneSpec = new AsyncTestZoneSpec(finishCallback, failCallback, 'test');
            var testZone = Zone.current.fork(testZoneSpec);
            return testZone.run(fn);
        });
    };
}
exports.async = async;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVhjdW9mUHhHLnRtcC9hbmd1bGFyMi9zcmMvdGVzdGluZy9hc3luYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7O0dBY0c7QUFDSCxlQUFzQixFQUFZO0lBQ2hDLE1BQU0sQ0FBQztRQUNMLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBTyxVQUFDLGNBQWMsRUFBRSxZQUFZO1lBQ3BELElBQUksaUJBQWlCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDbEQsSUFBSSxZQUFZLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxjQUFjLEVBQUUsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQy9FLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzFCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFBO0FBQ0gsQ0FBQztBQVRlLGFBQUssUUFTcEIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogV3JhcHMgYSB0ZXN0IGZ1bmN0aW9uIGluIGFuIGFzeW5jaHJvbm91cyB0ZXN0IHpvbmUuIFRoZSB0ZXN0IHdpbGwgYXV0b21hdGljYWxseVxuICogY29tcGxldGUgd2hlbiBhbGwgYXN5bmNocm9ub3VzIGNhbGxzIHdpdGhpbiB0aGlzIHpvbmUgYXJlIGRvbmUuIENhbiBiZSB1c2VkXG4gKiB0byB3cmFwIGFuIHtAbGluayBpbmplY3R9IGNhbGwuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBcbiAqIGl0KCcuLi4nLCBhc3luYyhpbmplY3QoW0FDbGFzc10sIChvYmplY3QpID0+IHtcbiAqICAgb2JqZWN0LmRvU29tZXRoaW5nLnRoZW4oKCkgPT4ge1xuICogICAgIGV4cGVjdCguLi4pO1xuICogICB9KVxuICogfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzeW5jKGZuOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgcmV0dXJuICgpID0+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKGZpbmlzaENhbGxiYWNrLCBmYWlsQ2FsbGJhY2spID0+IHtcbiAgICAgIHZhciBBc3luY1Rlc3Rab25lU3BlYyA9IFpvbmVbJ0FzeW5jVGVzdFpvbmVTcGVjJ107XG4gICAgICB2YXIgdGVzdFpvbmVTcGVjID0gbmV3IEFzeW5jVGVzdFpvbmVTcGVjKGZpbmlzaENhbGxiYWNrLCBmYWlsQ2FsbGJhY2ssICd0ZXN0Jyk7XG4gICAgICB2YXIgdGVzdFpvbmUgPSBab25lLmN1cnJlbnQuZm9yayh0ZXN0Wm9uZVNwZWMpO1xuICAgICAgcmV0dXJuIHRlc3Rab25lLnJ1bihmbik7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==