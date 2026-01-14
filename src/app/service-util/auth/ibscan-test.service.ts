import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IbscanTestService {

  private sdkLoaded = false;

  private loadSdk(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).IBSU) {
        this.sdkLoaded = true;
        return resolve();
      }

      const script = document.createElement('script');
      script.src = 'http://localhost:5020/ibsu/ibsu.min.js';
      script.async = true;

      script.onload = () => {
        this.sdkLoaded = true;
        resolve();
      };

      script.onerror = () => reject('IBScan SDK not loaded');

      document.body.appendChild(script);
    });
  }

  async init(): Promise<void> {
    await this.loadSdk();
    (window as any).IBSU.Init();
  }

  getDeviceCount(): number {
    return (window as any).IBSU.GetDeviceCount();
  }

  openDevice(index = 0): void {
    (window as any).IBSU.OpenDevice(index);
  }

  takeImage(): void {
    (window as any).IBSU.TakeImage();
  }
}
