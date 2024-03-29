import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Swal from 'sweetalert2';
import videojs from 'video.js';

import { IVideoPlayer } from './video.types';

import {
  TAuthGetChallengeResponse,
  TOnlySuccessResponse
} from '../../axios.responseTypes';
import { RootState } from '../../ducks';
import { ContractsInitialType } from '../../ducks/contracts/contracts.types';
import setDocumentTitle from '../../utils/setTitle';

const VideoPlayer: React.FC<IVideoPlayer> = ({
  mediaId,
  mainManifest = 'stream.m3u8',
  baseURL,
  setProcessDone = () => false
}) => {
  const { programmaticProvider, currentUserAddress } = useSelector<
    RootState,
    ContractsInitialType
  >((state) => state.contractStore);
  const [videoName] = useState(Math.round(Math.random() * 10000));
  const [mediaAddress, setMediaAddress] = useState<string>(
    `${baseURL}${mediaId}`
  );

  //https://storage.googleapis.com/rair-videos/
  //https://rair.mypinata.cloud/ipfs/

  const requestChallenge = useCallback(async () => {
    setProcessDone(true);
    let signature;
    let parsedResponse;
    if (window.ethereum) {
      let account = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      if (account) {
        account = account[0];
      }
      const response = await axios.post<TAuthGetChallengeResponse>(
        '/api/auth/get_challenge/',
        {
          userAddress: currentUserAddress,
          intent: 'decrypt',
          mediaId
        }
      );
      parsedResponse = JSON.parse(response.data.response);
      signature = await window.ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [account, response.data.response],
        from: account
      });
    } else if (programmaticProvider) {
      const response = await axios.get<TAuthGetChallengeResponse>(
        '/api/auth/get_challenge/' + programmaticProvider.address
      );
      parsedResponse = JSON.parse(response.data.response);
      const { /*EIP712Domain,*/ ...revisedTypes } = parsedResponse.types;
      signature = await programmaticProvider._signTypedData(
        parsedResponse.domain,
        revisedTypes,
        parsedResponse.message
      );
    } else {
      Swal.fire('Error', 'Unable to decrypt videos', 'error');
      return;
    }
    try {
      const streamAddress = await axios.get<TOnlySuccessResponse>(
        '/api/auth/get_token/' +
          parsedResponse.message.challenge +
          '/' +
          signature +
          '/' +
          mediaId
      );
      if (streamAddress.data.success) {
        await setMediaAddress('/stream/' + mediaId + '/' + mainManifest);
        setTimeout(() => {
          videojs('vjs-' + videoName);
        }, 1000);
        setProcessDone(false);
      } else {
        console.error(streamAddress);
        Swal.fire('NFT required to view this content');
        setProcessDone(false);
      }
    } catch (error) {
      Swal.fire('NFT required to view this content');

      setProcessDone(false);
    }
  }, [setProcessDone, programmaticProvider, mediaId, mainManifest, videoName]);

  useEffect(() => {
    requestChallenge();
    return () => {
      setMediaAddress('');
    };
  }, [requestChallenge]);

  useEffect(() => {
    setDocumentTitle('Streaming');
  }, [videoName]);

  useEffect(() => {
    return () => {
      axios.get('/api/auth/stream/out');
    };
  }, [videoName]);

  if (mediaAddress === '') {
    return <></>;
  }

  return (
    <>
      <div className="col-12 row mx-0 bg-secondary h1">
        <video
          id={'vjs-' + videoName}
          className="video-js vjs-16-9"
          controls
          preload="auto"
          data-setup="{}">
          <source src={mediaAddress} type="application/x-mpegURL" />
        </video>
      </div>
    </>
  );
};

export default VideoPlayer;
