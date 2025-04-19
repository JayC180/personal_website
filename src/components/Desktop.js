import React, { useState, useCallback } from "react";
import TopBar from "./TopBar";
import Dock from "./Dock";
import Window from "./Window";
import FileManager from "./FileManager";
import Terminal from "./Terminal";
import Settings from "./Settings";
import DesktopOverlay from "./DesktopOverlay";

const Desktop = () => {
    const [windows, setWindows] = useState([]);
    const [currentWallpaper, setCurrentWallpaper] = useState(() => {
        // init render, load from localstorage
        const savedWallpaper = localStorage.getItem("wallpaper");
        if (savedWallpaper) {
            try {
                const { type, url } = JSON.parse(savedWallpaper);
                if (type === "local" || type === "remote") {
                    return url;
                }
            } catch (e) {
                console.error("Failed to parse wallpaper", e);
            }
        }
        // default
        return "https://raw.githubusercontent.com/zhichaoh/catppuccin-wallpapers/main/landscapes/evening-sky.png";
    });

    const setWallpaperWithStorage = useCallback((wallpaper) => {
        try {
            localStorage.setItem("wallpaper", JSON.stringify({
                type: wallpaper.isLocal ? "local" : "remote",
                url: wallpaper.url,
                name: wallpaper.name
            }));
            setCurrentWallpaper(wallpaper.url);
        } catch (e) {
            console.error("Failed to save wallpaper", e);
            if (e.name === 'QuotaExceededError') {
                alert("Cannot save wallpaper - storage limit exceeded (max 5MB)");
            }
        }
    }, []);


    const openWindow = (type) => {
        // check if already opened
        const existingWindow = windows.find((win) => win.type === type);
        const maxZIndex = Math.max(...windows.map((win) => win.zIndex), 0);

        if (existingWindow && existingWindow.minimized) {
            // restore minimized win
            setWindows((prev) =>
                prev.map((win) =>
                    win.type === type
                        ? { ...win, minimized: false, zIndex: maxZIndex + 1 }
                        : win
                )
            );
        } else if (!existingWindow) {
            // new win
            setWindows((prev) => [
                ...prev,
                {
                    type,
                    minimized: false,
                    position: { x: 100, y: 100 }, // default pos for new win
                    zIndex: maxZIndex + 1, // set z
                },
            ]);
        }
    };

    const closeWindow = (type) => {
        setWindows((prev) => prev.filter((win) => win.type !== type));
    };

    const minimizeWindow = (type) => {
        setWindows((prev) =>
            prev.map((win) =>
                win.type === type ? { ...win, minimized: true } : win
            )
        );
    };

    const updatePosition = (type, position) => {
        setWindows((prev) =>
            prev.map((win) => (win.type === type ? { ...win, position } : win))
        );
    };

    const focusWindow = (type) => {
        const maxZIndex = Math.max(...windows.map((win) => win.zIndex), 0);
        setWindows((prev) =>
            prev.map((win) =>
                win.type === type ? { ...win, zIndex: maxZIndex + 1 } : win
            )
        );
    };

    return (
        <div
            style={{
                backgroundImage: `url('${currentWallpaper}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "100vh",
                width: "100vw",
            }}
        >
            <TopBar />
            <Dock openWindow={openWindow} windows={windows} />
            <DesktopOverlay openWindow={openWindow} />
            {windows
                .sort((a, b) => a.zIndex - b.zIndex) // sort windows by z-index
                .map(
                    (win) =>
                        !win.minimized && (
                            <Window
                                key={win.type}
                                title={
                                    win.type === "files"
                                        ? "File Manager"
                                        : win.type === "terminal"
                                        ? "Terminal"
                                        : "Settings"
                                }
                                onClose={() => closeWindow(win.type)}
                                onMinimize={() => minimizeWindow(win.type)}
                                onClick={() => focusWindow(win.type)}
                                position={win.position}
                                zIndex={win.zIndex}
                                onDragStop={(e, data) =>
                                    updatePosition(win.type, {
                                        x: data.x,
                                        y: data.y,
                                    })
                                }
                            >
                                {win.type === "files" && <FileManager />}
                                {win.type === "terminal" && <Terminal />}
                                {win.type === "settings" && (
                                    <Settings
                                        currentWallpaper={currentWallpaper}
                                        setWallpaper={setWallpaperWithStorage}
                                    />
                                )}
                            </Window>
                        )
                )}
        </div>
    );
};

export default Desktop;
