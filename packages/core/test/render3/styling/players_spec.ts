/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {RenderFlags} from '@angular/core/src/render3';

import {defineComponent, getHostElement} from '../../../src/render3/index';
import {element, elementEnd, elementStart, elementStyling, elementStylingApply, load, markDirty} from '../../../src/render3/instructions';
import {PlayState, Player, PlayerHandler} from '../../../src/render3/interfaces/player';
import {RElement} from '../../../src/render3/interfaces/renderer';
import {addPlayer, getPlayers} from '../../../src/render3/players';
import {QueryList, query, queryRefresh} from '../../../src/render3/query';
import {getOrCreatePlayerContext} from '../../../src/render3/styling/util';
import {ComponentFixture} from '../render_util';

import {MockPlayer} from './mock_player';

describe('animation player access', () => {
  it('should add a player to the element', () => {
    const element = buildElement();
    expect(getPlayers(element)).toEqual([]);

    const player = new MockPlayer();
    addPlayer(element, player);
    expect(getPlayers(element)).toEqual([player]);
  });

  it('should add a player to the component host element', () => {
    const fixture = buildSuperComponent();
    const superComp = fixture.component;
    const component = superComp.query.first as Comp;

    expect(component.name).toEqual('child-comp');
    expect(getPlayers(component)).toEqual([]);

    const player = new MockPlayer();
    addPlayer(component, player);
    expect(getPlayers(component)).toEqual([player]);

    const hostElement = getHostElement(component);
    expect(getPlayers(hostElement)).toEqual([player]);
  });

  it('should add a player to an element that already contains styling', () => {
    const element = buildElementWithStyling();
    expect(getPlayers(element)).toEqual([]);

    const player = new MockPlayer();
    addPlayer(element, player);
    expect(getPlayers(element)).toEqual([player]);
  });

  it('should add a player to the element animation context and remove it once it completes', () => {
    const element = buildElement();
    const context = getOrCreatePlayerContext(element);
    expect(getPlayers(element)).toEqual([]);

    const player = new MockPlayer();
    addPlayer(element, player);
    expect(getPlayers(element)).toEqual([player]);

    player.destroy();
    expect(getPlayers(element)).toEqual([]);
  });

  it('should flush all pending animation players after change detection', () => {
    const fixture = buildComponent();
    const element = fixture.hostElement.querySelector('div') !;

    const player = new MockPlayer();
    addPlayer(element, player);

    expect(player.state).toEqual(PlayState.Pending);
    fixture.update();
    expect(player.state).toEqual(PlayState.Running);
  });

  it('should flush all animations in the given animation handler is apart of the component', () => {
    const handler = new MockPlayerHandler();

    const fixture = new ComponentFixture(Comp, {playerHandler: handler});
    fixture.update();

    const element = fixture.hostElement.querySelector('div') !;

    const p1 = new MockPlayer();
    const p2 = new MockPlayer();

    addPlayer(element, p1);
    addPlayer(element, p2);
    expect(p1.state).toEqual(PlayState.Pending);
    expect(p2.state).toEqual(PlayState.Pending);

    fixture.update();
    expect(p1.state).toEqual(PlayState.Pending);
    expect(p2.state).toEqual(PlayState.Pending);

    expect(handler.lastFlushedPlayers).toEqual([p1, p2]);
  });

  it('should only play animation players that are not associated with a parent player', () => {
    const fixture = buildComponent();
    const element = fixture.hostElement.querySelector('div') !;

    const p1 = new MockPlayer();
    const p2 = new MockPlayer();
    const pParent = new MockPlayer();
    p1.parent = pParent;

    addPlayer(element, p1);
    addPlayer(element, p2);
    addPlayer(element, pParent);

    expect(p1.state).toEqual(PlayState.Pending);
    expect(p2.state).toEqual(PlayState.Pending);
    expect(pParent.state).toEqual(PlayState.Pending);

    fixture.update();

    expect(p1.state).toEqual(PlayState.Pending);
    expect(p2.state).toEqual(PlayState.Running);
    expect(pParent.state).toEqual(PlayState.Running);
  });

  it('should not replay any previously queued players once change detection has run', () => {
    const fixture = buildComponent();
    const element = fixture.hostElement.querySelector('div') !;

    const p1 = new MockPlayer();
    const p2 = new MockPlayer();
    const p3 = new MockPlayer();

    addPlayer(element, p1);
    addPlayer(element, p2);

    expect(p1.state).toEqual(PlayState.Pending);
    expect(p2.state).toEqual(PlayState.Pending);
    expect(p3.state).toEqual(PlayState.Pending);

    fixture.update();

    expect(p1.state).toEqual(PlayState.Running);
    expect(p2.state).toEqual(PlayState.Running);
    expect(p3.state).toEqual(PlayState.Pending);

    p1.pause();
    p2.pause();
    addPlayer(element, p3);

    expect(p1.state).toEqual(PlayState.Paused);
    expect(p2.state).toEqual(PlayState.Paused);
    expect(p3.state).toEqual(PlayState.Pending);

    fixture.update();

    expect(p1.state).toEqual(PlayState.Paused);
    expect(p2.state).toEqual(PlayState.Paused);
    expect(p3.state).toEqual(PlayState.Running);
  });

  it('should not run change detection on a template if only players are being added', () => {
    const fixture = buildComponent();
    const element = fixture.hostElement.querySelector('div') !;

    let dcCount = 0;
    fixture.component.logger = () => { dcCount++; };

    const p1 = new MockPlayer();
    addPlayer(element, p1);

    expect(p1.state).toEqual(PlayState.Pending);
    expect(dcCount).toEqual(0);

    fixture.requestAnimationFrame.flush();

    expect(p1.state).toEqual(PlayState.Running);
    expect(dcCount).toEqual(0);

    const p2 = new MockPlayer();
    addPlayer(element, p2);
    markDirty(fixture.component);

    expect(p2.state).toEqual(PlayState.Pending);

    fixture.requestAnimationFrame.flush();

    expect(p2.state).toEqual(PlayState.Running);
    expect(p1.state).toEqual(PlayState.Running);
    expect(dcCount).toEqual(1);

    const p3 = new MockPlayer();
    addPlayer(element, p3);

    fixture.requestAnimationFrame.flush();

    expect(p3.state).toEqual(PlayState.Running);
    expect(p2.state).toEqual(PlayState.Running);
    expect(p1.state).toEqual(PlayState.Running);

    expect(dcCount).toEqual(1);
  });
});

