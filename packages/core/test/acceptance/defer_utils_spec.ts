/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Component} from '../../src/core';
import {DeferBlockBehavior, DeferBlockState, TestBed} from '../../testing';

import {getDeferBlocks} from '../../src/render3/util/defer';

describe('@defer debugging utilities', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      deferBlockBehavior: DeferBlockBehavior.Manual,
    });
  });

  it('should get current state of a defer block', async () => {
    @Component({
      template: `
        <section>
          @defer (when false) {
            Loaded
          } @placeholder {
            Placeholder
          } @loading {
            Loading
          }
        </section>
      `,
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const [block] = await fixture.getDeferBlocks();

    await block.render(DeferBlockState.Placeholder);
    expect(getDeferBlocks(fixture.nativeElement)[0].state).toBe('placeholder');

    await block.render(DeferBlockState.Loading);
    expect(getDeferBlocks(fixture.nativeElement)[0].state).toBe('loading');

    await block.render(DeferBlockState.Complete);
    expect(getDeferBlocks(fixture.nativeElement)[0].state).toBe('complete');
  });

  it('should expose which blocks are connected to the defer block', () => {
    @Component({
      template: `
        @defer (when false) {
          No connected
        }

        @defer (when false) {
          Has loading
        } @loading (minimum 2s; after 1s) {
          Loading
        }

        @defer (when false) {
          Has all
        } @placeholder (minimum 500) {
          Placeholder
        } @loading {
          Loading
        } @error {
          Error
        }
      `,
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const blocks = getDeferBlocks(fixture.nativeElement);
    expect(blocks.length).toBe(3);
    expect(blocks[0]).toEqual(
      jasmine.objectContaining({
        loadingBlock: {exists: false, minimumTime: null, afterTime: null},
        placeholderBlock: {exists: false, minimumTime: null},
        hasErrorBlock: false,
      }),
    );
    expect(blocks[1]).toEqual(
      jasmine.objectContaining({
        loadingBlock: {exists: true, minimumTime: 2000, afterTime: 1000},
        placeholderBlock: {exists: false, minimumTime: null},
        hasErrorBlock: false,
      }),
    );
    expect(blocks[2]).toEqual(
      jasmine.objectContaining({
        loadingBlock: {exists: true, minimumTime: null, afterTime: null},
        placeholderBlock: {exists: true, minimumTime: 500},
        hasErrorBlock: true,
      }),
    );
  });

  it('should expose the triggers that were registered on the defer block', async () => {
    @Component({
      template: `
        <section>
          @defer (when false; on timer(500); on interaction) {
            Loaded
          } @placeholder {
            <button>Load</button>
          }
        </section>
      `,
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const blocks = getDeferBlocks(fixture.nativeElement);
    expect(blocks.length).toBe(1);
    expect(blocks[0].triggers).toEqual(['on interaction', 'on timer(500ms)', 'when <expression>']);
  });

  it('should return deferred blocks only under the specified DOM node', async () => {
    @Component({
      template: `
        <section>
          <div>
            <header>
              @defer (when false) {
                Loaded
              } @placeholder {
                Placeholder
              }
            </header>
          </div>

          @defer (when false) {
            Loaded
          } @placeholder {
            Placeholder
          }
        </section>

        <button>Hello</button>
      `,
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const blocks = await fixture.getDeferBlocks();

    // Render out one of the blocks so we can distinguish them.
    await blocks[1].render(DeferBlockState.Complete);

    const section = fixture.nativeElement.querySelector('section');
    const header = section.querySelector('header');
    const button = fixture.nativeElement.querySelector('button');

    expect(getDeferBlocks(section)).toEqual([
      jasmine.objectContaining({state: 'placeholder'}),
      jasmine.objectContaining({state: 'complete'}),
    ]);
    expect(getDeferBlocks(header)).toEqual([jasmine.objectContaining({state: 'placeholder'})]);
    expect(getDeferBlocks(button)).toEqual([]);
  });

  it('should be able to resolve defer blocks inside embedded views', () => {
    @Component({
      template: `
        <section>
          @if (true) {
            <div>
              @switch (1) {
                @case (1) {
                  @if (true) {
                    @defer (when false) {
                      Loaded
                    } @placeholder {
                      Placeholder
                    }
                  }
                }
              }
            </div>
          }
        </section>
      `,
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(getDeferBlocks(fixture.nativeElement)).toEqual([
      jasmine.objectContaining({state: 'placeholder'}),
    ]);
  });

  it('should be able to resolve a defer block nested inside of another defer block', async () => {
    @Component({
      template: `
        <section>
          @defer (when false) {
            Loaded root

            @defer (when false) {
              Loaded inner
            } @placeholder {
              Placeholder inner
            }
          } @placeholder {
            Placeholder root
          }
        </section>
      `,
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const [root] = await fixture.getDeferBlocks();

    expect(getDeferBlocks(fixture.nativeElement)).toEqual([
      jasmine.objectContaining({state: 'placeholder'}),
    ]);

    await root.render(DeferBlockState.Complete);
    fixture.detectChanges();

    expect(getDeferBlocks(fixture.nativeElement)).toEqual([
      jasmine.objectContaining({state: 'complete'}),
      jasmine.objectContaining({state: 'placeholder'}),
    ]);
  });

  it('should return the root nodes of the currently-rendered block', async () => {
    @Component({
      template: `
        Before
        @defer (when false) {
          <button>One</button>
          Loaded
          <span>Two</span>
        } @placeholder {
          Placeholder text
        }
        After
      `,
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    let results = getDeferBlocks(fixture.nativeElement);
    expect(results.length).toBe(1);
    expect(results[0].state).toBe('placeholder');
    expect(stringifyNodes(results[0].rootNodes)).toEqual(['Text(Placeholder text)']);

    const [block] = await fixture.getDeferBlocks();
    await block.render(DeferBlockState.Complete);

    results = getDeferBlocks(fixture.nativeElement);
    expect(results.length).toBe(1);
    expect(results[0].state).toBe('complete');
    expect(stringifyNodes(results[0].rootNodes)).toEqual([
      'Element(button, One)',
      'Text(Loaded)',
      'Element(span, Two)',
    ]);
  });

  it('should skip over TNodes that do not correspond to DOM nodes', async () => {
    @Component({
      template: `
        Before
        @defer (when false) {
          Loaded
        } @placeholder {
          @let one = 1;
          One is {{one}}
          @let two = one + 1;
          Two is {{two}}
        }
        After
      `,
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    let results = getDeferBlocks(fixture.nativeElement);
    expect(results.length).toBe(1);
    expect(results[0].state).toBe('placeholder');
    expect(stringifyNodes(results[0].rootNodes)).toEqual(['Text(One is 1)', 'Text(Two is 2)']);

    const [block] = await fixture.getDeferBlocks();
    await block.render(DeferBlockState.Complete);
  });

  function stringifyNodes(nodes: Node[]): string[] {
    return nodes.map((node) => {
      switch (node.nodeType) {
        case document.COMMENT_NODE:
          return `Comment(${node.textContent?.trim()})`;
        case document.ELEMENT_NODE:
          return `Element(${node.nodeName.toLowerCase()}, ${node.textContent?.trim()})`;
        case document.TEXT_NODE:
          return `Text(${node.textContent?.trim()})`;
        default:
          throw new Error('Unsupported node. Function may need to be updated.');
      }
    });
  }
});
