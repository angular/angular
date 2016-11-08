/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';

import {CompileDirectiveMetadata, CompileDirectiveSummary, CompileIdentifierMetadata} from './compile_metadata';
import {createCheckBindingField, createCheckBindingStmt} from './compiler_util/binding_util';
import {EventHandlerVars, convertActionBinding, convertPropertyBinding} from './compiler_util/expression_converter';
import {triggerAnimation, writeToRenderer} from './compiler_util/render_util';
import {CompilerConfig} from './config';
import {Parser} from './expression_parser/parser';
import {Identifiers, resolveIdentifier} from './identifiers';
import {DEFAULT_INTERPOLATION_CONFIG} from './ml_parser/interpolation_config';
import {ClassBuilder, createClassStmt} from './output/class_builder';
import * as o from './output/output_ast';
import {ParseError, ParseErrorLevel, ParseLocation, ParseSourceFile, ParseSourceSpan} from './parse_util';
import {Console, LifecycleHooks, isDefaultChangeDetectionStrategy} from './private_import_core';
import {ElementSchemaRegistry} from './schema/element_schema_registry';
import {BindingParser} from './template_parser/binding_parser';
import {BoundElementPropertyAst, BoundEventAst} from './template_parser/template_ast';

export class DirectiveWrapperCompileResult {
  constructor(public statements: o.Statement[], public dirWrapperClassVar: string) {}
}

const CONTEXT_FIELD_NAME = 'context';
const CHANGES_FIELD_NAME = '_changes';
const CHANGED_FIELD_NAME = '_changed';
const EVENT_HANDLER_FIELD_NAME = '_eventHandler';

const CURR_VALUE_VAR = o.variable('currValue');
const THROW_ON_CHANGE_VAR = o.variable('throwOnChange');
const FORCE_UPDATE_VAR = o.variable('forceUpdate');
const VIEW_VAR = o.variable('view');
const COMPONENT_VIEW_VAR = o.variable('componentView');
const RENDER_EL_VAR = o.variable('el');
const EVENT_NAME_VAR = o.variable('eventName');

const RESET_CHANGES_STMT = o.THIS_EXPR.prop(CHANGES_FIELD_NAME).set(o.literalMap([])).toStmt();

/**
 * We generate directive wrappers to prevent code bloat when a directive is used.
 * A directive wrapper encapsulates
 * the dirty checking for `@Input`, the handling of `@HostListener` / `@HostBinding`
 * and calling the lifecyclehooks `ngOnInit`, `ngOnChanges`, `ngDoCheck`.
 *
 * So far, only `@Input` and the lifecycle hooks have been implemented.
 */
@Injectable()
export class DirectiveWrapperCompiler {
  static dirWrapperClassName(id: CompileIdentifierMetadata) { return `Wrapper_${id.name}`; }

  constructor(
      private compilerConfig: CompilerConfig, private _exprParser: Parser,
      private _schemaRegistry: ElementSchemaRegistry, private _console: Console) {}

  compile(dirMeta: CompileDirectiveMetadata): DirectiveWrapperCompileResult {
    const hostParseResult = parseHostBindings(dirMeta, this._exprParser, this._schemaRegistry);
    reportParseErrors(hostParseResult.errors, this._console);

    const builder = new DirectiveWrapperBuilder(this.compilerConfig, dirMeta);
    Object.keys(dirMeta.inputs).forEach((inputFieldName) => {
      addCheckInputMethod(inputFieldName, builder);
    });
    addNgDoCheckMethod(builder);
    addCheckHostMethod(hostParseResult.hostProps, builder);
    addHandleEventMethod(hostParseResult.hostListeners, builder);
    addSubscribeMethod(dirMeta, builder);

    const classStmt = builder.build();
    return new DirectiveWrapperCompileResult([classStmt], classStmt.name);
  }
}

class DirectiveWrapperBuilder implements ClassBuilder {
  fields: o.ClassField[] = [];
  getters: o.ClassGetter[] = [];
  methods: o.ClassMethod[] = [];
  ctorStmts: o.Statement[] = [];
  detachStmts: o.Statement[] = [];
  destroyStmts: o.Statement[] = [];

  genChanges: boolean;
  ngOnChanges: boolean;
  ngOnInit: boolean;
  ngDoCheck: boolean;
  ngOnDestroy: boolean;

