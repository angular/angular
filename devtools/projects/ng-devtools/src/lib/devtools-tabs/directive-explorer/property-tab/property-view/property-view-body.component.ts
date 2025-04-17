/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag} from '@angular/cdk/drag-drop';
import {
  Component,
  ɵFramework as Framework,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import {DirectivePosition, SerializedInjectedService} from 'protocol';

import {
  DirectivePropertyResolver,
  DirectiveTreeData,
} from '../../property-resolver/directive-property-resolver';
import {FlatNode} from '../../property-resolver/element-property-resolver';
import {ResolutionPathComponent} from '../../../dependency-injection/resolution-path/resolution-path.component';
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
  readonly directivePropControls = input.required<DirectiveTreeData>();
  readonly directiveOutputControls = input.required<DirectiveTreeData>();
  readonly directiveStateControls = input.required<DirectiveTreeData>();

  readonly inspect = output<{node: FlatNode; directivePosition: DirectivePosition}>();

  protected readonly dependencies = computed(() => {
    const metadata = this.controller().directiveMetadata;
    if (!metadata) return [];
    if (!('dependencies' in metadata)) return [];
    return metadata.dependencies;
  });

  protected readonly panels = signal([
    {
      title: () => 'Inputs',
      controls: () => this.directiveInputControls(),
    },
    {
      title: () => 'Props',
      controls: () => this.directivePropControls(),
    },
    {
      title: () => 'Outputs',
      controls: () => this.directiveOutputControls(),
    },
    {
      title: () =>
        this.controller().directiveMetadata?.framework === Framework.Wiz ? 'State' : 'Properties',
      controls: () => this.directiveStateControls(),
    },
  ]);

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
    const panels = this.panels();
    moveItemInArray(panels, event.previousIndex, event.currentIndex);
    this.panels.set(Array.from(panels)); // Clone array for immutable update.
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
        <mat-expansion-panel-header collapsedHeight="2.5rem" expandedHeight="2.5rem">
          <div class="dep-data">
            <div
              class="dep-pill"
              matTooltipPosition="left"
              matTooltip="Dependency injection token"
            >{{ dependency().token }}</div>
              @if (dependency().flags?.optional) {
                <div class="dep-pill flagged">Optional</div>
              } @if (dependency().flags?.host) {
                <div class="dep-pill flagged">Host</div>
              } @if (dependency().flags?.self) {
                <div class="dep-pill flagged">Self</div>
              } @if (dependency().flags?.skipSelf) {
                <div class="dep-pill flagged">SkipSelf</div>
              }
          </div>
        </mat-expansion-panel-header>
        <ng-resolution-path [path]="dependency().resolutionPath!"></ng-resolution-path>
      </mat-expansion-panel>
    </mat-accordion>
  `,
  styles: [
    `
      :host {
        .dep-data {
          display: flex;
          flex-wrap: nowrap;
          gap: 0.5rem;
        }

        .dep-pill {
          background: color-mix(in srgb, var(--quinary-contrast), var(--senary-contrast));
          padding: 0.125rem 0.5rem;
          border-radius: 1rem;

          &.flagged {
            background: var(--quinary-contrast);
          }
        }

        .mat-expansion-panel {
          position: relative;
          border-bottom: none;
          background: none;

          mat-expansion-panel-header {
            padding-right: 1.2rem;
          }
        }

        &:not(:last-of-type) {
          .mat-expansion-panel {
            &::after {
              content: '';
              position: absolute;
              width: calc(100% - 1rem);
              height: 1px;
              background: color-mix(in srgb, var(--quinary-contrast), var(--senary-contrast));
              bottom: 0;
              left: 0.5rem;
            }

            &.mat-expanded {
              &::after {
                width: 100%;
                left: 0;
              }
            }
          }
        }
      }
    `,
  ],
  imports: [MatExpansionModule, MatTooltip, ResolutionPathComponent],
})
export class DependencyViewerComponent {
  readonly dependency = input.required<SerializedInjectedService>();
}

@Component({
  selector: 'ng-injected-services',
  template: `
    <div class="services">
      @for (dependency of dependencies(); track dependency.position[0]) {
        <ng-dependency-viewer [dependency]="dependency" />
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: 0.5rem;

        .services {
          border-radius: 0.375rem;
          background: color-mix(in srgb, var(--senary-contrast) 50%, var(--color-background) 50%);
          overflow: hidden;

          .wrapper {
            ng-dependency-viewer {
              display: block;
            }
          }
        }
    `,
  ],
  imports: [DependencyViewerComponent],
})
export class InjectedServicesComponent {
  readonly controller = input.required<DirectivePropertyResolver>();

  readonly dependencies = computed<SerializedInjectedService[]>(() => {
    const metadata = this.controller().directiveMetadata;
    if (!metadata) return [];
    if (!('dependencies' in metadata)) return [];

    return metadata.dependencies ?? [];
  });
}
