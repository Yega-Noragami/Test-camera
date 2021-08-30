import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
// import { HttpClient } from '@angular/common/http';

import { getAdjacentKeyPoints, load, PoseNet } from '@tensorflow-models/posenet';
// import { AnyTxtRecord } from 'dns';

//import tensorflow coco model 
import * as cocoSSD from '@tensorflow-models/coco-ssd';


//coco-ssd plugin's
require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');
const cocoSsd = require('@tensorflow-models/coco-ssd');

// declare Global Variable require. 
declare var require: any
interface Video {
  id: number,
  data: HTMLVideoElement,
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
  squat_count = 0;
  push_count = 0;
  // video = new Array<HTMLVideoElement>();

  //array for storing user video elements 
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

  // Array for storing coach video elements 
  coachVideo: Array<Video> = [
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

  async coachOnChange(inputId, outputId, id) {
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

        //ideally perform preporcessing here 
        // --------- inset code for preprocessing --------


        this.coachVideo[id].data = video;

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

  checkType(id) {
    console.log("Value of id:", id)
    console.log("type of video: ", this.videos[id].data)
    console.log("type of video: ", typeof this.videos[id].data)
  }


  async doPoseEstimation(id) {
    const vid = this.videos[id].data;

    vid.width = 500;
    vid.height = 500 / 1.7778;

    const posenet = require('@tensorflow-models/posenet');
    const net = await posenet.load();

    const pose = await net.estimateSinglePose(vid, {
      flipHorizontal: false
    });

    console.log(pose)

    window.length;
  }


  // Function to do automatic Squat counting 
  async doSquatCounting(id) {

    const vid = this.videos[id].data;
    vid.width = 500;
    vid.height = 500 / 1.7778;

    const posenet = require('@tensorflow-models/posenet');
    const net = await posenet.load();

    const id_list_right = [12, 14, 16];
    const id_list_left = [11, 13, 15];

    let low, high, percentage, angle, count;
    low = 50;
    high = 160;
    let direction = 0;

    const pose = await net.estimateSinglePose(vid, {
      flipHorizontal: false
    })
    console.log(pose)
    const findAngle = (p1, p2, p3, p4) => this.findAngle(p1, p2, p3, p4);
    //loop function to run every 1 sec until the video is over !
    let temp_id = setInterval(async () => {
      if (vid.onended) {
        clearInterval(temp_id);
      }
      else {
        // Figure out how to use Findangle inside
        const pose = net.estimateSinglePose(vid, {
          flipHorizontal: false
        })
        angle = findAngle(await pose, 12, 14, 16);
        percentage = ((angle - low) * 100) / (high - low)
        percentage = this.calPercentage(percentage)
        this.percentage = percentage;
        console.log("percentage of complete:", percentage);

        // try to return this value back to html
        // document.getElementById("ret").innerHTML = String(percentage);

        // set restriction for max , full and improper repetion 
        if (percentage == 100) {
          if (direction == 0) {
            console.log("up")
            this.squat_count += 0.5;
            direction = 1;
          }
        }
        if (percentage == 0) {
          if (direction == 1) {
            console.log("down");
            this.squat_count += 0.5;
            direction = 0;
          }
        }
        console.log("Total Number of Squat: " + Math.floor(this.squat_count + 1));
        console.log(angle);
      }
    }, 100);

  }

  async doPushUpCounting(id) {
    const vid = this.videos[id].data;
    vid.width = 500;
    vid.height = 500 / 1.7778;

    const posenet = require('@tensorflow-models/posenet');
    const net = await posenet.load();

    const id_list_right = [6, 8, 10];
    const id_list_left = [5, 7, 9];

    let low, high, percentage, angle, count;
    low = 100;
    high = 170;
    let direction = 0;

    const pose = await net.estimateSinglePose(vid, {
      flipHorizontal: false
    })
    console.log(pose)
    const findAngle = (p1, p2, p3, p4) => this.findAngle(p1, p2, p3, p4);
    //loop function to run every 1 sec until the video is over !
    let temp_id = setInterval(async () => {
      if (vid.onended) {
        clearInterval(temp_id);
      }
      else {
        // Figure out how to use Findangle inside
        const pose = net.estimateSinglePose(vid, {
          flipHorizontal: false
        })
        angle = findAngle(await pose, 5, 7, 9);
        percentage = ((angle - low) * 100) / (high - low)
        percentage = this.calPercentage(percentage)
        this.percentage = percentage;
        console.log("percentage of complete:", percentage);

        // try to return this value back to html
        // document.getElementById("ret").innerHTML = String(percentage);

        // set restriction for max , full and improper repetion 
        if (percentage == 100) {
          if (direction == 0) {
            console.log("up")
            this.push_count += 0.5;
            direction = 1;
          }
        }
        if (percentage == 0) {
          if (direction == 1) {
            console.log("down");
            this.push_count += 0.5;
            direction = 0;
          }
        }
        console.log("Total Number of Pushup: " + Math.floor(this.push_count + 1));
        console.log("Angle:", angle);
      }
    }, 100);

  }

  calPercentage(percentage) {
    if (percentage > 100) return 100;
    if (percentage < 0) return 0;
    return percentage
    return Math.abs(percentage)
  }

  findAngle(pose, id1, id2, id3) {

    console.log(pose.keypoints[id1].part)
    console.log(pose.keypoints[id2].part)
    console.log(pose.keypoints[id3].part)

    const x0 = pose.keypoints[id1].position.x;
    const y0 = pose.keypoints[id1].position.y;

    const x1 = pose.keypoints[id2].position.x;
    const y1 = pose.keypoints[id2].position.y;

    const x2 = pose.keypoints[id3].position.x;
    const y2 = pose.keypoints[id3].position.y;

    var a = Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2),
      b = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2),
      c = Math.pow(x2 - x0, 2) + Math.pow(y2 - y0, 2);

    let angle = (Math.acos((a + b - c) / Math.sqrt(4 * a * b))) * (180 / 3.14)
    return angle;
  }

