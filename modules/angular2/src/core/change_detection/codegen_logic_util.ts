import {IS_DART, Json, StringWrapper, isPresent, isBlank} from 'angular2/src/facade/lang';
import {CodegenNameUtil} from './codegen_name_util';
import {codify, combineGeneratedStrings, rawString} from './codegen_facade';
import {ProtoRecord, RecordType} from './proto_record';
import {BindingTarget} from './binding_record';
import {DirectiveRecord} from './directive_record';
import {ChangeDetectionStrategy} from './constants';
import {BaseException} from 'angular2/src/facade/exceptions';

/**
 * Class responsible for providing change detection logic for change detector classes.
 */
export class CodegenLogicUtil {
  constructor(private _names: CodegenNameUtil, private _utilName: string,
              private _changeDetectorStateName: string,
              private _changeDetection: ChangeDetectionStrategy) {}

  /**
   * Generates a statement which updates the local variable representing `protoRec` with the current
   * value of the record. Used by property bindings.
   */
  genPropertyBindingEvalValue(protoRec: ProtoRecord): string {
    return this._genEvalValue(protoRec, idx => this._names.getLocalName(idx),
                              this._names.getLocalsAccessorName());
  }

  /**
   * Generates a statement which updates the local variable representing `protoRec` with the current
   * value of the record. Used by event bindings.
   */
  genEventBindingEvalValue(eventRecord: any, protoRec: ProtoRecord): string {
    return this._genEvalValue(protoRec, idx => this._names.getEventLocalName(eventRecord, idx),
                              "locals");
  }

  private _genEvalValue(protoRec: ProtoRecord, getLocalName: Function,
                        localsAccessor: string): string {
    var context = (protoRec.contextIndex == -1) ?
                      this._names.getDirectiveName(protoRec.directiveIndex) :
                      getLocalName(protoRec.contextIndex);
    var argString = protoRec.args.map(arg => getLocalName(arg)).join(", ");

    var rhs: string;
    switch (protoRec.mode) {
      case RecordType.Self:
        rhs = context;
        break;

      case RecordType.Const:
        rhs = codify(protoRec.funcOrValue);
        break;

      case RecordType.PropertyRead:
        rhs = this._observe(`${context}.${protoRec.name}`, protoRec);
        break;

      case RecordType.SafeProperty:
        var read = this._observe(`${context}.${protoRec.name}`, protoRec);
        rhs =
            `${this._utilName}.isValueBlank(${context}) ? null : ${this._observe(read, protoRec)}`;
        break;

      case RecordType.PropertyWrite:
        rhs = `${context}.${protoRec.name} = ${getLocalName(protoRec.args[0])}`;
        break;

      case RecordType.Local:
        rhs = this._observe(`${localsAccessor}.get(${rawString(protoRec.name)})`, protoRec);
        break;

      case RecordType.InvokeMethod:
        rhs = this._observe(`${context}.${protoRec.name}(${argString})`, protoRec);
        break;

      case RecordType.SafeMethodInvoke:
        var invoke = `${context}.${protoRec.name}(${argString})`;
        rhs =
            `${this._utilName}.isValueBlank(${context}) ? null : ${this._observe(invoke, protoRec)}`;
        break;

      case RecordType.InvokeClosure:
        rhs = `${context}(${argString})`;
        break;

      case RecordType.PrimitiveOp:
        rhs = `${this._utilName}.${protoRec.name}(${argString})`;
        break;

      case RecordType.CollectionLiteral:
        rhs = `${this._utilName}.${protoRec.name}(${argString})`;
        break;

      case RecordType.Interpolate:
        rhs = this._genInterpolation(protoRec);
        break;

      case RecordType.KeyedRead:
        rhs = this._observe(`${context}[${getLocalName(protoRec.args[0])}]`, protoRec);
        break;

      case RecordType.KeyedWrite:
        rhs = `${context}[${getLocalName(protoRec.args[0])}] = ${getLocalName(protoRec.args[1])}`;
        break;

      case RecordType.Chain:
        rhs = `${getLocalName(protoRec.args[protoRec.args.length - 1])}`;
        break;

      default:
        throw new BaseException(`Unknown operation ${protoRec.mode}`);
    }
    return `${getLocalName(protoRec.selfIndex)} = ${rhs};`;
  }

