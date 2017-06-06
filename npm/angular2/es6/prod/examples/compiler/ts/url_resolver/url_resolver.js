import { provide } from 'angular2/core';
import { bootstrap } from 'angular2/platform/browser';
import { UrlResolver } from 'angular2/compiler';
var MyApp;
// #docregion url_resolver
class MyUrlResolver extends UrlResolver {
    resolve(baseUrl, url) {
        // Serve CSS files from a special CDN.
        if (url.substr(-4) === '.css') {
            return super.resolve('http://cdn.myapp.com/css/', url);
        }
        return super.resolve(baseUrl, url);
    }
}
bootstrap(MyApp, [provide(UrlResolver, { useClass: MyUrlResolver })]);
// #enddocregion
