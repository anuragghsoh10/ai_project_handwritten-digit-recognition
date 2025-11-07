import React, { useRef, useEffect, useState } from 'react';
import { recognizeDigit } from '../services/geminiService';
import { SparklesIcon, TrashIcon } from './icons';

export const InteractiveDemo: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if(context) {
        context.fillStyle = '#020617'; // slate-950
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);
  
  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const context = getCanvasContext();
    if (!context) return;

    const pos = getMousePos(event);
    context.beginPath();
    context.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const context = getCanvasContext();
    if (!context) return;
    
    const pos = getMousePos(event);
    context.lineTo(pos.x, pos.y);
    context.strokeStyle = 'white';
    context.lineWidth = 18;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.stroke();
  };

  const stopDrawing = () => {
    const context = getCanvasContext();
    if (context) {
        context.closePath();
    }
    setIsDrawing(false);
  };
    
  const getMousePos = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in event.nativeEvent) {
        return {
            x: event.nativeEvent.touches[0].clientX - rect.left,
            y: event.nativeEvent.touches[0].clientY - rect.top
        };
    }
    return {
        x: event.nativeEvent.offsetX,
        y: event.nativeEvent.offsetY
    };
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = getCanvasContext();
    if (canvas && context) {
      context.fillStyle = '#020617';
      context.fillRect(0, 0, canvas.width, canvas.height);
      setPrediction(null);
      setError(null);
    }
  };

  const handlePredict = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsLoading(true);
    setPrediction(null);
    setError(null);
    
    // Create a temporary canvas to resize and center the image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 28;
    tempCanvas.height = 28;
    const tempCtx = tempCanvas.getContext('2d');
    if(!tempCtx) return;

    tempCtx.drawImage(canvas, 0, 0, 28, 28);
    const imageDataUrl = tempCanvas.toDataURL('image/png');
    const base64ImageData = imageDataUrl.split(',')[1];
    
    try {
      const result = await recognizeDigit(base64ImageData);
      const digitMatch = result.match(/\d/);
      if (digitMatch) {
        setPrediction(digitMatch[0]);
      } else {
        setError("Couldn't recognize a digit. Please try again.");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during prediction.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        <div className="flex flex-col items-center">
            <p className="text-slate-400 mb-2 text-center">Draw a digit (0-9) in the box below</p>
            <canvas
                ref={canvasRef}
                width="280"
                height="280"
                className="bg-slate-950 rounded-lg shadow-md cursor-crosshair border-2 border-slate-600"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
        </div>
      <div className="flex flex-col items-center space-y-4 w-full md:w-auto">
        <div className="flex space-x-4">
            <button
                onClick={handlePredict}
                disabled={isLoading}
                className="w-36 h-12 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-600 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                    <>
                    <SparklesIcon className="w-5 h-5 mr-2" /> Predict
                    </>
                )}
            </button>
            <button
                onClick={clearCanvas}
                className="w-36 h-12 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center"
            >
                <TrashIcon className="w-5 h-5 mr-2" /> Clear
            </button>
        </div>
        <div className="w-full h-40 bg-slate-900 border-2 border-slate-700 rounded-lg flex items-center justify-center text-7xl font-extrabold">
          {prediction && !isLoading && <span className="text-green-400 animate-pulse">{prediction}</span>}
          {isLoading && <span className="text-slate-500 text-2xl">Recognizing...</span>}
          {error && <span className="text-red-400 text-base text-center p-2">{error}</span>}
          {!prediction && !isLoading && !error && <span className="text-slate-600 text-2xl">Prediction</span>}
        </div>
      </div>
    </div>
  );
};