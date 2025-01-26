import { useState, useEffect } from "react";

const useIsTouchDevice = (): boolean => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      // Check for touch screen capability using window.matchMedia
      const hasTouchCapability =
        window.matchMedia("(pointer: coarse)").matches ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0;

      setIsTouchDevice(hasTouchCapability);
    };

    checkTouchDevice();
  }, []);

  return isTouchDevice;
};

export default useIsTouchDevice;
