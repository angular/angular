/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {parse as parseYaml} from 'yaml';

export interface PullApproveGroupConfig {
  conditions?: string;
  reviewers: {
    users: string[],
    teams?: string[],
  }|{
    teams: string[],
  };
}

export interface PullApproveConfig {
  version: number;
  github_api_version?: string;
  pullapprove_conditions?: {
    condition: string,
    unmet_status: string,
    explanation: string,
  }[];
  groups: {
    [key: string]: PullApproveGroupConfig,
  };
}

export function parsePullApproveYaml(rawYaml: string): PullApproveConfig {
  return parseYaml(rawYaml) as PullApproveConfig;
}
