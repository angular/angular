<docs-decorative-header title="Siqnallar" imgSrc="adev/src/assets/images/signals.svg"> 
<!-- markdownlint-disable-line -->
Dinamik məlumat yaradın və idarə edin.
</docs-decorative-header>

Angular-da vəziyyəti (state) yaratmaq və idarə etmək üçün _siqnallardan_ istifadə edilir. Siqnal bir dəyərin yüngül sarğısıdır (wrapper).

Lokal vəziyyəti saxlamaq üçün siqnal yaratmaq üçün `signal` funksiyasından istifadə edin:

```typescript
import {signal} from '@angular/core';

// `signal` funksiyası ilə siqnal yaradın.
const firstName = signal('Morgan');

// Siqnal dəyərini çağırmaqla oxuyun — siqnallar funksiyalardır.
console.log(firstName());

// Yeni dəyərlə `set` metodunu çağıraraq bu siqnalın dəyərini dəyişin.
firstName.set('Jaime');

// Əvvəlki dəyərə əsaslanaraq dəyəri dəyişdirmək üçün
// `update` metodundan da istifadə edə bilərsiniz.
firstName.update((name) => name.toUpperCase());
```

Angular siqnalların harada oxunduğunu və nə zaman yeniləndiyini izləyir. Framework bu məlumatdan DOM-u yeni vəziyyətlə yeniləmək kimi əlavə işlər görür. Zamanla dəyişən siqnal dəyərlərinə cavab verə bilmək qabiliyyəti _reaktivlik_ adlanır.

## Hesablanan ifadələr

`computed` digər siqnallara əsaslanaraq öz dəyərini yaradan bir siqnaldır.

```typescript
import {signal, computed} from '@angular/core';

const firstName = signal('Morgan');
const firstNameCapitalized = computed(() => firstName().toUpperCase());

console.log(firstNameCapitalized()); // MORGAN
```

`computed` siqnal yalnız oxunur; onun `set` və ya `update` metodu yoxdur. Əvəzinə, `computed` siqnalın dəyəri onun oxuduğu siqnallardan hər hansı biri dəyişdikdə avtomatik olaraq dəyişir:

```typescript
import {signal, computed} from '@angular/core';

const firstName = signal('Morgan');
const firstNameCapitalized = computed(() => firstName().toUpperCase());
console.log(firstNameCapitalized()); // MORGAN

firstName.set('Jaime');
console.log(firstNameCapitalized()); // JAIME
```

## Komponentlərdə siqnalların istifadəsi

Vəziyyəti yaratmaq və idarə etmək üçün komponentlərinizin içərisindən `signal` və `computed`-dən istifadə edin:

```ts
@Component({
  /* ... */
})
export class UserProfile {
  isTrial = signal(false);
  isTrialExpired = signal(false);
  showTrialDuration = computed(() => this.isTrial() && !this.isTrialExpired());

  activateTrial() {
    this.isTrial.set(true);
  }
}
```

MƏSLƏHƏT: Angular Siqnalları haqqında daha çox məlumat əldə etmək istəyirsiniz? Tam təfərrüatlar üçün [Dərin Siqnallar bələdçisinə (In-depth Signals guide)](guide/signals) baxın.

## Növbəti addım

Dinamik məlumatı necə elan edib idarə edəcəyinizi öyrəndiyinizə görə, həmin məlumatı şablonların içərisində necə istifadə edəcəyinizi öyrənmək vaxtıdır.

<docs-pill-row>
  <docs-pill title="Şablonlarla dinamik interfeyslər" href="essentials/templates" />
  <docs-pill title="Dərin siqnallar bələdçisi (In-depth signals guide)" href="guide/signals" />
</docs-pill-row>
