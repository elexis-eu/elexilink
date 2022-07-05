import { Component } from '@angular/core';
import { DarkmodeService } from "src/app/core/services/darkmode.service";

@Component({
  selector: 'footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  constructor(private darkmodeService: DarkmodeService) {
  }

  isDarkModeOn() {
    return this.darkmodeService.isDarkModeOn;
  }

  toggleDarkMode() {
    this.darkmodeService.toggleDarkMode();
  }

}
