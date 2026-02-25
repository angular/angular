# Event handling

Event handling veb tətbiqlərdə interaktiv xüsusiyyətləri mümkün edir. Bu, developer olaraq istifadəçi hərəkətlərinə — məsələn, düymə klikləri, form göndərişləri və s. — cavab verməyə imkan yaradır.

QEYD: Daha ətraflı məlumat üçün [handling user interaction in the essentials guide](/essentials/templates#istifadəçi-qarşılıqlı-əlaqəsinin-idarə-edilməsi) bölməsinə baxın.

Bu fəaliyyətdə siz event handler əlavə etməyi öyrənəcəksiniz.

<hr />

Angular-da event-lərə `()` mötərizə sintaksisi ilə binding edilir. İstədiyiniz eventi element üzərində mötərizəyə alaraq ona bir event handler təyin edirsiniz. Aşağıdakı `button` nümunəsinə baxın:

```angular-ts
@Component({
  ...
  template: `<button (click)="greet()">`
})
export class App {
  greet() {
    console.log('Hello, there 👋');
  }
}
```

Bu nümunədə `greet()` funksiyası düymə hər klik edildikdə işə düşəcək. Diqqət edin ki, `greet()` sintaksisində sonda mötərizə var.

İndi isə sıra sizdədir:

<docs-workflow>

<docs-step title="Event handler əlavə edin">
`App` class-ına `showSecretMessage()` adlı event handler funksiyasını əlavə edin. Aşağıdakı kodu implementasiya kimi istifadə edin:

```ts
showSecretMessage() {
  this.message = 'Way to go 🚀';
}
```

</docs-step>

<docs-step title="Template event-ə binding edin">
`app.ts` faylında template kodunu yeniləyərək `section` elementinin `mouseover` event-inə binding edin.

<!-- prettier-ignore -->
```angular-html
<section (mouseover)="showSecretMessage()">
```

</docs-step>

</docs-workflow>

Bir neçə addımla Angular-da ilk event handler-inizi yaratdınız. Görünür bu işdə getdikcə daha da yaxşılaşırsınız — belə davam edin.
