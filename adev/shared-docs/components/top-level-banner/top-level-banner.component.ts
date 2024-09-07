import {ChangeDetectionStrategy, Component, inject, input, OnInit, signal} from '@angular/core';
import {ExternalLink} from '../../directives';
import {LOCAL_STORAGE} from '../../providers';
import {IconComponent} from '../icon/icon.component';

export const STORAGE_KEY_PREFIX = 'docs-was-closed-top-banner-';

@Component({
  selector: 'docs-top-level-banner',
  imports: [ExternalLink, IconComponent],
  templateUrl: './top-level-banner.component.html',
  styleUrl: './top-level-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopLevelBannerComponent implements OnInit {
  private readonly localStorage = inject(LOCAL_STORAGE);

  /**
   * Unique identifier for the banner. This ID is required to ensure that
   * the state of the banner (e.g., whether it has been closed) is tracked
   * separately for different events or instances. Without a unique ID,
   * closing one banner could inadvertently hide other banners for different events.
   */
  id = input.required<string>();
  // Optional URL link that the banner should navigate to when clicked.
  link = input<string>();
  // Text content to be displayed in the banner.
  text = input.required<string>();

  // Whether the user has closed the banner.
  hasClosed = signal<boolean>(false);

  ngOnInit(): void {
    // Needs to be in a try/catch, because some browsers will
    // throw when using `localStorage` in private mode.
    try {
      this.hasClosed.set(this.localStorage?.getItem(this.getBannerStorageKey()) === 'true');
    } catch {
      this.hasClosed.set(false);
    }
  }

  close(): void {
    this.localStorage?.setItem(this.getBannerStorageKey(), 'true');
    this.hasClosed.set(true);
  }

  private getBannerStorageKey(): string {
    return `${STORAGE_KEY_PREFIX}${this.id()}`;
  }
}
