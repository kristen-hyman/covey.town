import React from 'react';
import { Button, useToast } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleLogin, GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import CoveyTownUser from './User';
import useCoveyAppState from '../../hooks/useCoveyAppState';


const clientId: string = process.env.REACT_APP_GOOGLE_CLIENT_ID || ''; 

function LoginHooks(): JSX.Element {
  const { dbClient } = useCoveyAppState();
  const toast = useToast();

  const refreshTokenSetup = (res: GoogleLoginResponse) => {
    let refreshTiming = (res.tokenObj.expires_in || 3600 - 5 * 60) * 1000;
  
    const refreshToken = async () => {
      const newAuthRes = await res.reloadAuthResponse();
      refreshTiming = (newAuthRes.expires_in || 3600 - 5 * 60) * 1000;

      localStorage.setItem('authToken', newAuthRes.id_token);
  
      setTimeout(refreshToken, refreshTiming);
    };
  
    setTimeout(refreshToken, refreshTiming);
  };

  async function checkUserExistsInDB(res: GoogleLoginResponse) {
    const userExists = await dbClient.userExistence({ email: res.profileObj.email });

    if (userExists) {
      await dbClient.setOnlineStatus({ email: res.profileObj.email, isOnline: true });
      await dbClient.setUserLocation({ email: res.profileObj.email, location: "Lobby" });
    } else {
      await dbClient.addUser({ user: { firstName: res.profileObj.givenName, lastName: res.profileObj.familyName, email: res.profileObj.email, friends: [], isOnline: true, location: "Lobby" }});
    }
  }

  function instanceOfGoogleLoginResponse(res: GoogleLoginResponse | GoogleLoginResponseOffline): res is GoogleLoginResponse {
    return 'profileObj' in res;
  }
  
  const onSuccess = (res: GoogleLoginResponse | GoogleLoginResponseOffline) => {
    if (instanceOfGoogleLoginResponse(res)) {
      const userProfile = CoveyTownUser.getInstance();
      userProfile.setUserEmail(res.profileObj.email);
      userProfile.setUserName(res.profileObj.givenName);
      userProfile.setUserStatus(true);

      // Checking if user exists in database
      checkUserExistsInDB(res);

      toast({
        title: 'Login Successful!',
        description: `Welcome to your account ${res.profileObj.givenName}`,
        status: 'success',
      })
      
    refreshTokenSetup(res);
    }
  };

  const onFailure = () => {
    toast({
      title: 'Google Login failed',
      status: 'error',
    });
  };

  const { signIn } =  useGoogleLogin({
    onSuccess,
    onFailure,
    clientId,
    isSignedIn: true,
    accessType: 'offline',
  });

  return (
    <Button 
        leftIcon={<FcGoogle />} 
        size="lg"
        colorScheme="Google" 
        variant="solid" 
        color="blue.500" 
        border="2px" 
        borderColor="blue.500"
        _hover={{ bg: "#ebedf0" }} 
        onClick={signIn}
    >
    Sign in
    </Button>
  );
}

export default LoginHooks;