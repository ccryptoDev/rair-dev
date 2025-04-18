# Get All Product tokens

Get tokens for the product

**URL** : `/api/nft/network/:networkId/:contract/:product`

**Method** : `GET`

**Parameters:**

```json
{
  "networkId": {
    "required": true,
    "content": {
      "type": "string"
    }
  },
  "contract": {
    "required": true,
    "content": {
      "type": "string"
    }
  },
  "product": {
    "required": true,
    "content": {
      "type": "number"
    }
  }
}
```

**Query parameters:**

```json
{
  "fromToken": {
    "required": false,
    "content": {
      "type": "number",
      "defaultValues": 0
    }
  },
  "toToken": {
    "required": false,
    "content": {
      "type": "number",
      "defaultValues": 20
    }
  },
  "sortByToken": {
    "required": false,
    "content": {
      "type": "number",
      "values": ["1", "-1"]
    }
  },
  "sortByPrice": {
    "required": false,
    "content": {
      "type": "number",
      "values": ["1", "-1"]
    }
  },
  "priceFrom": {
    "required": false,
    "content": {
      "type": "number"
    }
  },
  "priceTo": {
    "required": false,
    "content": {
      "type": "number"
    }
  },
  "forSale": {
    "required": false,
    "content": {
      "type": "boolean"
    }
  }
}
```

## Success Response

Returns if found some tokens

**Code** : `200 OK`

**Content-Type**: `application/json;`

**Content example**

```json
{
  "success": true,
  "result": {
    "totalCount": 28,
    "tokens": [
      {
        "_id": "61489247656bf4001ef56e24",
        "metadataURI": "some  URL",
        "token": 1,
        "ownerAddress": "userAddress",
        "offerPool": 11,
        "offer": 0,
        "contract": "contractAddress",
        "uniqueIndexInContract": 1,
        "isMinted": true,
        "isURIStoredToBlockchain": true,
        "metadata": {
          "artist": "chrissweet",
          "external_url": "none",
          "name": "CoinAgenda Monaco 2021 #1",
          "description": "Stream the conference Link",
          "image": "coinagendamonaco1",
          "attributes": [
            {
              "trait_type": "Crystal Color",
              "value": "Pink"
            },
            ...
          ]
        },
        "creationDate": "2021-09-20T13:53:11.567Z",
        "authenticityLink": "Link"
      },
      ...
    ]
  }
}
```
