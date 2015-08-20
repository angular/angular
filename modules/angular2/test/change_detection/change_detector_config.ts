import {ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {isBlank, isPresent} from 'angular2/src/facade/lang';
import {
  DEFAULT,
  ON_PUSH,
  BindingRecord,
  ChangeDetectorDefinition,
  DirectiveIndex,
  DirectiveRecord,
  Lexer,
  Locals,
  Parser,
  ChangeDetectorGenConfig
} from 'angular2/src/change_detection/change_detection';
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';

/*
 * This file defines `ChangeDetectorDefinition` objects which are used in the tests defined in
 * the change_detector_spec library. Please see that library for more information.
 */

var _parser = new Parser(new Lexer());

function _getParser() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  return _parser;
}

function _createBindingRecords(expression: string): List<BindingRecord> {
  var ast = _getParser().parseBinding(expression, 'location');
  return [BindingRecord.createForElementProperty(ast, 0, PROP_NAME)];
}

function _createEventRecords(expression: string): List<BindingRecord> {
  var eq = expression.indexOf("=");
  var eventName = expression.substring(1, eq - 1);
  var exp = expression.substring(eq + 2, expression.length - 1);
  var ast = _getParser().parseAction(exp, 'location');
  return [BindingRecord.createForEvent(ast, eventName, 0)];
}

function _createHostEventRecords(expression: string, directiveRecord: DirectiveRecord):
    List<BindingRecord> {
  var parts = expression.split("=");
  var eventName = parts[0].substring(1, parts[0].length - 1);
  var exp = parts[1].substring(1, parts[1].length - 1);

  var ast = _getParser().parseAction(exp, 'location');
  return [BindingRecord.createForHostEvent(ast, eventName, directiveRecord)];
}

function _convertLocalsToVariableBindings(locals: Locals): List<any> {
  var variableBindings = [];
  var loc = locals;
  while (isPresent(loc) && isPresent(loc.current)) {
    MapWrapper.forEach(loc.current, (v, k) => variableBindings.push(k));
    loc = loc.parent;
  }
  return variableBindings;
}

export var PROP_NAME = 'propName';

/**
 * In this case, we expect `id` and `expression` to be the same string.
 */
export function getDefinition(id: string): TestDefinition {
  var genConfig = new ChangeDetectorGenConfig(true, true, true);
  var testDef = null;
  if (StringMapWrapper.contains(_ExpressionWithLocals.availableDefinitions, id)) {
    let val = StringMapWrapper.get(_ExpressionWithLocals.availableDefinitions, id);
    let cdDef = val.createChangeDetectorDefinition();
    cdDef.id = id;
    testDef = new TestDefinition(id, cdDef, val.locals);

  } else if (StringMapWrapper.contains(_ExpressionWithMode.availableDefinitions, id)) {
    let val = StringMapWrapper.get(_ExpressionWithMode.availableDefinitions, id);
    let cdDef = val.createChangeDetectorDefinition();
    cdDef.id = id;
    testDef = new TestDefinition(id, cdDef, null);

  } else if (StringMapWrapper.contains(_DirectiveUpdating.availableDefinitions, id)) {
    let val = StringMapWrapper.get(_DirectiveUpdating.availableDefinitions, id);
    let cdDef = val.createChangeDetectorDefinition();
    cdDef.id = id;
    testDef = new TestDefinition(id, cdDef, null);

  } else if (ListWrapper.indexOf(_availableDefinitions, id) >= 0) {
    var strategy = null;
    var variableBindings = [];
    var eventRecords = _createBindingRecords(id);
    var directiveRecords = [];
    let cdDef = new ChangeDetectorDefinition(id, strategy, variableBindings, eventRecords, [],
                                             directiveRecords, genConfig);
    testDef = new TestDefinition(id, cdDef, null);

  } else if (ListWrapper.indexOf(_availableEventDefinitions, id) >= 0) {
    var eventRecords = _createEventRecords(id);
    let cdDef = new ChangeDetectorDefinition(id, null, [], [], eventRecords, [], genConfig);
    testDef = new TestDefinition(id, cdDef, null);

  } else if (ListWrapper.indexOf(_availableHostEventDefinitions, id) >= 0) {
    var eventRecords = _createHostEventRecords(id, _DirectiveUpdating.basicRecords[0]);
    let cdDef = new ChangeDetectorDefinition(id, null, [], [], eventRecords,
                                             [_DirectiveUpdating.basicRecords[0]], genConfig);
    testDef = new TestDefinition(id, cdDef, null);

  } else if (id == "onPushObserve") {
    var records = _createBindingRecords("a");
    let cdDef = new ChangeDetectorDefinition(id, "ON_PUSH_OBSERVE", [], records, [], [], genConfig);
    testDef = new TestDefinition(id, cdDef, null);

  } else if (id == "updateElementProduction") {
    var genConfig = new ChangeDetectorGenConfig(false, false, false);
    var records = _createBindingRecords("name");
    let cdDef = new ChangeDetectorDefinition(id, null, [], records, [], [], genConfig);
    testDef = new TestDefinition(id, cdDef, null);
  }


  if (isBlank(testDef)) {
    throw `No ChangeDetectorDefinition for ${id} available. Please modify this file if necessary.`;
  }

  return testDef;
}

