declare module "qrcode" {
  export interface QRCodeToDataURLOptions {
    version?: number
    errorCorrectionLevel?: "low" | "medium" | "quartile" | "high" | "L" | "M" | "Q" | "H"
    maskPattern?: number
    toSJISFunc?: Function
    margin?: number
    scale?: number
    width?: number
    color?: {
      dark?: string
      light?: string
    }
  }

  export function toDataURL(text: string | Buffer, options?: QRCodeToDataURLOptions): Promise<string>
  export function toDataURL(
    text: string | Buffer,
    options: QRCodeToDataURLOptions,
    callback: (error: Error | null | undefined, url: string) => void,
  ): void
  export function toDataURL(text: string | Buffer, callback: (error: Error | null | undefined, url: string) => void): void
  export function toString(text: string | Buffer, options?: any): Promise<string>
  export function toCanvas(canvas: any, text: string | Buffer, options?: any): Promise<any>
}
