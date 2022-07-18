import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from "@angular/router";
import {faFilter, faArrowRotateRight, faToggleOff, faToggleOn} from '@fortawesome/free-solid-svg-icons';
import { cloneDeep, get } from "lodash-es";
import { DataService } from "src/app/core/services/data.service";

@Component({
  selector: 'filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {
  /**
   * The list of dictionaries that the user can select from.
   */
  @Input('dictionaries') dictionaries: Core.SelectableItem[] = [];
  selectedDictionaries: Dictionary.Result[] = [];
  @Output('dictionariesChange') dictionariesChange = new EventEmitter<Dictionary.Result[]>();
  /**
   * The languages that the user can select from.
   */
  @Input('languages') languages: Core.SelectableItem[] = [];
  selectedLanguages: Language.Result[] = [];
  @Output('languagesChange') languagesChange = new EventEmitter<Language.Result[]>();
  /**
   * The list of similarities to display.
   */
  @Input('similarities') similarities: Core.SelectableItem[] = [];
  selectedSimilarities: Similarity.Result[] = [];
  @Output('similaritiesChange') similaritiesChange = new EventEmitter<Similarity.Result[]>();

  @Input('showConceptViewToggle') showConceptViewToggle = false
  @Input('conceptView') conceptView = false
  @Output('conceptViewToggled') conceptViewToggled = new EventEmitter<boolean>();

  faFilter = faFilter;
  faArrowRotateRight = faArrowRotateRight;
  faToggleOff = faToggleOff;
  faToggleOn = faToggleOn;

  clearButtonEnabled = false

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public data: DataService,
  ) {
  }


  /**
   * On initialization, check if the clear button should be shown.
   */
  ngOnInit() {
    this.checkClearButton()
  }

  onLanguagesChange(items: Language.Result[]) {
    this.selectedLanguages = items;
    this.languagesChange.emit(items);
    this.checkClearButton();
  }

  onDictionariesChange(items: Dictionary.Result[]) {
    this.selectedDictionaries = items;
    this.dictionariesChange.emit(items);
    this.checkClearButton();
  }

  onSimilaritiesChange(items: Similarity.Result[]) {
    this.selectedSimilarities = items;
    this.similaritiesChange.emit(items);
    this.checkClearButton();
  }

  /**
   * Handles the change of the dropdown menu.
   * @returns None
   */
  onDropdownChange() {
    this.checkClearButton();
  }

  /**
   * Toggles the concept view on and off.
   * @returns None
   */
  toggleConceptView() {
    this.conceptView = !this.conceptView
    this.conceptViewToggled.emit(this.conceptView)
  }

  /**
   * Check if clear button should be enabled.
   * @returns None
   */
  checkClearButton() {
    if (this.hasSelectedItems(this.dictionaries) || this.selectedDictionaries.length > 0) {
      this.clearButtonEnabled = true
    } else if (this.hasSelectedItems(this.languages) || this.selectedLanguages.length > 0) {
      this.clearButtonEnabled = true
    } else if (this.hasSelectedItems(this.similarities) || this.selectedSimilarities.length > 0) {
      this.clearButtonEnabled = true
    } else {
      this.clearButtonEnabled = false
    }
  }

  /**
   * Checks if any of the items in the array are selected.
   * @param {Core.SelectableItem[]} items - the array of items to check.
   * @returns {boolean} - true if any of the items are selected.
   */
  hasSelectedItems(items: Core.SelectableItem[]): boolean {
    if (items.length <= 0) return false;

    return items.some(el => el.selected)
  }

  /**
   * Clears the selected filters.
   * @returns None
   */
  clear() {
    this.dictionaries = cloneDeep(this.dictionaries.map(el => {el.selected = false; return el}))
    this.languages = cloneDeep(this.languages.map(el => {el.selected = false; return el}))
    this.similarities = cloneDeep(this.similarities.map(el => {el.selected = false; return el}))
    this.clearButtonEnabled = false

    const config = {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: null,
    } as NavigationExtras;
    this.router.navigate([], config);
  }
}
