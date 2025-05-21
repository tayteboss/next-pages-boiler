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
  z-index: 1;
`;

const Inner = styled.div`
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  z-index: 1;
`;

const wrapperVariants = {
  hidden: {
    opacity: 1,
    filter: "blur(10px)",
    scale: 1.05,
    transition: {
      duration: 2,
      ease: "easeInOut",
    },
  },
  visible: {
    opacity: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: 2,
      ease: "easeInOut",
      delay: 0.2,
    },
  },
};

type Props = {
  data: MediaType;
  inView: boolean;
  isPriority: boolean;
  noAnimation?: boolean;
  lazyLoad?: boolean;
};

const VideoComponent = (props: Props) => {
  const { data, inView, isPriority, noAnimation, lazyLoad } = props;

  const playbackId = data?.video?.asset?.playbackId;
  const posterUrl = `https://image.mux.com/${data?.video?.asset?.playbackId}/thumbnail.png?width=214&height=121&time=1`;

  return (
    <VideoComponentWrapper className="media-wrapper">
      {!noAnimation && posterUrl && (
        <AnimatePresence initial={false}>
          {inView && playbackId && (
            <InnerBlur
              variants={wrapperVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Image
                src={`${posterUrl}`}
                alt={""}
                fill
                priority={isPriority}
                sizes="50vw"
              />
            </InnerBlur>
          )}
        </AnimatePresence>
      )}
      {playbackId && (
        <Inner>
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
            minResolution="2160p"
          />
        </Inner>
      )}
    </VideoComponentWrapper>
  );
};

export default VideoComponent;
