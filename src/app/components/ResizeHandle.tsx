import React, { useState, useRef, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

const ResizeHandle: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const initialMousePos = useRef({ x: 0, y: 0 });
  const initialSize = useRef({ width: 480, height: 350 });
  const resizeHandleRef = useRef(null);

  const handleMouseDown = (event) => {
    setIsDragging(true);
    initialMousePos.current = { x: event.clientX, y: event.clientY };
    initialSize.current = { width: window.innerWidth, height: window.innerHeight };
    resizeHandleRef.current.setPointerCapture(event.pointerId);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
  };

  const handleMouseMove = useCallback(debounce((event) => {
    if (isDragging) {
      const newWidth = initialSize.current.width + (event.clientX - initialMousePos.current.x);
      const newHeight = initialSize.current.height + (event.clientY - initialMousePos.current.y);
      console.log('drag size should now be:', newWidth, newHeight);
      parent.postMessage({ pluginMessage: { type: 'resize', width: newWidth, height: newHeight } }, '*');
    }
  }, 100), [isDragging]); // Debounce with a delay of 100ms

  useEffect(() => {
    const handle = resizeHandleRef.current;
    handle.addEventListener('mousedown', handleMouseDown);
    handle.addEventListener('mouseup', handleMouseUp);
    handle.addEventListener('mousemove', handleMouseMove);

    return () => {
      handle.removeEventListener('mousedown', handleMouseDown);
      handle.removeEventListener('mouseup', handleMouseUp);
      handle.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseDown, handleMouseUp, handleMouseMove]);

  return (
    <div
      ref={resizeHandleRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className="resize-handle"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><path fill="#8C8C8C" d="M5.02 16H3.608L16 3.607V5.02L5.02 16Zm5.815 0H9.421L16 9.42v1.415L10.835 16Z"></path></svg>
    </div>
  );
}

export default ResizeHandle;