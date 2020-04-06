/* eslint-disable @typescript-eslint/camelcase */
import React, { Component } from 'react'
import Helmet from 'react-helmet'
import { graphql, MutationOptions, FetchResult } from 'react-apollo'
import withSettings from './withSettings'
import withOrderData from './withOrderData'
import OrderUpdate from './../graphql/OrderUpdate.graphql'

interface AffirmAuthenticationProps {
  appPayload: string
  settings: AffirmSettings
  orderData: OrderData
  orderUpdateMutation(options?: MutationOptions): Promise<FetchResult>
}

interface AffirmSettings {
  isLive: boolean
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

class AffirmModal extends Component<AffirmAuthenticationProps> {
  public state = {
    scriptLoaded: false,
  }

  // eslint-disable-next-line react/no-deprecated
  public componentWillMount = () => {
    this.inject()
    window.modalTriggered = false
  }

  public async inject() {
    const {
      settings: { isLive },
    } = this.props

    if (isLive == null) {
      console.error('No Affirm settings found')
      await this.respondTransaction(false)
    }

    const affirmUrl = isLive
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
    if (scriptLoaded && !window.modalTriggered) {
      window.modalTriggered = true
      window._affirm_config = {
        public_api_key: publicKey,
      }
      const affirmItems = orderData.miniCart.items.map((item: any) => ({
        leasable: true,
        display_name: item.name,
        sku: item.id,
        unit_price: item.price * 100,
        qty: item.quantity,
      }))
      window.affirm.checkout({
        merchant: {
          exchange_lease_enabled: enableKatapult,
          name:
            companyName != null && companyName != '' ? companyName : undefined,
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
        },
        order_id: orderData.orderId,
        shipping_amount: miniCart.shippingValue * 100,
        tax_amount: miniCart.taxValue * 100,
        total: orderData.value * 100,
      })
      vtex.checkout.MessageUtils.hidePaymentMessage()
      var self = this
      window.affirm.checkout.open({
        // eslint-disable-next-line prettier/prettier
        onFail: async function () {
          vtex.checkout.MessageUtils.showPaymentMessage()
          await self.respondTransaction(false)
        },
        // eslint-disable-next-line prettier/prettier
        onSuccess: async function (a: any) {
          vtex.checkout.MessageUtils.showPaymentMessage()
          const response = await orderUpdateMutation({
            variables: {
              url: orderData.inboundRequestsUrl
                .replace('https', 'http')
                .replace(':action', 'auth'),
              orderId: orderData.orderId,
              token: a.checkout_token,
              callbackUrl: orderData.callbackUrl,
              orderTotal: orderData.value * 100,
            },
          })
          if (response.data && response.data.orderUpdate) {
            await self.respondTransaction(true)
          } else {
            await self.respondTransaction(false)
          }
        },
      })

      window.affirm.ui.error.on('close', async function () {
        vtex.checkout.MessageUtils.showPaymentMessage()
        await self.respondTransaction(false)
      })
    }
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
