import Image from "next/image";
import styled from "styled-components";
import { MediaType } from "../../../shared/types/types"; // Adjust path as needed
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";

const ImageComponentWrapper = styled.div`
  position: relative;
  overflow: hidden;
  background: var(--colour-cream);

  mux-player, // If you also use this wrapper for Mux Player
  img {
    display: block; // Good practice for images
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
  z-index: 2; // Placeholder on top
  // Ensure the placeholder itself has the blur and scale if not animated initially
  // This is now handled by the variant's 'visible' state directly
`;

const InnerMainImageWrapper = styled(MotionDivBase)`
  z-index: 1; // Main image underneath placeholder
`;

// Variants for the placeholder (LQIP)
const placeholderVariants = {
  // This is the state when the placeholder is visible
  visible: {
    opacity: 1,
    filter: "blur(15px)", // INCREASED BLUR RADIUS SIGNIFICANTLY for testing
    scale: 1, // TEMPORARILY set scale to 1 to isolate blur effect
  },
  // This is how the placeholder exits
  exit: {
    opacity: 0,
    filter: "blur(0px)",
    scale: 1, // Keep scale at 1 for exit during this test
    transition: { duration: 1, ease: "easeIn" },
  },
};

// Variants for the main image (let's keep its scale animation for now,
// as the "scale down" you see might be this one).
const mainImageVariants = {
  initial: {
    opacity: 0,
    filter: "blur(15px)", // Optional: If you wanted the main image to also de-blur
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

  const imageUrl = data?.media?.image?.asset?.url;
  const blurDataURL = data?.media?.image?.asset?.metadata?.lqip;
  const imageAltText = alt || data?.media?.image?.alt || "Visual media content";
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
            alt={imageAltText} // Should indicate it's a placeholder/low quality
            priority={isPriority}
            fill
            style={{
              objectFit: "cover",
              // filter: "blur(20px)",
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
            initial="visible" // Placeholder is immediately visible in its blurred state
            animate="visible" // Stays in this state
            exit="exit" // Animates out using the 'exit' variant
          >
            <Image
              src={blurDataURL}
              alt={`${imageAltText} (loading placeholder)`}
              priority={isPriority}
              fill
              style={{ objectFit: "cover" }} // Styles for the image itself
              sizes={sizes}
              loading="eager" // Placeholders must load eagerly
            />
          </InnerBlurWrapper>
        )}
      </AnimatePresence>

      {imageUrl && (
        <InnerMainImageWrapper
          key="main-image-content" // Changed key slightly for potential clarity if debugging
          variants={mainImageVariants}
          initial="initial" // Starts hidden (opacity 0)
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
              if (!noAnimation) setIsMainImageLoaded(true); // Hide placeholder even on error
            }}
          />
        </InnerMainImageWrapper>
      )}
    </ImageComponentWrapper>
  );
};

export default ImageComponent;
