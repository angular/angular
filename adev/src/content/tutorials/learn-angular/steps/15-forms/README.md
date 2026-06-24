# Обзор форм

Формы являются важной частью многих приложений, поскольку они позволяют принимать пользовательский ввод. Давайте узнаем,
как работать с формами в Angular.

В Angular существует два типа форм: управляемые шаблонами (template-driven) и реактивные (reactive). Вы узнаете об обоих
типах в следующих нескольких уроках.

Примечание: Подробнее о [формах в Angular читайте в подробном руководстве](/guide/forms).

В этом уроке вы узнаете, как создать форму, используя подход template-driven (управляемый шаблоном).

<hr>

<docs-workflow>

<docs-step title="Создание поля ввода">

В файле `user.ts` обновите шаблон, добавив текстовое поле ввода с `id`, установленным в `framework`, и типом `text`.

```angular-html
<label for="framework">
  Favorite Framework:
  <input id="framework" type="text" />
</label>
```

</docs-step>

<docs-step title="Импорт FormsModule">

Чтобы эта форма могла использовать функции Angular, обеспечивающие привязку данных к формам, необходимо импортировать
`FormsModule`.

Импортируйте `FormsModule` из `@angular/forms` и добавьте его в массив `imports` компонента `User`.

<docs-code language="ts" highlight="[2, 7]">
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
...
imports: [FormsModule],
})
export class User {}
</docs-code>

</docs-step>

<docs-step title="Добавление привязки к значению поля ввода">

В `FormsModule` есть директива `ngModel`, которая привязывает значение поля ввода к свойству вашего класса.

Обновите поле ввода, чтобы использовать директиву `ngModel`, используя синтаксис `[(ngModel)]="favoriteFramework"` для
привязки к свойству `favoriteFramework`.

<docs-code language="html" highlight="[3]">
<label for="framework">
  Favorite Framework:
  <input id="framework" type="text" [(ngModel)]="favoriteFramework" />
</label>
</docs-code>

После внесения изменений попробуйте ввести значение в поле ввода. Обратите внимание, как оно обновляется на экране (да,
очень круто).

ПРИМЕЧАНИЕ: Синтаксис `[()]` известен как «банан в коробке» (banana in a box), но он представляет собой двустороннюю
привязку: привязку свойств и привязку событий. Подробнее читайте
в [документации Angular о двусторонней привязке данных](guide/templates/two-way-binding).

</docs-step>

</docs-workflow>

Вы сделали важный первый шаг к созданию форм с помощью Angular.

Отличная работа. Продолжаем в том же духе!
