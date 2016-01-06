import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { isPresent } from 'angular2/src/facade/lang';
import { reflector } from 'angular2/src/core/reflection/reflection';
import { DirectiveIndex, BindingRecord, DirectiveRecord, ChangeDetectionStrategy, ChangeDetectorDefinition } from 'angular2/src/core/change_detection/change_detection';
import { PropertyBindingType, templateVisitAll } from './template_ast';
import { LifecycleHooks } from 'angular2/src/core/linker/interfaces';
export function createChangeDetectorDefinitions(componentType, componentStrategy, genConfig, parsedTemplate) {
    var pvVisitors = [];
    var visitor = new ProtoViewVisitor(null, pvVisitors, componentStrategy);
    templateVisitAll(visitor, parsedTemplate);
    return createChangeDefinitions(pvVisitors, componentType, genConfig);
}
class ProtoViewVisitor {
    constructor(parent, allVisitors, strategy) {
        this.parent = parent;
        this.allVisitors = allVisitors;
        this.strategy = strategy;
        this.nodeCount = 0;
        this.boundElementCount = 0;
        this.variableNames = [];
        this.bindingRecords = [];
        this.eventRecords = [];
        this.directiveRecords = [];
        this.viewIndex = allVisitors.length;
        allVisitors.push(this);
    }
    visitEmbeddedTemplate(ast, context) {
        this.nodeCount++;
        this.boundElementCount++;
        templateVisitAll(this, ast.outputs);
        for (var i = 0; i < ast.directives.length; i++) {
            ast.directives[i].visit(this, i);
        }
        var childVisitor = new ProtoViewVisitor(this, this.allVisitors, ChangeDetectionStrategy.Default);
        // Attention: variables present on an embedded template count towards
        // the embedded template and not the template anchor!
        templateVisitAll(childVisitor, ast.vars);
        templateVisitAll(childVisitor, ast.children);
        return null;
    }
    visitElement(ast, context) {
        this.nodeCount++;
        if (ast.isBound()) {
            this.boundElementCount++;
        }
        templateVisitAll(this, ast.inputs, null);
        templateVisitAll(this, ast.outputs);
        templateVisitAll(this, ast.exportAsVars);
        for (var i = 0; i < ast.directives.length; i++) {
            ast.directives[i].visit(this, i);
        }
        templateVisitAll(this, ast.children);
        return null;
    }
    visitNgContent(ast, context) { return null; }
    visitVariable(ast, context) {
        this.variableNames.push(ast.name);
        return null;
    }
    visitEvent(ast, directiveRecord) {
        var bindingRecord = isPresent(directiveRecord) ?
            BindingRecord.createForHostEvent(ast.handler, ast.fullName, directiveRecord) :
            BindingRecord.createForEvent(ast.handler, ast.fullName, this.boundElementCount - 1);
        this.eventRecords.push(bindingRecord);
        return null;
    }
    visitElementProperty(ast, directiveRecord) {
        var boundElementIndex = this.boundElementCount - 1;
        var dirIndex = isPresent(directiveRecord) ? directiveRecord.directiveIndex : null;
        var bindingRecord;
        if (ast.type === PropertyBindingType.Property) {
            bindingRecord =
                isPresent(dirIndex) ?
                    BindingRecord.createForHostProperty(dirIndex, ast.value, ast.name) :
                    BindingRecord.createForElementProperty(ast.value, boundElementIndex, ast.name);
        }
        else if (ast.type === PropertyBindingType.Attribute) {
            bindingRecord =
                isPresent(dirIndex) ?
                    BindingRecord.createForHostAttribute(dirIndex, ast.value, ast.name) :
                    BindingRecord.createForElementAttribute(ast.value, boundElementIndex, ast.name);
        }
        else if (ast.type === PropertyBindingType.Class) {
            bindingRecord =
                isPresent(dirIndex) ?
                    BindingRecord.createForHostClass(dirIndex, ast.value, ast.name) :
                    BindingRecord.createForElementClass(ast.value, boundElementIndex, ast.name);
        }
        else if (ast.type === PropertyBindingType.Style) {
            bindingRecord =
                isPresent(dirIndex) ?
                    BindingRecord.createForHostStyle(dirIndex, ast.value, ast.name, ast.unit) :
                    BindingRecord.createForElementStyle(ast.value, boundElementIndex, ast.name, ast.unit);
        }
        this.bindingRecords.push(bindingRecord);
        return null;
    }
    visitAttr(ast, context) { return null; }
    visitBoundText(ast, context) {
        var nodeIndex = this.nodeCount++;
        this.bindingRecords.push(BindingRecord.createForTextNode(ast.value, nodeIndex));
        return null;
    }
    visitText(ast, context) {
        this.nodeCount++;
        return null;
    }
    visitDirective(ast, directiveIndexAsNumber) {
        var directiveIndex = new DirectiveIndex(this.boundElementCount - 1, directiveIndexAsNumber);
        var directiveMetadata = ast.directive;
        var outputsArray = [];
        StringMapWrapper.forEach(ast.directive.outputs, (eventName, dirProperty) => outputsArray.push([dirProperty, eventName]));
        var directiveRecord = new DirectiveRecord({
            directiveIndex: directiveIndex,
            callAfterContentInit: directiveMetadata.lifecycleHooks.indexOf(LifecycleHooks.AfterContentInit) !== -1,
            callAfterContentChecked: directiveMetadata.lifecycleHooks.indexOf(LifecycleHooks.AfterContentChecked) !== -1,
            callAfterViewInit: directiveMetadata.lifecycleHooks.indexOf(LifecycleHooks.AfterViewInit) !== -1,
            callAfterViewChecked: directiveMetadata.lifecycleHooks.indexOf(LifecycleHooks.AfterViewChecked) !== -1,
            callOnChanges: directiveMetadata.lifecycleHooks.indexOf(LifecycleHooks.OnChanges) !== -1,
            callDoCheck: directiveMetadata.lifecycleHooks.indexOf(LifecycleHooks.DoCheck) !== -1,
            callOnInit: directiveMetadata.lifecycleHooks.indexOf(LifecycleHooks.OnInit) !== -1,
            callOnDestroy: directiveMetadata.lifecycleHooks.indexOf(LifecycleHooks.OnDestroy) !== -1,
            changeDetection: directiveMetadata.changeDetection,
            outputs: outputsArray
        });
        this.directiveRecords.push(directiveRecord);
        templateVisitAll(this, ast.inputs, directiveRecord);
        var bindingRecords = this.bindingRecords;
        if (directiveRecord.callOnChanges) {
            bindingRecords.push(BindingRecord.createDirectiveOnChanges(directiveRecord));
        }
        if (directiveRecord.callOnInit) {
            bindingRecords.push(BindingRecord.createDirectiveOnInit(directiveRecord));
        }
        if (directiveRecord.callDoCheck) {
            bindingRecords.push(BindingRecord.createDirectiveDoCheck(directiveRecord));
        }
        templateVisitAll(this, ast.hostProperties, directiveRecord);
        templateVisitAll(this, ast.hostEvents, directiveRecord);
        templateVisitAll(this, ast.exportAsVars);
        return null;
    }
    visitDirectiveProperty(ast, directiveRecord) {
        // TODO: these setters should eventually be created by change detection, to make
        // it monomorphic!
        var setter = reflector.setter(ast.directiveName);
        this.bindingRecords.push(BindingRecord.createForDirective(ast.value, ast.directiveName, setter, directiveRecord));
        return null;
    }
}
function createChangeDefinitions(pvVisitors, componentType, genConfig) {
    var pvVariableNames = _collectNestedProtoViewsVariableNames(pvVisitors);
    return pvVisitors.map(pvVisitor => {
        var id = `${componentType.name}_${pvVisitor.viewIndex}`;
        return new ChangeDetectorDefinition(id, pvVisitor.strategy, pvVariableNames[pvVisitor.viewIndex], pvVisitor.bindingRecords, pvVisitor.eventRecords, pvVisitor.directiveRecords, genConfig);
    });
}
function _collectNestedProtoViewsVariableNames(pvVisitors) {
    var nestedPvVariableNames = ListWrapper.createFixedSize(pvVisitors.length);
    pvVisitors.forEach((pv) => {
        var parentVariableNames = isPresent(pv.parent) ? nestedPvVariableNames[pv.parent.viewIndex] : [];
        nestedPvVariableNames[pv.viewIndex] = parentVariableNames.concat(pv.variableNames);
    });
    return nestedPvVariableNames;
}
