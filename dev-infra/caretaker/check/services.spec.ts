
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as console from '../../utils/console';
import {buildVirtualGitClient, mockNgDevConfig, VirtualGitClient} from '../../utils/testing';

import * as servicesExports from './services';

/** Convienence access to ServicesModule symbol. */
const ServicesModule = servicesExports.ServicesModule;

describe('ServicesModule', () => {
  let getStatusFromStandardApiSpy: jasmine.Spy;
  let infoSpy: jasmine.Spy;
  let infoGroupSpy: jasmine.Spy;
  let virtualGitClient: VirtualGitClient;

  servicesExports.services.splice(
      0, Infinity, {url: 'fakeStatus.com/api.json', name: 'Service Name'});

  beforeEach(() => {
    getStatusFromStandardApiSpy = spyOn(ServicesModule.prototype, 'getStatusFromStandardApi');
    virtualGitClient = buildVirtualGitClient();
    infoGroupSpy = spyOn(console.info, 'group');
    infoSpy = spyOn(console, 'info');
  });

  describe('gathers status', () => {
    it('for each of the services', async () => {
      new ServicesModule(virtualGitClient, {caretaker: {}, ...mockNgDevConfig});

      expect(getStatusFromStandardApiSpy)
          .toHaveBeenCalledWith({url: 'fakeStatus.com/api.json', name: 'Service Name'});
    });
  });

  describe('prints the data retrieved', () => {
    it('for each service ', async () => {
      const fakeData = Promise.resolve([
        {
          name: 'Service 1',
          status: 'passing',
          description: 'Everything is working great',
          lastUpdated: new Date(0)
        },
        {
          name: 'Service 2',
          status: 'failing',
          description: 'Literally everything is broken',
          lastUpdated: new Date(0)
        },
      ]);


      const module = new ServicesModule(virtualGitClient, {caretaker: {}, ...mockNgDevConfig});
      Object.defineProperty(module, 'data', {value: fakeData});

      await module.printToTerminal();


      expect(infoGroupSpy).toHaveBeenCalledWith('Service Statuses');
      expect(infoSpy).toHaveBeenCalledWith('Service 1 ✅');
      expect(infoGroupSpy).toHaveBeenCalledWith('Service 2 ❌ (Updated: 1/1/1970, 12:00:00 AM)');
      expect(infoSpy).toHaveBeenCalledWith('  Details: Literally everything is broken');
    });
  });
});
