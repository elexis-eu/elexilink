import {Component, EventEmitter, Input, Output} from '@angular/core';
import {faChevronDown, faChevronUp} from "@fortawesome/free-solid-svg-icons";
import { LocalStorage } from "ngx-store";

@Component({
  selector: 'language-picker',
  templateUrl: './language-picker.component.html',
  styleUrls: ['./language-picker.component.scss']
})
export class LanguagePickerComponent {

  @Input('selectedLangCode') selectedLangCode!: string;
  @Output('change') change = new EventEmitter<Core.SelectableItem<Language.Result>>();

  isOpen = false
  @LocalStorage() languages!: Core.SelectableItem<Language.Result>[];

  faChevronDown = faChevronDown
  faChevronUp = faChevronUp

  openLanguagePicker() {
    this.isOpen = !this.isOpen
  }

  closeLanguagePicker() {
    this.isOpen = false
  }

  selectLanguage(language: Core.SelectableItem<Language.Result>) {
    this.isOpen = false;
    this.selectedLangCode = language.value.code;
    this.change.emit(language);
  }

  getSelectedLanguage() {
    const selectedLang = this.languages.find(lang => lang.value.code === this.selectedLangCode);
    return selectedLang ? selectedLang.label : "Language";
  }

}
