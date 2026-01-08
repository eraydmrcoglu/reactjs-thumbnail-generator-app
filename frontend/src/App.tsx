import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./globals.css";
import LenisScroll from "./components/LenisScroll";
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import Generate from "./pages/Generate";
import MyGenerations from "./pages/MyGeneration";
import YtPreview from "./pages/YtPreview";
import Login from "./components/Login";

export default function Page() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <>
            <Toaster />
            <LenisScroll />
            <Navbar />

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/generate" element={<Generate />} />
                <Route path="/generate/:id" element={<Generate />} />
                <Route path="/myGenerations" element={<MyGenerations />} />
                <Route path="/ytPreview" element={<YtPreview />} />
                <Route path="/login" element={<Login />} />
            </Routes>

            <Footer />
        </>
    );
}