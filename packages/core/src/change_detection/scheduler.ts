import type {ApplicationRef} from '../application_ref';

export abstract class ChangeDetectionScheduler {
  abstract notify(): void;
}

export class AnimationFrameScheduler implements ChangeDetectionScheduler {
  private isScheduled = false;

  constructor(private appRef: ApplicationRef) {}

  notify(): void {
    if (this.isScheduled) return;
    this.isScheduled = true;

    requestAnimationFrame(() => {
      try {
        this.appRef.tick();
      } finally {
        this.isScheduled = false;
      }
    });
  }
}
