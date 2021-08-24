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
percentage;
  // //modules 
  // @ViewChild('videoElement') videoElement: any;  
  @ViewChild('videoInput') fileInput!: ElementRef;
  @ViewChild('videoOutput') fileOutput!: ElementRef<HTMLVideoElement>;

  // variables
  posenet = require('@tensorflow-models/posenet');
  video: any;
  url: any;
  squat_count= 0;
  push_count=0;
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
      }, 30)
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
   

  // Function to do automatic Squat counting 
  async doSquatCounting(id){

    const vid = this.videos[id].data;
    vid.width= 500;
    vid.height = 500/1.7778;

    const posenet = require('@tensorflow-models/posenet');
    const net = await posenet.load();
    
    const id_list_right = [12 , 14, 16];
    const id_list_left = [11 ,13 , 15];

    let low , high , percentage ,angle , count ;
    low = 50;
    high = 160;
    let direction =0;

    const pose = await net.estimateSinglePose(vid, {
      flipHorizontal: false
    })
    console.log(pose)
    const findAngle = (p1,p2,p3,p4)=>this.findAngle(p1,p2,p3,p4);
    //loop function to run every 1 sec until the video is over !
    let temp_id = setInterval( async ()=>{
      if (vid.onended){
        clearInterval(temp_id);
      }
      else {
        // Figure out how to use Findangle inside
        const pose =net.estimateSinglePose(vid, {
          flipHorizontal: false
        })
        angle = findAngle(await pose , 12 , 14 , 16);
        percentage = ((angle - low) * 100) / (high - low)
        percentage = this.calPercentage(percentage)
        this.percentage = percentage;
        console.log("percentage of complete:", percentage);
        
        // try to return this value back to html
        // document.getElementById("ret").innerHTML = String(percentage);

        // set restriction for max , full and improper repetion 
        if ( percentage==100){
          if( direction==0){
            console.log("up")
            this.squat_count +=0.5;
            direction=1;
          }
        }
        if ( percentage==0){
          if( direction==1){
            console.log("down");
            this.squat_count +=0.5;
            direction=0;
          }
        }
        console.log("Total Number of Squat: "+Math.floor(this.squat_count+1));
        console.log(angle);
      }
    }, 100);

  }

  async doPushUpCounting(id){
    const vid = this.videos[id].data;
    vid.width= 500;
    vid.height = 500/1.7778;

    const posenet = require('@tensorflow-models/posenet');
    const net = await posenet.load();
    
    const id_list_right = [6 , 8, 10];
    const id_list_left = [5 , 7 , 9];

    let low , high , percentage ,angle , count ;
    low = 100;
    high = 170;
    let direction =0;

    const pose = await net.estimateSinglePose(vid, {
      flipHorizontal: false
    })
    console.log(pose)
    const findAngle = (p1,p2,p3,p4)=>this.findAngle(p1,p2,p3,p4);
    //loop function to run every 1 sec until the video is over !
    let temp_id = setInterval( async ()=>{
      if (vid.onended){
        clearInterval(temp_id);
      }
      else {
        // Figure out how to use Findangle inside
        const pose =net.estimateSinglePose(vid, {
          flipHorizontal: false
        })
        angle = findAngle(await pose , 5 , 7 ,9);
        percentage = ((angle - low) * 100) / (high - low)
        percentage = this.calPercentage(percentage)
        this.percentage = percentage;
        console.log("percentage of complete:", percentage);
        
        // try to return this value back to html
        // document.getElementById("ret").innerHTML = String(percentage);

        // set restriction for max , full and improper repetion 
        if ( percentage==100){
          if( direction==0){
            console.log("up")
            this.push_count +=0.5;
            direction=1;
          }
        }
        if ( percentage==0){
          if( direction==1){
            console.log("down");
            this.push_count +=0.5;
            direction=0;
          }
        }
        console.log("Total Number of Pushup: "+Math.floor(this.push_count+1));
        console.log("Angle:", angle);
      }
    }, 100);

  }

  calPercentage(percentage){
    if(percentage>100)return 100;
    if(percentage<0) return 0;
    return percentage
    return Math.abs(percentage)
  }

  findAngle(pose , id1 , id2 , id3){

    console.log (pose.keypoints[id1].part)
    console.log (pose.keypoints[id2].part)
    console.log (pose.keypoints[id3].part)

    const x0= pose.keypoints[id1].position.x;
    const y0= pose.keypoints[id1].position.y;

    const x1= pose.keypoints[id2].position.x;
    const y1= pose.keypoints[id2].position.y;

    const x2= pose.keypoints[id3].position.x;
    const y2= pose.keypoints[id3].position.y;

    var a = Math.pow(x1-x0,2) + Math.pow(y1-y0,2),
    b = Math.pow(x1-x2,2) + Math.pow(y1-y2,2),
    c = Math.pow(x2-x0,2) + Math.pow(y2-y0,2);

    let angle =(Math.acos( (a+b-c) / Math.sqrt(4*a*b) ) )*(180/3.14)
    return angle; 
  }

  dosomethinghere(video: HTMLVideoElement) {
    console.log("result", video);

    return;
  }



}
