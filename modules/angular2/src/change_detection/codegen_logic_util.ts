import {ListWrapper} from 'angular2/src/facade/collection';
import {BaseException, Json} from 'angular2/src/facade/lang';
import {CodegenNameUtil} from './codegen_name_util';
import {codify, combineGeneratedStrings, rawString} from './codegen_facade';
import {ProtoRecord, RecordType} from './proto_record';

/**
 * Class responsible for providing change detection logic for chagne detector classes.
 */
export class CodegenLogicUtil {
  constructor(private _names: CodegenNameUtil, private _utilName: string) {}

  /**
   * Generates a statement which updates the local variable representing `protoRec` with the current
   * value of the record. Used by property bindings.
   */
  genPropertyBindingEvalValue(protoRec: ProtoRecord): string {
    return this.genEvalValue(protoRec, idx => this._names.getLocalName(idx),
                             this._names.getLocalsAccessorName());
  }

  /**
   * Generates a statement which updates the local variable representing `protoRec` with the current
   * value of the record. Used by event bindings.
   */
  genEventBindingEvalValue(eventRecord: any, protoRec: ProtoRecord): string {
    return this.genEvalValue(protoRec, idx => this._names.getEventLocalName(eventRecord, idx),
                             "locals");
  }

  private genEvalValue(protoRec: ProtoRecord, getLocalName: Function,
                       localsAccessor: string): string {
    var context = (protoRec.contextIndex == -1) ?
                      this._names.getDirectiveName(protoRec.directiveIndex) :
                      getLocalName(protoRec.contextIndex);
    var argString = ListWrapper.map(protoRec.args, (arg) => getLocalName(arg)).join(", ");

    var rhs: string;
    switch (protoRec.mode) {
      case RecordType.SELF:
        rhs = context;
        break;

      case RecordType.CONST:
        rhs = codify(protoRec.funcOrValue);
        break;

      case RecordType.PROPERTY_READ:
        rhs = `${context}.${protoRec.name}`;
        break;

      case RecordType.SAFE_PROPERTY:
        rhs = `${this._utilName}.isValueBlank(${context}) ? null : ${context}.${protoRec.name}`;
        break;

      case RecordType.PROPERTY_WRITE:
        rhs = `${context}.${protoRec.name} = ${getLocalName(protoRec.args[0])}`;
        break;

      case RecordType.LOCAL:
        rhs = `${localsAccessor}.get(${rawString(protoRec.name)})`;
        break;

      case RecordType.INVOKE_METHOD:
        rhs = `${context}.${protoRec.name}(${argString})`;
        break;

      case RecordType.SAFE_INVOKE_METHOD:
        rhs =
            `${this._utilName}.isValueBlank(${context}) ? null : ${context}.${protoRec.name}(${argString})`;
        break;

      case RecordType.INVOKE_CLOSURE:
        rhs = `${context}(${argString})`;
        break;

      case RecordType.PRIMITIVE_OP:
        rhs = `${this._utilName}.${protoRec.name}(${argString})`;
        break;

      case RecordType.COLLECTION_LITERAL:
        rhs = `${this._utilName}.${protoRec.name}(${argString})`;
        break;

      case RecordType.INTERPOLATE:
        rhs = this._genInterpolation(protoRec);
        break;

      case RecordType.KEYED_READ:
        rhs = `${context}[${getLocalName(protoRec.args[0])}]`;
        break;

      case RecordType.KEYED_WRITE:
        rhs = `${context}[${getLocalName(protoRec.args[0])}] = ${getLocalName(protoRec.args[1])}`;
        break;

      case RecordType.CHAIN:
        rhs = 'null';
        break;

      default:
        throw new BaseException(`Unknown operation ${protoRec.mode}`);
    }
    return `${getLocalName(protoRec.selfIndex)} = ${rhs};`;
  }


  _genInterpolation(protoRec: ProtoRecord): string {
    var iVals = [];
    for (var i = 0; i < protoRec.args.length; ++i) {
      iVals.push(codify(protoRec.fixedArgs[i]));
      iVals.push(`${this._utilName}.s(${this._names.getLocalName(protoRec.args[i])})`);
    }
    iVals.push(codify(protoRec.fixedArgs[protoRec.args.length]));
    return combineGeneratedStrings(iVals);
  }
}
