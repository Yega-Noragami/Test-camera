import { NgModule } from '@angular/core';
import { Routes , RouterModule} from '@angular/router'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyFirstPagePageRoutingModule } from './my-first-page-routing.module';

import { MyFirstPagePage } from './my-first-page.page';


const routes: Routes = [
  {
    path: '',
    component:MyFirstPagePage 
  }
]


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyFirstPagePageRoutingModule
  ],
  declarations: [MyFirstPagePage]
})
export class MyFirstPagePageModule {}
