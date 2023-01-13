import { Injector } from '@angular/core';
import { LocalStorage, NoopStorage, SessionStorage, STORAGE_PROVIDERS } from './storage.service';
import { WindowToken } from './window';

[
  ['localStorage', LocalStorage] as const,
  ['sessionStorage', SessionStorage] as const,
].forEach(([storagePropName, storageToken]) => {
  let getStorageSpy: jasmine.Spy;
  let injector: Injector;

  beforeEach(() => {
    getStorageSpy = jasmine.createSpy(`get ${storagePropName}`);
    injector = Injector.create({
      providers: [
        STORAGE_PROVIDERS,
        {
          provide: WindowToken,
          useValue: Object.defineProperty({}, storagePropName, { get: getStorageSpy }),
        },
      ],
    });
  });

  it('should return the storage from `window`', () => {
    const mockStorage = { mock: true } as unknown as Storage;
    getStorageSpy.and.returnValue(mockStorage);

    expect(injector.get(storageToken)).toBe(mockStorage);
  });

  it('should return a no-op storage if accessing the storage on `window` errors', () => {
    getStorageSpy.and.throwError('Can\'t touch this!');

    expect(injector.get(storageToken)).toBeInstanceOf(NoopStorage);
  });
});
