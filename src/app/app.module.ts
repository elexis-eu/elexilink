import { InjectionToken, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { WebStorageModule } from 'ngx-store';
import { environment } from 'src/environments/environment';
import { WINDOW_PROVIDERS } from './core/services/window.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export interface Environment {
  production: boolean;
  api: {
    clientUrl: string;
    serverUrl: string;
    email: string;
    apiKey: string;
  };
}

export const ENVIRONMENT = new InjectionToken<Environment>('environment');

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NoopAnimationsModule,
    WebStorageModule.forRoot(),
  ],
  providers: [
    { provide: ENVIRONMENT, useValue: environment },
    ...WINDOW_PROVIDERS,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
