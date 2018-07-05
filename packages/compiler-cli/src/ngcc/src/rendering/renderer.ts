/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnalyzedFile} from '../analyzer';
import {Renderer} from './renderer';

export interface RenderedFile {
  file: AnalyzedFile;
  content: string;
  map: string;
}

export interface Renderer {
  renderFile(file: AnalyzedFile): RenderedFile;
}