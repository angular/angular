/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Loads the global `WebMCP` namespace
import './dist/index.js';

// API extractor cannot analyze a re-export of the global namespace itself,
// so only aliases of its members are exported.
export type ModelContext = WebMCP.ModelContext;
export type ModelContextTool = WebMCP.ModelContextTool;
export type ModelContextToolFromSchema<TInputSchema extends object> =
  WebMCP.ModelContextToolFromSchema<TInputSchema>;
export type ToolExecuteCallbackOptions = WebMCP.ToolExecuteCallbackOptions;
