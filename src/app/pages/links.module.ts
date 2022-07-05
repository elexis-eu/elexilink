
import { CommonModule } from '@angular/common';
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { DataService } from "../core/services/data.service";
import { FiltersModule } from "../shared/filters/filters.module";
import { FooterNavModule } from "../shared/footer-nav/footerNav.module";
import { FooterModule } from "../shared/footer/footer.module";
import { HeaderModule } from "../shared/header/header.module";
import { LanguagePickerModule } from "../shared/language-picker/languagePicker.module";
import { SearchBoxModule } from "../shared/search-box/searchBox.module";
import { SearchResultModule } from "../shared/search-result/searchResult.module";
import { SmartDropdownModule } from "../shared/smart-dropdown/smartDropdown.module";
import { LinkCardModule } from "../shared/link-card/linkCard.module";
import { LinksComponent } from './links/links.component';

const routes: Routes = [
  {
    path: ':sourceLanguage/:headword',
    component: LinksComponent,
    runGuardsAndResolvers: "always",
    resolve: { data: DataService },
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    SmartDropdownModule,
    LinkCardModule,
    FooterNavModule,
    HeaderModule,
    FooterModule,
    FiltersModule,
    SearchBoxModule,
    LanguagePickerModule,
    SearchResultModule,
    HttpClientModule,
  ],
  exports: [],
  declarations: [LinksComponent],
  providers: [DataService ],
})
export class LinksModule {}
