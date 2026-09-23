import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

// An unconfigured starter can build; CMS routes return 404 until configured.
const client = projectId && dataset
  ? createClient({
      projectId,
      dataset,
      token: process.env.SANITY_API_TOKEN || undefined,
      useCdn: false,
      apiVersion: "2024-09-24",
    })
  : null;

export default client;
