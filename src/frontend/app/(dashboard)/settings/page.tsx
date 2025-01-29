// 'use client';
// import React, { useState, useEffect, useRef} from 'react';
// import api from '@/app/utils/api';
// import { Camera } from 'lucide-react';

// const ProfileSettings = () => {
//   const [userData, setUserData] = useState({
//     email: '',
//     username: '',
//     nickname: '',
//     password: '',
//     repeatPassword: '',
// 	  profile_image:'',
//   });
//   const fileInputRef = useRef(null);
  
//   const [isUploading, setIsUploading] = useState(false); 
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const handleFileChange = async (e: { target: { files: any[]; }; }) => {
// 	const file = e.target.files?.[0];
//     if (!file) return;  
// 	setIsUploading(true);
	
// 	const formData = new FormData();
// 	formData.append('profile_image', file);
// 	try {
//         const response = await api.put('/profile/image/',formData);
		
// 		console.log(response);

//         if (response.status === 200) {
// 			    if (response.data.error)
// 			      throw new Error(response.data.error);
        
// 			// Clear password fields after successful update
// 			setUserData(prev => ({
// 			  ...prev,
// 	      profile_image: response.data.image_url,
// }));
			
// 			setSuccess(response.data.message);
// 		  } else {
// 			throw new Error('Failed to update profile');
// 		  }
//         // const data = await response.json();
//     } catch (error) {
//         console.error('Error:', error);
//     }finally
// 	{
// 		setIsUploading(false);
// 	}
// }
//   const handleChange = (e: { target: { name: any; value: any; }; }) => {
//     setUserData({ ...userData, [e.target.name]: e.target.value });
//   };

  
  

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const updateData: any = {
//         nickname: userData.nickname
//       };

//       // Only include password update if both fields are filled

//       if (userData.password && userData.repeatPassword) {
//         updateData.currentPassword = userData.password;
//         updateData.newPassword = userData.repeatPassword;
//       }
//       else if ((userData.password && !userData.repeatPassword )||(! userData.password && userData.repeatPassword ) )
//       {
//         throw new Error('Please fill the both PASSWORD && NEW PASSWORD if u want to update ur password');
//       }

//       const response = await api.put('/update_user/', updateData);

//       if (response.status === 200) {
//         if (response.data.error)
//           throw new Error(response.data.error);

//         // Clear password fields after successful update
//         setUserData(prev => ({
//           ...prev,
//           password: '',
//           repeatPassword: ''
//         }));
        
//         setSuccess('Profile updated successfully!');
//       } else {
//         throw new Error('Failed to update profile');
//       }
//     } catch (error: any) {
//       setError(error.message || 'Failed to update profile');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const response = await api.get('/user/');

//         if (!(response.status === 200)) {
//           throw new Error('Failed to fetch user data');
//         }
//         const data = await response.data;
//         setUserData(prevData => ({
//           ...data,
//           password: '',
//           repeatPassword: ''
//         }));
//       } catch (error) {
//         setError('Failed to fetch user data:');
//       }
//     };

//     fetchUserData();
//   }, []);

//   return (
//     <div className="w-full min-h-screen bg-black text-white">
//       {/* Banner Image */}
//       <div className="w-full h-48 overflow-hidden">
//         <img
//           src="/background.jpeg"
//           alt="Profile banner"
//           className="w-full h-full object-cover"
//         />
//       </div>

//       <div className="max-w-3xl mx-auto px-8">
//         {/* Profile Header */}
//         <div className="flex justify-between items-center py-6">
//           <div className="flex items-center space-x-4">
//             <div className="w-20 h-20 rounded-full bg-gray-300 -mt-16 overflow-hidden border-4 border-black">
//               <img
//                 src={userData.profile_image ?  'http://localhost:8000'+userData.profile_image  : '/prfl.png'}
//                 alt="Profile avatar"
//                 className="w-full h-full"
//               />
//             </div>
//             <div>
//               <h1 className="text-2xl font-semibold">{userData.username}</h1>
//               <p className="text-gray-400">{userData.email}</p>
//             </div>
//           </div>
// 		  <input
//             type="file"
//             ref={fileInputRef}
//             onChange={handleFileChange}
//             accept="image/*"
//             className="hidden"
//         />
//           <div className="flex items-center space-x-3">
//             <button 
// 			className="bg-red-700 px-4 py-2 rounded hover:bg-red-800 transition flex items-center space-x-2"
// 			onClick={() => fileInputRef.current?.click()}
// 			disabled={isUploading}
// 			>
// 			<Camera size={20} />
// 			<span>{isUploading ? 'Uploading...' : 'Change'}</span>
//             </button>
//           </div>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit}>
//           {error && <p className="text-red-500 mb-4">{error}</p>}
//           {success && <p className="text-green-500 mb-4">{success}</p>}
          
//           <div className="space-y-8 py-8">
//             <div>
//               <label className="block text-gray-400 mb-2">nickname</label>
//               <input
//                 type="text"
//                 name="nickname"
//                 value={userData.nickname}
//                 onChange={handleChange}
//                 className="w-full bg-white text-black px-4 py-3 rounded"
//               />
//             </div>

//             <div>
//               <label className="block text-gray-400 mb-2">Current Password</label>
//               <input
//                 type="password"
//                 name="password"
//                 value={userData.password}
//                 onChange={handleChange}
//                 className="w-full bg-white text-black px-4 py-3 rounded"
//               />
//             </div>

//             <div>
//               <label className="block text-gray-400 mb-2">New Password</label>
//               <input
//                 type="password"
//                 name="repeatPassword"
//                 value={userData.repeatPassword}
//                 onChange={handleChange}
//                 className="w-full bg-white text-black px-4 py-3 rounded"
//               />
//             </div>

//             <div className="flex justify-between pt-4">
//               <button 
//                 className="bg-red-700 px-8 py-2 rounded hover:bg-red-800 transition" 
//                 type="submit"
//                 disabled={isLoading}
//               >
//                 {isLoading ? 'Saving...' : 'Save'}
//               </button>
//             </div>
//           </div>
//         </form>
// 		<div>	
			
// 		</div>
//       </div>
	  
//     </div>
//   );
// };

// export default ProfileSettings;

'use client';
import React, { useState, useEffect, useRef } from 'react';
import api from '@/app/utils/api';
import { Camera } from 'lucide-react';
// import { Alert, AlertDescription } from '@/components/ui/alert';
import { Alert, AlertDescription } from '@/components/auth/alert';
import TwoFactorAuth from '@/components/auth/2fa';

interface UserData {
  email: string;
  username: string;
  nickname: string;
  password: string;
  repeatPassword: string;
  profile_image: string;
  twoFactorEnabled: boolean;
}

const ProfileSettings: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    email: '',
    username: '',
    nickname: '',
    password: '',
    repeatPassword: '',
    profile_image: '',
    twoFactorEnabled: false
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
	setError('');
    setSuccess('');
    
    const formData = new FormData();
    formData.append('profile_image', file);
    
    try {
      const response = await api.put('/profile/image/', formData);
      
      if (response.status === 200) {
        if (response.data.error) {
          throw new Error(response.data.error);
        }
      
        setUserData(prev => ({
          ...prev,
          profile_image: response.data.image_url,
        }));
        
        setSuccess(response.data.message);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handle2FAStatusChange = (status: boolean): void => {
    setUserData(prev => ({ ...prev, twoFactorEnabled: status }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData: {
        nickname: string;
        currentPassword?: string;
        newPassword?: string;
      } = {
        nickname: userData.nickname
      };

      if (userData.password && userData.repeatPassword) {
        updateData.currentPassword = userData.password;
        updateData.newPassword = userData.repeatPassword;
      } else if ((userData.password && !userData.repeatPassword) || (!userData.password && userData.repeatPassword)) {
        throw new Error('Please fill both PASSWORD & NEW PASSWORD if you want to update your password');
      }

      const response = await api.put('/update_user/', updateData);

      if (response.status === 200) {
        if (response.data.error) {
          throw new Error(response.data.error);
        }

        setUserData(prev => ({
          ...prev,
          password: '',
          repeatPassword: ''
        }));
        
        setSuccess('Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async (): Promise<void> => {
      try {
        const response = await api.get('/user/');

        if (response.status === 200) {
          const data = response.data;
          setUserData(prevData => ({
            ...data,
            password: '',
            repeatPassword: ''
          }));
        } else {
          throw new Error('Failed to fetch user data');
        }
      } catch (error) {
        setError('Failed to fetch user data');
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="w-full min-h-screen bg-black text-white">
      <div className="w-full h-48 overflow-hidden">
        <img
          src="/background.jpeg"
          alt="Profile banner"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-3xl mx-auto px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gray-300 -mt-16 overflow-hidden border-4 border-black">
              <img
                src={userData.profile_image ? `http://localhost:8000${userData.profile_image}` : '/prfl.png'}
                alt="Profile avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{userData.username}</h1>
              <p className="text-gray-400">{userData.email}</p>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <div className="flex items-center space-x-3">
            <button 
              className="bg-red-700 px-4 py-2 rounded hover:bg-red-800 transition flex items-center space-x-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Camera size={20} />
              <span>{isUploading ? 'Uploading...' : 'Change'}</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
          {success && <Alert className="mb-4 bg-green-700"><AlertDescription>{success}</AlertDescription></Alert>}
          
          <div className="space-y-8 py-8">
            <div>
              <label className="block text-gray-400 mb-2">Nickname</label>
              <input
                type="text"
                name="nickname"
                value={userData.nickname}
                onChange={handleChange}
                className="w-full bg-white text-black px-4 py-3 rounded"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Current Password</label>
              <input
                type="password"
                name="password"
                value={userData.password}
                onChange={handleChange}
                className="w-full bg-white text-black px-4 py-3 rounded"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">New Password</label>
              <input
                type="password"
                name="repeatPassword"
                value={userData.repeatPassword}
                onChange={handleChange}
                className="w-full bg-white text-black px-4 py-3 rounded"
              />
            </div>

            {/* 2FA Section */}
            <TwoFactorAuth 
              enabled={userData.twoFactorEnabled}
              onStatusChange={handle2FAStatusChange}
            />

            <div className="flex justify-between pt-4">
              <button 
                className="bg-red-700 px-8 py-2 rounded hover:bg-red-800 transition" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;