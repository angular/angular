import {RenderDirectiveMetadata} from 'angular2/src/core/render/api';

import {MapWrapper} from 'angular2/src/core/facade/collection';
import {ddescribe, describe, expect, it} from 'angular2/test_lib';

export function main() {
  describe('Metadata', () => {
    describe('host', () => {
      it('should parse host configuration', () => {
        var md = RenderDirectiveMetadata.create({
          host: MapWrapper.createFromPairs(
              [['(event)', 'eventVal'], ['[prop]', 'propVal'], ['attr', 'attrVal']])
        });

        expect(md.hostListeners).toEqual(MapWrapper.createFromPairs([['event', 'eventVal']]));
        expect(md.hostProperties).toEqual(MapWrapper.createFromPairs([['prop', 'propVal']]));
        expect(md.hostAttributes).toEqual(MapWrapper.createFromPairs([['attr', 'attrVal']]));
      });
    });
  });
}
