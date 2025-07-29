/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export function sanitizeObject(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return isPortSerializable(obj) ? obj : '[Non-serializable data]';
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = isPortSerializable(value) ? value : '[Non-serializable data]';
  }
  return result;
}

// This is specific to chrome.runtime.Port which like JSON.stringify, cannot serialize cyclic objects
function isPortSerializable(value: any): boolean {
  if (typeof value === 'function') {
    return false; // Functions are not serializable but JSON.stringify doesn't throw, it strips them out
  }

  try {
    JSON.stringify(value); // This mimics the runtime's limitations closely
    return true;
  } catch {
    return false;
  }
}
