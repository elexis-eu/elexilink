import { Component, Input } from '@angular/core';

@Component({
  selector: 'footer-nav',
  templateUrl: './footer-nav.component.html',
  styleUrls: ['./footer-nav.component.scss']
})
export class FooterNavComponent {

  @Input('color') color!: string;

  items = [
    {
      label: 'About us',
      url: '#'
    },
    {
      label: 'Support',
      url: '#',
    }
  ]

}
