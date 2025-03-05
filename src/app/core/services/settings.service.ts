import { Injectable, signal } from '@angular/core';
import { UserSettings } from '../../models/interface/user.settings';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly STORAGE_KEY = 'manga-world-settings';

  private settings: UserSettings = {
    dataSaver: false,
    nsfw: false,
    theme: 'light'
  }

  private settingsSubject = new BehaviorSubject<UserSettings> (
    this.loadSettigns()
  );

  settings$ = this.settingsSubject.asObservable();

  private nsfwChange = new Subject<boolean>();
  public nsfwChange$ = this.nsfwChange.asObservable();

  constructor() { 
    if(!localStorage.getItem(this.STORAGE_KEY)) 
      this.saveSettings(this.settings);
  }

  private loadSettigns(): UserSettings {
    const storedSettings = localStorage.getItem(this.STORAGE_KEY);
    return storedSettings ? JSON.parse(storedSettings) : this.settings;
  }

  private saveSettings(settings: UserSettings): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    this.settingsSubject.next(settings);
  }

  getSettings(): UserSettings {
    return this.settingsSubject.value;
  }

  updateSettings(settings: Partial<UserSettings>) {
    const currentSettings = this.settingsSubject.value;
    const newSettings = {...currentSettings, ...settings};
    this.saveSettings(newSettings);
  }
}
