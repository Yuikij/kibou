import React, { useEffect, useRef } from 'react';
import { init } from '@waline/client';

import '@waline/client/style';
import {useColorMode} from '@docusaurus/theme-common';

export const Waline = (props) => {
  const walineInstanceRef = useRef(null);
  const containerRef = useRef(null);
  const {colorMode, setColorMode} = useColorMode();

  useEffect(() => {
    walineInstanceRef.current = init({
      ...props,
      dark: colorMode === 'dark' ? 'html[data-theme="dark"]' : undefined, // 根据模式设置 dark 参数
      reaction: [],
      el: containerRef.current,
    });

    return () => {
      // try {
      //   walineInstanceRef.current?.destroy();
      // } catch (error) {
      //   console.error('Error while destroying Waline instance:', error);
      // } finally {
      //   walineInstanceRef.current = null;
      // }
    };
  }, []);

  useEffect(() => {
    walineInstanceRef.current?.update({
      ...props,
      dark: colorMode === 'dark' ? 'html[data-theme="dark"]' : undefined, // 更新 dark 参数
    });
  }, [props, colorMode]); // 监听 props 和 colorMode 的变化

  return <div style={{marginTop:50}} ref={containerRef} />;
};
