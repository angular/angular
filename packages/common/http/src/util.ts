/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// TODO: Replace this fallback once widely available.
// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64

type Uint8ArrayWithToBase64 = Uint8Array & {toBase64(): string};
type Uint8ArrayCtorWithFromBase64 = typeof Uint8Array & {fromBase64(base64: string): Uint8Array};

function hasToBase64(u8: Uint8Array): u8 is Uint8ArrayWithToBase64 {
  return typeof (u8 as Uint8ArrayWithToBase64).toBase64 === 'function';
}

function hasFromBase64(ctor: typeof Uint8Array): ctor is Uint8ArrayCtorWithFromBase64 {
  return typeof (ctor as Uint8ArrayCtorWithFromBase64).fromBase64 === 'function';
}

export function toBase64(buffer: ArrayBufferLike): string {
  const bytes = new Uint8Array(buffer);

  if (hasToBase64(bytes)) {
    return bytes.toBase64();
  }

  const CHUNK_SIZE = 0x8000; // 32,768 bytes (~32 KB) per chunk, to avoid stack overflow
  let binaryString = '';
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    binaryString += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binaryString);
}

export function fromBase64(base64: string): ArrayBuffer {
  if (hasFromBase64(Uint8Array)) {
    return Uint8Array.fromBase64(base64).buffer as ArrayBuffer;
  }

  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return bytes.buffer as ArrayBuffer;
}
