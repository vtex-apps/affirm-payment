import React, { PureComponent } from 'react'
import { graphql } from 'react-apollo'

import OrderData from '../graphql/OrderData.graphql'

interface WithOrderDataProps {
  data?: any
  appPayload: string
}

export default function withOrderData(Component: any): any {
  class WithOrderData extends PureComponent<WithOrderDataProps> {
    public render() {
      const {
        data: { orderData },
        ...rest
      } = this.props
      if (!orderData) return null

      return <Component orderData={orderData} {...rest} />
    }
  }

  return graphql(OrderData, {
    options: (props: WithOrderDataProps) => ({
      variables: {
        qs: JSON.parse(props.appPayload).paymentIdentifier,
      },
      ssr: false,
    }),
  })(WithOrderData)
}
