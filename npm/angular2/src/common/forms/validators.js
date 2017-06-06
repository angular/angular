'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var promise_1 = require('angular2/src/facade/promise');
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var core_1 = require('angular2/core');
/**
 * Providers for validators to be used for {@link Control}s in a form.
 *
 * Provide this using `multi: true` to add validators.
 *
 * ### Example
 *
 * {@example core/forms/ts/ng_validators/ng_validators.ts region='ng_validators'}
 */
exports.NG_VALIDATORS = new core_1.OpaqueToken("NgValidators");
/**
 * Providers for asynchronous validators to be used for {@link Control}s
 * in a form.
 *
 * Provide this using `multi: true` to add validators.
 *
 * See {@link NG_VALIDATORS} for more details.
 */
exports.NG_ASYNC_VALIDATORS = 
/*@ts2dart_const*/ new core_1.OpaqueToken("NgAsyncValidators");
/**
 * Provides a set of validators used by form controls.
 *
 * A validator is a function that processes a {@link Control} or collection of
 * controls and returns a map of errors. A null map means that validation has passed.
 *
 * ### Example
 *
 * ```typescript
 * var loginControl = new Control("", Validators.required)
 * ```
 */
var Validators = (function () {
    function Validators() {
    }
    /**
     * Validator that requires controls to have a non-empty value.
     */
    Validators.required = function (control) {
        return lang_1.isBlank(control.value) || (lang_1.isString(control.value) && control.value == "") ?
            { "required": true } :
            null;
    };
    /**
     * Validator that requires controls to have a value of a minimum length.
     */
    Validators.minLength = function (minLength) {
        return function (control) {
            if (lang_1.isPresent(Validators.required(control)))
                return null;
            var v = control.value;
            return v.length < minLength ?
                { "minlength": { "requiredLength": minLength, "actualLength": v.length } } :
                null;
        };
    };
    /**
     * Validator that requires controls to have a value of a maximum length.
     */
    Validators.maxLength = function (maxLength) {
        return function (control) {
            if (lang_1.isPresent(Validators.required(control)))
                return null;
            var v = control.value;
            return v.length > maxLength ?
                { "maxlength": { "requiredLength": maxLength, "actualLength": v.length } } :
                null;
        };
    };
    /**
     * Validator that requires a control to match a regex to its value.
     */
    Validators.pattern = function (pattern) {
        return function (control) {
            if (lang_1.isPresent(Validators.required(control)))
                return null;
            var regex = new RegExp("^" + pattern + "$");
            var v = control.value;
            return regex.test(v) ? null :
                { "pattern": { "requiredPattern": "^" + pattern + "$", "actualValue": v } };
        };
    };
    /**
     * No-op validator.
     */
    Validators.nullValidator = function (c) { return null; };
    /**
     * Compose multiple validators into a single function that returns the union
     * of the individual error maps.
     */
    Validators.compose = function (validators) {
        if (lang_1.isBlank(validators))
            return null;
        var presentValidators = validators.filter(lang_1.isPresent);
        if (presentValidators.length == 0)
            return null;
        return function (control) {
            return _mergeErrors(_executeValidators(control, presentValidators));
        };
    };
    Validators.composeAsync = function (validators) {
        if (lang_1.isBlank(validators))
            return null;
        var presentValidators = validators.filter(lang_1.isPresent);
        if (presentValidators.length == 0)
            return null;
        return function (control) {
            var promises = _executeAsyncValidators(control, presentValidators).map(_convertToPromise);
            return promise_1.PromiseWrapper.all(promises).then(_mergeErrors);
        };
    };
    return Validators;
}());
exports.Validators = Validators;
function _convertToPromise(obj) {
    return promise_1.PromiseWrapper.isPromise(obj) ? obj : async_1.ObservableWrapper.toPromise(obj);
}
function _executeValidators(control, validators) {
    return validators.map(function (v) { return v(control); });
}
function _executeAsyncValidators(control, validators) {
    return validators.map(function (v) { return v(control); });
}
function _mergeErrors(arrayOfErrors) {
    var res = arrayOfErrors.reduce(function (res, errors) {
        return lang_1.isPresent(errors) ? collection_1.StringMapWrapper.merge(res, errors) : res;
    }, {});
    return collection_1.StringMapWrapper.isEmpty(res) ? null : res;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvdmFsaWRhdG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEscUJBQTJDLDBCQUEwQixDQUFDLENBQUE7QUFDdEUsd0JBQTZCLDZCQUE2QixDQUFDLENBQUE7QUFDM0Qsc0JBQWdDLDJCQUEyQixDQUFDLENBQUE7QUFDNUQsMkJBQTRDLGdDQUFnQyxDQUFDLENBQUE7QUFDN0UscUJBQTBCLGVBQWUsQ0FBQyxDQUFBO0FBSzFDOzs7Ozs7OztHQVFHO0FBQ1UscUJBQWEsR0FBbUMsSUFBSSxrQkFBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBRTdGOzs7Ozs7O0dBT0c7QUFDVSwyQkFBbUI7QUFDNUIsa0JBQWtCLENBQUMsSUFBSSxrQkFBVyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFFNUQ7Ozs7Ozs7Ozs7O0dBV0c7QUFDSDtJQUFBO0lBOEVBLENBQUM7SUE3RUM7O09BRUc7SUFDSSxtQkFBUSxHQUFmLFVBQWdCLE9BQW9DO1FBQ2xELE1BQU0sQ0FBQyxjQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxPQUFPLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUN0RSxFQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUM7WUFDbEIsSUFBSSxDQUFDO0lBQ2xCLENBQUM7SUFFRDs7T0FFRztJQUNJLG9CQUFTLEdBQWhCLFVBQWlCLFNBQWlCO1FBQ2hDLE1BQU0sQ0FBQyxVQUFDLE9BQW9DO1lBQzFDLEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFD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bmssIGlzUHJlc2VudCwgaXNTdHJpbmd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1Byb21pc2VXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL3Byb21pc2UnO1xuaW1wb3J0IHtPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtPcGFxdWVUb2tlbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbmltcG9ydCAqIGFzIG1vZGVsTW9kdWxlIGZyb20gJy4vbW9kZWwnO1xuaW1wb3J0IHtWYWxpZGF0b3JGbiwgQXN5bmNWYWxpZGF0b3JGbn0gZnJvbSAnLi9kaXJlY3RpdmVzL3ZhbGlkYXRvcnMnO1xuXG4vKipcbiAqIFByb3ZpZGVycyBmb3IgdmFsaWRhdG9ycyB0byBiZSB1c2VkIGZvciB7QGxpbmsgQ29udHJvbH1zIGluIGEgZm9ybS5cbiAqXG4gKiBQcm92aWRlIHRoaXMgdXNpbmcgYG11bHRpOiB0cnVlYCB0byBhZGQgdmFsaWRhdG9ycy5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL2Zvcm1zL3RzL25nX3ZhbGlkYXRvcnMvbmdfdmFsaWRhdG9ycy50cyByZWdpb249J25nX3ZhbGlkYXRvcnMnfVxuICovXG5leHBvcnQgY29uc3QgTkdfVkFMSURBVE9SUzogT3BhcXVlVG9rZW4gPSAvKkB0czJkYXJ0X2NvbnN0Ki8gbmV3IE9wYXF1ZVRva2VuKFwiTmdWYWxpZGF0b3JzXCIpO1xuXG4vKipcbiAqIFByb3ZpZGVycyBmb3IgYXN5bmNocm9ub3VzIHZhbGlkYXRvcnMgdG8gYmUgdXNlZCBmb3Ige0BsaW5rIENvbnRyb2x9c1xuICogaW4gYSBmb3JtLlxuICpcbiAqIFByb3ZpZGUgdGhpcyB1c2luZyBgbXVsdGk6IHRydWVgIHRvIGFkZCB2YWxpZGF0b3JzLlxuICpcbiAqIFNlZSB7QGxpbmsgTkdfVkFMSURBVE9SU30gZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuZXhwb3J0IGNvbnN0IE5HX0FTWU5DX1ZBTElEQVRPUlM6IE9wYXF1ZVRva2VuID1cbiAgICAvKkB0czJkYXJ0X2NvbnN0Ki8gbmV3IE9wYXF1ZVRva2VuKFwiTmdBc3luY1ZhbGlkYXRvcnNcIik7XG5cbi8qKlxuICogUHJvdmlkZXMgYSBzZXQgb2YgdmFsaWRhdG9ycyB1c2VkIGJ5IGZvcm0gY29udHJvbHMuXG4gKlxuICogQSB2YWxpZGF0b3IgaXMgYSBmdW5jdGlvbiB0aGF0IHByb2Nlc3NlcyBhIHtAbGluayBDb250cm9sfSBvciBjb2xsZWN0aW9uIG9mXG4gKiBjb250cm9scyBhbmQgcmV0dXJucyBhIG1hcCBvZiBlcnJvcnMuIEEgbnVsbCBtYXAgbWVhbnMgdGhhdCB2YWxpZGF0aW9uIGhhcyBwYXNzZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiB2YXIgbG9naW5Db250cm9sID0gbmV3IENvbnRyb2woXCJcIiwgVmFsaWRhdG9ycy5yZXF1aXJlZClcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgVmFsaWRhdG9ycyB7XG4gIC8qKlxuICAgKiBWYWxpZGF0b3IgdGhhdCByZXF1aXJlcyBjb250cm9scyB0byBoYXZlIGEgbm9uLWVtcHR5IHZhbHVlLlxuICAgKi9cbiAgc3RhdGljIHJlcXVpcmVkKGNvbnRyb2w6IG1vZGVsTW9kdWxlLkFic3RyYWN0Q29udHJvbCk6IHtba2V5OiBzdHJpbmddOiBib29sZWFufSB7XG4gICAgcmV0dXJuIGlzQmxhbmsoY29udHJvbC52YWx1ZSkgfHwgKGlzU3RyaW5nKGNvbnRyb2wudmFsdWUpICYmIGNvbnRyb2wudmFsdWUgPT0gXCJcIikgP1xuICAgICAgICAgICAgICAge1wicmVxdWlyZWRcIjogdHJ1ZX0gOlxuICAgICAgICAgICAgICAgbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0b3IgdGhhdCByZXF1aXJlcyBjb250cm9scyB0byBoYXZlIGEgdmFsdWUgb2YgYSBtaW5pbXVtIGxlbmd0aC5cbiAgICovXG4gIHN0YXRpYyBtaW5MZW5ndGgobWluTGVuZ3RoOiBudW1iZXIpOiBWYWxpZGF0b3JGbiB7XG4gICAgcmV0dXJuIChjb250cm9sOiBtb2RlbE1vZHVsZS5BYnN0cmFjdENvbnRyb2wpOiB7W2tleTogc3RyaW5nXTogYW55fSA9PiB7XG4gICAgICBpZiAoaXNQcmVzZW50KFZhbGlkYXRvcnMucmVxdWlyZWQoY29udHJvbCkpKSByZXR1cm4gbnVsbDtcbiAgICAgIHZhciB2OiBzdHJpbmcgPSBjb250cm9sLnZhbHVlO1xuICAgICAgcmV0dXJuIHYubGVuZ3RoIDwgbWluTGVuZ3RoID9cbiAgICAgICAgICAgICAgICAge1wibWlubGVuZ3RoXCI6IHtcInJlcXVpcmVkTGVuZ3RoXCI6IG1pbkxlbmd0aCwgXCJhY3R1YWxMZW5ndGhcIjogdi5sZW5ndGh9fSA6XG4gICAgICAgICAgICAgICAgIG51bGw7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0b3IgdGhhdCByZXF1aXJlcyBjb250cm9scyB0byBoYXZlIGEgdmFsdWUgb2YgYSBtYXhpbXVtIGxlbmd0aC5cbiAgICovXG4gIHN0YXRpYyBtYXhMZW5ndGgobWF4TGVuZ3RoOiBudW1iZXIpOiBWYWxpZGF0b3JGbiB7XG4gICAgcmV0dXJuIChjb250cm9sOiBtb2RlbE1vZHVsZS5BYnN0cmFjdENvbnRyb2wpOiB7W2tleTogc3RyaW5nXTogYW55fSA9PiB7XG4gICAgICBpZiAoaXNQcmVzZW50KFZhbGlkYXRvcnMucmVxdWlyZWQoY29udHJvbCkpKSByZXR1cm4gbnVsbDtcbiAgICAgIHZhciB2OiBzdHJpbmcgPSBjb250cm9sLnZhbHVlO1xuICAgICAgcmV0dXJuIHYubGVuZ3RoID4gbWF4TGVuZ3RoID9cbiAgICAgICAgICAgICAgICAge1wibWF4bGVuZ3RoXCI6IHtcInJlcXVpcmVkTGVuZ3RoXCI6IG1heExlbmd0aCwgXCJhY3R1YWxMZW5ndGhcIjogdi5sZW5ndGh9fSA6XG4gICAgICAgICAgICAgICAgIG51bGw7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0b3IgdGhhdCByZXF1aXJlcyBhIGNvbnRyb2wgdG8gbWF0Y2ggYSByZWdleCB0byBpdHMgdmFsdWUuXG4gICAqL1xuICBzdGF0aWMgcGF0dGVybihwYXR0ZXJuOiBzdHJpbmcpOiBWYWxpZGF0b3JGbiB7XG4gICAgcmV0dXJuIChjb250cm9sOiBtb2RlbE1vZHVsZS5BYnN0cmFjdENvbnRyb2wpOiB7W2tleTogc3RyaW5nXTogYW55fSA9PiB7XG4gICAgICBpZiAoaXNQcmVzZW50KFZhbGlkYXRvcnMucmVxdWlyZWQoY29udHJvbCkpKSByZXR1cm4gbnVsbDtcbiAgICAgIGxldCByZWdleCA9IG5ldyBSZWdFeHAoYF4ke3BhdHRlcm59JGApO1xuICAgICAgbGV0IHY6IHN0cmluZyA9IGNvbnRyb2wudmFsdWU7XG4gICAgICByZXR1cm4gcmVnZXgudGVzdCh2KSA/IG51bGwgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XCJwYXR0ZXJuXCI6IHtcInJlcXVpcmVkUGF0dGVyblwiOiBgXiR7cGF0dGVybn0kYCwgXCJhY3R1YWxWYWx1ZVwiOiB2fX07XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOby1vcCB2YWxpZGF0b3IuXG4gICAqL1xuICBzdGF0aWMgbnVsbFZhbGlkYXRvcihjOiBtb2RlbE1vZHVsZS5BYnN0cmFjdENvbnRyb2wpOiB7W2tleTogc3RyaW5nXTogYm9vbGVhbn0geyByZXR1cm4gbnVsbDsgfVxuXG4gIC8qKlxuICAgKiBDb21wb3NlIG11bHRpcGxlIHZhbGlkYXRvcnMgaW50byBhIHNpbmdsZSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHVuaW9uXG4gICAqIG9mIHRoZSBpbmRpdmlkdWFsIGVycm9yIG1hcHMuXG4gICAqL1xuICBzdGF0aWMgY29tcG9zZSh2YWxpZGF0b3JzOiBWYWxpZGF0b3JGbltdKTogVmFsaWRhdG9yRm4ge1xuICAgIGlmIChpc0JsYW5rKHZhbGlkYXRvcnMpKSByZXR1cm4gbnVsbDtcbiAgICB2YXIgcHJlc2VudFZhbGlkYXRvcnMgPSB2YWxpZGF0b3JzLmZpbHRlcihpc1ByZXNlbnQpO1xuICAgIGlmIChwcmVzZW50VmFsaWRhdG9ycy5sZW5ndGggPT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oY29udHJvbDogbW9kZWxNb2R1bGUuQWJzdHJhY3RDb250cm9sKSB7XG4gICAgICByZXR1cm4gX21lcmdlRXJyb3JzKF9leGVjdXRlVmFsaWRhdG9ycyhjb250cm9sLCBwcmVzZW50VmFsaWRhdG9ycykpO1xuICAgIH07XG4gIH1cblxuICBzdGF0aWMgY29tcG9zZUFzeW5jKHZhbGlkYXRvcnM6IEFzeW5jVmFsaWRhdG9yRm5bXSk6IEFzeW5jVmFsaWRhdG9yRm4ge1xuICAgIGlmIChpc0JsYW5rKHZhbGlkYXRvcnMpKSByZXR1cm4gbnVsbDtcbiAgICB2YXIgcHJlc2VudFZhbGlkYXRvcnMgPSB2YWxpZGF0b3JzLmZpbHRlcihpc1ByZXNlbnQpO1xuICAgIGlmIChwcmVzZW50VmFsaWRhdG9ycy5sZW5ndGggPT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oY29udHJvbDogbW9kZWxNb2R1bGUuQWJzdHJhY3RDb250cm9sKSB7XG4gICAgICBsZXQgcHJvbWlzZXMgPSBfZXhlY3V0ZUFzeW5jVmFsaWRhdG9ycyhjb250cm9sLCBwcmVzZW50VmFsaWRhdG9ycykubWFwKF9jb252ZXJ0VG9Qcm9taXNlKTtcbiAgICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5hbGwocHJvbWlzZXMpLnRoZW4oX21lcmdlRXJyb3JzKTtcbiAgICB9O1xuICB9XG59XG5cbmZ1bmN0aW9uIF9jb252ZXJ0VG9Qcm9taXNlKG9iajogYW55KTogYW55IHtcbiAgcmV0dXJuIFByb21pc2VXcmFwcGVyLmlzUHJvbWlzZShvYmopID8gb2JqIDogT2JzZXJ2YWJsZVdyYXBwZXIudG9Qcm9taXNlKG9iaik7XG59XG5cbmZ1bmN0aW9uIF9leGVjdXRlVmFsaWRhdG9ycyhjb250cm9sOiBtb2RlbE1vZHVsZS5BYnN0cmFjdENvbnRyb2wsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdG9yczogVmFsaWRhdG9yRm5bXSk6IGFueVtdIHtcbiAgcmV0dXJuIHZhbGlkYXRvcnMubWFwKHYgPT4gdihjb250cm9sKSk7XG59XG5cbmZ1bmN0aW9uIF9leGVjdXRlQXN5bmNWYWxpZGF0b3JzKGNvbnRyb2w6IG1vZGVsTW9kdWxlLkFic3RyYWN0Q29udHJvbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRvcnM6IEFzeW5jVmFsaWRhdG9yRm5bXSk6IGFueVtdIHtcbiAgcmV0dXJuIHZhbGlkYXRvcnMubWFwKHYgPT4gdihjb250cm9sKSk7XG59XG5cbmZ1bmN0aW9uIF9tZXJnZUVycm9ycyhhcnJheU9mRXJyb3JzOiBhbnlbXSk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgdmFyIHJlczoge1trZXk6IHN0cmluZ106IGFueX0gPVxuICAgICAgYXJyYXlPZkVycm9ycy5yZWR1Y2UoKHJlczoge1trZXk6IHN0cmluZ106IGFueX0sIGVycm9yczoge1trZXk6IHN0cmluZ106IGFueX0pID0+IHtcbiAgICAgICAgcmV0dXJuIGlzUHJlc2VudChlcnJvcnMpID8gU3RyaW5nTWFwV3JhcHBlci5tZXJnZShyZXMsIGVycm9ycykgOiByZXM7XG4gICAgICB9LCB7fSk7XG4gIHJldHVybiBTdHJpbmdNYXBXcmFwcGVyLmlzRW1wdHkocmVzKSA/IG51bGwgOiByZXM7XG59XG4iXX0=