import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

export default class AffirmProxyDataSource extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(``, context, options)
  }

  public updatePaymentRequest = ({
    inboundUrl,
    orderId,
    token,
    callbackUrl,
    orderTotal,
  }: PaymentRequestPayload) =>
    this.http.post(
      inboundUrl,
      {
        token,
        orderId,
        callbackUrl,
        orderTotal,
      },
      { metric: 'payment-update' }
    )
}
