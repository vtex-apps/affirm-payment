import { queries, mutations } from './resolvers/affirm'
import { Service } from '@vtex/api'
import { clients } from './clients'

export default new Service({
    clients,
    graphql: {
        resolvers: {
            Query: {
                ...queries,
            },
            Mutation: {
                ...mutations,
            }
        }
    },
})