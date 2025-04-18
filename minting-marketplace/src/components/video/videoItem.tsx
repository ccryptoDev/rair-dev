// @ts-nocheck
import { useCallback, useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useStateIfMounted } from 'use-state-if-mounted';

import { IVideoItem, TParticularProduct } from './video.types';

import { TUserResponse } from '../../axios.responseTypes';
import { UserType } from '../../ducks/users/users.types';
import chainData from '../../utils/blockchainData';
import { metamaskCall } from '../../utils/metamaskUtils';
import { rFetch } from '../../utils/rFetch';
import NftVideoplayer from '../MockUpPage/NftList/NftData/NftVideoplayer/NftVideoplayer';
import { SvgKey } from '../MockUpPage/NftList/SvgKey';
import { SvgLock } from '../MockUpPage/NftList/SvgLock';
import CustomButton from '../MockUpPage/utils/button/CustomButton';
import { ModalContentCloseBtn } from '../MockUpPage/utils/button/ShowMoreItems';
import { playImagesColored } from '../SplashPage/images/greyMan/grayMan';
// import { TChainItemData } from '../../utils/utils.types';

Modal.setAppElement('#root');

const VideoItem: React.FC<IVideoItem> = ({ mediaList, item }) => {
  const navigate = useNavigate();
  const { minterInstance, diamondMarketplaceInstance } = useSelector(
    (state) => state.contractStore
  );
  const { primaryColor } = useSelector((store) => store.colorStore);

  const customStyles = {
    overlay: {
      zIndex: '1'
    },
    content: {
      background: primaryColor === 'rhyno' ? '#F2F2F2' : '#383637',
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      flexDirection: 'column',
      alignContent: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
      fontFamily: 'Plus Jakarta Text',
      border: 'none',
      borderRadius: '16px'
    }
  };

  let availableToken = [];

  const [modalIsOpen, setModalIsOpen] = useState(false);
  // const [modalBuy, setModalBuy] = useState(false);
  const [modalHelp, setModalHelp] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [owned /*setOwned*/] = useState(false);
  const [openVideoplayer, setOpenVideoplayer] = useState(false);
  const [contractData, setContractData] =
    useStateIfMounted<TParticularProduct | null>(null);
  const [dataUser, setDataUser] = useStateIfMounted<UserType | null>(null);

  // primaryColor === 'rhyno' ? '#F2F2F2' : '#383637'
  const buy = async ({
    offerPool = undefined,
    offerIndex,
    selectedToken,
    price
  }) => {
    if (!contractData && !diamondMarketplaceInstance && !minterInstance) {
      return;
    }
    Swal.fire({
      title: 'Buying token',
      html: 'Awaiting transaction completion',
      icon: 'info',
      showConfirmButton: false
    });
    let marketplaceCall, marketplaceArguments;
    if (contractData.diamond) {
      marketplaceCall = diamondMarketplaceInstance?.buyMintingOffer;
      marketplaceArguments = [
        offerIndex, // Offer Index
        selectedToken // Token Index
      ];
    } else {
      marketplaceCall = minterInstance?.buyToken;
      marketplaceArguments = [
        offerPool, // Catalog Index
        offerIndex, // Range Index
        selectedToken // Internal Token Index
      ];
    }
    marketplaceArguments.push({ value: price });
    if (
      await metamaskCall(
        marketplaceCall(...marketplaceArguments),
        'Sorry your transaction failed! When several people try to buy at once - only one transaction can get to the blockchain first. Please try again!'
      )
    ) {
      Swal.fire('Success', 'Now, you are the owner of this token', 'success');
    }
  };

  const openModal = useCallback(() => {
    setModalIsOpen(true);
  }, [setModalIsOpen]);

  const openHelp = useCallback(() => {
    setModalHelp((prev) => !prev);
  }, []);

  const closeModal = useCallback(() => {
    setModalIsOpen(false);
    setOpenVideoplayer(false);
  }, [setModalIsOpen]);

  const goToCollectionView = () => {
    navigate(
      `/collection/${contractData?.blockchain}/${contractData?.contractAddress}/${mediaList[item]?.product}/0`
    );
  };

  const goToUnlockView = () => {
    navigate(
      `/unlockables/${contractData?.blockchain}/${contractData?.contractAddress}/${mediaList[item]?.product}/0`
    );
  };

  const getInfo = useCallback(async () => {
    if (mediaList && item) {
      const { contract } = await rFetch(
        `/api/v2/contracts/${mediaList[item].contract}`
      );
      try {
        const tokensrResp = await axios.get(
          `/api/nft/network/${contract?.blockchain}/${contract?.contractAddress}/${mediaList[item]?.product}`
          // `/api/${mediaList[item].contract}/${mediaList[item]?.product}`
        );

        contract.tokens = tokensrResp.data.result.tokens;
        // contract.products = productsResp.data.product;
      } catch (err) {
        console.error(err);
      }

      setContractData(contract);
    }
  }, [mediaList, item, setContractData]);

  const getInfoUser = useCallback(async () => {
    if (mediaList && item && contractData) {
      const response = await axios.get<TUserResponse>(
        `/api/users/${mediaList[item].authorPublicAddress}`
        // `/api/users/${data.data.result.contract.user}`
      );
      setDataUser(response.data.user);
    }
  }, [mediaList, item, contractData, setDataUser]);

  const arrAllTokens = () => {
    if (contractData) {
      availableToken = contractData?.tokens
        .filter((availableToken) => availableToken.isMinted === false)
        .slice(0, 7);
      return availableToken;
    } else {
      return (
        <div className="ol">we do not have any tokens available for sale</div>
      );
    }
  };
  arrAllTokens();
  //TODO: use in a future
  // const sortRevers = () => {
  //   console.info(data?.tokens.reverse(), 'sort');
  // };

  useEffect(() => {
    getInfo();
  }, [getInfo]);

  useEffect(() => {
    getInfoUser();
  }, [getInfoUser]);

  useEffect(() => {
    closeModal();
  }, [closeModal]);

  return (
    <button
      className="text-start video-wrapper unlockable-video"
      style={{
        // height: '215px',
        // width: '384px',
        border: 'none',
        backgroundColor: 'transparent'
        // marginBottom: '24px',
        // marginRight: '24px'
      }}
      // onClick={() => {
      // setIsOpen(true);
      // openModal();
      // navigate(
      //   `/watch/${mediaList[item]._id}/${mediaList[item].mainManifest}`
      // );
      // }}
      onMouseEnter={() => setHovering(mediaList[item].animatedThumbnail !== '')}
      onMouseLeave={() => setHovering(false)}>
      <div
        onClick={() => openModal()}
        className="col-12 rounded"
        style={{
          top: 0,
          position: 'relative',
          height: '100%',
          width: 'inherit'
        }}>
        <img
          alt="Video thumbnail"
          src={`${mediaList[item].staticThumbnail}`}
          style={{
            position: 'absolute',
            bottom: 0,
            borderRadius: '16px',
            // objectFit: 'contain',
            background: 'black'
          }}
          className="col-12 h-100 w-100"
        />
        <img
          alt="Animated video thumbnail"
          src={`${mediaList[item].animatedThumbnail}`}
          style={{
            position: 'absolute',
            display: hovering ? 'block' : 'none',
            bottom: 0,
            borderRadius: '16px',
            background: 'black'
          }}
          className="col-12  h-100 w-100"
        />
        {mediaList[item]?.isUnlocked ? (
          <SvgKey color={'#4E4D4D'} bgColor={'white'} />
        ) : (
          <SvgLock color={'white'} />
        )}
      </div>
      <div className="col description-wrapper-video">
        <span className="description-title">
          {mediaList[item].title.slice(0, 25)}
          {mediaList[item].title.length > 26 ? '...' : ''}
        </span>
        <div className="info-wrapper video-size">
          <div className="user-info">
            <div className="user-image">
              <img
                src={dataUser?.avatar ? dataUser?.avatar : ''}
                alt="User Avatar"
              />
            </div>
            <div className="user-name">
              <span>
                {dataUser?.nickName.slice(0, 25)}
                {dataUser?.nickName.length > 26 ? '...' : ''}
              </span>
            </div>
          </div>
          <div className="price-info">
            <div className="price-total">
              <span className="duration-for-video">
                {' '}
                {mediaList[item].duration}
              </span>
            </div>
          </div>
        </div>
        <br />
        <>
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Video Modal">
            <div className="modal-content-wrapper-for-video">
              <div className="modal-content-video">
                {mediaList[item]?.isUnlocked === false && !owned ? (
                  <>
                    <i
                      data-title="You need to buy NFT"
                      className="fa fa-lock modal-content-video-lock"
                    />
                  </>
                ) : openVideoplayer ? (
                  <NftVideoplayer selectVideo={mediaList[item]} />
                ) : (
                  <>
                    <img
                      onClick={() => setOpenVideoplayer(true)}
                      className={'modal-content-play-image'}
                      src={playImagesColored}
                      alt="Button play video"
                    />
                  </>
                )}
                {openVideoplayer ? (
                  <></>
                ) : (
                  <img
                    alt="Modal content video thumbnail"
                    src={`${mediaList[item].staticThumbnail}`}
                    className="modal-content-video-thumbnail"
                  />
                )}
              </div>
              <div className="modal-content-video-choice">
                <div className="modal-content-close-btn-wrapper">
                  {/* <button
                    className="modal-content-close-btn"
                    onClick={closeModal}>
                    <i className="fas fa-times"></i>
                  </button> */}
                  <ModalContentCloseBtn
                    primaryColor={primaryColor}
                    onClick={closeModal}>
                    <i className="fas fa-times" />
                  </ModalContentCloseBtn>
                </div>
                <div className="modal-content-block-btns">
                  {mediaList[item]?.isUnlocked === false && (
                    <div className="modal-content-block-buy">
                      <img
                        src={contractData?.tokens[0]?.metadata?.image}
                        alt="NFT token powered by Rair tech"
                      />
                      <CustomButton
                        text={'Buy now'}
                        width={'232px'}
                        height={'48px'}
                        textColor={
                          primaryColor === 'rhyno' ? '#222021' : 'white'
                        }
                        onClick={openHelp}
                        margin={'0 45px 37px'}
                        custom={true}
                      />
                    </div>
                  )}
                  <CustomButton
                    text={'View more NFTs'}
                    width={'208px'}
                    height={'48px'}
                    textColor={primaryColor === 'rhyno' ? '#222021' : 'white'}
                    onClick={goToCollectionView}
                    margin={'0 45px 18px'}
                    custom={false}
                  />
                  <CustomButton
                    text={'More unlockables'}
                    width={'208px'}
                    height={'48px'}
                    textColor={primaryColor === 'rhyno' ? '#222021' : 'white'}
                    onClick={goToUnlockView}
                    margin={'0'}
                    custom={false}
                  />
                </div>
              </div>
            </div>
            {modalHelp && (
              <div className="more-info-wrapper">
                <span className="more-info-text">
                  These NFTs unlock this video
                </span>
                {/* <button onClick={() => sortRevers()}>Reverse displaying</button> */}
                <div className="more-info">
                  {availableToken.length > 0 ? (
                    availableToken.map((token) => {
                      return (
                        <div
                          key={token._id}
                          className="more-info-unlock-wrapper">
                          <img
                            src={token.metadata.image}
                            alt="NFT token powered by Rair Tech"
                          />
                          <CustomButton
                            text={
                              token.offer.price +
                              ' ' +
                              chainData[contractData?.blockchain]?.symbol
                            }
                            width={'auto'}
                            height={'45px'}
                            textColor={'white'}
                            onClick={() => {
                              buy({
                                offerIndex: token.offer.offerIndex,
                                selectedToken: token.token,
                                price: token.offer.price
                              });
                            }}
                            margin={'0'}
                            custom={true}
                          />
                        </div>
                      );
                    })
                  ) : (
                    <span className="more-info-text">
                      In this collection we don&apos;t have any tokens available
                      for sale, sorry.
                    </span>
                  )}
                </div>
              </div>
            )}
          </Modal>
        </>
      </div>
    </button>
  );
};

export default VideoItem;
