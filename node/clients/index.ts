import { AuthType, ClientsConfig, IOClients, LRUCache } from '@vtex/api'

import AffirmDataSource from './payments'
import AffirmProxyDataSource from './paymentsProxy'

const TIMEOUT_MS = 8000

const defaultClientOptions = {
    retries: 2,
    timeout: TIMEOUT_MS,
}

const memoryCache = new LRUCache<string, any>({ max: 5000 })
metrics.trackCache('affirm-payment', memoryCache)

export class Clients extends IOClients {
    public get payments(): AffirmDataSource {
        return this.getOrSet('payments', AffirmDataSource)
    }
    public get paymentsProxy(): AffirmProxyDataSource {
        return this.getOrSet('paymentsProxy', AffirmProxyDataSource)
    }
}

export const clients: ClientsConfig<Clients> = {
    implementation: Clients,
    options: {
        default: defaultClientOptions,
        payments: {
            authType: AuthType.bearer,
            memoryCache,
        },
        paymentsProxy: {
            authType: AuthType.bearer,
            memoryCache,
        }
    }
}