import { Injector } from '@angular/core';
import { environment } from 'environments/environment';
import { LocationService } from 'app/shared/location.service';
import { MockLocationService } from 'testing/location.service';
import { Deployment } from './deployment.service';

describe('Deployment service', () => {
  describe('mode', () => {
    it('should get the mode from the environment', () => {
      environment.mode = 'foo';
      const deployment = getInjector().get(Deployment);
      expect(deployment.mode).toEqual('foo');
    });

    it('should get the mode from the `mode` query parameter if available', () => {
      const injector = getInjector();

      const locationService = injector.get(LocationService) as unknown as MockLocationService;
      locationService.search.and.returnValue({ mode: 'bar' });

      const deployment = injector.get(Deployment);
      expect(deployment.mode).toEqual('bar');
    });
  });
});

function getInjector() {
  return Injector.create({providers: [
    { provide: Deployment, deps: [LocationService] },
    { provide: LocationService, useFactory: () => new MockLocationService(''), deps: [] }
  ]});
}
