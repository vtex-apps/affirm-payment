export const queries = {
  affirmSettings: async (_: void, __: void, ctx: Context) => {
    const appId = process.env.VTEX_APP_ID as string
    const settings = await ctx.clients.apps.getAppSettings(appId)
    return settings
  },
  orderData: async (_: void, { qs }: { qs: string }, ctx: Context) => {
    const {
      clients: { licenseManager, payments },
      vtex: { account, authToken, logger },
    } = ctx

    // if this is a subaccount, accountName will be the name of the main account
    const { accountName } = await licenseManager
      .getAccountData(authToken)
      .catch(error => {
        logger.error({
          message: 'getAccountData-error',
          error,
        })
        return {}
      })

    return payments.getPaymentRequest(
      qs,
      accountName,
      accountName === account ? undefined : 'master' // if this is a subaccount, send request to master workspace of main account
    )
  },
}

export const mutations = {
  orderUpdate: async (
    _: void,
    {
      inboundUrl,
      orderId,
      token,
      callbackUrl,
      orderTotal,
    }: PaymentRequestPayload,
    ctx: Context
  ) => {
    const {
      clients: { paymentsProxy },
    } = ctx

    return paymentsProxy.updatePaymentRequest({
      inboundUrl,
      orderId,
      token,
      callbackUrl,
      orderTotal,
    })
  },
}
