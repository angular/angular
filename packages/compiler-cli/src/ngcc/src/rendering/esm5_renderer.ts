/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import MagicString from 'magic-string';
import {NgccReflectionHost} from '../host/ngcc_host';
import {AnalyzedClass, AnalyzedFile} from '../analyzer';
import {Esm2015Renderer} from './esm2015_renderer';

export class Esm5Renderer extends Esm2015Renderer {
  constructor(host: NgccReflectionHost) { super(host); }
}
