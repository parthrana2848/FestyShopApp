import { useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useTabBarAnimation } from '../components/navigation/TabBarVisibilityContext';
import { bottomTabRef } from '../components/navigation/AppTabs';

export const useHideTabBarOnScroll = () => {
    console.log('useHideTabBarOnScroll called');
  const lastOffset = useRef(0);

  const tabBar = useTabBarAnimation();
  const { hideTabBar = undefined, showTabBar = undefined } = tabBar || {};

  const bottomRef = bottomTabRef;

  const onScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const currentOffset = event.nativeEvent.contentOffset.y;

    if (currentOffset > lastOffset.current + 10) {
      if (typeof hideTabBar === 'function') {
        hideTabBar();
      } else if (bottomRef?.current?.hide) {
        bottomRef.current.hide();
      }
    } else if (currentOffset < lastOffset.current - 10) {
      if (typeof showTabBar === 'function') {
        showTabBar();
      } else if (bottomRef?.current?.show) {
        bottomRef.current.show();
      }
    }

    lastOffset.current = currentOffset;
  };

  return onScroll;
};