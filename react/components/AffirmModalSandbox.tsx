import React, { Component, Fragment } from 'react'
import Helmet from 'react-helmet'
import { compose, withApollo, WithApolloClient } from 'react-apollo'
import scriptLoader from 'react-async-script-loader'
import queryString from 'query-string'
import { Spinner } from 'vtex.styleguide'
import orderData from './../graphql/OrderData.graphql'

type AffirmProps = {
    client: WithApolloClient<any>
    settings: AffirmSettings
    isScriptLoaded: boolean
    isScriptLoadSucceed: boolean
}

type AffirmSettings = {
    isLive: boolean
    companyName: string
    siteHostSuffix: string
}

class AffirmModal extends Component<AffirmProps> {

    state = {
        hasOrderData: false,
        hasApiKey: false,
        scriptHasLoaded: false,
        api_key: "",
        transactionId: "",
        custFirstName: "",
        custLastName: "",
        phoneNumber: "",
        emailAddress: "",
        billingLine1: "",
        billingLine2: "",
        billingCity: "",
        billingState: "",
        billingZip: "",
        billingCountry: "",
        shippingLine1: "",
        shippingLine2: "",
        shippingCity: "",
        shippingState: "",
        shippingZip: "",
        shippingCountry: "",
        shippingType: "",
        items: [],
        shippingValue: 0,
        taxValue: 0,
        orderTotal: 0,
        returnUrl: ""
    }

    componentDidMount() {
        window.modalTriggered = false
        const qs = queryString.parse(location.search)
        if (typeof qs.k === "string") {
            this.setState({ api_key: qs.k, hasApiKey: true })
        }
        if (typeof qs.g === "string") {
            this.queryOrderData(qs.g)
        } else {
            throw new Error('No query string provided.')
        }
    }

    componentDidUpdate() {
        const qs = queryString.parse(location.search)
        const { isScriptLoaded, isScriptLoadSucceed, settings: { companyName }, settings: {siteHostSuffix} } = this.props
        
        if (this.state.hasOrderData && isScriptLoaded && isScriptLoadSucceed && !window.modalTriggered) {
            window.modalTriggered = true
            window._affirm_config = {
                public_api_key:  this.state.api_key
            }
            const items = this.state.items.map((item: any) => ({ 
                "display_name": item.display_name, 
                "sku": item.sku, 
                "unit_price": item.unit_price * 100,
                "qty": item.qty 
            }))

            let hostNameSuffix = siteHostSuffix != null && siteHostSuffix != "" ? siteHostSuffix : ""

            window.affirm.checkout({
                "merchant": {
                    "name": companyName != null && companyName != "" ? companyName : undefined,
                    "user_confirmation_url": "https://" + window.location.hostname + hostNameSuffix +"/affirm-confirm?g=" + qs.g ,
                    "user_cancel_url": this.state.returnUrl + "&status=denied",
                    "user_confirmation_url_action": "GET"
                },
                "shipping": {
                    "name": {
                        "first": this.state.custFirstName,
                        "last": this.state.custLastName
                    },
                    "address": {
                        "line1": this.state.shippingLine1,
                        "line2": this.state.shippingLine2,
                        "city": this.state.shippingCity,
                        "state": this.state.shippingState,
                        "zipcode": this.state.shippingZip,
                        "country": this.state.shippingCountry
                    },
                    "phone_number": this.state.phoneNumber,
                    "email": this.state.emailAddress
                },
                "billing": {
                    "name": {
                        "first": this.state.custFirstName,
                        "last": this.state.custLastName
                    },
                    "address": {
                        "line1": this.state.billingLine1,
                        "line2": this.state.billingLine2,
                        "city": this.state.billingCity,
                        "state": this.state.billingState,
                        "zipcode": this.state.billingZip,
                        "country": this.state.billingCountry
                    },
                    "phone_number": this.state.phoneNumber,
                    "email": this.state.emailAddress
                },
                "items": items,
                "metadata": {
                    "shipping_type": "",
                    "mode": "modal"
                },
                "order_id": this.state.transactionId,
                "shipping_amount": this.state.shippingValue * 100,
                "tax_amount": this.state.taxValue * 100,
                "total": this.state.orderTotal * 100
            });
            window.affirm.checkout.open();
            var self = this;
            window.affirm.ui.error.on("close", function(){
                window.location.replace(self.state.returnUrl + "&status=denied")
            });
        }
    }

    queryOrderData = async (g: string) => {
        const result = await this.props.client.query({
            query: orderData,
            variables: { qs: g },
            ssr: false
        })
        if (result.data.orderData != null) {
            
            const items = result.data.orderData.miniCart.items.map((item: any) => (
                {
                    "display_name": item.name,
                    "sku": item.id,
                    "unit_price": item.price,
                    "qty": item.quantity,
                    "item_image_url": "",
                    "item_url": ""
                }
            ))

            this.setState({
                transactionId: result.data.orderData.orderId,
                custFirstName: result.data.orderData.miniCart.buyer.firstName,
                custLastName: result.data.orderData.miniCart.buyer.lastName,
                phoneNumber: result.data.orderData.miniCart.buyer.phone,
                emailAddress: result.data.orderData.miniCart.buyer.email,
                billingLine1: result.data.orderData.miniCart.billingAddress.street,
                billingLine2: result.data.orderData.miniCart.billingAddress.complement,
                billingCity: result.data.orderData.miniCart.billingAddress.city,
                billingState: result.data.orderData.miniCart.billingAddress.state,
                billingZip: result.data.orderData.miniCart.billingAddress.postalCode,
                billingCountry: result.data.orderData.miniCart.billingAddress.country,
                shippingLine1: result.data.orderData.miniCart.shippingAddress.street,
                shippingLine2: result.data.orderData.miniCart.shippingAddress.complement,
                shippingCity: result.data.orderData.miniCart.shippingAddress.city,
                shippingState: result.data.orderData.miniCart.shippingAddress.state,
                shippingZip: result.data.orderData.miniCart.shippingAddress.postalCode,
                shippingCountry: result.data.orderData.miniCart.shippingAddress.country,
                shippingValue: result.data.orderData.miniCart.shippingValue,
                taxValue: result.data.orderData.miniCart.taxValue,
                orderTotal: result.data.orderData.value,
                items: items,
                returnUrl: result.data.orderData.returnUrl,
                hasOrderData: true
            })
        } else {
            throw new Error('No order data found.')
        }
    }

    render() {
        const { isScriptLoaded, isScriptLoadSucceed } = this.props
        if (!this.state.hasOrderData || !this.state.hasApiKey || !isScriptLoaded  || !isScriptLoadSucceed) return (<div className="flex justify-center mv5" style={{minHeight: 800}}><Spinner /></div>)

        return (
            <Fragment>
                <Helmet>
                    <title>Affirm Checkout</title>
                    <script>
                    {`
                        _affirm_config = {
                        public_api_key:  "${ this.state.api_key }"
                        };
                    `}
                    </script>
                </Helmet>
                <div className="flex justify-center mv5" style={{minHeight: 800}}><Spinner /></div>
            </Fragment>
        )
    }
}

export default compose(
    withApollo,
    scriptLoader(
        'https://cdn1-sandbox.affirm.com/js/v2/affirm.js'
    )
)(AffirmModal)