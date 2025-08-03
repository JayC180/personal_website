import React, { useState, useCallback } from "react";
import TopBar from "./TopBar";
import Dock from "./Dock";
import Window from "./Window";
import FileManager from "./FileManager";
import Terminal from "./Terminal";
import Settings from "./Settings";
import DesktopOverlay from "./DesktopOverlay";
import AlertModal from "./AlertModal";

const Desktop = () => {
    const [windows, setWindows] = useState([]);
    
    const [alertMessage, setAlertMessage] = useState(null);
    const showAlert = (message) => setAlertMessage(message);

    const [currentWallpaper, setCurrentWallpaper] = useState(() => {
        // init render, load from localstorage
        const savedWallpaper = localStorage.getItem("currentWallpaper");
        if (savedWallpaper) {
            try {
                return JSON.parse(savedWallpaper);
            } catch (e) {
                console.error("Failed to parse current wallpaper", e);
            }
        }

        // default
        return {
            url: "https://raw.githubusercontent.com/zhichaoh/catppuccin-wallpapers/main/landscapes/evening-sky.png",
            isLocal: false,
            bgColor: "#313244",
            displayMode: "cover",
            name: "Evening Sky",
        };
    });

    // const [customWallpaper, setCustomWallpaper] = useState(() => {
    //     const saved = localStorage.getItem("customWallpaper");
    //     if (saved) {
    //         try {
    //             return JSON.parse(saved);
    //         } catch (e) {
    //             console.error("Failed to parse custom wallpaper", e);
    //         }
    //     }
    //     return null;
    // });

    const setWallpaperWithStorage = useCallback((wallpaper) => {
        try {
            // save current choice
            const wallpaperToSave = {
                url: wallpaper.url,
                isLocal: wallpaper.isLocal,
                bgColor: wallpaper.bgColor || "#313244",
                displayMode: wallpaper.displayMode || "cover",
                name:
                    wallpaper.name ||
                    (wallpaper.isLocal
                        ? "Custom Wallpaper"
                        : "Preset Wallpaper"),
            };

            localStorage.setItem(
                "currentWallpaper",
                JSON.stringify(wallpaperToSave)
            );

            // save custom wallpaper
            if (wallpaper.isLocal) {
                localStorage.setItem(
                    "customWallpaper",
                    JSON.stringify(wallpaperToSave)
                );
                // setCustomWallpaper(wallpaperToSave);
            }

            setCurrentWallpaper(wallpaper);
        } catch (e) {
            console.error("Failed to save wallpaper", e);
            if (e.name === "QuotaExceededError") {
                alert(
                    "Cannot save wallpaper - storage limit exceeded (max 10 MB)"
                );
            }
        }
    }, []);

    const openWindow = (type, path = "/home/guest") => {
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
                    initialPath: path,
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

    function getAbsolutePath(file) {
        const path = [];
        let current = file;
    
        while (current?.parent) {
            path.unshift(current.name);
            current = current.parent;
        }
    
        return "/" + path.join("/");
    }

    // for clicking on folder or folder symlink on desktop
    const openWindowFromDesktop = (type, fileObj) => {
        if (type === "files" && fileObj?.type === "folder") {
            const path = getAbsolutePath(fileObj);
            openWindow(type, path);
        }
    };    

    return (
        <div
            style={{
                backgroundImage: currentWallpaper?.url
                    ? `url('${currentWallpaper.url}')`
                    : undefined,
                backgroundColor: currentWallpaper?.bgColor || "#313244",
                backgroundSize: currentWallpaper?.displayMode || "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                height: "100vh",
                width: "100vw",
            }}
        >
            <AlertModal message={alertMessage} onClose={() => setAlertMessage(null)} />
            <TopBar />
            <Dock openWindow={openWindow} windows={windows} />
            <DesktopOverlay openWindowFromDesktop={openWindowFromDesktop} openWindow={openWindow} />
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
                                {win.type === "files" && <FileManager showAlert={showAlert} initialPath={win.initialPath || "/home/guest"} />}
                                {win.type === "terminal" && <Terminal showAlert={showAlert} />}
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
