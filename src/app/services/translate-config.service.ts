import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslateConfigService {

  constructor(private translate: TranslateService) { }

  getDefaultLanguage() {
    let language = localStorage.getItem("chosenLanguage");
    if (!language) {
      language = this.translate.getBrowserLang();
    }
    this.translate.setDefaultLang(language);
    localStorage.setItem("chosenLanguage", language);
    return language;
  }

  setLanguage(setLang) {
    this.translate.use(setLang);
    localStorage.setItem("chosenLanguage", setLang);
  }

  getLanguage() {
    if (this.translate.currentLang) {
      return this.translate.currentLang;
    }
    return this.getDefaultLanguage();
  }

}
