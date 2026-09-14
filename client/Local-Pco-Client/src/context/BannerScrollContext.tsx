// src/context/BannerScrollContext.tsx
// Context to share scroll events and animate the active request banner off-screen on scroll down or bottom

import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

interface BannerScrollContextType {
    isBannerVisible: boolean;
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    showBanner: () => void;
    hideBanner: () => void;
}

const BannerScrollContext = createContext<BannerScrollContextType>({
    isBannerVisible: true,
    onScroll: () => {},
    showBanner: () => {},
    hideBanner: () => {},
});

export const BannerScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isBannerVisible, setIsBannerVisible] = useState(true);
    const lastOffsetY = useRef(0);

    const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const currentY = contentOffset.y;

        const isScrollable = contentSize.height > layoutMeasurement.height + 100;
        const distanceFromBottom = contentSize.height - (layoutMeasurement.height + currentY);
        const scrollDelta = currentY - lastOffsetY.current;

        // Hide when near bottom of a scrollable page
        const isNearBottom = isScrollable && distanceFromBottom <= 100 && currentY > 40;

        if (isNearBottom) {
            setIsBannerVisible(false);
        } else if (scrollDelta > 15 && currentY > 50) {
            // Scrolling down
            setIsBannerVisible(false);
        } else if (scrollDelta < -10 || currentY <= 40) {
            // Scrolling up or near top
            setIsBannerVisible(true);
        }

        lastOffsetY.current = currentY;
    }, []);

    const showBanner = useCallback(() => setIsBannerVisible(true), []);
    const hideBanner = useCallback(() => setIsBannerVisible(false), []);

    return (
        <BannerScrollContext.Provider value={{ isBannerVisible, onScroll, showBanner, hideBanner }}>
            {children}
        </BannerScrollContext.Provider>
    );
};

export const useBannerScroll = () => useContext(BannerScrollContext);
