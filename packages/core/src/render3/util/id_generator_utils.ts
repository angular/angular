/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

let uniqueIdCounter = 0;

/**
 * Generates a unique ID based on the provided base ID.
 * @param baseId The base identifier for the component instance.
 * @returns A unique ID string.
 */
export function generateUniqueId(baseId: string): string {
  return `${baseId}-${uniqueIdCounter++}`;
}

/**
 * Utility function to replace IDs in a template string with unique IDs.
 * @param template The component template string.
 * @param instanceId The unique instance ID to prepend.
 * @returns A modified template string with unique IDs.
 */
export function generateUniqueIdTemplate(template: string, instanceId: string): string {
  return template
    .replace(/id="([^"]+)"/g, `id="${instanceId}-$1"`)
    .replace(/for="([^"]+)"/g, `for="${instanceId}-$1"`)
    .replace(/aria-labelledby="([^"]+)"/g, `aria-labelledby="${instanceId}-$1"`)
    .replace(/aria-describedby="([^"]+)"/g, `aria-describedby="${instanceId}-$1"`)
    .replace(/aria-controls="([^"]+)"/g, `aria-controls="${instanceId}-$1"`)
    .replace(/aria-flowto="([^"]+)"/g, `aria-flowto="${instanceId}-$1"`)
    .replace(/aria-haspopup="([^"]+)"/g, `aria-haspopup="${instanceId}-$1"`)
    .replace(/aria-current="([^"]+)"/g, `aria-current="${instanceId}-$1"`)
    .replace(/aria-owns="([^"]+)"/g, `aria-owns="${instanceId}-$1"`)
    .replace(/aria-details="([^"]+)"/g, `aria-details="${instanceId}-$1"`)
    .replace(/aria-activedescendant="([^"]+)"/g, `aria-activedescendant="${instanceId}-$1"`)
    .replace(/aria-invalid="([^"]+)"/g, `aria-invalid="${instanceId}-$1"`)
    .replace(/data-target="([^"]+)"/g, `data-target="${instanceId}-$1"`)
    .replace(/data-controls="([^"]+)"/g, `data-controls="${instanceId}-$1"`);
}
