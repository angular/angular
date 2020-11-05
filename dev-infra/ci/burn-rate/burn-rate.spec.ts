
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as nodeFetch from 'node-fetch';
import * as utilsConfig from '../../utils/config'
import * as console from '../../utils/console';

import {BurnRateResults, checkBurnRate} from './burn-rate';

describe('burn rate check', () => {
  let fetchSpy: jasmine.Spy;
  let infoSpy: jasmine.Spy;
  let debugSpy: jasmine.Spy;
  let getConfigSpy: jasmine.Spy;

  beforeEach(() => {
    getConfigSpy =
        spyOn(utilsConfig, 'getConfig').and.returnValue({github: {name: 'name', owner: 'owner'}});
    fetchSpy = spyOn(nodeFetch, 'default');
    infoSpy = spyOn(console, 'info');
    debugSpy = spyOn(console, 'debug');
  });

  describe('retrieves the credit usage across a set of time windows', () => {
    it('assumes Infinity credit usage when an error occurs on the API', async () => {
      fetchSpy.and.callFake((url: string) => {
        if (url.includes('last-90-days')) {
          return buildFetchResponse({message: 'this is an error'});
        }
        return buildFetchResponse({items: [{metrics: {total_credits_used: 5}}]});
      });

      const rateResponse =
          JSON.parse((await checkBurnRate({ciToken: 'token', json: true}))!) as BurnRateResults;

      expect(rateResponse.one.credits).toBe(5);
      expect(rateResponse.seven.credits).toBe(5);
      expect(rateResponse.thirty.credits).toBe(5);
      // null is expected because JSON.stringify converts Infinity to null.
      expect(rateResponse.ninety.credits).toBe(null as any);
    });

    it('calculates monthly burn rates', async () => {
      fetchSpy.and.returnValues(
          buildFetchResponse({items: [{metrics: {total_credits_used: 123}}]}),
          buildFetchResponse({items: [{metrics: {total_credits_used: 456}}]}),
          buildFetchResponse({items: [{metrics: {total_credits_used: 789}}]}),
          buildFetchResponse({items: [{metrics: {total_credits_used: 12345}}]}),
      );

      const rateResponse =
          JSON.parse((await checkBurnRate({ciToken: 'token', json: true}))!) as BurnRateResults;

      expect(rateResponse.one).toEqual({credits: 123, burnRate: 3741});
      expect(rateResponse.seven).toEqual({credits: 456, burnRate: 1981});
      expect(rateResponse.thirty).toEqual({credits: 789, burnRate: 800});
      expect(rateResponse.ninety).toEqual({credits: 12345, burnRate: 4172});
    });
  });

  describe('provides the results', () => {
    it('as output in the terminal', async () => {
      fetchSpy.and.returnValues(
          buildFetchResponse({items: [{metrics: {total_credits_used: 123}}]}),
          buildFetchResponse({items: [{metrics: {total_credits_used: 456}}]}),
          buildFetchResponse({items: [{metrics: {total_credits_used: 789}}]}),
          buildFetchResponse({items: [{metrics: {total_credits_used: 12345}}]}),
      );

      await checkBurnRate({ciToken: 'token', json: false});

      expect(infoSpy).toHaveBeenCalledWith('Credits used in last 24 hours: 123 credits');
      expect(infoSpy).toHaveBeenCalledWith('1 day:  3741/month  (367.63%)');
      expect(infoSpy).toHaveBeenCalledWith('7 day:  1981/month  (147.63%)');
      expect(infoSpy).toHaveBeenCalledWith('30 day: 800/month  ---');
      expect(infoSpy).toHaveBeenCalledWith('90 day: 4172/month  (421.50%)');
    });

    it('as json output', async () => {
      fetchSpy.and.returnValues(
          buildFetchResponse({items: [{metrics: {total_credits_used: 123}}]}),
          buildFetchResponse({items: [{metrics: {total_credits_used: 456}}]}),
          buildFetchResponse({items: [{metrics: {total_credits_used: 789}}]}),
          buildFetchResponse({items: [{metrics: {total_credits_used: 12345}}]}),
      );

      const output = await checkBurnRate({ciToken: 'token', json: true});

      expect(output).toBe(JSON.stringify({
        one: {credits: 123, burnRate: 3741},
        seven: {credits: 456, burnRate: 1981},
        thirty: {credits: 789, burnRate: 800},
        ninety: {credits: 12345, burnRate: 4172},
      }));
    });
  });
});

function buildFetchResponse(response: {[key: string]: any}) {
  return Promise.resolve({json: () => Promise.resolve(response)});
}
