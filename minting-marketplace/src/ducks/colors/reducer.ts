import {
  ColorStoreActionsType,
  ColorStoreType,
  SchemaType
} from './colorStore.types';
import * as types from './types';

import { headerLogoBlackMobile, headerLogoWhiteMobile } from '../../images';
import { headerLogoBlack, headerLogoWhite } from '../../images';
import { bgLogoBlack, bgLogoWhite } from '../../images';

const schemes: SchemaType = {
  rhyno: {
    primaryColor: 'rhyno',
    secondaryColor: 'charcoal',
    headerLogo: headerLogoBlack,
    headerLogoMobile: headerLogoBlackMobile,
    textColor: 'black',
    backgroundImage: bgLogoWhite,
    backgroundImageEffect: { backgroundBlendMode: undefined }
  },
  charcoal: {
    primaryColor: 'charcoal',
    secondaryColor: 'rhyno',
    headerLogo: headerLogoWhite,
    headerLogoMobile: headerLogoWhiteMobile,
    textColor: 'white',
    backgroundImage: bgLogoBlack,
    backgroundImageEffect: { backgroundBlendMode: 'lighten' }
  }
};

const InitialColorScheme: ColorStoreType =
  schemes[localStorage.colorScheme ? localStorage.colorScheme : 'charcoal'];

export default function colorStore(
  state: ColorStoreType = InitialColorScheme,
  action: ColorStoreActionsType
): ColorStoreType {
  switch (action.type) {
    case types.SET_COLOR_SCHEME:
      localStorage.setItem('colorScheme', action.colorScheme);
      return {
        ...state,
        ...schemes[action.colorScheme]
      };
    default:
      return state;
  }
}
