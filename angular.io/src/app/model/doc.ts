import { ComponentRef } from '@angular/core';
import { DocMetadata } from './doc-metadata';

export class Doc {

  private embeddedComponents: ComponentRef<any>[] = [];

  constructor(public metadata: DocMetadata, public content?: string) { }

  clone() {
    return new Doc(
      Object.assign({}, this.metadata),
      this.content
    );
  }

  addEmbeddedComponent(component: ComponentRef<any>) {
    this.embeddedComponents.push(component);
  }

  detectChanges() {
    this.embeddedComponents.forEach(comp => comp.changeDetectorRef.detectChanges());
  }

  destroy() {
    // destroy components otherwise there will be memory leaks
    this.embeddedComponents.forEach(comp => comp.destroy());
    this.embeddedComponents.length = 0;
  }
}
