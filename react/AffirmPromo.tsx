import React, { Component } from 'react'
import AffirmPromoSandbox from './components/AffirmPromoSandbox'
import AffirmPromoLive from './components/AffirmPromoLive'
import withSettings from './components/withSettings'

interface AffirmProps {
  settings: AffirmSettings
}

interface AffirmSettings {
  isLive: boolean
  companyName: string
}
class AffirmPromo extends Component<AffirmProps> {
  public render() {
    if (this.props.settings.isLive)
      return <AffirmPromoLive settings={this.props.settings}></AffirmPromoLive>
    return (
      <AffirmPromoSandbox settings={this.props.settings}></AffirmPromoSandbox>
    )
  }
}

export default withSettings(AffirmPromo)
