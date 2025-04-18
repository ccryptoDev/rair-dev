import React, { useCallback, useEffect, useState } from 'react';
import { Provider, useSelector, useStore } from 'react-redux';
import { BigNumber, constants, utils } from 'ethers';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import {
  IBatchTokenSelector,
  ITokenSelector,
  TAux,
  TOffersArrayItem
} from './consumerMode.types';

import { diamondFactoryAbi } from '../../contracts';
import { RootState } from '../../ducks';
import { ColorStoreType } from '../../ducks/colors/colorStore.types';
import { ContractsInitialType } from '../../ducks/contracts/contracts.types';
import blockchainData from '../../utils/blockchainData';
import { metamaskCall } from '../../utils/metamaskUtils';
import InputField from '../common/InputField';
import BuyTokenModalContent from '../marketplace/BuyTokenModalContent';
const rSwal = withReactContent(Swal);

const BatchTokenSelector: React.FC<IBatchTokenSelector> = ({
  batchMint,
  max
}) => {
  const [batchArray, setBatchArray] = useState<TAux[]>([]);
  const [rerender, setRerender] = useState<boolean>(false);

  const addRecipient = () => {
    if (batchArray.length >= +max) {
      return;
    }
    const aux = [...batchArray];
    aux.push({
      recipient: '',
      tokenIndex: 0
    });
    setBatchArray(aux);
  };

  const remove = (index: number) => {
    const aux = [...batchArray];
    aux.splice(index, 1);
    setBatchArray(aux);
  };

  return (
    <details>
      <summary>Batch Minting</summary>
      {batchArray.map((item, index) => {
        return (
          <div className="col-12 row px-0 mx-0" key={Math.random() * 1_000_000}>
            <div className="col-12 col-md-3">
              <InputField
                customClass="form-control"
                getter={batchArray[index].tokenIndex}
                setter={(value) => {
                  batchArray[index].tokenIndex = value;
                  setRerender(!rerender);
                }}
                placeholder="Token"
              />
            </div>
            <div className="col-12 col-md-8">
              <InputField
                customClass="form-control"
                getter={batchArray[index].recipient}
                setter={(value) => {
                  batchArray[index].recipient = value;
                  setRerender(!rerender);
                }}
                placeholder="Recipient"
              />
            </div>
            <button
              onClick={() => remove(index)}
              className="col-12 btn btn-danger col-md-1">
              <i className="fas fa-trash" />
            </button>
          </div>
        );
      })}
      <button
        className="btn btn-royal-ice"
        disabled={batchArray.length >= +max}
        onClick={addRecipient}>
        Add
      </button>
      <button
        className="btn btn-stimorol"
        onClick={() =>
          batchMint(
            batchArray.map((item) => item.tokenIndex),
            batchArray.map((item) => item.recipient)
          )
        }>
        Batch Mint
      </button>
    </details>
  );
};

const TokenSelector: React.FC<ITokenSelector> = ({ buyCall, max, min }) => {
  const [tokenId, setTokenId] = useState<string>(min);

  return (
    <details>
      <summary>
        <small>Buy specific token</small>
      </summary>
      <InputField
        customClass="form-control"
        getter={tokenId}
        setter={setTokenId}
        placeholder="Token Identifier"
        type="number"
        min={min}
        max={max}
        label="Token #"
      />
      <br />
      <button
        onClick={() => {
          buyCall(tokenId);
        }}
        className="btn btn-royal-ice">
        Buy token #{tokenId}
      </button>
    </details>
  );
};

