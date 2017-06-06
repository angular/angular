var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isStringMap } from 'angular2/src/facade/lang';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { Injectable, Pipe } from 'angular2/core';
import { InvalidPipeArgumentException } from './invalid_pipe_argument_exception';
/**
 *
 *  Generic selector that displays the string that matches the current value.
 *
 *  ## Usage
 *
 *  expression | i18nSelect:mapping
 *
 *  where `mapping` is an object that indicates the text that should be displayed
 *  for different values of the provided `expression`.
 *
 *  ## Example
 *
 *  ```
 *  <div>
 *    {{ gender | i18nSelect: inviteMap }}
 *  </div>
 *
 *  class MyApp {
 *    gender: string = 'male';
 *    inviteMap: any = {
 *      'male': 'Invite her.',
 *      'female': 'Invite him.',
 *      'other': 'Invite them.'
 *    }
 *    ...
 *  }
 *  ```
 */
let I18nSelectPipe_1;
export let I18nSelectPipe = I18nSelectPipe_1 = class I18nSelectPipe {
    transform(value, mapping) {
        if (!isStringMap(mapping)) {
            throw new InvalidPipeArgumentException(I18nSelectPipe_1, mapping);
        }
        return StringMapWrapper.contains(mapping, value) ? mapping[value] : mapping['other'];
    }
};
I18nSelectPipe = I18nSelectPipe_1 = __decorate([
    Pipe({ name: 'i18nSelect', pure: true }),
    Injectable(), 
    __metadata('design:paramtypes', [])
], I18nSelectPipe);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9zZWxlY3RfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL3NyYy9jb21tb24vcGlwZXMvaTE4bl9zZWxlY3RfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLDBCQUEwQjtPQUM3QyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sZ0NBQWdDO09BQ3hELEVBQUMsVUFBVSxFQUFpQixJQUFJLEVBQUMsTUFBTSxlQUFlO09BQ3RELEVBQUMsNEJBQTRCLEVBQUMsTUFBTSxtQ0FBbUM7QUFFOUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E0Qkc7QUFHSDs7SUFDRSxTQUFTLENBQUMsS0FBYSxFQUFFLE9BQWdDO1FBQ3ZELEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNLElBQUksNEJBQTRCLENBQUMsZ0JBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNsRSxDQUFDO1FBRUQsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN2RixDQUFDO0FBQ0gsQ0FBQztBQVZEO0lBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFDLENBQUM7SUFDdEMsVUFBVSxFQUFFOztrQkFBQTtBQVNaIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1N0cmluZ01hcH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7SW5qZWN0YWJsZSwgUGlwZVRyYW5zZm9ybSwgUGlwZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0ludmFsaWRQaXBlQXJndW1lbnRFeGNlcHRpb259IGZyb20gJy4vaW52YWxpZF9waXBlX2FyZ3VtZW50X2V4Y2VwdGlvbic7XG5cbi8qKlxuICpcbiAqICBHZW5lcmljIHNlbGVjdG9yIHRoYXQgZGlzcGxheXMgdGhlIHN0cmluZyB0aGF0IG1hdGNoZXMgdGhlIGN1cnJlbnQgdmFsdWUuXG4gKlxuICogICMjIFVzYWdlXG4gKlxuICogIGV4cHJlc3Npb24gfCBpMThuU2VsZWN0Om1hcHBpbmdcbiAqXG4gKiAgd2hlcmUgYG1hcHBpbmdgIGlzIGFuIG9iamVjdCB0aGF0IGluZGljYXRlcyB0aGUgdGV4dCB0aGF0IHNob3VsZCBiZSBkaXNwbGF5ZWRcbiAqICBmb3IgZGlmZmVyZW50IHZhbHVlcyBvZiB0aGUgcHJvdmlkZWQgYGV4cHJlc3Npb25gLlxuICpcbiAqICAjIyBFeGFtcGxlXG4gKlxuICogIGBgYFxuICogIDxkaXY+XG4gKiAgICB7eyBnZW5kZXIgfCBpMThuU2VsZWN0OiBpbnZpdGVNYXAgfX1cbiAqICA8L2Rpdj5cbiAqXG4gKiAgY2xhc3MgTXlBcHAge1xuICogICAgZ2VuZGVyOiBzdHJpbmcgPSAnbWFsZSc7XG4gKiAgICBpbnZpdGVNYXA6IGFueSA9IHtcbiAqICAgICAgJ21hbGUnOiAnSW52aXRlIGhlci4nLFxuICogICAgICAnZmVtYWxlJzogJ0ludml0ZSBoaW0uJyxcbiAqICAgICAgJ290aGVyJzogJ0ludml0ZSB0aGVtLidcbiAqICAgIH1cbiAqICAgIC4uLlxuICogIH1cbiAqICBgYGBcbiAqL1xuQFBpcGUoe25hbWU6ICdpMThuU2VsZWN0JywgcHVyZTogdHJ1ZX0pXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSTE4blNlbGVjdFBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtKHZhbHVlOiBzdHJpbmcsIG1hcHBpbmc6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KTogc3RyaW5nIHtcbiAgICBpZiAoIWlzU3RyaW5nTWFwKG1hcHBpbmcpKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFBpcGVBcmd1bWVudEV4Y2VwdGlvbihJMThuU2VsZWN0UGlwZSwgbWFwcGluZyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFN0cmluZ01hcFdyYXBwZXIuY29udGFpbnMobWFwcGluZywgdmFsdWUpID8gbWFwcGluZ1t2YWx1ZV0gOiBtYXBwaW5nWydvdGhlciddO1xuICB9XG59XG4iXX0=