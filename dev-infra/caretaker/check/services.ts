/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fetch from 'node-fetch';

import {bold, green, info, red} from '../../utils/console';

/** The status levels for services. */
enum ServiceStatus {
  GREEN,
  RED
}

/** The results of checking the status of a service */
interface StatusCheckResult {
  status: ServiceStatus;
  description: string;
  lastUpdated: Date;
}

/** Retrieve and log stasuses for all of the services of concern. */
export async function printServiceStatuses() {
  info.group(bold(`Service Statuses (checked: ${new Date().toLocaleString()})`));
  logStatus('CircleCI', await getCircleCiStatus());
  logStatus('Github', await getGithubStatus());
  logStatus('NPM', await getNpmStatus());
  logStatus('Saucelabs', await getSaucelabsStatus());
  info.groupEnd();
  info();
}


/** Log the status of the service to the console. */
function logStatus(serviceName: string, status: StatusCheckResult) {
  serviceName = serviceName.padEnd(15);
  if (status.status === ServiceStatus.GREEN) {
    info(`${serviceName} ${green('✅')}`);
  } else if (status.status === ServiceStatus.RED) {
    info.group(`${serviceName} ${red('❌')} (Updated: ${status.lastUpdated.toLocaleString()})`);
    info(`  Details: ${status.description}`);
    info.groupEnd();
  }
}

/** Gets the service status information for Saucelabs. */
async function getSaucelabsStatus(): Promise<StatusCheckResult> {
  return getStatusFromStandardApi('https://status.us-west-1.saucelabs.com/api/v2/status.json');
}

/** Gets the service status information for NPM. */
async function getNpmStatus(): Promise<StatusCheckResult> {
  return getStatusFromStandardApi('https://status.npmjs.org/api/v2/status.json');
}

/** Gets the service status information for CircleCI. */
async function getCircleCiStatus(): Promise<StatusCheckResult> {
  return getStatusFromStandardApi('https://status.circleci.com/api/v2/status.json');
}

/** Gets the service status information for Github. */
async function getGithubStatus(): Promise<StatusCheckResult> {
  return getStatusFromStandardApi('https://www.githubstatus.com/api/v2/status.json');
}

/** Retrieve the status information for a service which uses a standard API response. */
async function getStatusFromStandardApi(url: string) {
  const result = await fetch(url).then(result => result.json());
  const status = result.status.indicator === 'none' ? ServiceStatus.GREEN : ServiceStatus.RED;
  return {
    status,
    description: result.status.description,
    lastUpdated: new Date(result.page.updated_at)
  };
}
