const mongoConfig = require('../config/mongoConfig');
const crypto = require('crypto');
const os = require('os');
const fs = require('fs');
const path = require('path');

const getMongoConnectionStringURI = ({
  appSecretManager
}) => {
  return new Promise((resolve, reject) => {

  // Check if we're using new Mongo URI system
  if(mongoConfig.GENERATE_MONGO_URI_WITH_VAULT_CREDENTIAL_UTIL !== 'true') {
    // If we're running locally, use the original url pattern
    console.log('Mongo URI: generated using legacy logic path');
    const legacyUri = mongoConfig.PRODUCTION === 'true' ? mongoConfig.MONGO_URI : mongoConfig.MONGO_URI_LOCAL;
    return resolve(legacyUri);
  }

  if(mongoConfig.USE_X509_CERT_AUTH === true) {
    console.log('Mongo URI: generated using new vault based x509 auth path');

    // pull cert from vault
    const certSecret = appSecretManager.getSecretFromMemory(mongoConfig.VAULT_MONGO_x509_SECRET_KEY);

    // Define temp file creation function
    const tmpFile = ({prefix, suffix, tmpdir}) => {
      prefix = (typeof prefix !== 'undefined') ? prefix : 'tmp.';
      suffix = (typeof suffix !== 'undefined') ? suffix : '';
      tmpdir = tmpdir ? tmpdir : os.tmpdir();
      return path.join(tmpdir, prefix + crypto.randomBytes(16).toString('hex') + suffix);
    }

    // define temp file name / location
    const certTempFile = tmpFile({});

    // Extract cert string from returned vault data
    const certString = certSecret.data.x509_cert;

    const fileEncoding = "utf-8"

    // write to temp file
    fs.writeFile(certTempFile, certString, fileEncoding, (err) => {
      if(err) reject("Error writing cert to temp file");
      // TODO:
      // delete temp file?? when?

      const certMongoUri = `mongodb+srv://${mongoConfig.MONGO_DB_HOSTNAME}/${mongoConfig.MONGO_DB_NAME}?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&tls=true&tlsCertificateKeyFile=${certTempFile}`
      resolve(certMongoUri);
    });
  } else {
    console.log('Mongo URI: generated using new vault based user/password auth path');

    const passwordSecrets = appSecretManager.getSecretFromMemory(mongoConfig.VAULT_MONGO_USER_PASS_SECRET_KEY);

    // Verify that we have pulled secrets correctly
    if (
      !passwordSecrets ||
      !passwordSecrets['data'] ||
      !passwordSecrets['data']['username'] ||
      !passwordSecrets['data']['password']
    ) {
      const errMessage = 'Could find vault password secrets during Mongo connection string generation process';
      console.log(errMessage);
      throw new Error(errMessage)
    }

    const username = passwordSecrets['data']['username'];
    const password = passwordSecrets['data']['password'];

    // Double check that we have appropriate mongo values coming in from ENV variables
    if(
      !mongoConfig.MONGO_DB_HOSTNAME ||
      !mongoConfig.MONGO_DB_NAME
    ) {
      const errMessage = 'Could not find mongo env variables during Mongo connection string generation process';
      console.log(errMessage);
      throw new Error(errMessage);
    }

    const databaseName = mongoConfig.MONGO_DB_NAME
    const hostname = mongoConfig.MONGO_DB_HOSTNAME;

    const mongoUri = `mongodb+srv://${username}:${password}@${hostname}/${databaseName}`
    resolve(mongoUri);
  }
  })
}

module.exports = {
  getMongoConnectionStringURI
}