export class TestDefinition {
  constructor(public id: string, public cdDef: ChangeDetectorDefinition, public locals: Locals) {}
}

/**
 * Get all available ChangeDetectorDefinition objects. Used to pre-generate Dart
 * `ChangeDetector` classes.
 */
export function getAllDefinitions(): List<TestDefinition> {
  var allDefs = _availableDefinitions;
  allDefs = ListWrapper.concat(allDefs,
                               StringMapWrapper.keys(_ExpressionWithLocals.availableDefinitions));
  allDefs =
      ListWrapper.concat(allDefs, StringMapWrapper.keys(_ExpressionWithMode.availableDefinitions));
  allDefs =
      ListWrapper.concat(allDefs, StringMapWrapper.keys(_DirectiveUpdating.availableDefinitions));
  allDefs = ListWrapper.concat(allDefs, _availableEventDefinitions);
  allDefs = ListWrapper.concat(allDefs, _availableHostEventDefinitions);
  allDefs = ListWrapper.concat(allDefs, ["onPushObserve", "updateElementProduction"]);
  return ListWrapper.map(allDefs, (id) => getDefinition(id));
}

class _ExpressionWithLocals {
  constructor(private _expression: string, public locals: Locals) {}

  createChangeDetectorDefinition(): ChangeDetectorDefinition {
    var strategy = null;
    var variableBindings = _convertLocalsToVariableBindings(this.locals);
    var bindingRecords = _createBindingRecords(this._expression);
    var directiveRecords = [];
    var genConfig = new ChangeDetectorGenConfig(true, true, true);
    return new ChangeDetectorDefinition('(empty id)', strategy, variableBindings, bindingRecords,
                                        [], directiveRecords, genConfig);
  }

  /**
   * Map from test id to _ExpressionWithLocals.
   * Tests in this map define an expression and local values which those expressions refer to.
   */
  static availableDefinitions: StringMap<string, _ExpressionWithLocals> = {
    'valueFromLocals': new _ExpressionWithLocals(
        'key', new Locals(null, MapWrapper.createFromPairs([['key', 'value']]))),
    'functionFromLocals': new _ExpressionWithLocals(
        'key()', new Locals(null, MapWrapper.createFromPairs([['key', () => 'value']]))),
    'nestedLocals': new _ExpressionWithLocals(
        'key',
        new Locals(new Locals(null, MapWrapper.createFromPairs([['key', 'value']])), new Map())),
    'fallbackLocals': new _ExpressionWithLocals(
        'name', new Locals(null, MapWrapper.createFromPairs([['key', 'value']]))),
    'contextNestedPropertyWithLocals': new _ExpressionWithLocals(
        'address.city', new Locals(null, MapWrapper.createFromPairs([['city', 'MTV']]))),
    'localPropertyWithSimilarContext': new _ExpressionWithLocals(
        'city', new Locals(null, MapWrapper.createFromPairs([['city', 'MTV']])))
  };
}

