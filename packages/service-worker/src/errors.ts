/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * The list of error codes used in runtime code of the `service-worker` package.
 * Reserved error code range: 5600-5699.
 */
export const enum RuntimeErrorCode {
  UNKNOWN_REGISTRATION_STRATEGY = 5600,
  SERVICE_WORKER_DISABLED_OR_NOT_SUPPORTED_BY_THIS_BROWSER = 5601,
  NOT_SUBSCRIBED_TO_PUSH_NOTIFICATIONS = 5602,
  PUSH_SUBSCRIPTION_UNSUBSCRIBE_FAILED = 5603,
  SERVICE_WORKER_REGISTRATION_FAILED = 5604,
}
