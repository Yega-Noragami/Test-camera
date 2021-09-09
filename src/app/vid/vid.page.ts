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

  dynamic_squat = 0;
  pushupTrackingArray = [];
  allTrackingArray=[]
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

  //returns the distance between 2 points 
  async findDistanceBy2Id(pose, id1, id2) {

    var x0 = pose.keypoints[id1].position.x;
    var y0 = pose.keypoints[id1].position.y;

    var x1 = pose.keypoints[id2].position.x;
    var y1 = pose.keypoints[id2].position.y;

    var dx = x1 - x0;
    var dy = y1 - y0;
    var dist = Math.sqrt(dx * dx + dy * dy);

    return dist;
  }


  //to count pushups with the help of direction 
  async squatDynamicDistance(id) {

    const vid = this.videos[id].data;
    const coachVid = this.videos[id].data;


    vid.width = 500;
    vid.height = 500 / 1.7778;

    //load posenet module 
    const posenet = require('@tensorflow-models/posenet');
    const net = await posenet.load();

    // get pose and set as initial pose '

    //to keep track of workout 
    let count = 0;
    //A flag denoting change in state. 0 -> previous state is continuing, 1 -> state has changed
    let direction = 0
    //array count track 
    let init_i = 0

    let tempVar = 1

    const init_pose = await net.estimateSinglePose(vid, {
      flipHorizontal: false
    })

    let temp_id = setInterval(async () => {

      if (vid.onended) {
        clearInterval(temp_id);
      }
      else {
        const pose = await net.estimateSinglePose(vid, {
          flipHorizontal: false
        })

        //fill array with counts
        console.log("-------  ----------- --------  --------  ----------")
        console.log("Time:", init_i)
        console.log("Value of I :", init_i)

        //save current pose inside an array 
        this.pushupTrackingArray.push(pose.keypoints)

        // extract nose values 
        var arrayNose = this.pushupTrackingArray.map(each => { return each[0] });
        console.log("ArrayNose is of type:", typeof (arrayNose))

        console.log("length of arraypose:", arrayNose.length);

        // for (var indexCount =0 ; indexCount < arrayNose.length ; indexCount++){
        //   console.log(arrayNose[indexCount].position.y)
        // }
        // console.log(arrayNose[0].position.x)
        var direction = await this.getdirection(pose, arrayNose, arrayNose.length, 3)
        //make function to calculate the rate of change in last x seconds 

        console.log("the value of direction is :", direction)



        if (direction == -1 && tempVar == 1) {
          console.log("------------------------- direction up called")
          this.dynamic_squat += 0.5
          tempVar = 0;

        }
        if (direction == 1 && tempVar == 0) {
          console.log("------------------------- direction down called")
          this.dynamic_squat += 0.5
          tempVar = 1;
        }



        console.log("Total number of squats:", this.dynamic_squat);

        init_i += 1;
      }
    }, 300);
  }

  // this function returns the direction of motion.
  async getdirection(pose, elements, length, frame) {

    var start = length - frame
    var changes = []
    var totalChange = 0

    console.log("get diection called ")
    for (var i = start, j = 0; j < frame - 1; i++, j++) {
      // console.log("start position:", elements[start].position.y)

      changes[j] = elements[start + j + 1].position.y - elements[start + j].position.y;

        totalChange += changes[j];
    }

    var relativeChange = Math.abs(totalChange/frame);
    var leastDistane = await this.findDistanceBy2Id(pose, 0, 1)
    leastDistane = leastDistane*2
    console.log("======total change:", relativeChange)

    console.log("=======distance between 2 points : ", leastDistane);

    if (totalChange >= 0.1 && relativeChange>leastDistane) {
      totalChange = 1
    }
    else if (totalChange <= -0.1 && relativeChange>leastDistane) {
      totalChange = -1
    }
    else totalChange = 0
    // console.log("overallChange :", totalChange);

    return totalChange;
  }


  async detectMotion(id){

    const vid = this.videos[id].data;
    const coachVid = this.videos[id].data;

    vid.width = 500;
    vid.height = 500 / 1.7778;

    //load posenet module 
    const posenet = require('@tensorflow-models/posenet');
    const net = await posenet.load();

    //A flag denoting change in state. 0 -> previous state is continuing, 1 -> state has changed
    let direction = 0
    //array count track 
    let init_i = 0

    //track change in direction
    let tempVar = 1

    const init_pose = await net.estimateSinglePose(vid, {
      flipHorizontal: false
    })

    let temp_id = setInterval(async () => {

      if (vid.onended) {
        clearInterval(temp_id);
      }
      else {
        const pose = await net.estimateSinglePose(vid, {
          flipHorizontal: false
        })

        //fill array with counts
        console.log("-------  ----------- --------  --------  ----------")
        console.log("Time:", init_i)
        console.log("Value of I :", init_i)

        //save current pose inside an array 
        this.allTrackingArray.push(pose.keypoints)

        // extract nose values 
        var arrayNose = this.pushupTrackingArray.map(each => { return each[0]});

        // ------ get distance travelled or changed in the last x frames 

        var distance = this.rateOfChange(pose, arrayNose, arrayNose.length, 3)
       
      }
    }, 300);

  }
//pose, arrayNose, arrayNose.length, 3 
  async rateOfChange(pose, elements, length, frame){

    var start = length - frame
    var changes = []
    var totalChange = 0

    console.log("rateOfChange called")
    for (var i = start, j = 0; j < frame - 1; i++, j++) {
      
      changes[j] = elements[start + j + 1].position.y - elements[start + j].position.y;

        changes[j] = Math.abs(changes[j])
        totalChange += changes[j];
        console.log("total change:", totalChange);
    }

    

    // var relativeChange = Math.abs(totalChange/frame);
    // var leastDistane = await this.findDistanceBy2Id(pose, 0, 1)
    // leastDistane = leastDistane*2
    // console.log("======total change:", relativeChange)

    // console.log("=======distance between 2 points : ", leastDistane);

    // if (totalChange >= 0.1 && relativeChange>leastDistane) {
    //   totalChange = 1
    // }
    // else if (totalChange <= -0.1 && relativeChange>leastDistane) {
    //   totalChange = -1
    // }
    // else totalChange = 0
    // // console.log("overallChange :", totalChange);

    // return totalChange;
    // // find he change in motion in the last x frames 
  }
}
