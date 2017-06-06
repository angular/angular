'use strict';"use strict";
var compiler_1 = require('angular2/compiler');
var router_link_transform_1 = require('angular2/src/router/directives/router_link_transform');
var router_link_transform_2 = require('angular2/src/router/directives/router_link_transform');
exports.RouterLinkTransform = router_link_transform_2.RouterLinkTransform;
/**
 * Enables the router link DSL.
 *
 * Warning. This feature is experimental and can change.
 *
 * To enable the transformer pass the router link DSL provider to `bootstrap`.
 *
 * ## Example:
 * ```
 * import {bootstrap} from 'angular2/platform/browser';
 * import {ROUTER_LINK_DSL_PROVIDER} from 'angular2/router/router_link_dsl';
 *
 * bootstrap(CustomApp, [ROUTER_LINK_DSL_PROVIDER]);
 * ```
 *
 * The DSL allows you to express router links as follows:
 * ```
 * <a [routerLink]="route:User"> <!-- Same as <a [routerLink]="['User']"> -->
 * <a [routerLink]="route:/User"> <!-- Same as <a [routerLink]="['User']"> -->
 * <a [routerLink]="route:./User"> <!-- Same as <a [routerLink]="['./User']"> -->
 * <a [routerLink]="./User(id: value, name: 'Bob')"> <!-- Same as <a [routerLink]="['./User', {id:
 * value, name: 'Bob'}]"> -->
 * <a [routerLink]="/User/Modal"> <!-- Same as <a [routerLink]="['/User', 'Modal']"> -->
 * <a [routerLink]="User[Modal]"> <!-- Same as <a [routerLink]="['User', ['Modal']]"> -->
 * ```
 */
exports.ROUTER_LINK_DSL_PROVIDER = 
/*@ts2dart_const*/ /* @ts2dart_Provider */ {
    provide: compiler_1.TEMPLATE_TRANSFORMS,
    useClass: router_link_transform_1.RouterLinkTransform,
    multi: true
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmtfZHNsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvcm91dGVyL3JvdXRlcl9saW5rX2RzbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEseUJBQWtDLG1CQUFtQixDQUFDLENBQUE7QUFDdEQsc0NBQWtDLHNEQUFzRCxDQUFDLENBQUE7QUFFekYsc0NBQWtDLHNEQUFzRCxDQUFDO0FBQWpGLDBFQUFpRjtBQUV6Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXlCRztBQUNVLGdDQUF3QjtBQUNqQyxrQkFBa0IsQ0FBQyx1QkFBdUIsQ0FBQztJQUN6QyxPQUFPLEVBQUUsOEJBQW1CO0lBQzVCLFFBQVEsRUFBRSwyQ0FBbUI7SUFDN0IsS0FBSyxFQUFFLElBQUk7Q0FDWixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtURU1QTEFURV9UUkFOU0ZPUk1TfSBmcm9tICdhbmd1bGFyMi9jb21waWxlcic7XG5pbXBvcnQge1JvdXRlckxpbmtUcmFuc2Zvcm19IGZyb20gJ2FuZ3VsYXIyL3NyYy9yb3V0ZXIvZGlyZWN0aXZlcy9yb3V0ZXJfbGlua190cmFuc2Zvcm0nO1xuXG5leHBvcnQge1JvdXRlckxpbmtUcmFuc2Zvcm19IGZyb20gJ2FuZ3VsYXIyL3NyYy9yb3V0ZXIvZGlyZWN0aXZlcy9yb3V0ZXJfbGlua190cmFuc2Zvcm0nO1xuXG4vKipcbiAqIEVuYWJsZXMgdGhlIHJvdXRlciBsaW5rIERTTC5cbiAqXG4gKiBXYXJuaW5nLiBUaGlzIGZlYXR1cmUgaXMgZXhwZXJpbWVudGFsIGFuZCBjYW4gY2hhbmdlLlxuICpcbiAqIFRvIGVuYWJsZSB0aGUgdHJhbnNmb3JtZXIgcGFzcyB0aGUgcm91dGVyIGxpbmsgRFNMIHByb3ZpZGVyIHRvIGBib290c3RyYXBgLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKiBgYGBcbiAqIGltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9icm93c2VyJztcbiAqIGltcG9ydCB7Uk9VVEVSX0xJTktfRFNMX1BST1ZJREVSfSBmcm9tICdhbmd1bGFyMi9yb3V0ZXIvcm91dGVyX2xpbmtfZHNsJztcbiAqXG4gKiBib290c3RyYXAoQ3VzdG9tQXBwLCBbUk9VVEVSX0xJTktfRFNMX1BST1ZJREVSXSk7XG4gKiBgYGBcbiAqXG4gKiBUaGUgRFNMIGFsbG93cyB5b3UgdG8gZXhwcmVzcyByb3V0ZXIgbGlua3MgYXMgZm9sbG93czpcbiAqIGBgYFxuICogPGEgW3JvdXRlckxpbmtdPVwicm91dGU6VXNlclwiPiA8IS0tIFNhbWUgYXMgPGEgW3JvdXRlckxpbmtdPVwiWydVc2VyJ11cIj4gLS0+XG4gKiA8YSBbcm91dGVyTGlua109XCJyb3V0ZTovVXNlclwiPiA8IS0tIFNhbWUgYXMgPGEgW3JvdXRlckxpbmtdPVwiWydVc2VyJ11cIj4gLS0+XG4gKiA8YSBbcm91dGVyTGlua109XCJyb3V0ZTouL1VzZXJcIj4gPCEtLSBTYW1lIGFzIDxhIFtyb3V0ZXJMaW5rXT1cIlsnLi9Vc2VyJ11cIj4gLS0+XG4gKiA8YSBbcm91dGVyTGlua109XCIuL1VzZXIoaWQ6IHZhbHVlLCBuYW1lOiAnQm9iJylcIj4gPCEtLSBTYW1lIGFzIDxhIFtyb3V0ZXJMaW5rXT1cIlsnLi9Vc2VyJywge2lkOlxuICogdmFsdWUsIG5hbWU6ICdCb2InfV1cIj4gLS0+XG4gKiA8YSBbcm91dGVyTGlua109XCIvVXNlci9Nb2RhbFwiPiA8IS0tIFNhbWUgYXMgPGEgW3JvdXRlckxpbmtdPVwiWycvVXNlcicsICdNb2RhbCddXCI+IC0tPlxuICogPGEgW3JvdXRlckxpbmtdPVwiVXNlcltNb2RhbF1cIj4gPCEtLSBTYW1lIGFzIDxhIFtyb3V0ZXJMaW5rXT1cIlsnVXNlcicsIFsnTW9kYWwnXV1cIj4gLS0+XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IFJPVVRFUl9MSU5LX0RTTF9QUk9WSURFUiA9XG4gICAgLypAdHMyZGFydF9jb25zdCovIC8qIEB0czJkYXJ0X1Byb3ZpZGVyICovIHtcbiAgICAgIHByb3ZpZGU6IFRFTVBMQVRFX1RSQU5TRk9STVMsXG4gICAgICB1c2VDbGFzczogUm91dGVyTGlua1RyYW5zZm9ybSxcbiAgICAgIG11bHRpOiB0cnVlXG4gICAgfTtcbiJdfQ==