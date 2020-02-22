const fs = require('fs');

require.extensions['.txt'] = function(module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};

require.extensions['.pem'] = function(module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};

var should = require('chai').should(),
  expect = require('chai').expect,
  spy = require('sinon').spy,
  stub = require('sinon').stub,
  https = require('https'),
  mockPemEncodedCert = require('./mocks/mock.pem'),
  mockIssuerCertificateFingerprint = '33:E4:E8:08:07:20:4C:2B:61:82:A3:A1:4B:59:1A:CD:25:B5:F0:DB',
  mockBase64EncodedRawBuffer = require('./mocks/base64buffer.txt'),
  getSSLCertificate = require('../index');

describe('Mock getSSLCertificate.get()', function() {
  var mockUrl = 'nodejs.org';

  var bufferFromBase64String = new Buffer.from(mockBase64EncodedRawBuffer, 'base64');

  var mockCertificate = require('./mocks/cert.js');
  var mockSuccessResult = {
    socket: {
      getPeerCertificate: function() {
        return mockCertificate;
      }
    }
  };

  var mockFailResult = {
    socket: {
      getPeerCertificate: function() {
        return {};
      }
    }
  };

  var onEventStub = spy();
  var endFunction = spy();

  var httpsCb = [
    mockFailResult,
    mockSuccessResult,
    mockFailResult,
    mockSuccessResult,
    mockSuccessResult,
    mockSuccessResult,
    mockSuccessResult,
    mockSuccessResult,
  ];

  beforeEach(function() {
    stub(https, 'get')
      .yields(httpsCb.shift())
      .returns({ on: onEventStub, end: endFunction });
  });

  afterEach(function() {
    https.get.restore();
  });

  it('should throw an error for empty strings', function() {
    expect(function() {
      getSSLCertificate.get('', spy());
    }).to.throw(Error);
  });

  it('should return a promise', function() {
    expect(getSSLCertificate.get(mockUrl)).to.be.a('Promise');
  });

  it('should reject with an Error if an empty object is received', function(done) {
    getSSLCertificate.get(mockUrl).catch(function(err) {
      expect(err.message).to.be.equal('The website did not provide a certificate');
      done();
    });
  });

  it('should pass the certificate to the callback if successful', function(done) {
    getSSLCertificate.get(mockUrl).then(function(cert) {
      expect(cert).to.be.deep.equal(mockCertificate);
      expect(endFunction.called).to.be.equal(true);
      done();
    });
  });

  it('req.on() should always be called to handle https error events', function(done) {
    getSSLCertificate.get(mockUrl).then(function(cert) {
      expect(onEventStub.calledWith('error')).to.be.equal(true);
      done();
    });
  });

  it('req.end() should be called', function(done) {
    getSSLCertificate.get(mockUrl).then(function(cert) {
      expect(cert).to.be.deep.equal(mockCertificate);
      expect(endFunction.called).to.be.equal(true);
      done();
    });
  });

  it('the certificate should have a raw attribute equal to the converted mock buffer', function(done) {
    getSSLCertificate.get(mockUrl).then(function(cert) {
      expect(cert.raw).to.be.deep.equal(bufferFromBase64String);
      done();
    });
  });

  it('the certificate should have a pemEncoded attribute equal to the mock PEM encoded certificate', function(done) {
    getSSLCertificate.get(mockUrl).then(function(cert) {
      expect(cert.pemEncoded).to.be.equal(mockPemEncodedCert);
      done();
    });
  });
});

describe('Live getSSLCertificate.get()', function() {
  it('should timeout', function(done) {
    getSSLCertificate
      // This is a ridiculously low timeout that surely fails, as it usually takes around ~200ms
      .get('blog.johncrisostomo.com', 1)
      .catch(function(error) {
        expect(error.message).to.be.equal('Request timed out.');
        done();
      });
  });

  it('should timeout at expected time', function(done) {
    const startTime = new Date();
    getSSLCertificate
      .get('192.0.2.0', 1400) // use a TEST-NET-1 IP address
      .catch(function(error) {
        const endTime = new Date();
        expect(error.message).to.be.equal('Request timed out.');
        expect(endTime - startTime).to.be.above(1400);
        expect(endTime - startTime).to.be.below(1600);
        done();
      });
  });

  it('the certificate should return the certificate chain when detailed = true', function(done) {
    getSSLCertificate.get('nodejs.org', null, null, null, true).then(function(cert) {
      expect(cert.issuerCertificate.fingerprint).to.be.equal(mockIssuerCertificateFingerprint);
      done();
    });
  });

  it('the certificate should not return the certificate chain when detailed = false', function(done) {
    getSSLCertificate.get('nodejs.org', null, null, null, false).then(function(cert) {
      expect(cert.issuerCertificate).to.be.undefined;
      done();
    });
  });

  it('the certificate should not return the certificate chain when detailed = undefined', function(done) {
    getSSLCertificate.get('nodejs.org').then(function(cert) {
      expect(cert.issuerCertificate).to.be.undefined;
      done();
    });
  });
});
