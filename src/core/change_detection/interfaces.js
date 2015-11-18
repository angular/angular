'use strict';var DebugContext = (function () {
    function DebugContext(element, componentElement, directive, context, locals, injector) {
        this.element = element;
        this.componentElement = componentElement;
        this.directive = directive;
        this.context = context;
        this.locals = locals;
        this.injector = injector;
    }
    return DebugContext;
})();
exports.DebugContext = DebugContext;
var ChangeDetectorGenConfig = (function () {
    function ChangeDetectorGenConfig(genDebugInfo, logBindingUpdate, useJit) {
        this.genDebugInfo = genDebugInfo;
        this.logBindingUpdate = logBindingUpdate;
        this.useJit = useJit;
    }
    return ChangeDetectorGenConfig;
})();
exports.ChangeDetectorGenConfig = ChangeDetectorGenConfig;
var ChangeDetectorDefinition = (function () {
    function ChangeDetectorDefinition(id, strategy, variableNames, bindingRecords, eventRecords, directiveRecords, genConfig) {
        this.id = id;
        this.strategy = strategy;
        this.variableNames = variableNames;
        this.bindingRecords = bindingRecords;
        this.eventRecords = eventRecords;
        this.directiveRecords = directiveRecords;
        this.genConfig = genConfig;
    }
    return ChangeDetectorDefinition;
})();
exports.ChangeDetectorDefinition = ChangeDetectorDefinition;
//# sourceMappingURL=interfaces.js.map