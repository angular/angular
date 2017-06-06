var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isString, isBlank } from 'angular2/src/facade/lang';
import { Injectable, Pipe } from 'angular2/core';
import { InvalidPipeArgumentException } from './invalid_pipe_argument_exception';
/**
 * Transforms text to lowercase.
 *
 * ### Example
 *
 * {@example core/pipes/ts/lowerupper_pipe/lowerupper_pipe_example.ts region='LowerUpperPipe'}
 */
let LowerCasePipe_1;
export let LowerCasePipe = LowerCasePipe_1 = class LowerCasePipe {
    transform(value) {
        if (isBlank(value))
            return value;
        if (!isString(value)) {
            throw new InvalidPipeArgumentException(LowerCasePipe_1, value);
        }
        return value.toLowerCase();
    }
};
LowerCasePipe = LowerCasePipe_1 = __decorate([
    Pipe({ name: 'lowercase' }),
    Injectable(), 
    __metadata('design:paramtypes', [])
], LowerCasePipe);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG93ZXJjYXNlX3BpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9zcmMvY29tbW9uL3BpcGVzL2xvd2VyY2FzZV9waXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsUUFBUSxFQUFFLE9BQU8sRUFBQyxNQUFNLDBCQUEwQjtPQUNuRCxFQUFDLFVBQVUsRUFBK0IsSUFBSSxFQUFDLE1BQU0sZUFBZTtPQUNwRSxFQUFDLDRCQUE0QixFQUFDLE1BQU0sbUNBQW1DO0FBRTlFOzs7Ozs7R0FNRztBQUdIOztJQUNFLFNBQVMsQ0FBQyxLQUFhO1FBQ3JCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLE1BQU0sSUFBSSw0QkFBNEIsQ0FBQyxlQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUNELE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDN0IsQ0FBQztBQUNILENBQUM7QUFWRDtJQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUMsQ0FBQztJQUN6QixVQUFVLEVBQUU7O2lCQUFBO0FBU1oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzU3RyaW5nLCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBQaXBlVHJhbnNmb3JtLCBXcmFwcGVkVmFsdWUsIFBpcGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9ufSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9leGNlcHRpb24nO1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGV4dCB0byBsb3dlcmNhc2UuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9waXBlcy90cy9sb3dlcnVwcGVyX3BpcGUvbG93ZXJ1cHBlcl9waXBlX2V4YW1wbGUudHMgcmVnaW9uPSdMb3dlclVwcGVyUGlwZSd9XG4gKi9cbkBQaXBlKHtuYW1lOiAnbG93ZXJjYXNlJ30pXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTG93ZXJDYXNlUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm0odmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKGlzQmxhbmsodmFsdWUpKSByZXR1cm4gdmFsdWU7XG4gICAgaWYgKCFpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9uKExvd2VyQ2FzZVBpcGUsIHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlLnRvTG93ZXJDYXNlKCk7XG4gIH1cbn1cbiJdfQ==