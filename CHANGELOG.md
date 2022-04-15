# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Raised app timeout from 10 to 20 seconds

## [2.2.0] - 2022-03-22

### Added

- node/service.json config added.

## [2.1.8] - 2022-02-14

### Changed

- Update documentation to clarify `delayToCancel` app setting

### Added

- Quality Engineering - SonarCloud and Lint Actions

## [2.1.7] - 2022-01-05

### Changed

- Adjust descriptions to improve clarity
- Update docs to reflect the adjustment

## [2.1.6] - 2021-11-03

### Changed

- Update documentation to explain to the developer that we do not support a seller, marketplace situation

## [2.1.5] - 2020-12-04

### Changed

- Add platform metadata to Affirm checkout object
- Reorder app settings and adjust descriptions for improved clarity
- Update docs to reflect settings changes

## [2.1.4] - 2020-09-23

### Changed

- Update `affirm-api` dependency to `1.x`

## [2.1.3] - 2020-06-19

### Changed

- While Affirm modal is open, warn shopper if they attempt to close browser tab

## [2.1.2] - 2020-06-04

### Added

- Added fields for Katapult tokens

## [2.1.1] - 2020-05-06

### Fixed

- add catch statement for inbound request mutation in case of timeouts or other errors

## [2.1.0] - 2020-04-22

### Changed

- Use `sandboxMode` variable from payment request payload to determine what Affirm script to load, instead of `isLive` app setting.

## [2.0.5] - 2020-04-17

### Added

- `discounts` object to Affirm Checkout call

## [2.0.4] - 2020-04-07

### Fixed

- Added rounding when converting dollar values to cents, as float multiplication operations in JS can sometimes result in repeating decimals.

## [2.0.3] - 2020-04-06

### Fixed

- Added `tid` and `message` fields to gateway callback so that user gets a better error message if they close the modal before completing Affirm checkout.

## [2.0.2] - 2020-04-06

### Fixed

- Changed to class component to meet requirements of react@2.x builder

## [2.0.1] - 2020-04-03

### Fixed

- Payment authorization apps must use react@2.x and pages@0.x builders

## [2.0.0] - 2020-04-02

### Added

- Support for Katapult feature (Affirm option that offers lease payments) (AKA Zibby)

### Changed

- Simplified and linted code

### Removed

- Moved Affirm promo components to separate app (`vtex.affirm-components`)
- App setting for store root path is no longer used, root path is now taken from render-runtime

## [0.2.0] - 2020-02-21

### Added

- App setting to handle store URLs with root paths like store.com/us/

## [0.1.1] - 2019-08-23

### Added

- Now sending `orderId` to Affirm checkout instead of `transactionId`
- Using new `status=denied` parameter on `returnUrl` for cases where shopper cancels modal checkout

## [0.1.0] - 2019-08-06

### Added

- First release
