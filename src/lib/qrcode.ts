import QRCode from 'qrcode'

export async function generateQrCode(data: string): Promise<string> {
  const url = await QRCode.toDataURL(data, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 300,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  })
  return url
}
