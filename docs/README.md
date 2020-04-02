📢 Use this project, [contribute](https://github.com/vtex-apps/affirm-components) to it or open issues to help evolve it using [Store Discussion](https://github.com/vtex-apps/store-discussion).

# Affirm Payment

This is a payment authorization app for the Affirm payment method (financing with monthly payments).

## Configuration

1. Enable Affirm as a payment method in your store admin. In the Gateway Affiliation, enter your Affirm public API key as the `Application Key` and your Affirm private API key as the `Application Token`.
2. Install this app in your account by running `vtex install vtex.affirm-payment`.
3. Configure the app settings by clicking "Apps" in your admin sidebar and then selecting "Affirm Payment".

The available settings are:

- `Production Mode`: Initial testing should be performed with this box unchecked. When you are ready to process live transactions, check the box and save.
- `Enable Katapult`: Katapult is a newer Affirm feature that offers a leasing option to shoppers who do not qualify for the normal Affirm financing. Please ask your Affirm contact to enable the feature on your Affirm account before enabling this app setting.
- `Company Name`: If you have multiple sites operating under a single Affirm account, you can override the external company/brand name that the customer sees. This affects all references to your company name in the Affirm UI. Leave blank to use your default company name stored in your Affirm account.
- `Public API Key`: The public API key provided to you by Affirm.
- `Interval to use for the following three settings`: Determines the unit of time used by the following settings.
- `Delay to auto-settle`: Number of minutes/hours/days before authorized Affirm payments are automatically settled.
- `Delay to auto-settle after anti-fraud`: Number of minutes/hours/days before authorized Affirm payments are automatically settled after merchant's antifraud approval.
- `Delay to cancel`: Number of minutes/hours/days before Affirm payments are automatically canceled.
