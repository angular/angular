'use strict';var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var template_ast_1 = require('./template_ast');
var interfaces_1 = require('angular2/src/core/linker/interfaces');
function createChangeDetectorDefinitions(componentType, componentStrategy, genConfig, parsedTemplate) {
    var pvVisitors = [];
    var visitor = new ProtoViewVisitor(null, pvVisitors, componentStrategy);
    template_ast_1.templateVisitAll(visitor, parsedTemplate);
    return createChangeDefinitions(pvVisitors, componentType, genConfig);
}
exports.createChangeDetectorDefinitions = createChangeDetectorDefinitions;
var ProtoViewVisitor = (function () {
    function ProtoViewVisitor(parent, allVisitors, strategy) {
        this.parent = parent;
        this.allVisitors = allVisitors;
        this.strategy = strategy;
        this.boundTextCount = 0;
        this.boundElementCount = 0;
        this.variableNames = [];
        this.bindingRecords = [];
        this.eventRecords = [];
        this.directiveRecords = [];
        this.viewIndex = allVisitors.length;
        allVisitors.push(this);
    }
    ProtoViewVisitor.prototype.visitEmbeddedTemplate = function (ast, context) {
        this.boundElementCount++;
        template_ast_1.templateVisitAll(this, ast.outputs);
        for (var i = 0; i < ast.directives.length; i++) {
            ast.directives[i].visit(this, i);
        }
        var childVisitor = new ProtoViewVisitor(this, this.allVisitors, change_detection_1.ChangeDetectionStrategy.Default);
        // Attention: variables present on an embedded template count towards
        // the embedded template and not the template anchor!
        template_ast_1.templateVisitAll(childVisitor, ast.vars);
        template_ast_1.templateVisitAll(childVisitor, ast.children);
        return null;
    };
    ProtoViewVisitor.prototype.visitElement = function (ast, context) {
        if (ast.isBound()) {
            this.boundElementCount++;
        }
        template_ast_1.templateVisitAll(this, ast.inputs, null);
        template_ast_1.templateVisitAll(this, ast.outputs);
        template_ast_1.templateVisitAll(this, ast.exportAsVars);
        for (var i = 0; i < ast.directives.length; i++) {
            ast.directives[i].visit(this, i);
        }
        template_ast_1.templateVisitAll(this, ast.children);
        return null;
    };
    ProtoViewVisitor.prototype.visitNgContent = function (ast, context) { return null; };
    ProtoViewVisitor.prototype.visitVariable = function (ast, context) {
        this.variableNames.push(ast.name);
        return null;
    };
    ProtoViewVisitor.prototype.visitEvent = function (ast, directiveRecord) {
        var bindingRecord = lang_1.isPresent(directiveRecord) ?
            change_detection_1.BindingRecord.createForHostEvent(ast.handler, ast.fullName, directiveRecord) :
            change_detection_1.BindingRecord.createForEvent(ast.handler, ast.fullName, this.boundElementCount - 1);
        this.eventRecords.push(bindingRecord);
        return null;
    };
    ProtoViewVisitor.prototype.visitElementProperty = function (ast, directiveRecord) {
        var boundElementIndex = this.boundElementCount - 1;
        var dirIndex = lang_1.isPresent(directiveRecord) ? directiveRecord.directiveIndex : null;
        var bindingRecord;
        if (ast.type === template_ast_1.PropertyBindingType.Property) {
            bindingRecord =
                lang_1.isPresent(dirIndex) ?
                    change_detection_1.BindingRecord.createForHostProperty(dirIndex, ast.value, ast.name) :
                    change_detection_1.BindingRecord.createForElementProperty(ast.value, boundElementIndex, ast.name);
        }
        else if (ast.type === template_ast_1.PropertyBindingType.Attribute) {
            bindingRecord =
                lang_1.isPresent(dirIndex) ?
                    change_detection_1.BindingRecord.createForHostAttribute(dirIndex, ast.value, ast.name) :
                    change_detection_1.BindingRecord.createForElementAttribute(ast.value, boundElementIndex, ast.name);
        }
        else if (ast.type === template_ast_1.PropertyBindingType.Class) {
            bindingRecord =
                lang_1.isPresent(dirIndex) ?
                    change_detection_1.BindingRecord.createForHostClass(dirIndex, ast.value, ast.name) :
                    change_detection_1.BindingRecord.createForElementClass(ast.value, boundElementIndex, ast.name);
        }
        else if (ast.type === template_ast_1.PropertyBindingType.Style) {
            bindingRecord =
                lang_1.isPresent(dirIndex) ?
                    change_detection_1.BindingRecord.createForHostStyle(dirIndex, ast.value, ast.name, ast.unit) :
                    change_detection_1.BindingRecord.createForElementStyle(ast.value, boundElementIndex, ast.name, ast.unit);
        }
        this.bindingRecords.push(bindingRecord);
        return null;
    };
    ProtoViewVisitor.prototype.visitAttr = function (ast, context) { return null; };
    ProtoViewVisitor.prototype.visitBoundText = function (ast, context) {
        var boundTextIndex = this.boundTextCount++;
        this.bindingRecords.push(change_detection_1.BindingRecord.createForTextNode(ast.value, boundTextIndex));
        return null;
    };
    ProtoViewVisitor.prototype.visitText = function (ast, context) { return null; };
    ProtoViewVisitor.prototype.visitDirective = function (ast, directiveIndexAsNumber) {
        var directiveIndex = new change_detection_1.DirectiveIndex(this.boundElementCount - 1, directiveIndexAsNumber);
        var directiveMetadata = ast.directive;
        var directiveRecord = new change_detection_1.DirectiveRecord({
            directiveIndex: directiveIndex,
            callAfterContentInit: directiveMetadata.lifecycleHooks.indexOf(interfaces_1.LifecycleHooks.AfterContentInit) !== -1,
            callAfterContentChecked: directiveMetadata.lifecycleHooks.indexOf(interfaces_1.LifecycleHooks.AfterContentChecked) !== -1,
            callAfterViewInit: directiveMetadata.lifecycleHooks.indexOf(interfaces_1.LifecycleHooks.AfterViewInit) !== -1,
            callAfterViewChecked: directiveMetadata.lifecycleHooks.indexOf(interfaces_1.LifecycleHooks.AfterViewChecked) !== -1,
            callOnChanges: directiveMetadata.lifecycleHooks.indexOf(interfaces_1.LifecycleHooks.OnChanges) !== -1,
            callDoCheck: directiveMetadata.lifecycleHooks.indexOf(interfaces_1.LifecycleHooks.DoCheck) !== -1,
            callOnInit: directiveMetadata.lifecycleHooks.indexOf(interfaces_1.LifecycleHooks.OnInit) !== -1,
            changeDetection: directiveMetadata.changeDetection
        });
        this.directiveRecords.push(directiveRecord);
        template_ast_1.templateVisitAll(this, ast.inputs, directiveRecord);
        var bindingRecords = this.bindingRecords;
        if (directiveRecord.callOnChanges) {
            bindingRecords.push(change_detection_1.BindingRecord.createDirectiveOnChanges(directiveRecord));
        }
        if (directiveRecord.callOnInit) {
            bindingRecords.push(change_detection_1.BindingRecord.createDirectiveOnInit(directiveRecord));
        }
        if (directiveRecord.callDoCheck) {
            bindingRecords.push(change_detection_1.BindingRecord.createDirectiveDoCheck(directiveRecord));
        }
        template_ast_1.templateVisitAll(this, ast.hostProperties, directiveRecord);
        template_ast_1.templateVisitAll(this, ast.hostEvents, directiveRecord);
        template_ast_1.templateVisitAll(this, ast.exportAsVars);
        return null;
    };
    ProtoViewVisitor.prototype.visitDirectiveProperty = function (ast, directiveRecord) {
        // TODO: these setters should eventually be created by change detection, to make
        // it monomorphic!
        var setter = reflection_1.reflector.setter(ast.directiveName);
        this.bindingRecords.push(change_detection_1.BindingRecord.createForDirective(ast.value, ast.directiveName, setter, directiveRecord));
        return null;
    };
    return ProtoViewVisitor;
})();
function createChangeDefinitions(pvVisitors, componentType, genConfig) {
    var pvVariableNames = _collectNestedProtoViewsVariableNames(pvVisitors);
    return pvVisitors.map(function (pvVisitor) {
        var id = componentType.name + "_" + pvVisitor.viewIndex;
        return new change_detection_1.ChangeDetectorDefinition(id, pvVisitor.strategy, pvVariableNames[pvVisitor.viewIndex], pvVisitor.bindingRecords, pvVisitor.eventRecords, pvVisitor.directiveRecords, genConfig);
    });
}
function _collectNestedProtoViewsVariableNames(pvVisitors) {
    var nestedPvVariableNames = collection_1.ListWrapper.createFixedSize(pvVisitors.length);
    pvVisitors.forEach(function (pv) {
        var parentVariableNames = lang_1.isPresent(pv.parent) ? nestedPvVariableNames[pv.parent.viewIndex] : [];
        nestedPvVariableNames[pv.viewIndex] = parentVariableNames.concat(pv.variableNames);
    });
    return nestedPvVariableNames;
}
//# sourceMappingURL=change_definition_factory.js.map