/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ComponentExplorerViewQuery,
  DirectivePosition,
  DirectivesProperties,
  PropertyQueryTypes,
  UpdatedStateData,
} from '../../../../../protocol';
import {
  getDependenciesForDirective,
  getInjectorFromElementNode,
  getInjectorProviders,
  getInjectorResolutionPath,
} from '../../injector-tree/injector-tree';
import {
  ComponentInstanceType,
  ComponentTreeNode,
  DirectiveInstanceType,
} from '../../shared/interfaces';
import {
  ngDebugApiIsSupported,
  ngDebugClient,
  ngDebugDependencyInjectionApiIsSupported,
} from '../../shared/ng-debug-api/ng-debug-api';
import {
  deeplySerializeSelectedProperties,
  serializeDirectiveState,
} from '../../shared/state-serializer/state-serializer';
import {unwrapSignal} from '../../shared/utils/general';
import {log} from '../../shared/utils/log';
import {buildDirectiveForest, queryDirectiveForest} from '..';
import {Framework} from '../core-enums';
import {mutateNestedProp} from '../property-mutation/property-mutation';
import {getDirectiveMetadata} from '../utils/directive';

export function getLatestDirectiveState(
  query: ComponentExplorerViewQuery,
  directiveForest?: ComponentTreeNode[],
): {directiveProperties: DirectivesProperties} | undefined {
  // if a directive forest is passed in we don't have to build the forest again.
  directiveForest = directiveForest ?? buildDirectiveForest();

  const node = queryDirectiveForest(query.selectedElement, directiveForest);
  if (!node) {
    return;
  }

  const directiveProperties: DirectivesProperties = {};

  const injector = getInjectorFromElementNode(node.nativeElement!);

  const injectors = injector ? getInjectorResolutionPath(injector) : [];
  const resolutionPathWithProviders = !ngDebugDependencyInjectionApiIsSupported()
    ? []
    : injectors.map((injector) => ({
        injector,
        providers: getInjectorProviders(injector),
      }));
  const populateResultSet = (dir: DirectiveInstanceType | ComponentInstanceType) => {
    const {instance, name} = dir;
    const metadata = getDirectiveMetadata(instance);
    if (injector && metadata.framework === Framework.Angular) {
      metadata.dependencies = getDependenciesForDirective(
        injector,
        resolutionPathWithProviders,
        instance.constructor,
      );
    }

    if (query.propertyQuery.type === PropertyQueryTypes.All) {
      directiveProperties[dir.name] = {
        props: serializeDirectiveState(instance),
        metadata,
      };
    }

    if (query.propertyQuery.type === PropertyQueryTypes.Specified) {
      directiveProperties[name] = {
        props: deeplySerializeSelectedProperties(
          instance,
          query.propertyQuery.properties[name] || [],
        ),
        metadata,
      };
    }
  };

  node.directives?.forEach((dir) => populateResultSet(dir));
  if (node.component) {
    populateResultSet(node.component);
  }

  return {
    directiveProperties,
  };
}

export function updateDirectiveState(updatedStateData: UpdatedStateData): void {
  const ng = ngDebugClient();
  const node = queryDirectiveForest(updatedStateData.directiveId.element, buildDirectiveForest());
  if (!node) {
    log.warn(
      'Could not update the state of component',
      updatedStateData,
      'because the component was not found',
    );
    return;
  }
  if (node.directives && updatedStateData.directiveId.directive !== undefined) {
    const directive = node.directives[updatedStateData.directiveId.directive].instance;
    mutateNestedProp(directive, updatedStateData.keyPath, updatedStateData.newValue);
    if (ngDebugApiIsSupported(ng, 'getOwningComponent')) {
      ng.applyChanges?.(ng.getOwningComponent(directive)!);
    }
    return;
  }
  if (node.component) {
    const comp = node.component.instance;
    mutateNestedProp(comp, updatedStateData.keyPath, updatedStateData.newValue);
    ng.applyChanges?.(comp);
    return;
  }
}

export function logDirectiveValue(valueInfo: {
  directiveId: DirectivePosition;
  keyPath: string[] | null;
}): void {
  const node = queryDirectiveForest(valueInfo.directiveId.element, buildDirectiveForest());
  if (!node) {
    log.warn(
      'Could not log the value of component',
      valueInfo,
      'because the directive was not found',
    );
    return;
  }

  if (node.directives && valueInfo.directiveId.directive !== undefined) {
    const directiveInstance = node.directives[valueInfo.directiveId.directive].instance;
    if (valueInfo.keyPath === null) {
      logSignalToConsole(directiveInstance);
      return;
    }

    const value = valueInfo.keyPath.reduce((obj, key) => obj && obj[key], directiveInstance);
    logSignalToConsole(value);
    return;
  }
  if (node.component) {
    const compInstance = node.component.instance;
    if (valueInfo.keyPath === null) {
      logSignalToConsole(compInstance);
      return;
    }
    const value = valueInfo.keyPath.reduce((obj, key) => obj && obj[key], compInstance);
    logSignalToConsole(value);
    return;
  }
}

function logSignalToConsole(value: unknown) {
  // tslint:disable-next-line:no-console
  console.log(unwrapSignal(value));
}
