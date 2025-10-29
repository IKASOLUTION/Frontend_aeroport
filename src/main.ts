
// Import the compiler to enable JIT compilation when a component isn't AOT-compiled at build time.
// This is a development-time convenience. For production prefer AOT builds.
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { appConfig } from './app.config';


bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));