import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FiltersComponent } from './filters.component';
import { SmartDropdownModule } from "../smart-dropdown/smartDropdown.module";

@NgModule({
  declarations: [FiltersComponent],
  exports: [FiltersComponent],
  imports: [
    CommonModule,
    FontAwesomeModule,
    OverlayModule,
    FormsModule,
    ReactiveFormsModule,
    SmartDropdownModule,
    RouterModule,
  ],
})
export class FiltersModule {}
