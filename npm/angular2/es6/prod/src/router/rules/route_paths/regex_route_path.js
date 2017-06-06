import { RegExpWrapper, RegExpMatcherWrapper, isBlank } from 'angular2/src/facade/lang';
import { MatchedUrl } from './route_path';
export class RegexRoutePath {
    constructor(_reString, _serializer) {
        this._reString = _reString;
        this._serializer = _serializer;
        this.terminal = true;
        this.specificity = '2';
        this.hash = this._reString;
        this._regex = RegExpWrapper.create(this._reString);
    }
    matchUrl(url) {
        var urlPath = url.toString();
        var params = {};
        var matcher = RegExpWrapper.matcher(this._regex, urlPath);
        var match = RegExpMatcherWrapper.next(matcher);
        if (isBlank(match)) {
            return null;
        }
        for (let i = 0; i < match.length; i += 1) {
            params[i.toString()] = match[i];
        }
        return new MatchedUrl(urlPath, [], params, [], null);
    }
    generateUrl(params) { return this._serializer(params); }
    toString() { return this._reString; }
}
