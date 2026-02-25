<docs-decorative-header title="Asılılıqların yeridilməsi (DI)" imgSrc="adev/src/assets/images/dependency_injection.svg"> 
<!-- markdownlint-disable-line -->
Tətbiqiniz və testləriniz boyu kodu təkrar istifadə edin və davranışları idarə edin.
</docs-decorative-header>

Komponentlər arasında məntiqi paylaşmaq lazım olduqda, Angular [Asılılıqların yeridilməsi (dependency injection)](guide/di) dizayn nümunəsindən istifadə edir. Bu nümunə sizə "servis" yaratmağa imkan verir ki, bu da kodu tək bir mənbədən idarə edərək komponentlərə daxil etməyə (inject etməyə) şərait yaradır.

## Servislər nədir?

Servislər, tətbiq daxilində komponentlərə daxil edilə bilən (injectable) təkrar istifadə edilə bilən kod parçalarıdır.

Komponent tərifi kimi, servislər də aşağıdakılardan ibarətdir:

- **TypeScript dekoratoru**: `@Injectable` vasitəsilə sinfin Angular servisi olduğunu bəyan edir və `providedIn` xüsusiyyəti (adətən `'root'`) vasitəsilə tətbiqin hansı hissəsinin servisə daxil ola biləcəyini müəyyən edir. `'root'` dəyəri servisin tətbiqin istənilən yerindən əlçatan olmasını təmin edir.
- **TypeScript sinfi**: Servis daxil edildikdə (inject olunduqda) əlçatan olacaq kodu təyin edir.

Budur bir `Calculator` servisi nümunəsi:

```angular-ts
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class Calculator {
  add(x: number, y: number) {
    return x + y;
  }
}
```

## Servisdən necə istifadə etməli

Komponentdə servisdən istifadə etmək istədikdə aşağıdakıları etməlisiniz:

1. Servisi idxal (import) edin.
2. Servisin daxil ediləcəyi sinif sahəsini (field) bəyan edin. Sinif sahəsinə servisi yaradan daxili [`inject`](/api/core/inject) funksiyasının çağırış nəticəsini mənimsədin.

`Receipt` komponentində bu aşağıdakı kimi görünə bilər:

```angular-ts
import {Component, inject} from '@angular/core';
import {Calculator} from './calculator';

@Component({
  selector: 'app-receipt',
  template: `<h1>Ümumi məbləğ: {{ totalCost }}</h1>`,
})
export class Receipt {
  private calculator = inject(Calculator);
  totalCost = this.calculator.add(50, 25);
}
```

Bu nümunədə `Calculator` servisi, Angular-ın [`inject`](/api/core/inject) funksiyasını çağırıb ona servisi ötürməklə istifadə olunur.

## Növbəti addım

<docs-pill-row>
  <docs-pill title="Əsaslardan sonrakı addımlar" href="essentials/next-steps" />
  <docs-pill title="Dərindən dependency injection bələdçisi" href="guide/di" />
</docs-pill-row>
