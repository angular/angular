import {Compiler, COMPILER_OPTIONS, CompilerFactory, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {JitCompilerFactory} from '@angular/platform-browser-dynamic';

import { AppComponent } from './app.component';

export function createCompiler(compilerFactory: CompilerFactory) {
  return compilerFactory.createCompiler();
}

@NgModule({
  imports: [BrowserModule],
  bootstrap: [AppComponent],
  declarations: [AppComponent],
  providers: [
    {provide: COMPILER_OPTIONS, useValue: {}, multi: true},
    {provide: CompilerFactory, useClass: JitCompilerFactory, deps: [COMPILER_OPTIONS]},
    {provide: Compiler, useFactory: createCompiler, deps: [CompilerFactory]}
  ]
})
export class AppModule {}

