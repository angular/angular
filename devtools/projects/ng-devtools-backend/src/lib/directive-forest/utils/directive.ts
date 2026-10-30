/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {
  ɵAcxComponentDebugMetadata as AcxComponentDebugMetadata,
  ɵAngularComponentDebugMetadata as AngularComponentDebugMetadata,
  Type,
} from '@angular/core';
import {ChangeDetection, DirectiveMetadata} from '../../../../../protocol';
import {ComponentInstanceType} from '../../shared/interfaces';
import {ngDebugApiIsSupported, ngDebugClient} from '../../shared/ng-debug-api/ng-debug-api';
import {AngularDevtoolsError} from '../../shared/utils/error';
import {log} from '../../shared/utils/log';
import {AcxChangeDetectionStrategy, ChangeDetectionStrategy, Framework} from '../core-enums';

const enum DirectiveMetadataKey {
  INPUTS = 'inputs',
  OUTPUTS = 'outputs',
  ENCAPSULATION = 'encapsulation',
  CHANGE_DETECTION = 'changeDetection',
}

// Gets directive metadata. For newer versions of Angular (v12+) it uses
// the global `getDirectiveMetadata`. For prior versions of the framework
// the method directly interacts with the directive/component definition.
export function getDirectiveMetadata(dir: any): DirectiveMetadata {
  const getMetadata = ngDebugClient().getDirectiveMetadata;
  const metadata = dir ? getMetadata?.(dir) : null;
  if (metadata) {
    const {framework} = metadata;
    switch (framework) {
      case undefined: // Back compat, older Angular versions did not set `framework`.
      case Framework.Angular: {
        const meta = metadata as typeof metadata & Partial<AngularComponentDebugMetadata>;
        return {
          framework: Framework.Angular,
          name: meta.name,
          inputs: meta.inputs,
          outputs: meta.outputs,
          encapsulation: meta.encapsulation,
          changeDetection: meta.changeDetection,
        };
      }
      case Framework.ACX: {
        const meta = metadata as typeof metadata & Partial<AcxComponentDebugMetadata>;
        return {
          framework: Framework.ACX,
          name: meta.name,
          inputs: meta.inputs,
          outputs: meta.outputs,
          encapsulation: meta.encapsulation,
          changeDetection: meta.changeDetection,
        };
      }
      case Framework.Wiz: {
        return {
          framework: Framework.Wiz,
          name: metadata.name,
          props: metadata.props,
        };
      }
      default: {
        throw new AngularDevtoolsError(`Unknown framework: "${framework}".`);
      }
    }
  }

  // Used in older Angular versions, prior to the introduction of `getDirectiveMetadata`.
  const safelyGrabMetadata = (key: DirectiveMetadataKey) => {
    try {
      return dir.constructor.ɵcmp ? dir.constructor.ɵcmp[key] : dir.constructor.ɵdir[key];
    } catch {
      log.warn(`Could not find metadata for key: ${key} in directive:`, dir);
      return undefined;
    }
  };

  return {
    framework: Framework.Angular,
    inputs: safelyGrabMetadata(DirectiveMetadataKey.INPUTS),
    outputs: safelyGrabMetadata(DirectiveMetadataKey.OUTPUTS),
    encapsulation: safelyGrabMetadata(DirectiveMetadataKey.ENCAPSULATION),
    changeDetection: safelyGrabMetadata(DirectiveMetadataKey.CHANGE_DETECTION),
  };
}

export function getDirectiveCdStrategy(dir: ComponentInstanceType): ChangeDetection | undefined {
  const metadata = getDirectiveMetadata(dir.instance);

  switch (metadata.framework) {
    case Framework.Angular:
      switch (metadata.changeDetection) {
        case ChangeDetectionStrategy.OnPush:
          return 'ng-on-push';
        case ChangeDetectionStrategy.Eager:
          return 'ng-eager';
      }

    case Framework.ACX:
      switch (metadata.changeDetection) {
        case AcxChangeDetectionStrategy.Default:
          return 'acx-default';
        case AcxChangeDetectionStrategy.OnPush:
          return 'acx-on-push';
      }

    case Framework.Wiz:
      return undefined;

    default:
      throw new AngularDevtoolsError(
        `Unknown framework: "${(metadata as {framework: string}).framework}".`,
      );
  }
}

export function findDirectiveAndHost(el: Node | undefined): {
  directive: any;
  host: Element | null;
} {
  const ng = ngDebugClient();
  if (!el) {
    return {directive: null, host: null};
  }
  while (el) {
    if (el instanceof Element) {
      const component = ng.getComponent?.(el);
      if (component) {
        return {directive: component, host: el};
      }
      const directive = ng.getDirectives?.(el)?.[0];
      if (directive) {
        return {directive, host: el};
      }
    }
    if (!el.parentElement) {
      break;
    }
    el = el.parentElement;
  }
  return {directive: null, host: null};
}

export function getDirectiveName(dir: Type<unknown> | undefined | null): string {
  return dir ? dir.constructor.name : 'unknown';
}

export function elementToDirectiveNames(element: HTMLElement): string[] {
  const {component, directives} = getDirectivesFromElement(element);
  return [component, ...directives]
    .map((dir) => dir?.constructor?.name ?? '')
    .filter((dir) => !!dir);
}

export function getDirectivesFromElement(element: HTMLElement): {
  component: unknown | null;
  directives: unknown[];
} {
  const ng = ngDebugClient();
  let component = null;
  if (element instanceof Element && ngDebugApiIsSupported(ng, 'getComponent')) {
    component = ng.getComponent(element);
  }

  return {
    component,
    directives: ngDebugClient().getDirectives?.(element) ?? [],
  };
}
