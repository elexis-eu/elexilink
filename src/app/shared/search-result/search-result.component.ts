import {Component, Input} from '@angular/core';

@Component({
  selector: 'search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss']
})
export class SearchResultComponent {

  @Input('items') items!: Link.Result;
  @Input('parent') parent!: Link.Result;
  @Input('conceptView') conceptView = false

  counter = 3

  showMore() {
    this.counter = Math.min(this.counter + 3, this.items.target.length)
  }
}
