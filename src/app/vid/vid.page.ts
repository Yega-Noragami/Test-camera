import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
// import { HttpClient } from '@angular/common/http';

import { getAdjacentKeyPoints, load, PoseNet } from '@tensorflow-models/posenet';
// import { AnyTxtRecord } from 'dns';

// declare Global Variable require. 
declare var require: any
interface Video {
  id:number,
  data:HTMLVideoElement,
}
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
  // video = new Array<HTMLVideoElement>();
  
  videos: Array<Video> = [
    {
      id: 0,
      data: null,
    },
    {
      id: 1,
      data: null,
    },
    {
      id: 2,
      data: null,
    },
  ]
  // constructor(private http: HttpClient) {}
  constructor() {
    console.log("debug..", this.fileOutput);
  }

  ngOnInit() {

  }


  async fileOnChange(inputId, outputId, id) {

    const fileInput = <HTMLInputElement>document.getElementById(inputId);

    const files = fileInput.files;
    const toBase64 = file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });

    await toBase64(files[0]).then((base64: string) => {
      setTimeout(() => {
        // this.session.videoURLs = [base64];

        let video = <HTMLVideoElement>document.getElementById(outputId);
        this.videos[id].data = video;

        // console.log("result", this.videos)
        this.dosomethinghere(video);
        // video.src = this.sanitization.bypassSecurityTrustUrl(base64) as string;
        video.src = base64
        video.load();
        video.play();

      }, 100)
      // return 

    });

    // const url = URL.createObjectURL(files.item(0));



  }

  checkType(id){
    console.log("Value of id:", id) 
    console.log("type of video: ",this.videos[id].data )
    console.log("type of video: ",typeof this.videos[id].data )
  }


  async doPoseEstimation(id){
    const vid = this.videos[id].data;

    vid.width= 500;
    vid.height = 500/1.7778;

    const posenet = require('@tensorflow-models/posenet');
    const net = await posenet.load();

    const pose = await net.estimateSinglePose(vid, {
      flipHorizontal: false
    });

    console.log(pose)
    window.length;
    
  }

  async doSquatCounting(id){

    const vid = this.videos[id].data;

    const posenet = require('@tensorflow-models/posenet');
    const net = await posenet.load();

    const pose = await net.estimateSinglePose(vid, {
      flipHorizontal: false
    });

    console.log(pose)
    
    const id_list_right = [12 , 14, 16];
    const id_list_left = [11 ,13 , 15];

    const count = 0;

    console.log(pose.keypoints[12]);
    console.log(pose.keypoints[14]);
    console.log(pose.keypoints[16]);
     
    //make promise for left side 1 rep 
      // set interval for screenshot 
      // set restriction for max , full and improper repetion 
      // return when condition is satisfied 
    //make promise for right side 1 rep
    //resolve both promises by increasing rep 




  }

  async findAngle(vid: HTMLVideoElement ){

    // x1 , y1 = 
    // x2 , y2 = 
    // x3 , y3 = 
  }

  dosomethinghere(video: HTMLVideoElement) {
    console.log("result", video);

    return;
  }



}
