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
  Execute as WebMcpToolExecute,
  Client as WebMcpClient,
  ToolDescriptor as WebMcpToolDescriptor,
} from './types';
