import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VidPage } from './vid.page';

const routes: Routes = [
  {
    path: '',
    component: VidPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VidPageRoutingModule {}
