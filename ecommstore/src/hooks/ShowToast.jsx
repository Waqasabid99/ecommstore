import { useState, useEffect } from "react";

export function useShowToast(duration = 3000) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success"); // "success" or "error"

  const show = (msg, toastType = "success") => {
    setMessage(msg);
    setType(toastType);
    setVisible(true);
  };

  const hide = () => setVisible(false);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  return { visible, message, type, show, hide };
}