class _ExpressionWithMode {
  constructor(private _strategy: string, private _withRecords: boolean,
              private _withEvents: boolean) {}

  createChangeDetectorDefinition(): ChangeDetectorDefinition {
    var variableBindings = [];
    var bindingRecords = [];
    var directiveRecords = [];
    var eventRecords = [];

    var dirRecordWithDefault =
        new DirectiveRecord({directiveIndex: new DirectiveIndex(0, 0), changeDetection: DEFAULT});
    var dirRecordWithOnPush =
        new DirectiveRecord({directiveIndex: new DirectiveIndex(0, 1), changeDetection: ON_PUSH});

    if (this._withRecords) {
      var updateDirWithOnDefaultRecord =
          BindingRecord.createForDirective(_getParser().parseBinding('42', 'location'), 'a',
                                           (o, v) => (<any>o).a = v, dirRecordWithDefault);
      var updateDirWithOnPushRecord =
          BindingRecord.createForDirective(_getParser().parseBinding('42', 'location'), 'a',
                                           (o, v) => (<any>o).a = v, dirRecordWithOnPush);

      directiveRecords = [dirRecordWithDefault, dirRecordWithOnPush];
      bindingRecords = [updateDirWithOnDefaultRecord, updateDirWithOnPushRecord];
    }

    if (this._withEvents) {
      directiveRecords = [dirRecordWithDefault, dirRecordWithOnPush];
      eventRecords =
          ListWrapper.concat(_createEventRecords("(event)='false'"),
                             _createHostEventRecords("(host-event)='false'", dirRecordWithOnPush))
    }

    var genConfig = new ChangeDetectorGenConfig(true, true, true);

    return new ChangeDetectorDefinition('(empty id)', this._strategy, variableBindings,
                                        bindingRecords, eventRecords, directiveRecords, genConfig);
  }

  /**
   * Map from test id to _ExpressionWithMode.
   * Definitions in this map define conditions which allow testing various change detector modes.
   */
  static availableDefinitions: StringMap<string, _ExpressionWithMode> = {
    'emptyUsingDefaultStrategy': new _ExpressionWithMode(DEFAULT, false, false),
    'emptyUsingOnPushStrategy': new _ExpressionWithMode(ON_PUSH, false, false),
    'onPushRecordsUsingDefaultStrategy': new _ExpressionWithMode(DEFAULT, true, false),
    'onPushWithEvent': new _ExpressionWithMode(ON_PUSH, false, true),
    'onPushWithHostEvent': new _ExpressionWithMode(ON_PUSH, false, true)
  };
}

class _DirectiveUpdating {
  constructor(private _bindingRecords: List<BindingRecord>,
              private _directiveRecords: List<DirectiveRecord>) {}

  createChangeDetectorDefinition(): ChangeDetectorDefinition {
    var strategy = null;
    var variableBindings = [];
    var genConfig = new ChangeDetectorGenConfig(true, true, true);

    return new ChangeDetectorDefinition('(empty id)', strategy, variableBindings,
                                        this._bindingRecords, [], this._directiveRecords,
                                        genConfig);
  }

  static updateA(expression: string, dirRecord): BindingRecord {
    return BindingRecord.createForDirective(_getParser().parseBinding(expression, 'location'), 'a',
                                            (o, v) => (<any>o).a = v, dirRecord);
  }

  static updateB(expression: string, dirRecord): BindingRecord {
    return BindingRecord.createForDirective(_getParser().parseBinding(expression, 'location'), 'b',
                                            (o, v) => (<any>o).b = v, dirRecord);
  }

