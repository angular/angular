import {isPresent, isBlank, BaseException, Type} from 'facade/src/lang';
import {List, ListWrapper, MapWrapper, StringMapWrapper} from 'facade/src/collection';
import {ContextWithVariableBindings} from './parser/context_with_variable_bindings';
import {ArrayChanges} from './array_changes';
import {KeyValueChanges} from './keyvalue_changes';
import {ProtoRecord} from './proto_change_detector';
import {ExpressionChangedAfterItHasBeenChecked} from './exceptions';
import {ChangeRecord} from './interfaces';

export var uninitialized = new Object();

export class SimpleChange {
  previousValue:any;
  currentValue:any;

  constructor(previousValue:any, currentValue:any) {
    this.previousValue = previousValue;
    this.currentValue = currentValue;
  }
}

var _simpleChangesIndex = 0;
var _simpleChanges = [
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null)
]

var _changeRecordsIndex = 0;
var _changeRecords = [
  new ChangeRecord(null, null),
  new ChangeRecord(null, null),
  new ChangeRecord(null, null),
  new ChangeRecord(null, null),
  new ChangeRecord(null, null),
  new ChangeRecord(null, null),
  new ChangeRecord(null, null),
  new ChangeRecord(null, null),
  new ChangeRecord(null, null),
  new ChangeRecord(null, null),
  new ChangeRecord(null, null),
  new ChangeRecord(null, null),
  new ChangeRecord(null, null),
  new ChangeRecord(null, null),
  new ChangeRecord(null, null),
  new ChangeRecord(null, null),
  new ChangeRecord(null, null),
  new ChangeRecord(null, null),
  new ChangeRecord(null, null),
  new ChangeRecord(null, null)
]

function _simpleChange(previousValue, currentValue) {
  var index = _simpleChangesIndex++ % 20;
  var s = _simpleChanges[index];
  s.previousValue = previousValue;
  s.currentValue = currentValue;
  return s;
}

function _changeRecord(bindingMemento, change) {
  var index = _changeRecordsIndex++ % 20;
  var s = _changeRecords[index];
  s.bindingMemento = bindingMemento;
  s.change = change;
  return s;
}

var _singleElementList = [null];

export class ChangeDetectionUtil {
  static unitialized() {
    return uninitialized;
  }

  static arrayFn0()                                   { return []; }
  static arrayFn1(a1)                                 { return [a1]; }
  static arrayFn2(a1, a2)                             { return [a1, a2]; }
  static arrayFn3(a1, a2, a3)                         { return [a1, a2, a3]; }
  static arrayFn4(a1, a2, a3, a4)                     { return [a1, a2, a3, a4]; }
  static arrayFn5(a1, a2, a3, a4, a5)                 { return [a1, a2, a3, a4, a5]; }
  static arrayFn6(a1, a2, a3, a4, a5, a6)             { return [a1, a2, a3, a4, a5, a6]; }
  static arrayFn7(a1, a2, a3, a4, a5, a6, a7)         { return [a1, a2, a3, a4, a5, a6, a7]; }
  static arrayFn8(a1, a2, a3, a4, a5, a6, a7, a8)     { return [a1, a2, a3, a4, a5, a6, a7, a8]; }
  static arrayFn9(a1, a2, a3, a4, a5, a6, a7, a8, a9) { return [a1, a2, a3, a4, a5, a6, a7, a8, a9]; }

  static operation_negate(value)                       {return !value;}
  static operation_add(left, right)                    {return left + right;}
  static operation_subtract(left, right)               {return left - right;}
  static operation_multiply(left, right)               {return left * right;}
  static operation_divide(left, right)                 {return left / right;}
  static operation_remainder(left, right)              {return left % right;}
  static operation_equals(left, right)                 {return left == right;}
  static operation_not_equals(left, right)             {return left != right;}
  static operation_less_then(left, right)              {return left < right;}
  static operation_greater_then(left, right)           {return left > right;}
  static operation_less_or_equals_then(left, right)    {return left <= right;}
  static operation_greater_or_equals_then(left, right) {return left >= right;}
  static operation_logical_and(left, right)            {return left && right;}
  static operation_logical_or(left, right)             {return left || right;}
  static cond(cond, trueVal, falseVal)                 {return cond ? trueVal : falseVal;}

