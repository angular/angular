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

var _parser = new Parser(new Lexer());

function _createBindingRecords(expression: string): List<BindingRecord> {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  var ast = _parser.parseBinding(expression, 'location');
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
  return ListWrapper.map(_availableDefinitions, (id) => getDefinition(id));
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
          BindingRecord.createForDirective(_parser.parseBinding('42', 'location'), 'a',
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

/**
 * The list of all test definitions this config supplies.
 * Items in this list that do not appear in other structures define tests with expressions
 * equivalent to their ids.
 */
var _availableDefinitions = ListWrapper.concat(
    [
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
    ],
    ListWrapper.concat(StringMapWrapper.keys(_ExpressionWithLocals.availableDefinitions),
                       StringMapWrapper.keys(_ExpressionWithMode.availableDefinitions)));