function buildElement() {
  return buildComponent().hostElement.querySelector('div') as RElement;
}

function buildComponent() {
  const fixture = new ComponentFixture(Comp);
  fixture.update();
  return fixture;
}

function buildSuperComponent() {
  const fixture = new ComponentFixture(SuperComp);
  fixture.update();
  return fixture;
}

function buildElementWithStyling() {
  const fixture = new ComponentFixture(CompWithStyling);
  fixture.update();
  return fixture.hostElement.querySelector('div') as RElement;
}

class Comp {
  static ngComponentDef = defineComponent({
    type: Comp,
    exportAs: 'child',
    selectors: [['child-comp']],
    factory: () => new Comp(),
    consts: 1,
    vars: 0,
    template: (rf: RenderFlags, ctx: Comp) => {
      if (rf & RenderFlags.Create) {
        element(0, 'div');
      }
      ctx.logger();
    }
  });

  name = 'child-comp';
  logger: () => any = () => {};
}

class CompWithStyling {
  static ngComponentDef = defineComponent({
    type: CompWithStyling,
    exportAs: 'child-styled',
    selectors: [['child-styled-comp']],
    factory: () => new CompWithStyling(),
    consts: 1,
    vars: 0,
    template: (rf: RenderFlags, ctx: CompWithStyling) => {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'div');
        elementStyling(['fooClass']);
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        elementStylingApply(0);
      }
    }
  });

  name = 'child-styled-comp';
}

class SuperComp {
  static ngComponentDef = defineComponent({
    type: SuperComp,
    selectors: [['super-comp']],
    factory: () => new SuperComp(),
    consts: 3,
    vars: 0,
    template: (rf: RenderFlags, ctx: SuperComp) => {
      if (rf & RenderFlags.Create) {
        elementStart(1, 'div');
        element(2, 'child-comp', ['child', ''], ['child', 'child']);
        elementEnd();
      }
    },
    viewQuery: function(rf: RenderFlags, ctx: SuperComp) {
      if (rf & RenderFlags.Create) {
        query(0, ['child'], true);
      }
      if (rf & RenderFlags.Update) {
        let tmp: any;
        queryRefresh(tmp = load<QueryList<any>>(0)) && (ctx.query = tmp as QueryList<any>);
      }
    },
    directives: [Comp]
  });

  name = 'super-comp';
  query !: QueryList<any>;
}

class MockPlayerHandler implements PlayerHandler {
  players: Player[] = [];
  lastFlushedPlayers: Player[] = [];
  flushPlayers(): void {
    this.lastFlushedPlayers = [...this.players];
    this.players = [];
  }
  queuePlayer(player: Player): void { this.players.push(player); }
}
