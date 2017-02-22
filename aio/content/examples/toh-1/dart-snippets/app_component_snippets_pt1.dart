// #docregion show-hero
template: '<h1>{{title}}</h1><h2>{{hero}} details!</h2>'
// #enddocregion show-hero

// #docregion show-hero-2
template: '<h1>{{title}}</h1><h2>{{hero.name}} details!</h2>'
// #enddocregion show-hero-2

// #docregion show-hero-properties
template: '<h1>{{title}}</h1><h2>{{hero.name}} details!</h2><div><label>id: </label>{{hero.id}}</div><div><label>name: </label>{{hero.name}}</div>'
// #enddocregion show-hero-properties

// #docregion multi-line-strings
template: '''
  <h1>{{title}}</h1>
  <h2>{{hero.name}} details!</h2>
  <div><label>id: </label>{{hero.id}}</div>
  <div><label>name: </label>{{hero.name}}</div>'''
// #enddocregion multi-line-strings

// #docregion editing-Hero
template: '''
  <h1>{{title}}</h1>
  <h2>{{hero.name}} details!</h2>
  <div><label>id: </label>{{hero.id}}</div>
  <div>
    <label>name: </label>
    <input value="{{hero.name}}" placeholder="name">
  </div>'''
// #enddocregion editing-Hero

// #docregion app-component-1
class AppComponent {
  String title = 'Tour of Heroes';
  var hero = 'Windstorm';
}
// #enddocregion app-component-1
