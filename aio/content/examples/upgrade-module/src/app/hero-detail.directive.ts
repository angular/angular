// #docregion
export function heroDetailDirective() {
  return {
    restrict: 'E',
    scope: {},
    bindToController: {
      hero: '=',
      deleted: '&'
    },
    template: `
      <h2>{{$ctrl.hero.name}} details!</h2>
      <div><label>id: </label>{{$ctrl.hero.id}}</div>
      <button ng-click="$ctrl.onDelete()">Delete</button>
    `,
    controller: function HeroDetailController() {
      this.onDelete = () => {
        this.deleted({hero: this.hero});
      };
    },
    controllerAs: '$ctrl'
  };
}
