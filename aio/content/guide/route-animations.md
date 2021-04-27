# Animaciones para transición de rutas

#### Prerrequisitos

Una comprensión basica de los siguientes conceptos:

* [Introducción a animaciones en Angular](guide/animations)
* [Transición y desencadenadores](guide/transition-and-triggers)
* [Animaciones reutilizables](guide/reusable-animations)

<hr>

Enrutar permite a los usuarios navegar entre diferentes rutas de una aplicación. Cuando un usuario navega de una ruta a otra, el enrutador de Angular traza el trayecto de la URL a un componente importante y se muestra en su vista. Animar esta transición de rutas puede mejorar mucho la experiencia del usuario.

El enrutador de Angular viene con funciones de animación de alto nivel que te permiten animar las transiciones entre vistas cuando una ruta cambia. Para producir una secuencia de animación al cambiar de ruta, necesitas definir secuencias de animación anidadas. Empieza con los componentes de alto nivel que contienen la vista, y anida animaciones adicionales en los componentes que contienen las vistas integradas.

Para permitir la animación de transición de rutas, haz lo siguiente:

1. Importa el módulo enrutado dentro de la aplicación y crea una configuración de enrutamiento que defina las posibles rutas.
2. Añade un punto de salida del enrutador para indicarle al enrutador de Angular donde posicionar los componentes activados en el DOM.
3. Define la animación.

Imaginemos un enrutador de animación de transiciones mediante la navegación entre dos rutas, *Home* y *About* asociadas con las vistas `HomeComponent` y `AboutComponent` respectivamente. Estos dos componentes de vista son hijos de la vista superior, contenida por `AppComponent`. Implementaremos un enrutador de animación de transiciones que desliza dentro la nueva vista hacia la derecha y desliza fuera la vista anterior cuando el usuario navega entre las dos rutas.

</br>

<div class="lightbox">
  <img src="generated/images/guide/animations/route-animation.gif" alt="Animations in action" width="440">
</div>

## Configuración de rutas

Para empezar, configura un grupo de rutas usando los métodos disponibles en la clase `RouterModule`. Esta configuración de rutas le indica al enrutador cómo navegar.

Usa el método `RouterModule.forRoot` para definir un grupo de rutas. También, importa este `RouterModule` al array `imports` del módulo principal, `AppModule`.

<div class="alert is-helpful">

**Nota:** Usa el método `RouterModule.forRoot` en el módulo raíz, `AppModule`, para registrar rutas y proveedores de nivel superior de la aplicación. Para los módulos de funcionalidad, llama el método `RouterModule.forChild` para registrar rutas adicionales.

</div>

La siguiente configuración define las posibles rutas para la aplicación.

<code-example path="animations/src/app/app.module.ts" header="src/app/app.module.ts" region="route-animation-data" language="typescript"></code-example>

Las rutas `home` y `about` están asociadas con las vistas `HomeComponent` y `AboutComponent`. La configuración de rutas le indica al enrutador de Angular que instancie las vistas `HomeComponent` y `AboutComponent` cuando la navegación coincide con la ruta correspondiente.

A parte de `path` y `component`, la propiedad `data` de cada ruta define la configuración clave específica de la animación asociada con la ruta. El valor de la propiedad `data` se pasa a `AppComponent` cuando la ruta cambia. También puedes pasar datos adicionales en la configuración de la ruta que se consumen dentro de la animación. El valor de la propiedad data tiene que coincidir con las transiciones definidas en el desencadenador `routeAnimation`, que definiremos más adelante.

<div class="alert is-helpful">

**Nota:** Los nombres de las propiedades `data` que se utilizan pueden ser arbitrarios. Por ejemplo, el nombre *animación* utilizado en el ejemplo anterior es una elección arbitraria.

</div>

## Punto de salida del enrutador

Después de configurar las rutas, indícale al enrutador de Angular dónde renderizar las vistas cuando coincidan con una ruta. Puedes establecer un punto de salida del enrutador insertando un contenedor `<router-outlet>` dentro de la plantilla raíz `AppComponent`.

El contenedor `<router-outlet>` tiene una directiva de atributos que contiene datos sobre las rutas activas y sus estados, basados en la propiedad `data` que establecimos en la configuración de la ruta.

<code-example path="animations/src/app/app.component.html" header="src/app/app.component.html" region="route-animations-outlet"></code-example>

