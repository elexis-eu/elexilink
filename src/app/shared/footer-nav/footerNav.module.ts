import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FooterNavComponent } from "./footer-nav.component";

@NgModule({
  declarations: [FooterNavComponent],
  exports: [FooterNavComponent],
  imports: [
    CommonModule,
    FontAwesomeModule,
    OverlayModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
  ],
})
export class FooterNavModule {}
