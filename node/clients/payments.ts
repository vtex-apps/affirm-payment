import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

export default class AffirmDataSource extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(
      `http://${context.workspace}--${context.account}.${process.env.VTEX_PUBLIC_ENDPOINT}/affirm/payment-provider/`,
      context,
      options
    )
  }

  public getPaymentRequest = (qs: string) =>
    this.http.get(`payments/${qs}/request`, { metric: 'payment-request' })
}
