import {ListWrapper, MapWrapper} from 'facade/collection';
import {Parser} from 'change_detection/parser/parser';
import {Lexer} from 'change_detection/parser/lexer';
import {reflector} from 'reflection/reflection';
import {isPresent} from 'facade/lang';
import {benchmark, benchmarkStep} from 'benchpress/benchpress';

import {
  ChangeDetector,
  ProtoRecordRange,
  WatchGroupDispatcher,
} from 'change_detection/change_detector';


var ITERATIONS = 200000;

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
  previousValue;
  obj;
  getter;
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

function setUpBaseline() {
  function createRow(i) {
    var obj = new Obj();
    var index = i % 10;
    obj.setField(index, i);

    var r = new Row();
    r.obj = obj;
    r.previousValue = i;
    r.getter = reflector.getter(`field${index}`);
    return r;
  }

  var head = createRow(0);
  var current = head;
  for (var i = 1; i < ITERATIONS; i++) {
    var newRow = createRow(i);
    current.next = newRow;
    current = newRow;
  }
  return head;
}

function setUpChangeDetection() {
  var dispatcher = new DummyDispatcher();
  var parser = new Parser(new Lexer());

  var parentProto = new ProtoRecordRange();
  var parentRange = parentProto.instantiate(dispatcher, MapWrapper.create());

  var astWithSource = [
    parser.parseBinding('field0'),
    parser.parseBinding('field1'),
    parser.parseBinding('field2'),
    parser.parseBinding('field3'),
    parser.parseBinding('field4'),
    parser.parseBinding('field5'),
    parser.parseBinding('field6'),
    parser.parseBinding('field7'),
    parser.parseBinding('field8'),
    parser.parseBinding('field9')
  ];

  function proto(i) {
    var prr = new ProtoRecordRange();
    prr.addRecordsFromAST(astWithSource[i % 10].ast, "memo", i, false);
    return prr;
  }

  var prr = [
    proto(0),
    proto(1),
    proto(2),
    proto(3),
    proto(4),
    proto(5),
    proto(6),
    proto(7),
    proto(8),
    proto(9)
  ];

  for (var i = 0; i < ITERATIONS; ++i) {
    var obj = new Obj();
    var index = i % 10;
    obj.setField(index, i);

    var rr = prr[index].instantiate(dispatcher,  null);
    rr.setContext(obj);

    parentRange.addRange(rr);
  }

  return new ChangeDetector(parentRange);
}

export function main () {
  setUpReflector();

  benchmark(`Baseline`, function () {
    var head = setUpBaseline();

    benchmarkStep('run', function () {
      var current = head;
      while (isPresent(current)) {
        if (current.getter(current.obj) !== current.previousValue) {
          throw "should not happen";
        }
        current = current.next;
      }
    });
  });

  benchmark(`Change Detection`, function() {
    var cd = setUpChangeDetection();

    benchmarkStep('run', function() {
      cd.detectChanges();
    });
  });
}


class DummyDispatcher extends WatchGroupDispatcher {
  onRecordChange(record, context) {
  }
}