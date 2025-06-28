import { useState, useEffect } from 'react';

export function useIsDesktop(breakpoint = 1024) {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' && window.innerWidth >= breakpoint
  );
  

  useEffect(() => {
    function handleResize() {
      if (typeof window !== 'undefined') {
        setIsDesktop(window.innerWidth >= breakpoint);
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isDesktop;
}



  export function useIsMobile(breakpoint = 1024) {
    const [isDesktop, setIsDesktop] = useState(
      typeof window !== 'undefined' && window.innerWidth >= breakpoint
    );
    
  
    useEffect(() => {
      function handleResize() {
        if (typeof window !== 'undefined') {
          setIsDesktop(window.innerWidth >= breakpoint);
        }
      }
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);
  
    return isDesktop;
  }
  
