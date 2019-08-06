import React, { PureComponent } from 'react'
import { graphql } from 'react-apollo'
import Settings from '../graphql/Settings.graphql'
import { Spinner } from 'vtex.styleguide'

type WithSettingsProps = {
    data?: any
}

export default function withSettings(Component: any): any {
    class WithSettings extends PureComponent<WithSettingsProps> {
        render() {
            const { data: { loading, error, affirmSettings }, ...rest } = this.props
            if (loading) {
                return <div className="mv5 flex justify-center" style={{minHeight: 800}}><Spinner /></div>;
            } else if (error) {
                return <div className="ph5" style={{minHeight: 800}}>Error! {error.message}</div>;
            } else if (affirmSettings != null) {
                return <Component settings={affirmSettings} {...rest} />
            } else {
                return null
            }
            
        }
    }

    return graphql(Settings, { options: { ssr: false }})(WithSettings)
}