/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, signal, WritableSignal} from '@angular/core';
import {IconComponent} from '@angular/docs';
import {RouterLink} from '@angular/router';

interface SimulationCard {
  id: number;
  clickCount: number;
  penddingEvents: number;
  isHydrated: boolean;
  isHydrating: boolean;
  strategy?: 'on-interaction' | 'on-timer';
  syntax?: string;
  title: string;
  description: string;
}

@Component({
  selector: 'adev-hydration-example',
  imports: [RouterLink, IconComponent],
  templateUrl: './hydration-example.html',
  styleUrls: ['./hydration-example.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HydrationExample {
  latency = signal(500);
  progress = signal(0);
  currentState = signal<
    'Server-Side Rendering...' | 'Initial Paint' | 'Loading Bundle' | 'Hydrated'
  >('Server-Side Rendering...');
  isInteractive = signal(false);
  eventQueue = signal<string[]>([]);
  isSimulationRunning = signal(false);

  card1 = signal<SimulationCard>({
    id: 1,
    clickCount: 0,
    penddingEvents: 0,
    isHydrated: false,
    isHydrating: true,
    title: 'Eager Module (Təcili Modul)',
    description: 'İlkin paketin (initial bundle) bir hissəsidir.',
  });
  card2 = signal<SimulationCard>({
    id: 2,
    clickCount: 0,
    penddingEvents: 0,
    isHydrated: false,
    isHydrating: true,
    title: 'Eager Module (Təcili Modul)',
    description: 'İlkin paketin (initial bundle) bir hissəsidir.',
  });
  card3 = signal<SimulationCard>({
    id: 3,
    clickCount: 0,
    penddingEvents: 0,
    isHydrated: false,
    isHydrating: false,
    strategy: 'on-interaction',
    syntax: '@defer (hydrate on interaction)',
    title: 'Interaction Module (İnteraktiv Modul)',
    description: 'Məntiq klikləmə zamanı yüklənir.',
  });
  card4 = signal<SimulationCard>({
    id: 4,
    clickCount: 0,
    penddingEvents: 0,
    isHydrated: false,
    isHydrating: false,
    strategy: 'on-timer',
    syntax: '@defer (hydrate on timer(2s))',
    title: 'Timer Module (Taymer Modulu)',
    description: '2 saniyəlik gecikmədən sonra hidratasiya olunur.',
  });

  constructor() {
    this.startLifecycle();
  }

  protected async startLifecycle() {
    if (this.isSimulationRunning()) return;
    this.isSimulationRunning.set(true);
    this.currentState.set('Server-Side Rendering...');
    this.progress.set(0);
    this.isInteractive.set(false);
    this.eventQueue.set([]);

    const resetCard = (card: SimulationCard): SimulationCard => ({
      ...card,
      clickCount: 0,
      penddingEvents: 0,
      isHydrated: false,
      isHydrating: card.strategy ? false : true,
    });

    this.card1.update(resetCard);
    this.card2.update(resetCard);
    this.card3.update(resetCard);
    this.card4.update(resetCard);

    await this.wait(1000);

    this.currentState.set('Initial Paint');
    this.progress.set(20);

    await this.wait(300);

    this.currentState.set('Loading Bundle');
    let currentP = 20;
    const interval = setInterval(
      () => {
        currentP += 1;
        if (currentP <= 100) this.progress.set(currentP);
        if (currentP >= 100) clearInterval(interval);
      },
      Math.max(this.latency() / 80, 5),
    );

    await this.wait(this.latency());

    this.currentState.set('Hydrated');
    this.isInteractive.set(true);
    this.progress.set(100);

    const hydrateCard = (card: SimulationCard): SimulationCard =>
      !card.strategy ? {...card, isHydrated: true, isHydrating: false} : card;

    this.card1.update(hydrateCard);
    this.card2.update(hydrateCard);

    const pendingEvents = this.card1().penddingEvents + this.card2().penddingEvents;
    await this.wait(800);
    if (pendingEvents > 0) {
      this.logEvent(`Replaying ${pendingEvents} queued event(s)...`);
      this.processPendingEvents(this.card1);
      this.processPendingEvents(this.card2);
    }

    await this.triggerTimerHydration(4);
    this.isSimulationRunning.set(false);
  }

  protected async triggerTimerHydration(id: number) {
    const cardSignal = this.getCardSignal(id);
    await this.wait(2000);

    if (!this.card4().isHydrated) {
      this.logEvent(`Timer fired: Hydrating Module#4`);
      cardSignal.update((c) => ({...c, isHydrating: true}));
      await this.wait(800);
      this.card4.update((c) => ({...c, isHydrating: false, isHydrated: true}));

      if (cardSignal().penddingEvents > 0) {
        this.logEvent(`Replaying ${cardSignal().penddingEvents} queued event(s)...`);
        await this.wait(600);
        this.processPendingEvents(cardSignal);
      }
    }
  }

  protected async handleCardClick(id: number) {
    const card = this.getCardSignal(id);
    if (card().isHydrated) {
      this.processAction(card);
      return;
    }

    if (card().strategy === 'on-interaction' && !card().isHydrated) {
      if (!card().isHydrating) {
        this.logEvent(`Manual trigger: Hydrating Module#${card().id}`);
        this.logEvent(`Queued click for Module#${card().id}`);
        card.update((c) => ({...c, isHydrating: true, penddingEvents: 1}));
        await this.wait(600);
        if (card().penddingEvents > 0) {
          this.logEvent(`Replaying ${card().penddingEvents} queued event(s)...`);
        }
        this.processPendingEvents(card);
        card.update((c) => ({...c, isHydrating: false, isHydrated: true}));
        return;
      }
    }

    if (!card().isHydrated) {
      this.queueClick(card);
      return;
    }
  }

  protected updateLatency(ev: any) {
    this.latency.set(parseInt(ev.target.value));
  }

  protected resetSimulation() {
    this.startLifecycle();
  }

  private async queueClick(card: WritableSignal<SimulationCard>) {
    card.update((c) => ({...c, penddingEvents: c.penddingEvents + 1}));
    this.logEvent(`Queued click for Module#${card().id}`);
  }

  private processAction(card: WritableSignal<SimulationCard>) {
    card.update((c) => ({...c, clickCount: c.clickCount + 1}));
  }

  private processPendingEvents(card: WritableSignal<SimulationCard>) {
    const pending = card().penddingEvents;
    card.update((c) => ({...c, penddingEvents: 0}));
    for (let i = 0; i < pending; i++) {
      this.processAction(card);
    }
  }

  private logEvent(msg: string) {
    this.eventQueue.update((q) => [...q, msg]);
  }

  private wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getCardSignal(id: number): WritableSignal<SimulationCard> {
    switch (id) {
      case 1:
        return this.card1;
      case 2:
        return this.card2;
      case 3:
        return this.card3;
      case 4:
        return this.card4;
      default:
        throw new Error('Invalid card id');
    }
  }
}
