export const mediaString = `
	...,
	mediaType,
	image {
		asset-> {
			url,
			metadata {
				lqip,
				dimensions { aspectRatio, width, height }
			}
		},
		alt
	},
	video {
		asset-> {
			playbackId,
			data { aspect_ratio },
		},
	},
	mobileImage {
		asset-> {
			url,
			metadata {
				lqip,
				dimensions { aspectRatio, width, height }
			}
		},
		alt
	},
	mobileVideo {
		asset-> {
			playbackId,
			data { aspect_ratio },
		},
	},
`;

export const siteSettingsQueryString = `
	*[_type == 'siteSettings'][0] {
		...,
	}
`;

export const homePageQueryString = `
	*[_type == 'homePage'][0] {
		...,
	}
`;

export const workPageQueryString = `
	*[_type == "workPage"][0] {
		...,
		seoTitle,
		seoDescription,
	}
`;

export const projectsQueryString = `
	*[_type == 'project'] | order(orderRank) [0...100] {
		...,
	}
`;
