import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
// import { HttpClient } from '@angular/common/http';

import { getAdjacentKeyPoints, load, PoseNet } from '@tensorflow-models/posenet';
// import { AnyTxtRecord } from 'dns';

// declare Global Variable require. 
declare var require: any

@Component({
  selector: 'app-vid',
  templateUrl: './vid.page.html',
  styleUrls: ['./vid.page.scss'],
})
export class VidPage implements OnInit {

  // //modules 
  // @ViewChild('videoElement') videoElement: any;  
  @ViewChild('videoInput') fileInput!: ElementRef;
  @ViewChild('videoOutput') fileOutput!: ElementRef<HTMLVideoElement>;

  // variables
  posenet = require('@tensorflow-models/posenet');
  video: any;
  url: any;
  videos = [
    {
      id:0,
      data:null,
    },
    {
      id:1,
      data:null,
    },
    {
      id:2,
      data:null,
    },
  ]
  // constructor(private http: HttpClient) {}
  constructor() {
    console.log("debug..", this.fileOutput);
  }

  ngOnInit() {

  }


  async fileOnChange(inputId,outputId,id){

    const fileInput = <HTMLInputElement>document.getElementById(inputId);
  
  
      const files = fileInput.files;
      const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
  
      await toBase64(files[0]).then((base64:string)=>{
          setTimeout(()=>{
            // this.session.videoURLs = [base64];
            
            let video = <HTMLVideoElement>document.getElementById(outputId);


              // this.videos[id].data = video;
              // console.log("result", this.videos)
              this.dosomethinghere(video);
            // video.src = this.sanitization.bypassSecurityTrustUrl(base64) as string;
            video.src = base64
            video.load();
            video.play();
  
          },100)
          // return 
     
      });
  
      // const url = URL.createObjectURL(files.item(0));
      // console.log(url);
      
  
    }

    dosomethinghere(video: HTMLVideoElement){
      console.log("result",video);

      return;
    }
}
