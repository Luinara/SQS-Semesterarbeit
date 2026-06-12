import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BrowserStorageService {
  read<T>(key: string, fallbackValue: T): T {
    if (!this.hasStorage()) {
      return fallbackValue;
    }

    const rawValue = globalThis.localStorage.getItem(key);

    if (!rawValue) {
      return fallbackValue;
    }

    try {
      return JSON.parse(rawValue) as T;
    } catch {
      return fallbackValue;
    }
  }

  write<T>(key: string, value: T): void {
    if (!this.hasStorage()) {
      return;
    }

    globalThis.localStorage.setItem(key, JSON.stringify(value));
  }

  private hasStorage(): boolean {
    return typeof globalThis !== 'undefined' && 'localStorage' in globalThis;
  }
}
