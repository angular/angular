import {__esDecorate, __runInitializers} from 'tslib';
import {Injectable} from '@angular/core';
let HousingService = (() => {
  let _classDecorators = [
    Injectable({
      providedIn: 'root',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HousingService = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      HousingService = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    url = 'http://localhost:3000/locations';
    async getAllHousingLocations() {
      const data = await fetch(this.url);
      return (await data.json()) ?? [];
    }
    async getHousingLocationById(id) {
      const data = await fetch(`${this.url}?id=${id}`);
      const locationJson = await data.json();
      return locationJson[0] ?? {};
    }
    submitApplication(firstName, lastName, email) {
      // tslint:disable-next-line
      console.log(firstName, lastName, email);
    }
  };
  return (HousingService = _classThis);
})();
export {HousingService};
//# sourceMappingURL=housing.service.js.map
