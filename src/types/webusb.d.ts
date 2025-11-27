// Minimal WebUSB Type Definitions for TypeScript

interface USBEndpoint {
  endpointNumber: number;
  direction: 'in' | 'out';
  type: 'bulk' | 'interrupt' | 'isochronous';
}

interface USBAlternateInterface {
  interfaceNumber: number;
  alternateSetting: number;
  endpoints: USBEndpoint[];
}

interface USBInterface {
  interfaceNumber: number;
  alternates: USBAlternateInterface[];
}

interface USBConfiguration {
  configurationValue: number;
  interfaces: USBInterface[];
}

interface USBDevice {
  opened: boolean;
  vendorId: number;
  productId: number;
  productName?: string;
  serialNumber?: string;
  manufacturerName?: string;

  // Ajout de la propriété manquante
  configuration: USBConfiguration | null;

  open(): Promise<void>;
  close(): Promise<void>;

  selectConfiguration(configurationValue: number): Promise<void>;
  claimInterface(interfaceNumber: number): Promise<void>;
  releaseInterface(interfaceNumber: number): Promise<void>;

  transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>;
  transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult>;

  controlTransferIn(setup: USBControlTransferParameters, length: number): Promise<USBInTransferResult>;
  controlTransferOut(setup: USBControlTransferParameters, data?: BufferSource): Promise<USBOutTransferResult>;
}

interface USB {
  getDevices(): Promise<USBDevice[]>;
  requestDevice(options: { filters: USBDeviceFilter[] }): Promise<USBDevice>;
}

interface USBDeviceFilter {
  vendorId?: number;
  productId?: number;
}

interface USBControlTransferParameters {
  requestType: 'standard' | 'class' | 'vendor' | 'reserved';
  recipient: 'device' | 'interface' | 'endpoint' | 'other';
  request: number;
  value: number;
  index: number;
}

interface USBInTransferResult {
  status: 'ok' | 'stall' | 'babble';
  data?: DataView;
}

interface USBOutTransferResult {
  status: 'ok' | 'stall' | 'babble';
  bytesWritten: number;
}

interface Navigator {
  usb?: USB;
}
