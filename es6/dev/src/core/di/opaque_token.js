var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { CONST } from 'angular2/src/facade/lang';
/**
 * Creates a token that can be used in a DI Provider.
 *
 * ### Example ([live demo](http://plnkr.co/edit/Ys9ezXpj2Mnoy3Uc8KBp?p=preview))
 *
 * ```typescript
 * var t = new OpaqueToken("value");
 *
 * var injector = Injector.resolveAndCreate([
 *   provide(t, {useValue: "providedValue"})
 * ]);
 *
 * expect(injector.get(t)).toEqual("bindingValue");
 * ```
 *
 * Using an `OpaqueToken` is preferable to using strings as tokens because of possible collisions
 * caused by multiple providers using the same string as two different tokens.
 *
 * Using an `OpaqueToken` is preferable to using an `Object` as tokens because it provides better
 * error messages.
 */
export let OpaqueToken = class {
    constructor(_desc) {
        this._desc = _desc;
    }
    toString() { return `Token ${this._desc}`; }
};
OpaqueToken = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [String])
], OpaqueToken);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BhcXVlX3Rva2VuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvZGkvb3BhcXVlX3Rva2VuLnRzIl0sIm5hbWVzIjpbIk9wYXF1ZVRva2VuIiwiT3BhcXVlVG9rZW4uY29uc3RydWN0b3IiLCJPcGFxdWVUb2tlbi50b1N0cmluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxLQUFLLEVBQUMsTUFBTSwwQkFBMEI7QUFFOUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0JHO0FBQ0g7SUFFRUEsWUFBb0JBLEtBQWFBO1FBQWJDLFVBQUtBLEdBQUxBLEtBQUtBLENBQVFBO0lBQUdBLENBQUNBO0lBRXJDRCxRQUFRQSxLQUFhRSxNQUFNQSxDQUFDQSxTQUFTQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUN0REYsQ0FBQ0E7QUFMRDtJQUFDLEtBQUssRUFBRTs7Z0JBS1A7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q09OU1R9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHRva2VuIHRoYXQgY2FuIGJlIHVzZWQgaW4gYSBESSBQcm92aWRlci5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvWXM5ZXpYcGoyTW5veTNVYzhLQnA/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiB2YXIgdCA9IG5ldyBPcGFxdWVUb2tlbihcInZhbHVlXCIpO1xuICpcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICogICBwcm92aWRlKHQsIHt1c2VWYWx1ZTogXCJwcm92aWRlZFZhbHVlXCJ9KVxuICogXSk7XG4gKlxuICogZXhwZWN0KGluamVjdG9yLmdldCh0KSkudG9FcXVhbChcImJpbmRpbmdWYWx1ZVwiKTtcbiAqIGBgYFxuICpcbiAqIFVzaW5nIGFuIGBPcGFxdWVUb2tlbmAgaXMgcHJlZmVyYWJsZSB0byB1c2luZyBzdHJpbmdzIGFzIHRva2VucyBiZWNhdXNlIG9mIHBvc3NpYmxlIGNvbGxpc2lvbnNcbiAqIGNhdXNlZCBieSBtdWx0aXBsZSBwcm92aWRlcnMgdXNpbmcgdGhlIHNhbWUgc3RyaW5nIGFzIHR3byBkaWZmZXJlbnQgdG9rZW5zLlxuICpcbiAqIFVzaW5nIGFuIGBPcGFxdWVUb2tlbmAgaXMgcHJlZmVyYWJsZSB0byB1c2luZyBhbiBgT2JqZWN0YCBhcyB0b2tlbnMgYmVjYXVzZSBpdCBwcm92aWRlcyBiZXR0ZXJcbiAqIGVycm9yIG1lc3NhZ2VzLlxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIE9wYXF1ZVRva2VuIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZGVzYzogc3RyaW5nKSB7fVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiBgVG9rZW4gJHt0aGlzLl9kZXNjfWA7IH1cbn1cbiJdfQ==