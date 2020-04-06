import React, { PureComponent } from 'react'
import { graphql } from 'react-apollo'
import Settings from '../graphql/Settings.graphql'

interface WithSettingsProps {
  data?: any
}

export default function withSettings(Component: any): any {
  class WithSettings extends PureComponent<WithSettingsProps> {
    public render() {
      const {
        data: { affirmSettings },
        ...rest
      } = this.props
      if (!affirmSettings) return null

      return <Component settings={affirmSettings} {...rest} />
    }
  }

  return graphql(Settings, { options: { ssr: false } })(WithSettings)
}
