# Наследование

TIP: Это руководство предполагает, что вы уже прочитали [Essentials Guide](essentials). Если вы новичок в Angular, начните с него.

Компоненты Angular — это классы TypeScript и участвуют в стандартной семантике наследования
JavaScript.

Компонент может расширять любой базовый класс:

```ts
export class ListboxBase {
  value: string;
}

@Component(/* ... */)
export class CustomListbox extends ListboxBase {
  // CustomListbox inherits the `value` property.
}
```

## Расширение других компонентов и директив {#extending-other-components-and-directives}

Когда компонент расширяет другой компонент или директиву, он наследует часть метаданных, определённых в
декораторе базового класса, и декорированные члены базового класса. Это включает
host bindings, inputs, outputs, методы жизненного цикла.

```angular-ts
@Component({
  selector: 'base-listbox',
  template: ` ... `,
  host: {
    '(keydown)': 'handleKey($event)',
  },
})
export class ListboxBase {
  value = input.required<string>();
  handleKey(event: KeyboardEvent) {
    /* ... */
  }
}

@Component({
  selector: 'custom-listbox',
  template: ` ... `,
  host: {
    '(click)': 'focusActiveOption()',
  },
})
export class CustomListbox extends ListboxBase {
  disabled = input(false);
  focusActiveOption() {
    /* ... */
  }
}
```

В примере выше `CustomListbox` наследует всю информацию, связанную с `ListboxBase`,
переопределяя selector и template своими значениями. У `CustomListbox` два input (`value`
и `disabled`) и два слушателя событий (`keydown` и `click`).

Дочерние классы получают _объединение_ всех inputs, outputs и host bindings предков
и своих собственных.

### Проброс внедрённых зависимостей {#forwarding-injected-dependencies}

Когда базовый класс использует `inject()` как инициализатор свойства, дочерний класс наследует свойство автоматически. Проброс через `super` не нужен.

```ts
@Component(/* ... */)
export class ListboxBase {
  protected element = inject(ElementRef);
}

@Component(/* ... */)
export class CustomListbox extends ListboxBase {
  // `element` is inherited from `ListboxBase`.
}
```

Если базовый класс внедряет зависимости как параметры конструктора, дочерний класс должен явно передать эти зависимости в `super`.

```ts
@Component(/* ... */)
export class ListboxBase {
  constructor(private element: ElementRef) {}
}

@Component(/* ... */)
export class CustomListbox extends ListboxBase {
  constructor(element: ElementRef) {
    super(element);
  }
}
```

### Переопределение методов жизненного цикла {#overriding-lifecycle-methods}

Если базовый класс определяет метод жизненного цикла, например `ngOnInit`, дочерний класс, который также
реализует `ngOnInit`, _переопределяет_ реализацию базового класса. Если нужно сохранить метод
жизненного цикла базового класса, явно вызовите метод через `super`:

```ts
@Component(/* ... */)
export class ListboxBase {
  protected isInitialized = false;
  ngOnInit() {
    this.isInitialized = true;
  }
}

@Component(/* ... */)
export class CustomListbox extends ListboxBase {
  override ngOnInit() {
    super.ngOnInit();
    /* ... */
  }
}
```