const DiamondMarketplace = () => {
  const [offersArray, setOffersArray] = useState<TOffersArrayItem[]>([]);
  const [transactionInProgress, setTransactionInProgress] =
    useState<boolean>(false);
  const [treasuryAddress, setTreasuryAddress] = useState<string>();

  const { diamondMarketplaceInstance, contractCreator, currentChain } =
    useSelector<RootState, ContractsInitialType>(
      (store) => store.contractStore
    );

  const store = useStore();

  const { primaryColor, secondaryColor } = useSelector<
    RootState,
    ColorStoreType
  >((store) => store.colorStore);

  const fetchDiamondData = useCallback(async () => {
    if (!diamondMarketplaceInstance) {
      return;
    }
    setTreasuryAddress(await diamondMarketplaceInstance.getTreasuryAddress());
    const offerCount = Number(
      (await diamondMarketplaceInstance.getTotalOfferCount()).toString()
    );
    const offerData: TOffersArrayItem[] = [];
    for (let i = 0; i < offerCount; i++) {
      const singleOfferData = await diamondMarketplaceInstance.getOfferInfo(i);
      offerData.push({
        offerIndex: i.toString(),
        contractAddress: singleOfferData.mintOffer.erc721Address,
        rangeIndex: singleOfferData.mintOffer.rangeIndex.toString(),
        visible: singleOfferData.mintOffer.visible,
        startingToken: singleOfferData.rangeData.rangeStart.toString(),
        endingToken: singleOfferData.rangeData.rangeEnd.toString(),
        name: singleOfferData.rangeData.rangeName,
        price: singleOfferData.rangeData.rangePrice,
        tokensAllowed: singleOfferData.rangeData.tokensAllowed.toString(),
        mintableTokens: singleOfferData.rangeData.mintableTokens.toString(),
        lockedTokens: singleOfferData.rangeData.lockedTokens.toString(),
        productIndex: singleOfferData.productIndex.toString()
      });
    }
    setOffersArray(offerData);
  }, [diamondMarketplaceInstance]);

  useEffect(() => {
    fetchDiamondData();
  }, [fetchDiamondData]);

  const mintTokenCall = async (
    offerIndex: string,
    nextToken: string,
    price: BigNumber
  ) => {
    setTransactionInProgress(true);
    Swal.fire({
      title: `Buying token #${nextToken}!`,
      html: 'Please wait...',
      icon: 'info',
      showConfirmButton: false
    });
    if (
      await metamaskCall(
        diamondMarketplaceInstance?.buyMintingOffer(offerIndex, nextToken, {
          value: price
        })
      )
    ) {
      Swal.fire({
        title: 'Success',
        html: 'Token bought',
        icon: 'success',
        showConfirmButton: true
      });
    }
    setTransactionInProgress(false);
  };

  const batchMint = async (
    offerIndex: string,
    tokens: number[],
    addresses: string[],
    price: BigNumber
  ) => {
    setTransactionInProgress(true);
    Swal.fire({
      title: `Buying ${tokens.length} tokens!`,
      html: 'Please wait...',
      icon: 'info',
      showConfirmButton: false
    });
    if (
      await metamaskCall(
        diamondMarketplaceInstance?.buyMintingOfferBatch(
          offerIndex,
          tokens,
          addresses,
          {
            value: price.mul(tokens.length)
          }
        )
      )
    ) {
      Swal.fire({
        title: 'Success',
        html: `${addresses.length} tokens bought`,
        icon: 'success',
        showConfirmButton: true
      });
    }
    setTransactionInProgress(false);
  };

  return (
    <div className="row w-100">
      <div className="col-12 text-center">
        <h1>
          <i className="fas fa-gem" />
        </h1>
        <h5> Diamond Marketplace </h5>
        {offersArray.length} offers found.
      </div>
      {treasuryAddress === constants.AddressZero && (
        <button
          className="btn btn-stimorol"
          onClick={async () => {
            await metamaskCall(
              diamondMarketplaceInstance?.updateTreasuryAddress(
                '0x3fD4268B03cce553f180E77dfC14fde00271F9B7'
              )
            );
          }}>
          Set Treasury Address
        </button>
      )}
      {offersArray.map((offer, index) => {
        return (
          <div
            style={{
              position: 'relative'
            }}
            key={index}
            className="col-12 p-2 col-md-6 my-3 rounded-rair">
            <div style={{ position: 'absolute', top: 0, left: 0 }}>
              #{index + 1}
            </div>
            <small>
              {' '}
              @{offer.contractAddress}:{offer.productIndex}{' '}
            </small>
            <br />
            Range #{offer.rangeIndex}
            <h3>{offer.name}</h3>
            <h5 style={{ display: 'inline' }}>
              <abbr
                title={`From a total of ${offer.mintableTokens} tokens still available`}>
                {offer.tokensAllowed}
              </abbr>
            </h5>{' '}
            tokens available for{' '}
            <h5 style={{ display: 'inline' }}>
              {utils.formatEther(offer.price)}{' '}
              {currentChain && blockchainData[currentChain]?.symbol}
            </h5>
            <br />
            <h5 className="w-100 text-center px-5">
              <div className="float-start">{offer.startingToken}...</div>
              <progress
                max={
                  Number(offer.endingToken) - Number(offer.startingToken) + 1
                }
                value={offer.tokensAllowed}
              />
              <div className="float-end">...{offer.endingToken}</div>
            </h5>
            <button
              disabled={transactionInProgress || !offer.visible}
              onClick={async () => {
                const instance = contractCreator?.(
                  offer.contractAddress,
                  diamondFactoryAbi
                );
                const nextToken = await instance?.getNextSequentialIndex(
                  offer.productIndex,
                  offer.startingToken,
                  offer.endingToken
                );
                await mintTokenCall(offer.offerIndex, nextToken, offer.price);
              }}
              className={`btn my-2 py-0 btn-${
                offer.visible ? 'stimorol' : 'danger'
              }`}>
              {offer.visible
                ? 'Buy the first available token'
                : 'Not for sale!'}
            </button>
            {false && offer.visible && (
              <TokenSelector
                min={offer.startingToken}
                max={offer.endingToken}
                buyCall={async (tokenIndex) => {
                  await mintTokenCall(
                    offer.offerIndex,
                    tokenIndex,
                    offer.price
                  );
                }}
              />
            )}
            {false && offer.visible && (
              <BatchTokenSelector
                max={offer.tokensAllowed}
                batchMint={(tokens: number[], addresses: string[]) =>
                  batchMint(offer.offerIndex, tokens, addresses, offer.price)
                }
              />
            )}
            <br />
            {offer.visible && (
              <button
                id={`button_${index}`}
                onClick={async () => {
                  rSwal.fire({
                    html: (
                      <Provider store={store}>
                        <BuyTokenModalContent
                          diamonds={true}
                          buyTokenFunction={mintTokenCall}
                          buyTokenBatchFunction={batchMint}
                          start={offer.startingToken}
                          end={offer.endingToken}
                          blockchain={currentChain}
                          minterAddress={diamondMarketplaceInstance?.address}
                          price={offer.price}
                          offerName={offer.name}
                          offerIndex={offer.offerIndex}
                        />
                      </Provider>
                    ),
                    showConfirmButton: false,
                    width: '70vw',
                    customClass: {
                      popup: `bg-${primaryColor}`,
                      htmlContainer: `text-${secondaryColor}`
                    }
                  });
                }}
                className="btn btn-royal-ice py-0">
                More options
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DiamondMarketplace;
