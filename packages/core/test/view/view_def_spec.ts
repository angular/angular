/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {anchorDef, directiveDef, elementDef, NodeFlags, QueryValueType, textDef, viewDef, ViewDefinition, ViewFlags} from '@angular/core/src/view/index';
import {filterQueryId} from '@angular/core/src/view/util';

{
  describe('viewDef', () => {
    describe('parent', () => {
      function parents(viewDef: ViewDefinition): (number|null)[] {
        return viewDef.nodes.map(node => node.parent ? node.parent.nodeIndex : null);
      }

      it('should calculate parents for one level', () => {
        const vd = viewDef(ViewFlags.None, [
          elementDef(0, NodeFlags.None, null, null, 2, 'span'),
          textDef(1, null, ['a']),
          textDef(2, null, ['a']),
        ]);

        expect(parents(vd)).toEqual([null, 0, 0]);
      });

      it('should calculate parents for one level, multiple roots', () => {
        const vd = viewDef(ViewFlags.None, [
          elementDef(0, NodeFlags.None, null, null, 1, 'span'),
          textDef(1, null, ['a']),
          elementDef(2, NodeFlags.None, null, null, 1, 'span'),
          textDef(3, null, ['a']),
          textDef(4, null, ['a']),
        ]);

        expect(parents(vd)).toEqual([null, 0, null, 2, null]);
      });

      it('should calculate parents for multiple levels', () => {
        const vd = viewDef(ViewFlags.None, [
          elementDef(0, NodeFlags.None, null, null, 2, 'span'),
          elementDef(1, NodeFlags.None, null, null, 1, 'span'),
          textDef(2, null, ['a']),
          elementDef(3, NodeFlags.None, null, null, 1, 'span'),
          textDef(4, null, ['a']),
          textDef(5, null, ['a']),
        ]);

        expect(parents(vd)).toEqual([null, 0, 1, null, 3, null]);
      });
    });

    describe('childFlags', () => {
      function childFlags(viewDef: ViewDefinition): number[] {
        return viewDef.nodes.map(node => node.childFlags);
      }

      function directChildFlags(viewDef: ViewDefinition): number[] {
        return viewDef.nodes.map(node => node.directChildFlags);
      }

      it('should calculate childFlags for one level', () => {
        const vd = viewDef(ViewFlags.None, [
          elementDef(0, NodeFlags.None, null, null, 1, 'span'),
          directiveDef(1, NodeFlags.AfterContentChecked, null, 0, AService, [])
        ]);

        expect(childFlags(vd)).toEqual([
          NodeFlags.TypeDirective | NodeFlags.AfterContentChecked, NodeFlags.None
        ]);

        expect(directChildFlags(vd)).toEqual([
          NodeFlags.TypeDirective | NodeFlags.AfterContentChecked, NodeFlags.None
        ]);
      });

      it('should calculate childFlags for two levels', () => {
        const vd = viewDef(ViewFlags.None, [
          elementDef(0, NodeFlags.None, null, null, 2, 'span'),
          elementDef(1, NodeFlags.None, null, null, 1, 'span'),
          directiveDef(2, NodeFlags.AfterContentChecked, null, 0, AService, [])
        ]);

        expect(childFlags(vd)).toEqual([
          NodeFlags.TypeElement | NodeFlags.TypeDirective | NodeFlags.AfterContentChecked,
          NodeFlags.TypeDirective | NodeFlags.AfterContentChecked, NodeFlags.None
        ]);

        expect(directChildFlags(vd)).toEqual([
          NodeFlags.TypeElement, NodeFlags.TypeDirective | NodeFlags.AfterContentChecked,
          NodeFlags.None
        ]);
      });

      it('should calculate childFlags for one level, multiple roots', () => {
        const vd = viewDef(ViewFlags.None, [
          elementDef(0, NodeFlags.None, null, null, 1, 'span'),
          directiveDef(1, NodeFlags.AfterContentChecked, null, 0, AService, []),
          elementDef(2, NodeFlags.None, null, null, 2, 'span'),
          directiveDef(3, NodeFlags.AfterContentInit, null, 0, AService, []),
          directiveDef(4, NodeFlags.AfterViewChecked, null, 0, AService, []),
        ]);

        expect(childFlags(vd)).toEqual([
          NodeFlags.TypeDirective | NodeFlags.AfterContentChecked, NodeFlags.None,
          NodeFlags.TypeDirective | NodeFlags.AfterContentInit | NodeFlags.AfterViewChecked,
          NodeFlags.None, NodeFlags.None
        ]);

        expect(directChildFlags(vd)).toEqual([
          NodeFlags.TypeDirective | NodeFlags.AfterContentChecked, NodeFlags.None,
          NodeFlags.TypeDirective | NodeFlags.AfterContentInit | NodeFlags.AfterViewChecked,
          NodeFlags.None, NodeFlags.None
        ]);
      });

      it('should calculate childFlags for multiple levels', () => {
        const vd = viewDef(ViewFlags.None, [
          elementDef(0, NodeFlags.None, null, null, 2, 'span'),
          elementDef(1, NodeFlags.None, null, null, 1, 'span'),
          directiveDef(2, NodeFlags.AfterContentChecked, null!, 0, AService, []),
          elementDef(3, NodeFlags.None, null, null, 2, 'span'),
          directiveDef(4, NodeFlags.AfterContentInit, null, 0, AService, []),
          directiveDef(5, NodeFlags.AfterViewInit, null, 0, AService, []),
        ]);

        expect(childFlags(vd)).toEqual([
          NodeFlags.TypeElement | NodeFlags.TypeDirective | NodeFlags.AfterContentChecked,
          NodeFlags.TypeDirective | NodeFlags.AfterContentChecked, NodeFlags.None,
          NodeFlags.TypeDirective | NodeFlags.AfterContentInit | NodeFlags.AfterViewInit,
          NodeFlags.None, NodeFlags.None
        ]);

        expect(directChildFlags(vd)).toEqual([
          NodeFlags.TypeElement, NodeFlags.TypeDirective | NodeFlags.AfterContentChecked,
          NodeFlags.None,
          NodeFlags.TypeDirective | NodeFlags.AfterContentInit | NodeFlags.AfterViewInit,
          NodeFlags.None, NodeFlags.None
        ]);
      });
    });

    describe('childMatchedQueries', () => {
      function childMatchedQueries(viewDef: ViewDefinition): number[] {
        return viewDef.nodes.map(node => node.childMatchedQueries);
      }

      it('should calculate childMatchedQueries for one level', () => {
        const vd = viewDef(ViewFlags.None, [
          elementDef(0, NodeFlags.None, null, null, 1, 'span'),
          directiveDef(1, NodeFlags.None, [[1, QueryValueType.Provider]], 0, AService, [])
        ]);

        expect(childMatchedQueries(vd)).toEqual([filterQueryId(1), 0]);
      });

      it('should calculate childMatchedQueries for two levels', () => {
        const vd = viewDef(ViewFlags.None, [
          elementDef(0, NodeFlags.None, null, null, 2, 'span'),
          elementDef(1, NodeFlags.None, null, null, 1, 'span'),
          directiveDef(2, NodeFlags.None, [[1, QueryValueType.Provider]], 0, AService, [])
        ]);

        expect(childMatchedQueries(vd)).toEqual([filterQueryId(1), filterQueryId(1), 0]);
      });

      it('should calculate childMatchedQueries for one level, multiple roots', () => {
        const vd = viewDef(ViewFlags.None, [
          elementDef(0, NodeFlags.None, null, null, 1, 'span'),
          directiveDef(1, NodeFlags.None, [[1, QueryValueType.Provider]], 0, AService, []),
          elementDef(2, NodeFlags.None, null, null, 2, 'span'),
          directiveDef(3, NodeFlags.None, [[2, QueryValueType.Provider]], 0, AService, []),
          directiveDef(4, NodeFlags.None, [[3, QueryValueType.Provider]], 0, AService, []),
        ]);

        expect(childMatchedQueries(vd)).toEqual([
          filterQueryId(1), 0, filterQueryId(2) | filterQueryId(3), 0, 0
        ]);
      });

      it('should calculate childMatchedQueries for multiple levels', () => {
        const vd = viewDef(ViewFlags.None, [
          elementDef(0, NodeFlags.None, null, null, 2, 'span'),
          elementDef(1, NodeFlags.None, null, null, 1, 'span'),
          directiveDef(2, NodeFlags.None, [[1, QueryValueType.Provider]], 0, AService, []),
          elementDef(3, NodeFlags.None, null, null, 2, 'span'),
          directiveDef(4, NodeFlags.None, [[2, QueryValueType.Provider]], 0, AService, []),
          directiveDef(5, NodeFlags.None, [[3, QueryValueType.Provider]], 0, AService, []),
        ]);

        expect(childMatchedQueries(vd)).toEqual([
          filterQueryId(1), filterQueryId(1), 0, filterQueryId(2) | filterQueryId(3), 0, 0
        ]);
      });

      it('should included embedded views into childMatchedQueries', () => {
        const vd = viewDef(ViewFlags.None, [
          elementDef(0, NodeFlags.None, null, null, 1, 'span'),
          anchorDef(
              NodeFlags.None, null, null, 0, null,
              () => viewDef(
                  ViewFlags.None,
                  [
                    elementDef(0, NodeFlags.None, [[1, QueryValueType.Provider]], null, 0, 'span'),
                  ]))
        ]);

        // Note: the template will become a sibling to the anchor once stamped out,
        expect(childMatchedQueries(vd)).toEqual([filterQueryId(1), 0]);
      });
    });
  });
}

class AService {}
