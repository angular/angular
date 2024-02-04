/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { ChangeDetectorRef, EmbeddedViewRef, Type } from '@angular/core';
import { Pipe } from '@angular/core';
import { PipeTransform } from '@angular/core';

type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R ? (...args: P) => R : never;

type First<T> = T extends [infer U, ...any[]] ? U : any;

type TailArguments<F> = [..._: Parameters<OmitFirstArg<F>>, ...args: any];

// clang-format off
/**
 * @ngModule CommonModule
 * @description
 *
 * Generic pipe for use a component method into component template.
 *
 * @usageNotes
 *
 * The purpose of this pipe is call a component method into component template only
 * run it only when the arguments changes.
 *
 * ### Usage example
 *
 * The following component uses a generic pipe to use a component method into component template.
 *
 * ```
 * @Component({
 *   selector: 'generic-pipe',
 *   template: `
 *   <input type="search" [(ngModel)]="searchTerm" placeholder="Enter name" >
 *   <ul>
 *     <li *ngFor="let user of users | generic: search:searchTerm">{{user.name}}</li>
 *   </ul>
 *   `,
 *   standalone: true,
 *   imports: [GenericPipe],
 * })
 * export class GenericPipeComponent {
 *   users = [
 *     { name: 'foo', age: 20 },
 *     { name: 'bar', age: 20 },
 *     { name: 'baz', age: 20 },
 *   ];
 * 
 *   searchTerm = '';
 * 
 *   search(users, searchTerm) {
 *     if (!users || !searchTerm) {
 *       return users;
 *     }
 *     return users.filter(
 *       (user) => user.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
 *     );
 *   }
 * }
 * ```
 *
 * @publicApi
 */
// clang-format on
@Pipe({
  name: 'generic',
  pure: true,
  standalone: true
})
export class GenericPipe implements PipeTransform {
  // component instance
  private context: any;

  constructor(cdRef: ChangeDetectorRef) {
    // this is a workaround for retrieve component instance
    this.context = (cdRef as EmbeddedViewRef<Type<any>>).context;
  }

  /**
   * @param headArgument The first argument of method to call (`fnReference`)
   * @param fnReference The method to call.
   * @param tailArguments The tail arguments of method to call (`fnReference`)
   *
   * @returns The result of the called method (`fnReference`).
   */
  public transform<T, K extends (...args: any) => ReturnType<K>>(
    headArgument: First<Parameters<K>>,
    fnReference: K,
    ...tailArguments: TailArguments<K>
  ): ReturnType<K> {
    // call method and pass component instance and parameters
    return fnReference.apply(this.context, [headArgument, ...tailArguments]);
  }
}