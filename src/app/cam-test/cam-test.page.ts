import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';


import { getAdjacentKeyPoints, load, PoseNet } from '@tensorflow-models/posenet';
declare var require: any


@Component({
  selector: 'app-cam-test',
  templateUrl: './cam-test.page.html',
  styleUrls: ['./cam-test.page.scss'],
})
export class CamTestPage implements OnInit {
  posenet = require('@tensorflow-models/posenet');

  @ViewChild('fileSelector') fileInput!: ElementRef;
  @ViewChild('VidSelector') videoInput!: ElementRef;

  @ViewChild('canvas', { static: true }) canvas!: ElementRef;
  @ViewChild('canvasContainer') canvasContainer!: ElementRef;

  ratio: number | null = null;
  modelPromise: Promise<PoseNet>;
  private ctx!: CanvasRenderingContext2D;
  loadingController: any;


  constructor(public actionSheet: ActionSheetController, private loadingCtrl: LoadingController) {
    this.modelPromise = load();
    this.loadingController = new LoadingController();
  }

  ngOnInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    // this is posenet();
  }


  //deals with image loading settings 
  onFileCange(event: Event): void {
    console.log("file changed");
    // @ts-ignore

    const url = URL.createObjectURL(event.target.files[0]);
    const img = new Image();

    // Test image type and possibility of adding a video 
    console.log("Image is of Type : " + typeof img);

    img.onload = async () => {
      this.drawImageScaled(img);
      const loading = await this.loadingController.create({
        message: 'Estimating...'
      });
      await loading.present();
      await this.estimate(img);
      await loading.dismiss();
    };

    img.src = url;
  }

  clickFileSelector(video?): void {
    console.log("click.")
    if (video == "VidSelector") {
      return this.videoInput.nativeElement.click();
    }
    this.fileInput.nativeElement.click();
  }


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  drawImageScaled(img: any): void {
    const width = this.canvasContainer.nativeElement.clientWidth;
    const height = this.canvasContainer.nativeElement.clientHeight;

    const hRatio = width / img.width;
    const vRatio = height / img.height;
    this.ratio = Math.min(hRatio, vRatio);
    if (this.ratio > 1) {
      this.ratio = 1;
    }

    this.canvas.nativeElement.width = img.width * this.ratio;
    this.canvas.nativeElement.height = img.height * this.ratio;

    this.ctx.clearRect(0, 0, width, height);
    this.ctx.drawImage(img, 0, 0, img.width, img.height,
      0, 0, img.width * this.ratio, img.height * this.ratio);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async estimate(img: any): Promise<void> {

    const flipHorizontal = false;
    const posenet = require('@tensorflow-models/posenet');
    const net = await posenet.load();
    // const model = await this.modelPromise;
    const poses = await net.estimatePoses(img, {
      flipHorizontal,
      // decodingMethod: 'single-person'
    });
    const pose = poses && poses[0];

    if (pose && pose.keypoints && this.ratio) {
      for (const keypoint of pose.keypoints.filter(kp => kp.score >= 0.2)) {
        const x = keypoint.position.x * this.ratio;
        const y = keypoint.position.y * this.ratio;

        console.log("any...", x, y)

        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = '#bada55';
        this.ctx.stroke();
      }

      const adjacentKeyPoints = getAdjacentKeyPoints(pose.keypoints, 0.2);
      adjacentKeyPoints.forEach(keypoints => this.drawSegment(keypoints[0].position, keypoints[1].position));
    }
  }

  private drawSegment({ y: ay, x: ax }: { y: number, x: number }, { y: by, x: bx }: { y: number, x: number }): void {
    if (this.ratio) {
      this.ctx.beginPath();
      this.ctx.moveTo(ax * this.ratio, ay * this.ratio);
      this.ctx.lineTo(bx * this.ratio, by * this.ratio);
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = '#bada55';
      this.ctx.stroke();
    }
  }


  // load video 
  async onVideoUpload(event: Event) {
    // get local filename 
    // const url = URL.createObjectURL(event);
    const target = event.target as any;
    const url = URL.createObjectURL(target.files[0]);
    const vid = document.createElement('video');
    const posenet = require('@tensorflow-models/posenet');
    const loading = await this.loadingCtrl.create();
    await loading.present();
    vid.load();
    vid.onloadstart = function () {
      alert("Starting to load video");
    };
    vid.onloadeddata = () => {
      loading.dismiss();
      console.log(vid);
      this.getPoseEstimation(vid)
    }
    vid.src = url;
  }

  // video pose tracking   
  private async vidEstimate(vid: any): Promise<void> {

    const flipHorizontal = false;
    const net = await this.posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: { width: 640, height: 480 },
      multiplier: 0.75
    });

    // const frames = await this.extractFramesFromVideo(vid);

    const poses = await net.estimatePoses(vid, {
      flipHorizontal,
      decodingMethod: 'single-person'
    });
    const pose = poses && poses[0];

    if (pose && pose.keypoints && this.ratio) {
      for (const keypoint of pose.keypoints.filter(kp => kp.score >= 0.2)) {
        const x = keypoint.position.x * this.ratio;
        const y = keypoint.position.y * this.ratio;

        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = '#bada55';
        this.ctx.stroke();
      }
      const adjacentKeyPoints = getAdjacentKeyPoints(pose.keypoints, 0.2);
      adjacentKeyPoints.forEach(keypoints => this.drawSegment(keypoints[0].position, keypoints[1].position));
    }
  }

  async getPoseEstimation(vid, fps?) {
    if (!fps) fps = 30;
    console.log("getPoseEstimation starts.", vid, fps)

    return new Promise<any[]>(async (resolve) => {
      let seekResolve;
      vid.addEventListener('seeked', async function () {
        if (seekResolve) seekResolve();
      });
      let duration = vid.duration;
      let canvas = document.createElement('canvas');
      let context = canvas.getContext('2d');
      let [w, h] = [vid.videoWidth, vid.videoHeight]
      canvas.width = w;
      canvas.height = h;

      let frames = [];
      let interval = 1 / fps;
      let currentTime = 0;

      while (currentTime < duration) {
        await this.posenet.load().then(function (net) {
          console.log(typeof vid)
          const pose = net.estimateSinglePose(vid, {
            flipHorizontal: true
          });
          return pose;
        }).then(function (pose) {
          console.log(pose);
        });

        vid.currentTime = currentTime;
        await new Promise(r => seekResolve = r);

        context.drawImage(vid, 0, 0, w, h);
        let base64ImageData = canvas.toDataURL();
        frames.push(base64ImageData);

        currentTime += interval;
      }


      // console.log("Frames type "+ typeof frames + " length of Frames"+ frames.length)

      resolve(frames);
    });
  }
}

