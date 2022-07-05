import { CommonModule } from '@angular/common';
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { DataService } from "../core/services/data.service";
import { FiltersModule } from "../shared/filters/filters.module";
import { FooterNavModule } from "../shared/footer-nav/footerNav.module";
import { FooterModule } from "../shared/footer/footer.module";
import { HeaderModule } from "../shared/header/header.module";
import { SearchBoxModule } from "../shared/search-box/searchBox.module";
import { SearchResultModule } from "../shared/search-result/searchResult.module";
import { SmartDropdownModule } from "../shared/smart-dropdown/smartDropdown.module";
import { LinkCardModule } from "../shared/link-card/linkCard.module";
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    resolve: { data: DataService },
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SmartDropdownModule,
    LinkCardModule,
    FooterNavModule,
    HeaderModule,
    FooterModule,
    FiltersModule,
    SearchBoxModule,
    SearchResultModule,
    HttpClientModule,
  ],
  exports: [],
  declarations: [HomeComponent],
  providers: [DataService],
})
export class HomeModule {}
