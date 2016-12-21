import {
  Response,
  ResponseOptions} from '@angular/http';

/**
 * Fake URLs and associated SVG documents used by tests.
 * @docs-private
 */
const FAKE_SVGS = (() => {
  const svgs = new Map<string, string>();
  svgs.set('cat.svg',
      '<svg><path id="meow"></path></svg>');

  svgs.set('dog.svg',
      '<svg><path id="woof"></path></svg>');

  svgs.set('farm-set-1.svg', `
      <svg>
        <defs>
          <g id="pig"><path id="oink"></path></g>
          <g id="cow"><path id="moo"></path></g>
        </defs>
      </svg>
  `);

  svgs.set('farm-set-2.svg', `
      <svg>
        <defs>
          <g id="cow"><path id="moo moo"></path></g>
          <g id="sheep"><path id="baa"></path></g>
        </defs>
      </svg>
  `);

  svgs.set('arrow-set.svg', `
      <svg>
        <defs>
          <svg id="left-arrow"><path id="left"></path></svg>
          <svg id="right-arrow"><path id="right"></path></svg>
        </defs>
      </svg>
  `);

  return svgs;
})();

/**
 * Returns an HTTP response for a fake SVG URL.
 * @docs-private
 */
export function getFakeSvgHttpResponse(url: string) {
  if (FAKE_SVGS.has(url)) {
    return new Response(new ResponseOptions({
      status: 200,
      body: FAKE_SVGS.get(url),
    }));
  } else {
    return new Response(new ResponseOptions({status: 404}));
  }
}
