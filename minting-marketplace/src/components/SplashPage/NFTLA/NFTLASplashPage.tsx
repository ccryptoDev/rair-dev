//@ts-nocheck
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { teamNFTLAarray } from './AboutUsTeam';

import { TFileType } from '../../../axios.responseTypes';
import { RootState } from '../../../ducks';
import { ColorChoice } from '../../../ducks/colors/colorStore.types';
import { setInfoSEO } from '../../../ducks/seo/actions';
import { DocumentIcon } from '../../../images';
import { discrodIconNoBorder } from '../../../images';
import VideoPlayerView from '../../MockUpPage/NftList/NftData/UnlockablesPage/VideoPlayerView';
import { TVideoPlayerViewSpecialVideoType } from '../../MockUpPage/NftList/nftList.types';
import MetaTags from '../../SeoTags/MetaTags';
/* importing images*/
import { NFTLA1, NFTLA1_rounded, NFTLA2, NFTLA3 } from '../images/NFTLA/nftLA';
import NotCommercialTemplate from '../NotCommercial/NotCommercialTemplate';
import {
  ISplashPageProps,
  TNftLaSelectedVideo,
  TSplashDataType
} from '../splashPage.types';
import AuthorCard from '../SplashPageTemplate/AuthorCard/AuthorCard';
import CarouselModule from '../SplashPageTemplate/Carousel/Carousel';
import VideoPlayerModule from '../SplashPageTemplate/VideoPlayer/VideoPlayerModule';
/* importing Components*/
import TeamMeet from '../TeamMeet/TeamMeetList';

import NFTfavicon from './../images/favicons/NFT_favicon.ico';
import NFTLA_Video from './../images/NFTLA/NFT-LA-RAIR-2021.mp4';

import './../SplashPageTemplate/AuthorCard/AuthorCard.css';
import './../../AboutPage/AboutPageNew/AboutPageNew.css';
import './../SplashPageTemplate/AuthorCard/AuthorCard.css';
import './../../AboutPage/AboutPageNew/AboutPageNew.css';

//TODO:Until we have a contract it will be commented
// import { TNftFilesResponse } from '../../axios.responseTypes';
// import axios from 'axios';

// Google Analytics
//const TRACKING_ID = 'UA-209450870-5'; // YOUR_OWN_TRACKING_ID
//ReactGA.initialize(TRACKING_ID);

const splashData: TSplashDataType = {
  title: '#NFTLA',
  titleColor: '#A4396F',
  description:
    'Connect with Metamask for your free NFT airdrop and access exclusive streaming content from our event!',
  backgroundImage: NFTLA1_rounded,
  button1: {
    buttonColor: '#A4396F',
    buttonLabel: 'Submit with Form',
    buttonImg: DocumentIcon,
    buttonLink:
      'https://docs.google.com/forms/d/e/1FAIpQLSeMAtvf2DOMrB05M1lH8ruvKsawEWNqWQOM-1EsQ4w59Nv71A/viewform'
  },
  button2: {
    buttonColor: '#E6B4A2',
    buttonLabel: 'Join Our Discord',
    buttonImg: discrodIconNoBorder,
    buttonLink: 'https://discord.com/invite/y98EMXRsCE'
  },
  NFTName: 'NFT art',
  carouselTitle: '3 Unique Styles',
  carouselData: [
    {
      title: 'Horizon',
      img: NFTLA2,
      description: null
    },
    {
      title: 'Dark',
      img: NFTLA3,
      description: null
    },
    {
      title: 'Palm',
      img: NFTLA1,
      description: null
    }
  ],
  videoData: {
    video: NFTLA_Video,
    videoTitle: 'NFT LA',
    videoModuleDescription:
      'Want to learn more about the project? Only NFT owners get access to exclusive streaming content. Connect with Metamask and get yours today!',
    videoModuleTitle: 'Preview',
    demo: true
  },
  videoTilesTitle: 'NFTLA',
  videoArr: [
    {
      videoName: 'Welcome to NFTLA',
      videoType: 'NFTLA-EXCLUSIVE-1',
      videoTime: '00:00:26',
      videoSRC: NFTLA_Video,
      demo: true
    },
    {
      videoName: 'NFTs and Hollywood',
      videoType: 'NFTLA-EXCLUSIVE-2',
      videoTime: '02:21.38',
      videoSRC: null,
      baseURL: 'https://storage.googleapis.com/rair-videos/',
      mediaId: 'YOyAaCOt8xrOt-NcvffXR7g0ibX5kJ2w21yGHR1XKOPMEY'
    },
    {
      videoName: 'Orange Comet',
      videoType: 'NFTLA-EXCLUSIVE-3',
      videoTime: '32:00.58',
      videoSRC: null,
      baseURL: 'https://storage.googleapis.com/rair-videos/',
      mediaId: 'Zosxmne0LRAu2TxEMU5A0WMg8-msfHqvxGws9osGnu4yxL'
    },
    {
      videoName: 'Web 3 Convergence',
      videoType: 'NFTLA-EXCLUSIVE-4',
      videoTime: '30:46.31',
      videoSRC: null,
      baseURL: 'https://storage.googleapis.com/rair-videos/',
      mediaId: 'pZJJmq9rR6HC1jPxy-RpVvutfTYMtyAGRb2DDnMdTTIlhA'
    }
  ]
};