  constructor(public compilerConfig: CompilerConfig, public dirMeta: CompileDirectiveMetadata) {
    const dirLifecycleHooks = dirMeta.type.lifecycleHooks;
    this.genChanges = dirLifecycleHooks.indexOf(LifecycleHooks.OnChanges) !== -1 ||
        this.compilerConfig.logBindingUpdate;
    this.ngOnChanges = dirLifecycleHooks.indexOf(LifecycleHooks.OnChanges) !== -1;
    this.ngOnInit = dirLifecycleHooks.indexOf(LifecycleHooks.OnInit) !== -1;
    this.ngDoCheck = dirLifecycleHooks.indexOf(LifecycleHooks.DoCheck) !== -1;
    this.ngOnDestroy = dirLifecycleHooks.indexOf(LifecycleHooks.OnDestroy) !== -1;
    if (this.ngOnDestroy) {
      this.destroyStmts.push(
          o.THIS_EXPR.prop(CONTEXT_FIELD_NAME).callMethod('ngOnDestroy', []).toStmt());
    }
  }

  build(): o.ClassStmt {
    const dirDepParamNames: string[] = [];
    for (let i = 0; i < this.dirMeta.type.diDeps.length; i++) {
      dirDepParamNames.push(`p${i}`);
    }

    const methods = [
      new o.ClassMethod(
          'ngOnDetach',
          [
            new o.FnParam(
                VIEW_VAR.name,
                o.importType(resolveIdentifier(Identifiers.AppView), [o.DYNAMIC_TYPE])),
            new o.FnParam(
                COMPONENT_VIEW_VAR.name,
                o.importType(resolveIdentifier(Identifiers.AppView), [o.DYNAMIC_TYPE])),
            new o.FnParam(RENDER_EL_VAR.name, o.DYNAMIC_TYPE),
          ],
          this.detachStmts),
      new o.ClassMethod('ngOnDestroy', [], this.destroyStmts),
    ];


    const fields: o.ClassField[] = [
      new o.ClassField(EVENT_HANDLER_FIELD_NAME, o.FUNCTION_TYPE, [o.StmtModifier.Private]),
      new o.ClassField(CONTEXT_FIELD_NAME, o.importType(this.dirMeta.type)),
      new o.ClassField(CHANGED_FIELD_NAME, o.BOOL_TYPE, [o.StmtModifier.Private]),
    ];
    const ctorStmts: o.Statement[] =
        [o.THIS_EXPR.prop(CHANGED_FIELD_NAME).set(o.literal(false)).toStmt()];
    if (this.genChanges) {
      fields.push(new o.ClassField(
          CHANGES_FIELD_NAME, new o.MapType(o.DYNAMIC_TYPE), [o.StmtModifier.Private]));
      ctorStmts.push(RESET_CHANGES_STMT);
    }

    ctorStmts.push(
        o.THIS_EXPR.prop(CONTEXT_FIELD_NAME)
            .set(o.importExpr(this.dirMeta.type)
                     .instantiate(dirDepParamNames.map((paramName) => o.variable(paramName))))
            .toStmt());

    return createClassStmt({
      name: DirectiveWrapperCompiler.dirWrapperClassName(this.dirMeta.type),
      ctorParams: dirDepParamNames.map((paramName) => new o.FnParam(paramName, o.DYNAMIC_TYPE)),
      builders: [{fields, ctorStmts, methods}, this]
    });
  }
}

function addNgDoCheckMethod(builder: DirectiveWrapperBuilder) {
  const changedVar = o.variable('changed');
  const stmts: o.Statement[] = [
    changedVar.set(o.THIS_EXPR.prop(CHANGED_FIELD_NAME)).toDeclStmt(),
    o.THIS_EXPR.prop(CHANGED_FIELD_NAME).set(o.literal(false)).toStmt(),
  ];
  const lifecycleStmts: o.Statement[] = [];

  if (builder.genChanges) {
    const onChangesStmts: o.Statement[] = [];
    if (builder.ngOnChanges) {
      onChangesStmts.push(o.THIS_EXPR.prop(CONTEXT_FIELD_NAME)
                              .callMethod('ngOnChanges', [o.THIS_EXPR.prop(CHANGES_FIELD_NAME)])
                              .toStmt());
    }
    if (builder.compilerConfig.logBindingUpdate) {
      onChangesStmts.push(
          o.importExpr(resolveIdentifier(Identifiers.setBindingDebugInfoForChanges))
              .callFn(
                  [VIEW_VAR.prop('renderer'), RENDER_EL_VAR, o.THIS_EXPR.prop(CHANGES_FIELD_NAME)])
              .toStmt());
    }
    onChangesStmts.push(RESET_CHANGES_STMT);
    lifecycleStmts.push(new o.IfStmt(changedVar, onChangesStmts));
  }

  if (builder.ngOnInit) {
    lifecycleStmts.push(new o.IfStmt(
        VIEW_VAR.prop('numberOfChecks').identical(new o.LiteralExpr(0)),
        [o.THIS_EXPR.prop(CONTEXT_FIELD_NAME).callMethod('ngOnInit', []).toStmt()]));
  }
  if (builder.ngDoCheck) {
    lifecycleStmts.push(o.THIS_EXPR.prop(CONTEXT_FIELD_NAME).callMethod('ngDoCheck', []).toStmt());
  }
  if (lifecycleStmts.length > 0) {
    stmts.push(new o.IfStmt(o.not(THROW_ON_CHANGE_VAR), lifecycleStmts));
  }
  stmts.push(new o.ReturnStatement(changedVar));

  builder.methods.push(new o.ClassMethod(
      'ngDoCheck',
      [
        new o.FnParam(
            VIEW_VAR.name, o.importType(resolveIdentifier(Identifiers.AppView), [o.DYNAMIC_TYPE])),
        new o.FnParam(RENDER_EL_VAR.name, o.DYNAMIC_TYPE),
        new o.FnParam(THROW_ON_CHANGE_VAR.name, o.BOOL_TYPE),
      ],
      stmts, o.BOOL_TYPE));
}

