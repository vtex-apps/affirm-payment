export const queries = {
    affirmSettings: async (_: any, __:any, ctx: Context) => {
        const appId = process.env.VTEX_APP_ID as string
        const settings = await ctx.clients.apps.getAppSettings(appId)
        return settings
    },
    orderData: async (_: any, { qs }: { qs: string }, ctx: Context) => {
        const {
            clients: { payments },
        } = ctx

        return payments.getPaymentRequest(qs)
    }
}

export const mutations = {
    orderUpdate: async (_: any, { inboundUrl, token, callbackUrl, orderTotal }: { inboundUrl: string, token: string, callbackUrl: string, orderTotal: number }, ctx: Context) => {
        const {
            clients: { paymentsProxy },
        } = ctx

        return paymentsProxy.updatePaymentRequest(inboundUrl, token, callbackUrl, orderTotal )
    }
}