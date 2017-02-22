// #docplaster
// #docregion
// #docregion first, final
(function(app) {
  app.HeroFormComponent = ng.core
    .Component({
      selector: 'hero-form',
      templateUrl: 'app/hero-form.component.html'
    })
    .Class({
      // #docregion submitted
      constructor: [function() {
        // #enddocregion submitted
        this.powers = ['Really Smart', 'Super Flexible',
          'Super Hot', 'Weather Changer'
        ];

        this.model = new app.Hero(18, 'Dr IQ', this.powers[0],
          'Chuck Overstreet');

        // #docregion submitted
        this.submitted = false;
      }],
      onSubmit: function() {
        this.submitted = true;
      },
      // #enddocregion submitted

      // #enddocregion final
      // TODO: Remove this when we're done
      diagnostic: function() {
        return JSON.stringify(this.model);
      },
      // #enddocregion first


      //////// DO NOT SHOW IN DOCS ////////

      // Reveal in html:
      //   AlterEgo via form.controls = {{showFormControls(hf)}}
      showFormControls: function(form) {
        return form.controls['alterEgo'] &&
          // #docregion form-controls
          form.controls['name'].value; // Dr. IQ
        // #enddocregion form-controls
      },
      /////////////////////////////

      // #docregion first, final
    });
})(window.app || (window.app = {}));
// #enddocregion first, final
