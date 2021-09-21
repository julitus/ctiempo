import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
})
export class CategoryPage implements OnInit {

  @Input() id: number;
  @Input() name: string;
  @Input() icon: string;
  @Input() type: string;

  constructor(private modalCtr: ModalController,
              public alertController: AlertController,
              private translate: TranslateService) { }

  ngOnInit() {
    console.log(this.name);
    console.log(this.icon);
    console.log(this.id);
    console.log(this.type);
  }

  save() {
    if (this.name != '' && this.icon != '') {
      this.closeModal({
        'type': this.type,
        'id': this.id,
        'name': this.name,
        'icon': this.icon,
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
      header: this.translate.instant('CATEGORY.alert_category'),
      message: this.translate.instant('CATEGORY.alert_message_category'),
      buttons: [
        {
          text: this.translate.instant('CATEGORY.alert_ok'),
          handler: () => {
            console.log('Confirm Okay');
          }
        }
      ]
    });

    await alert.present();
  }

}
