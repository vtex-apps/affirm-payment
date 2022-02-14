interface AffirmSettings {
  isLive: boolean
  companyName: string
  publicApiKey: string
}

interface PaymentRequestPayload {
  inboundUrl: string
  orderId: string
  token: string
  callbackUrl: string
  orderTotal: number
}
