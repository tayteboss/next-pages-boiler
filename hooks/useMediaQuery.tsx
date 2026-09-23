import { useEffect, useState } from 'react';

const useMediaQuery = (query: string): boolean => {
	const [isMatching, setIsMatching] = useState<boolean>(false);

	useEffect(() => {
		const media = window.matchMedia(query);
		const update = () => setIsMatching(media.matches);
		update();
		media.addEventListener('change', update);
		return () => media.removeEventListener('change', update);
	}, [query]);

	return isMatching;
};

export default useMediaQuery;
