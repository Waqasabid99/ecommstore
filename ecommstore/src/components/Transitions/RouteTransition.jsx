"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

const RouteTransition = ({ children }) => {
    const pathname = usePathname();
    if (pathname.startsWith("/checkout") || pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/reset-password") || pathname.startsWith("/forgot-password")) {
        return <>{children}</>;
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{
                    duration: 0.35,
                    ease: "easeInOut",
                }}
                className="min-h-screen"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

export default RouteTransition;