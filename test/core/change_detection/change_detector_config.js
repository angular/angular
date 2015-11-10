var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var reflection_capabilities_1 = require('angular2/src/core/reflection/reflection_capabilities');
/*
 * This file defines `ChangeDetectorDefinition` objects which are used in the tests defined in
 * the change_detector_spec library. Please see that library for more information.
 */
var _parser = new change_detection_1.Parser(new change_detection_1.Lexer());
function _getParser() {
    reflection_1.reflector.reflectionCapabilities = new reflection_capabilities_1.ReflectionCapabilities();
    return _parser;
}
function _createBindingRecords(expression) {
    var ast = _getParser().parseBinding(expression, 'location');
    return [change_detection_1.BindingRecord.createForElementProperty(ast, 0, exports.PROP_NAME)];
}
function _createEventRecords(expression) {
    var eq = expression.indexOf("=");
    var eventName = expression.substring(1, eq - 1);
    var exp = expression.substring(eq + 2, expression.length - 1);
    var ast = _getParser().parseAction(exp, 'location');
    return [change_detection_1.BindingRecord.createForEvent(ast, eventName, 0)];
}
function _createHostEventRecords(expression, directiveRecord) {
    var parts = expression.split("=");
    var eventName = parts[0].substring(1, parts[0].length - 1);
    var exp = parts[1].substring(1, parts[1].length - 1);
    var ast = _getParser().parseAction(exp, 'location');
    return [change_detection_1.BindingRecord.createForHostEvent(ast, eventName, directiveRecord)];
}
function _convertLocalsToVariableBindings(locals) {
    var variableBindings = [];
    var loc = locals;
    while (lang_1.isPresent(loc) && lang_1.isPresent(loc.current)) {
        loc.current.forEach(function (v, k) { return variableBindings.push(k); });
        loc = loc.parent;
    }
    return variableBindings;
}
exports.PROP_NAME = 'propName';
/**
 * In this case, we expect `id` and `expression` to be the same string.
 */
