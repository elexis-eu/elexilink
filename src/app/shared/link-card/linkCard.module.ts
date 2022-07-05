import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LinkCardComponent } from "./link-card.component";

@NgModule({
  declarations: [LinkCardComponent],
  exports: [LinkCardComponent],
  imports: [
    CommonModule,
    OverlayModule,
    FormsModule,
    FontAwesomeModule,
  ],
})
export class LinkCardModule {}
