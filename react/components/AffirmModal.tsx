/* eslint-disable @typescript-eslint/camelcase */
import React, { Component } from 'react'
import Helmet from 'react-helmet'
import { graphql, MutationOptions, FetchResult } from 'react-apollo'

import withSettings from './withSettings'
import withOrderData from './withOrderData'
import OrderUpdate from '../graphql/OrderUpdate.graphql'

interface AffirmAuthenticationProps {
  appPayload: string
  settings: AffirmSettings
  orderData: OrderData
  orderUpdateMutation(options?: MutationOptions): Promise<FetchResult>
}

interface AffirmSettings {
  enableKatapult: boolean
  companyName: string
}

interface OrderData {
  transactionId: string
  orderId: string
  miniCart: any
  value: number
  inboundRequestsUrl: string
  callbackUrl: string
}

declare const vtex: any
declare const $: any

const version = process.env.VTEX_APP_VERSION

class AffirmModal extends Component<AffirmAuthenticationProps> {
  public state = {
    scriptLoaded: false,
  }

  public componentWillMount = () => {
    this.inject()
    window.modalTriggered = false
  }

  public async inject() {
    const { sandboxMode } = JSON.parse(this.props.appPayload)

    const affirmUrl = !sandboxMode
      ? `https://cdn1.affirm.com/js/v2/affirm`
      : `https://cdn1-sandbox.affirm.com/js/v2/affirm`

    this.injectScript(
      'affirm-checkout-sdk-js',
      `${affirmUrl}.js`,
      this.handleOnLoad
    )
  }

  public affirm: any = {}

  public async respondTransaction(status: boolean) {
    if (!status) {
      await fetch(
        `${this.props.orderData.callbackUrl}?tid=${this.props.orderData.transactionId}&message=Modal failed or was closed by user&status=denied`,
        {
          method: 'post',
          mode: 'no-cors',
        }
      )
    }
    $(window).trigger('transactionValidation.vtex', [status])
  }

  public injectScript = (id: string, src: string, onLoad: () => void) => {
    if (document.getElementById(id)) {
      return
    }

    // eslint-disable-next-line prefer-destructuring
    const head = document.getElementsByTagName('head')[0]

    const js = document.createElement('script')
    js.id = id
    js.src = src
    js.async = true
    js.defer = true
    js.onload = onLoad

    head.appendChild(js)
  }

  public handleOnLoad = () => {
    this.setState({ scriptLoaded: true })
  }

  public componentDidUpdate() {
    const {
      orderData,
      orderData: { miniCart },
      settings: { companyName, enableKatapult },
      orderUpdateMutation,
    } = this.props
    const { scriptLoaded } = this.state

    const { publicKey } = JSON.parse(this.props.appPayload)
    if (!scriptLoaded || window.modalTriggered) return
    window.modalTriggered = true
    $(window).on('beforeunload', () => {
      return ''
    })
    window._affirm_config = {
      public_api_key: publicKey,
    }
    const affirmItems = orderData.miniCart.items.map((item: any) => ({
      leasable: true,
      display_name: item.name,
      sku: item.id,
      unit_price: Math.round(item.price * 100),
      qty: item.quantity,
    }))
    let discountTotal = 0
    orderData.miniCart.items.forEach((item: any) => {
      discountTotal += item.discount * -1
    })
    const discountsObject =
      discountTotal > 0
        ? {
            DISCOUNT: {
              discount_amount: Math.round(discountTotal * 100),
              discount_display_name: 'Discount',
            },
          }
        : {}
    window.affirm.checkout({
      merchant: {
        exchange_lease_enabled: enableKatapult,
        name: companyName || undefined,
        user_confirmation_url: '',
        user_cancel_url: '',
        user_confirmation_url_action: 'GET',
      },
      shipping: {
        name: {
          first: miniCart.buyer.firstName,
          last: miniCart.buyer.lastName,
        },
        address: {
          line1: miniCart.shippingAddress.street,
          line2: miniCart.shippingAddress.complement,
          city: miniCart.shippingAddress.city,
          state: miniCart.shippingAddress.state,
          zipcode: miniCart.shippingAddress.postalCode,
          country: miniCart.shippingAddress.country,
        },
        phone_number: miniCart.buyer.phone,
        email: miniCart.buyer.email,
      },
      billing: {
        name: {
          first: miniCart.buyer.firstName,
          last: miniCart.buyer.lastName,
        },
        address: {
          line1: miniCart.billingAddress.street,
          line2: miniCart.billingAddress.complement,
          city: miniCart.billingAddress.city,
          state: miniCart.billingAddress.state,
          zipcode: miniCart.billingAddress.postalCode,
          country: miniCart.billingAddress.country,
        },
        phone_number: miniCart.buyer.phone,
        email: miniCart.buyer.email,
      },
      items: affirmItems,
      metadata: {
        shipping_type: '',
        mode: 'modal',
        platform_type: 'VTEX',
        platform_version: version,
        platform_affirm: 'Affirm_2.0',
      },
      order_id: orderData.orderId,
      discounts: discountsObject,
      shipping_amount: Math.round(miniCart.shippingValue * 100),
      tax_amount: Math.round(miniCart.taxValue * 100),
      total: Math.round(orderData.value * 100),
    })
    vtex.checkout.MessageUtils.hidePaymentMessage()
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    window.affirm.checkout.open({
      // eslint-disable-next-line prettier/prettier
      async onFail() {
        vtex.checkout.MessageUtils.showPaymentMessage()
        $(window).off('beforeunload')
        await self.respondTransaction(false)
      },
      // eslint-disable-next-line prettier/prettier
      async onSuccess(a: any) {
        vtex.checkout.MessageUtils.showPaymentMessage()
        orderUpdateMutation({
          variables: {
            url: orderData.inboundRequestsUrl
              .replace('https', 'http')
              .replace(':action', 'auth'),
            orderId: orderData.orderId,
            token: a.checkout_token,
            callbackUrl: orderData.callbackUrl,
            orderTotal: Math.round(orderData.value * 100),
          },
        })
          .then(response => {
            $(window).off('beforeunload')
            if (response.data?.orderUpdate) {
              self.respondTransaction(true)
            } else {
              self.respondTransaction(false)
            }
          })
          .catch(() => {
            $(window).trigger('transactionValidation.vtex', [false])
          })
      },
    })

    window.affirm.ui.error.on('close', async () => {
      vtex.checkout.MessageUtils.showPaymentMessage()
      $(window).off('beforeunload')
      await self.respondTransaction(false)
    })
  }

  public render() {
    const { scriptLoaded } = this.state
    const { publicKey } = JSON.parse(this.props.appPayload)

    return (
      scriptLoaded &&
      publicKey && (
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
    )
  }
}

export default graphql(OrderUpdate, { name: 'orderUpdateMutation' })(
  withSettings(withOrderData(AffirmModal))
)
