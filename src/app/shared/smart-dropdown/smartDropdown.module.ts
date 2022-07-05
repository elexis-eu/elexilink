import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SmartDropdownComponent } from "./smart-dropdown.component";

@NgModule({
  declarations: [SmartDropdownComponent],
  exports: [SmartDropdownComponent],
  imports: [
    CommonModule,
    OverlayModule,
    FormsModule,
    FontAwesomeModule,
  ],
})
export class SmartDropdownModule {}
