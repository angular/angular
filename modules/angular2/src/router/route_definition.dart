library angular2.src.router.route_definition;

abstract class RouteDefinition {
  final String path;
  final String as;
  const RouteDefinition({this.path, this.as});
}
