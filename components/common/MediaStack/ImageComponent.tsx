import Image from "next/image";
import styled from "styled-components";
import { MediaType } from "../../../shared/types/types";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";

const ImageComponentWrapper = styled.div`
  position: relative;
  overflow: hidden;
  background: var(--colour-cream);

  mux-player,
  img {
    display: block;
    object-fit: cover;
  }
`;

const MotionDivBase = styled(motion.div)`
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
`;

const InnerBlurWrapper = styled(MotionDivBase)`
  z-index: 2;
`;

const InnerMainImageWrapper = styled(MotionDivBase)`
  z-index: 1;
`;

const placeholderVariants = {
  visible: {
    opacity: 1,
    filter: "blur(15px)",
    scale: 1,
  },

  exit: {
    opacity: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: { duration: 1, ease: "easeIn" },
  },
};

const mainImageVariants = {
  initial: {
    opacity: 0,
    filter: "blur(15px)",
    scale: 1.05,
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    transition: { duration: 1, ease: "easeOut" },
  },
};

type Props = {
  data: MediaType;
  isPriority?: boolean;
  inView: boolean;
  noAnimation?: boolean;
  sizes: string | undefined;
  alt?: string;
  lazyLoad?: boolean;
};

const ImageComponent = (props: Props) => {
  const {
    data,
    isPriority = false,
    inView,
    noAnimation = false,
    sizes,
    alt,
    lazyLoad,
  } = props;

  // Set responsive image sizes
  // On mobile, the image should take up 38% of the viewport width
  // On tablet, the image should take up 20% of the viewport width
  // On desktop, the image should take up 15% of the viewport width
  // sizes="(max-width: 768px) 38vw, (max-width: 1024px) 20vw, 15vw"

  const imageUrl = data?.image?.asset?.url;
  const blurDataURL = data?.image?.asset?.metadata?.lqip;
  const imageAltText = alt || data?.image?.alt || "Visual media content";
  const loadingStrategy = isPriority
    ? "eager"
    : lazyLoad === false
      ? "eager"
      : "lazy";

  const [isMainImageLoaded, setIsMainImageLoaded] = useState(noAnimation);

  useEffect(() => {
    // Reset 'isMainImageLoaded' to its initial state (based on noAnimation)
    // if the image URL changes. This ensures new images show their placeholders.
    setIsMainImageLoaded(noAnimation);
  }, [imageUrl, noAnimation]);

  const handleMainImageLoad = () => {
    if (!noAnimation) {
      setIsMainImageLoaded(true);
    }
  };

  // If noAnimation is true, render a simpler structure.
  if (noAnimation) {
    return (
      <ImageComponentWrapper className="media-wrapper">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={imageAltText}
            priority={isPriority}
            fill
            style={{ objectFit: "cover" }}
            sizes={sizes}
            loading={loadingStrategy}
          />
        )}
        {/* Fallback to show static blur if no main image */}
        {!imageUrl && blurDataURL && (
          <Image
            src={blurDataURL}
            alt={imageAltText}
            priority={isPriority}
            fill
            style={{
              objectFit: "cover",
              transform: "scale(1.05)",
            }}
            sizes={sizes}
            loading="eager"
          />
        )}
      </ImageComponentWrapper>
    );
  }

  const shouldAnimateElements = inView || isPriority;

  return (
    <ImageComponentWrapper className="media-wrapper">
      <AnimatePresence>
        {shouldAnimateElements && blurDataURL && !isMainImageLoaded && (
          <InnerBlurWrapper
            key="placeholder"
            variants={placeholderVariants}
            initial="visible"
            animate="visible"
            exit="exit"
          >
            <Image
              src={blurDataURL}
              alt={`${imageAltText} (loading placeholder)`}
              priority={isPriority}
              fill
              style={{ objectFit: "cover" }}
              sizes={sizes}
              loading="eager"
            />
          </InnerBlurWrapper>
        )}
      </AnimatePresence>

      {imageUrl && (
        <InnerMainImageWrapper
          key="main-image-content"
          variants={mainImageVariants}
          initial="initial"
          animate={
            shouldAnimateElements && isMainImageLoaded ? "animate" : "initial"
          }
        >
          <Image
            src={imageUrl}
            alt={imageAltText}
            priority={isPriority}
            fill
            style={{ objectFit: "cover" }}
            sizes={sizes}
            loading={loadingStrategy}
            onLoad={handleMainImageLoad}
            onError={() => {
              if (!noAnimation) setIsMainImageLoaded(true);
            }}
          />
        </InnerMainImageWrapper>
      )}
    </ImageComponentWrapper>
  );
};

export default ImageComponent;
