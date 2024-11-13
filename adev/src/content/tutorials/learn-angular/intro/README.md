npm install -g @angular/cli
ng new foodiequest
cd foodiequest
ng generate component description
ng generate component user-journey1
ng generate component user-journey2
ng generate component user-journey3
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { DescriptionComponent } from './description/description.component';
import { UserJourney1Component } from './user-journey1/user-journey1.component';
import { UserJourney2Component } from './user-journey2/user-journey2.component';
import { UserJourney3Component } from './user-journey3/user-journey3.component';

@NgModule({
  declarations: [
    AppComponent,
    DescriptionComponent,
    UserJourney1Component,
    UserJourney2Component,
    UserJourney3Component
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
<div class="app-container">
  <app-description></app-description>
  <app-user-journey1></app-user-journey1>
  <app-user-journey2></app-user-journey2>
  <app-user-journey3></app-user-journey3>
</div>
import { Component } from '@angular/core';

@Component({
  selector: 'app-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.css']
})
export class DescriptionComponent {
  title = 'FoodieQuest - App de aventuras culinarias gamificada';
  description = `FoodieQuest es una aplicación diseñada para los amantes de la comida y las experiencias gastronómicas.
  La app transforma el descubrimiento de nuevos restaurantes, platillos y recetas en una aventura interactiva.
  Los usuarios pueden explorar ciudades virtualmente o en la vida real, completando misiones como probar platos únicos,
  cocinar recetas en casa o descubrir secretos culinarios locales. Al completar desafíos, desbloquean nuevos niveles, ganan puntos y obtienen insignias especiales.
  La app también permite que los usuarios interactúen con otros “foodies”, compartan recomendaciones y compitan en desafíos gastronómicos.`;
}
<div class="description">
  <h1>{{ title }}</h1>
  <p>{{ description }}</p>
</div>
import { Component } from '@angular/core';

@Component({
  selector: 'app-user-journey1',
  templateUrl: './user-journey1.component.html',
  styleUrls: ['./user-journey1.component.css']
})
export class UserJourney1Component {
  userProfile = {
    name: 'Andrés',
    objective: 'Explorar nuevos restaurantes en su ciudad para descubrir platillos únicos.',
    device: 'Móvil'
  };

  steps = [
    {
      action: 'Recibir una misión gastronómica',
      detail: 'Andrés abre FoodieQuest y recibe una misión: "Descubre tres restaurantes que sirvan platos con ingredientes locales".',
      pointOfContact: 'Pantalla de misiones',
      emotion: 'Entusiasmo. Le encanta descubrir nuevos lugares para comer.'
    },
    {
      action: 'Buscar restaurantes cercanos',
      detail: 'La app usa su ubicación para sugerirle una lista de restaurantes cercanos que cumplen con los criterios de la misión. Le muestra una breve descripción de los platos destacados.',
      pointOfContact: 'Mapa interactivo con restaurantes sugeridos',
      emotion: 'Curiosidad por probar algo nuevo.'
    },
    {
      action: 'Visitar y probar el platillo',
      detail: 'Andrés va al primer restaurante de la lista y prueba un platillo típico con ingredientes locales. Después, sube una foto del platillo a la app y escribe una breve reseña.',
      pointOfContact: 'Pantalla de registro de misión',
      emotion: 'Satisfacción. Disfrutó de la experiencia y ahora está listo para completar el resto de la misión.'
    }
  ];
}
<div class="user-journey">
  <h2>Perfil del usuario: {{ userProfile.name }}</h2>
  <p>Objetivo: {{ userProfile.objective }}</p>
  <p>Dispositivo: {{ userProfile.device }}</p>
  <ol>
    <li *ngFor="let step of steps">
      <strong>Acción: {{ step.action }}</strong>
      <p>{{ step.detail }}</p>
      <p><em>Punto de contacto: {{ step.pointOfContact }}</em></p>
      <p><em>Emoción: {{ step.emotion }}</em></p>
    </li>
  </ol>
</div>
import { Component } from '@angular/core';

@Component({
  selector: 'app-user-journey2',
  templateUrl: './user-journey2.component.html',
  styleUrls: ['./user-journey2.component.css']
})
export class UserJourney2Component {
  userProfile = {
    name: 'Paula',
    objective: 'Cocinar una receta internacional para mejorar sus habilidades culinarias.',
    device: 'Tablet'
  };

  steps = [
    {
      action: 'Seleccionar una receta',
      detail: 'Paula abre la sección de "Cocina Internacional" en FoodieQuest y elige una receta de ramen japonés que nunca ha probado antes.',
      pointOfContact: 'Biblioteca de recetas internacionales',
      emotion: 'Motivación. Le encanta aprender nuevas recetas y le emociona el reto.'
    },
    {
      action: 'Seguir las instrucciones paso a paso',
      detail: 'La app ofrece instrucciones paso a paso para cocinar el ramen, con videos y temporizadores para cada parte del proceso.',
      pointOfContact: 'Pantalla de recetas interactivas',
      emotion: 'Concentración y diversión. Siente que está adquiriendo nuevas habilidades mientras cocina.'
    },
    {
      action: 'Subir una foto y recibir puntos',
      detail: 'Después de terminar de cocinar, Paula toma una foto del ramen y la sube a la app. FoodieQuest le otorga puntos de experiencia y una insignia por completar su primera receta internacional.',
      pointOfContact: 'Pantalla de recompensas',
      emotion: 'Orgullo. Se siente satisfecha por haber aprendido algo nuevo y haberlo hecho bien.'
    }
  ];
}
<div class="user-journey">
  <h2>Perfil del usuario: {{ userProfile.name }}</h2>
  <p>Objetivo: {{ userProfile.objective }}</p>
  <p>Dispositivo: {{ userProfile.device }}</p>
  <ol>
    <li *ngFor="let step of steps">
      <strong>Acción: {{ step.action }}</strong>
      <p>{{ step.detail }}</p>
      <p><em>Punto de contacto: {{ step.pointOfContact }}</em></p>
      <p><em>Emoción: {{ step.emotion }}</em></p>
    </li>
  </ol>
</div>
import { Component } from '@angular/core';

@Component({
  selector: 'app-user-journey3',
  templateUrl: './user-journey3.component.html',
  styleUrls: ['./user-journey3.component.css']
})
export class UserJourney3Component {
  userProfile = {
    name: 'David',
    objective: 'Competir con amigos en un desafío de comida callejera.',
    device: 'Móvil'
  };

  steps
