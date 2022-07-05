import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import("./pages/home.module").then((module) => module.HomeModule ),
  },
  {
    path: 'links',
    loadChildren: () => import("./pages/links.module").then((module) => module.LinksModule ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: "reload" })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
