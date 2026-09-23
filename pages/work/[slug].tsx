import styled from "styled-components";
import type { GetStaticPaths, GetStaticProps } from "next";
import client from "../../client";
import { ProjectType, TransitionsType } from "../../shared/types/types";
import { motion } from "framer-motion";
import { NextSeo } from "next-seo";
import PageBuilder from "../../components/common/PageBuilder";

type Props = {
  data: ProjectType;
  pageTransitionVariants: TransitionsType;
};

const PageWrapper = styled(motion.div)``;

const Page = (props: Props) => {
  const { data, pageTransitionVariants } = props;

  return (
    <PageWrapper
      variants={pageTransitionVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <NextSeo title={`TO BE FILLLED IN`} description={`TO BE FILLED IN`} />
      {/* <PageBuilder data={data} /> */}
    </PageWrapper>
  );
};

export async function getStaticPaths() {
  const projectsQuery = `
		*[_type == 'project' && defined(slug.current)] [0...100] {
			slug
		}
	`;

  const allProjects = client
    ? await client.fetch<ProjectType[]>(projectsQuery)
    : [];

  return {
    paths: allProjects
      .filter((item) => item.slug.current && !item.slug.current.includes("/"))
      .map((item) => ({ params: { slug: item.slug.current } })),
    fallback: "blocking",
  } satisfies Awaited<ReturnType<GetStaticPaths>>;
}

export const getStaticProps: GetStaticProps<
  { data: ProjectType },
  { slug: string }
> = async ({ params }) => {
  if (!client || !params?.slug) {
    return { notFound: true, revalidate: 60 };
  }

  const projectQuery = `
		*[_type == 'project' && slug.current == $slug][0] {
			...,
		}
	`;
  const data = await client.fetch<ProjectType | null>(projectQuery, {
    slug: params.slug,
  });

  if (!data) {
    return { notFound: true, revalidate: 60 };
  }

  return {
    props: {
      data,
    },
    revalidate: 60,
  };
};

export default Page;
