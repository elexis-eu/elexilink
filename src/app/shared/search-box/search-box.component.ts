import {
  Component,
  ElementRef,
  Input,
  OnInit,
  AfterViewInit,
  ViewChild,
  HostListener,
} from '@angular/core';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, NavigationCancel, NavigationEnd, NavigationError, NavigationExtras, NavigationStart, Router, RouterEvent } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
import first from 'lodash-es/first';
import get from 'lodash-es/get';
import { filter, map, Observable, startWith } from "rxjs";
import isString from "lodash-es/isString";
import { MatAutocompleteActivatedEvent } from "@angular/material/autocomplete";
import { LocalStorage, LocalStorageService } from "ngx-store";

@Component({
  selector: 'search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss'],
})
export class SearchBoxComponent implements OnInit, AfterViewInit {
  @Input('onHomeScreen') onHomeScreen: boolean = false;
  @Input('shrink') shrink: boolean = false;

  @ViewChild('input') inputElement!: ElementRef;
  @ViewChild('inputLanguages') inputLanguagesElement!: ElementRef;
  isLanguagePickerOpen!: boolean;
  loading = false;
  sourceLanguage!: Language.Result;
  faSearch = faSearch;
  faTimes = faTimes;
  autocomplete = new FormControl();
  filteredLanguages!: Observable<Core.SelectableItem<Language.Result>[]>;
  form = this.formBuilder.group({
    sourceLanguage: '',
    headword: '',
  });

  constructor(
    private formBuilder: FormBuilder,
    public data: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  private get navigationStart$() {
    return (this.router.events as Observable<RouterEvent>).pipe(
      filter((event: RouterEvent) => event instanceof NavigationStart)
    );
  }

  private get navigationEnd$() {
    return (this.router.events as Observable<RouterEvent>).pipe(
      filter((event: RouterEvent) => {
        return (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        );
      })
    );
  }

  onLanguageChange(event: MatAutocompleteActivatedEvent): void {
    this.sourceLanguage = get(event, "option.value") as unknown as Language.Result;
    this.form.patchValue({ sourceLanguage: get(this.sourceLanguage, 'code', '') });
    if (this.onHomeScreen) {
      this.form.value.sourceLanguage ? this.form.enable() : this.form.disable();
    }
    if (this.form.status !== "DISABLED") {
      window.requestAnimationFrame(() => {
        this.inputElement.nativeElement.focus();
      });
    }
  }

  onLanguageDropdownChange(languages: Language.Result[]): void {
    this.sourceLanguage = first(languages) as Language.Result;
    this.form.patchValue({ sourceLanguage: get(this.sourceLanguage, 'code', '') });
    if (this.onHomeScreen) {
      this.form.value.sourceLanguage ? this.form.enable() : this.form.disable();
    }
    this.autocomplete.patchValue(this.sourceLanguage);
    if (this.form.status !== "DISABLED") {
      window.requestAnimationFrame(() => {
        this.inputElement.nativeElement.focus();
      });
    }
  }

  onSubmit(): void {
    if (
      !this.isLanguagePickerOpen &&
      this.form.value.sourceLanguage &&
      this.form.value.headword
    ) {
      const wasHeadwordChanged = this.data.headword !== this.form.value.headword;
      if (wasHeadwordChanged) {
        this.data.headword = this.form.value.headword;
        this.data.conceptView = false;
        this.data.sourceDict = undefined;
        this.data.targetDict = undefined;
        this.data.targetLanguage = undefined;
        this.data.similarity = undefined;
      }
      let parameters = {} as Link.Parameters;
      if (!!this.data.sourceDict && !wasHeadwordChanged) {
        parameters.sourceDict = this.data.sourceDict;
      }
      if (!!this.data.targetLanguage && !wasHeadwordChanged) {
        parameters.targetLanguage = this.data.targetLanguage;
      }
      if (!!this.data.targetDict && !wasHeadwordChanged) {
        parameters.targetDict = this.data.targetDict;
      }
      if (!!this.data.similarity && !wasHeadwordChanged) {
        parameters.similarity = this.data.similarity;
      }
      if (!!this.data.conceptView && !wasHeadwordChanged) {
        parameters.conceptView = this.data.conceptView;
      }
      const config = {
        queryParams: parameters,
      } as NavigationExtras;
      this.router.navigate(['links', this.form.value.sourceLanguage, this.form.value.headword], config);
    }
  }

  clearLanguage(): void {
    this.autocomplete.patchValue("");
    this.form.patchValue({ sourceLanguage: "" });
    this.inputLanguagesElement.nativeElement.focus();
  }

  clear(): void {
    this.form.patchValue({ headword: '' });
    this.inputElement.nativeElement.focus();
  }

  displayFn(language: Language.Result): string {
    return get(language, "title" ,"") + "";
  }

  ngOnInit(): void {
    this.navigationStart$.subscribe(() => {
      this.loading = true;
    });
    this.navigationEnd$.subscribe(() => {
      this.loading = false;
    });
    const routeParams = this.route.snapshot.paramMap;
    const headwordFromRoute = routeParams.get('headword');
    const langFromRoute = routeParams.get('sourceLanguage');
    this.filteredLanguages = this.autocomplete.valueChanges.pipe(
      map((value) => {
        return this.data.sourceLanguages.filter((language) => {
          const query = (isString(value) ? value : get(language, "title" ,"")) + ""
          return language.label.toLowerCase().includes(query.toLowerCase());
        });
      }),
    );
    if (this.onHomeScreen && !headwordFromRoute) {
      this.form.disable();
    }
    if (headwordFromRoute) {
      this.form.patchValue({ headword: headwordFromRoute });
    }

    if (langFromRoute) {
      for (const language of this.data.sourceLanguages) {
        if (language.value.code === langFromRoute) {
          language.selected = true;
          this.sourceLanguage = language.value;
          this.autocomplete.patchValue(language.value);
          break;
        }
      }
      this.form.patchValue({ sourceLanguage: langFromRoute });
    }
  }

  ngAfterViewInit(): void {
    if (this.onHomeScreen) {
      this.inputLanguagesElement.nativeElement.focus();
    }
  }
}
