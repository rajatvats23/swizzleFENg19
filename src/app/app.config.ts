// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptor/auth.interceptor'; // Update this path if needed
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions()
    ),
    // {
    //   provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
    //   useValue: { appearance: 'outline', subscriptSizing: 'dynamic' }
    // },
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations()
  ]
};