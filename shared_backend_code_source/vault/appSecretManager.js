const axios = require('axios');
const {
  getVaultNamespace,
  getVaultUrl,
  getVaultAppSecretKVLocation
} = require('./vaultUtils');

const {
  executePromisesSequentially
} = require('../utils/helpers');

const getSecret = async ({appName, secretName, vaultToken, preventThrowingErrors}) => {

  // catch any errors if we did not send a param through here
  if(!appName) {
    console.log('appName is falsy');
    if(!preventThrowingErrors) {
      throw new Error('appName is falsy');
    }
  }
  if(!secretName) {
    console.log('secretName is falsy')
    if(!preventThrowingErrors) {
      throw new Error('secretName is falsy');
    }
  }
  if(!vaultToken) {
    console.log('vaultToken is falsy')
    if(!preventThrowingErrors) {
      throw new Error('vaultToken is falsy');
    }
  }

  const axiosParams = {
    method: "GET",
    url: `${getVaultUrl()}/v1/${getVaultAppSecretKVLocation()}/data/${appName}/${secretName}`,
    headers: {
      "X-Vault-Request": true,
      "X-Vault-Namespace": getVaultNamespace(),
      "X-Vault-Token": vaultToken
    }
  }

  // Make call to vault
  const res = await axios(axiosParams);

  // basic / non-success error handling
  if(res.status !== 200) {
    const errMessage = 'Vault received non 200 code while trying to retrieve secret!';
    console.log(errMessage);
    if(!preventThrowingErrors) {
      throw new Error(errMessage);
    }
  }

  // Data comes back in this format
  // Leaving this here for a future typescript refactor

  // data: any
  // metadata: {
    // created_time: string,
    // custom_metadata: any,
    // deletion_time: string,
    // destroyed: boolean,
    // version: number
  // }
  return res.data.data;
}

class AppSecretManager {
  constructor({appName, preventThrowingErrors}) {
    // initialize with a null map
    this.secretMap = new Map();
    this.appName = appName;
    this.preventThrowingErrors = preventThrowingErrors;
  }

  getSecretFromMemory(secretKey) {
    console.log('Get secret from memory:', secretKey);
    return this.secretMap.get(secretKey);
  }

  async getAppSecrets({vaultToken, listOfSecretsToFetch}) {
    try {
      await executePromisesSequentially({
        items: listOfSecretsToFetch,
        action: async (secretName) => {
          console.log('Get secret from vault:', secretName)
          const secretData = await getSecret({
            appName: this.appName,
            secretName,
            vaultToken,
            preventThrowingErrors: this.preventThrowingErrors
          });
          // Save secret into map on class
          this.secretMap.set(secretName, secretData);
        }
      })

      // return after all secrets have been retreived sequentially
      return this.secretMap;
    } catch (err) {
      const errMessage = 'Error retrieving secrets';
      console.log(errMessage);
      if(!this.preventThrowingErrors) {
        throw new Error(errMessage);
      }
    }
  }
}

module.exports = {
  AppSecretManager
}