import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    // paramsInheritanceStrategy defaults to 'always' in Angular 22
    provideHttpClient(), // FetchBackend is now the default — withFetch() is deprecated
    provideClientHydration(withEventReplay()),
    // Incremental hydration is now enabled by default in Angular 22!
  ],
};
