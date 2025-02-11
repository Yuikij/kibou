import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import { useColorMode } from '@docusaurus/theme-common';

const transformer = new Transformer();

export default function MarkmapComponent({ content }) {
  const refSvg = useRef(null);
  const refMm = useRef(null);
  const styleRef = useRef(null);
  const { colorMode } = useColorMode();


  const updateStyle = useCallback(() => {
    if (!styleRef.current) {
      styleRef.current = document.createElement('style');
      document.head.appendChild(styleRef.current);
    }
    styleRef.current.textContent = `
      .markmap-node .markmap-foreign {
        color: ${colorMode === 'dark' ? '#fff' : '#000'};
      }
      svg {
        background-color: colorMode === 'dark' ? '#222' : '#fff'} !important;
      }
    `;
  }, [colorMode]);

  useEffect(() => {
    const { root } = transformer.transform(content);

    updateStyle();

    if (refMm.current) {
      refMm.current.setData(root);
    } else if (refSvg.current) {
      refMm.current = Markmap.create(refSvg.current, {}, root);
    }

    return () => {
      if (styleRef.current) {
        styleRef.current.remove();
        styleRef.current = null;
      }
    };
  }, [content, updateStyle]);

  // 切换全屏模式
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      refSvg.current?.requestFullscreen();
    } 
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* 全屏按钮 */}
      <button 
        onClick={toggleFullscreen}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '5px 10px',
          backgroundColor: colorMode === 'dark' ? '#444' : '#ddd',
          color: colorMode === 'dark' ? '#fff' : '#000',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 10,
        }}
      >
        { '全屏'}
      </button>

      {/* 思维导图区域 */}
      <svg 
        ref={refSvg} 
        style={{ 
          width: '100%', 
          height: '500px',
          borderRadius: '8px',
        }}
      />
    </div>
  );
}
