# Angular-a Töhfə Vermək

Biz sizin Angular-a töhfə verməyinizi və onu daha da yaxşılaşdırmağınıza kömək etməyinizi çox istərdik!
Töhfəçi olaraq, aşağıdakı qaydaları izləməyinizi xahiş edirik:

- [Davranış Qaydaları](#coc)
- [Sualınız və ya Probleminiz?](#question)
- [Problemlər və Xətalar](#issue)
- [Funksiya Təklifləri](#feature)
- [Göndərmə Qaydaları](#submit)
- [Kodlaşdırma Qaydaları](#rules)
- [Commit Mesajı Qaydaları](#commit)
- [CLA-nın İmzalanması](#cla)

## <a name="coc"></a> Davranış Qaydaları

Angular-ı açıq və inklüziv saxlamağa kömək edin.
Zəhmət olmasa [Davranış Qaydalarımızı][coc] oxuyun və onlara əməl edin.

## <a name="question"></a> Sualınız və ya Probleminiz var?

GitHub məsələlərini yalnız xəta hesabatları və funksiya təklifləri üçün saxlamaq istədiyimizə görə ümumi dəstək sualları üçün issue açmayın.
Bunun əvəzinə, dəstəklə bağlı sualları [Stack Overflow](https://stackoverflow.com/questions/tagged/angular) vasitəsilə soruşmanızı tövsiyə edirik. Stack Overflow-da yeni sual yaradarkən `angular` teqini əlavə etməyi unutmayın.

Stack Overflow suallar üçün daha yaxşı yerdir, çünki:

- Stack Overflow-da kömək etməyə hazır minlərlə insan var
- Suallar və cavablar ictimai baxış üçün mövcud olur, beləliklə sualınız/cavabınız başqasına da kömək edə bilər
- Stack Overflow-un səsvermə sistemi ən yaxşı cavabların ön planda görünməsini təmin edir.

Vaxtınıza və bizim vaxtımıza qənaət etmək üçün ümumi dəstək tələb edən bütün məsələləri sistemli şəkildə bağlayacaq və insanları Stack Overflow-a yönləndirəcəyik.

Sualı real vaxtda müzakirə etmək istəyirsinizsə, [Angular icma Discord serverinə][discord] müraciət edə bilərsiniz.

## <a name="issue"></a> Xəta Tapdınız?

Mənbə kodunda xəta tapsanız, [GitHub Repozitoriyamıza][github] [məsələ göndərərək](#submit-issue) bizə kömək edə bilərsiniz.
Daha da yaxşısı, düzəlişlə [Pull Request göndərə bilərsiniz](#submit-pr).

## <a name="feature"></a> Funksiya Çatışmır?

GitHub Repozitoriyamıza [məsələ göndərərək](#submit-issue) yeni funksiya _tələb edə_ bilərsiniz.
Yeni funksiya _tətbiq etmək_ istəyirsinizsə, düzgün addımları müəyyən etmək üçün dəyişikliyin ölçüsünü nəzərə alın:

- **Böyük Funksiya** üçün əvvəlcə bir məsələ açın və müzakirə edilə bilməsi üçün təklifinizi təsvir edin.
  Bu proses səylərimizi daha yaxşı koordinasiya etməyə, işin təkrarlanmasının qarşısını almağa və dəyişikliyi uğurla layihəyə qəbul etdirməyə kömək edir.

  **Qeyd**: Sənədlərə yeni mövzu əlavə etmək və ya mövcud mövzunu əhəmiyyətli dərəcədə yenidən yazmaq böyük funksiya sayılır.

- **Kiçik Funksiyalar** hazırlanıb birbaşa [Pull Request kimi göndərilə bilər](#submit-pr).

## <a name="submit"></a> Göndərmə Qaydaları

### <a name="submit-issue"></a> Məsələ Göndərmək

Məsələ göndərməzdən əvvəl, zəhmət olmasa məsələ izləyicisini axtarın. Probleminiz üçün artıq mövcud bir məsələ ola bilər və müzakirə sizə mövcud həll yolları haqqında məlumat verə bilər.

Bütün məsələləri mümkün qədər tez həll etmək istəyirik, lakin xətanı düzəltməzdən əvvəl onu yenidən yaratmaq və təsdiqləmək lazımdır.
Xətaları yenidən yaratmaq üçün minimal bir reproduksiya təqdim etməyinizi tələb edirik.
Minimal reproduksiya ssenarisi bizə əlavə suallar soruşmadan çoxlu vacib məlumat verir.

Minimal reproduksiya xətanı (və ya kodlaşdırma problemini) tez təsdiqləməyə, həmçinin düzgün problemi həll etdiyimizi təsdiqləməyə imkan verir.

Minimal reproduksiya tələb edirik ki, maintainerlərin vaxtına qənaət edək və nəticədə daha çox xətanı düzəldə bilək.
Çox vaxt developerlər minimal reproduksiya hazırlayarkən kodlaşdırma problemlərini özləri kəşf edirlər.
Biz başa düşürük ki, bəzən daha böyük kod bazasından əsas kod parçalarını çıxarmaq çətin ola bilər, lakin düzəltməzdən əvvəl problemi izole etməmiz həqiqətən lazımdır.

Təəssüf ki, minimal reproduksiya olmadan xətaları araşdıra/düzəldə bilmirik, ona görə də əgər sizdən cavab almırıqsa, yenidən yaradılması üçün kifayət qədər məlumatı olmayan məsələni bağlayacağıq.

[Yeni məsələ şablonlarımızdan](https://github.com/angular/angular/issues/new/choose) birini seçib məsələ şablonunu doldurararaq yeni məsələlər təqdim edə bilərsiniz.

### <a name="pr-quality"></a> Töhfə Keyfiyyəti

Biz açıq mənbə töhfəsini və icma üzvlərindən gələn pull request-ləri çox dəyərləndiririk. Nəzərə alın ki, hər pull request real bir komanda üzvü tərəfindən baxılır və birləşdirilir, bu isə vaxt və səy tələb edir. Bu, digər dəyərli işdən vaxt və səy götürür. Bunu nəzərə alaraq, açılan hər icma töhfəsi pull request-i üçün minimum tələblər dəstimiz var.

1. Göndərişinizlə bağlı açıq və ya bağlı PR üçün [GitHub](https://github.com/angular/angular/pulls)-ı axtarın.
   - Mövcud səyləri təkrarlamamaq lazımdır.
2. Bir məsələ və ya pull request-in düzəltdiyiniz problemi aydın şəkildə təsvir etdiyindən və ya əlavə etmək istədiyiniz funksiya üçün dizaynı sənədləşdirdiyindən əmin olun. Məsələlər _minimal_ reproduksiya tələb edir.

3. Dizaynı əvvəlcədən bir məsələdə müzakirə etmək işinizi qəbul etməyə hazır olduğumuzu təmin etməyə kömək edir. Pull request-lər dizayn işi üçün doğru yer deyil.
   - Şübhə olduqda, hər hansı spekulyativ tətbiq işindən əvvəl əvvəlcə məsələ açın.

4. İdeal olaraq PR bir məsələ ilə əlaqəli olmalıdır, lakin bu məcburi deyil.

5. Dəyişiklik kod keyfiyyətini artırmalıdır (məs. TODO-nu həll etmək) və ya bir funksiyaya təsir etməli/onu təkmilləşdirməlidir.

6. Mikro optimallaşdırmalar yalnız real benchmark ilə təsdiqləndikdə qəbul ediləcək.

7. "help wanted" etiketlənməmiş funksiya tələblərini həll edən pull request-lər açmayın, çünki bunlar adətən pull request-ləri qəbul etməzdən əvvəl əlavə dizayn işi tələb edir.

8. Dəyişiklik yaxşı test edilmiş olmalıdır.

Pull request-iniz bu minimum tələbləri ödəmirsə, PR-ı bağlaya bilərik. Həmçinin, PR-ınız kritik dəyişiklik gətirirsə, bu kritik dəyişikliyin yaratdığı çaxnaşma səviyyəsi irəliləmək imkanımızı blok edə bilər. Bu vəziyyətdə də PR-ı bağlaya bilərik. Əks halda, Angular-a olan töhfələrinizi və coşqunuzu görmək üçün həyəcanlıyıq!

### <a name="submit-pr"></a> Pull Request (PR) Göndərmək

Pull Request (PR) göndərməzdən əvvəl aşağıdakı qaydaları nəzərə alın:

1. PR göndərməzdən əvvəl [Töhfəçi Lisenziya Müqaviləmizi (CLA)](#cla) imzalayın.
   İmzalanmış CLA olmadan kodu qəbul edə bilmərik.
   CLA imzanızla əlaqəli e-poçt ünvanı ilə bütün töhfə edilmiş Git commit-lərini yazdığınızdan əmin olun.

2. [angular/angular](https://github.com/angular/angular/fork) repo-nu [Fork](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo) edin.

3. Fork edilmiş repozitoriyanızda dəyişikliklərinizi yeni bir git branch-ında edin:

   ```shell
   git checkout -b my-fix-branch main
   ```

4. Patch-inizi **müvafiq test halları daxil olmaqla** yaradın.

5. [Kodlaşdırma Qaydalarımıza](#rules) əməl edin.

6. [developer sənədlərində][dev-doc] təsvir edildiyi kimi tam Angular test dəstini işlədin və bütün testlərin keçdiyindən əmin olun.

7. [Commit mesajı konvensiyalarımıza][commit-message-guidelines] uyğun təsviri commit mesajı istifadə edərək dəyişikliklərinizi commit edin.
   Bu konvensiyalara riayət etmək lazımdır, çünki buraxılış qeydləri avtomatik olaraq bu mesajlardan yaradılır.

   ```shell
   git commit --all
   ```

   Qeyd: isteğe bağlı commit `--all` komanda xətti seçimi redaktə edilmiş faylları avtomatik olaraq "add" və "rm" edəcək.

8. Branch-ınızı GitHub-a push edin:

   ```shell
   git push origin my-fix-branch
   ```

9. GitHub-da `angular:main`-ə pull request göndərin.

### Pull Request-i Nəzərdən Keçirmək

Angular komandası icmanın yaxşı vətəndaşları olmayan icma üzvlərinin pull request-lərini qəbul etməmək hüququnu saxlayır. Bu cür davranışa [Angular davranış qaydalarına](https://github.com/angular/code-of-conduct) əməl etməmək daxildir və Angular tərəfindən idarə edilən kanallar daxilində və ya xaricində tətbiq olunur.

#### Baxış rəyinə cavab vermək

Kod baxışları vasitəsilə dəyişikliklər tələb etsək:

1. Kodda tələb olunan yeniləmələri edin.

2. Testlərin hələ də keçdiyindən əmin olmaq üçün Angular test dəstlərini yenidən işlədin.

3. Fixup commit yaradın və GitHub repozitoriyanıza push edin (bu Pull Request-inizi yeniləyəcək):

   ```shell
   git commit --all --fixup HEAD
   git push
   ```

   Fixup commit-lərlə işləmək haqqında daha ətraflı məlumat üçün [bura](./contributing-docs/using-fixup-commits.md) baxın.

Bu qədər! Töhfəniz üçün təşəkkür edirik!

##### Commit mesajını yeniləmək

Reviewer çox vaxt commit mesajında dəyişikliklər təklif edə bilər (məsələn, dəyişiklik üçün daha çox kontekst əlavə etmək və ya [commit mesajı qaydalarımıza][commit-message-guidelines] əməl etmək üçün).
Branch-ınızdakı son commit-in commit mesajını yeniləmək üçün:

1. Branch-ınızı yoxlayın:

   ```shell
   git checkout my-fix-branch
   ```

2. Son commit-i dəyişdirin və commit mesajını redaktə edin:

   ```shell
   git commit --amend
   ```

3. GitHub repozitoriyanıza push edin:

   ```shell
   git push --force-with-lease
   ```

> QEYD:<br />
> Daha əvvəlki bir commit-in mesajını yeniləməlisinzsə, `git rebase`-i interaktiv rejimdə istifadə edə bilərsiniz.
> Daha ətraflı məlumat üçün [git sənədlərinə](https://git-scm.com/docs/git-rebase#_interactive_mode) baxın.

#### Pull request-iniz birləşdirildikdən sonra

Pull request-iniz birləşdirildikdən sonra branch-ınızı təhlükəsiz silə və dəyişiklikləri əsas (upstream) repozitoriyadan çəkə bilərsiniz:

- Uzaq branch-ı GitHub-da GitHub veb interfeysi vasitəsilə və ya aşağıdakı kimi yerli shell-dən silin:

  ```shell
  git push origin --delete my-fix-branch
  ```

- Əsas branch-ı yoxlayın:

  ```shell
  git checkout main -f
  ```

- Yerli branch-ı silin:

  ```shell
  git branch -D my-fix-branch
  ```

- Yerli `main`-inizi ən son upstream versiyası ilə yeniləyin:

  ```shell
  git pull --ff upstream main
  ```

## <a name="rules"></a> Kodlaşdırma Qaydaları

Mənbə kodu boyunca ardıcıllığı təmin etmək üçün işləyərkən bu qaydaları nəzərə alın:

- Bütün funksiyalar və ya xəta düzəlişləri bir və ya daha çox spesifikasiya (unit-testlər) ilə **test edilməlidir**.
- Bütün ictimai API metodları **sənədləşdirilməlidir**.
- [Google-un TypeScript Stil Bələdçisinə][ts-style-guide] əməl edirik, lakin bütün kodu **100 simvolda** əhatə edirik.

  Avtomatlaşdırılmış formatter mövcuddur, bax [building-and-testing-angular.md](./contributing-docs/building-and-testing-angular.md#formatting-your-source-code).

## <a name="commit"></a> Commit Mesajı Qaydaları

Git commit mesajlarımızın necə formatlanması barədə çox dəqiq qaydalarımız var:

```
<tip>(<əhatə>): <qısa xülasə>
```

Ətraflı məlumat üçün [Commit Mesajı Qaydalarına][commit-message-guidelines] baxın.

## <a name="cla"></a> CLA-nın İmzalanması

Zəhmət olmasa pull request göndərməzdən əvvəl Töhfəçi Lisenziya Müqaviləmizi (CLA) imzalayın. Hər hansı kod dəyişikliyinin qəbul edilməsi üçün CLA imzalanmalıdır. Tez bir prosesdir, söz veririk!

- Fiziki şəxslər üçün [sadə klik formasımız var][individual-cla].
- Korporasiyalar üçün [formanı çap etmək, imzalamaq və skan+e-poçt, faks və ya poçtla göndərməyiniz][corporate-cla] lazım olacaq.

Birdən çox GitHub hesabınız varsa və ya tək bir GitHub hesabı ilə əlaqəli birdən çox e-poçt ünvanınız varsa, Git commit-lərini yazmaq və pull request-lər göndərmək üçün istifadə olunan GitHub hesabının əsas e-poçt ünvanından istifadə edərək CLA-nı imzalamalısınız.

Aşağıdakı sənədlər GitHub hesabları və çoxsaylı e-poçt ünvanları ilə bağlı problemləri həll etməyə kömək edə bilər:

- https://help.github.com/articles/setting-your-commit-email-address-in-git/
- https://stackoverflow.com/questions/37245303/what-does-usera-committed-with-userb-13-days-ago-on-github-mean
- https://help.github.com/articles/about-commit-email-addresses/
- https://help.github.com/articles/blocking-command-line-pushes-that-expose-your-personal-email-address/

[coc]: https://github.com/angular/code-of-conduct/blob/main/CODE_OF_CONDUCT.md
[corporate-cla]: https://cla.developers.google.com/about/google-corporate
[dev-doc]: ./contributing-docs/building-and-testing-angular.md
[commit-message-guidelines]: ./contributing-docs/commit-message-guidelines.md
[github]: https://github.com/Tapdiq49/angular
[discord]: https://discord.gg/angular
[individual-cla]: https://cla.developers.google.com/about/google-individual
[ts-style-guide]: https://google.github.io/styleguide/tsguide.html
