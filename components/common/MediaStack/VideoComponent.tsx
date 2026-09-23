import MuxPlayer from "@mux/mux-player-react/lazy";
import styled from "styled-components";
import { MediaType } from "../../../shared/types/types";
import { AnimatePresence, motion, easeIn, easeOut } from "framer-motion";
import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import useMediaQuery from "../../../hooks/useMediaQuery";
import ratioToPadding from "../../../utils/ratioToPadding";

const VideoComponentWrapper = styled.div`
  position: relative;
  overflow: hidden;

  mux-player {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  mux-player,
  img {
    transition: all var(--transition-speed-extra-slow) var(--transition-ease);
  }
`;

const InnerBlur = styled(motion.div)`
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  z-index: 5;
  filter: blur(10px);
  background-color: rgba(0, 0, 0, 0.1);
  transform-origin: center;
`;

const Inner = styled(motion.div)`
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  z-index: 1;
  transform-origin: center;
`;

const placeholderVariants = {
  visible: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 1,
    transition: { duration: 0.4, ease: easeIn },
  },
};

const videoVariants = {
  initial: {
    scale: 1.02,
  },
  animate: {
    scale: 1,
    transition: { duration: 0.4, ease: easeOut },
  },
};

type Props = {
  data: MediaType;
  useMobileData?: MediaType;
  inView: boolean;
  isPriority: boolean;
  noFadeInAnimation?: boolean;
  lazyLoad?: boolean;
  minResolution?: undefined | "2160p" | "1440p" | "1080p" | "720p" | "480p";
  aspectPadding?: string;
};

const VideoComponent = (props: Props) => {
  const {
    data,
    useMobileData,
    inView,
    isPriority,
    noFadeInAnimation,
    lazyLoad = true,
    minResolution,
    aspectPadding,
  } = props;
  const [hasLoaded, setHasLoaded] = useState(noFadeInAnimation);
  const [hasRenderedFrame, setHasRenderedFrame] = useState(noFadeInAnimation);
  const playerRef = useRef<any>(null);

  const isMobile = useMediaQuery("(max-width: 767px)");
  const selectedData = isMobile && useMobileData?.video?.asset?.playbackId
    ? useMobileData
    : data;
  const resolvedPadding = aspectPadding
    ?? ratioToPadding(selectedData?.video?.asset?.data?.aspect_ratio)
    ?? "56.25%";

  const playbackId = selectedData?.video?.asset?.playbackId;
  const posterUrl = playbackId
    ? `https://image.mux.com/${playbackId}/thumbnail.png?width=214&height=121&time=1`
    : undefined;

  const isVideoReady = hasLoaded && hasRenderedFrame;
  const shouldAnimateElements = inView || isPriority;

  useEffect(() => {
    setHasLoaded(noFadeInAnimation);
    setHasRenderedFrame(noFadeInAnimation);
  }, [playbackId, noFadeInAnimation]);

  const checkRenderedFrame = useCallback(() => {
    setHasRenderedFrame((prev) => {
      if (prev) return prev;
      const video = playerRef.current?.media as HTMLVideoElement | undefined;
      if (
        video &&
        !video.paused &&
        video.currentTime > 0 &&
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        return true;
      }
      return prev;
    });
  }, []);

  const handleLoadedData = () => {
    if (!noFadeInAnimation) {
      setHasLoaded(true);
    }
  };

  return (
    <VideoComponentWrapper
      className="media-stack"
      style={{ paddingTop: resolvedPadding }}
    >
      {!noFadeInAnimation && posterUrl && (
        <AnimatePresence>
          {shouldAnimateElements && playbackId && !isVideoReady && (
            <InnerBlur
              key="placeholder"
              variants={placeholderVariants}
              initial="visible"
              animate="visible"
              exit="exit"
            >
              <Image
                src={posterUrl}
                alt=""
                fill
                priority={isPriority}
                sizes="25vw"
              />
            </InnerBlur>
          )}
        </AnimatePresence>
      )}
      {playbackId && (
        <Inner
          variants={videoVariants}
          initial="initial"
          animate={
            shouldAnimateElements && isVideoReady ? "animate" : "initial"
          }
        >
          <MuxPlayer
            ref={playerRef}
            streamType="on-demand"
            playbackId={playbackId}
            autoPlay="muted"
            loop={true}
            thumbnailTime={1}
            loading={isPriority || !lazyLoad ? "page" : "viewport"}
            preload={isPriority || !lazyLoad ? "auto" : "metadata"}
            muted
            playsInline={true}
            minResolution={minResolution}
            onLoadedData={handleLoadedData}
            onPlaying={checkRenderedFrame}
            onTimeUpdate={checkRenderedFrame}
          />
        </Inner>
      )}
    </VideoComponentWrapper>
  );
};

export default VideoComponent;
