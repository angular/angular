# #docregion add-localize
ng add @angular/localize
# #enddocregion add-localize

# #docregion extract-i18n-default
ng extract-i18n
# #enddocregion extract-i18n-default

# #docregion extract-i18n-output-path
ng extract-i18n --output-path src/locale
# #enddocregion extract-i18n-output-path

# #docregion extract-i18n-formats
ng extract-i18n --format=xlf
ng extract-i18n --format=xlf2
ng extract-i18n --format=xmb
ng extract-i18n --format=json
ng extract-i18n --format=arb
# #enddocregion extract-i18n-formats

# #docregion extract-i18n-out-file
ng extract-i18n --out-file source.xlf
# #enddocregion extract-i18n-out-file

# #docregion build-localize
ng build --localize
# #enddocregion build-localize

# #docregion serve-french
ng serve --configuration=fr
# #enddocregion serve-french

# #docregion build-production-french
ng build --configuration=production,fr
# #enddocregion build-production-french
