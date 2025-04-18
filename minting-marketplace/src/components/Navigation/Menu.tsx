import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ethers, utils } from 'ethers';

import { TUserResponse } from '../../axios.responseTypes';
import { RootState } from '../../ducks';
import { getTokenComplete } from '../../ducks/auth/actions';
import { ColorStoreType } from '../../ducks/colors/colorStore.types';
import { setUserAddress } from '../../ducks/contracts/actions';
import { UserType } from '../../ducks/users/users.types';
import { BellIcon, CloseIconMobile, MenuIcon } from '../../images';
import {
  SocialBox,
  SocialMenuMobile,
  UserIconMobile
} from '../../styled-components/SocialLinkIcons/SocialLinkIcons';
import { OnboardingButton } from '../common/OnboardingButton/OnboardingButton';
import { SvgUserIcon } from '../UserProfileSettings/SettingsIcons/SettingsIcons';

import MobileChoiseNav from './MenuComponents/MobileChoiseNav';
import MobileListMenu from './MenuComponents/MobileListMenu';
import MobileProfileInfo from './MenuComponents/MobileProfileInfo';
import {
  MenuMobileWrapper,
  Nav,
  RightSideMenu
} from './NavigationItems/NavigationItems';

import './Menu.css';

interface IMenuNavigation {
  connectUserData: () => void;
  startedLogin: boolean;
  renderBtnConnect: boolean;
  loginDone: boolean;
  setLoginDone: (arg: boolean) => void;
  currentUserAddress: string | undefined;
  programmaticProvider:
    | ethers.Wallet
    | ethers.providers.JsonRpcSigner
    | undefined;
  showAlert: boolean | null | undefined;
  selectedChain: string | null | undefined;
  setTabIndexItems: (arg: number) => void;
  isSplashPage: boolean;
}

const MenuNavigation: React.FC<IMenuNavigation> = ({
  connectUserData,
  startedLogin,
  renderBtnConnect,
  loginDone,
  setLoginDone,
  currentUserAddress,
  programmaticProvider,
  showAlert,
  selectedChain,
  setTabIndexItems,
  isSplashPage
}) => {
  const [click, setClick] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [openProfile, setOpenProfile] = useState<boolean>(false);
  // const [loading, setLoading] = useState<boolean>(false);
  const [activeSearch, setActiveSearch] = useState(false);
  const [messageAlert, setMessageAlert] = useState<string | null>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { primaryColor } = useSelector<RootState, ColorStoreType>(
    (store) => store.colorStore
  );

  const handleMessageAlert = (pageNav: string) => {
    setMessageAlert(pageNav);
  };

  const handleActiveSearch = () => {
    setActiveSearch((prev) => !prev);
  };

  const toggleMenu = (otherPage?: string | undefined) => {
    if (otherPage === 'nav') {
      setClick(true);
      if (!click) {
        document.body.classList.add('no-scroll');
      } else {
        document.body.classList.remove('no-scroll');
      }
    } else {
      setClick((prev) => !prev);
      if (!click) {
        document.body.classList.add('no-scroll');
        setMessageAlert(null);
        setActiveSearch(false);
      } else {
        setMessageAlert(null);
        document.body.classList.remove('no-scroll');
      }
    }
  };

  const toggleOpenProfile = useCallback(() => {
    setOpenProfile((prev) => !prev);
  }, [setOpenProfile]);

  const logout = () => {
    dispatch(getTokenComplete(null));
    dispatch(setUserAddress(undefined));
    navigate('/');
    localStorage.removeItem('token');
    setLoginDone(false);
    toggleMenu();
  };

  const getInfoFromUser = useCallback(async () => {
    // find user
    if (currentUserAddress && utils.isAddress(currentUserAddress)) {
      const result = await axios
        .get<TUserResponse>(`/api/users/${currentUserAddress}`)
        .then((res) => {
          setUserData(null);
          // setLoading(true);
          return res.data;
        });
      if (result.success) {
        // setLoading(false);
        setUserData(result.user);
      }
    }
  }, [currentUserAddress, setUserData]);

  const onScrollClick = useCallback(() => {
    if (!click) {
      document.body.style.overflow = 'unset';
    }
  }, [click]);

  useEffect(() => {
    onScrollClick();
  }, [onScrollClick]);

  useEffect(() => {
    getInfoFromUser();
  }, [getInfoFromUser]);

  return (
    <MenuMobileWrapper
      className="col-1 rounded burder-menu"
      showAlert={showAlert}
      selectedChain={selectedChain}
      isSplashPage={isSplashPage}>
      <Nav primaryColor={primaryColor}>
        <MobileChoiseNav
          click={click}
          messageAlert={messageAlert}
          currentUserAddress={currentUserAddress}
          handleMessageAlert={handleMessageAlert}
          activeSearch={activeSearch}
          handleActiveSearch={handleActiveSearch}
        />
        {openProfile ? (
          <Suspense fallback={<h1>Loading profile...</h1>}>
            <MobileProfileInfo
              primaryColor={primaryColor}
              click={click}
              toggleOpenProfile={toggleOpenProfile}
              userData={userData}
            />
          </Suspense>
        ) : (
          <MobileListMenu
            primaryColor={primaryColor}
            click={click}
            toggleMenu={toggleMenu}
            logout={logout}
            activeSearch={activeSearch}
            messageAlert={messageAlert}
            setMessageAlert={setMessageAlert}
            setTabIndexItems={setTabIndexItems}
          />
        )}
        <RightSideMenu>
          <div>
            {!loginDone ? (
              <div>
                {renderBtnConnect ? (
                  <OnboardingButton />
                ) : (
                  <button
                    disabled={
                      !window.ethereum && !programmaticProvider && !startedLogin
                    }
                    className={`btn btn-${primaryColor} btn-connect-wallet-mobile`}
                    onClick={connectUserData}>
                    {startedLogin ? 'Please wait...' : 'Connect'}
                  </button>
                )}
              </div>
            ) : (
              <div className="social-media">
                {!messageAlert && (
                  <>
                    <SocialBox
                      onClick={() => {
                        handleMessageAlert('notification');
                        toggleMenu('nav');
                      }}
                      className="social-bell-icon"
                      width="40px"
                      height="40px"
                      marginRight={'17px'}>
                      <BellIcon primaryColor={primaryColor} />
                    </SocialBox>
                    <UserIconMobile
                      onClick={() => {
                        handleMessageAlert('profile');
                        toggleMenu('nav');
                      }}
                      avatar={userData && userData.avatar}
                      marginRight={'16px'}
                      messageAlert={messageAlert}
                      primaryColor={primaryColor}>
                      {userData && !userData.avatar && (
                        <SvgUserIcon width={'22.5px'} height={'22.5px'} />
                      )}
                    </UserIconMobile>
                  </>
                )}
              </div>
            )}
          </div>
          {click ? (
            <SocialMenuMobile primaryColor={primaryColor} onClick={toggleMenu}>
              <CloseIconMobile primaryColor={primaryColor} />
            </SocialMenuMobile>
          ) : (
            <SocialMenuMobile
              primaryColor={primaryColor}
              onClick={() => {
                toggleMenu();
                setOpenProfile(false);
              }}>
              <MenuIcon primaryColor={primaryColor} />
            </SocialMenuMobile>
          )}
        </RightSideMenu>
      </Nav>
    </MenuMobileWrapper>
  );
};

export default MenuNavigation;
