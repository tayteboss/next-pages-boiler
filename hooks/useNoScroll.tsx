import { useEffect } from 'react';

const useNoScroll = (addNoScroll: boolean) => {
	useEffect(() => {
		if (!addNoScroll) return;
		const html = document.documentElement;
		const wasLocked = html.classList.contains('no-scroll');
		html.classList.add('no-scroll');
		return () => {
			if (!wasLocked) html.classList.remove('no-scroll');
		};
	}, [addNoScroll]);
};

export default useNoScroll;
