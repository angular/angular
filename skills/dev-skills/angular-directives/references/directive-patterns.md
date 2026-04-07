# Angular Directive Patterns

## Table of Contents
- [DOM Manipulation](#dom-manipulation)
- [Form Directives](#form-directives)
- [Intersection Observer](#intersection-observer)
- [Resize Observer](#resize-observer)
- [Drag and Drop](#drag-and-drop)
- [Permission Directive](#permission-directive)

## DOM Manipulation

### Auto-Focus Directive

```typescript
@Directive({
  selector: '[appAutoFocus]',
})
export class AutoFocus {
  #el = inject(ElementRef<HTMLElement>);
  
  enabled = input(true, { alias: 'appAutoFocus', transform: booleanAttribute });
  delay = input(0);
  
  constructor() {
    afterNextRender(() => {
      if (this.enabled()) {
        setTimeout(() => {
          this.#el.nativeElement.focus();
        }, this.delay());
      }
    });
  }
}

// Usage: <input appAutoFocus />
// Usage: <input [appAutoFocus]="shouldFocus()" [delay]="100" />
```

### Text Selection Directive

```typescript
@Directive({
  selector: '[appSelectAll]',
  host: {
    '(focus)': 'onFocus()',
    '(click)': 'onClick($event)',
  },
})
export class SelectAll {
  #el = inject(ElementRef<HTMLInputElement>);
  
  onFocus() {
    // Delay to ensure value is set
    setTimeout(() => this.#el.nativeElement.select(), 0);
  }
  
  onClick(event: MouseEvent) {
    // Select all on first click if not already focused
    if (document.activeElement !== this.#el.nativeElement) {
      this.#el.nativeElement.select();
    }
  }
}

// Usage: <input appSelectAll value="Select me on focus" />
```

### Copy to Clipboard

```typescript
@Directive({
  selector: '[appCopyToClipboard]',
  host: {
    '(click)': 'copy()',
    '[style.cursor]': '"pointer"',
  },
})
export class CopyToClipboard {
  text = input.required<string>({ alias: 'appCopyToClipboard' });
  
  copied = output<void>();
  error = output<Error>();
  
  async copy() {
    try {
      await navigator.clipboard.writeText(this.text());
      this.copied.emit();
    } catch (err) {
      this.error.emit(err as Error);
    }
  }
}

// Usage: 
// <button [appCopyToClipboard]="textToCopy" (copied)="showToast('Copied!')">
//   Copy
// </button>
```

## Form Directives

### Trim Input

```typescript
@Directive({
  selector: 'input[appTrim], textarea[appTrim]',
  host: {
    '(blur)': 'onBlur()',
  },
})
export class Trim {
  #el = inject(ElementRef<HTMLInputElement | HTMLTextAreaElement>);
  #ngControl = inject(NgControl, { optional: true, self: true });

  onBlur() {
    const value = this.#el.nativeElement.value;
    const trimmed = value.trim();

    if (value !== trimmed) {
      this.#el.nativeElement.value = trimmed;
      this.#ngControl?.control?.setValue(trimmed);
    }
  }
}

// Usage: <input appTrim formControlName="name" />
```

### Input Mask

```typescript
@Directive({
  selector: '[appMask]',
  host: {
    '(input)': 'onInput($event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class Mask {
  #el = inject(ElementRef<HTMLInputElement>);
  
  // Mask pattern: 9 = digit, A = letter, * = any
  mask = input.required<string>({ alias: 'appMask' });
  
  onInput(event: InputEvent) {
    const input = this.#el.nativeElement;
    const value = input.value;
    const masked = this.applyMask(value);
    
    if (value !== masked) {
      input.value = masked;
    }
  }
  
  onKeydown(event: KeyboardEvent) {
    // Allow navigation keys
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)) {
      return;
    }
    
    const input = this.#el.nativeElement;
    const position = input.selectionStart ?? 0;
    const maskChar = this.mask()[position];
    
    if (!maskChar) {
      event.preventDefault();
      return;
    }
    
    if (!this.isValidChar(event.key, maskChar)) {
      event.preventDefault();
    }
  }
  
  #applyMask(value: string): string {
    const mask = this.mask();
    let result = '';
    let valueIndex = 0;
    
    for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
      const maskChar = mask[i];
      const inputChar = value[valueIndex];
      
      if (maskChar === '9' || maskChar === 'A' || maskChar === '*') {
        if (this.isValidChar(inputChar, maskChar)) {
          result += inputChar;
          valueIndex++;
        } else {
          valueIndex++;
          i--;
        }
      } else {
        result += maskChar;
        if (inputChar === maskChar) {
          valueIndex++;
        }
      }
    }
    
    return result;
  }
  
  #isValidChar(char: string, maskChar: string): boolean {
    switch (maskChar) {
      case '9': return /\d/.test(char);
      case 'A': return /[a-zA-Z]/.test(char);
      case '*': return /[a-zA-Z0-9]/.test(char);
      default: return char === maskChar;
    }
  }
}

// Usage: <input appMask="(999) 999-9999" placeholder="(555) 123-4567" />
```

### Character Counter

```typescript
@Directive({
  selector: '[appCharCount]',
})
export class CharCount {
  #el = inject(ElementRef<HTMLInputElement | HTMLTextAreaElement>);
  
  maxLength = input.required<number>({ alias: 'appCharCount' });
  
  currentLength = signal(0);
  remaining = computed(() => this.maxLength() - this.currentLength());
  isOverLimit = computed(() => this.remaining() < 0);
  
  constructor() {
    effect(() => {
      this.currentLength.set(this.#el.nativeElement.value.length);
    });

    // Listen for input changes
    afterNextRender(() => {
      this.#el.nativeElement.addEventListener('input', () => {
        this.currentLength.set(this.#el.nativeElement.value.length);
      });
    });
  }
}

// Usage with template:
// <textarea appCharCount="500" #counter="appCharCount"></textarea>
// <span>{{ counter.remaining() }} characters remaining</span>
```

## Intersection Observer

### Lazy Load Directive

```typescript
@Directive({
  selector: '[appLazyLoad]',
})
export class LazyLoad implements OnDestroy {
  #el = inject(ElementRef<HTMLElement>);
  #observer: IntersectionObserver | null = null;
  
  src = input.required<string>({ alias: 'appLazyLoad' });
  placeholder = input('/assets/placeholder.png');
  
  loaded = output<void>();
  
  constructor() {
    afterNextRender(() => {
      this.setupObserver();
    });
  }
  
  #setupObserver() {
    this.#observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.#loadImage();
            this.#observer?.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    this.#observer.observe(this.#el.nativeElement);

    // Set placeholder
    if (this.#el.nativeElement instanceof HTMLImageElement) {
      this.#el.nativeElement.src = this.placeholder();
    }
  }

  #loadImage() {
    const element = this.#el.nativeElement;
    
    if (element instanceof HTMLImageElement) {
      element.src = this.src();
      element.onload = () => this.loaded.emit();
    } else {
      element.style.backgroundImage = `url(${this.src()})`;
      this.loaded.emit();
    }
  }
  
  ngOnDestroy() {
    this.#observer?.disconnect();
  }
}

// Usage: <img [appLazyLoad]="imageUrl" alt="Lazy loaded image" />
```

### Infinite Scroll

```typescript
@Directive({
  selector: '[appInfiniteScroll]',
})
export class InfiniteScroll implements OnDestroy {
  #el = inject(ElementRef<HTMLElement>);
  #observer: IntersectionObserver | null = null;

  threshold = input(0.1);
  disabled = input(false);

  scrolled = output<void>();

  constructor() {
    afterNextRender(() => {
      this.#setupObserver();
    });

    effect(() => {
      if (this.disabled()) {
        this.#observer?.disconnect();
      } else {
        this.#setupObserver();
      }
    });
  }

  #setupObserver() {
    this.#observer?.disconnect();

    this.#observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.disabled()) {
          this.scrolled.emit();
        }
      },
      { threshold: this.threshold() }
    );

    this.#observer.observe(this.#el.nativeElement);
  }

  ngOnDestroy() {
    this.#observer?.disconnect();
  }
}

// Usage:
// <div class="list">
//   @for (item of items(); track item.id) {
//     <div>{{ item.name }}</div>
//   }
//   <div appInfiniteScroll (scrolled)="loadMore()" [disabled]="isLoading()">
//     Loading...
//   </div>
// </div>
```

## Resize Observer

```typescript
@Directive({
  selector: '[appResize]',
})
export class Resize implements OnDestroy {
  #el = inject(ElementRef<HTMLElement>);
  #observer: ResizeObserver | null = null;
  
  width = signal(0);
  height = signal(0);
  
  resized = output<{ width: number; height: number }>();
  
  constructor() {
    afterNextRender(() => {
      this.#observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        const { width, height } = entry.contentRect;

        this.width.set(width);
        this.height.set(height);
        this.resized.emit({ width, height });
      });

      this.#observer.observe(this.#el.nativeElement);
    });
  }

  ngOnDestroy() {
    this.#observer?.disconnect();
  }
}

// Usage:
// <div appResize #resize="appResize">
//   Size: {{ resize.width() }}x{{ resize.height() }}
// </div>
```

## Drag and Drop

```typescript
@Directive({
  selector: '[appDraggable]',
  host: {
    'draggable': 'true',
    '[class.dragging]': 'isDragging()',
    '(dragstart)': 'onDragStart($event)',
    '(dragend)': 'onDragEnd($event)',
  },
})
export class Draggable {
  data = input<any>(null, { alias: 'appDraggable' });
  effectAllowed = input<DataTransfer['effectAllowed']>('move');
  
  isDragging = signal(false);
  
  dragStart = output<DragEvent>();
  dragEnd = output<DragEvent>();
  
  onDragStart(event: DragEvent) {
    this.isDragging.set(true);
    
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = this.effectAllowed();
      event.dataTransfer.setData('application/json', JSON.stringify(this.data()));
    }
    
    this.dragStart.emit(event);
  }
  
  onDragEnd(event: DragEvent) {
    this.isDragging.set(false);
    this.dragEnd.emit(event);
  }
}

@Directive({
  selector: '[appDropZone]',
  host: {
    '[class.drag-over]': 'isDragOver()',
    '(dragover)': 'onDragOver($event)',
    '(dragleave)': 'onDragLeave($event)',
    '(drop)': 'onDrop($event)',
  },
})
export class DropZone {
  isDragOver = signal(false);
  
  dropped = output<DragEvent['dataTransfer']['items'][0]>();
  
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(true);
  }
  
  onDragLeave(event: DragEvent) {
    this.isDragOver.set(false);
  }
  
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(false);
    
    const data = event.dataTransfer?.getData('application/json');
    if (data) {
      this.dropped.emit(JSON.parse(data));
    }
  }
}

// Usage:
// <div [appDraggable]="item">Drag me</div>
// <div appDropZone (dropped)="onItemDropped($event)">Drop here</div>
```

## Permission Directive

```typescript
@Directive({
  selector: '[appHasPermission]',
})
export class HasPermission {
  #templateRef = inject(TemplateRef<any>);
  #viewContainer = inject(ViewContainerRef);
  #authService = inject(Auth);
  #hasView = signal<boolean>(false);
  
  permission = input.required<string | string[]>({ alias: 'appHasPermission' });
  mode = input<'any' | 'all'>('any');
  
  constructor() {
    effect(() => {
      const hasPermission = this.#checkPermission();

      if (hasPermission && !this.#hasView()) {
        this.#viewContainer.createEmbeddedView(this.#templateRef);
        this.#hasView.set(true);
      } else if (!hasPermission && this.#hasView()) {
        this.#viewContainer.clear();
        this.#hasView.set(false)
      }
    });
  }
  
  #checkPermission(): boolean {
    const required = this.permission();
    const permissions = Array.isArray(required) ? required : [required];
    const userPermissions = this.#authService.permissions();
    
    if (this.mode() === 'all') {
      return permissions.every(p => userPermissions.includes(p));
    }
    
    return permissions.some(p => userPermissions.includes(p));
  }
}

// Usage:
// <button *appHasPermission="'admin'">Admin Only</button>
// <div *appHasPermission="['edit', 'delete']; mode: 'all'">Edit & Delete</div>
```

## Export Directive Reference

```typescript
@Directive({
  selector: '[appToggle]',
  exportAs: 'appToggle',
})
export class Toggle {
  isOpen = signal(false);
  
  toggle() {
    this.isOpen.update(v => !v);
  }
  
  open() {
    this.isOpen.set(true);
  }
  
  close() {
    this.isOpen.set(false);
  }
}

// Usage:
// <div appToggle #toggle="appToggle">
//   <button (click)="toggle.toggle()">Toggle</button>
//   @if (toggle.isOpen()) {
//     <div>Content</div>
//   }
// </div>
```