function getDefinition(id) {
    var genConfig = new change_detection_1.ChangeDetectorGenConfig(true, true, true);
    var testDef = null;
    if (collection_1.StringMapWrapper.contains(_ExpressionWithLocals.availableDefinitions, id)) {
        var val = collection_1.StringMapWrapper.get(_ExpressionWithLocals.availableDefinitions, id);
        var cdDef = val.createChangeDetectorDefinition();
        cdDef.id = id;
        testDef = new TestDefinition(id, cdDef, val.locals);
    }
    else if (collection_1.StringMapWrapper.contains(_ExpressionWithMode.availableDefinitions, id)) {
        var val = collection_1.StringMapWrapper.get(_ExpressionWithMode.availableDefinitions, id);
        var cdDef = val.createChangeDetectorDefinition();
        cdDef.id = id;
        testDef = new TestDefinition(id, cdDef, null);
    }
    else if (collection_1.StringMapWrapper.contains(_DirectiveUpdating.availableDefinitions, id)) {
        var val = collection_1.StringMapWrapper.get(_DirectiveUpdating.availableDefinitions, id);
        var cdDef = val.createChangeDetectorDefinition();
        cdDef.id = id;
        testDef = new TestDefinition(id, cdDef, null);
    }
    else if (collection_1.ListWrapper.indexOf(_availableDefinitions, id) >= 0) {
        var strategy = null;
        var variableBindings = [];
        var eventRecords = _createBindingRecords(id);
        var directiveRecords = [];
        var cdDef = new change_detection_1.ChangeDetectorDefinition(id, strategy, variableBindings, eventRecords, [], directiveRecords, genConfig);
        testDef = new TestDefinition(id, cdDef, null);
    }
    else if (collection_1.ListWrapper.indexOf(_availableEventDefinitions, id) >= 0) {
        var eventRecords = _createEventRecords(id);
        var cdDef = new change_detection_1.ChangeDetectorDefinition(id, null, [], [], eventRecords, [], genConfig);
        testDef = new TestDefinition(id, cdDef, null);
    }
    else if (collection_1.ListWrapper.indexOf(_availableHostEventDefinitions, id) >= 0) {
        var eventRecords = _createHostEventRecords(id, _DirectiveUpdating.basicRecords[0]);
        var cdDef = new change_detection_1.ChangeDetectorDefinition(id, null, [], [], eventRecords, [_DirectiveUpdating.basicRecords[0]], genConfig);
        testDef = new TestDefinition(id, cdDef, null);
    }
    else if (id == "onPushObserveBinding") {
        var records = _createBindingRecords("a");
        var cdDef = new change_detection_1.ChangeDetectorDefinition(id, change_detection_1.ChangeDetectionStrategy.OnPushObserve, [], records, [], [], genConfig);
        testDef = new TestDefinition(id, cdDef, null);
    }
    else if (id == "onPushObserveComponent") {
        var cdDef = new change_detection_1.ChangeDetectorDefinition(id, change_detection_1.ChangeDetectionStrategy.OnPushObserve, [], [], [], [], genConfig);
        testDef = new TestDefinition(id, cdDef, null);
    }
    else if (id == "onPushObserveDirective") {
        var cdDef = new change_detection_1.ChangeDetectorDefinition(id, change_detection_1.ChangeDetectionStrategy.OnPushObserve, [], [], [], [_DirectiveUpdating.recordNoCallbacks], genConfig);
        testDef = new TestDefinition(id, cdDef, null);
    }
    else if (id == "updateElementProduction") {
        var genConfig = new change_detection_1.ChangeDetectorGenConfig(false, false, true);
        var records = _createBindingRecords("name");
        var cdDef = new change_detection_1.ChangeDetectorDefinition(id, null, [], records, [], [], genConfig);
        testDef = new TestDefinition(id, cdDef, null);
    }
    if (lang_1.isBlank(testDef)) {
        throw "No ChangeDetectorDefinition for " + id + " available. Please modify this file if necessary.";
    }
    return testDef;
}
exports.getDefinition = getDefinition;
var TestDefinition = (function () {
    function TestDefinition(id, cdDef, locals) {
        this.id = id;
        this.cdDef = cdDef;
        this.locals = locals;
    }
    return TestDefinition;
})();
exports.TestDefinition = TestDefinition;
/**
 * Get all available ChangeDetectorDefinition objects. Used to pre-generate Dart
 * `ChangeDetector` classes.
 */
