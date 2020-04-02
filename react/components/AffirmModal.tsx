/* eslint-disable @typescript-eslint/camelcase */
import React, { useEffect } from 'react'
import Helmet from 'react-helmet'
import { useQuery, useMutation, MutationFetchResult } from 'react-apollo'
import useScriptLoader from './hooks/useScriptLoader'
import { useRuntime, canUseDOM } from 'vtex.render-runtime'
import Settings from '../graphql/Settings.graphql'
import OrderData from '../graphql/OrderData.graphql'
import OrderUpdate from './../graphql/OrderUpdate.graphql'

interface AffirmAuthorizationProps {
  appPayload: string
}

declare const vtex: any
declare const $: any

const AffirmModal: StorefrontFunctionComponent<AffirmAuthorizationProps> = ({
  appPayload,
}) => {
  const { rootPath } = useRuntime()
  const { data: settingsData } = useQuery(Settings, { ssr: false })
  const { paymentIdentifier, publicKey } = JSON.parse(appPayload)
  const { data: orderQueryResult } = useQuery(OrderData, {
    skip: !paymentIdentifier,
    variables: {
      qs: paymentIdentifier,
    },
    ssr: false,
  })
  const siteRoot = rootPath || ''
  const [updateOrder] = useMutation(OrderUpdate)

  const [affirm, { error }] = useScriptLoader(
    settingsData?.affirmSettings?.isLive
      ? 'https://cdn1.affirm.com/js/v2/affirm.js'
      : 'https://cdn1-sandbox.affirm.com/js/v2/affirm.js',
    'affirm'
  )

  const respondTransaction = (status: boolean) => {
    $(window).trigger('transactionValidation.vtex', [status])
  }

  useEffect(() => {
    window.modalTriggered = false
  }, [])

  useEffect(() => {
    if (
      orderQueryResult?.orderData &&
      settingsData?.affirmSettings &&
      affirm &&
      !error &&
      !window.modalTriggered &&
      publicKey
    ) {
      const { orderData } = orderQueryResult
      window.modalTriggered = true
      window._affirm_config = {
        public_api_key: publicKey,
      }
      const items = orderQueryResult.orderData.miniCart.items.map(
        (item: any) => ({
          display_name: item.name,
          sku: item.id,
          unit_price: item.price * 100,
          qty: item.quantity,
          leasable: true,
        })
      )

      vtex.checkout.MessageUtils.hidePaymentMessage()

      affirm.checkout({
        merchant: {
          exchange_lease_enabled:
            settingsData?.affirmSettings?.enableKatapult ?? false,
          name: settingsData?.affirmSettings?.companyName ?? '',
          user_confirmation_url: '',
          user_cancel_url: '',
          user_confirmation_url_action: 'GET',
        },
        shipping: {
          name: {
            first: orderData.miniCart.buyer.firstName,
            last: orderData.miniCart.buyer.lastName,
          },
          address: {
            line1: orderData.miniCart.shippingAddress.street,
            line2: orderData.miniCart.billingAddress.complement,
            city: orderData.miniCart.shippingAddress.city,
            state: orderData.miniCart.shippingAddress.state,
            zipcode: orderData.miniCart.shippingAddress.postalCode,
            country: orderData.miniCart.shippingAddress.country,
          },
          phone_number: orderData.miniCart.buyer.phone,
          email: orderData.miniCart.buyer.email,
        },
        billing: {
          name: {
            first: orderData.miniCart.buyer.firstName,
            last: orderData.miniCart.buyer.lastName,
          },
          address: {
            line1: orderData.miniCart.billingAddress.street,
            line2: orderData.miniCart.billingAddress.complement,
            city: orderData.miniCart.billingAddress.city,
            state: orderData.miniCart.billingAddress.state,
            zipcode: orderData.miniCart.billingAddress.postalCode,
            country: orderData.miniCart.billingAddress.country,
          },
          phone_number: orderData.miniCart.buyer.phone,
          email: orderData.miniCart.buyer.email,
        },
        items: items,
        metadata: {
          shipping_type: '',
          mode: 'modal',
        },
        order_id: orderData.orderId,
        shipping_amount: orderData.miniCart.shippingValue * 100,
        tax_amount: orderData.miniCart.taxValue * 100,
        total: orderData.value * 100,
      })
      affirm.checkout.open({
        // eslint-disable-next-line prettier/prettier
        onFail: function () {
          vtex.checkout.MessageUtils.showPaymentMessage()
          respondTransaction(false)
        },
        // eslint-disable-next-line prettier/prettier
        onSuccess: function (a: any) {
          vtex.checkout.MessageUtils.showPaymentMessage()
          updateOrder({
            variables: {
              url: orderData.orderData.inboundRequestsUrl
                .replace('https', 'http')
                .replace(':action', 'auth'),
              orderId: orderData.orderId,
              token: a.checkout_token,
              callbackUrl: orderData.callbackUrl,
              orderTotal: orderData.value * 100,
            },
          }).then((response: MutationFetchResult) => {
            if (response.data && response.data.orderUpdate) {
              respondTransaction(true)
            } else {
              respondTransaction(false)
            }
          })
        },
      })
      // eslint-disable-next-line prettier/prettier
      affirm.ui.error.on('close', function () {
        vtex.checkout.MessageUtils.showPaymentMessage()
        respondTransaction(false)
      })
    }
  }, [
    affirm,
    error,
    orderQueryResult,
    publicKey,
    settingsData.affirmSettings,
    siteRoot,
    updateOrder,
  ])

  if (
    !canUseDOM ||
    !settingsData?.affirmSettings ||
    !orderQueryResult?.orderData ||
    !publicKey ||
    !affirm
  )
    return null

  if (error) {
    respondTransaction(false)
    return null
  }

  return (
    <Helmet>
      <script>
        {`
            _affirm_config = {
            public_api_key:  "${publicKey}"
            };
        `}
      </script>
    </Helmet>
  )
}

export default AffirmModal
