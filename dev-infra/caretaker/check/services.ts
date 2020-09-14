/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fetch from 'node-fetch';

import {bold, info} from '../../utils/console';
import {BaseModule} from './base';

interface ServiceConfig {
  name: string;
  url: string;
}

/** The results of checking the status of a service */
interface StatusCheckResult {
  name: string;
  status: 'passing'|'failing';
  description: string;
  lastUpdated: Date;
}

/** List of services Angular relies on. */
export const services: ServiceConfig[] = [
  {
    url: 'https://status.us-west-1.saucelabs.com/api/v2/status.json',
    name: 'Saucelabs',
  },
  {
    url: 'https://status.npmjs.org/api/v2/status.json',
    name: 'Npm',
  },
  {
    url: 'https://status.circleci.com/api/v2/status.json',
    name: 'CircleCi',
  },
  {
    url: 'https://www.githubstatus.com/api/v2/status.json',
    name: 'Github',
  },
];

export class ServicesModule extends BaseModule<StatusCheckResult[]> {
  async retrieveData() {
    return Promise.all(services.map(service => this.getStatusFromStandardApi(service)));
  }

  async printToTerminal() {
    const statuses = await this.data;
    const serviceNameMinLength = Math.max(...statuses.map(service => service.name.length));
    info.group(bold('Service Statuses'));
    for (const status of statuses) {
      const name = status.name.padEnd(serviceNameMinLength);
      if (status.status === 'passing') {
        info(`${name} ✅`);
      } else {
        info.group(`${name} ❌ (Updated: ${status.lastUpdated.toLocaleString()})`);
        info(`  Details: ${status.description}`);
        info.groupEnd();
      }
    }
    info.groupEnd();
    info();
  }

  /** Retrieve the status information for a service which uses a standard API response. */
  async getStatusFromStandardApi(service: ServiceConfig): Promise<StatusCheckResult> {
    const result = await fetch(service.url).then(result => result.json());
    const status = result.status.indicator === 'none' ? 'passing' : 'failing';
    return {
      name: service.name,
      status,
      description: result.status.description,
      lastUpdated: new Date(result.page.updated_at)
    };
  }
}
