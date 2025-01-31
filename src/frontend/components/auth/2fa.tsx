'use client';
import React, { useState , useEffect} from 'react';
import { Check, X, KeyRound } from 'lucide-react';
import { Alert, AlertDescription } from './alert';
import api from '@/app/utils/api';

interface TwoFactorAuthProps {
  enabled: boolean;
  onStatusChange: (status: boolean) => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ enabled, onStatusChange }) => {
	const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState<boolean>(enabled);
  
  useEffect(() => {
	setIsEnabled(enabled);
  }, [enabled]);

  const handle2FAToggle = async (): Promise<void> => {
    try {
		// console.log(isEnabled);
      if (!isEnabled) {
        // Enable 2FA
        const response = await api.post('/2fa/enable/');
        if (response.status === 200) {
          setQrCodeUrl(response.data.qr_code);
          setShowQRCode(true);
          setError('');
        }
      } else {
        // Disable 2FA
        const response = await api.post('/2fa/disable/');
        if (response.status === 200) {
          setIsEnabled(false);
          setShowQRCode(false);
          setSuccess('Two-factor authentication disabled successfully');
          onStatusChange(false);
          setError('');
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update 2FA settings');
    }
  };

  const handleVerifyCode = async (): Promise<void> => {
    try {
      const response = await api.post('/2fa/verify/', {
        code: verificationCode
      });

      if (response.status === 200) {
        setIsEnabled(true);
        setShowQRCode(false);
        setSuccess('Two-factor authentication enabled successfully');
        setVerificationCode('');
        onStatusChange(true);
        setError('');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid verification code');
    }
  };

  return (
    <div className="border-t border-gray-800 pt-8">
      {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert className="mb-4 bg-green-700"><AlertDescription>{success}</AlertDescription></Alert>}
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <KeyRound className="text-gray-400" />
          <div>
            <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
            <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handle2FAToggle}
          className={`
            relative inline-flex items-center h-8 rounded-full w-16
            transition-colors duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2
            ${isEnabled ? 'bg-green-600' : 'bg-gray-200'}
          `}
        >
          <span className="sr-only">Toggle 2FA</span>
          <span
            className={`
              inline-flex items-center justify-center h-6 w-6 rounded-full
              transition-transform duration-200 ease-in-out
              ${isEnabled ? 'translate-x-9 bg-white' : 'translate-x-1 bg-white'}
            `}
          >
            {isEnabled ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <X className="h-4 w-4 text-gray-400" />
            )}
          </span>
        </button>
      </div>

      {showQRCode && (
        <div className="bg-gray-900 p-6 rounded-lg space-y-4">
          <h4 className="font-medium">Scan this QR code with your authenticator app</h4>
          <div className="flex justify-center">
            <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
          </div>
          <div className="space-y-2">
            <label className="block text-gray-400">Enter verification code</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="flex-1 bg-white text-black px-4 py-2 rounded"
                placeholder="Enter 6-digit code"
              />
              <button
                type="button"
                onClick={handleVerifyCode}
                className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuth;