import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SearchBoxComponent } from "./search-box.component";
import { SmartDropdownModule } from "../smart-dropdown/smartDropdown.module";
import { LanguagePickerModule } from "../language-picker/languagePicker.module";
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
  declarations: [SearchBoxComponent],
  exports: [SearchBoxComponent],
  imports: [
    CommonModule,
    FontAwesomeModule,
    OverlayModule,
    FormsModule,
    ReactiveFormsModule,
    LanguagePickerModule,
    SmartDropdownModule,
    MatAutocompleteModule,
    RouterModule,
  ],
})
export class SearchBoxModule {}