function addCheckInputMethod(input: string, builder: DirectiveWrapperBuilder) {
  const field = createCheckBindingField(builder);
  var onChangeStatements: o.Statement[] = [
    o.THIS_EXPR.prop(CHANGED_FIELD_NAME).set(o.literal(true)).toStmt(),
    o.THIS_EXPR.prop(CONTEXT_FIELD_NAME).prop(input).set(CURR_VALUE_VAR).toStmt(),
  ];
  if (builder.genChanges) {
    onChangeStatements.push(o.THIS_EXPR.prop(CHANGES_FIELD_NAME)
                                .key(o.literal(input))
                                .set(o.importExpr(resolveIdentifier(Identifiers.SimpleChange))
                                         .instantiate([field.expression, CURR_VALUE_VAR]))
                                .toStmt());
  }

  var methodBody: o.Statement[] = createCheckBindingStmt(
      {currValExpr: CURR_VALUE_VAR, forceUpdate: FORCE_UPDATE_VAR, stmts: []}, field.expression,
      THROW_ON_CHANGE_VAR, onChangeStatements);
  builder.methods.push(new o.ClassMethod(
      `check_${input}`,
      [
        new o.FnParam(CURR_VALUE_VAR.name, o.DYNAMIC_TYPE),
        new o.FnParam(THROW_ON_CHANGE_VAR.name, o.BOOL_TYPE),
        new o.FnParam(FORCE_UPDATE_VAR.name, o.BOOL_TYPE),
      ],
      methodBody));
}

function addCheckHostMethod(
    hostProps: BoundElementPropertyAst[], builder: DirectiveWrapperBuilder) {
  const stmts: o.Statement[] = [];
  const methodParams: o.FnParam[] = [
    new o.FnParam(
        VIEW_VAR.name, o.importType(resolveIdentifier(Identifiers.AppView), [o.DYNAMIC_TYPE])),
    new o.FnParam(
        COMPONENT_VIEW_VAR.name,
        o.importType(resolveIdentifier(Identifiers.AppView), [o.DYNAMIC_TYPE])),
    new o.FnParam(RENDER_EL_VAR.name, o.DYNAMIC_TYPE),
    new o.FnParam(THROW_ON_CHANGE_VAR.name, o.BOOL_TYPE),
  ];
  hostProps.forEach((hostProp, hostPropIdx) => {
    const field = createCheckBindingField(builder);
    const evalResult = convertPropertyBinding(
        builder, null, o.THIS_EXPR.prop(CONTEXT_FIELD_NAME), hostProp.value, field.bindingId);
    if (!evalResult) {
      return;
    }
    let securityContextExpr: o.ReadVarExpr;
    if (hostProp.needsRuntimeSecurityContext) {
      securityContextExpr = o.variable(`secCtx_${methodParams.length}`);
      methodParams.push(new o.FnParam(
          securityContextExpr.name, o.importType(resolveIdentifier(Identifiers.SecurityContext))));
    }
    let checkBindingStmts: o.Statement[];
    if (hostProp.isAnimation) {
      const {updateStmts, detachStmts} = triggerAnimation(
          VIEW_VAR, COMPONENT_VIEW_VAR, hostProp,
          o.THIS_EXPR.prop(EVENT_HANDLER_FIELD_NAME)
              .or(o.importExpr(resolveIdentifier(Identifiers.noop))),
          RENDER_EL_VAR, evalResult.currValExpr, field.expression);
      checkBindingStmts = updateStmts;
      builder.detachStmts.push(...detachStmts);
    } else {
      checkBindingStmts = writeToRenderer(
          VIEW_VAR, hostProp, RENDER_EL_VAR, evalResult.currValExpr,
          builder.compilerConfig.logBindingUpdate, securityContextExpr);
    }

    stmts.push(...createCheckBindingStmt(
        evalResult, field.expression, THROW_ON_CHANGE_VAR, checkBindingStmts));
  });
  builder.methods.push(new o.ClassMethod('checkHost', methodParams, stmts));
}

