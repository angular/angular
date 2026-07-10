# Перетаскивание (drag and drop)

## Обзор {#overview}

На этой странице описаны директивы drag and drop, которые позволяют быстро создавать интерфейсы перетаскивания со следующими возможностями:

- Свободное перетаскивание
- Создание списка переупорядочиваемых перетаскиваемых элементов
- Перенос перетаскиваемых элементов между списками
- Анимации перетаскивания
- Блокировка перетаскиваемых элементов по оси или внутри элемента
- Добавление пользовательских ручек перетаскивания
- Добавление превью при перетаскивании
- Добавление пользовательского placeholder при перетаскивании

Полный справочник API см. на [странице справочника API drag and drop Angular CDK](api#angular_cdk_drag-drop).

## Перед началом {#before-you-start}

### Установка CDK {#cdk-installation}

[Component Dev Kit (CDK)](https://material.angular.dev/cdk/categories) — набор примитивов поведения для создания компонентов. Чтобы использовать директивы drag and drop, сначала установите `@angular/cdk` из npm. Это можно сделать из терминала с помощью Angular CLI:

```shell
ng add @angular/cdk
```

### Импорт drag and drop {#importing-drag-and-drop}

Чтобы использовать drag and drop, импортируйте необходимое из директив в компонент.

```ts
import {Component} from '@angular/core';
import {CdkDrag} from '@angular/cdk/drag-drop';

@Component({
  selector: 'drag-drop-example',
  templateUrl: 'drag-drop-example.html',
  imports: [CdkDrag],
})
export class DragDropExample {}
```

## Создание перетаскиваемых элементов {#create-draggable-elements}

Любой элемент можно сделать перетаскиваемым, добавив директиву `cdkDrag`. По умолчанию все перетаскиваемые элементы поддерживают свободное перетаскивание.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/overview/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/overview/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/overview/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/overview/app/app.css"/>
</docs-code-multifile>

## Создание списка переупорядочиваемых перетаскиваемых элементов {#create-a-list-of-reorderable-draggable-elements}

Добавьте директиву `cdkDropList` к родительскому элементу, чтобы сгруппировать перетаскиваемые элементы в переупорядочиваемую коллекцию. Это определяет, куда можно сбрасывать перетаскиваемые элементы. Перетаскиваемые элементы в группе drop list автоматически перестраиваются при перемещении элемента.

Директивы drag and drop не обновляют модель данных. Чтобы обновить модель данных, подпишитесь на событие `cdkDropListDropped` (после того как пользователь завершит перетаскивание) и обновите модель данных вручную.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/sorting/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/sorting/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/sorting/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/sorting/app/app.css"/>
</docs-code-multifile>

Можно использовать injection token `CDK_DROP_LIST`, который позволяет ссылаться на экземпляры `cdkDropList`. Подробнее см. [руководство по внедрению зависимостей](/guide/di) и [API injection token drop list](api/cdk/drag-drop/CDK_DROP_LIST).

## Перенос перетаскиваемых элементов между списками {#transfer-draggable-elements-between-lists}

Директива `cdkDropList` поддерживает перенос перетаскиваемых элементов между связанными drop list. Есть два способа связать один или несколько экземпляров `cdkDropList`:

- Установить свойство `cdkDropListConnectedTo` на другой drop list.
- Обернуть элементы в элемент с атрибутом `cdkDropListGroup`.

Директива `cdkDropListConnectedTo` работает как с прямой ссылкой на другой `cdkDropList`, так и со ссылкой на id другого drop-контейнера.

```html
<!-- This is valid -->
<div cdkDropList #listOne="cdkDropList" [cdkDropListConnectedTo]="[listTwo]"></div>
<div cdkDropList #listTwo="cdkDropList" [cdkDropListConnectedTo]="[listOne]"></div>

<!-- This is valid as well -->
<div cdkDropList id="list-one" [cdkDropListConnectedTo]="['list-two']"></div>
<div cdkDropList id="list-two" [cdkDropListConnectedTo]="['list-one']"></div>
```

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/connected-sorting/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/connected-sorting/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/connected-sorting/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/connected-sorting/app/app.css"/>
</docs-code-multifile>

Используйте директиву `cdkDropListGroup`, если у вас неизвестное количество связанных drop list — она автоматически настраивает соединение. Любой новый `cdkDropList`, добавленный в группу, автоматически связывается со всеми остальными списками.

```angular-html
<div cdkDropListGroup>
  <!-- All lists in here will be connected. -->
  @for (list of lists; track list) {
    <div cdkDropList></div>
  }
</div>
```

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/connected-sorting-group/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/connected-sorting-group/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/connected-sorting-group/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/connected-sorting-group/app/app.css"/>
</docs-code-multifile>

Можно использовать injection token `CDK_DROP_LIST_GROUP`, который позволяет ссылаться на экземпляры `cdkDropListGroup`. Подробнее см. [руководство по внедрению зависимостей](/guide/di) и [API injection token drop list group](api/cdk/drag-drop/CDK_DROP_LIST_GROUP).

### Выборочное перетаскивание {#selective-dragging}

По умолчанию пользователь может перемещать элементы `cdkDrag` из одного контейнера в другой связанный контейнер. Для более точного контроля над тем, какие элементы можно сбрасывать в контейнер, используйте `cdkDropListEnterPredicate`. Angular вызывает предикат всякий раз, когда перетаскиваемый элемент входит в новый контейнер. В зависимости от того, возвращает предикат true или false, элемент может быть разрешён или запрещён в новый контейнер.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/enter-predicate/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/enter-predicate/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/enter-predicate/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/enter-predicate/app/app.css"/>
</docs-code-multifile>

## Привязка данных {#attach-data}

Можно связать произвольные данные как с `cdkDrag`, так и с `cdkDropList`, установив соответственно `cdkDragData` или `cdkDropListData`. Можно подписаться на события, генерируемые обеими директивами, которые будут включать эти данные, что позволяет легко определить источник взаимодействия drag или drop.

```angular-html
@for (list of lists; track list) {
  <div cdkDropList [cdkDropListData]="list" (cdkDropListDropped)="drop($event)">
    @for (item of list; track item) {
      <div cdkDrag [cdkDragData]="item"></div>
    }
  </div>
}
```

## Настройка перетаскивания {#dragging-customizations}

### Настройка ручки перетаскивания {#customize-drag-handle}

По умолчанию пользователь может перетаскивать весь элемент `cdkDrag`. Чтобы ограничить перетаскивание только через элемент-ручку, добавьте директиву `cdkDragHandle` к элементу внутри `cdkDrag`. Можно иметь сколько угодно элементов `cdkDragHandle`.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/custom-handle/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/custom-handle/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/custom-handle/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/custom-handle/app/app.css"/>
</docs-code-multifile>

Можно использовать injection token `CDK_DRAG_HANDLE`, который позволяет ссылаться на экземпляры `cdkDragHandle`. Подробнее см. [руководство по внедрению зависимостей](/guide/di) и [API injection token drag handle](api/cdk/drag-drop/CDK_DRAG_HANDLE).

### Настройка превью перетаскивания {#customize-drag-preview}

Элемент превью становится видимым, когда элемент `cdkDrag` перетаскивается. По умолчанию превью — это клон оригинального элемента, расположенный рядом с курсором пользователя.

Чтобы настроить превью, предоставьте пользовательский шаблон через `*cdkDragPreview`. Пользовательское превью не будет соответствовать размеру оригинального перетаскиваемого элемента, поскольку не делаются предположения о содержимом элемента. Чтобы превью соответствовало размеру элемента, передайте true во вход `matchSize`.

У клонированного элемента удаляется атрибут id, чтобы избежать нескольких элементов с одинаковым id на странице. Из-за этого CSS, нацеленный на этот id, не будет применён.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/custom-preview/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/custom-preview/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/custom-preview/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/custom-preview/app/app.css"/>
</docs-code-multifile>

Можно использовать injection token `CDK_DRAG_PREVIEW`, который позволяет ссылаться на экземпляры `cdkDragPreview`. Подробнее см. [руководство по внедрению зависимостей](/guide/di) и [API injection token drag preview](api/cdk/drag-drop/CDK_DRAG_PREVIEW).

### Настройка точки вставки при перетаскивании {#customize-drag-insertion-point}

По умолчанию Angular вставляет превью `cdkDrag` в `<body>` страницы, чтобы избежать проблем с позиционированием и overflow. В некоторых случаях это может быть нежелательно, поскольку превью не получит унаследованные стили.

Можно изменить место вставки превью с помощью входа `cdkDragPreviewContainer` на `cdkDrag`. Возможные значения:

| Value                         | Description                                                                            | Advantages                                                                                                                  | Disadvantages                                                                                                                                                             |
| :---------------------------- | :------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `global`                      | Default value. Angular inserts the preview into the <body> or the closest shadow root. | Preview won't be affected by `z-index` or `overflow: hidden`. It also won't affect `:nth-child` selectors and flex layouts. | Doesn't retain inherited styles.                                                                                                                                          |
| `parent`                      | Angular inserts the preview inside the parent of the element that is being dragged.    | Preview inherits the same styles as the dragged element.                                                                    | Preview may be clipped by `overflow: hidden` or be placed under other elements due to `z-index`. Furthermore, it can affect `:nth-child` selectors and some flex layouts. |
| `ElementRef` or `HTMLElement` | Angular inserts the preview into the specified element.                                | Preview inherits styles from the specified container element.                                                               | Preview may be clipped by `overflow: hidden` or be placed under other elements due to `z-index`. Furthermore, it can affect `:nth-child` selectors and some flex layouts. |

Альтернативно можно изменить injection token `CDK_DRAG_CONFIG`, чтобы обновить `previewContainer` в конфигурации, если значение — `global` или `parent`. Подробнее см. [руководство по внедрению зависимостей](/guide/di), [API injection token drag config](api/cdk/drag-drop/CDK_DRAG_CONFIG) и [API drag drop config](api/cdk/drag-drop/DragDropConfig).

### Настройка placeholder перетаскивания {#customize-drag-placeholder}

Пока элемент `cdkDrag` перетаскивается, директива создаёт элемент placeholder, показывающий, куда элемент будет помещён при сбросе. По умолчанию placeholder — это клон перетаскиваемого элемента. Можно заменить placeholder пользовательским с помощью директивы `*cdkDragPlaceholder`:

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/custom-placeholder/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/custom-placeholder/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/custom-placeholder/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/custom-placeholder/app/app.css"/>
</docs-code-multifile>

Можно использовать injection token `CDK_DRAG_PLACEHOLDER`, который позволяет ссылаться на экземпляры `cdkDragPlaceholder`. Подробнее см. [руководство по внедрению зависимостей](/guide/di) и [API injection token drag placeholder](api/cdk/drag-drop/CDK_DRAG_PLACEHOLDER).

### Настройка корневого элемента перетаскивания {#customize-drag-root-element}

Установите атрибут `cdkDragRootElement`, если есть элемент, который нужно сделать перетаскиваемым, но у вас нет прямого доступа к нему.

Атрибут принимает селектор и просматривает DOM, пока не найдёт элемент, соответствующий селектору. Если элемент найден, он становится перетаскиваемым. Это полезно, например, для перетаскивания диалогового окна.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/root-element/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/root-element/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/root-element/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/root-element/app/app.css"/>
</docs-code-multifile>

Альтернативно можно изменить injection token `CDK_DRAG_CONFIG`, чтобы обновить `rootElementSelector` в конфигурации. Подробнее см. [руководство по внедрению зависимостей](/guide/di), [API injection token drag config](api/cdk/drag-drop/CDK_DRAG_CONFIG) и [API drag drop config](api/cdk/drag-drop/DragDropConfig).

### Установка DOM-позиции перетаскиваемого элемента {#set-dom-position-of-a-draggable-element}

По умолчанию элементы `cdkDrag`, не находящиеся в `cdkDropList`, перемещаются из обычной DOM-позиции только когда пользователь вручную перемещает элемент. Используйте вход `cdkDragFreeDragPosition`, чтобы явно задать позицию элемента. Типичный случай — восстановление позиции перетаскиваемого элемента после того, как пользователь ушёл со страницы и вернулся.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/free-drag-position/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/free-drag-position/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/free-drag-position/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/free-drag-position/app/app.css"/>
</docs-code-multifile>

### Ограничение перемещения внутри элемента {#restrict-movement-within-an-element}

Чтобы запретить пользователю перетаскивать элемент `cdkDrag` за пределы другого элемента, передайте CSS-селектор в атрибут `cdkDragBoundary`. Атрибут принимает селектор и просматривает DOM, пока не найдёт соответствующий элемент. Если совпадение найдено, элемент становится границей, за которую перетаскиваемый элемент не может выйти. `cdkDragBoundary` также можно использовать, когда `cdkDrag` размещён внутри `cdkDropList`.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/boundary/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/boundary/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/boundary/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/boundary/app/app.css"/>
</docs-code-multifile>

Альтернативно можно изменить injection token `CDK_DRAG_CONFIG`, чтобы обновить boundaryElement в конфигурации. Подробнее см. [руководство по внедрению зависимостей](/guide/di), [API injection token drag config](api/cdk/drag-drop/CDK_DRAG_CONFIG) и [API drag drop config](api/cdk/drag-drop/DragDropConfig).

### Ограничение перемещения по оси {#restrict-movement-along-an-axis}

По умолчанию `cdkDrag` позволяет свободное перемещение во всех направлениях. Чтобы ограничить перетаскивание по определённой оси, установите `cdkDragLockAxis` в «x» или «y» на `cdkDrag`. Чтобы ограничить перетаскивание для нескольких перетаскиваемых элементов внутри `cdkDropList`, установите `cdkDropListLockAxis` на `cdkDropList`.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/axis-lock/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/axis-lock/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/axis-lock/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/axis-lock/app/app.css"/>
</docs-code-multifile>

Альтернативно можно изменить injection token `CDK_DRAG_CONFIG`, чтобы обновить `lockAxis` в конфигурации. Подробнее см. [руководство по внедрению зависимостей](/guide/di), [API injection token drag config](api/cdk/drag-drop/CDK_DRAG_CONFIG) и [API drag drop config](api/cdk/drag-drop/DragDropConfig).

### Задержка перетаскивания {#delay-dragging}

По умолчанию, когда пользователь нажимает указателем на `cdkDrag`, начинается последовательность перетаскивания. Такое поведение может быть нежелательным, например, для полноэкранных перетаскиваемых элементов на сенсорных устройствах, где пользователь может случайно запустить событие перетаскивания при прокрутке страницы.

Можно задержать последовательность перетаскивания с помощью входа `cdkDragStartDelay`. Вход ожидает, пока пользователь удерживает указатель заданное количество миллисекунд, прежде чем начать перетаскивание элемента.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/delay-drag/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/delay-drag/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/delay-drag/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/delay-drag/app/app.css"/>
</docs-code-multifile>

Альтернативно можно изменить injection token `CDK_DRAG_CONFIG`, чтобы обновить dragStartDelay в конфигурации. Подробнее см. [руководство по внедрению зависимостей](/guide/di), [API injection token drag config](api/cdk/drag-drop/CDK_DRAG_CONFIG) и [API drag drop config](api/cdk/drag-drop/DragDropConfig).

### Отключение перетаскивания {#disable-dragging}

Чтобы отключить перетаскивание для конкретного элемента, установите вход `cdkDragDisabled` на элементе `cdkDrag` в true или false. Можно отключить весь список с помощью входа `cdkDropListDisabled` на `cdkDropList`. Также можно отключить конкретную ручку через `cdkDragHandleDisabled` на `cdkDragHandle`.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/disable-drag/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/disable-drag/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/disable-drag/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/disable-drag/app/app.css"/>
</docs-code-multifile>

Альтернативно можно изменить injection token `CDK_DRAG_CONFIG`, чтобы обновить `draggingDisabled` в конфигурации. Подробнее см. [руководство по внедрению зависимостей](/guide/di), [API injection token drag config](api/cdk/drag-drop/CDK_DRAG_CONFIG) и [API drag drop config](api/cdk/drag-drop/DragDropConfig).

## Настройка сортировки {#sorting-customizations}

### Ориентация списка {#list-orientation}

По умолчанию директива `cdkDropList` предполагает вертикальные списки. Это можно изменить, установив свойство `cdkDropListOrientation` в horizontal.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/horizontal-sorting/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/horizontal-sorting/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/horizontal-sorting/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/horizontal-sorting/app/app.css"/>
</docs-code-multifile>

Альтернативно можно изменить injection token `CDK_DRAG_CONFIG`, чтобы обновить `listOrientation` в конфигурации. Подробнее см. [руководство по внедрению зависимостей](/guide/di), [API injection token drag config](api/cdk/drag-drop/CDK_DRAG_CONFIG) и [API drag drop config](api/cdk/drag-drop/DragDropConfig).

### Перенос строк в списке {#list-wrapping}

По умолчанию `cdkDropList` сортирует перетаскиваемые элементы, перемещая их с помощью CSS transform. Это позволяет анимировать сортировку, что улучшает пользовательский опыт. Однако drop list работает только в одном направлении: вертикально или горизонтально.

Если у вас сортируемый список, который должен переноситься на новые строки, установите атрибут `cdkDropListOrientation` в `mixed`. Это заставляет список использовать другую стратегию сортировки элементов — перемещение в DOM. Однако список больше не может анимировать действие сортировки.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/mixed-sorting/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/mixed-sorting/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/mixed-sorting/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/mixed-sorting/app/app.css"/>
</docs-code-multifile>

### Выборочная сортировка {#selective-sorting}

По умолчанию элементы `cdkDrag` сортируются в любую позицию внутри `cdkDropList`. Чтобы изменить это поведение, установите атрибут `cdkDropListSortPredicate`, который принимает функцию. Функция-предикат вызывается, когда перетаскиваемый элемент собирается переместиться на новый индекс в drop list. Если предикат возвращает true, элемент перемещается на новый индекс, иначе остаётся на текущей позиции.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/sort-predicate/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/sort-predicate/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/sort-predicate/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/sort-predicate/app/app.css"/>
</docs-code-multifile>

### Отключение сортировки {#disable-sorting}

Бывают случаи, когда перетаскиваемые элементы можно перетащить из одного `cdkDropList` в другой, но пользователь не должен иметь возможность сортировать их внутри исходного списка. Для таких случаев добавьте атрибут `cdkDropListSortingDisabled`, чтобы запретить сортировку перетаскиваемых элементов в `cdkDropList`. Это сохраняет начальную позицию перетаскиваемого элемента в исходном списке, если он не перетащен на новую допустимую позицию.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/disable-sorting/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/disable-sorting/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/disable-sorting/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/disable-sorting/app/app.css"/>
</docs-code-multifile>

Альтернативно можно изменить injection token `CDK_DRAG_CONFIG`, чтобы обновить sortingDisabled в конфигурации. Подробнее см. [руководство по внедрению зависимостей](/guide/di), [API injection token drag config](api/cdk/drag-drop/CDK_DRAG_CONFIG) и [API drag drop config](api/cdk/drag-drop/DragDropConfig).

### Копирование элементов между списками {#copying-items-between-lists}

По умолчанию, когда элемент перетаскивается из одного списка в другой, он удаляется из исходного списка. Однако можно настроить директивы на копирование элемента, оставляя оригинал в исходном списке.

Чтобы включить копирование, установите вход `cdkDropListHasAnchor`. Это указывает `cdkDropList` создать «якорный» элемент, который остаётся в исходном контейнере и не перемещается вместе с элементом. Если пользователь вернёт элемент в исходный контейнер, якорь удаляется автоматически. Якорный элемент можно стилизовать, нацелившись на CSS-класс `.cdk-drag-anchor`.

Сочетание `cdkDropListHasAnchor` с `cdkDropListSortingDisabled` позволяет создать список, из которого пользователь может копировать элементы, не имея возможности переупорядочить исходный список (например, список товаров и корзина покупок).

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/copy-list/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/copy-list/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/copy-list/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/copy-list/app/app.css"/>
</docs-code-multifile>

## Настройка анимаций {#customize-animations}

Drag and drop поддерживает анимации для:

- Сортировки перетаскиваемого элемента внутри списка
- Перемещения перетаскиваемого элемента из позиции, куда пользователь его сбросил, в финальную позицию внутри списка

Чтобы настроить анимации, определите CSS-переход, нацеленный на свойство transform. Для анимаций можно использовать следующие классы:

| CSS class name      | Result of adding transition                                                                                                                                                                                |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| .cdk-drag           | Animate draggable elements as they are being sorted.                                                                                                                                                       |
| .cdk-drag-animating | Animate the draggable element from its dropped position to the final position within the `cdkDropList`.<br><br>This CSS class is applied to a `cdkDrag` element only when the dragging action has stopped. |

## Стилизация {#styling}

Директивы `cdkDrag` и `cdkDropList` применяют только необходимые стили для функциональности. Приложения могут настраивать стили, нацеливаясь на указанные CSS-классы.

| CSS class name           | Description                                                                                                                                                                                                                                                                                             |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| .cdk-drop-list           | Selector for the `cdkDropList` container elements.                                                                                                                                                                                                                                                      |
| .cdk-drag                | Selector for `cdkDrag` elements.                                                                                                                                                                                                                                                                        |
| .cdk-drag-disabled       | Selector for disabled `cdkDrag` elements.                                                                                                                                                                                                                                                               |
| .cdk-drag-handle         | Selector for the host element of the `cdkDragHandle`.                                                                                                                                                                                                                                                   |
| .cdk-drag-preview        | Selector for the drag preview element. This is the element that appears next to the cursor as a user drags an element in a sortable list.<br><br>The element looks exactly like the element that is being dragged unless customized with a custom template through `*cdkDragPreview`.                   |
| .cdk-drag-placeholder    | Selector for the drag placeholder element. This is the element that is shown in the spot where the draggable element will be dragged to once the dragging action ends.<br><br>This element looks exactly like the element that is being sorted unless customized with the cdkDragPlaceholder directive. |
| .cdk-drop-list-dragging  | Selector for `cdkDropList` container element that has a draggable element currently being dragged.                                                                                                                                                                                                      |
| .cdk-drop-list-disabled  | Selector for `cdkDropList` container elements that are disabled.                                                                                                                                                                                                                                        |
| .cdk-drop-list-receiving | Selector for `cdkDropList` container element that has a draggable element it can receive from a connected drop list that is currently being dragged.                                                                                                                                                    |
| .cdk-drag-anchor         | Selector for the anchor element that is created when `cdkDropListHasAnchor` is enabled. This element indicates the position from which the dragged item started.                                                                                                                                        |

## Перетаскивание в прокручиваемом контейнере {#dragging-in-a-scrollable-container}

Если перетаскиваемые элементы находятся внутри прокручиваемого контейнера (например, `div` с `overflow: auto`), автоматическая прокрутка не будет работать, пока прокручиваемый контейнер не имеет директивы `cdkScrollable`. Без неё CDK не может обнаружить или управлять поведением прокрутки контейнера во время операций перетаскивания.

## Интеграция с другими компонентами {#integrations-with-other-components}

Функциональность drag-and-drop CDK может интегрироваться с различными компонентами. Типичные случаи — сортируемые компоненты `MatTable` и сортируемые компоненты `MatTabGroup`.
