import { Component } from '@angular/core';
import { DbService } from '../services/db.service';
import { ModalController, AlertController } from '@ionic/angular';
import { CategoryPage } from '../category/category.page';
import { TaskPage } from '../task/task.page';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  public selectSegment: string = "tasks";
  dataResp: any;

  constructor(private dbService: DbService,
              public modalCtrl: ModalController,
              public alertController: AlertController,
              private translate: TranslateService) {

  }

  async add() {
    if (this.selectSegment == 'tasks') {
      const modal = await this.modalCtrl.create({
        component: TaskPage,
        componentProps: {
          'type': 'new',
          'name': '',
          'category_id': '1',
          'id': 0
        }
      });

      modal.onDidDismiss().then((modalDataResponse) => {
        if (modalDataResponse !== null) {
          this.dataResp = modalDataResponse.data;
          console.log('Modal Sent Data : ', modalDataResponse.data);
          if (this.dataResp.type == 'new') {
            this.dbService.addTask(this.dataResp.name, this.dataResp.category_id);
          }
        }
      });

      return await modal.present();
    } else {
      const modal = await this.modalCtrl.create({
        component: CategoryPage,
        componentProps: {
          'type': 'new',
          'name': '',
          'icon': 'body',
          'id': 0
        }
      });

      modal.onDidDismiss().then((modalDataResponse) => {
        if (modalDataResponse !== null) {
          this.dataResp = modalDataResponse.data;
          console.log('Modal Sent Data : ', modalDataResponse.data);
          if (this.dataResp.type == 'new') {
            this.dbService.addCategory(this.dataResp.name, this.dataResp.icon);
          }
        }
      });

      return await modal.present();
    }
  }

  async editTask(task) {
    task.type = 'edit';
    task.category_id = task.category_id.toString();
    const modal = await this.modalCtrl.create({
      component: TaskPage,
      componentProps: task
    });

    modal.onDidDismiss().then((modalDataResponse) => {
      if (modalDataResponse !== null) {
        this.dataResp = modalDataResponse.data;
        console.log('Modal Sent Data : ', modalDataResponse.data);
        if (this.dataResp.type == 'edit') {
          this.dbService.updateTask(this.dataResp.id, this.dataResp.name, this.dataResp.category_id);
        }
      }
    });

    return await modal.present();
  }

  async editCategory(category) {
    category.type = 'edit';
    const modal = await this.modalCtrl.create({
      component: CategoryPage,
      componentProps: category
    });

    modal.onDidDismiss().then((modalDataResponse) => {
      if (modalDataResponse !== null) {
        this.dataResp = modalDataResponse.data;
        console.log('Modal Sent Data : ', modalDataResponse.data);
        if (this.dataResp.type == 'edit') {
          this.dbService.updateCategory(this.dataResp.id, this.dataResp.name, this.dataResp.icon);
        }
      }
    });

    return await modal.present();
  }

  async removeCategory(id) {
    const alert = await this.alertController.create({
      header: this.translate.instant('TAB2.delete_category'),
      message: this.translate.instant('TAB2.delete_message_category'),
      buttons: [
        {
          text: this.translate.instant('TAB2.delete_cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: delete category');
          }
        }, {
          text: this.translate.instant('TAB2.delete_ok'),
          handler: () => {
            this.dbService.deleteRow('categories', id);
          }
        }
      ]
    });

    await alert.present();
    
  }

  async removeTask(id) {
    const alert = await this.alertController.create({
      header: this.translate.instant('TAB2.delete_task'),
      message: this.translate.instant('TAB2.delete_message_task'),
      buttons: [
        {
          text: this.translate.instant('TAB2.delete_cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: delete category');
          }
        }, {
          text: this.translate.instant('TAB2.delete_ok'),
          handler: () => {
            this.dbService.deleteRow('tasks', id);
          }
        }
      ]
    });

    await alert.present();
    
  }

}
