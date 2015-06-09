import {DirectiveMetadata} from 'angular2/src/render/api';

import {MapWrapper} from 'angular2/src/facade/collection';
import {ddescribe, describe, expect, it} from 'angular2/test_lib';

export function main() {
  describe('Metadata', () => {
    describe('host', () => {
      it('should parse host configuration', () => {
        var md = DirectiveMetadata.create({
          host: MapWrapper.createFromPairs([
            ['(event)', 'eventVal'],
            ['[prop]', 'propVal'],
            ['@action', 'actionVal'],
            ['attr', 'attrVal']
          ])
        });

        expect(md.hostListeners).toEqual(MapWrapper.createFromPairs([['event', 'eventVal']]));
        expect(md.hostProperties).toEqual(MapWrapper.createFromPairs([['prop', 'propVal']]));
        expect(md.hostActions).toEqual(MapWrapper.createFromPairs([['action', 'actionVal']]));
        expect(md.hostAttributes).toEqual(MapWrapper.createFromPairs([['attr', 'attrVal']]));
      });
    });
  });
}
