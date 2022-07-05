import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DarkmodeService {

  isDarkModeOn: boolean = localStorage.getItem('theme') === 'dark'

  constructor() {
    if (this.isDarkModeOn) {
      document.documentElement.classList.add('dark')
    }
  }

  toggleDarkMode() {
    this.isDarkModeOn = !this.isDarkModeOn
    localStorage.setItem('theme', this.isDarkModeOn ? "dark" : "light")
    document.documentElement.classList.toggle('dark')
  }
}