  /** @internal */
  _observe(exp: string, rec: ProtoRecord): string {
    // This is an experimental feature. Works only in Dart.
    if (this._changeDetection === ChangeDetectionStrategy.OnPushObserve) {
      return `this.observeValue(${exp}, ${rec.selfIndex})`;
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

  /** @internal */
  _genInterpolation(protoRec: ProtoRecord): string {
    var iVals = [];
    for (var i = 0; i < protoRec.args.length; ++i) {
      iVals.push(codify(protoRec.fixedArgs[i]));
      iVals.push(`${this._utilName}.s(${this._names.getLocalName(protoRec.args[i])})`);
    }
    iVals.push(codify(protoRec.fixedArgs[protoRec.args.length]));
    return combineGeneratedStrings(iVals);
  }

  genHydrateDirectives(directiveRecords: DirectiveRecord[]): string {
    var res = [];
    var outputCount = 0;
    for (var i = 0; i < directiveRecords.length; ++i) {
      var r = directiveRecords[i];
      var dirVarName = this._names.getDirectiveName(r.directiveIndex);
      res.push(`${dirVarName} = ${this._genReadDirective(i)};`);
      if (isPresent(r.outputs)) {
        r.outputs.forEach(output => {
          var eventHandlerExpr = this._genEventHandler(r.directiveIndex.elementIndex, output[1]);
          var statementStart =
              `this.outputSubscriptions[${outputCount++}] = ${dirVarName}.${output[0]}`;
          if (IS_DART) {
            res.push(`${statementStart}.listen(${eventHandlerExpr});`);
          } else {
            res.push(`${statementStart}.subscribe({next: ${eventHandlerExpr}});`);
          }
        });
      }
    }
    if (outputCount > 0) {
      var statementStart = 'this.outputSubscriptions';
      if (IS_DART) {
        res.unshift(`${statementStart} = new List(${outputCount});`);
      } else {
        res.unshift(`${statementStart} = new Array(${outputCount});`);
      }
    }
    return res.join("\n");
  }

  genDirectivesOnDestroy(directiveRecords: DirectiveRecord[]): string {
    var res = [];
    for (var i = 0; i < directiveRecords.length; ++i) {
      var r = directiveRecords[i];
      if (r.callOnDestroy) {
        var dirVarName = this._names.getDirectiveName(r.directiveIndex);
        res.push(`${dirVarName}.ngOnDestroy();`);
      }
    }
    return res.join("\n");
  }

  private _genEventHandler(boundElementIndex: number, eventName: string): string {
    if (IS_DART) {
      return `(event) => this.handleEvent('${eventName}', ${boundElementIndex}, event)`;
    } else {
      return `(function(event) { return this.handleEvent('${eventName}', ${boundElementIndex}, event); }).bind(this)`;
    }
  }

  private _genReadDirective(index: number) {
    var directiveExpr = `this.getDirectiveFor(directives, ${index})`;
    // This is an experimental feature. Works only in Dart.
    if (this._changeDetection === ChangeDetectionStrategy.OnPushObserve) {
      return `this.observeDirective(${directiveExpr}, ${index})`;
    } else {
      return directiveExpr;
    }
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

  genContentLifecycleCallbacks(directiveRecords: DirectiveRecord[]): string[] {
    var res = [];
    var eq = IS_DART ? '==' : '===';
    // NOTE(kegluneq): Order is important!
    for (var i = directiveRecords.length - 1; i >= 0; --i) {
      var dir = directiveRecords[i];
      if (dir.callAfterContentInit) {
        res.push(
            `if(${this._names.getStateName()} ${eq} ${this._changeDetectorStateName}.NeverChecked) ${this._names.getDirectiveName(dir.directiveIndex)}.ngAfterContentInit();`);
      }

      if (dir.callAfterContentChecked) {
        res.push(`${this._names.getDirectiveName(dir.directiveIndex)}.ngAfterContentChecked();`);
      }
    }
    return res;
  }

  genViewLifecycleCallbacks(directiveRecords: DirectiveRecord[]): string[] {
    var res = [];
    var eq = IS_DART ? '==' : '===';
    // NOTE(kegluneq): Order is important!
    for (var i = directiveRecords.length - 1; i >= 0; --i) {
      var dir = directiveRecords[i];
      if (dir.callAfterViewInit) {
        res.push(
            `if(${this._names.getStateName()} ${eq} ${this._changeDetectorStateName}.NeverChecked) ${this._names.getDirectiveName(dir.directiveIndex)}.ngAfterViewInit();`);
      }

      if (dir.callAfterViewChecked) {
        res.push(`${this._names.getDirectiveName(dir.directiveIndex)}.ngAfterViewChecked();`);
      }
    }
    return res;
  }
}
