/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {
  DOM_EVENT_TYPE_MAP,
  VALID_DOM_EVENTS,
  isValidDomEvent,
  getDomEventType,
  getDomEventDocumentation,
  findSimilarDomEvents,
  type DomEventDocumentation,
} from './event_data';

export {
  getEventDiagnostics,
  getOutputDefinitionDiagnostics,
  EventDiagnosticCode,
  type EventDiagnosticsConfig,
  DEFAULT_EVENT_DIAGNOSTICS_CONFIG,
} from './event_diagnostics';
