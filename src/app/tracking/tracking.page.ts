import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DbService } from '../services/db.service';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.page.html',
  styleUrls: ['./tracking.page.scss'],
})
export class TrackingPage implements OnInit {
  public selectSegment: string = "choose";
  private name: string = "";
  private category_id = "1";

  constructor(private dbService: DbService,
              private modalCtr: ModalController,
              public alertController: AlertController,
              private translate: TranslateService) { }

  ngOnInit() {
  }

  async chooseTask(id) {
    const alert = await this.alertController.create({
      header: this.translate.instant('TRACKING.choose_task'),
      message: this.translate.instant('TRACKING.choose_message_task'),
      buttons: [
        {
          text: this.translate.instant('TRACKING.choose_cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: choose task');
          }
        }, {
          text: this.translate.instant('TRACKING.choose_ok'),
          handler: () => {
            this.closeModal({
              'type': 'choose',
              'task_id': id
            });
          }
        }
      ]
    });

    await alert.present();
  }

  async save() {

    if (this.name != '' && this.category_id != '0') {
      const alert = await this.alertController.create({
        header: this.translate.instant('TRACKING.create_task'),
        message: this.translate.instant('TRACKING.create_message_task'),
        buttons: [
          {
            text: this.translate.instant('TRACKING.create_cancel'),
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              console.log('Confirm Cancel: create task');
            }
          }, {
            text: this.translate.instant('TRACKING.create_ok'),
            handler: () => {
              this.closeModal({
                'type': 'create',
                'name': this.name,
                'category_id': this.category_id,
              });
            }
          }
        ]
      });

      await alert.present();
    } else {
      this.showAlert();
    }
  }

  close(data) {
    this.closeModal({'type': 'close'});
  }

  async closeModal(data) {
    const dataModal = data;
    await this.modalCtr.dismiss(dataModal);
  }

  async showAlert() {
    const alert = await this.alertController.create({
      header: this.translate.instant('TRACKING.alert_task'),
      message: this.translate.instant('TRACKING.alert_message_task'),
      buttons: [
        {
          text: this.translate.instant('TRACKING.alert_ok'),
          handler: () => {
            console.log('Confirm Okay');
          }
        }
      ]
    });

    await alert.present();
  }

}
