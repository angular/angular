/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ElementProfile, ProfilerFrame} from '../../../../../../../../protocol';
import {ThemeUi} from '../../../../../application-services/theme_types';

import {RecordFormatter} from '../record-formatter';

export interface FlamegraphNode {
  value: number;
  color?: string;
  children: FlamegraphNode[];
  label: string;
  instances: number;
  original: ElementProfile;
  changeDetected: boolean;
}

export const ROOT_LEVEL_ELEMENT_LABEL = 'Entire application';

export class FlamegraphFormatter extends RecordFormatter<FlamegraphNode> {
  override formatFrame(
    frame: ProfilerFrame,
    showChangeDetection?: boolean,
    theme?: ThemeUi,
  ): FlamegraphNode {
    const result: FlamegraphNode = {
      value: 0,
      label: ROOT_LEVEL_ELEMENT_LABEL,
      children: [],
      instances: 1,
      changeDetected: false,
      original: {
        children: [],
        directives: [],
        type: 'element',
      },
    };

    const colors = createColors(theme);

    if (showChangeDetection) {
      result.color = colors.cdColor;
    }

    this.addFrame(result.children, frame.directives, showChangeDetection, colors);
    return result;
  }

  override addFrame(
    nodes: FlamegraphNode[],
    elements: ElementProfile[],
    showChangeDetection?: boolean,
    colors?: Colors,
  ): number {
    let timeSpent = 0;

    for (const element of elements) {
      // Possibly undefined because of
      // the insertion on the backend.
      if (!element) {
        console.error('Unable to insert undefined element');
        continue;
      }
      const changeDetected = didRunChangeDetection(element);
      const node: FlamegraphNode = {
        value: super.getValue(element),
        label: super.getLabel(element),
        children: [],
        instances: 1,
        original: element,
        changeDetected,
      };
      if (showChangeDetection && colors) {
        node.color = changeDetected ? colors.cdColor : colors.noCdColor;
      }
      timeSpent += this.addFrame(node.children, element.children, showChangeDetection, colors);
      timeSpent += node.value;
      nodes.push(node);
    }
    return timeSpent;
  }
}

// Represent dynamic-purple-01
const CHANGE_DETECTION_COLOR_LIGHT = 'oklch(47.5% 0.26 295)';
const CHANGE_DETECTION_COLOR_DARK = 'oklch(76% 0.15 305)';

// Represent quaternary-contrast
const NO_CHANGE_DETECTION_COLOR_LIGHT = 'oklch(54.84% 0 0)';
const NO_CHANGE_DETECTION_COLOR_DARK = 'oklch(70.9% 0 0)';

const didRunChangeDetection = (profile: ElementProfile) => {
  const components = profile.directives.filter((d) => d.isComponent);
  if (!components.length) {
    return false;
  }
  return components.some((c) => c.changeDetection !== undefined);
};

type Colors = {
  cdColor: string;
  noCdColor: string;
};

function createColors(theme?: ThemeUi): Colors {
  const isDark = theme === 'dark';

  return {
    cdColor: isDark ? CHANGE_DETECTION_COLOR_DARK : CHANGE_DETECTION_COLOR_LIGHT,
    noCdColor: isDark ? NO_CHANGE_DETECTION_COLOR_DARK : NO_CHANGE_DETECTION_COLOR_LIGHT,
  };
}
