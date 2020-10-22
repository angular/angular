# Practical observable usage

Aquí tienes algunos ejemplos de dominios en los que las observables son particularmente útiles.

## Sugerencias de autocompletado

Las observables pueden simplificar la implementación de las sugerencias del autocompletado. Normalmente, un autocompletado realiza una serie de tareas:

* Recibe la información desde una entrada.
* Recorta el valor (eliminando espacios) y se asegura de que tiene una longitud mínima.
* Hacer debounce (no manda solicitudes a la API por cada tecla pulsada, sino que espera una parada entre letras).
* No se manda una solicitud si el valor es el mismo (por ejemplo, teclear un caracter y, al momento, borrarlo)
* Cancelar solicitudes AJAX activas si sus resultados van a ser invalidados por los resultados actualizados siguientes.

Escribir esto íntegramente en JavaScript puede ser bastante tedioso. Con las observables, puedes utilizar una serie de simples operadores RxJS:

<code-example path="practical-observable-usage/src/typeahead.ts" header="Typeahead"></code-example>

## Retroceso exponencial

El retroceso exponencial es una técnica en la cual vuelves a intentar la API después de un fracaso, haciendo que el tiempo entre intentos tras cada fracaso consecutivo sea cada vez más largo, con un número máximo de intentos hasta que consideras que la solicitud ha sido fallida. Esto puede ser bastante complejo de implementar con promesas y otros métodos de tracking que AJAX emplea. Con observables, es muy fácil:

<code-example path="practical-observable-usage/src/backoff.ts" header="Exponential backoff"></code-example>
