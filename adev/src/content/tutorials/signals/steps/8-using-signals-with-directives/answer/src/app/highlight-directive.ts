import {Directive, HostBinding, HostListener, input, computed, signal} from '@angular/core';

@Directive({
  selector: '[highlight]',
  standalone: true,
})
export class HighlightDirective {
  // Signal inputs
  color = input<string>('yellow');
  intensity = input<number>(0.3);

  // Internal signal state
  private isHovered = signal(false);

  // Computed signal for background style
  private backgroundStyle = computed(() => {
    const baseColor = this.color();
    const alpha = this.isHovered() ? this.intensity() : this.intensity() * 0.5;

    // Simple color mapping
    const colorMap: Record<string, string> = {
      'yellow': `rgba(255, 255, 0, ${alpha})`,
      'blue': `rgba(0, 100, 255, ${alpha})`,
      'green': `rgba(0, 200, 0, ${alpha})`,
      'red': `rgba(255, 0, 0, ${alpha})`,
    };

    return colorMap[baseColor] || colorMap['yellow'];
  });

  @HostBinding('style.backgroundColor')
  get backgroundColor() {
    return this.backgroundStyle();
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.isHovered.set(true);
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.isHovered.set(false);
  }
}
