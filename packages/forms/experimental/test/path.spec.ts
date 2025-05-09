/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, signal} from '@angular/core';
import {FieldPath, Schema} from '../public_api';
import {validate} from '../src/api/logic';
import {apply, applyEach, applyWhen, form} from '../src/api/structure';
import {FieldPathNode, FieldRootPathNode} from '../src/path_node';
import {TestBed} from '@angular/core/testing';

describe('path', () => {
  describe('roots', () => {
    it('should lift all root paths to top', () => {
      let rootPath!: FieldPath<unknown>;
      const paths: FieldPath<unknown>[] = [];
      const savePath = <T>(fn?: Schema<T>) => {
        return (p: FieldPath<T>) => {
          paths.push(p);
          fn?.(p);
        };
      };
      const f = form(
        signal({a: {b: {c: ''}}}),
        savePath((root) => {
          rootPath = root;
          apply(root, savePath());
          apply(
            root.a,
            savePath((a) => {
              apply(
                a.b,
                savePath((b) => {
                  apply(b.c, savePath());
                }),
              );
            }),
          );
        }),
        {injector: TestBed.inject(Injector)},
      );
      const topRoots = (FieldPathNode.unwrapFieldPath(rootPath) as FieldRootPathNode).subroots;
      expect(topRoots.size).toBe(5);
      expect(topRoots.get(FieldPathNode.unwrapFieldPath(paths[0]))).toEqual([]);
      expect(topRoots.get(FieldPathNode.unwrapFieldPath(paths[1]))).toEqual([]);
      expect(topRoots.get(FieldPathNode.unwrapFieldPath(paths[2]))).toEqual(['a']);
      expect(topRoots.get(FieldPathNode.unwrapFieldPath(paths[3]))).toEqual(['a', 'b']);
      expect(topRoots.get(FieldPathNode.unwrapFieldPath(paths[4]))).toEqual(['a', 'b', 'c']);
    });
  });

  describe('Active path', () => {
    it('Disallows using parent paths for applyWhen', () => {
      const data = signal({first: '', needLastName: false, last: ''});

      form(
        data,
        (path) => {
          applyWhen(
            path,
            ({value}) => value().needLastName,
            (/* UNUSED */) => {
              expect(() => {
                validate(path.last, ({value}) =>
                  value().length > 0 ? undefined : {kind: 'required'},
                );
              }).toThrowError();
            },
          );
        },
        {injector: TestBed.inject(Injector)},
      );
    });

    it('Disallows using parent paths for apply', () => {
      const data = signal({first: '', needLastName: false, last: ''});

      form(
        data,
        (path) => {
          apply(path, (/* UNUSED */) => {
            expect(() => {
              validate(path.last, ({value}) => {
                return {kind: 'does not matter'};
              });
            }).toThrowError();
          });
        },
        {injector: TestBed.inject(Injector)},
      );
    });

    it('Disallows using the same path', () => {
      const data = signal({first: '', needLastName: false, last: ''});

      form(
        data,
        (path) => {
          apply(path, (/* UNUSED */) => {
            expect(() => {
              validate(path, ({value}) => {
                return {kind: 'does not matter'};
              });
            }).toThrowError();
          });
        },
        {injector: TestBed.inject(Injector)},
      );
    });

    it('Disallows using parent paths for apply', () => {
      const data = signal({needLastName: false, items: [{first: '', last: ''}]});

      form(
        data,
        (path) => {
          applyEach(path.items, (/* UNUSED */) => {
            expect(() => {
              validate(path.needLastName, ({value}) => {
                return {kind: 'does not matter'};
              });
            }).toThrowError();
          });
        },
        {injector: TestBed.inject(Injector)},
      );
    });
  });
});
