# Navegación en la aplicación

Al final de la [parte 1] (start "Empieza con una aplicación Angular básica"), la aplicación de la tienda en línea tiene un catálogo básico de productos. La aplicación no tiene ningun estado de variable o navegación. Hay una URL, y esa URL siempre muestra la pagina "Mi Tienda" con una lista de productos y sus descripciones.

Esta guía te muestra cómo usar Angular [Routing](guide/glossary#router "Definición de Router") para brindarle al usuario navegación dentro de la aplicación. En una aplicación de una sola página, en lugar de cargar nuevas páginas, muestras diferentes componentes y datos al usuario en función de dónde se encuentra el usuario en la aplicación.

El router te permite mostrar los detalles completos del producto en [vistas](guide/glossary#view "Definición de vista") separadas, cada una con su propia URL. El router habilita la navegación de una vista a la siguiente (dentro de la misma página) cuando los usuarios realizan tareas como las siguientes:

* Ingresando una URL en la barra de direcciones para navegar a la vista correspondiente.
* Haciendo clic en los enlaces de la página para navegar a una nueva vista.
* Haciendo clic en los botones de adelante y atrás del navegador para navegar hacia atrás y hacia adelante a través del historial del navegador.

## Registro de una ruta

La aplicación ya esta configurada para usar el Angular `Router` y usar el Routing para navegar al componente de la lista de productos que modificaste anteriormente. Esta sección te muestra cómo definir una ruta para mostrar los detalles de productos individualmente.

1. Genera un nuevo componente para los detalles del producto. Asigna al componente el nombre `product-details`.

    Recuerda: En la lista de archivos, haz clic con el botón derecho en la carpeta `app`, selecciona `Angular Generator` y `Component`.
        
2. En `app.module.ts`, agrega una ruta para los detalles del producto, con un `path` de `products/:productId` y `ProductDetailsComponent` para el `component`.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="product-details-route">
    </code-example>
   
    Una ruta asocia una o más URL con un componente.
    
3. La directiva configura la plantilla del componente para definir cómo el usuario navega a la ruta o URL. Cuando el usuario hace clic en el nombre de un producto, la aplicación muestra los detalles de ese producto.

     1. Abre `product-list.component.html`.

     1. Actualiza la directiva `*ngFor` para asignar cada índice en la matriz `products` a la variable `productId` cuando se itera sobre la lista.

     1. Modifica el ancla del nombre del producto para incluir un `routerLink`.
     
    <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.html" region="router-link">
    </code-example>
    
      La directiva RouterLink le da al Router el control sobre el elemento de anclaje. En este caso, la ruta, o URL, contiene un segmento fijo, `/products`, mientras que el segmento final es variable, insertando la propiedad id del producto actual. Por ejemplo, la URL de un producto con un `id` de 1 será similar a `https://getting-started-myfork.stackblitz.io/products/1`.
   
4. Prueba el Router haciendo clic en el nombre de un producto. La aplicación muestra el componente de detalles del producto, que actualmente siempre dice "product-details works!"

    Observa que cambia la URL en la ventana de vista previa. El segmento final es "products/#" donde "#" es el número de la ruta en la que hizo clic.

    <div class="lightbox">
      <img src="generated/images/guide/start/product-details-works.png" alt="Vista de detalles del producto con URL actualizada">
    </div>
     
## Utilizar información de la ruta

El componente de detalles del producto maneja la visualización de cada producto. El Angular Router muestra los componentes basados en la URL del navegador y sus rutas definidas. Esta sección te muestra cómo usar el Angular Router para combinar los datos de los `productos` y la información de la ruta para mostrar los detalles específicos de cada producto.

1. Abre `product-details.component.ts`

2. Organiza el uso de datos de productos desde un archivo externo.

    1. Importa `ActivatedRoute` del paquete `@angular/router` y la matriz `products` de `../products`.
    
        <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.1.ts" region="imports">
        </code-example>

    1. Define la propiedad `product` e inyecta el `ActivatedRoute` en el constructor agregándolo como un argumento dentro de los paréntesis del constructor.
    
        <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.1.ts" region="props-methods">
        </code-example>
        
        El `ActivatedRoute` es específico para cada componente enrutado que carga el Angular Router. Contiene información sobre la
        ruta, sus parámetros y datos adicionales asociados con la ruta.

        Inyectando el `ActivatedRoute`, estás configurando el componente para usar un *servicio*. La página [Manejo de Datos] (start/start-data "Pruébalo: Manejo de Datos") cubre los servicios con más detalle.
     
     
3. En el método `ngOnInit()`, suscríbete a los parámetros de ruta y obtén el producto basándote en el `productId`.

    <code-example path="getting-started/src/app/product-details/product-details.component.1.ts" header="src/app/product-details/product-details.component.ts" region="get-product">
    </code-example>
    
    Los parámetros de la ruta corresponden a las variables de ruta (path) que se define en la ruta. La URL que coincide con la ruta proporciona el `productId`. Angular usa el `productId` para mostrar los detalles de cada producto único.
    
4. Actualiza la plantilla para mostrar la información de detalle del producto dentro de un `*ngIf`.

    <code-example header="src/app/product-details/product-details.component.html" path="getting-started/src/app/product-details/product-details.component.html" region="details">
    </code-example>

Ahora, cuando los usuarios hacen clic en un nombre en la lista de productos, el router los dirige a la URL distinta del producto, cambia el componente de la lista de productos por el componente de detalles del producto y muestra los detalles del producto.

<div class="lightbox">
  <img src="generated/images/guide/start/product-details-routed.png" alt="Página de detalles del producto con URL actualizada y detalles completos mostrados">
</div>

<div class="alert is-helpful">

Para obtener más información sobre el Angular Router, consulta [Enrutamiento y Navegación] (guide/router "Guía de Enrutamiento y Navegación").

</div>

## Próximos pasos

¡Felicidades! Has integrado el enrutamiento en tu tienda en linea.

* Los productos están vinculados desde la vista de lista de productos a productos individuales.
* Los usuarios pueden hacer clic en el nombre de un producto de la lista para ver los detalles en una nueva vista, con una URL / ruta distinta.

Para continuar explorando Angular, elige cualquiera de las siguientes opciones:
* [Continuar con la sección "Manejo de Datos"] (start/start-data "Pruébalo: Manejo de datos") para agregar una función de carrito de compras, usa un servicio para administrar los datos del carrito y usa HTTP para recuperar datos externos para los precios del envío.
* [Ir a la sección Despliegue] (start/start-deployment "Pruébalo: Despliegue") para implementar su aplicación en Firebase o pasar al desarrollo local.
