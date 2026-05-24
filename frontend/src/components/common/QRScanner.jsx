import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { FiCamera, FiCameraOff, FiRefreshCw } from 'react-icons/fi';

const QRScanner = ({ onScan, onError }) => {
  const scannerRef = useRef(null);
  const containerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [cameraError, setCameraError] = useState('');
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');

  useEffect(() => {
    // Get available cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back camera on mobile
          const back = devices.find(d =>
            d.label.toLowerCase().includes('back') ||
            d.label.toLowerCase().includes('rear') ||
            d.label.toLowerCase().includes('environment')
          );
          setSelectedCamera(back ? back.id : devices[0].id);
          setHasCamera(true);
        } else {
          setHasCamera(false);
          setCameraError('No camera found on this device');
        }
      })
      .catch(() => {
        setHasCamera(false);
        setCameraError('Camera access denied. Please allow camera permission.');
      });

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    if (!selectedCamera) return;

    try {
      scannerRef.current = new Html5Qrcode('qr-reader');
      await scannerRef.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // QR code scanned successfully
          onScan(decodedText);
          // Flash effect
          if (containerRef.current) {
            containerRef.current.classList.add('flash-green');
            setTimeout(() => containerRef.current?.classList.remove('flash-green'), 500);
          }
        },
        () => {} // ignore scan errors (happens every frame when no QR found)
      );
      setIsScanning(true);
      setCameraError('');
    } catch (err) {
      setCameraError('Could not start camera: ' + err.message);
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
    }
    setIsScanning(false);
  };

  const toggleScanner = () => {
    if (isScanning) {
      stopScanner();
    } else {
      startScanner();
    }
  };

  return (
    <div className="space-y-4">
      {/* Camera selector if multiple cameras */}
      {cameras.length > 1 && (
        <select
          value={selectedCamera}
          onChange={(e) => {
            if (isScanning) stopScanner();
            setSelectedCamera(e.target.value);
          }}
          className="input-field text-sm"
        >
          {cameras.map(cam => (
            <option key={cam.id} value={cam.id}>{cam.label || `Camera ${cam.id}`}</option>
          ))}
        </select>
      )}

      {/* Scanner viewport */}
      <div ref={containerRef} className="relative rounded-2xl overflow-hidden bg-gray-900">
        {/* The actual scanner div */}
        <div
          id="qr-reader"
          className={`w-full ${isScanning ? 'block' : 'hidden'}`}
          style={{ minHeight: '300px' }}
        />

        {/* Placeholder when not scanning */}
        {!isScanning && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            {hasCamera ? (
              <>
                <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                  <FiCamera className="text-gray-400 text-3xl" />
                </div>
                <p className="text-gray-400 text-sm">Camera is off</p>
                <p className="text-gray-500 text-xs mt-1">Click the button below to start scanning</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
                  <FiCameraOff className="text-red-400 text-3xl" />
                </div>
                <p className="text-red-400 text-sm font-medium">{cameraError}</p>
              </>
            )}
          </div>
        )}

        {/* Scanning overlay with corner brackets */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-56 h-56">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
              {/* Scanning line animation */}
              <div className="absolute left-2 right-2 h-0.5 bg-green-400 opacity-80 animate-scan-line" />
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {cameraError && isScanning && (
        <p className="text-red-500 text-xs text-center">{cameraError}</p>
      )}

      {/* Toggle button */}
      <button
        onClick={toggleScanner}
        disabled={!hasCamera}
        className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
          isScanning
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200'
            : 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
      >
        {isScanning ? (
          <><FiCameraOff /> Stop Camera</>
        ) : (
          <><FiCamera /> {hasCamera ? 'Start Camera Scanner' : 'No Camera Available'}</>
        )}
      </button>

      <style>{`
        @keyframes scanLine {
          0% { top: 8px; }
          50% { top: calc(100% - 8px); }
          100% { top: 8px; }
        }
        .animate-scan-line {
          animation: scanLine 2s ease-in-out infinite;
        }
        .flash-green {
          animation: flashGreen 0.5s ease-out;
        }
        @keyframes flashGreen {
          0% { box-shadow: inset 0 0 0 4px #22c55e; }
          100% { box-shadow: inset 0 0 0 0px #22c55e; }
        }
        /* Override html5-qrcode default styles */
        #qr-reader { border: none !important; }
        #qr-reader video { border-radius: 12px; }
        #qr-reader__scan_region { border: none !important; }
        #qr-reader__dashboard { display: none !important; }
      `}</style>
    </div>
  );
};

export default QRScanner;
