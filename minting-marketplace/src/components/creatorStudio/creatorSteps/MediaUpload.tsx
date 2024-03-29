import React, { useCallback, useEffect, useState } from 'react';
import Dropzone from 'react-dropzone';
import { useSelector } from 'react-redux';
import { utils } from 'ethers';

import MediaUploadRow from './MediaUploadRow';

import WorkflowContext from '../../../contexts/CreatorWorkflowContext';
import { RootState } from '../../../ducks';
import { ColorStoreType } from '../../../ducks/colors/colorStore.types';
import videoIcon from '../../../images/videoIcon.svg';
import chainData from '../../../utils/blockchainData';
import { validateInteger } from '../../../utils/metamaskUtils';
import { rFetch } from '../../../utils/rFetch';
import { OptionsType } from '../../common/commonTypes/InputSelectTypes.types';
import { TOfferType } from '../../marketplace/marketplace.types';
import { IMediaUpload, TCategories, TMediaType } from '../creatorStudio.types';

const MediaUpload: React.FC<IMediaUpload> = ({
  setStepNumber,
  contractData,
  stepNumber
}) => {
  const { primaryColor } = useSelector<RootState, ColorStoreType>(
    (store) => store.colorStore
  );

  const [mediaList, setMediaList] = useState<TMediaType[]>([]);
  const [offerList, setOfferList] = useState<OptionsType[]>([]);
  const [forceRerender, setForceRerender] = useState<boolean>(false);
  const [categoryArray, setCategoryArray] = useState<OptionsType[]>([]);
  const getCategories = useCallback(async () => {
    const { success, categories } = await rFetch('/api/categories');
    if (success) {
      setCategoryArray(
        categories.map((item: TCategories) => {
          return { label: item.name, value: item.name };
        })
      );
    }
  }, []);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  useEffect(() => {
    const unlocked: OptionsType[] = [
      {
        label: 'Unlocked',
        value: '-1'
      }
    ];

    setOfferList(
      contractData?.product?.offers
        ? unlocked.concat(
            contractData?.product?.offers.map((item: TOfferType) => {
              return {
                label: `${item.offerName} (${
                  Number(item.range[1]) - Number(item.range[0]) + 1
                } tokens for ${utils
                  .formatEther(
                    validateInteger(+item.price) ? item.price.toString() : 0
                  )
                  .toString()} ${
                  chainData[contractData.blockchain]?.symbol
                } each)`,
                value: contractData.diamond
                  ? item.diamondRangeIndex
                  : item.offerIndex
              };
            })
          )
        : []
    );
  }, [contractData]);

  const onMediaDrop = (media) => {
    let aux: TMediaType[] = [...mediaList];
    aux = aux.concat(
      media.map((item: File) => {
        return {
          offer: 'null',
          category: 'null',
          title: item.name.slice(0, 29),
          file: item,
          description: '',
          preview: URL.createObjectURL(item),
          contractAddress: contractData?._id,
          productIndex: contractData?.product.collectionIndexInContract,
          storage: 'null'
        };
      })
    );
    setMediaList(aux);
  };

  const deleter = (index: number) => {
    const aux = [...mediaList];
    aux.splice(index, 1);
    setMediaList(aux);
  };

  useEffect(() => {
    setStepNumber(stepNumber);
  }, [setStepNumber, stepNumber]);

  return (
    <div className="col-12 mb-5">
      <div className="rounded-rair col-12 mb-3">
        <Dropzone onDrop={onMediaDrop}>
          {({ getRootProps, getInputProps, isDragActive }) => (
            <section>
              <div
                {...getRootProps()}
                style={{
                  border: 'dashed 1px var(--charcoal-80)',
                  position: 'relative'
                }}
                className="w-100 h-100 rounded-rair col-6 text-center mb-3 p-5">
                <input {...getInputProps()} />
                <img
                  alt=""
                  style={{
                    filter:
                      primaryColor === 'rhyno' ? 'brightness(40%)' : undefined
                  }}
                  src={videoIcon}
                  className="mt-5 mb-3"
                />
                <br />
                {isDragActive ? (
                  <>Drop the images here ...</>
                ) : (
                  <>
                    Drag and drop or{' '}
                    <span style={{ color: 'var(--bubblegum)' }}>click</span> to
                    upload unlockable content
                  </>
                )}
              </div>
            </section>
          )}
        </Dropzone>
      </div>
      {mediaList.map((item, index, array) => {
        return (
          <MediaUploadRow
            key={index}
            item={item}
            index={index}
            array={array}
            categoriesArray={categoryArray}
            deleter={() => deleter(index)}
            offerList={offerList}
            rerender={() => setForceRerender(!forceRerender)}
          />
        );
      })}
    </div>
  );
};

const ContextWrapper = (props: IMediaUpload) => {
  return (
    <WorkflowContext.Consumer>
      {(value) => {
        return <MediaUpload {...value} {...props} />;
      }}
    </WorkflowContext.Consumer>
  );
};

export default ContextWrapper;
