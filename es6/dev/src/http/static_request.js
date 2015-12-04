import { Headers } from './headers';
import { normalizeMethodName } from './http_utils';
import { isPresent, StringWrapper } from 'angular2/src/facade/lang';
// TODO(jeffbcross): properly implement body accessors
/**
 * Creates `Request` instances from provided values.
 *
 * The Request's interface is inspired by the Request constructor defined in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#request-class),
 * but is considered a static value whose body can be accessed many times. There are other
 * differences in the implementation, but this is the most significant.
 *
 * `Request` instances are typically created by higher-level classes, like {@link Http} and
 * {@link Jsonp}, but it may occasionally be useful to explicitly create `Request` instances.
 * One such example is when creating services that wrap higher-level services, like {@link Http},
 * where it may be useful to generate a `Request` with arbitrary headers and search params.
 *
 * ```typescript
 * import {Injectable, Injector} from 'angular2/angular2';
 * import {HTTP_PROVIDERS, Http, Request, RequestMethods} from 'angular2/http';
 *
 * @Injectable()
 * class AutoAuthenticator {
 *   constructor(public http:Http) {}
 *   request(url:string) {
 *     return this.http.request(new Request({
 *       method: RequestMethods.Get,
 *       url: url,
 *       search: 'password=123'
 *     }));
 *   }
 * }
 *
 * var injector = Injector.resolveAndCreate([HTTP_PROVIDERS, AutoAuthenticator]);
 * var authenticator = injector.get(AutoAuthenticator);
 * authenticator.request('people.json').subscribe(res => {
 *   //URL should have included '?password=123'
 *   console.log('people', res.json());
 * });
 * ```
 */
