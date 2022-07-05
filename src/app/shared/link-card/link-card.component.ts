import {Component, Input, OnInit} from '@angular/core';
import {faLink, faEllipsis} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'link-card',
  templateUrl: './link-card.component.html',
  styleUrls: ['./link-card.component.scss']
})
export class LinkCardComponent implements OnInit {

  @Input('link') link!: any;

  faLink = faLink;
  faEllipsis = faEllipsis;

  expanded = false;

  constructor() {
  }

  ngOnInit(): void {
  }

  getSimilarityColor(): string {
    switch (this.link.similarity) {
      case 'exact':
        return 'bg-similarity-exact';
      case 'broader':
        return 'bg-similarity-broader';
      case 'narrower':
        return 'bg-similarity-narrower';
      default:
        return 'bg-similarity-exact';
    }
  }
}
