import React from "react";
import { View } from "react-desktop/macOs";
import { FaFolder, FaTerminal, FaCog } from "react-icons/fa";

const Dock = ({ openWindow, windows }) => {
    const isWindowOpen = (type) =>
        windows.some((win) => win.type === type && !win.minimized);

    const isWindowMinimized = (type) =>
        windows.some((win) => win.type ===type && win.minimized);

    return (
        <View
            style={{
                position: "fixed",
                bottom: "10px",
                left: "20%",
                right: "20%",
                padding: "10px",
                backgroundColor: "#a6adc8", // subtext 0
                opacity: 0.7, 
                borderRadius: "15px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                display: "flex",
                justifyContent: "space-evenly",
                alignItems: "center",
            }}
        >
            <div onClick={() => openWindow("files")} style={{ cursor: "pointer" }}>
                <FaFolder size={40} />
                {(isWindowOpen("files") || isWindowMinimized("files")) && (
                    <div
                        style={{
                            width: "8px",
                            height: "8px",
                            backgroundColor: isWindowMinimized("files") ? "#6c7086" : "#f5c2e7", // overlay 0 : pink
                            borderRadius: "50%",
                            marginTop: "5px",
                            marginLeft: "15px",
                        }}
                    />
                )}
            </div>
            <div onClick={() => openWindow("terminal")} style={{ cursor: "pointer" }}>
                <FaTerminal size={40} />
                {(isWindowOpen("terminal") || isWindowMinimized("terminal")) && (
                    <div
                        style={{
                            width: "8px",
                            height: "8px",
                            backgroundColor: isWindowMinimized("terminal") ? "#6c7086" : "#f5c2e7",
                            borderRadius: "50%",
                            marginTop: "5px",
                            marginLeft: "15px",
                        }}
                    />
                )}
            </div>
            <div onClick={() => openWindow("settings")} style={{ cursor: "pointer" }}>
                <FaCog size={40} />
                {(isWindowOpen("settings") || isWindowMinimized("settings")) && (
                    <div
                        style={{
                            width: "8px",
                            height: "8px",
                            backgroundColor: isWindowMinimized("settings") ? "#6c7086" : "#f5c2e7",
                            borderRadius: "50%",
                            marginTop: "5px",
                            marginLeft: "15px",
                        }}
                    />
                )}
            </div>
        </View>
    );
};

export default Dock;
