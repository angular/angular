/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, HostListener, inject} from '@angular/core';
import {Step, RECOMMENDATIONS} from './recommendations';
import {Clipboard} from '@angular/cdk/clipboard';
import {CdkMenuModule} from '@angular/cdk/menu';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {IconComponent} from '@angular/docs';
import {ActivatedRoute, Router} from '@angular/router';
import {marked} from 'marked';

interface Option {
  id: keyof Step;
  name: string;
  description: string;
}

@Component({
  selector: 'adev-update-guide',
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss',
  imports: [
    MatCheckboxModule,
    MatInputModule,
    MatCardModule,
    MatGridListModule,
    MatButtonToggleModule,
    CdkMenuModule,
    IconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AppComponent {
  protected title = '';

  protected level = 1;
  protected options: Record<string, boolean> = {
    ngUpgrade: false,
    material: false,
    windows: isWindows(),
  };

  protected readonly optionList: Option[] = [
    {id: 'ngUpgrade', name: 'ngUpgrade', description: 'to combine AngularJS & Angular'},
    {id: 'material', name: 'Angular Material', description: ''},
    {id: 'windows', name: 'Windows', description: ''},
  ];

  protected packageManager: 'npm install' | 'yarn add' = 'npm install';

  protected beforeRecommendations: Step[] = [];
  protected duringRecommendations: Step[] = [];
  protected afterRecommendations: Step[] = [];

  protected readonly versions = [
    {name: '20.0', number: 2000},
    {name: '19.0', number: 1900},
    {name: '18.0', number: 1800},
    {name: '17.0', number: 1700},
    {name: '16.0', number: 1600},
    {name: '15.0', number: 1500},
    {name: '14.0', number: 1400},
    {name: '13.0', number: 1300},
    {name: '12.0', number: 1200},
    {name: '11.0', number: 1100},
    {name: '10.2', number: 1020},
    {name: '10.1', number: 1010},
    {name: '10.0', number: 1000},
    {name: '9.1', number: 910},
    {name: '9.0', number: 900},
    {name: '8.2', number: 820},
    {name: '8.1', number: 810},
    {name: '8.0', number: 800},
    {name: '7.2', number: 720},
    {name: '7.1', number: 710},
    {name: '7.0', number: 700},
    {name: '6.1', number: 610},
    {name: '6.0', number: 600},
    {name: '5.2', number: 520},
    {name: '5.1', number: 510},
    {name: '5.0', number: 500},
    {name: '4.4', number: 440},
    {name: '4.3', number: 430},
    {name: '4.2', number: 420},
    {name: '4.1', number: 410},
    {name: '4.0', number: 400},
    {name: '2.4', number: 204},
    {name: '2.3', number: 203},
    {name: '2.2', number: 202},
    {name: '2.1', number: 201},
    {name: '2.0', number: 200},
  ];
  protected from = this.versions.find((version) => version.name === '19.0')!;
  protected to = this.versions.find((version) => version.name === '20.0')!;
  protected futureVersion = 2100;

  protected readonly steps: Step[] = RECOMMENDATIONS;

  private readonly clipboard = inject(Clipboard);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  constructor() {
    const queryMap = this.activatedRoute.snapshot.queryParamMap;
    // Detect settings in URL
    this.level = parseInt(queryMap.get('l')!, 10) || this.level;

    // Detect versions of from and to
    const versions = queryMap.get('v');
    if (versions) {
      const [from, to] = versions.split('-');
      this.from = this.versions.find((version) => version.name === from)!;
      this.to = this.versions.find((version) => version.name === to)!;
      this.showUpdatePath();
    }
  }

  @HostListener('click', ['$event.target'])
  copyCode({tagName, textContent}: Element) {
    if (tagName === 'CODE') {
      // TODO: add a toast notification
      this.clipboard.copy(textContent!);
    }
  }

  async showUpdatePath() {
    this.beforeRecommendations = [];
    this.duringRecommendations = [];
    this.afterRecommendations = [];

    // Refuse to generate recommendations for downgrades
    if (this.to.number < this.from.number) {
      alert('We do not support downgrading versions of Angular.');
      return;
    }

    const labelTitle = 'Guide to update your Angular application';
    const labelBasic = 'basic applications';
    const labelMedium = 'medium applications';
    const labelAdvanced = 'advanced applications';

    this.title = `${labelTitle} v${this.from.name} -> v${this.to.name}
    for
    ${this.level < 2 ? labelBasic : this.level < 3 ? labelMedium : labelAdvanced}`;

    // Find applicable steps and organize them into before, during, and after upgrade
    for (const step of this.steps) {
      if (step.level <= this.level && step.necessaryAsOf > this.from.number) {
        // Check Options
        // Only show steps that don't have a required option
        // Or when the user has a matching option selected
        let skip = false;
        for (const option of this.optionList) {
          // Skip steps which require an option not set by the user.
          if (step[option.id] && !this.options[option.id]) {
            skip = true;
          }

          // Skip steps which require **not** using an option which **is** set
          // by the user.
          if (step[option.id] === false && this.options[option.id]) {
            skip = true;
          }
        }
        if (skip) {
          continue;
        }

        // Render and replace variables
        step.renderedStep = await marked(this.replaceVariables(step.action));

        // If you could do it before now, but didn't have to finish it before now
        if (step.possibleIn <= this.from.number && step.necessaryAsOf >= this.from.number) {
          this.beforeRecommendations.push(step);
          // If you couldn't do it before now, and you must do it now
        } else if (step.possibleIn > this.from.number && step.necessaryAsOf <= this.to.number) {
          this.duringRecommendations.push(step);
        } else if (step.possibleIn <= this.to.number) {
          this.afterRecommendations.push(step);
        }
      }
    }

    // Update the URL so users can link to this transition
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {v: `${this.from.name}-${this.to.name}`, l: this.level},
      queryParamsHandling: 'merge',
    });

    // Tell everyone how to upgrade for v6 or earlier
    this.renderPreV6Instructions();
  }

  private getAdditionalDependencies(version: number): string {
    if (version < 500) {
      return `typescript@'>=2.1.0 <2.4.0'`;
    } else if (version < 600) {
      return `typescript@2.4.2 rxjs@^5.5.2`;
    } else {
      return `typescript@2.7.x rxjs@^6.0.0`;
    }
  }

  private getAngularVersion(version: number): string {
    if (version < 400) {
      return `'^2.0.0'`;
    } else {
      const major = Math.floor(version / 100);
      const minor = Math.floor((version - major * 100) / 10);
      return `^${major}.${minor}.0`;
    }
  }

  private async renderPreV6Instructions(): Promise<void> {
    let upgradeStep: Step;
    const additionalDeps = this.getAdditionalDependencies(this.to.number);
    const angularVersion = this.getAngularVersion(this.to.number);
    const angularPackages = [
      'animations',
      'common',
      'compiler',
      'compiler-cli',
      'core',
      'forms',
      'http',
      'platform-browser',
      'platform-browser-dynamic',
      'platform-server',
      'router',
    ];

    // Provide npm/yarn instructions for versions before 6
    if (this.to.number < 600) {
      const actionMessage = `Update all of your dependencies to the latest Angular and the right version of TypeScript.`;

      if (isWindows()) {
        const packages =
          angularPackages
            .map((packageName) => `@angular/${packageName}@${angularVersion}`)
            .join(' ') +
          ' ' +
          additionalDeps;

        upgradeStep = {
          step: 'General Update',
          action: `${actionMessage}
          If you are using Windows, you can use:

\`${this.packageManager} ${packages}\``,
        } as Step;
      } else {
        const packages = `@angular/{${angularPackages.join(',')}}@${angularVersion} ${additionalDeps}`;
        upgradeStep = {
          step: 'General update',
          action: `${actionMessage}
          If you are using Linux/Mac, you can use:

\`${this.packageManager} ${packages}\``,
        } as Step;
      }

      // Npm installs typescript wrong in v5, let's manually specify
      // https://github.com/npm/npm/issues/16813
      if (this.packageManager === 'npm install' && this.to.number === 500) {
        upgradeStep.action += `

\`npm install typescript@2.4.2 --save-exact\``;
      }

      upgradeStep.renderedStep = await marked(upgradeStep.action);

      this.duringRecommendations.push(upgradeStep);
    }
  }

  private replaceVariables(action: string): string {
    let newAction = action;
    newAction = newAction.replace(
      '${packageManagerGlobalInstall}',
      this.packageManager === 'npm install' ? 'npm install -g' : 'yarn global add',
    );
    newAction = newAction.replace('${packageManagerInstall}', this.packageManager);
    return newAction;
  }
}

/** Whether or not the user is running on a Windows OS. */
function isWindows(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const platform = navigator.platform.toLowerCase();
  return platform.includes('windows') || platform.includes('win32');
}
