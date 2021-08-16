import { NgModule } from '@angular/core';
import { Routes , RouterModule} from '@angular/router'


import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CamTestPageRoutingModule } from './cam-test-routing.module';

import { CamTestPage } from './cam-test.page';


const routes: Routes = [
  {
    path: '',
    component: CamTestPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CamTestPageRoutingModule
  ],
  declarations: [CamTestPage]
})
export class CamTestPageModule {}
