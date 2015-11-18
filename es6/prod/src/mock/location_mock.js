import { EventEmitter, ObservableWrapper } from 'angular2/src/facade/async';
export class SpyLocation {
    constructor() {
        this.urlChanges = [];
        /** @internal */
        this._path = '';
        /** @internal */
        this._query = '';
        /** @internal */
        this._subject = new EventEmitter();
        /** @internal */
        this._baseHref = '';
        // TODO: remove these once Location is an interface, and can be implemented cleanly
        this.platformStrategy = null;
    }
    setInitialPath(url) { this._path = url; }
    setBaseHref(url) { this._baseHref = url; }
    path() { return this._path; }
    simulateUrlPop(pathname) { ObservableWrapper.callNext(this._subject, { 'url': pathname }); }
    prepareExternalUrl(url) {
        if (url.length > 0 && !url.startsWith('/')) {
            url = '/' + url;
        }
        return this._baseHref + url;
    }
    go(path, query = '') {
        path = this.prepareExternalUrl(path);
        if (this._path == path && this._query == query) {
            return;
        }
        this._path = path;
        this._query = query;
        var url = path + (query.length > 0 ? ('?' + query) : '');
        this.urlChanges.push(url);
    }
    forward() {
        // TODO
    }
    back() {
        // TODO
    }
    subscribe(onNext, onThrow = null, onReturn = null) {
        return ObservableWrapper.subscribe(this._subject, onNext, onThrow, onReturn);
    }
    normalize(url) { return null; }
}
//# sourceMappingURL=location_mock.js.map