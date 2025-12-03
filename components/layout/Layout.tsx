import styled from "styled-components";
import Header from "../common/Header";
import Footer from "../common/Footer";
import { ReactNode } from "react";
import { ReactLenis, useLenis } from "@studio-freight/react-lenis";
import { useRouter } from "next/router";

const Main = styled.main``;

type Props = {
  children: ReactNode;
};

const Layout = (props: Props) => {
  const { children } = props;
  const router = useRouter();

  useLenis();

  // Render the home route without any chrome so the sequencer can take over the full viewport.
  if (router.pathname === "/") {
    return <Main>{children}</Main>;
  }

  return (
    <>
      <Header />
      <ReactLenis root>
        <Main>{children}</Main>
      </ReactLenis>
      <Footer />
    </>
  );
};

export default Layout;
