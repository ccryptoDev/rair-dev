### How to import and use token manager and key writer classes

// initialize app role token manager
const { vaultAppRoleTokenManager } = require('./vault/vaultAppRoleTokenManager');
const { vaultKeyManager } = require('./vault/vaultKeyManager');

vaultAppRoleTokenManager.initialLogin().then((res) => {
  try {
    // write into vault here
    vaultKeyManager.write({
      key: "123",
      data: {
        key: 'test_key',
        other_val: "other_val"
      },
      vaultToken: vaultAppRoleTokenManager.getToken()
    });
  } catch(err) {
    throw err;
  }
}).catch((err) => {
  console.log('err', err)
})