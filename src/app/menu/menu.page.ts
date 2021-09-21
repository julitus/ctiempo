import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateConfigService } from '../services/translate-config.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
  public option: string;
  public selectedLanguage:string;

  constructor(private activatedRoute: ActivatedRoute,
              private translateConfigService: TranslateConfigService) { 
    this.selectedLanguage = this.translateConfigService.getLanguage();
  }

  ngOnInit() {
    this.option = this.activatedRoute.snapshot.paramMap.get('id');
  }

  languageChanged() {
    this.translateConfigService.setLanguage(this.selectedLanguage);
  }

}
