/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {declareExperimentalWebMcpTool} from './declare_tool';
export {provideExperimentalWebMcpTools} from './provide_tools';
export type {
  Client as WebMcpClient,
  ToolDescriptor as WebMcpToolDescriptor,
  Execute as WebMcpToolExecute,
} from './types';
