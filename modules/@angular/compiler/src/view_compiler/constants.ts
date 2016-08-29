/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, ViewEncapsulation} from '@angular/core';

import {ChangeDetectorStatus, ViewType} from '../../core_private';
import {CompileIdentifierMetadata} from '../compile_metadata';
import {isBlank, resolveEnumToken} from '../facade/lang';
import {Identifiers} from '../identifiers';
import * as o from '../output/output_ast';

function _enumExpression(classIdentifier: CompileIdentifierMetadata, value: any): o.Expression {
  if (isBlank(value)) return o.NULL_EXPR;
  var name = resolveEnumToken(classIdentifier.runtime, value);
  return o.importExpr(new CompileIdentifierMetadata({
    name: `${classIdentifier.name}.${name}`,
    moduleUrl: classIdentifier.moduleUrl,
    runtime: value
  }));
}

export class ViewTypeEnum {
  static fromValue(value: ViewType): o.Expression {
    return _enumExpression(Identifiers.ViewType, value);
  }
  static HOST = ViewTypeEnum.fromValue(ViewType.HOST);
  static COMPONENT = ViewTypeEnum.fromValue(ViewType.COMPONENT);
  static EMBEDDED = ViewTypeEnum.fromValue(ViewType.EMBEDDED);
}

export class ViewEncapsulationEnum {
  static fromValue(value: ViewEncapsulation): o.Expression {
    return _enumExpression(Identifiers.ViewEncapsulation, value);
  }
  static Emulated = ViewEncapsulationEnum.fromValue(ViewEncapsulation.Emulated);
  static Native = ViewEncapsulationEnum.fromValue(ViewEncapsulation.Native);
  static None = ViewEncapsulationEnum.fromValue(ViewEncapsulation.None);
}

export class ChangeDetectionStrategyEnum {
  static fromValue(value: ChangeDetectionStrategy): o.Expression {
    return _enumExpression(Identifiers.ChangeDetectionStrategy, value);
  }
  static OnPush = ChangeDetectionStrategyEnum.fromValue(ChangeDetectionStrategy.OnPush);
  static Default = ChangeDetectionStrategyEnum.fromValue(ChangeDetectionStrategy.Default);
}

export class ChangeDetectorStatusEnum {
  static fromValue(value: ChangeDetectorStatusEnum): o.Expression {
    return _enumExpression(Identifiers.ChangeDetectorStatus, value);
  }
  static CheckOnce = ChangeDetectorStatusEnum.fromValue(ChangeDetectorStatus.CheckOnce);
  static Checked = ChangeDetectorStatusEnum.fromValue(ChangeDetectorStatus.Checked);
  static CheckAlways = ChangeDetectorStatusEnum.fromValue(ChangeDetectorStatus.CheckAlways);
  static Detached = ChangeDetectorStatusEnum.fromValue(ChangeDetectorStatus.Detached);
  static Errored = ChangeDetectorStatusEnum.fromValue(ChangeDetectorStatus.Errored);
  static Destroyed = ChangeDetectorStatusEnum.fromValue(ChangeDetectorStatus.Destroyed);
}

export class ViewConstructorVars {
  static viewUtils = o.variable('viewUtils');
  static parentInjector = o.variable('parentInjector');
  static declarationEl = o.variable('declarationEl');
}

export class ViewProperties {
  static renderer = o.THIS_EXPR.prop('renderer');
  static projectableNodes = o.THIS_EXPR.prop('projectableNodes');
  static viewUtils = o.THIS_EXPR.prop('viewUtils');
}

export class EventHandlerVars { static event = o.variable('$event'); }

export class InjectMethodVars {
  static token = o.variable('token');
  static requestNodeIndex = o.variable('requestNodeIndex');
  static notFoundResult = o.variable('notFoundResult');
}

export class DetectChangesVars {
  static throwOnChange = o.variable(`throwOnChange`);
  static changes = o.variable(`changes`);
  static changed = o.variable(`changed`);
  static valUnwrapper = o.variable(`valUnwrapper`);
}
