import React, { useState } from "react";
import {
    FaFolder,
    FaFile,
    FaChevronDown,
    FaChevronRight,
} from "react-icons/fa";
import { fileSystem, Folder, resolveSymlink } from "./FileSystem";
import MarkdownViewer from "./MarkdownViewer";

const shortcuts = {
    Home: "/home/guest",
    Desktop: "/home/guest/Desktop",
    Documents: "/home/guest/Documents",
    Projects: "/home/guest/Projects",
    Blog: "/home/guest/Blog",
    Wallpaper: "/home/guest/Wallpapers",
    Root: "/",
};

const FileManager = () => {
    const [currentPath, setCurrentPath] = useState("/home/guest");
    const [expandedGroups, setExpandedGroups] = useState({
        myComputer: true,
        network: true,
    });
    const [selectedMarkdown, setSelectedMarkdown] = useState(null);

    const toggleGroup = (group) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [group]: !prev[group],
        }));
    };

    const getCurrentFolderContent = () => {
        const currentFolder = fileSystem[currentPath];
        if (!currentFolder || !(currentFolder instanceof Folder)) {
            return [];
        }
        return currentFolder
            .getChildren()
            .map((child) => resolveSymlink(child, currentPath));
    };

    const handleShortcutClick = (path) => {
        const targetFolder = fileSystem[path];
        if (targetFolder && targetFolder instanceof Folder) {
            setCurrentPath(path);
        }
    };

    const breadcrumbs =
        currentPath === "Network"
            ? ["Network"]
            : currentPath.split("/").filter(Boolean);

    const handleAuthenticationPopup = () => {
        alert("Authentication required to access this folder.");
    };

    const handleFolderClick = (folderName) => {
        if (folderName === "Network") {
            setCurrentPath("Network");
            return;
        }

        const newPath =
            currentPath === "/"
                ? `/${folderName}`
                : `${currentPath}/${folderName}`;
        const targetFolder = fileSystem[newPath];
        if (targetFolder && targetFolder instanceof Folder) {
            setCurrentPath(newPath);
        } else {
            handleAuthenticationPopup();
        }
    };

    const handleFileClick = (fileName) => {
        if (!fileName.endsWith(".md")) {
            alert(
                "For now, only Markdown files (.md) are supported for viewing."
            );
            return;
        }
        setSelectedMarkdown(fileName);
    };

    const handleBreadcrumbClick = (index) => {
        const newPath = "/" + breadcrumbs.slice(0, index + 1).join("/");
        setCurrentPath(newPath);
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
            {/* left stuff */}
            <div
                style={{
                    width: "20%",
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
                    File Manager
                </h3>

                <div>
                    <div
                        onClick={() => toggleGroup("myComputer")}
                        style={{
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "5px",
                        }}
                    >
                        {expandedGroups.myComputer ? (
                            <FaChevronDown />
                        ) : (
                            <FaChevronRight />
                        )}
                        <span style={{ marginLeft: "8px" }}>My Computer</span>
                    </div>
                    {expandedGroups.myComputer && (
                        <ul
                            style={{
                                listStyle: "none",
                                padding: "5px 0",
                                marginLeft: "16px",
                            }}
                        >
                            {Object.keys(shortcuts).map((shortcut) => (
                                <li
                                    key={shortcut}
                                    onClick={() =>
                                        handleShortcutClick(shortcuts[shortcut])
                                    }
                                    style={{
                                        padding: "5px",
                                        cursor: "pointer",
                                        color:
                                            shortcuts[shortcut] === currentPath
                                                ? "#fab387"
                                                : "#cdd6f4",
                                    }}
                                >
                                    <FaFolder style={{ marginRight: "8px" }} />
                                    {shortcut}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div>
                    <div
                        onClick={() => toggleGroup("network")}
                        style={{
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            marginTop: "10px",
                        }}
                    >
                        {expandedGroups.network ? (
                            <FaChevronDown />
                        ) : (
                            <FaChevronRight />
                        )}
                        <span style={{ marginLeft: "8px" }}>Network</span>
                    </div>
                    {expandedGroups.network && (
                        <ul
                            style={{
                                listStyle: "none",
                                padding: "5px 0",
                                marginLeft: "16px",
                            }}
                        >
                            <li
                                key="Network"
                                onClick={() => handleFolderClick("Network")}
                                style={{
                                    padding: "5px",
                                    cursor: "pointer",
                                    color:
                                        currentPath === "Network"
                                            ? "#fab387"
                                            : "#cdd6f4",
                                }}
                            >
                                <FaFolder style={{ marginRight: "8px" }} />
                                Network
                            </li>
                        </ul>
                    )}
                </div>
            </div>

            {/* main stuff */}
            <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
                {/* bread */}
                <div style={{ marginBottom: "10px" }}>
                    <span
                        onClick={() => setCurrentPath("/")}
                        style={{
                            cursor: "pointer",
                            color: "#94e2d5",
                            marginRight: "5px",
                        }}
                    >
                        Root
                    </span>
                    {breadcrumbs.map((crumb, index) => (
                        <span key={index}>
                            <span style={{ margin: "5px" }}>/</span>
                            <span
                                onClick={() => handleBreadcrumbClick(index)}
                                style={{ cursor: "pointer", color: "#94e2d5" }}
                            >
                                {crumb}
                            </span>
                        </span>
                    ))}
                </div>

                {/* folders */}
                <div>
                    {getCurrentFolderContent().map((item, index) => {
                        const isFolder = item instanceof Folder;
                        return (
                            <div
                                key={index}
                                onClick={() =>
                                    isFolder
                                        ? handleFolderClick(item.name)
                                        : handleFileClick(item.name)
                                }
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "5px",
                                    cursor: "pointer",
                                    backgroundColor:
                                        index % 2 === 0
                                            ? "#313244"
                                            : "transparent",
                                }}
                            >
                                {isFolder ? (
                                    <FaFolder
                                        style={{
                                            marginRight: "8px",
                                            color: "#89b4fa",
                                        }}
                                    />
                                ) : (
                                    <FaFile
                                        style={{
                                            marginRight: "8px",
                                            color: "#f5e0dc",
                                        }}
                                    />
                                )}
                                {item.name}
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* render markdown viewer */}
            {selectedMarkdown && (
                <MarkdownViewer
                    filename={selectedMarkdown}
                    onClose={() => setSelectedMarkdown(null)}
                />
            )}
        </div>
    );
};

export default FileManager;
