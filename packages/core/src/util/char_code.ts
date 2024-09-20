/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * List ASCII char codes to be used with `String.charCodeAt`
 */
export const enum CharCode {
  UPPER_CASE = ~32, // & with this will make the char uppercase
  SPACE = 32, // " "
  DOUBLE_QUOTE = 34, // "\""
  HASH = 35, // "#"
  SINGLE_QUOTE = 39, // "'"
  OPEN_PAREN = 40, // "("
  CLOSE_PAREN = 41, // ")"
  STAR = 42, // "*"
  SLASH = 47, // "/"
  _0 = 48, // "0"
  _1 = 49, // "1"
  _2 = 50, // "2"
  _3 = 51, // "3"
  _4 = 52, // "4"
  _5 = 53, // "5"
  _6 = 54, // "6"
  _7 = 55, // "7"
  _8 = 56, // "8"
  _9 = 57, // "9"
  COLON = 58, // ":"
  DASH = 45, // "-"
  UNDERSCORE = 95, // "_"
  SEMI_COLON = 59, // ";"
  BACK_SLASH = 92, // "\\"
  AT_SIGN = 64, // "@"
  ZERO = 48, // "0"
  NINE = 57, // "9"
  A = 65, // "A"
  U = 85, // "U"
  R = 82, // "R"
  L = 76, // "L"
  Z = 90, // "A"
  a = 97, // "a"
  z = 122, // "z"
}
