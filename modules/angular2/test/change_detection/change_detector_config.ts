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
  Parser
} from 'angular2/change_detection';
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
  return [BindingRecord.createForElement(ast, 0, PROP_NAME)];
}

function _convertLocalsToVariableBindings(locals: Locals): List<any> {
  var variableBindings = [];
  var loc = locals;
  while (isPresent(loc) && isPresent(loc.current)) {
    MapWrapper.forEach(loc.current, (v, k) => ListWrapper.push(variableBindings, k));
    loc = loc.parent;
  }
  return variableBindings;
}

export var PROP_NAME = 'propName';

/**
 * In this case, we expect `id` and `expression` to be the same string.
 */
export function getDefinition(id: string): TestDefinition {
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
    var bindingRecords = _createBindingRecords(id);
    var directiveRecords = [];
    let cdDef = new ChangeDetectorDefinition(id, strategy, variableBindings, bindingRecords,
                                             directiveRecords);
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
  return ListWrapper.map(allDefs, (id) => getDefinition(id));
}

class _ExpressionWithLocals {
  constructor(private _expression: string, public locals: Locals) {}

  createChangeDetectorDefinition(): ChangeDetectorDefinition {
    var strategy = null;
    var variableBindings = _convertLocalsToVariableBindings(this.locals);
    var bindingRecords = _createBindingRecords(this._expression);
    var directiveRecords = [];
    return new ChangeDetectorDefinition('(empty id)', strategy, variableBindings, bindingRecords,
                                        directiveRecords);
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
        'key', new Locals(new Locals(null, MapWrapper.createFromPairs([['key', 'value']])),
                          MapWrapper.create())),
    'fallbackLocals': new _ExpressionWithLocals(
        'name', new Locals(null, MapWrapper.createFromPairs([['key', 'value']]))),
    'contextNestedPropertyWithLocals': new _ExpressionWithLocals(
        'address.city', new Locals(null, MapWrapper.createFromPairs([['city', 'MTV']]))),
    'localPropertyWithSimilarContext': new _ExpressionWithLocals(
        'city', new Locals(null, MapWrapper.createFromPairs([['city', 'MTV']])))
  };
}

class _ExpressionWithMode {
  constructor(private _strategy: string, private _withRecords: boolean) {}

  createChangeDetectorDefinition(): ChangeDetectorDefinition {
    var variableBindings = [];
    var bindingRecords = null;
    var directiveRecords = null;
    if (this._withRecords) {
      var dirRecordWithOnPush =
          new DirectiveRecord({directiveIndex: new DirectiveIndex(0, 0), changeDetection: ON_PUSH});
      var updateDirWithOnPushRecord =
          BindingRecord.createForDirective(_getParser().parseBinding('42', 'location'), 'a',
                                           (o, v) => (<any>o).a = v, dirRecordWithOnPush);
      bindingRecords = [updateDirWithOnPushRecord];
      directiveRecords = [dirRecordWithOnPush];
    } else {
      bindingRecords = [];
      directiveRecords = [];
    }
    return new ChangeDetectorDefinition('(empty id)', this._strategy, variableBindings,
                                        bindingRecords, directiveRecords);
  }

  /**
   * Map from test id to _ExpressionWithMode.
   * Definitions in this map define conditions which allow testing various change detector modes.
   */
  static availableDefinitions: StringMap<string, _ExpressionWithMode> = {
    'emptyUsingDefaultStrategy': new _ExpressionWithMode(DEFAULT, false),
    'emptyUsingOnPushStrategy': new _ExpressionWithMode(ON_PUSH, false),
    'onPushRecordsUsingDefaultStrategy': new _ExpressionWithMode(DEFAULT, true)
  };
}

class _DirectiveUpdating {
  constructor(private _bindingRecords: List<BindingRecord>,
              private _directiveRecords: List<DirectiveRecord>) {}

  createChangeDetectorDefinition(): ChangeDetectorDefinition {
    var strategy = null;
    var variableBindings = [];

    return new ChangeDetectorDefinition('(empty id)', strategy, variableBindings,
                                        this._bindingRecords, this._directiveRecords);
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
  static availableDefinitions: StringMap<string, _DirectiveUpdating> = {
    'directNoDispatcher': new _DirectiveUpdating(
        [_DirectiveUpdating.updateA('42', _DirectiveUpdating.basicRecords[0])],
        [_DirectiveUpdating.basicRecords[0]]),
    'groupChanges': new _DirectiveUpdating(
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
    'readingDirectives': new _DirectiveUpdating([
      BindingRecord.createForHostProperty(new DirectiveIndex(0, 0),
                                          _getParser().parseBinding('a', 'location'), PROP_NAME)
    ],
                                                [_DirectiveUpdating.basicRecords[0]]),
    'interpolation': new _DirectiveUpdating([
      BindingRecord.createForElement(_getParser().parseInterpolation('B{{a}}A', 'location'), 0,
                                     PROP_NAME)
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
  'value',
  'a',
  'address.city',
  'address?.city',
  'address?.toString()',
  'sayHi("Jim")',
  'a()(99)',
  'a.sayHi("Jim")'
];
