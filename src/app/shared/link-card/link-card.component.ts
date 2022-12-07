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
      case 'EXACT':
        return 'bg-similarity-exact';
      case 'BROADER':
        return 'bg-similarity-broader';
      case 'RELATED':
        return 'bg-similarity-broader';
      case 'NARROWER':
        return 'bg-similarity-narrower';
      case 'UNRELATED':
        return 'bg-similarity-unrelated';
      default:
        return 'bg-similarity-exact';
    }
  }
}
