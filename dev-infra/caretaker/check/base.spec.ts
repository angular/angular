/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {BaseModule} from './base';

/** Data mocking as the "retrieved data". */
const exampleData = 'this is example data' as const;

/** A simple usage of the BaseModule to illustrate the workings built into the abstract class. */
class ConcreteBaseModule extends BaseModule<typeof exampleData> {
  async retrieveData() {
    return exampleData;
  }
  async printToTerminal() {}
}

describe('BaseModule', () => {
  let retrieveDataSpy: jasmine.Spy;

  beforeEach(() => {
    retrieveDataSpy = spyOn(ConcreteBaseModule.prototype, 'retrieveData');
  });

  it('begins retrieving data during construction', () => {
    new ConcreteBaseModule({} as any, {} as any);

    expect(retrieveDataSpy).toHaveBeenCalled();
  });

  it('makes the data available via the data attribute', async () => {
    retrieveDataSpy.and.callThrough();
    const module = new ConcreteBaseModule({} as any, {} as any);

    expect(await module.data).toBe(exampleData);
  });
});
