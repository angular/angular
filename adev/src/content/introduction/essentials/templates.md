Dinamik istifadəçi interfeysləri yaratmaq üçün Angular-ın şablon sintaksisindən istifadə edin.
</docs-decorative-header>

Komponent şablonları yalnız statik HTML deyil — onlar komponent sinifinizdən məlumat istifadə edə və istifadəçi qarşılıqlı əlaqəsi üçün işləyicilər qura bilər.

## Dinamik mətnin göstərilməsi

Angular-da _bağlama (binding)_ komponent şablonu ilə onun məlumatları arasında dinamik əlaqə yaradır. Bu əlaqə, komponent məlumatlarındakı dəyişikliklərin render edilmiş şablonu avtomatik olaraq yeniləməsini təmin edir.

Şablonda dinamik mətn göstərmək üçün ikiqat əyri mötərizələrdən istifadə edərək bağlama yarada bilərsiniz:

```angular-ts
@Component({
  selector: 'user-profile',
  template: `<h1>Profile for {{ userName() }}</h1>`,
})
export class UserProfile {
  userName = signal('pro_programmer_123');
}
```

Angular komponenti render etdikdə, görəcəksiniz:

```html
<h1>Profile for pro_programmer_123</h1>
```

Angular, siqnalın dəyəri dəyişdikdə bağlamanı avtomatik olaraq yeniləyir. Yuxarıdakı nümunəyə əsaslanaraq, əgər `userName` siqnalının dəyərini yeniləsək:

```typescript
this.userName.set('cool_coder_789');
```

Render edilmiş səhifə yeni dəyəri əks etdirmək üçün yenilənir:

```html
<h1>Profile for cool_coder_789</h1>
```

## Dinamik property və attributların təyin edilməsi

Angular kvadrat mötərizələrlə DOM xassələrinə dinamik dəyərlərin bağlanmasını dəstəkləyir:

```angular-ts
@Component({
  /*...*/
  // Düymənin `disabled` xassəsini `isValidUserId` dəyərinə əsasən təyin edin.
  template: `<button [disabled]="!isValidUserId()">Dəyişiklikləri saxla</button>`,
})
export class UserProfile {
  isValidUserId = signal(false);
}
```

HTML _atributlarına_ da `attr.` prefiksi əlavə etməklə bağlaya bilərsiniz:

```angular-html
<!-- `<ul>` elementinin `role` atributunu `listRole` dəyərinə bağlayın. -->
<ul [attr.role]="listRole()"></ul>
```

Angular, bağlanmış dəyər dəyişdikdə DOM xassələrini və atributlarını avtomatik olaraq yeniləyir.

## İstifadəçi qarşılıqlı əlaqəsinin idarə edilməsi

Angular, mötərizələrlə şablonunuzdakı elementə hadisə dinləyicisi əlavə etməyə imkan verir:

```angular-ts
@Component({
  /*...*/
  // `cancelSubscription` metodunu çağıran 'click' hadisə işləyicisi əlavə edin.
  template: `<button (click)="cancelSubscription()">Abunəliyi ləğv et</button>`,
})
export class UserProfile {
  /* ... */

  cancelSubscription() {
    /* Hadisə işləmə kodunuz buraya gəlir. */
  }
}
```

[Hadisə](https://developer.mozilla.org/docs/Web/API/Event) obyektini dinləyicinizə ötürməyiniz lazımdırsa, funksiya çağırışının içərisində Angular-ın daxili `$event` dəyişənindən istifadə edə bilərsiniz:

```angular-ts
@Component({
  /*...*/
  // `cancelSubscription` metodunu çağıran 'click' hadisə işləyicisi əlavə edin.
  template: `<button (click)="cancelSubscription($event)">Abunəliyi ləğv et</button>`,
})
export class UserProfile {
  /* ... */

  cancelSubscription(event: Event) {
    /* Hadisə işləmə kodunuz buraya gəlir. */
  }
}
```

## `@if` və `@for` ilə control flow

Angular-ın `@if` bloku ilə şablonun hissələrini şərti olaraq gizlədib göstərə bilərsiniz:

```angular-html
<h1>İstifadəçi profili</h1>

@if (isAdmin()) {
  <h2>Admin parametrləri</h2>
  <!-- ... -->
}
```

`@if` bloku isteğe bağlı `@else` blokunu da dəstəkləyir:

```angular-html
<h1>İstifadəçi profili</h1>

@if (isAdmin()) {
  <h2>Admin parametrləri</h2>
  <!-- ... -->
} @else {
  <h2>İstifadəçi parametrləri</h2>
  <!-- ... -->
}
```

Angular-ın `@for` bloku ilə şablonun bir hissəsini dəfələrlə təkrarlaya bilərsiniz:

```angular-html
<h1>İstifadəçi profili</h1>

<ul class="user-badge-list">
  @for (badge of badges(); track badge.id) {
    <li class="user-badge">{{ badge.name }}</li>
  }
</ul>
```

Angular, yuxarıdakı nümunədə göstərildiyi kimi, `@for` tərəfindən yaradılan DOM elementlərini məlumatla əlaqələndirmək üçün `track` açar sözündən istifadə edir. Daha çox məlumat üçün [_`@for` bloklarında `track` niyə vacibdir?_](guide/templates/control-flow#why-is-track-in-for-blocks-important) bölməsinə baxın.

MƏSLƏHƏT: Angular şablonları haqqında daha çox məlumat əldə etmək istəyirsiniz? Tam təfərrüatlar üçün [Dərin Şablonlar bələdçisinə (In-depth Templates guide)](guide/templates) baxın.

## Növbəti addım

Artıq tətbiqinizdə dinamik məlumat və şablonlarınız olduğuna görə, müəyyən elementləri şərti olaraq gizlətmək, elementlər üzərində dövrə vurmaq və s. vasitəsilə şablonları necə təkmilləşdirəcəyinizi öyrənmək vaxtıdır.

<docs-pill-row>
  <docs-pill title="Asılılıq inyeksiyası ilə modul dizayn" href="essentials/dependency-injection" />
  <docs-pill title="Dərin şablonlar bələdçisi (In-depth template guide)" href="guide/templates" />
</docs-pill-row>
