import {Component, Input} from '@angular/core';
import {faLink, faEllipsis} from '@fortawesome/free-solid-svg-icons';
import { DataService } from "src/app/core/services/data.service";

@Component({
  selector: 'link-card',
  templateUrl: './link-card.component.html',
  styleUrls: ['./link-card.component.scss']
})
export class LinkCardComponent {

  @Input('link') link!: any;

  faLink = faLink;
  faEllipsis = faEllipsis;

  expanded = false;

  constructor(
    public data: DataService,
  ) {}

  get headword(): string {
    return this.data.headword;
  }

  prettifyDescription(description: string): string {
    if (description === "%(def)") {
      return "No definition";
    }
    return description;
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
