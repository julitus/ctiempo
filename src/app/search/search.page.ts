import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DbService } from '../services/db.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

  @Input() task_id: string;
  @Input() tracking_date: string;

  constructor(private dbService: DbService,
              private modalCtr: ModalController,
              private translate: TranslateService) { }

  ngOnInit() {
    console.log(this.task_id);
    console.log(this.tracking_date);
  }

  search() {
    this.closeModal({
      'type': 'search',
      'task_id': this.task_id,
      'tracking_date': this.tracking_date
    });
  }

  close() {
    this.closeModal({'type': 'close'});
  }

  async closeModal(data) {
    const dataModal = data;
    await this.modalCtr.dismiss(dataModal);
  }

}