function addHandleEventMethod(hostListeners: BoundEventAst[], builder: DirectiveWrapperBuilder) {
  const resultVar = o.variable(`result`);
  const actionStmts: o.Statement[] = [resultVar.set(o.literal(true)).toDeclStmt(o.BOOL_TYPE)];
  hostListeners.forEach((hostListener, eventIdx) => {
    const evalResult = convertActionBinding(
        builder, null, o.THIS_EXPR.prop(CONTEXT_FIELD_NAME), hostListener.handler,
        `sub_${eventIdx}`);
    const trueStmts = evalResult.stmts;
    if (evalResult.preventDefault) {
      trueStmts.push(resultVar.set(evalResult.preventDefault.and(resultVar)).toStmt());
    }
    // TODO(tbosch): convert this into a `switch` once our OutputAst supports it.
    actionStmts.push(
        new o.IfStmt(EVENT_NAME_VAR.equals(o.literal(hostListener.fullName)), trueStmts));
  });
  actionStmts.push(new o.ReturnStatement(resultVar));
  builder.methods.push(new o.ClassMethod(
      'handleEvent',
      [
        new o.FnParam(EVENT_NAME_VAR.name, o.STRING_TYPE),
        new o.FnParam(EventHandlerVars.event.name, o.DYNAMIC_TYPE)
      ],
      actionStmts, o.BOOL_TYPE));
}

function addSubscribeMethod(dirMeta: CompileDirectiveMetadata, builder: DirectiveWrapperBuilder) {
  const methodParams: o.FnParam[] = [
    new o.FnParam(
        VIEW_VAR.name, o.importType(resolveIdentifier(Identifiers.AppView), [o.DYNAMIC_TYPE])),
    new o.FnParam(EVENT_HANDLER_FIELD_NAME, o.DYNAMIC_TYPE)
  ];
  const stmts: o.Statement[] = [
    o.THIS_EXPR.prop(EVENT_HANDLER_FIELD_NAME).set(o.variable(EVENT_HANDLER_FIELD_NAME)).toStmt()
  ];
  Object.keys(dirMeta.outputs).forEach((emitterPropName, emitterIdx) => {
    const eventName = dirMeta.outputs[emitterPropName];
    const paramName = `emit${emitterIdx}`;
    methodParams.push(new o.FnParam(paramName, o.BOOL_TYPE));
    const subscriptionFieldName = `subscription${emitterIdx}`;
    builder.fields.push(new o.ClassField(subscriptionFieldName, o.DYNAMIC_TYPE));
    stmts.push(new o.IfStmt(o.variable(paramName), [
      o.THIS_EXPR.prop(subscriptionFieldName)
          .set(o.THIS_EXPR.prop(CONTEXT_FIELD_NAME)
                   .prop(emitterPropName)
                   .callMethod(
                       o.BuiltinMethod.SubscribeObservable,
                       [o.variable(EVENT_HANDLER_FIELD_NAME)
                            .callMethod(o.BuiltinMethod.Bind, [VIEW_VAR, o.literal(eventName)])]))
          .toStmt()
    ]));
    builder.destroyStmts.push(
        o.THIS_EXPR.prop(subscriptionFieldName)
            .and(o.THIS_EXPR.prop(subscriptionFieldName).callMethod('unsubscribe', []))
            .toStmt());
  });
  builder.methods.push(new o.ClassMethod('subscribe', methodParams, stmts));
}

class ParseResult {
  constructor(
      public hostProps: BoundElementPropertyAst[], public hostListeners: BoundEventAst[],
      public errors: ParseError[]) {}
}

