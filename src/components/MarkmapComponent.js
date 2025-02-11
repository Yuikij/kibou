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
  const [isFullscreen, setIsFullscreen] = useState(false);

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
        background-color: ${colorMode === 'dark' ? '#222' : '#fff'} !important;
      }
    `;
  }, [colorMode, isFullscreen]);

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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const enterFullscreen = () => {
    if (refSvg.current) {
      const svgElement = refSvg.current;
      if (svgElement.requestFullscreen) {
        svgElement.requestFullscreen();
      } else if (svgElement.webkitRequestFullscreen) {
        svgElement.webkitRequestFullscreen();
      }
    }
  };

  const exportToSVG = () => {
    const svg = refSvg.current;
    if (!svg) return;

    // 克隆 SVG 元素以避免修改原始元素
    const clonedSvg = svg.cloneNode(true);
    const bbox = svg.getBBox();
    
    // 设置 viewBox
    clonedSvg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
    
    // 创建并添加样式元素
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .markmap-node .markmap-foreign {
        color: ${colorMode === 'dark' ? '#fff' : '#000'};
      }
      .markmap-node text {
        fill: ${colorMode === 'dark' ? '#fff' : '#000'};
      }
    `;
    clonedSvg.insertBefore(styleElement, clonedSvg.firstChild);

    // 序列化和导出
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {!isFullscreen && (
        <button 
          onClick={enterFullscreen}
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
          全屏
        </button>
      )}

      <button 
        onClick={exportToSVG}
        style={{
          position: 'absolute',
          top: '50px',
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
        导出
      </button>

      <svg 
        ref={refSvg} 
        style={{ 
          width: '100%', 
          height: '500px',
          borderRadius: '8px',
          backgroundColor: isFullscreen ? '#000' : colorMode === 'dark' ? '#222' : '#fff',
        }}
      />
    </div>
  );
}