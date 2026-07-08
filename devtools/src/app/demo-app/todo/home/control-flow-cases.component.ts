/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';

import {RenderedTextComponent} from './rendered-text.component';

type IfCase = 'loading' | 'ready' | 'error';
type FilterCase = 'all' | 'active' | 'completed' | 'archived';
type NoDefaultCase = 'draft' | 'queued' | 'expired';
type DefaultFirstCase = 'retry' | 'success' | 'unknown';
type ExhaustiveNeverCase = 'loggedOut' | 'loading' | 'loggedIn';

interface Profile {
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  tasks: number;
  quota: {
    remaining: number;
  };
}

type NarrowedSwitchValue =
  | {kind: 'text'; text: string}
  | {kind: 'count'; count: number}
  | {kind: 'flag'; enabled: boolean};

@Component({
  selector: 'app-control-flow-cases',
  imports: [RenderedTextComponent],
  templateUrl: 'control-flow-cases.component.html',
  styleUrls: ['./control-flow-cases.component.scss'],
})
export class ControlFlowCasesComponent {
  readonly selectedProfile: Profile | null = {
    name: 'Ada',
    role: 'admin',
    tasks: 3,
    quota: {remaining: 25},
  };
  readonly ifCase: IfCase = 'error';
  readonly filterCase: FilterCase = 'archived';
  readonly priorityScore = 10;
  readonly priorityOffset = 10;
  readonly criticalPriority = 90;
  readonly warningPriority = 40;
  readonly narrowedSwitchValue: NarrowedSwitchValue = {kind: 'count', count: 21};
  readonly exhaustiveNeverCase: ExhaustiveNeverCase = 'loading';
  readonly noDefaultCase: NoDefaultCase = 'expired';
  readonly defaultFirstCase: DefaultFirstCase = 'unknown';
}
