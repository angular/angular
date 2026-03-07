import {Directive, signal} from '@angular/core';

@Directive({
  selector: '[hostBindingMatrix]',
  host: {
    style: 'border: 1px 2px 3px var(--help)',
    'style': 'display: block; border: 1px solid black; padding: 10px',
    class: 'static-a static-b',
    '[class]': 'classList()',
    '[class.active]': 'isActive()',
    '[class.foo-bar]': 'isFooBar()',
    '[attr.data-test]': '"test"',
    '[attr.aria-label]': '"host aria"',
    '[tabIndex]': 'disabled ? -1 : 0',
    '[id]': 'hostId()',
    '[style.padding]': '"8px"',
    '[style.padding.px]': '"8"',
    '[style.--help]': '"#fff"',
    '[style]': '"width: 200px; height: 50px;"',
    '(click)': 'onClick()',
    '(keyup.enter)': 'onKeyup($event)',
    '(window:keydown)': 'onWindowKeydown($event)',
  },
  standalone: false,
})
export class HostBindingsComponent {
  readonly disabled = signal(false);

  classList() {
    return 'dynamic-a dynamic-b';
  }

  isActive() {
    return true;
  }

  isFooBar() {
    return false;
  }

  hostId() {
    return 'host-id';
  }

  onClick() {}

  onKeyup(_event: KeyboardEvent) {}

  onWindowKeydown(_event: KeyboardEvent) {}
}
