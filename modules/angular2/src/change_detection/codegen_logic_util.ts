import {ListWrapper} from 'angular2/src/facade/collection';
import {BaseException, Json, StringWrapper, isPresent, isBlank} from 'angular2/src/facade/lang';
import {CodegenNameUtil} from './codegen_name_util';
import {codify, combineGeneratedStrings, rawString} from './codegen_facade';
import {ProtoRecord, RecordType} from './proto_record';
import {BindingTarget} from './binding_record';
import {DirectiveRecord} from './directive_record';

/**
 * This is an experimental feature. Works only in Dart.
 */
const ON_PUSH_OBSERVE = "ON_PUSH_OBSERVE";

/**
 * Class responsible for providing change detection logic for chagne detector classes.
 */
export class CodegenLogicUtil {
  constructor(private _names: CodegenNameUtil, private _utilName: string,
              private _changeDetection: string) {}

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
        rhs = this._observe(`${context}.${protoRec.name}`, protoRec);
        break;

      case RecordType.SAFE_PROPERTY:
        var read = this._observe(`${context}.${protoRec.name}`, protoRec);
        rhs =
            `${this._utilName}.isValueBlank(${context}) ? null : ${this._observe(read, protoRec)}`;
        break;

      case RecordType.PROPERTY_WRITE:
        rhs = `${context}.${protoRec.name} = ${getLocalName(protoRec.args[0])}`;
        break;

      case RecordType.LOCAL:
        rhs = this._observe(`${localsAccessor}.get(${rawString(protoRec.name)})`, protoRec);
        break;

      case RecordType.INVOKE_METHOD:
        rhs = this._observe(`${context}.${protoRec.name}(${argString})`, protoRec);
        break;

      case RecordType.SAFE_INVOKE_METHOD:
        var invoke = `${context}.${protoRec.name}(${argString})`;
        rhs =
            `${this._utilName}.isValueBlank(${context}) ? null : ${this._observe(invoke, protoRec)}`;
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
        rhs = this._observe(`${context}[${getLocalName(protoRec.args[0])}]`, protoRec);
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

  _observe(exp: string, rec: ProtoRecord): string {
    // This is an experimental feature. Works only in Dart.
    if (StringWrapper.equals(this._changeDetection, ON_PUSH_OBSERVE)) {
      return `this.observe(${exp}, ${rec.selfIndex})`;
    } else {
      return exp;
    }
  }

  genPropertyBindingTargets(propertyBindingTargets: BindingTarget[],
                            genDebugInfo: boolean): string {
    var bs = propertyBindingTargets.map(b => {
      if (isBlank(b)) return "null";

      var debug = genDebugInfo ? codify(b.debug) : "null";
      return `${this._utilName}.bindingTarget(${codify(b.mode)}, ${b.elementIndex}, ${codify(b.name)}, ${codify(b.unit)}, ${debug})`;
    });
    return `[${bs.join(", ")}]`;
  }

  genDirectiveIndices(directiveRecords: DirectiveRecord[]): string {
    var bs = directiveRecords.map(
        b =>
            `${this._utilName}.directiveIndex(${b.directiveIndex.elementIndex}, ${b.directiveIndex.directiveIndex})`);
    return `[${bs.join(", ")}]`;
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

  genHydrateDetectors(directiveRecords: DirectiveRecord[]): string {
    var res = [];
    for (var i = 0; i < directiveRecords.length; ++i) {
      var r = directiveRecords[i];
      if (!r.isDefaultChangeDetection()) {
        res.push(
            `${this._names.getDetectorName(r.directiveIndex)} = this.getDetectorFor(directives, ${i});`);
      }
    }
    return res.join("\n");
  }
}
