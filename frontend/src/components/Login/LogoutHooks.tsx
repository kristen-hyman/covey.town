import React from 'react';
import { Button, useToast } from '@chakra-ui/react';
import { useGoogleLogout } from 'react-google-login';
import CoveyTownUser from './User';
import useCoveyAppState from '../../hooks/useCoveyAppState';

const clientId: string = process.env.REACT_APP_GOOGLE_CLIENT_ID || ''; 

function LogoutHooks(): JSX.Element {
  const { dbClient } = useCoveyAppState();
  const toast = useToast();

  async function setOffline() {
    const userProfile = CoveyTownUser.getInstance();
    const userEmail = userProfile.getUserEmail();
    userProfile.setUserStatus(false);
    await dbClient.setOnlineStatus({ email: userEmail, isOnline: false });
    await dbClient.setUserLocation({ email: userEmail, location: "" });
  }

  const onLogoutSuccess = () => {
    toast({
      title: 'Logout Successful!',
      description: 'Your account has been signed out.',
      status: 'success',
    });
    setOffline();
  };

  const onFailure = () => {
    toast({
      title: 'Logged out failed!',
      description: 'Error: Your account could not be signed out',
      status: 'error',
    });
  };

  const { signOut } = useGoogleLogout({
    clientId,
    onLogoutSuccess,
    onFailure,
  });

  return (
    <Button onClick={signOut} className="button">
      {/* <img src="icons/google.svg" alt="google login" className="icon"></img> */}

      <span className="buttonText">Sign out</span>
    </Button>
  );
}

export default LogoutHooks;