import { Component } from '@angular/core';
import { TranslateConfigService } from './services/translate-config.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'home', url: '/tabs', icon: 'home' },
    { title: 'language', url: '/menu/language', icon: 'settings' },
    { title: 'import_export', url: '/menu/import_export', icon: 'cloud-done' },
  ];
  
  constructor(private translateConfigService: TranslateConfigService) {
    console.log("constructor app component");
    this.translateConfigService.getDefaultLanguage();
  }

}
