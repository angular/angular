import {describe, it, expect, beforeEach, ddescribe, iit, xit, el} from 'angular2/test_lib';

import {
  ComponentUrlMapper,
  RuntimeComponentUrlMapper
} from 'angular2/src/core/compiler/component_url_mapper';

export function main() {
  describe('RuntimeComponentUrlMapper', () => {
    it('should return the registered URL', () => {
      var url = 'http://path/to/component';
      var mapper = new RuntimeComponentUrlMapper();
      mapper.setComponentUrl(SomeComponent, url);
      expect(mapper.getUrl(SomeComponent)).toEqual(url);
    });

    it('should fallback to ComponentUrlMapper', () => {
      var mapper = new ComponentUrlMapper();
      var runtimeMapper = new RuntimeComponentUrlMapper();
      expect(runtimeMapper.getUrl(SomeComponent)).toEqual(mapper.getUrl(SomeComponent));
    });
  });
}

class SomeComponent {}
