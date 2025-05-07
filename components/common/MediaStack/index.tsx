import styled from "styled-components";
import { useInView } from "react-intersection-observer";
import ImageComponent from "./ImageComponent";
import VideoComponent from "./VideoComponent";
import { MediaType } from "../../../shared/types/types";

const MediaStackWrapper = styled.div``;

type Props = {
  data: MediaType;
  isPriority?: boolean;
  noAnimation?: boolean;
  sizes?: undefined | string;
  alt?: string;
  lazyLoad?: boolean;
  useLoader?: boolean;
};

const MediaStack = (props: Props) => {
  const {
    data,
    isPriority = false,
    noAnimation = false,
    sizes = undefined,
    alt,
    lazyLoad = false,
    useLoader = false,
  } = props ?? {};

  // sizes="(max-width: 768px) 38vw, (max-width: 1024px) 20vw, 15vw"

  const useVideo = data?.media?.mediaType === "video";

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
    rootMargin: "-5%",
  });

  return (
    <MediaStackWrapper ref={ref}>
      {useVideo && (
        <VideoComponent
          data={data}
          inView={inView}
          isPriority={isPriority}
          noAnimation={noAnimation}
          lazyLoad={lazyLoad}
          useLoader={useLoader}
        />
      )}
      {!useVideo && (
        <ImageComponent
          data={data}
          isPriority={isPriority}
          inView={inView}
          noAnimation={noAnimation}
          sizes={sizes}
          alt={alt}
          lazyLoad={lazyLoad}
        />
      )}
    </MediaStackWrapper>
  );
};

export default MediaStack;
