import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SearchResultComponent } from "./search-result.component";
import { LinkCardModule } from "../link-card/linkCard.module";

@NgModule({
  declarations: [SearchResultComponent],
  exports: [SearchResultComponent],
  imports: [
    CommonModule,
    FontAwesomeModule,
    OverlayModule,
    FormsModule,
    LinkCardModule,
    ReactiveFormsModule,
    RouterModule,
  ],
})
export class SearchResultModule {}
