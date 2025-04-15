import { useState, useCallback } from "react";

export function useDrag() {
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 100 });

  const startDrag = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (e) => {
      setPosition({
        x: e.clientX - startX,
        y: e.clientY - startY
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [position]);

  return { position, startDrag };
}

export function useResize({ initialWidth, initialHeight }) {
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });

  const startResize = useCallback((e) => {
    e.preventDefault();
    const startWidth = size.width;
    const startHeight = size.height;
    const startX = e.clientX;

    const handleMouseMove = (e) => {
      const newWidth = Math.max(300, startWidth + (e.clientX - startX));
      const newHeight = Math.max(200, startHeight + (e.clientX - startX) * 0.5);
      setSize({
        width: newWidth,
        height: newHeight
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [size]);

  return { size, startResize };
}