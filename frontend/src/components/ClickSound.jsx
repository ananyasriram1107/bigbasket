import { useEffect } from "react";
import { playClickSound } from "../utils/sound";

const CLICKABLE_SELECTOR = "button, [role='button'], a, input[type='submit']";

// Mounted once at the app root -- listens for every click app-wide instead
// of wiring an onClick into each button individually.
export default function ClickSound() {
  useEffect(() => {
    function handleClick(event) {
      const target = event.target.closest(CLICKABLE_SELECTOR);
      if (target && !target.disabled) {
        playClickSound();
      }
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