  static basicRecords: List<DirectiveRecord> = [
    new DirectiveRecord({
      directiveIndex: new DirectiveIndex(0, 0),
      callOnChange: true,
      callOnCheck: true,
      callOnAllChangesDone: true
    }),
    new DirectiveRecord({
      directiveIndex: new DirectiveIndex(0, 1),
      callOnChange: true,
      callOnCheck: true,
      callOnAllChangesDone: true
    })
  ];

  static recordNoCallbacks = new DirectiveRecord({
    directiveIndex: new DirectiveIndex(0, 0),
    callOnChange: false,
    callOnCheck: false,
    callOnAllChangesDone: false
  });

  /**
   * Map from test id to _DirectiveUpdating.
   * Definitions in this map define definitions which allow testing directive updating.
   */
  static availableDefinitions:
      StringMap<string, _DirectiveUpdating> = {
        'directNoDispatcher': new _DirectiveUpdating(
            [_DirectiveUpdating.updateA('42', _DirectiveUpdating.basicRecords[0])],
            [_DirectiveUpdating.basicRecords[0]]),
        'groupChanges':
            new _DirectiveUpdating(
                [
                  _DirectiveUpdating.updateA('1', _DirectiveUpdating.basicRecords[0]),
                  _DirectiveUpdating.updateB('2', _DirectiveUpdating.basicRecords[0]),
                  BindingRecord.createDirectiveOnChange(_DirectiveUpdating.basicRecords[0]),
                  _DirectiveUpdating.updateA('3', _DirectiveUpdating.basicRecords[1]),
                  BindingRecord.createDirectiveOnChange(_DirectiveUpdating.basicRecords[1])
                ],
                [_DirectiveUpdating.basicRecords[0], _DirectiveUpdating.basicRecords[1]]),
        'directiveOnCheck': new _DirectiveUpdating(
            [BindingRecord.createDirectiveOnCheck(_DirectiveUpdating.basicRecords[0])],
            [_DirectiveUpdating.basicRecords[0]]),
        'directiveOnInit': new _DirectiveUpdating(
            [BindingRecord.createDirectiveOnInit(_DirectiveUpdating.basicRecords[0])],
            [_DirectiveUpdating.basicRecords[0]]),
        'emptyWithDirectiveRecords': new _DirectiveUpdating(
            [], [_DirectiveUpdating.basicRecords[0], _DirectiveUpdating.basicRecords[1]]),
        'noCallbacks': new _DirectiveUpdating(
            [_DirectiveUpdating.updateA('1', _DirectiveUpdating.recordNoCallbacks)],
            [_DirectiveUpdating.recordNoCallbacks]),
        'readingDirectives':
            new _DirectiveUpdating(
                [
                  BindingRecord.createForHostProperty(new DirectiveIndex(0, 0),
                                                      _getParser().parseBinding('a', 'location'),
                                                      PROP_NAME)
                ],
                [_DirectiveUpdating.basicRecords[0]]),
        'interpolation':
            new _DirectiveUpdating(
                [
                  BindingRecord.createForElementProperty(
                      _getParser().parseInterpolation('B{{a}}A', 'location'), 0, PROP_NAME)
                ],
                [])
      };
}

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
  'value',
  'a',
  'address.city',
  'address?.city',
  'address?.toString()',
  'sayHi("Jim")',
  'a()(99)',
  'a.sayHi("Jim")',
  'passThrough([12])',
  'invalidFn(1)'
];

var _availableEventDefinitions = [
  '(event)="onEvent(\$event)"',
  '(event)="b=a=\$event"',
  '(event)="a[0]=\$event"',
  // '(event)="\$event=1"',
  '(event)="a=a+1; a=a+1;"',
  '(event)="false"',
  '(event)="true"'
];

var _availableHostEventDefinitions = ['(host-event)="onEvent(\$event)"'];