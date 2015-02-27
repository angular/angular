import {ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {reflector} from 'angular2/src/reflection/reflection';
import {isPresent, isJsObject} from 'angular2/src/facade/lang';
import {getIntParameter, bindAction} from 'angular2/src/test_lib/benchmark_util';
import {BrowserDomAdapter} from 'angular2/src/dom/browser_adapter';

import {
  Lexer,
  Parser,
  ChangeDispatcher,
  ChangeDetection,
  dynamicChangeDetection,
  jitChangeDetection
} from 'angular2/change_detection';


class Obj {
  field0;
  field1;
  field2;
  field3;
  field4;
  field5;
  field6;
  field7;
  field8;
  field9;


  setField(index, value) {
    switch (index) {
      case 0: this.field0 = value; break;
      case 1: this.field1 = value; break;
      case 2: this.field2 = value; break;
      case 3: this.field3 = value; break;
      case 4: this.field4 = value; break;
      case 5: this.field5 = value; break;
      case 6: this.field6 = value; break;
      case 7: this.field7 = value; break;
      case 8: this.field8 = value; break;
      case 9: this.field9 = value; break;
    }
  }
}

class Row {
  currentValue;
  previousValue;
  next;
}

function setUpReflector() {
  reflector.registerGetters({
    'field0': function(obj){return obj.field0},
    'field1': function(obj){return obj.field1},
    'field2': function(obj){return obj.field2},
    'field3': function(obj){return obj.field3},
    'field4': function(obj){return obj.field4},
    'field5': function(obj){return obj.field5},
    'field6': function(obj){return obj.field6},
    'field7': function(obj){return obj.field7},
    'field8': function(obj){return obj.field8},
    'field9': function(obj){return obj.field9}
  });
  reflector.registerSetters({
    'field0': function(obj, v){return obj.field0 = v},
    'field1': function(obj, v){return obj.field1 = v},
    'field2': function(obj, v){return obj.field2 = v},
    'field3': function(obj, v){return obj.field3 = v},
    'field4': function(obj, v){return obj.field4 = v},
    'field5': function(obj, v){return obj.field5 = v},
    'field6': function(obj, v){return obj.field6 = v},
    'field7': function(obj, v){return obj.field7 = v},
    'field8': function(obj, v){return obj.field8 = v},
    'field9': function(obj, v){return obj.field9 = v}
  });
}

function setUpBaseline(iterations) {
  function createRow(i) {
    var obj = new Obj();
    for (var j = 0; j < 10; ++j) {
      obj.setField(j, i);
    }

    var r = new Row();
    r.currentValue = obj;
    r.previousValue = obj;
    return r;
  }

  var head = createRow(0);
  var current = head;
  for (var i = 1; i < iterations; i++) {
    var newRow = createRow(i);
    current.next = newRow;
    current = newRow;
  }
  return head;
}

function setUpChangeDetection(changeDetection:ChangeDetection, iterations) {
  var dispatcher = new DummyDispatcher();
  var parser = new Parser(new Lexer());

  var parentProto = changeDetection.createProtoChangeDetector('parent');
  var parentCd = parentProto.instantiate(dispatcher);

  var proto = changeDetection.createProtoChangeDetector("proto");
  var astWithSource = [
    parser.parseBinding('field0', null),
    parser.parseBinding('field1', null),
    parser.parseBinding('field2', null),
    parser.parseBinding('field3', null),
    parser.parseBinding('field4', null),
    parser.parseBinding('field5', null),
    parser.parseBinding('field6', null),
    parser.parseBinding('field7', null),
    parser.parseBinding('field8', null),
    parser.parseBinding('field9', null)
  ];
  for (var j = 0; j < 10; ++j) {
    proto.addAst(astWithSource[j].ast, "memo", j);
  }

  for (var i = 0; i < iterations; ++i) {
    var obj = new Obj();
    for (var j = 0; j < 10; ++j) {
      obj.setField(j, i);
    }
    var cd = proto.instantiate(dispatcher);
    cd.hydrate(obj);
    parentCd.addChild(cd);
  }
  return parentCd;
}

export function main () {
  BrowserDomAdapter.makeCurrent();
  var numberOfChecks = getIntParameter('numberOfChecks');

  var numberOfChecksPerDetector = 10;
  var numberOfRuns = 20;
  var numberOfDetectors = numberOfChecks / numberOfChecksPerDetector / numberOfRuns;

  setUpReflector();

  // -- BASELINE
  function checkBaselineRow(r) {
    var curr = r.currentValue;
    var prev = r.previousValue;
    if (curr.field0 !== prev.field0) throw "should not happen";
    if (curr.field1 !== prev.field1) throw "should not happen";
    if (curr.field2 !== prev.field2) throw "should not happen";
    if (curr.field3 !== prev.field3) throw "should not happen";
    if (curr.field4 !== prev.field4) throw "should not happen";
    if (curr.field5 !== prev.field5) throw "should not happen";
    if (curr.field6 !== prev.field6) throw "should not happen";
    if (curr.field7 !== prev.field7) throw "should not happen";
    if (curr.field8 !== prev.field8) throw "should not happen";
    if (curr.field9 !== prev.field9) throw "should not happen";
  }
  var baselineHead = setUpBaseline(numberOfDetectors);
  function runBaselineChangeDetection(){
    var current = baselineHead;
    while (isPresent(current)) {
      checkBaselineRow(current);
      current = current.next;
    }
  }
  function baselineChangeDetection() {
    for (var i = 0; i < numberOfRuns; ++i) {
      runBaselineChangeDetection();
    }
  }
  runBaselineChangeDetection();
  bindAction('#baselineChangeDetection', baselineChangeDetection);


  // -- DYNAMIC
  var ng2DynamicChangeDetector = setUpChangeDetection(dynamicChangeDetection, numberOfDetectors);
  function ng2ChangeDetectionDynamic() {
    for(var i = 0; i < numberOfRuns; ++i) {
      ng2DynamicChangeDetector.detectChanges();
    }
  }
  ng2DynamicChangeDetector.detectChanges();
  bindAction('#ng2ChangeDetectionDynamic', ng2ChangeDetectionDynamic);


  // -- JIT
  // Reenable when we have transformers for Dart
  if (isJsObject({})) {
    var ng2JitChangeDetector = setUpChangeDetection(jitChangeDetection, numberOfDetectors);

    function ng2ChangeDetectionJit() {
      for (var i = 0; i < numberOfRuns; ++i) {
        ng2JitChangeDetector.detectChanges();
      }
    }

    ng2JitChangeDetector.detectChanges();
    bindAction('#ng2ChangeDetectionJit', ng2ChangeDetectionJit);
  } else {
    bindAction('#ng2ChangeDetectionJit', () => {});
  }
}


class DummyDispatcher extends ChangeDispatcher {
  onRecordChange(record, context) {
  }
}
