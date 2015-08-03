import {ListWrapper} from 'angular2/src/facade/collection';
import {BaseException, Json} from 'angular2/src/facade/lang';
import {CodegenNameUtil} from './codegen_name_util';
import {codify, combineGeneratedStrings} from './codegen_facade';
import {ProtoRecord, RecordType} from './proto_record';

/**
 * Class responsible for providing change detection logic for chagne detector classes.
 */
export class CodegenLogicUtil {
  constructor(private _names: CodegenNameUtil, private _utilName: string) {}

  /**
   * Generates a statement which updates the local variable representing `protoRec` with the current
   * value of the record.
   */
  genUpdateCurrentValue(protoRec: ProtoRecord): string {
    var context = (protoRec.contextIndex == -1) ?
                      this._names.getDirectiveName(protoRec.directiveIndex) :
                      this._names.getLocalName(protoRec.contextIndex);
    var argString =
        ListWrapper.map(protoRec.args, (arg) => this._names.getLocalName(arg)).join(", ");

    var rhs: string;
    switch (protoRec.mode) {
      case RecordType.SELF:
        rhs = context;
        break;

      case RecordType.CONST:
        rhs = codify(protoRec.funcOrValue);
        break;

      case RecordType.PROPERTY:
        rhs = `${context}.${protoRec.name}`;
        break;

      case RecordType.SAFE_PROPERTY:
        rhs = `${this._utilName}.isValueBlank(${context}) ? null : ${context}.${protoRec.name}`;
        break;

      case RecordType.LOCAL:
        rhs = `${this._names.getLocalsAccessorName()}.get('${protoRec.name}')`;
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

      case RecordType.KEYED_ACCESS:
        rhs = `${context}[${this._names.getLocalName(protoRec.args[0])}]`;
        break;

      default:
        throw new BaseException(`Unknown operation ${protoRec.mode}`);
    }
    return `${this._names.getLocalName(protoRec.selfIndex)} = ${rhs};`;
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
