import {Component, Input} from '@angular/core';
import _ from "lodash";

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

  generateLink(): string {
    if (this.items.concept?.id && _.startsWith(this.items.concept?.id + "", "bn:")) {
      return `https://babelnet.org/synset?id=${this.items.concept.id}&lang=${this.items.concept.lang || "EN"}`
    }
    return this.items.concept?.collection?.link || "#";
  }
}
