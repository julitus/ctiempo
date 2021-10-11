import { Component } from '@angular/core';
import { DbService } from '../services/db.service';
import { ModalController, AlertController } from '@ionic/angular';
import { TrackingPage } from '../tracking/tracking.page';
import { SearchPage } from '../search/search.page';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  dataResp: any;
  private task_id: string = '';
  private trckg_date: string = '';

  public timeBegan = null;
  public timeStopped:any = null;
  public stoppedDuration:any = 0;
  public started = null;
  public running = false;
  public blankTime = "00:00:00.000";
  public time = "00:00:00.000";

  constructor(private dbService: DbService,
              public alertController: AlertController,
              public modalCtrl: ModalController,
              private translate: TranslateService) {

    this.trckg_date = (new Date(this.getToday()+' 12:00:00')).toISOString();
    let timeSaved = JSON.parse(localStorage.getItem("timeSaved"));
    if (timeSaved) {
      this.timeBegan = new Date(timeSaved.timeBegan);
      this.timeStopped = new Date(timeSaved.timeStopped);
      this.stoppedDuration = timeSaved.stoppedDuration;
      this.started = timeSaved.started;
      this.running = timeSaved.running;
      this.time = timeSaved.time;
      if (this.running) {
        this.running = false;
        this.timeStopped = null;
        this.start();
      }
    }
  }

  start() {
    if (this.running) return;

    if (this.timeBegan === null) {
      this.reset();
      this.timeBegan = new Date();
    }

    if (this.timeStopped !== null) {
      let newStoppedDuration:any = (+new Date() - this.timeStopped);
      this.stoppedDuration = this.stoppedDuration + newStoppedDuration;
    }

    this.started = setInterval(this.clockRunning.bind(this), 10);
    this.running = true;

    this.saveTimeVars();
  }

  stop() {
    this.running = false;
    this.timeStopped = new Date();
    clearInterval(this.started);

    this.saveTimeVars();
  }

  reset() {
    this.running = false;
    clearInterval(this.started);
    this.stoppedDuration = 0;
    this.timeBegan = null;
    this.timeStopped = null;
    this.time = this.blankTime;

    localStorage.removeItem("timeSaved");
  }    

  zeroPrefix(num, digit) {
    let zero = '';
    for(let i = 0; i < digit; i++) {
      zero += '0';
    }
    return (zero + num).slice(-digit);
  }    

  clockRunning() {
    let currentTime:any = new Date();
    let timeElapsed:any = new Date(currentTime - this.timeBegan - this.stoppedDuration);
    let hour = timeElapsed.getUTCHours();
    let min = timeElapsed.getUTCMinutes();
    let sec = timeElapsed.getUTCSeconds();
    let ms = timeElapsed.getUTCMilliseconds();    

    this.time =
    this.zeroPrefix(hour, 2) + ":" +
    this.zeroPrefix(min, 2) + ":" +
    this.zeroPrefix(sec, 2) + "." +
    this.zeroPrefix(ms, 3);
  }

  saveTimeVars() {
    localStorage.setItem("timeSaved", JSON.stringify({
      "timeBegan": this.timeBegan,
      "timeStopped": this.timeStopped,
      "stoppedDuration": this.stoppedDuration,
      "started": this.started,
      "running": this.running,
      "time": this.time
    }));
  }

  async save() {
    const modal = await this.modalCtrl.create({
      component: TrackingPage,
      componentProps: {}
    });

    modal.onDidDismiss().then((modalDataResponse) => {
      if (modalDataResponse !== null) {
        this.dataResp = modalDataResponse.data;
        console.log('Modal Sent Data : ', modalDataResponse.data);
        if (this.dataResp.type != 'close') {
          let tracking_date = ("0" + this.timeBegan.getDate()).slice(-2) + "-" + ("0"+(this.timeBegan.getMonth()+1)).slice(-2) + "-" + this.timeBegan.getFullYear();
          let tracking_start = ("0" + this.timeBegan.getHours()).slice(-2) + ":" + ("0" + this.timeBegan.getMinutes()).slice(-2);
          //let close_tracking = parseInt((this.timeStopped.getTime() / 1000).toFixed(0));
          let close_tracking = parseInt((this.timeBegan.getTime() / 1000).toFixed(0));
          let seconds = this.getSeconds(this.time);
          let tracking_time = this.getTimeText(seconds);
          if (this.dataResp.type == 'choose') {
            this.dbService.addTracking(this.dataResp.task_id, tracking_date, tracking_start, seconds, close_tracking, tracking_time);
          } else if (this.dataResp.type == 'create') {
            this.dbService.addTrackingAndTask(this.dataResp.name, this.dataResp.category_id, tracking_date, tracking_start, seconds, close_tracking, tracking_time);
          }
          this.trckg_date = (new Date(this.getToday()+' 12:00:00')).toISOString();
          this.task_id = '';
          this.reset();
        }
      }
    });

    return await modal.present();
  }

  async search() {
    const modal = await this.modalCtrl.create({
      component: SearchPage,
      componentProps: {
        'task_id': this.task_id,
        'tracking_date': this.trckg_date
      }
    });

    modal.onDidDismiss().then((modalDataResponse) => {
      if (modalDataResponse !== null) {
        this.dataResp = modalDataResponse.data;
        console.log('Modal Sent Data : ', modalDataResponse.data);
        if (this.dataResp.type == 'search') {
          this.trckg_date = this.dataResp.tracking_date;
          this.task_id = this.dataResp.task_id;
          this.dbService.getTrackings(this.task_id, this.getDateFormat(this.trckg_date));
        }
      }
    });

    return await modal.present();
  }

  async editTracking(tracking) {
    console.log(tracking);
    const alert = await this.alertController.create({
      header: this.translate.instant('TAB1.edit_tracking'),
      message: this.translate.instant('TAB1.edit_message_tracking'),
      inputs: [
        {
          name: 'tracking_time',
          type: 'text',
          value: tracking.tracking_time,
          placeholder: 'hh:mm:ss'
        }
      ],
      buttons: [
        {
          text: this.translate.instant('TAB1.delete_cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: edit tracking');
          }
        }, {
          text: this.translate.instant('TAB1.delete_ok'),
          handler: (alertData) => {
            if (this.isCorrectFormat(alertData.tracking_time)) {
              let seconds = this.getSeconds(alertData.tracking_time)-1;
              this.dbService.updateTracking(tracking.id, seconds, alertData.tracking_time, tracking.tracking_date);
              console.log(alertData);
              console.log('Confirm Edit: edit tracking');
            }
          }
        }
      ]
    });

    await alert.present();

  }

  async removeTracking(id, task_id) {
    const alert = await this.alertController.create({
      header: this.translate.instant('TAB1.delete_tracking'),
      message: this.translate.instant('TAB1.delete_message_tracking'),
      buttons: [
        {
          text: this.translate.instant('TAB1.delete_cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: delete tracking');
          }
        }, {
          text: this.translate.instant('TAB1.delete_ok'),
          handler: () => {
            this.trckg_date = (new Date(this.getToday()+' 12:00:00')).toISOString();
            this.task_id = '';
            this.dbService.deleteRow('trackings', id, task_id);
          }
        }
      ]
    });

    await alert.present();
    
  }

  isCorrectFormat(t) {
    let pattern = /^[0-9][0-9]:[0-5][0-9]:[0-5][0-9]$/;
    return t.match(pattern);
  }

  getSeconds(t) {
    return (parseInt(t.substr(0,2)) * 3600) + (parseInt(t.substr(3,2)) * 60) + parseInt(t.substr(6,2)) + 1;
  }

  getTimeText(sec) {
    let hour = Math.trunc(sec / 3600);
    sec = sec % 3600;
    let min = Math.trunc(sec / 60);
    sec = sec % 60;
    return this.zeroPrefix(hour, 2) + ":" + this.zeroPrefix(min, 2) + ":" + this.zeroPrefix(sec, 2);
  }

  getToday() {
    let today = new Date();
    return today.getFullYear() + "-" + ("0"+(today.getMonth()+1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2);
  }

  getDateFormat(d) {
    return d.substr(8,2)+"-"+d.substr(5,2)+"-"+d.substr(0,4);
  }

}
