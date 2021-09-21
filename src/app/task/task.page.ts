import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DbService } from '../services/db.service';

@Component({
  selector: 'app-task',
  templateUrl: './task.page.html',
  styleUrls: ['./task.page.scss'],
})
export class TaskPage implements OnInit {

  @Input() id: number;
  @Input() category_id: string;
  @Input() name: string;
  @Input() type: string;

  constructor(private dbService: DbService,
              private modalCtr: ModalController,
              public alertController: AlertController,
              private translate: TranslateService) { }

  ngOnInit() {
    console.log(this.name);
    console.log(this.category_id);
    console.log(this.id);
    console.log(this.type);
  }

  save() {
    if (this.name != '' && this.category_id != '0') {
      this.closeModal({
        'type': this.type,
        'id': this.id,
        'name': this.name,
        'category_id': this.category_id,
      });
    } else {
      this.showAlert();
    }
  }

  close() {
    this.closeModal({'type': 'close'});
  }

  async closeModal(data) {
    const dataModal = data;
    await this.modalCtr.dismiss(dataModal);
  }

  async showAlert() {
    const alert = await this.alertController.create({
      header: this.translate.instant('TASK.alert_task'),
      message: this.translate.instant('TASK.alert_message_task'),
      buttons: [
        {
          text: this.translate.instant('TASK.alert_ok'),
          handler: () => {
            console.log('Confirm Okay');
          }
        }
      ]
    });

    await alert.present();
  }

}
