import styled from 'styled-components';

import { ILazyImageItem } from '../types/imageLazy.types';

export const Image = styled.img<ILazyImageItem>`
  &.col-12.h-100.w-100 {
    display: block;
    height: ${(props) => props.height && props.height};
    width: ${(props) => props.width && props.width};
    position: absolute;
    bottom: 0;
    border-radius: 16px;
    object-fit: contain;
  }
  @keyframes loaded {
    0% {
      opacity: 0.1;
    }
    100% {
      opacity: 1;
    }
  }
  &.loaded:not(.has-error) {
    animation: loaded 300ms ease-in-out;
  }
  &.has-error {
    max-width: -webkit-fill-available;
    content: url('https://rair.mypinata.cloud/ipfs/QmNtfjBAPYEFxXiHmY5kcPh9huzkwquHBcn9ZJHGe7hfaW');
  }
`;