El `AppComponent` define un método que puede detectar cuando una vista cambia. El método asigna un valor de estado de animación al desencadenador de animación (`@routeAnimation`) basado en el valor de la propiedad `data` de configuración de la ruta. Aquí tienes un ejemplo de un método de `AppComponent` que detecta cuando se produce un cambio de ruta.

<code-example path="animations/src/app/app.component.ts" header="src/app/app.component.ts" region="prepare-router-outlet" language="typescript"></code-example>

En este caso, el método `prepareRoute()` toma el valor de la directiva del punto de salida (establecido a través de `#outlet="outlet"`) y devuelve un valor de cadena que representa el estado de la animación basado en los datos personalizados de la ruta activa actual. Puedes utilizar estos datos para controlar qué transición ejecutar para cada ruta.

## Definición de la animación

Las animaciones pueden ser definidas directamente dentro de tus componentes. Para este ejemplo estamos definiendo las animaciones en un archivo separado, lo que nos permite reutilizar las animaciones.

El siguiente fragmento de código define una animación reutilizable llamada `slideInAnimation`.

<code-example path="animations/src/app/animations.ts" header="src/app/animations.ts" region="route-animations" language="typescript"></code-example>

La definición de animación hace varias cosas:

* Define dos transiciones. Un solo desencadenador puede definir múltiples estados y transiciones.
* Ajusta los estilos de las vistas anfitriona e hija para controlar sus posiciones relativas durante la transición.
* Utiliza `query()` para determinar qué vista hija está entrando y cuál está saliendo de la vista anfitriona.

Un cambio de ruta activa el desencadenante de la animación, y se aplica una transición que coincide con el cambio de estado.

<div class="alert is-helpful">

**Nota:** Los estados de transición deben coincidir con el valor de la propiedad `data` definida en la configuración de la ruta.

</div>

Haz que la definición de la animación esté disponible en tu aplicación añadiendo la animación reutilizable (`slideInAnimation`) a los metadatos `animations` del `AppComponent`.

<code-example path="animations/src/app/app.component.ts" header="src/app/app.component.ts" region="define" language="typescript"></code-example>

### Estilos de los componentes anfitrión e hijo

Durante una transición, se inserta una nueva vista directamente después de la anterior y ambos elementos aparecen en pantalla al mismo tiempo. Para evitarlo, aplica un estilo adicional a la vista anfitriona y a las vistas hijas eliminadas e insertadas. La vista anfitriona debe utilizar posicionamiento relativo, y las vistas hijas deben utilizar posicionamiento absoluto. Añadir estilos a las vistas anima los contenedores en su lugar, sin que el DOM mueva las cosas.

<code-example path="animations/src/app/animations.ts" header="src/app/animations.ts" region="style-view" language="typescript"></code-example>

### Consultas de los contenedores de la vista

Utiliza el método `query()` para encontrar y animar elementos dentro del componente anfitrión actual. La sentencia `query(":enter")` devuelve la vista que se está insertando, y `query(":leave")` devuelve la vista que se está eliminando.

Supongamos que estamos enrutando desde *Home => About*.

<code-example path="animations/src/app/animations.ts" header="src/app/animations.ts (Continuation from above)" region="query" language="typescript"></code-example>

El código de animación hace lo siguiente después de estilizar las vistas:

* `query(':enter', style({ left: '-100%' }))` coincide con la vista que se añade y oculta la nueva vista añadida posicionándola en el extremo izquierdo.
* Llama a `animateChild()` en la vista que se va, para ejecutar las animaciones de sus hijos.
* Utiliza la función `group()` para hacer que las animaciones internas se ejecuten en paralelo.
* Dentro de la función `group()`:
    * Consulta la vista que se elimina y la anima para que se deslice hacia la derecha.
    * Desliza la nueva vista animando la vista con una función de suavizado y duración. </br>
    Esta animación hace que la vista `about` se deslice de izquierda a derecha.
* Llama al método `animateChild()` en la nueva vista para ejecutar sus animaciones hijas después de que la animación principal se complete.

Ahora tienes una animación básica que anima el enrutado de una vista a otra.

## Más información sobre las animaciones de Angular

También puede interesarte lo siguiente:

* [Introducción a las animaciones de Angular](guide/animations)
* [Transición y desencadenadores](guide/transition-and-triggers)
* [Secuencias de animación complejas](guide/complex-animation-sequences)
* [Animaciones reutilizables](guide/reusable-animations)
