import illustration from "@/assets/idea_4.svg"
import FormComponent from "@/components/forms/FormComponent"
import React, { useState, useEffect } from "react"
import { motion, useViewportScroll, useTransform } from "framer-motion"
import AOS from "aos"
import "aos/dist/aos.css"
import "@/styles/hero.css"

function HomePage() {
    useEffect(() => {
        if (typeof window !== "undefined") {
            AOS.init({
                duration: 1000,
                once: true,
                mirror: false,
            })
        }
    }, [])

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950">
            <Hero />
        </div>
    )
}

function Hero() {
    const [scanning, setScanning] = useState(false)
    const [progress, setProgress] = useState(0)
    const { scrollYProgress } = useViewportScroll()
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

    useEffect(() => {
        let interval
        if (scanning) {
            interval = setInterval(() => {
                setProgress((prev) => (prev >= 100 ? 0 : prev + 2))
            }, 50)
        }
        return () => clearInterval(interval)
    }, [scanning])

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 },
    }

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative flex min-h-screen w-full items-center justify-center overflow-hidden"
        >
            <ParticleBackground />

            <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center">
                <motion.div
                    {...fadeIn}
                    className="text-center"
                    data-aos="fade-up"
                >
                    <div className="my-12 flex h-full w-full flex-col items-center justify-evenly sm:flex-row sm:pt-0">
                        {/* Illustration Container */}
                        <div className="flex w-full animate-up-down justify-center sm:mb-8 sm:w-1/2 sm:pl-4">
                            <img
                                src={illustration}
                                alt="Codo-Craft"
                                className="mx-auto w-[250px] sm:w-[400px]"
                            />
                        </div>

                        {/* Form Container */}
                        <div className="flex w-full items-center justify-center sm:mt-8 sm:w-1/2">
                            <FormComponent />
                        </div>
                    </div>
                </motion.div>
            </div>

            <ScrollIndicator />
        </motion.main>
    )
}

function ParticleBackground() {
    return (
        <>
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute h-1 w-1 rounded-full bg-blue-500"
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                    }}
                    animate={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.1, 0.3],
                    }}
                    transition={{
                        duration: 15 + Math.random() * 25,
                        repeat: Infinity,
                    }}
                />
            ))}
        </>
    )
}

function ScrollIndicator() {
    const { scrollYProgress } = useViewportScroll()
    const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

    return (
        <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 h-1 bg-blue-500"
            style={{ scaleX, transformOrigin: "0%" }}
        />
    )
}

export default HomePage
