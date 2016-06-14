var tpl = `
import {BaseException, Type, ComponentResolver, ComponentFactory} from '@angular/core';
<% i = 0; for (var path in imports) { %>
import * as c<%= i %> from "<%= path %>";
import * as f<%= i %> from "<%= path %>.ngfactory";
<% i++; } %>

export class GeneratedComponentResolver extends ComponentResolver {
  public componentLookup = new Map<Type, ComponentFactory<any>>();
  constructor() {
    super();
<%
i = 0;
for (var path in imports) {
  imports[path].forEach(function(cmp) { %>
    this.componentLookup.set(<Type>c<%= i %>.<%= cmp %>, f<%= i %>.<%= cmp %>NgFactory);<%
  });
  i++;
}
%>
  }
  resolveComponent(component: Function|string): Promise<ComponentFactory<any>> {
    var factory: ComponentFactory<any> = null;
    if (component instanceof Function) {
      factory = this.componentLookup.get(<Type>component);
    }
    if (factory) {
      return Promise.resolve(factory);
    }
    var name: string = component instanceof Function ? component.name : component;
    return Promise.reject<ComponentFactory<any>>(\`No precompiled component \${name} found\`);
  }
  clearCache(): void {}
}`;
export default tpl;
