import React from 'react';
import Carousel from 'react-multi-carousel';

import { ImageLazy } from '../../../MockUpPage/ImageLazy/ImageLazy';
import {
  ICarouselItem,
  ICarouselListItem,
  ICarouselModule
} from '../../splashPage.types';

import './Carousel.css';

const CarouselListItem: React.FC<ICarouselListItem> = (props) => {
  const { carouselItemTitle, carouselItemImg, carouselDescription } = props;
  return (
    <div className="join-pic-list">
      {carouselItemTitle && (
        <h4 className="carousel-items"> {carouselItemTitle} </h4>
      )}
      <ImageLazy
        className="join-pic-img"
        src={carouselItemImg}
        alt="Join to community"
      />
      {carouselDescription && (
        <h6 className="carousel-description">{carouselDescription}</h6>
      )}
    </div>
  );
};

const CarouselItem: React.FC<ICarouselItem> = (props) => {
  const { carouselItemTitle, carouselItemImg, carouselDescription } = props;
  return (
    <div className="join-pic-carousel">
      {carouselItemTitle && (
        <h4 className="carousel-items"> {carouselItemTitle} </h4>
      )}
      <ImageLazy
        className="join-pic-img"
        src={carouselItemImg}
        alt="Join to community"
      />
      {carouselDescription && (
        <h6 className="carousel-description">{carouselDescription}</h6>
      )}
    </div>
  );
};

const CarouselModule: React.FC<ICarouselModule> = (props) => {
  const { carousel, carouselTitle, carouselData } = props;

  const responsive = {
    mobile: {
      breakpoint: { max: 900, min: 0 },
      items: 1
    }
  };

  return (
    <div className="carousel-container">
      <h2 className="carousel-title"> {carouselTitle} </h2>
      {carousel ? (
        <Carousel
          showDots={false}
          infinite={true}
          responsive={responsive}
          className="carousel">
          {carouselData?.map((row, index) => (
            <CarouselItem
              key={index}
              carouselItemTitle={row.title}
              carouselItemImg={row.img}
              carouselDescription={row.description}
            />
          ))}
        </Carousel>
      ) : (
        <div className="carousel-list">
          {carouselData?.map((row, index) => (
            <CarouselListItem
              key={index}
              carouselItemTitle={row.title}
              carouselItemImg={row.img}
              carouselDescription={row.description}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CarouselModule;
