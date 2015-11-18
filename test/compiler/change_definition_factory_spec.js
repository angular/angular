var testing_internal_1 = require('angular2/testing_internal');
var collection_1 = require('angular2/src/facade/collection');
var directive_metadata_1 = require('angular2/src/compiler/directive_metadata');
var template_parser_1 = require('angular2/src/compiler/template_parser');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var change_definition_factory_1 = require('angular2/src/compiler/change_definition_factory');
var change_detector_mocks_1 = require('./change_detector_mocks');
var test_bindings_1 = require('./test_bindings');
function main() {
    testing_internal_1.describe('ChangeDefinitionFactory', function () {
        testing_internal_1.beforeEachBindings(function () { return test_bindings_1.TEST_PROVIDERS; });
        var parser;
        var dispatcher;
        var context;
        var directive;
        var locals;
        var pipes;
        var eventLocals;
        testing_internal_1.beforeEach(testing_internal_1.inject([template_parser_1.TemplateParser], function (_templateParser) {
            parser = _templateParser;
            context = new TestContext();
            directive = new change_detector_mocks_1.TestDirective();
            dispatcher = new change_detector_mocks_1.TestDispatcher([directive], []);
            locals = new change_detection_1.Locals(null, collection_1.MapWrapper.createFromStringMap({ 'someVar': null }));
            eventLocals = new change_detection_1.Locals(null, collection_1.MapWrapper.createFromStringMap({ '$event': null }));
            pipes = new change_detector_mocks_1.TestPipes();
        }));
        function createChangeDetector(template, directives, protoViewIndex) {
            if (protoViewIndex === void 0) { protoViewIndex = 0; }
            var protoChangeDetectors = change_definition_factory_1.createChangeDetectorDefinitions(new directive_metadata_1.CompileTypeMetadata({ name: 'SomeComp' }), change_detection_1.ChangeDetectionStrategy.Default, new change_detection_1.ChangeDetectorGenConfig(true, false, false), parser.parse(template, directives, 'TestComp'))
                .map(function (definition) { return new change_detection_1.DynamicProtoChangeDetector(definition); });
            var changeDetector = protoChangeDetectors[protoViewIndex].instantiate(dispatcher);
            changeDetector.hydrate(context, locals, dispatcher, pipes);
            return changeDetector;
        }
        testing_internal_1.it('should watch element properties', function () {
            var changeDetector = createChangeDetector('<div [el-prop]="someProp">', [], 0);
            context.someProp = 'someValue';
            changeDetector.detectChanges();
            testing_internal_1.expect(dispatcher.log).toEqual(['elementProperty(elProp)=someValue']);
        });
        testing_internal_1.it('should watch text nodes', function () {
            var changeDetector = createChangeDetector('{{someProp}}', [], 0);
            context.someProp = 'someValue';
            changeDetector.detectChanges();
            testing_internal_1.expect(dispatcher.log).toEqual(['textNode(null)=someValue']);
        });
        testing_internal_1.it('should handle events on regular elements', function () {
            var changeDetector = createChangeDetector('<div on-click="onEvent($event)">', [], 0);
            eventLocals.set('$event', 'click');
            changeDetector.handleEvent('click', 0, eventLocals);
            testing_internal_1.expect(context.eventLog).toEqual(['click']);
        });
        testing_internal_1.it('should handle events on template elements', function () {
            var dirMeta = directive_metadata_1.CompileDirectiveMetadata.create({
                type: new directive_metadata_1.CompileTypeMetadata({ name: 'SomeDir' }),
                selector: 'template',
                outputs: ['click']
            });
            var changeDetector = createChangeDetector('<template on-click="onEvent($event)">', [dirMeta], 0);
            eventLocals.set('$event', 'click');
            changeDetector.handleEvent('click', 0, eventLocals);
            testing_internal_1.expect(context.eventLog).toEqual(['click']);
        });
        testing_internal_1.it('should handle events with targets', function () {
            var changeDetector = createChangeDetector('<div (window:click)="onEvent($event)">', [], 0);
            eventLocals.set('$event', 'click');
            changeDetector.handleEvent('window:click', 0, eventLocals);
            testing_internal_1.expect(context.eventLog).toEqual(['click']);
        });
        testing_internal_1.it('should watch variables', function () {
            var changeDetector = createChangeDetector('<div #some-var [el-prop]="someVar">', [], 0);
            locals.set('someVar', 'someValue');
            changeDetector.detectChanges();
            testing_internal_1.expect(dispatcher.log).toEqual(['elementProperty(elProp)=someValue']);
        });
        testing_internal_1.it('should write directive properties', function () {
            var dirMeta = directive_metadata_1.CompileDirectiveMetadata.create({
                type: new directive_metadata_1.CompileTypeMetadata({ name: 'SomeDir' }),
                selector: '[dir-prop]',
                inputs: ['dirProp']
            });
            var changeDetector = createChangeDetector('<div [dir-prop]="someProp">', [dirMeta], 0);
            context.someProp = 'someValue';
            changeDetector.detectChanges();
            testing_internal_1.expect(directive.dirProp).toEqual('someValue');
        });
        testing_internal_1.it('should write template directive properties', function () {
            var dirMeta = directive_metadata_1.CompileDirectiveMetadata.create({
                type: new directive_metadata_1.CompileTypeMetadata({ name: 'SomeDir' }),
                selector: '[dir-prop]',
                inputs: ['dirProp']
            });
            var changeDetector = createChangeDetector('<template [dir-prop]="someProp">', [dirMeta], 0);
            context.someProp = 'someValue';
            changeDetector.detectChanges();
            testing_internal_1.expect(directive.dirProp).toEqual('someValue');
        });
        testing_internal_1.it('should watch directive host properties', function () {
            var dirMeta = directive_metadata_1.CompileDirectiveMetadata.create({
                type: new directive_metadata_1.CompileTypeMetadata({ name: 'SomeDir' }),
                selector: 'div',
                host: { '[elProp]': 'dirProp' }
            });
            var changeDetector = createChangeDetector('<div>', [dirMeta], 0);
            directive.dirProp = 'someValue';
            changeDetector.detectChanges();
            testing_internal_1.expect(dispatcher.log).toEqual(['elementProperty(elProp)=someValue']);
        });
        testing_internal_1.it('should handle directive events', function () {
            var dirMeta = directive_metadata_1.CompileDirectiveMetadata.create({
                type: new directive_metadata_1.CompileTypeMetadata({ name: 'SomeDir' }),
                selector: 'div',
                host: { '(click)': 'onEvent($event)' }
            });
            var changeDetector = createChangeDetector('<div>', [dirMeta], 0);
            eventLocals.set('$event', 'click');
            changeDetector.handleEvent('click', 0, eventLocals);
            testing_internal_1.expect(directive.eventLog).toEqual(['click']);
        });
        testing_internal_1.it('should create change detectors for embedded templates', function () {
            var changeDetector = createChangeDetector('<template>{{someProp}}<template>', [], 1);
            context.someProp = 'someValue';
            changeDetector.detectChanges();
            testing_internal_1.expect(dispatcher.log).toEqual(['textNode(null)=someValue']);
        });
        testing_internal_1.it('should watch expressions after embedded templates', function () {
            var changeDetector = createChangeDetector('<template>{{someProp2}}</template>{{someProp}}', [], 0);
            context.someProp = 'someValue';
            changeDetector.detectChanges();
            testing_internal_1.expect(dispatcher.log).toEqual(['textNode(null)=someValue']);
        });
    });
}
exports.main = main;
var TestContext = (function () {
    function TestContext() {
        this.eventLog = [];
    }
    TestContext.prototype.onEvent = function (value) { this.eventLog.push(value); };
    return TestContext;
})();
//# sourceMappingURL=change_definition_factory_spec.js.map