import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CamTestPage } from './cam-test.page';

const routes: Routes = [
  {
    path: '',
    component: CamTestPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CamTestPageRoutingModule {}
