import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VidPageRoutingModule } from './vid-routing.module';
import { VidPage } from './vid.page';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { getAdjacentKeyPoints, load, PoseNet } from '@tensorflow-models/posenet';
declare var require: any

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VidPageRoutingModule
  ],
  declarations: [VidPage]
})
export class VidPageModule  {


}
