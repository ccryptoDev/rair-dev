import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { BigNumber, ethers } from 'ethers';
import Swal from 'sweetalert2';

import OfferRow from './OfferRow';

import WorkflowContext from '../../../contexts/CreatorWorkflowContext';
import { erc721Abi } from '../../../contracts';
import { RootState } from '../../../ducks';
import { ColorStoreType } from '../../../ducks/colors/colorStore.types';
import { ContractsInitialType } from '../../../ducks/contracts/contracts.types';
import chainData from '../../../utils/blockchainData';
import { metamaskCall, validateInteger } from '../../../utils/metamaskUtils';
import { web3Switch } from '../../../utils/switchBlockchain';
import {
  IListOffers,
  TOfferListItem,
  TParamsListOffers
} from '../creatorStudio.types';
import FixedBottomNavigation from '../FixedBottomNavigation';

const ListOffers: React.FC<IListOffers> = ({
  contractData,
  setStepNumber,
  stepNumber,
  gotoNextStep,
  goBack,
  forceRefetch
}) => {
  const [offerList, setOfferList] = useState<TOfferListItem[]>([]);
  const [forceRerender, setForceRerender] = useState<boolean>(false);
  const [hasMinterRole, setHasMinterRole] = useState<boolean>(false);
  const [instance, setInstance] = useState<ethers.Contract | undefined>();
  const [onMyChain, setOnMyChain] = useState<boolean>();
  const [emptyNames, setEmptyNames] = useState<boolean>(true);
  const [validPrice, setValidPrice] = useState<boolean>(true);

  const {
    minterInstance,
    contractCreator,
    programmaticProvider,
    currentChain
  } = useSelector<RootState, ContractsInitialType>(
    (store) => store.contractStore
  );
  const { primaryColor, textColor } = useSelector<RootState, ColorStoreType>(
    (store) => store.colorStore
  );
  const { address, collectionIndex } = useParams<TParamsListOffers>();
  useEffect(() => {
    setOfferList(
      contractData?.product?.offers
        ? contractData?.product?.offers.map((item) => {
            return {
              name: item.offerName,
              starts: item.range[0],
              ends: item.range[1],
              price: item.price,
              fixed: true
            };
          })
        : []
    );
  }, [contractData]);

  useEffect(() => {
    setStepNumber(stepNumber);
  }, [setStepNumber, stepNumber]);

  useEffect(() => {
    let auxPrices: boolean = forceRerender && false;
    let auxNames = false;
    offerList.forEach((item) => {
      if (!item.fixed) {
        auxPrices =
          auxPrices || !validateInteger(+item.price) || +item.price <= 0;
        auxNames = auxNames || item.name === '';
      }
    });
    setEmptyNames(auxNames);
    setValidPrice(auxPrices);
  }, [offerList, forceRerender]);

  const rerender = useCallback(() => {
    setForceRerender(() => !forceRerender);
  }, [setForceRerender, forceRerender]);

  const addOffer = () => {
    const aux: TOfferListItem[] = [...offerList];
    const startingToken =
      offerList.length === 0 ? 0 : Number(offerList.at(-1)?.ends) + 1;
    aux.push({
      name: '',
      starts: String(startingToken),
      ends: String(startingToken),
      price: '100'
    });
    setOfferList(aux);
  };

  const deleter = (index: number) => {
    const aux = [...offerList];
    if (aux.length > 1 && index !== aux.length - 1) {
      aux[1].starts = '0';
    }
    aux.splice(index, 1);
    setOfferList(aux);
  };

  useEffect(() => {
    if (onMyChain) {
      const createdInstance = contractCreator?.(address, erc721Abi);
      setInstance(createdInstance);
    }
  }, [address, onMyChain, contractCreator]);

  const fetchMintingStatus = useCallback(async () => {
    if (!instance || !onMyChain) {
      return;
    }
    try {
      setHasMinterRole(
        await metamaskCall(
          instance.hasRole(
            await metamaskCall(instance.MINTER()),
            minterInstance?.address
          )
        )
      );
    } catch (err) {
      console.error(err);
      setHasMinterRole(false);
    }
  }, [minterInstance, instance, onMyChain]);

  useEffect(() => {
    fetchMintingStatus();
  }, [fetchMintingStatus]);

  const giveMinterRole = async () => {
    Swal.fire({
      title: 'Granting Role...',
      html: 'Please wait',
      icon: 'info',
      showConfirmButton: false
    });
    if (
      await metamaskCall(
        instance?.grantRole(await instance.MINTER(), minterInstance?.address)
      )
    ) {
      Swal.fire('Success!', 'You can create offers now!', 'success');
      fetchMintingStatus();
    }
  };

  const createOffers = async () => {
    Swal.fire({
      title: 'Creating offer...',
      html: 'Please wait...',
      icon: 'info',
      showConfirmButton: false
    });
    if (
      await metamaskCall(
        minterInstance?.addOffer(
          instance?.address,
          collectionIndex,
          offerList.map((item) => item.starts),
          offerList.map((item) => item.ends),
          offerList.map((item) => item.price),
          offerList.map((item) => item.name),
          process.env.REACT_APP_NODE_ADDRESS
        ),
        undefined
      )
    ) {
      Swal.fire({
        title: 'Success!',
        html: 'The offer has been created!',
        icon: 'success',
        showConfirmButton: true
      });
      forceRefetch();
    }
  };

  const validateTokenIndexes = () => {
    if (contractData && offerList.length > 0) {
      const copies = BigNumber.from(contractData.product.copies).sub(1);
      let allOffersAreCorrect = true;
      for (const item of offerList) {
        if (!allOffersAreCorrect) {
          return false;
        }
        allOffersAreCorrect =
          allOffersAreCorrect &&
          validateInteger(item.ends) &&
          validateInteger(item.starts) &&
          BigNumber.from(item.ends).lte(copies) &&
          BigNumber.from(item.starts).lte(copies) &&
          BigNumber.from(item.starts).lte(item.ends);
      }
      return allOffersAreCorrect;
    }
    return false;
  };

  const appendOffers = async () => {
    Swal.fire({
      title: 'Appending offers...',
      html: 'Please wait...',
      icon: 'info',
      showConfirmButton: false
    });
    const filteredList = offerList.filter((item) => !item.fixed);
    if (
      await metamaskCall(
        minterInstance?.appendOfferRangeBatch(
          contractData?.product.offers?.[0].offerPool,
          filteredList.map((item) => item.starts),
          filteredList.map((item) => item.ends),
          filteredList.map((item) => item.price),
          filteredList.map((item) => item.name)
        ),
        undefined
      )
    ) {
      Swal.fire({
        title: 'Success!',
        html: 'The offers have been appended!',
        icon: 'success',
        showConfirmButton: true
      });
      forceRefetch();
    }
  };

  useEffect(() => {
    setOnMyChain(
      contractData &&
        (window.ethereum
          ? chainData[contractData?.blockchain]?.chainId === currentChain
          : chainData[contractData?.blockchain]?.chainId === currentChain)
    );
  }, [contractData, programmaticProvider, currentChain]);

  return (
    <div className="row px-0 mx-0">
      {contractData ? (
        <>
          {offerList?.length !== 0 && (
            <table className="col-12 text-start">
              <thead>
                <tr>
                  <th className="px-1" style={{ width: '5vw' }} />
                  <th>Item name</th>
                  <th style={{ width: '10vw' }}>Starts</th>
                  <th style={{ width: '10vw' }}>Ends</th>
                  <th style={{ width: '20vw' }}>Price for each</th>
                  <th />
                </tr>
              </thead>
              <tbody style={{ maxHeight: '50vh', overflowY: 'scroll' }}>
                {offerList.map((item, index, array) => {
                  return (
                    <OfferRow
                      array={array}
                      deleter={() => deleter(index)}
                      key={index}
                      index={index}
                      {...item}
                      blockchainSymbol={
                        chainData[contractData?.blockchain]?.symbol
                      }
                      rerender={rerender}
                      maxCopies={Number(contractData?.product?.copies) - 1}
                    />
                  );
                })}
              </tbody>
            </table>
          )}
          <div className="col-12 mt-3 text-center">
            <div className="border-stimorol rounded-rair">
              <button
                onClick={addOffer}
                disabled={offerList.length >= 12}
                className={`btn btn-${primaryColor} rounded-rair px-4`}>
                Add new{' '}
                <i
                  className="fas fa-plus"
                  style={{
                    border: `solid 1px ${textColor}`,
                    borderRadius: '50%',
                    padding: '5px'
                  }}
                />
              </button>
            </div>
          </div>
          <div
            className="col-12 mt-3 p-5 text-center rounded-rair"
            style={{ border: 'dashed 2px var(--charcoal-80)' }}>
            First Token: {contractData?.product?.firstTokenIndex}, Last Token:{' '}
            {Number(contractData?.product?.firstTokenIndex) +
              contractData?.product?.copies -
              1}
            , Mintable Tokens Left:{' '}
            {contractData?.product?.copies - contractData?.product?.soldCopies}
          </div>
          {chainData && (
            <FixedBottomNavigation
              backwardFunction={goBack}
              forwardFunctions={[
                !onMyChain
                  ? {
                      action: () => web3Switch(contractData?.blockchain),
                      label: `Switch to ${
                        chainData[contractData?.blockchain]?.name
                      }`
                    }
                  : hasMinterRole === true
                  ? {
                      action: offerList[0]?.fixed ? appendOffers : createOffers,
                      label: offerList[0]?.fixed
                        ? 'Append to offer'
                        : 'Create new offers',
                      disabled:
                        offerList.filter((item) => item.fixed !== true)
                          .length === 0 ||
                        offerList.length === 0 ||
                        !validateTokenIndexes() ||
                        validPrice ||
                        emptyNames
                    }
                  : {
                      action: giveMinterRole,
                      label: 'Connect to Minter Marketplace'
                    },
                {
                  label: 'Continue',
                  action: gotoNextStep
                }
              ]}
            />
          )}
        </>
      ) : (
        'Fetching data...'
      )}
    </div>
  );
};

const ContextWrapper = (props: IListOffers) => {
  return (
    <WorkflowContext.Consumer>
      {(value) => {
        return <ListOffers {...value} {...props} />;
      }}
    </WorkflowContext.Consumer>
  );
};

export default ContextWrapper;
