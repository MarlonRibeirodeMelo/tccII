import React from 'react';
import Navbar from '../components/Navbar';
import WindowManager from '../components/WindowManager';
import { useIsDesktop } from '../contexts/useScreenSize';
import AndroidNavbar from '../components/AndroidNavbar'; // Nova Navbar para Android
function HomePage() {
  const isDesktopLike = useIsDesktop(1024);

  return (
    <div>
      <>
     
      <WindowManager />
      <Navbar />
      </>
    </div>
  );
}

export default HomePage;