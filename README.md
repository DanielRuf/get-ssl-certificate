# get-ssl-certificate-next

## A zero-dependency utility that returns a website's SSL certificate

![CI](https://github.com/DanielRuf/get-ssl-certificate-next/workflows/CI/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/DanielRuf/get-ssl-certificate-next/badge.svg?branch=master)](https://coveralls.io/github/DanielRuf/get-ssl-certificate-next?branch=master)
[![Code Climate](https://codeclimate.com/github/DanielRuf/get-ssl-certificate-next/badges/gpa.svg)](https://codeclimate.com/github/DanielRuf/get-ssl-certificate-next)
[![NPM version](https://img.shields.io/npm/v/get-ssl-certificate-next.svg)](https://www.npmjs.com/package/get-ssl-certificate-next)

### Installation

```shell
npm install --save get-ssl-certificate-next
```

### Usage

#### Import package:

```js
const sslCertificate = require('get-ssl-certificate-next')
```

#### Pass a url / domain name:

```js
sslCertificate.get('nodejs.org').then(function (certificate) {
  console.log(certificate)
  // certificate is a JavaScript object

  console.log(certificate.issuer)
  // { C: 'GB',
  //   ST: 'Greater Manchester',
  //   L: 'Salford',
  //   O: 'COMODO CA Limited',
  //   CN: 'COMODO RSA Domain Validation Secure Server CA' }

  console.log(certificate.valid_from)
  // 'Aug  14 00:00:00 2017 GMT'

  console.log(certificate.valid_to)
  // 'Nov 20 23:59:59 2019 GMT'

  // If there was a certificate.raw attribute, then you can access certificate.pemEncoded
  console.log(certificate.pemEncoded)
  // -----BEGIN CERTIFICATE-----
  // ...
  // -----END CERTIFICATE-----
});
```

#### Optional parameters: Timeout (in ms), Protocol (Default is 'https:'), Port (Default is 443) and detailed (includes certificate chain, Default is false)

```js
sslCertificate.get('nodejs.org', 250, 443, 'https:', false).then(function (certificate) {
  console.log(certificate)
  // certificate is a JavaScript object

  console.log(certificate.issuer)
  // { C: 'GB',
  //   ST: 'Greater Manchester',
  //   L: 'Salford',
  //   O: 'COMODO CA Limited',
  //   CN: 'COMODO RSA Domain Validation Secure Server CA' }

  console.log(certificate.valid_from)
  // 'Aug  14 00:00:00 2017 GMT'

  console.log(certificate.valid_to)
  // 'Nov 20 23:59:59 2019 GMT'

  // If there was a certificate.raw attribute, then you can access certificate.pemEncoded
  console.log(certificate.pemEncoded)
  // -----BEGIN CERTIFICATE-----
  // ...
  // -----END CERTIFICATE-----
});
```

## License

MIT