function getAllDefinitions() {
    var allDefs = _availableDefinitions;
    allDefs = collection_1.ListWrapper.concat(allDefs, collection_1.StringMapWrapper.keys(_ExpressionWithLocals.availableDefinitions));
    allDefs = allDefs.concat(collection_1.StringMapWrapper.keys(_ExpressionWithMode.availableDefinitions));
    allDefs = allDefs.concat(collection_1.StringMapWrapper.keys(_DirectiveUpdating.availableDefinitions));
    allDefs = allDefs.concat(_availableEventDefinitions);
    allDefs = allDefs.concat(_availableHostEventDefinitions);
    allDefs = allDefs.concat([
        "onPushObserveBinding",
        "onPushObserveComponent",
        "onPushObserveDirective",
        "updateElementProduction"
    ]);
    return allDefs.map(getDefinition);
}
exports.getAllDefinitions = getAllDefinitions;
var _ExpressionWithLocals = (function () {
    function _ExpressionWithLocals(_expression, locals) {
        this._expression = _expression;
        this.locals = locals;
    }
    _ExpressionWithLocals.prototype.createChangeDetectorDefinition = function () {
        var strategy = null;
        var variableBindings = _convertLocalsToVariableBindings(this.locals);
        var bindingRecords = _createBindingRecords(this._expression);
        var directiveRecords = [];
        var genConfig = new change_detection_1.ChangeDetectorGenConfig(true, true, true);
        return new change_detection_1.ChangeDetectorDefinition('(empty id)', strategy, variableBindings, bindingRecords, [], directiveRecords, genConfig);
    };
    /**
     * Map from test id to _ExpressionWithLocals.
     * Tests in this map define an expression and local values which those expressions refer to.
     */
    _ExpressionWithLocals.availableDefinitions = {
        'valueFromLocals': new _ExpressionWithLocals('key', new change_detection_1.Locals(null, collection_1.MapWrapper.createFromPairs([['key', 'value']]))),
        'functionFromLocals': new _ExpressionWithLocals('key()', new change_detection_1.Locals(null, collection_1.MapWrapper.createFromPairs([['key', function () { return 'value'; }]]))),
        'nestedLocals': new _ExpressionWithLocals('key', new change_detection_1.Locals(new change_detection_1.Locals(null, collection_1.MapWrapper.createFromPairs([['key', 'value']])), new Map())),
        'fallbackLocals': new _ExpressionWithLocals('name', new change_detection_1.Locals(null, collection_1.MapWrapper.createFromPairs([['key', 'value']]))),
        'contextNestedPropertyWithLocals': new _ExpressionWithLocals('address.city', new change_detection_1.Locals(null, collection_1.MapWrapper.createFromPairs([['city', 'MTV']]))),
        'localPropertyWithSimilarContext': new _ExpressionWithLocals('city', new change_detection_1.Locals(null, collection_1.MapWrapper.createFromPairs([['city', 'MTV']])))
    };
    return _ExpressionWithLocals;
})();
var _ExpressionWithMode = (function () {
    function _ExpressionWithMode(_strategy, _withRecords, _withEvents) {
        this._strategy = _strategy;
        this._withRecords = _withRecords;
        this._withEvents = _withEvents;
    }
    _ExpressionWithMode.prototype.createChangeDetectorDefinition = function () {
        var variableBindings = [];
        var bindingRecords = [];
        var directiveRecords = [];
        var eventRecords = [];
        var dirRecordWithDefault = new change_detection_1.DirectiveRecord({
            directiveIndex: new change_detection_1.DirectiveIndex(0, 0),
            changeDetection: change_detection_1.ChangeDetectionStrategy.Default
        });
        var dirRecordWithOnPush = new change_detection_1.DirectiveRecord({
            directiveIndex: new change_detection_1.DirectiveIndex(0, 1),
            changeDetection: change_detection_1.ChangeDetectionStrategy.OnPush
        });
        if (this._withRecords) {
            var updateDirWithOnDefaultRecord = change_detection_1.BindingRecord.createForDirective(_getParser().parseBinding('42', 'location'), 'a', function (o, v) { return o.a = v; }, dirRecordWithDefault);
            var updateDirWithOnPushRecord = change_detection_1.BindingRecord.createForDirective(_getParser().parseBinding('42', 'location'), 'a', function (o, v) { return o.a = v; }, dirRecordWithOnPush);
            directiveRecords = [dirRecordWithDefault, dirRecordWithOnPush];
            bindingRecords = [updateDirWithOnDefaultRecord, updateDirWithOnPushRecord];
        }
        if (this._withEvents) {
            directiveRecords = [dirRecordWithDefault, dirRecordWithOnPush];
            eventRecords =
                collection_1.ListWrapper.concat(_createEventRecords("(event)='false'"), _createHostEventRecords("(host-event)='false'", dirRecordWithOnPush));
        }
        var genConfig = new change_detection_1.ChangeDetectorGenConfig(true, true, true);
        return new change_detection_1.ChangeDetectorDefinition('(empty id)', this._strategy, variableBindings, bindingRecords, eventRecords, directiveRecords, genConfig);
    };
    /**
     * Map from test id to _ExpressionWithMode.
     * Definitions in this map define conditions which allow testing various change detector modes.
     */
    _ExpressionWithMode.availableDefinitions = {
        'emptyUsingDefaultStrategy': new _ExpressionWithMode(change_detection_1.ChangeDetectionStrategy.Default, false, false),
        'emptyUsingOnPushStrategy': new _ExpressionWithMode(change_detection_1.ChangeDetectionStrategy.OnPush, false, false),
        'onPushRecordsUsingDefaultStrategy': new _ExpressionWithMode(change_detection_1.ChangeDetectionStrategy.Default, true, false),
        'onPushWithEvent': new _ExpressionWithMode(change_detection_1.ChangeDetectionStrategy.OnPush, false, true),
        'onPushWithHostEvent': new _ExpressionWithMode(change_detection_1.ChangeDetectionStrategy.OnPush, false, true)
    };
    return _ExpressionWithMode;
})();
var _DirectiveUpdating = (function () {
    function _DirectiveUpdating(_bindingRecords, _directiveRecords) {
        this._bindingRecords = _bindingRecords;
        this._directiveRecords = _directiveRecords;
    }
    _DirectiveUpdating.prototype.createChangeDetectorDefinition = function () {
        var strategy = null;
        var variableBindings = [];
        var genConfig = new change_detection_1.ChangeDetectorGenConfig(true, true, true);
        return new change_detection_1.ChangeDetectorDefinition('(empty id)', strategy, variableBindings, this._bindingRecords, [], this._directiveRecords, genConfig);
    };
    _DirectiveUpdating.updateA = function (expression, dirRecord) {
        return change_detection_1.BindingRecord.createForDirective(_getParser().parseBinding(expression, 'location'), 'a', function (o, v) { return o.a = v; }, dirRecord);
    };
    _DirectiveUpdating.updateB = function (expression, dirRecord) {
        return change_detection_1.BindingRecord.createForDirective(_getParser().parseBinding(expression, 'location'), 'b', function (o, v) { return o.b = v; }, dirRecord);
    };
    _DirectiveUpdating.basicRecords = [
        new change_detection_1.DirectiveRecord({
            directiveIndex: new change_detection_1.DirectiveIndex(0, 0),
            callOnChanges: true,
            callDoCheck: true,
            callOnInit: true,
            callAfterContentInit: true,
            callAfterContentChecked: true,
            callAfterViewInit: true,
            callAfterViewChecked: true
        }),
        new change_detection_1.DirectiveRecord({
            directiveIndex: new change_detection_1.DirectiveIndex(0, 1),
            callOnChanges: true,
            callDoCheck: true,
            callOnInit: true,
            callAfterContentInit: true,
            callAfterContentChecked: true,
            callAfterViewInit: true,
            callAfterViewChecked: true
        })
    ];
    _DirectiveUpdating.recordNoCallbacks = new change_detection_1.DirectiveRecord({
        directiveIndex: new change_detection_1.DirectiveIndex(0, 0),
        callOnChanges: false,
        callDoCheck: false,
        callOnInit: false,
        callAfterContentInit: false,
        callAfterContentChecked: false,
        callAfterViewInit: false,
        callAfterViewChecked: false
    });
    /**
     * Map from test id to _DirectiveUpdating.
     * Definitions in this map define definitions which allow testing directive updating.
     */
    _DirectiveUpdating.availableDefinitions = {
        'directNoDispatcher': new _DirectiveUpdating([_DirectiveUpdating.updateA('42', _DirectiveUpdating.basicRecords[0])], [_DirectiveUpdating.basicRecords[0]]),
        'groupChanges': new _DirectiveUpdating([
            _DirectiveUpdating.updateA('1', _DirectiveUpdating.basicRecords[0]),
            _DirectiveUpdating.updateB('2', _DirectiveUpdating.basicRecords[0]),
            change_detection_1.BindingRecord.createDirectiveOnChanges(_DirectiveUpdating.basicRecords[0]),
            _DirectiveUpdating.updateA('3', _DirectiveUpdating.basicRecords[1]),
            change_detection_1.BindingRecord.createDirectiveOnChanges(_DirectiveUpdating.basicRecords[1])
        ], [_DirectiveUpdating.basicRecords[0], _DirectiveUpdating.basicRecords[1]]),
        'directiveDoCheck': new _DirectiveUpdating([change_detection_1.BindingRecord.createDirectiveDoCheck(_DirectiveUpdating.basicRecords[0])], [_DirectiveUpdating.basicRecords[0]]),
        'directiveOnInit': new _DirectiveUpdating([change_detection_1.BindingRecord.createDirectiveOnInit(_DirectiveUpdating.basicRecords[0])], [_DirectiveUpdating.basicRecords[0]]),
        'emptyWithDirectiveRecords': new _DirectiveUpdating([], [_DirectiveUpdating.basicRecords[0], _DirectiveUpdating.basicRecords[1]]),
        'noCallbacks': new _DirectiveUpdating([_DirectiveUpdating.updateA('1', _DirectiveUpdating.recordNoCallbacks)], [_DirectiveUpdating.recordNoCallbacks]),
        'readingDirectives': new _DirectiveUpdating([
            change_detection_1.BindingRecord.createForHostProperty(new change_detection_1.DirectiveIndex(0, 0), _getParser().parseBinding('a', 'location'), exports.PROP_NAME)
        ], [_DirectiveUpdating.basicRecords[0]]),
        'interpolation': new _DirectiveUpdating([
            change_detection_1.BindingRecord.createForElementProperty(_getParser().parseInterpolation('B{{a}}A', 'location'), 0, exports.PROP_NAME)
        ], [])
    };
    return _DirectiveUpdating;
})();
/**
 * The list of all test definitions this config supplies.
 * Items in this list that do not appear in other structures define tests with expressions
 * equivalent to their ids.
 */