function parseHostBindings(
    dirMeta: CompileDirectiveMetadata, exprParser: Parser,
    schemaRegistry: ElementSchemaRegistry): ParseResult {
  const errors: ParseError[] = [];
  const parser =
      new BindingParser(exprParser, DEFAULT_INTERPOLATION_CONFIG, schemaRegistry, [], errors);
  const sourceFileName = dirMeta.type.moduleUrl ?
      `in Directive ${dirMeta.type.name} in ${dirMeta.type.moduleUrl}` :
      `in Directive ${dirMeta.type.name}`;
  const sourceFile = new ParseSourceFile('', sourceFileName);
  const sourceSpan = new ParseSourceSpan(
      new ParseLocation(sourceFile, null, null, null),
      new ParseLocation(sourceFile, null, null, null));
  const parsedHostProps = parser.createDirectiveHostPropertyAsts(dirMeta.toSummary(), sourceSpan);
  const parsedHostListeners = parser.createDirectiveHostEventAsts(dirMeta.toSummary(), sourceSpan);

  return new ParseResult(parsedHostProps, parsedHostListeners, errors);
}

function reportParseErrors(parseErrors: ParseError[], console: Console) {
  const warnings = parseErrors.filter(error => error.level === ParseErrorLevel.WARNING);
  const errors = parseErrors.filter(error => error.level === ParseErrorLevel.FATAL);

  if (warnings.length > 0) {
    this._console.warn(`Directive parse warnings:\n${warnings.join('\n')}`);
  }

  if (errors.length > 0) {
    throw new Error(`Directive parse errors:\n${errors.join('\n')}`);
  }
}

export class DirectiveWrapperExpressions {
  static create(dir: CompileIdentifierMetadata, depsExpr: o.Expression[]): o.Expression {
    return o.importExpr(dir).instantiate(depsExpr, o.importType(dir));
  }
  static context(dirWrapper: o.Expression): o.ReadPropExpr {
    return dirWrapper.prop(CONTEXT_FIELD_NAME);
  }

  static ngDoCheck(
      dirWrapper: o.Expression, view: o.Expression, renderElement: o.Expression,
      throwOnChange: o.Expression): o.Expression {
    return dirWrapper.callMethod('ngDoCheck', [view, renderElement, throwOnChange]);
  }
  static checkHost(
      hostProps: BoundElementPropertyAst[], dirWrapper: o.Expression, view: o.Expression,
      componentView: o.Expression, renderElement: o.Expression, throwOnChange: o.Expression,
      runtimeSecurityContexts: o.Expression[]): o.Statement[] {
    if (hostProps.length) {
      return [dirWrapper
                  .callMethod(
                      'checkHost', [view, componentView, renderElement, throwOnChange].concat(
                                       runtimeSecurityContexts))
                  .toStmt()];
    } else {
      return [];
    }
  }
  static ngOnDetach(
      hostProps: BoundElementPropertyAst[], dirWrapper: o.Expression, view: o.Expression,
      componentView: o.Expression, renderEl: o.Expression): o.Statement[] {
    if (hostProps.some(prop => prop.isAnimation)) {
      return [dirWrapper
                  .callMethod(
                      'ngOnDetach',
                      [
                        view,
                        componentView,
                        renderEl,
                      ])
                  .toStmt()];
    } else {
      return [];
    }
  }
  static ngOnDestroy(dir: CompileDirectiveSummary, dirWrapper: o.Expression): o.Statement[] {
    if (dir.type.lifecycleHooks.indexOf(LifecycleHooks.OnDestroy) !== -1 ||
        Object.keys(dir.outputs).length > 0) {
      return [dirWrapper.callMethod('ngOnDestroy', []).toStmt()];
    } else {
      return [];
    }
  }
  static subscribe(
      dirMeta: CompileDirectiveSummary, hostProps: BoundElementPropertyAst[], usedEvents: string[],
      dirWrapper: o.Expression, view: o.Expression, eventListener: o.Expression): o.Statement[] {
    let needsSubscribe = false;
    let eventFlags: o.Expression[] = [];
    Object.keys(dirMeta.outputs).forEach((propName) => {
      const eventName = dirMeta.outputs[propName];
      const eventUsed = usedEvents.indexOf(eventName) > -1;
      needsSubscribe = needsSubscribe || eventUsed;
      eventFlags.push(o.literal(eventUsed));
    });
    hostProps.forEach((hostProp) => {
      if (hostProp.isAnimation && usedEvents.length > 0) {
        needsSubscribe = true;
      }
    });
    if (needsSubscribe) {
      return [
        dirWrapper.callMethod('subscribe', [view, eventListener].concat(eventFlags)).toStmt()
      ];
    } else {
      return [];
    }
  }
  static handleEvent(
      hostEvents: BoundEventAst[], dirWrapper: o.Expression, eventName: o.Expression,
      event: o.Expression): o.Expression {
    return dirWrapper.callMethod('handleEvent', [eventName, event]);
  }
}
