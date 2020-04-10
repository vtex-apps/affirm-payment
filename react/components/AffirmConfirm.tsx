import React, { Component } from 'react'
import {
  compose,
  graphql,
  withApollo,
  WithApolloClient,
  MutationOptions,
  FetchResult,
} from 'react-apollo'
import queryString from 'query-string'
import { Spinner } from 'vtex.styleguide'
import orderDataSimple from './../graphql/OrderDataSimple.graphql'
import orderUpdate from './../graphql/OrderUpdate.graphql'

interface AffirmProps {
  client: WithApolloClient<any>
  orderUpdateMutation(options?: MutationOptions): Promise<FetchResult>
}

class AffirmConfirm extends Component<AffirmProps> {
  public componentDidMount() {
    const qs = queryString.parse(location.search)
    if (typeof qs.g === 'string' && typeof qs.checkout_token === 'string') {
      this.queryAndUpdateOrderData(qs.g, qs.checkout_token)
    } else {
      throw new Error('No query string provided.')
    }
  }

  public queryAndUpdateOrderData = async (g: string, token: string) => {
    const result = await this.props.client.query({
      query: orderDataSimple,
      variables: { qs: g },
      ssr: false,
    })
    if (result.data.orderData != null) {
      const returnUrl = result.data.orderData.returnUrl
      this.props
        .orderUpdateMutation({
          variables: {
            url: result.data.orderData.inboundRequestsUrl
              .replace('https', 'http')
              .replace(':action', 'auth'),
            orderId: result.data.orderData.orderId,
            token: token,
            callbackUrl: result.data.orderData.callbackUrl,
            orderTotal: result.data.orderData.value * 100,
          },
        })
        .then((response: FetchResult) => {
          if (response.data && response.data.orderUpdate) {
            window.location.replace(returnUrl)
          } else {
            throw new Error('Order update failed.')
          }
        })
    }
  }

  public render() {
    return (
      <div className="flex justify-center mv5" style={{ minHeight: 800 }}>
        <Spinner />
      </div>
    )
  }
}

export default compose(
  withApollo,
  graphql(orderUpdate, { name: 'orderUpdateMutation' })
)(AffirmConfirm)
