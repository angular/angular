/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag} from '@angular/cdk/drag-drop';
import {Component, computed, forwardRef, input, output} from '@angular/core';
import {DirectivePosition, SerializedInjectedService} from 'protocol';

import {
  DirectivePropertyResolver,
  DirectiveTreeData,
} from '../../property-resolver/directive-property-resolver';
import {FlatNode} from '../../property-resolver/element-property-resolver';
import {ResolutionPathComponent} from '../../../dependency-injection/resolution-path.component';
import {MatChipsModule} from '@angular/material/chips';
import {PropertyViewTreeComponent} from './property-view-tree.component';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatExpansionModule} from '@angular/material/expansion';

@Component({
  selector: 'ng-property-view-body',
  templateUrl: './property-view-body.component.html',
  styleUrls: ['./property-view-body.component.scss'],
  imports: [
    MatExpansionModule,
    CdkDropList,
    MatTooltip,
    MatIcon,
    forwardRef(() => InjectedServicesComponent),
    CdkDrag,
    PropertyViewTreeComponent,
  ],
})
export class PropertyViewBodyComponent {
  readonly controller = input.required<DirectivePropertyResolver>();
  readonly directiveInputControls = input.required<DirectiveTreeData>();
  readonly directiveOutputControls = input.required<DirectiveTreeData>();
  readonly directiveStateControls = input.required<DirectiveTreeData>();

  readonly inspect = output<{node: FlatNode; directivePosition: DirectivePosition}>();

  categoryOrder = [0, 1, 2];

  readonly panels = computed<
    {
      title: string;
      hidden: boolean;
      controls: DirectiveTreeData;
      documentation: string;
      class: string;
    }[]
  >(() => {
    return [
      {
        title: '@Inputs',
        hidden: this.directiveInputControls().dataSource.data.length === 0,
        controls: this.directiveInputControls(),
        documentation: 'https://angular.dev/api/core/input',
        class: 'cy-inputs',
      },
      {
        title: '@Outputs',
        hidden: this.directiveOutputControls().dataSource.data.length === 0,
        controls: this.directiveOutputControls(),
        documentation: 'https://angular.dev/api/core/output',
        class: 'cy-outputs',
      },
      {
        title: 'Properties',
        hidden: this.directiveStateControls().dataSource.data.length === 0,
        controls: this.directiveStateControls(),
        documentation: 'https://angular.dev/guide/templates/property-binding',
        class: 'cy-properties',
      },
    ];
  });

  readonly controlsLoaded = computed(() => {
    return (
      !!this.directiveStateControls() &&
      !!this.directiveOutputControls() &&
      !!this.directiveInputControls()
    );
  });

  updateValue({node, newValue}: {node: FlatNode; newValue: unknown}): void {
    this.controller().updateValue(node, newValue);
  }

  drop(event: CdkDragDrop<any, any>): void {
    moveItemInArray(this.categoryOrder, event.previousIndex, event.currentIndex);
  }

  handleInspect(node: FlatNode): void {
    this.inspect.emit({
      node,
      directivePosition: this.controller().directivePosition,
    });
  }
}

@Component({
  selector: 'ng-dependency-viewer',
  template: `
    <mat-accordion class="example-headers-align" multi>
      <mat-expansion-panel>
        <mat-expansion-panel-header collapsedHeight="35px" expandedHeight="35px">
          <mat-panel-title>
            <mat-chip-listbox>
              <mat-chip
                matTooltipPosition="left"
                matTooltip="Dependency injection token"
                (click)="$event.stopPropagation()"
                >{{ dependency().token }}</mat-chip
              >
            </mat-chip-listbox>
          </mat-panel-title>
          <mat-panel-description>
            <mat-chip-listbox>
              <div class="di-flags">
                @if (dependency().flags?.optional) {
                <mat-chip [highlighted]="true" color="primary">Optional</mat-chip>
                } @if (dependency().flags?.host) {
                <mat-chip [highlighted]="true" color="primary">Host</mat-chip>
                } @if (dependency().flags?.self) {
                <mat-chip [highlighted]="true" color="primary">Self</mat-chip>
                } @if (dependency().flags?.skipSelf) {
                <mat-chip [highlighted]="true" color="primary">SkipSelf</mat-chip>
                }
              </div>
            </mat-chip-listbox>
          </mat-panel-description>
        </mat-expansion-panel-header>
        <ng-resolution-path [path]="dependency().resolutionPath"></ng-resolution-path>
      </mat-expansion-panel>
    </mat-accordion>
  `,
  styles: [
    `
      .di-flags {
        display: flex;
        flex-wrap: nowrap;
      }

      :host-context(.dark-theme) ng-resolution-path {
        background: #1a1a1a;
      }

      ng-resolution-path {
        border-top: 1px solid black;
        display: block;
        overflow-x: scroll;
        background: #f3f3f3;
      }

      :host {
        mat-chip {
          --mdc-chip-container-height: 18px;
        }
      }
    `,
  ],
  imports: [MatExpansionModule, MatChipsModule, MatTooltip, ResolutionPathComponent],
})
export class DependencyViewerComponent {
  readonly dependency = input.required<SerializedInjectedService>();
}

@Component({
  selector: 'ng-injected-services',
  template: ` @for (dependency of dependencies(); track dependency.position[0]) {
    <ng-dependency-viewer [dependency]="dependency" />
    }`,
  styles: [
    `
      ng-dependency-viewer {
        border-bottom: 1px solid color-mix(in srgb, currentColor, #bdbdbd 85%);
        display: block;
      }
    `,
  ],
  imports: [DependencyViewerComponent],
})
export class InjectedServicesComponent {
  readonly controller = input.required<DirectivePropertyResolver>();

  readonly dependencies = computed<SerializedInjectedService[]>(() => {
    return this.controller().directiveMetadata?.dependencies ?? [];
  });
}
