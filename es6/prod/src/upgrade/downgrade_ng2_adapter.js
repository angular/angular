import { provide } from 'angular2/core';
import { NG1_SCOPE } from './constants';
const INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
export class DowngradeNg2ComponentAdapter {
    constructor(id, info, element, attrs, scope, parentInjector, parse, viewManager, hostViewFactory) {
        this.id = id;
        this.info = info;
        this.element = element;
        this.attrs = attrs;
        this.scope = scope;
        this.parentInjector = parentInjector;
        this.parse = parse;
        this.viewManager = viewManager;
        this.hostViewFactory = hostViewFactory;
        this.component = null;
        this.inputChangeCount = 0;
        this.inputChanges = null;
        this.hostViewRef = null;
        this.changeDetector = null;
        this.contentInsertionPoint = null;
        this.element[0].id = id;
        this.componentScope = scope.$new();
        this.childNodes = element.contents();
    }
    bootstrapNg2() {
        var childInjector = this.parentInjector.resolveAndCreateChild([provide(NG1_SCOPE, { useValue: this.componentScope })]);
        this.contentInsertionPoint = document.createComment('ng1 insertion point');
        this.hostViewRef = this.viewManager.createRootHostView(this.hostViewFactory, '#' + this.id, childInjector, [[this.contentInsertionPoint]]);
        var hostElement = this.viewManager.getHostElement(this.hostViewRef);
        this.changeDetector = this.hostViewRef.changeDetectorRef;
        this.component = this.viewManager.getComponent(hostElement);
    }
    setupInputs() {
        var attrs = this.attrs;
        var inputs = this.info.inputs;
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            var expr = null;
            if (attrs.hasOwnProperty(input.attr)) {
                var observeFn = ((prop) => {
                    var prevValue = INITIAL_VALUE;
                    return (value) => {
                        if (this.inputChanges !== null) {
                            this.inputChangeCount++;
                            this.inputChanges[prop] =
                                new Ng1Change(value, prevValue === INITIAL_VALUE ? value : prevValue);
                            prevValue = value;
                        }
                        this.component[prop] = value;
                    };
                })(input.prop);
                attrs.$observe(input.attr, observeFn);
            }
            else if (attrs.hasOwnProperty(input.bindAttr)) {
                expr = attrs[input.bindAttr];
            }
            else if (attrs.hasOwnProperty(input.bracketAttr)) {
                expr = attrs[input.bracketAttr];
            }
            else if (attrs.hasOwnProperty(input.bindonAttr)) {
                expr = attrs[input.bindonAttr];
            }
            else if (attrs.hasOwnProperty(input.bracketParenAttr)) {
                expr = attrs[input.bracketParenAttr];
            }
            if (expr != null) {
                var watchFn = ((prop) => (value, prevValue) => {
                    if (this.inputChanges != null) {
                        this.inputChangeCount++;
                        this.inputChanges[prop] = new Ng1Change(prevValue, value);
                    }
                    this.component[prop] = value;
                })(input.prop);
                this.componentScope.$watch(expr, watchFn);
            }
        }
        var prototype = this.info.type.prototype;
        if (prototype && prototype.ngOnChanges) {
            // Detect: OnChanges interface
            this.inputChanges = {};
            this.componentScope.$watch(() => this.inputChangeCount, () => {
                var inputChanges = this.inputChanges;
                this.inputChanges = {};
                this.component.ngOnChanges(inputChanges);
            });
        }
        this.componentScope.$watch(() => this.changeDetector && this.changeDetector.detectChanges());
    }
    projectContent() {
        var childNodes = this.childNodes;
        var parent = this.contentInsertionPoint.parentNode;
        if (parent) {
            for (var i = 0, ii = childNodes.length; i < ii; i++) {
                parent.insertBefore(childNodes[i], this.contentInsertionPoint);
            }
        }
    }
    setupOutputs() {
        var attrs = this.attrs;
        var outputs = this.info.outputs;
        for (var j = 0; j < outputs.length; j++) {
            var output = outputs[j];
            var expr = null;
            var assignExpr = false;
            var bindonAttr = output.bindonAttr ? output.bindonAttr.substring(0, output.bindonAttr.length - 6) : null;
            var bracketParenAttr = output.bracketParenAttr ?
                `[(${output.bracketParenAttr.substring(2, output.bracketParenAttr.length - 8)})]` :
                null;
            if (attrs.hasOwnProperty(output.onAttr)) {
                expr = attrs[output.onAttr];
            }
            else if (attrs.hasOwnProperty(output.parenAttr)) {
                expr = attrs[output.parenAttr];
            }
            else if (attrs.hasOwnProperty(bindonAttr)) {
                expr = attrs[bindonAttr];
                assignExpr = true;
            }
            else if (attrs.hasOwnProperty(bracketParenAttr)) {
                expr = attrs[bracketParenAttr];
                assignExpr = true;
            }
            if (expr != null && assignExpr != null) {
                var getter = this.parse(expr);
                var setter = getter.assign;
                if (assignExpr && !setter) {
                    throw new Error(`Expression '${expr}' is not assignable!`);
                }
                var emitter = this.component[output.prop];
                if (emitter) {
                    emitter.subscribe({
                        next: assignExpr ? ((setter) => (value) => setter(this.scope, value))(setter) :
                            ((getter) => (value) => getter(this.scope, { $event: value }))(getter)
                    });
                }
                else {
                    throw new Error(`Missing emitter '${output.prop}' on component '${this.info.selector}'!`);
                }
            }
        }
    }
    registerCleanup() {
        this.element.bind('$remove', () => this.viewManager.destroyRootHostView(this.hostViewRef));
    }
}
class Ng1Change {
    constructor(previousValue, currentValue) {
        this.previousValue = previousValue;
        this.currentValue = currentValue;
    }
    isFirstChange() { return this.previousValue === this.currentValue; }
}