export class Request {
    constructor(requestOptions) {
        // TODO: assert that url is present
        let url = requestOptions.url;
        this.url = requestOptions.url;
        if (isPresent(requestOptions.search)) {
            let search = requestOptions.search.toString();
            if (search.length > 0) {
                let prefix = '?';
                if (StringWrapper.contains(this.url, '?')) {
                    prefix = (this.url[this.url.length - 1] == '&') ? '' : '&';
                }
                // TODO: just delete search-query-looking string in url?
                this.url = url + prefix + search;
            }
        }
        this._body = requestOptions.body;
        this.method = normalizeMethodName(requestOptions.method);
        // TODO(jeffbcross): implement behavior
        // Defaults to 'omit', consistent with browser
        // TODO(jeffbcross): implement behavior
        this.headers = new Headers(requestOptions.headers);
    }
    /**
     * Returns the request's body as string, assuming that body exists. If body is undefined, return
     * empty
     * string.
     */
    text() { return isPresent(this._body) ? this._body.toString() : ''; }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljX3JlcXVlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvaHR0cC9zdGF0aWNfcmVxdWVzdC50cyJdLCJuYW1lcyI6WyJSZXF1ZXN0IiwiUmVxdWVzdC5jb25zdHJ1Y3RvciIsIlJlcXVlc3QudGV4dCJdLCJtYXBwaW5ncyI6Ik9BRU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxXQUFXO09BQzFCLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxjQUFjO09BQ3pDLEVBR0wsU0FBUyxFQUVULGFBQWEsRUFDZCxNQUFNLDBCQUEwQjtBQUVqQyxzREFBc0Q7QUFDdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9DRztBQUNIO0lBYUVBLFlBQVlBLGNBQTJCQTtRQUNyQ0MsbUNBQW1DQTtRQUNuQ0EsSUFBSUEsR0FBR0EsR0FBR0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0E7UUFDN0JBLElBQUlBLENBQUNBLEdBQUdBLEdBQUdBLGNBQWNBLENBQUNBLEdBQUdBLENBQUNBO1FBQzlCQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxjQUFjQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNyQ0EsSUFBSUEsTUFBTUEsR0FBR0EsY0FBY0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDOUNBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUN0QkEsSUFBSUEsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0E7Z0JBQ2pCQSxFQUFFQSxDQUFDQSxDQUFDQSxhQUFhQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDMUNBLE1BQU1BLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLEdBQUdBLENBQUNBO2dCQUM3REEsQ0FBQ0E7Z0JBQ0RBLHdEQUF3REE7Z0JBQ3hEQSxJQUFJQSxDQUFDQSxHQUFHQSxHQUFHQSxHQUFHQSxHQUFHQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQTtZQUNuQ0EsQ0FBQ0E7UUFDSEEsQ0FBQ0E7UUFDREEsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsY0FBY0EsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDakNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLG1CQUFtQkEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDekRBLHVDQUF1Q0E7UUFDdkNBLDhDQUE4Q0E7UUFDOUNBLHVDQUF1Q0E7UUFDdkNBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLE9BQU9BLENBQUNBLGNBQWNBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO0lBQ3JEQSxDQUFDQTtJQUdERDs7OztPQUlHQTtJQUNIQSxJQUFJQSxLQUFhRSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxFQUFFQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUMvRUYsQ0FBQ0E7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UmVxdWVzdE1ldGhvZHN9IGZyb20gJy4vZW51bXMnO1xuaW1wb3J0IHtSZXF1ZXN0QXJnc30gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7SGVhZGVyc30gZnJvbSAnLi9oZWFkZXJzJztcbmltcG9ydCB7bm9ybWFsaXplTWV0aG9kTmFtZX0gZnJvbSAnLi9odHRwX3V0aWxzJztcbmltcG9ydCB7XG4gIFJlZ0V4cFdyYXBwZXIsXG4gIENPTlNUX0VYUFIsXG4gIGlzUHJlc2VudCxcbiAgaXNKc09iamVjdCxcbiAgU3RyaW5nV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vLyBUT0RPKGplZmZiY3Jvc3MpOiBwcm9wZXJseSBpbXBsZW1lbnQgYm9keSBhY2Nlc3NvcnNcbi8qKlxuICogQ3JlYXRlcyBgUmVxdWVzdGAgaW5zdGFuY2VzIGZyb20gcHJvdmlkZWQgdmFsdWVzLlxuICpcbiAqIFRoZSBSZXF1ZXN0J3MgaW50ZXJmYWNlIGlzIGluc3BpcmVkIGJ5IHRoZSBSZXF1ZXN0IGNvbnN0cnVjdG9yIGRlZmluZWQgaW4gdGhlIFtGZXRjaFxuICogU3BlY10oaHR0cHM6Ly9mZXRjaC5zcGVjLndoYXR3Zy5vcmcvI3JlcXVlc3QtY2xhc3MpLFxuICogYnV0IGlzIGNvbnNpZGVyZWQgYSBzdGF0aWMgdmFsdWUgd2hvc2UgYm9keSBjYW4gYmUgYWNjZXNzZWQgbWFueSB0aW1lcy4gVGhlcmUgYXJlIG90aGVyXG4gKiBkaWZmZXJlbmNlcyBpbiB0aGUgaW1wbGVtZW50YXRpb24sIGJ1dCB0aGlzIGlzIHRoZSBtb3N0IHNpZ25pZmljYW50LlxuICpcbiAqIGBSZXF1ZXN0YCBpbnN0YW5jZXMgYXJlIHR5cGljYWxseSBjcmVhdGVkIGJ5IGhpZ2hlci1sZXZlbCBjbGFzc2VzLCBsaWtlIHtAbGluayBIdHRwfSBhbmRcbiAqIHtAbGluayBKc29ucH0sIGJ1dCBpdCBtYXkgb2NjYXNpb25hbGx5IGJlIHVzZWZ1bCB0byBleHBsaWNpdGx5IGNyZWF0ZSBgUmVxdWVzdGAgaW5zdGFuY2VzLlxuICogT25lIHN1Y2ggZXhhbXBsZSBpcyB3aGVuIGNyZWF0aW5nIHNlcnZpY2VzIHRoYXQgd3JhcCBoaWdoZXItbGV2ZWwgc2VydmljZXMsIGxpa2Uge0BsaW5rIEh0dHB9LFxuICogd2hlcmUgaXQgbWF5IGJlIHVzZWZ1bCB0byBnZW5lcmF0ZSBhIGBSZXF1ZXN0YCB3aXRoIGFyYml0cmFyeSBoZWFkZXJzIGFuZCBzZWFyY2ggcGFyYW1zLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7SW5qZWN0YWJsZSwgSW5qZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL2FuZ3VsYXIyJztcbiAqIGltcG9ydCB7SFRUUF9QUk9WSURFUlMsIEh0dHAsIFJlcXVlc3QsIFJlcXVlc3RNZXRob2RzfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAqXG4gKiBASW5qZWN0YWJsZSgpXG4gKiBjbGFzcyBBdXRvQXV0aGVudGljYXRvciB7XG4gKiAgIGNvbnN0cnVjdG9yKHB1YmxpYyBodHRwOkh0dHApIHt9XG4gKiAgIHJlcXVlc3QodXJsOnN0cmluZykge1xuICogICAgIHJldHVybiB0aGlzLmh0dHAucmVxdWVzdChuZXcgUmVxdWVzdCh7XG4gKiAgICAgICBtZXRob2Q6IFJlcXVlc3RNZXRob2RzLkdldCxcbiAqICAgICAgIHVybDogdXJsLFxuICogICAgICAgc2VhcmNoOiAncGFzc3dvcmQ9MTIzJ1xuICogICAgIH0pKTtcbiAqICAgfVxuICogfVxuICpcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW0hUVFBfUFJPVklERVJTLCBBdXRvQXV0aGVudGljYXRvcl0pO1xuICogdmFyIGF1dGhlbnRpY2F0b3IgPSBpbmplY3Rvci5nZXQoQXV0b0F1dGhlbnRpY2F0b3IpO1xuICogYXV0aGVudGljYXRvci5yZXF1ZXN0KCdwZW9wbGUuanNvbicpLnN1YnNjcmliZShyZXMgPT4ge1xuICogICAvL1VSTCBzaG91bGQgaGF2ZSBpbmNsdWRlZCAnP3Bhc3N3b3JkPTEyMydcbiAqICAgY29uc29sZS5sb2coJ3Blb3BsZScsIHJlcy5qc29uKCkpO1xuICogfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFJlcXVlc3Qge1xuICAvKipcbiAgICogSHR0cCBtZXRob2Qgd2l0aCB3aGljaCB0byBwZXJmb3JtIHRoZSByZXF1ZXN0LlxuICAgKi9cbiAgbWV0aG9kOiBSZXF1ZXN0TWV0aG9kcztcbiAgLyoqXG4gICAqIHtAbGluayBIZWFkZXJzfSBpbnN0YW5jZVxuICAgKi9cbiAgaGVhZGVyczogSGVhZGVycztcbiAgLyoqIFVybCBvZiB0aGUgcmVtb3RlIHJlc291cmNlICovXG4gIHVybDogc3RyaW5nO1xuICAvLyBUT0RPOiBzdXBwb3J0IFVSTFNlYXJjaFBhcmFtcyB8IEZvcm1EYXRhIHwgQmxvYiB8IEFycmF5QnVmZmVyXG4gIHByaXZhdGUgX2JvZHk6IHN0cmluZztcbiAgY29uc3RydWN0b3IocmVxdWVzdE9wdGlvbnM6IFJlcXVlc3RBcmdzKSB7XG4gICAgLy8gVE9ETzogYXNzZXJ0IHRoYXQgdXJsIGlzIHByZXNlbnRcbiAgICBsZXQgdXJsID0gcmVxdWVzdE9wdGlvbnMudXJsO1xuICAgIHRoaXMudXJsID0gcmVxdWVzdE9wdGlvbnMudXJsO1xuICAgIGlmIChpc1ByZXNlbnQocmVxdWVzdE9wdGlvbnMuc2VhcmNoKSkge1xuICAgICAgbGV0IHNlYXJjaCA9IHJlcXVlc3RPcHRpb25zLnNlYXJjaC50b1N0cmluZygpO1xuICAgICAgaWYgKHNlYXJjaC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxldCBwcmVmaXggPSAnPyc7XG4gICAgICAgIGlmIChTdHJpbmdXcmFwcGVyLmNvbnRhaW5zKHRoaXMudXJsLCAnPycpKSB7XG4gICAgICAgICAgcHJlZml4ID0gKHRoaXMudXJsW3RoaXMudXJsLmxlbmd0aCAtIDFdID09ICcmJykgPyAnJyA6ICcmJztcbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPOiBqdXN0IGRlbGV0ZSBzZWFyY2gtcXVlcnktbG9va2luZyBzdHJpbmcgaW4gdXJsP1xuICAgICAgICB0aGlzLnVybCA9IHVybCArIHByZWZpeCArIHNlYXJjaDtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fYm9keSA9IHJlcXVlc3RPcHRpb25zLmJvZHk7XG4gICAgdGhpcy5tZXRob2QgPSBub3JtYWxpemVNZXRob2ROYW1lKHJlcXVlc3RPcHRpb25zLm1ldGhvZCk7XG4gICAgLy8gVE9ETyhqZWZmYmNyb3NzKTogaW1wbGVtZW50IGJlaGF2aW9yXG4gICAgLy8gRGVmYXVsdHMgdG8gJ29taXQnLCBjb25zaXN0ZW50IHdpdGggYnJvd3NlclxuICAgIC8vIFRPRE8oamVmZmJjcm9zcyk6IGltcGxlbWVudCBiZWhhdmlvclxuICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKHJlcXVlc3RPcHRpb25zLmhlYWRlcnMpO1xuICB9XG5cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcmVxdWVzdCdzIGJvZHkgYXMgc3RyaW5nLCBhc3N1bWluZyB0aGF0IGJvZHkgZXhpc3RzLiBJZiBib2R5IGlzIHVuZGVmaW5lZCwgcmV0dXJuXG4gICAqIGVtcHR5XG4gICAqIHN0cmluZy5cbiAgICovXG4gIHRleHQoKTogU3RyaW5nIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9ib2R5KSA/IHRoaXMuX2JvZHkudG9TdHJpbmcoKSA6ICcnOyB9XG59XG4iXX0=