var _availableDefinitions = [
    '"$"',
    '10',
    '"str"',
    '"a\n\nb"',
    '10 + 2',
    '10 - 2',
    '10 * 2',
    '10 / 2',
    '11 % 2',
    '1 == 1',
    '1 != 1',
    '1 == true',
    '1 === 1',
    '1 !== 1',
    '1 === true',
    '1 < 2',
    '2 < 1',
    '1 > 2',
    '2 > 1',
    '1 <= 2',
    '2 <= 2',
    '2 <= 1',
    '2 >= 1',
    '2 >= 2',
    '1 >= 2',
    'true && true',
    'true && false',
    'true || false',
    'false || false',
    '!true',
    '!!true',
    '1 < 2 ? 1 : 2',
    '1 > 2 ? 1 : 2',
    '["foo", "bar"][0]',
    '{"foo": "bar"}["foo"]',
    'name',
    '[1, 2]',
    '[1, a]',
    '{z: 1}',
    '{z: a}',
    'name | pipe',
    '(name | pipe).length',
    "name | pipe:'one':address.city",
    "name | pipe:'a':'b' | pipe:0:1:2",
    'value',
    'a',
    'address.city',
    'address?.city',
    'address?.toString()',
    'sayHi("Jim")',
    'a()(99)',
    'a.sayHi("Jim")',
    'passThrough([12])',
    'invalidFn(1)',
    'age',
    'true ? city : zipcode',
    'false ? city : zipcode',
    'getTrue() && getTrue()',
    'getFalse() && getTrue()',
    'getFalse() || getFalse()',
    'getTrue() || getFalse()',
    'name == "Victor" ? (true ? address.city : address.zipcode) : address.zipcode'
];
var _availableEventDefinitions = [
    '(event)="onEvent(\$event)"',
    '(event)="b=a=\$event"',
    '(event)="a[0]=\$event"',
    // '(event)="\$event=1"',
    '(event)="a=a+1; a=a+1;"',
    '(event)="false"',
    '(event)="true"',
    '(event)="true ? a = a + 1 : a = a + 1"',
];
var _availableHostEventDefinitions = ['(host-event)="onEvent(\$event)"'];
//# sourceMappingURL=change_detector_config.js.map