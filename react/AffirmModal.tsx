import React, { Component } from 'react'
import AffirmModalSandbox from './components/AffirmModalSandbox'
import AffirmModalLive from './components/AffirmModalLive'
import withSettings from './components/withSettings'

type AffirmProps = {
    settings: AffirmSettings
}

type AffirmSettings = {
    isLive: boolean
    companyName: string
}
class AffirmModal extends Component<AffirmProps> {
    
    render() {
        if (this.props.settings.isLive) return (
            <AffirmModalLive settings={this.props.settings}></AffirmModalLive>
        ) 
        return (
            <AffirmModalSandbox settings={this.props.settings}></AffirmModalSandbox>
        )
    }
}

export default withSettings(AffirmModal)