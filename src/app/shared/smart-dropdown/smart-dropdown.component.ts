import { CdkOverlayOrigin } from "@angular/cdk/overlay";
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { faSquare, faSquareCheck } from '@fortawesome/free-regular-svg-icons';
import {
  faChevronUp,
  faMagnifyingGlass,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import cloneDeep from 'lodash-es/cloneDeep';
import { debounceTime, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'smart-dropdown',
  templateUrl: './smart-dropdown.component.html',
  styleUrls: ['./smart-dropdown.component.scss'],
})
export class SmartDropdownComponent implements OnInit, OnDestroy, OnChanges {
  @Input('title') title!: string;

  @Input('noBackground') noBackground: boolean = false;

  @Input('searchPlaceholder') searchPlaceholder: any;

  @Input('singleItemMode') singleItemMode: boolean = true;

  @Input('isSearchShown') isSearchShown: boolean = true;
  @Input('showSelectedTitle') showSelectedTitle: boolean = true;


  @Input('items') items: Core.SelectableItem[] = [];

  @Output('change') change = new EventEmitter<any[]>();

  @Input('isOpen') isOpen = false;
  @Input('fullTriggerWidth') fullTriggerWidth = false;
  @Output('isOpenChange') isOpenChange: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('trigger') trigger!: CdkOverlayOrigin;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLElement>;
  triggerRect!: DOMRect;
  filteredItems: Core.SelectableItem[] = [];
  selectedItems: Core.SelectableItem[] = [];

  text$: Subject<string> = new Subject<string>();

  search$: Observable<string>;

  selectedValues: any[] = [];

  q = '';

  faChevronUp = faChevronUp;
  faChevronDown = faChevronDown;
  faLookup = faMagnifyingGlass;
  faSquareCheck = faSquareCheck;
  faSquare = faSquare;
  faMarks = faTimes;
  private readonly onDestroy$ = new Subject<boolean>();

  constructor() {
    this.search$ = this.text$.pipe(
      takeUntil(this.onDestroy$),
      debounceTime(200)
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.filteredItems = cloneDeep(changes['items'].currentValue);
      this.selectedItems = cloneDeep(this.filteredItems.filter((s) => s.selected));
    }
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    this.selectedItems = cloneDeep(this.items.filter((s) => s.selected));
    this.search$.subscribe((value) => {
      this.filteredItems = this.filter(value);
    });
  }

  get selectedTitle() {
    if (this.singleItemMode && this.showSelectedTitle) {
      const selectedTitle = this.selectedItems.length === 1 ? this.selectedItems[0].label : "";
      return selectedTitle.length > 0 ? selectedTitle : this.title;
    } else {
      return this.title;
    }
  }

  onInputChange(query: string) {
    this.text$.next(query);
  }

  toggleMenu() {
    if (this.fullTriggerWidth) {
      this.triggerRect = this.trigger.elementRef.nativeElement.parentElement.parentElement.getBoundingClientRect();
    }
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
    if (this.isSearchShown) {
      window.requestAnimationFrame(() => {
        this.searchInput.nativeElement.focus();
      });
    }
  }

  selectFirstItem() {
    return this.toggleItem(this.filteredItems[0]);
  }

  toggleItem(item: Core.SelectableItem) {
    for (const selectableItem of this.filteredItems) {
      selectableItem.selected = selectableItem.label === item.label ? !item.selected : false;
    }
    for (const selectableItem of this.items) {
      selectableItem.selected = selectableItem.label === item.label ? item.selected : false;
    }

    const items = this.filteredItems.filter((s) => s.selected).map((s) => s.value);
    this.selectedItems = cloneDeep(this.filteredItems.filter((s) => s.selected));
    this.change.emit(items);
    if (this.singleItemMode) {
      this.isOpen = false;
      this.isOpenChange.emit(false);
    }
  }

  isSelected(item: Core.SelectableItem) {
    if (!this.singleItemMode) return false;
    return !item.selected && this.selectedItems.length === 1;
  }

  filter(query: string) {
    return this.items.filter((s) => {
      return s.label.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    });
  }

  close() {
    this.q = '';
    this.filteredItems = cloneDeep(this.items);
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }
}
