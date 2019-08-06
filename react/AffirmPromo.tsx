import React, { Component } from 'react'
import AffirmPromoSandbox from './components/AffirmPromoSandbox'
import AffirmPromoLive from './components/AffirmPromoLive'
import withSettings from './components/withSettings'

type AffirmProps = {
    settings: AffirmSettings
}

type AffirmSettings = {
    isLive: boolean
    companyName: string
}
class AffirmPromo extends Component<AffirmProps> {
    
    render() {
        if (this.props.settings.isLive) return (
            <AffirmPromoLive settings={this.props.settings}></AffirmPromoLive>
        ) 
        return (
            <AffirmPromoSandbox settings={this.props.settings}></AffirmPromoSandbox>
        )
    }
}

export default withSettings(AffirmPromo)