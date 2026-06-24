# Наследование

TIP: Это руководство предполагает, что вы уже ознакомились с [Руководством по основам](essentials). Если вы новичок в
Angular, начните с него.

Компоненты Angular представляют собой классы TypeScript и используют стандартные механизмы наследования JavaScript.

Компонент может расширять любой базовый класс:

```ts
export class ListboxBase {
  value: string;
}

@Component({ ... })
export class CustomListbox extends ListboxBase {
  // CustomListbox наследует свойство `value`.
}
```

## Наследование от других компонентов и директив

Когда компонент расширяет другой компонент или директиву, он наследует часть метаданных, определенных в декораторе
базового класса, а также декорированные члены этого класса. Сюда входят привязки к хосту (host bindings), Input и Output
свойства, а также методы жизненного цикла.

```angular-ts
@Component({
  selector: 'base-listbox',
  template: `
    ...
  `,
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
  template: `
    ...
  `,
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

В приведенном выше примере `CustomListbox` наследует всю информацию, связанную с `ListboxBase`, переопределяя селектор и
шаблон собственными значениями. `CustomListbox` имеет два Input-свойства (`value` и `disabled`) и два слушателя
событий (`keydown` и `click`).

Дочерние классы в итоге получают _объединение_ всех Input и Output свойств, а также привязок к хосту своих предков и
своих собственных.

### Передача внедряемых зависимостей

Если базовый класс внедряет зависимости через параметры конструктора, дочерний класс должен явно передать эти
зависимости в `super`.

```ts
@Component({ ... })
export class ListboxBase {
  constructor(private element: ElementRef) { }
}

@Component({ ... })
export class CustomListbox extends ListboxBase {
  constructor(element: ElementRef) {
    super(element);
  }
}
```

### Переопределение методов жизненного цикла

Если базовый класс определяет метод жизненного цикла, например `ngOnInit`, то дочерний класс, который также реализует
`ngOnInit`, _переопределяет_ реализацию базового класса. Если вы хотите сохранить выполнение метода жизненного цикла
базового класса, явно вызовите этот метод через `super`:

```ts
@Component({ ... })
export class ListboxBase {
  protected isInitialized = false;
  ngOnInit() {
    this.isInitialized = true;
  }
}

@Component({ ... })
export class CustomListbox extends ListboxBase {
  override ngOnInit() {
    super.ngOnInit();
    /* ... */
  }
}
```
