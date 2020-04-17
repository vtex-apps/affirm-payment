# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
