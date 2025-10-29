import { StatusEnum } from '@/modeles/model';
import { HttpErrorResponse } from '@angular/common/http';



export enum ExecMode {
  prod = 'prod',
  mock = 'mock',
}
/**
 * Global status handler
 */
export class GlobalConfig {
  private static errorMsg = 'Erreur de connection. Veuillez Contacter l\'administrateur';
  static setStatus(status: StatusEnum, localMessage?: string, error?: HttpErrorResponse| undefined) {
    // This method no longer dispatches store actions. It returns a plain status object
    // containing the status enum and a human readable message.
    console.log(error);

    const errorStatus = error?.status;
    const errorData = error?.error;
    if (localMessage) {
      return this.buildStatus(status, localMessage);
    } else {
      switch (errorStatus) {
        case 200:
          return this.buildStatus(StatusEnum.success, 'Opération reussie !');
        case 404: {
          if (!errorData) {
            return this.buildStatus(status, this.errorMsg);
          } else if (errorData.message) {
            return this.buildStatus(status, errorData.message);
          } else if (errorData instanceof ArrayBuffer) {
            const msg = this.returnMsgFromArrayBuffer(errorData);
            return this.buildStatus(status, msg);
          } else {
            return this.buildStatus(status, this.errorMsg);
          }
        }
        case 500:
          return this.buildStatus(status, this.errorMsg);
        default: {
          if (!errorData) {
            return this.buildStatus(status, this.errorMsg);
          } else if (errorData.message) {
            return this.buildStatus(status, errorData.message);
          } else if (errorData instanceof ArrayBuffer) {
            const msg = this.returnMsgFromArrayBuffer(errorData);
            return this.buildStatus(status, msg);
          } else {
            return this.buildStatus(status, this.errorMsg);
          }
        }
      }
    }
  }

  private static buildStatus(status: StatusEnum, message: string) {
    // Return a plain object instead of dispatching a store action
    return { status: { status, message } };
  }

  static getEndpoint(urlObj: any, execMode = ExecMode.prod): string {
    return urlObj[execMode];
  }

  static returnMsgFromArrayBuffer(buf: ArrayBuffer): string {
    let response;
    if ('TextDecoder' in window) {
      // Decode as UTF-8
      const dataView = new DataView(buf);
      const decoder = new TextDecoder('utf8');
      response = JSON.parse(decoder.decode(dataView));
    } else {
      // Fallback decode as ASCII
      const decodedString = String.fromCharCode.apply(null,  Array.from(new Uint8Array(buf)));
      response = JSON.parse(decodedString);
    }
    return response.message;
  }


}

