import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

export default class AffirmDataSource extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(``, context, options)
  }

  public getPaymentRequest = (
    qs: string,
    account: string = this.context.account,
    workspace: string = this.context.workspace
  ) => {
    const base = this.baseUrl(account, workspace)

    return this.http.get(`${base}/payments/${qs}/request`, {
      metric: 'payment-request',
    })
  }

  public baseUrl = (account: string, workspace: string) => {
    return `http://${workspace}--${account}.${process.env.VTEX_PUBLIC_ENDPOINT}/affirm/payment-provider`
  }
}
