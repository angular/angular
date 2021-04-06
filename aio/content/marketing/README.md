# Página de colaboradores

Tenemos una contabilidad oficial de quiénes están en el Angular Team, quiénes son "colaboradores de confianza" (consulte https://team.angular.io/collaborators), etc.

El `contributors.json` debe mantenerse para mantener nuestro" organigrama "en un solo lugar coherente.

## Lista de GDE

Hay dos páginas:

- https://developers.google.com/experts/all/technology/angular
(Empleados de Google: fuente en http://google3/googledata/devsite/content/en/experts/all/technology/angular.html)
que es mantenido por Dawid Ostrowski basado en una hoja de cálculo
https://docs.google.com/spreadsheets/d/1_Ls2Kle7NxPBIG8f3OEVZ4gJZ8OCTtBxGYwMPb1TUVE/edit#gid=0.
  <!-- gkalpak: That URL doesn't seem to work any more. New URL: https://developers.google.com/programs/experts/directory/ (?) -->

- Nuestro: https://angular.io/about?group=GDE que se deriva de `contributors.json`.

Alex Eagle está investigando cómo conciliar estas dos listas.

## Sobre los datos

- Las llaves en `contributors.json` deben ser identificadores de GitHub. (La mayoría lo son actualmente, pero no todos).
   Esto nos permitirá usar GitHub como fuente predeterminada para cosas como nombre, avatar, etc.
- Las imágenes se almacenan en `aio/content/images/bios/<picture-filename>`.

## Procesando los datos

Instala https://stedolan.github.io/jq/ que es increíble.

```sh
for handle in $(jq keys[] --raw-output < aio/content/marketing/contributors.json)
do echo -e "\n$handle\n---------\n"; curl --silent -H "Authorization: token ${TOKEN}" https://api.github.com/users/$handle \
 | jq ".message,.name,.company,.blog,.bio" --raw-output
done
```

Los scripts relevantes se almacenan en `aio/scripts/contributors/`.
