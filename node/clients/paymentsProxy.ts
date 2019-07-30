import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

export default class AffirmProxyDataSource extends ExternalClient {
    constructor(context: IOContext, options?: InstanceOptions) {
        super(``, context, options)
    }

    public updatePaymentRequest = (inboundUrl: string, token: string, callbackUrl: string, orderTotal: number) =>
    this.http.post(inboundUrl, { token: token, callbackUrl: callbackUrl, orderTotal: orderTotal }, { metric: 'payment-update' })

}