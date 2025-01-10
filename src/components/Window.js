import React, { useRef } from "react";
import Draggable from "react-draggable";
import { FaTimes, FaMinus } from "react-icons/fa";

const Window = ({
    title,
    children,
    onClose,
    onMinimize,
    onClick,
    position,
    zIndex,
    onDragStop,
}) => {

    const nodeRef = useRef(null);

    return (
        <Draggable
            nodeRef={nodeRef}
            handle=".window-title-bar"
            defaultPosition={position}
            onStop={onDragStop}
        >
            <div
                ref={nodeRef}
                style={{
                    position: "absolute",
                    width: "40vw", // 40% of viewport width
                    minWidth: "300px",
                    height: "60vh", // 60% of viewport height
                    minHeight: "200px",
                    backgroundColor: "#1e1e2e", // Catppuccin Mocha base
                    color: "#cdd6f4", // Text color
                    borderRadius: "10px",
                    boxShadow: "0px 4px 8px rgba(0,0,0,0.5)",
                    overflow: "hidden",
                    zIndex,
                }}
                onClick={onClick} // bring to top
            >
                <div
                    className="window-title-bar"
                    style={{
                        backgroundColor: "#313244", // bit darker
                        padding: "10px",
                        cursor: "move",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span style={{ fontWeight: "bold", color: "#94e2d5" }}>{title}</span>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // prevent triggering focus
                                onMinimize();
                            }}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#fab387",
                                cursor: "pointer",
                            }}
                        >
                            <FaMinus />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // prevent triggering focus
                                onClose();
                            }}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#f38ba8",
                                cursor: "pointer",
                            }}
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>
                <div style={{ padding: "10px", height: "calc(100% - 40px)", backgroundColor: "#181825" }}>
                    {children}
                </div>
            </div>
        </Draggable>
    );
};

export default Window;
