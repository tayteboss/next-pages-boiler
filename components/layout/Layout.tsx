import styled from "styled-components";
import Header from "../common/Header";
import Footer from "../common/Footer";
import { ReactNode } from "react";
import { ReactLenis, useLenis } from "@studio-freight/react-lenis";
import { SiteSettingsType } from "../../shared/types/types";
// import { GoogleAnalytics } from "@next/third-parties/google";
// import { SpeedInsights } from "@vercel/speed-insights/next";

// const siteSettings: SiteSettingsType = require("../../json/siteSettings.json");

const Main = styled.main``;

type Props = {
  children: ReactNode;
};

const Layout = (props: Props) => {
  const { children } = props;

  useLenis();

  return (
    <>
      <Header />
      <ReactLenis root>
        <Main>{children}</Main>
      </ReactLenis>
      <Footer />
      {/* <GoogleAnalytics gaId="G-X" />
      <SpeedInsights /> */}
    </>
  );
};

export default Layout;
