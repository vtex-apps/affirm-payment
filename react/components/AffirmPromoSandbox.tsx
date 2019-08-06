import React, { Fragment, useEffect } from 'react'
import { compose } from 'react-apollo'
import scriptLoader from 'react-async-script-loader'
import useProduct from 'vtex.product-context/useProduct'

type AffirmProps = {
    settings: AffirmSettings
    isScriptLoaded: boolean
    isScriptLoadSucceed: boolean
}

type AffirmSettings = {
    publicApiKey: string
    isLive: boolean
}

const AffirmPromo = (props: AffirmProps) => {

    useEffect(() => {
        const { isScriptLoaded, isScriptLoadSucceed, settings: { publicApiKey } } = props
        
        if (isScriptLoaded && isScriptLoadSucceed) {
            window._affirm_config = {
                public_api_key:  publicApiKey
            }
            window.affirm.ui.refresh();
        }
    })

    
    const { product, selectedItem } = useProduct()
    
    if (!product || !selectedItem) {
        return null
    }

    const price = selectedItem && selectedItem.sellers[0].commertialOffer.Price

    return ( 
    <Fragment>
        <p className="affirm-as-low-as" data-page-type="product" data-amount={ price * 100 }></p>
    </Fragment>
    )
    
}

export default compose(
    scriptLoader(
        'https://cdn1-sandbox.affirm.com/js/v2/affirm.js'
    )
)(AffirmPromo)