import React, { useState, useMemo } from "react";
import { FaImage, FaPalette, FaDesktop, FaUpload } from "react-icons/fa";
import { HexColorPicker, HexColorInput } from 'react-colorful';

// max local storage size; 10 mb
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const Settings = ({ currentWallpaper, setWallpaper }) => {
    const [activeTab, setActiveTab] = useState("wallpaper");
    const [localWallpaper, setLocalWallpaper] = useState(() => {
        const saved = localStorage.getItem("customWallpaper");
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Parse saved custom wallpaper fail", e);
            }
        }
        return null;
    });

    const wallpapers = useMemo(
        () => [
            {
                name: "Evening Sky",
                url: "https://raw.githubusercontent.com/zhichaoh/catppuccin-wallpapers/main/landscapes/evening-sky.png",
            },
            {
                name: "Shaded Landscape",
                url: "https://raw.githubusercontent.com/zhichaoh/catppuccin-wallpapers/refs/heads/main/landscapes/shaded_landscape.png",
            },
            {
                name: "Arch",
                url: "https://raw.githubusercontent.com/zhichaoh/catppuccin-wallpapers/refs/heads/main/os/arch-black-4k.png",
            },
            {
                name: "Nix",
                url: "https://raw.githubusercontent.com/zhichaoh/catppuccin-wallpapers/refs/heads/main/os/nix-black-4k.png"
            },
            {
                name: "Pink Cat",
                url: "https://raw.githubusercontent.com/zhichaoh/catppuccin-wallpapers/refs/heads/main/minimalistic/pink-cat.png",
            },
            {
                name: "Lavender  Cat",
                url: "https://raw.githubusercontent.com/zhichaoh/catppuccin-wallpapers/refs/heads/main/minimalistic/lavender-cat.png",
            },
        ],
        []
    );

    const settingsTabs = useMemo(
        () => [
            { id: "wallpaper", name: "Wallpaper", icon: <FaImage /> },
            { id: "theme", name: "Theme", icon: <FaPalette /> },
            { id: "display", name: "Display", icon: <FaDesktop /> },
        ],
        []
    );

    const CustomWallpaperSettings = ({ wallpaper, onChange }) => {
        console.log("CustomWallpaperSettings rendered", wallpaper);

        const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

        const handleModeChange = (mode) => {
            onChange({
                ...wallpaper,
                displayMode: mode,
            });
        };

        const handleColorChange = (newColor) => {
            onChange({
                ...wallpaper,
                bgColor: newColor,
            });
        };

        return (
            <div style={{ marginTop: "15px" }}>
                {/* <div style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", marginBottom: "5px" }}>
                        Background Color:
                    </label>
                    <div 
                        style={{
                            width: '100%',
                            height: '40px',
                            backgroundColor: wallpaper.bgColor || "#1e1e2e",
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginBottom: '10px',
                            border: '1px solid #585b70'
                        }}
                        // onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                    />
                    {isColorPickerOpen && (
                        <div style={{ 
                            marginBottom: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                        }}>
                            <HexColorPicker 
                                color={wallpaper.bgColor || "#1e1e2e"} 
                                onChange={handleColorChange} 
                                style={{ width: '100%' }}
                            />
                            <HexColorInput
                                color={wallpaper.bgColor || "#1e1e2e"}
                                onChange={handleColorChange}
                                prefixed
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    backgroundColor: '#313244',
                                    color: '#cdd6f4',
                                    border: '1px solid #585b70',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>
                    )}
                </div> */}

                <div>
                    <label style={{ display: "block", marginBottom: "5px" }}>
                        Display Mode:
                    </label>
                    <div style={{ display: "flex", gap: "10px" }}>
                        {["cover", "contain"].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => handleModeChange(mode)}
                                style={{
                                    flex: 1,
                                    padding: "8px",
                                    backgroundColor:
                                        wallpaper.displayMode === mode
                                            ? "#585b70"
                                            : "#45475a",
                                    color: "#cdd6f4",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                            >
                                {mode === "cover" ? "Fill" : "Fit"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match("image.*")) {
            alert("Must be an image file");
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            alert("File size exceeds 10MB limit");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            const customWallpaper = {
                name: "Custom Wallpaper",
                url: dataUrl,
                isLocal: true,
                bgColor: "#313244", // default bg color
                displayMode: "cover", // default cover
            };
            setWallpaper(customWallpaper);
            setLocalWallpaper(customWallpaper);
        };
        reader.onerror = () => {
            alert("Error reading file");
        };
        reader.readAsDataURL(file);
    };

    const handleWallpaperSelect = (wallpaper) => {
        setWallpaper(wallpaper);
        if (wallpaper.isLocal) {
            setLocalWallpaper(wallpaper);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                height: "100%",
                backgroundColor: "#1e1e2e",
                color: "#cdd6f4",
            }}
        >
            {/* left side */}
            <div
                style={{
                    width: "200px",
                    padding: "10px",
                    borderRight: "1px solid #313244",
                    overflowY: "auto",
                    backgroundColor: "#181825",
                    /* scrollbar */
                    scrollbarWidth: "thin",
                    scrollbarColor: "#585b70 #1e1e2e",
                    /* WebKit fallbacks */
                    "&::WebkitScrollbar": {
                        width: "10px",
                    },
                    "&::WebkitScrollbarTrack": {
                        background: "#1e1e2e",
                    },
                    "&::WebkitScrollbarThumb": {
                        backgroundColor: "#585b70",
                        borderRadius: "5px",
                        border: "2px solid #1e1e2e",
                    },
                    "&::WebkitScrollbarThumb:hover": {
                        backgroundColor: "#7f849c",
                    },
                }}
            >
                <h3 style={{ marginBottom: "20px", color: "#f38ba8" }}>
                    Settings
                </h3>

                <ul style={{ listStyle: "none", padding: 0 }}>
                    {settingsTabs.map((tab) => (
                        <li
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: "10px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                borderRadius: "4px",
                                backgroundColor:
                                    activeTab === tab.id
                                        ? "#313244"
                                        : "transparent",
                                color:
                                    activeTab === tab.id
                                        ? "#fab387"
                                        : "#cdd6f4",
                                marginBottom: "5px",
                                transition: "all 0.2s",
                            }}
                        >
                            <span style={{ marginRight: "10px" }}>
                                {tab.icon}
                            </span>
                            {tab.name}
                        </li>
                    ))}
                </ul>
            </div>

            {/* main */}
            <div
                style={{
                    flex: 1,
                    padding: "20px",
                    overflowY: "auto" /* scrollbar */,
                    scrollbarWidth: "thin",
                    scrollbarColor: "#585b70 #1e1e2e",
                    /* WebKit fallbacks */
                    "&::WebkitScrollbar": {
                        width: "10px",
                    },
                    "&::WebkitScrollbarTrack": {
                        background: "#1e1e2e",
                    },
                    "&::WebkitScrollbarThumb": {
                        backgroundColor: "#585b70",
                        borderRadius: "5px",
                        border: "2px solid #1e1e2e",
                    },
                    "&::WebkitScrollbarThumb:hover": {
                        backgroundColor: "#7f849c",
                    },
                }}
            >
                {/* wallpaper tab */}
                {activeTab === "wallpaper" && (
                    <div>
                        <h2 style={{ color: "#f5c2e7", marginBottom: "20px" }}>
                            Wallpaper
                        </h2>

                        {/* upload custom */}
                        <div
                            style={{
                                marginBottom: "30px",
                                padding: "20px",
                                backgroundColor: "#313244",
                                borderRadius: "8px",
                            }}
                        >
                            <h3
                                style={{
                                    marginBottom: "15px",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <FaUpload style={{ marginRight: "10px" }} />
                                Custom Wallpaper
                            </h3>
                            <input
                                type="file"
                                id="wallpaper-upload"
                                accept="image/*"
                                onChange={handleFileUpload}
                                style={{ display: "none" }}
                            />
                            <label
                                htmlFor="wallpaper-upload"
                                style={{
                                    display: "inline-block",
                                    padding: "10px 15px",
                                    backgroundColor: "#45475a",
                                    color: "#cdd6f4",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    transition: "background-color 0.2s",
                                    ":hover": {
                                        backgroundColor: "#585b70",
                                    },
                                }}
                            >
                                Choose File
                            </label>
                            {localWallpaper && (
                                <>
                                    <div
                                        style={{
                                            marginTop: "10px",
                                            fontStyle: "italic",
                                        }}
                                    >
                                        Custom wallpaper loaded
                                    </div>
                                    <CustomWallpaperSettings
                                        wallpaper={localWallpaper}
                                        onChange={(settings) => {
                                            const updated = {
                                                ...localWallpaper,
                                                ...settings,
                                            };
                                            setLocalWallpaper(updated);
                                            setWallpaper(updated);
                                        }}
                                    />
                                </>
                            )}
                        </div>

                        {/* wallpaper grid */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fill, minmax(200px, 1fr))",
                                gap: "20px",
                            }}
                        >
                            {/* custom wallpaper */}
                            {localWallpaper && (
                                <div
                                    key="custom-wallpaper"
                                    onClick={() =>
                                        handleWallpaperSelect(localWallpaper)
                                    }
                                    style={{
                                        cursor: "pointer",
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        border: `2px solid ${
                                            currentWallpaper ===
                                            localWallpaper.url
                                                ? "#fab387"
                                                : "transparent"
                                        }`,
                                        transition: "border-color 0.2s",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "100%",
                                            height: "120px",
                                            backgroundColor:
                                                localWallpaper.bgColor ||
                                                "#1e1e2e",
                                            position: "relative",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                backgroundImage: `url(${localWallpaper.url})`,
                                                backgroundSize:
                                                    localWallpaper.displayMode ||
                                                    "cover",
                                                backgroundPosition: "center",
                                                backgroundRepeat: "no-repeat",
                                            }}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            padding: "8px",
                                            backgroundColor: "#313244",
                                            textAlign: "center",
                                        }}
                                    >
                                        Custom Wallpaper
                                    </div>
                                </div>
                            )}

                            {/* preset */}
                            {wallpapers.map((wallpaper) => (
                                <div
                                    key={wallpaper.url}
                                    onClick={() =>
                                        handleWallpaperSelect(wallpaper)
                                    }
                                    style={{
                                        cursor: "pointer",
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        border: `2px solid ${
                                            currentWallpaper === wallpaper.url
                                                ? "#fab387"
                                                : "transparent"
                                        }`,
                                        transition: "border-color 0.2s",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "100%",
                                            height: "120px",
                                            backgroundImage: `url(${wallpaper.url})`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                            filter: "brightness(0.7)",
                                        }}
                                    />
                                    <div
                                        style={{
                                            padding: "8px",
                                            backgroundColor: "#313244",
                                            textAlign: "center",
                                        }}
                                    >
                                        {wallpaper.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* theme tab */}
                {activeTab === "theme" && (
                    <div>
                        <h2 style={{ color: "#f5c2e7", marginBottom: "20px" }}>
                            Theme Settings
                        </h2>
                        <p>To be implemented...</p>
                    </div>
                )}
                {/* display tab */}
                {activeTab === "display" && (
                    <div>
                        <h2 style={{ color: "#f5c2e7", marginBottom: "20px" }}>
                            Display Settings
                        </h2>
                        <p>To be implemented...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