  dosomethinghere(video: HTMLVideoElement) {
    console.log("result", video);

    return;
  }



  // Do Pose Matching for coach and user video
  async doPoseChecking(id) {

    const vid = this.videos[id].data;
    const coachVid = this.videos[id].data;


    vid.width = 500;
    vid.height = 500 / 1.7778;

    const posenet = require('@tensorflow-models/posenet');
    const net = await posenet.load();

    let temp_id = setInterval(async () => {
      if (vid.onended) {
        clearInterval(temp_id);
      }
      else {

        //store user and coach coordinates 
        var user_pos = new Array<number>();
        var coach_pos = new Array<number>();

        const pose = await net.estimateSinglePose(vid, {
          flipHorizontal: false
        })

        const coachPose = await net.estimateSinglePose(coachVid, {
          flipHorizontal: false
        })

        //perform normalisation on the input 
        // console.log("what is undefined?", pose, pose.keypoints);
        for (let i = 0; i < 17; i++) {

          user_pos.push(pose.keypoints[i].position.x);
          user_pos.push(pose.keypoints[i].position.y);

          coach_pos.push(coachPose.keypoints[i].position.x);
          coach_pos.push(coachPose.keypoints[i].position.y);

        }

        var poseVector1 = user_pos//.toString();
        var poseVector2 = coach_pos//.toString();

        //calculate cosine similarity
        const similarity = require('compute-cosine-similarity');
        let cosineSimilarity = similarity(poseVector1, poseVector2);
        let distance = 2 * (1 - cosineSimilarity);
        var score = Math.sqrt(distance);

        console.log("the pose matching socre : ", score);

      }
    }, 100);
  }

  // functions to perform preprocessing 

  async doPreprocessing(id) {

    const vid = this.videos[id].data;
    const coachVid = this.videos[id].data;

    console.log("this video is of type:", typeof vid)

    const model = await cocoSSD.load('lite_mobilenet_v2' as any);
    this.detectFrame(vid, model);

  }

  detectFrame = (video, model) => {
    model.detect(video).then(predictions => {
      console.log("prediction", predictions);
      this.renderPredictions(predictions, video);
      requestAnimationFrame(() => {
        this.detectFrame(video, model);
      });
    });
  }

  renderPredictions = (predictions, vid) => {
    const canvas = <HTMLCanvasElement>document.getElementById("canvas");
    console.log("renderPredictions() starts.", canvas);
    const ctx = canvas.getContext("2d");
    canvas.width = 300;
    canvas.height = 300;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Fonts
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    ctx.drawImage(vid, 0, 0, 300, 300);
    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      // Bounding box
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      // Label background
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
    });
    predictions.forEach(prediction => {

      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class, x, y);
    });
  };

  // function to perform cropping 
  async doCropping(id) {

    const vid = this.videos[id].data;
    const coachVid = this.videos[id].data;


    vid.width = 500;
    vid.height = 500 / 1.7778;

    // const posenet = require('@tensorflow-models/posenet');
    // const net = await posenet.load();

    let temp_id = setInterval(async () => {
      if (vid.onended) {
        clearInterval(temp_id);
      }
      else {

        // Load the model.
      const model = await cocoSsd.load();

      // Classify the image.
      const predictions:any[] = await model.detect(coachVid);

      console.log('Predictions: ');
      // console.log(predictions.find(prediction=>prediction.class ==="person")?.bbox);

      var results = predictions.find(prediction=>prediction.class ==="person")?.bbox;
      console.log(results);

      
      // get the size for bounding box  if prediction 

      }
    }, 100);
  }

}
