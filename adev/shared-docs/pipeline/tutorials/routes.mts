/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  PlaygroundRouteData,
  TutorialConfig,
  TutorialNavigationItemWithStep,
  TutorialNavigationItem,
} from '../../interfaces/index';

export async function generatePlaygroundRoutes(
  configs: Record<string, TutorialConfig>,
): Promise<PlaygroundRouteData> {
  const templates = Object.entries(configs).map(([path, config]) => ({
    path: `playground/${path}`,
    label: config.title,
  }));

  return {
    templates,
    defaultTemplate: templates[0],
    starterTemplate: templates[templates.length - 1],
  };
}

export async function generateTutorialRoutes(
  tutorialName: string,
  introConfig: TutorialConfig,
  stepConfigs: Record<string, TutorialConfig>,
): Promise<TutorialNavigationItemWithStep> {
  const children: TutorialNavigationItem[] = Object.entries(stepConfigs)
    // Sort using the number prefix from the step directory name.
    .sort(([pathA], [pathB]) =>
      Number(pathA.split('-')[0]) > Number(pathB.split('-')[0]) ? 1 : -1,
    )
    .map(([path, config], idx) => {
      return {
        label: config.title,
        path: `tutorials/${tutorialName}/${path}`,
        contentPath: `tutorials/${tutorialName}/steps/${path}/README`,
        tutorialData: {
          title: config.title,
          type: config.type,
          step: idx + 1,
        },
      };
    });

  children.forEach((child, idx, childrenArr) => {
    if (idx > 0) {
      const prevStep = childrenArr.at(idx - 1);
      if (prevStep) {
        child.tutorialData.previousStep = prevStep.path;
      }
    }
    if (idx < childrenArr.length - 1) {
      const nextStep = childrenArr.at(idx + 1);
      if (nextStep) {
        child.tutorialData.nextStep = nextStep.path;
      }
    }
  });

  return {
    path: `tutorials/${tutorialName}`,
    label: introConfig.title,
    contentPath: `tutorials/${tutorialName}/intro/README`,
    tutorialData: {
      step: 0,
      title: introConfig.title,
      type: introConfig.type,
      nextStep: children[0].path,
    },
    children: children,
  };
}