  static mapFn(keys:List) {
    function buildMap(values) {
      var res = StringMapWrapper.create();
      for(var i = 0; i < keys.length; ++i) {
        StringMapWrapper.set(res, keys[i], values[i]);
      }
      return res;
    }

    switch (keys.length) {
      case 0: return () => [];
      case 1: return (a1) => buildMap([a1]);
      case 2: return (a1, a2) => buildMap([a1, a2]);
      case 3: return (a1, a2, a3) => buildMap([a1, a2, a3]);
      case 4: return (a1, a2, a3, a4) => buildMap([a1, a2, a3, a4]);
      case 5: return (a1, a2, a3, a4, a5) => buildMap([a1, a2, a3, a4, a5]);
      case 6: return (a1, a2, a3, a4, a5, a6) => buildMap([a1, a2, a3, a4, a5, a6]);
      case 7: return (a1, a2, a3, a4, a5, a6, a7) => buildMap([a1, a2, a3, a4, a5, a6, a7]);
      case 8: return (a1, a2, a3, a4, a5, a6, a7, a8) => buildMap([a1, a2, a3, a4, a5, a6, a7, a8]);
      case 9: return (a1, a2, a3, a4, a5, a6, a7, a8, a9) => buildMap([a1, a2, a3, a4, a5, a6, a7, a8, a9]);
      default: throw new BaseException(`Does not support literal maps with more than 9 elements`);
    }
  }

  static keyedAccess(obj, args) {
    return obj[args[0]];
  }

  static structuralCheck(self, context) {
    if (isBlank(self) || self === uninitialized) {
      if (ArrayChanges.supports(context)) {
        self = new ArrayChanges();
      } else if (KeyValueChanges.supports(context)) {
        self = new KeyValueChanges();
      }
    }

    if (isBlank(context) || context === uninitialized) {
      return new SimpleChange(null, null);

    } else {
      if (ArrayChanges.supports(context)) {

        if (self.check(context)) {
          return new SimpleChange(null, self); // TODO: don't wrap and return self instead
        } else {
          return null;
        }

      } else if (KeyValueChanges.supports(context)) {

        if (self.check(context)) {
          return new SimpleChange(null, self); // TODO: don't wrap and return self instead
        } else {
          return null;
        }

      } else {
        throw new BaseException(`Unsupported type (${context})`);
      }
    }
  }

  static findContext(name:string, c){
    while (c instanceof ContextWithVariableBindings) {
      if (c.hasBinding(name)) {
        return c;
      }
      c = c.parent;
    }
    return c;
  }

  static throwOnChange(proto:ProtoRecord, change) {
    throw new ExpressionChangedAfterItHasBeenChecked(proto, change);
  }

  static simpleChange(previousValue:any, currentValue:any):SimpleChange {
    return _simpleChange(previousValue, currentValue);
  }

  static changeRecord(memento:any, change:any):ChangeRecord {
    return _changeRecord(memento, change);
  }

  static simpleChangeRecord(memento:any, previousValue:any, currentValue:any):ChangeRecord {
    return _changeRecord(memento, _simpleChange(previousValue, currentValue));
  }

  static addRecord(updatedRecords:List, changeRecord:ChangeRecord):List {
    if (isBlank(updatedRecords)) {
      updatedRecords = _singleElementList;
      updatedRecords[0] = changeRecord;

    } else if (updatedRecords === _singleElementList) {
      updatedRecords = [_singleElementList[0], changeRecord];

    } else {
      ListWrapper.push(updatedRecords, changeRecord);
    }
    return updatedRecords;
  }
}