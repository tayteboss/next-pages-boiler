import MuxPlayer from "@mux/mux-player-react/lazy";
import styled from "styled-components";
import { MediaType } from "../../../shared/types/types";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

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

const wrapperVariants = {
  hidden: {
    opacity: 1,
    filter: "blur(10px)",
    scale: 1.05,
    transition: {
      duration: 1,
      ease: "easeInOut",
    },
  },
  visible: {
    opacity: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: 1.5,
      ease: "easeInOut",
    },
  },
};

const innerVariants = {
  hidden: {
    scale: 1.05,
    transition: {
      duration: 1,
      ease: "easeInOut",
    },
  },
  visible: {
    scale: 1,
    transition: {
      duration: 1.5,
      ease: "easeInOut",
    },
  },
};

type Props = {
  data: MediaType;
  inView: boolean;
  isPriority: boolean;
  noAnimation?: boolean;
  lazyLoad?: boolean;
  minResolution?: undefined | "2160p" | "1440p" | "1080p" | "720p" | "480p";
};

const VideoComponent = (props: Props) => {
  const { data, inView, isPriority, noAnimation, lazyLoad, minResolution } =
    props;
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const playbackId = data?.video?.asset?.playbackId;
  const posterUrl = `https://image.mux.com/${data?.video?.asset?.playbackId}/thumbnail.png?width=214&height=121&time=1`;

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

  return (
    <VideoComponentWrapper className="media-wrapper">
      {!noAnimation && posterUrl && (
        <AnimatePresence initial={false}>
          {inView && playbackId && (
            <InnerBlur
              variants={wrapperVariants}
              initial="hidden"
              animate={isVideoLoaded ? "visible" : "hidden"}
              exit="hidden"
            >
              <Image
                src={`${posterUrl}`}
                alt={""}
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
          variants={innerVariants}
          initial="hidden"
          animate={isVideoLoaded ? "visible" : "hidden"}
        >
          <MuxPlayer
            streamType="on-demand"
            playbackId={playbackId}
            autoPlay="muted"
            loop={true}
            thumbnailTime={1}
            loading={lazyLoad ? "viewport" : "page"}
            preload="auto"
            muted
            playsInline={true}
            poster={`${posterUrl}`}
            minResolution={minResolution}
            onLoadedData={handleVideoLoad}
          />
        </Inner>
      )}
    </VideoComponentWrapper>
  );
};

export default VideoComponent;
