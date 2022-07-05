import { Component } from '@angular/core';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { DarkmodeService } from "src/app/core/services/darkmode.service";

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  faMoon = faMoon;
  faSun = faSun;

  constructor(private darkmodeService: DarkmodeService) {
  }

  isDarkModeOn() {
    return this.darkmodeService.isDarkModeOn;
  }

  toggleDarkMode() {
    this.darkmodeService.toggleDarkMode();
  }

}