const NFTLASplashPage: React.FC<ISplashPageProps> = ({ setIsSplashPage }) => {
  const dispatch = useDispatch();
  const seo = useSelector<RootState, TInfoSeo>((store) => store.seoStore);
  const [selectVideo, setSelectVideo] = useState<TNftLaSelectedVideo | {}>({});
  // TODO: Until we have a contract it will be commented
  const [allVideos /*setAllVideos*/] = useState<TFileType[]>([]);
  const primaryColor = useSelector<RootState, ColorChoice>(
    (store) => store.colorStore.primaryColor
  );
  const carousel_match = window.matchMedia('(min-width: 900px)');
  const [carousel, setCarousel] = useState(carousel_match.matches);
  window.addEventListener('resize', () => setCarousel(carousel_match.matches));

  const whatSplashPage = 'nftla-page';

  const someAdditionalData: TVideoPlayerViewSpecialVideoType[] = [
    {
      urlVideo: 'https://storage.googleapis.com/rair-videos/',
      mediaIdVideo: 'YOyAaCOt8xrOt-NcvffXR7g0ibX5kJ2w21yGHR1XKOPMEY',
      videoTime: '02:21.38',
      videoName: 'NFTs and Hollywood',
      VideoBg: NFTLA1
    },
    {
      urlVideo: 'https://storage.googleapis.com/rair-videos/',
      mediaIdVideo: 'Zosxmne0LRAu2TxEMU5A0WMg8-msfHqvxGws9osGnu4yxL',
      videoTime: '32:00.58',
      videoName: 'Orange Comet',
      VideoBg: NFTLA2
    },
    {
      urlVideo: 'https://storage.googleapis.com/rair-videos/',
      mediaIdVideo: 'pZJJmq9rR6HC1jPxy-RpVvutfTYMtyAGRb2DDnMdTTIlhA',
      videoTime: '30:46.31',
      videoName: 'Web 3 Convergence',
      VideoBg: NFTLA3
    }
  ];

  useEffect(() => {
    dispatch(
      setInfoSEO({
        title: 'Official NFTLA Streaming NFTs',
        ogTitle: 'Official NFTLA Streaming NFTs',
        twitterTitle: 'Official NFTLA Streaming NFTs',
        contentName: 'author',
        content: '#NFTLA',
        description:
          'Claim your NFT to unlock encrypted streams from the NFTLA conference',
        ogDescription:
          'Claim your NFT to unlock encrypted streams from the NFTLA conference',
        twitterDescription:
          'Claim your NFT to unlock encrypted streams from the NFTLA conference',
        image:
          'https://rair.mypinata.cloud/ipfs/QmNtfjBAPYEFxXiHmY5kcPh9huzkwquHBcn9ZJHGe7hfaW',
        favicon: NFTfavicon,
        faviconMobile: NFTfavicon
      })
    );
    //eslint-disable-next-line
  }, []);

  //temporarily unused-snippet
  // const getAllVideos = useCallback(async () => {
  //   const response = await axios.get<TNftFilesResponse>(
  //     '/api/nft/network/neededBlockchain/neededContract/indexInContract/files'
  //   );
  //   setAllVideos(response.data.files);
  //   setSelectVideo(response.data.files[0]);
  // }, []);

  // useEffect(() => {
  //   getAllVideos();
  // }, [getAllVideos]);

  useEffect(() => {
    setIsSplashPage?.(true);
  }, [setIsSplashPage]);

  return (
    <div className="wrapper-splash-page">
      <MetaTags seoMetaTags={seo} />
      <div className="template-home-splash-page">
        <AuthorCard splashData={splashData} />
        <CarouselModule
          carousel={!carousel}
          carouselTitle={splashData.carouselTitle}
          carouselData={splashData.carouselData}
        />
        <VideoPlayerModule
          backgroundImage={splashData.backgroundImage}
          videoData={splashData.videoData}
        />
        <div className="unlockable-video">
          <div className="title-gets">
            <h3> NFTLA </h3>
          </div>
          <div className="block-videos">
            <VideoPlayerView
              productsFromOffer={allVideos}
              primaryColor={primaryColor}
              selectVideo={selectVideo}
              setSelectVideo={setSelectVideo}
              whatSplashPage={whatSplashPage}
              someAdditionalData={someAdditionalData}
            />
          </div>
        </div>
        <TeamMeet
          arraySplash={'NFTLA'}
          titleHeadFirst={'About'}
          teamArray={teamNFTLAarray}
        />
        <NotCommercialTemplate
          primaryColor={primaryColor}
          NFTName={splashData.NFTName}
        />
      </div>
    </div>
  );
};

export default NFTLASplashPage;
