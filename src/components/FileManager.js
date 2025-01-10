import React, { useState } from "react";
import { FaFolder, FaFile, FaChevronDown, FaChevronRight } from "react-icons/fa";

// everything's a file
class File {
    constructor(name, type) {
        this.name = name;
        this.type = type;
    }
}

// folder class
class Folder extends File {
    constructor(name, children = {}) {
        super(name, 'folder');
        this.children = children;
    }

    addChild(file) {
        this.children[file.name] = file;
    }

    getChildren() {
        return Object.values(this.children);
    }
}

// default file sys
const rootFolder = new Folder('root');
const homeFolder = new Folder('home');
const guestFolder = new Folder('guest');

const desktopFolder = new Folder('Desktop')

const documentsFolder = new Folder('Documents');
documentsFolder.addChild(new File('jay\'s resume.pdf', 'file'));
documentsFolder.addChild(new File('notes.txt', 'file'));

const projectsFolder = new Folder('Projects')
projectsFolder.addChild(new File('project 1.zip', 'file'));

const blogFolder = new Folder('Blog')
blogFolder.addChild(new File('blog 1.md', 'file'));

const wallpapersFolder = new Folder('Wallpapers')
wallpapersFolder.addChild(new File('wallpaper 1.jpg', 'file'));

guestFolder.addChild(desktopFolder);
guestFolder.addChild(documentsFolder);
guestFolder.addChild(projectsFolder);
guestFolder.addChild(blogFolder);
guestFolder.addChild(wallpapersFolder);

homeFolder.addChild(guestFolder);

rootFolder.addChild(homeFolder);
rootFolder.addChild(new Folder('bin'));
rootFolder.addChild(new Folder('boot'));
rootFolder.addChild(new Folder('etc'));
rootFolder.addChild(new Folder('opt'));
rootFolder.addChild(new Folder('usr'))

const fileSystem = {
    '/': rootFolder,
    '/home': homeFolder,
    '/home/guest': guestFolder,
    '/home/guest/Desktop': desktopFolder,
    '/home/guest/Documents': documentsFolder,
    '/home/guest/Projects': projectsFolder,
    '/home/guest/Blog': blogFolder,
    '/home/guest/Wallpapers': wallpapersFolder,
};

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

    const toggleGroup = (group) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [group]: !prev[group],
        }));
    };

    const getCurrentFolderContent = () => {
        const currentFolder = fileSystem[currentPath];
        return currentFolder ? currentFolder.getChildren() : [];
    };

    const handleShortcutClick = (path) => {
        const targetFolder = fileSystem[path];
        if (targetFolder && targetFolder instanceof Folder) {
            setCurrentPath(path);
        }
    };

    const breadcrumbs = currentPath.split("/").filter(Boolean);

    const handleAuthenticationPopup = () => {
        alert("Authentication required to access this folder.");
    };

    const handleFolderClick = (folderName) => {
        const newPath = currentPath === "/" ? `/${folderName}` : `${currentPath}/${folderName}`;
        const targetFolder = fileSystem[newPath];
        if (targetFolder && targetFolder instanceof Folder) {
            setCurrentPath(newPath);
        } else {
            handleAuthenticationPopup();
        }
    };

    const handleBreadcrumbClick = (index) => {
        const newPath = "/" + breadcrumbs.slice(0, index + 1).join("/");
        setCurrentPath(newPath);
    };

    return (
        <div style={{ display: "flex", height: "100%", backgroundColor: "#1e1e2e", color: "#cdd6f4" }}>
            {/* left stuff */}
            <div
                style={{
                    width: "20%",
                    padding: "10px",
                    borderRight: "1px solid #313244",
                    overflowY: "auto",
                    backgroundColor: "#181825",
                }}
            >
                <h3 style={{ marginBottom: "20px", color: "#f38ba8" }}>File Manager</h3>

                <div>
                    <div
                        onClick={() => toggleGroup("myComputer")}
                        style={{ cursor: "pointer", display: "flex", alignItems: "center", marginBottom: "5px" }}
                    >
                        {expandedGroups.myComputer ? <FaChevronDown /> : <FaChevronRight />}
                        <span style={{ marginLeft: "8px" }}>My Computer</span>
                    </div>
                    {expandedGroups.myComputer && (
                        <ul style={{ listStyle: "none", padding: "5px 0", marginLeft: "16px" }}>
                            {Object.keys(shortcuts).map((shortcut) => (
                                <li
                                    key={shortcut}
                                    onClick={() => handleShortcutClick(shortcuts[shortcut])}
                                    style={{
                                        padding: "5px",
                                        cursor: "pointer",
                                        color: shortcuts[shortcut] === currentPath ? "#fab387" : "#cdd6f4",
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
                        style={{ cursor: "pointer", display: "flex", alignItems: "center", marginTop: "10px" }}
                    >
                        {expandedGroups.network ? <FaChevronDown /> : <FaChevronRight />}
                        <span style={{ marginLeft: "8px" }}>Network</span>
                    </div>
                    {expandedGroups.network && (
                        <ul style={{ listStyle: "none", padding: "5px 0", marginLeft: "16px" }}>
                            <li style={{ padding: "5px", color: "#cdd6f4" }}>
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
                        style={{ cursor: "pointer", color: "#94e2d5", marginRight: "5px" }}
                    >
                        Root
                    </span>
                    {breadcrumbs.map((crumb, index) => (
                        <span key={index}>
                            <span style={{ margin: "0 5px" }}>/</span>
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
                                onClick={() => (isFolder ? handleFolderClick(item.name) : console.log(`Opened file: ${item.name}`))}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "5px",
                                    cursor: "pointer",
                                    backgroundColor: index % 2 === 0 ? "#313244" : "transparent",
                                }}
                            >
                                {isFolder ? (
                                    <FaFolder style={{ marginRight: "8px", color: "#89b4fa" }} />
                                ) : (
                                    <FaFile style={{ marginRight: "8px", color: "#f9e2af" }} />
                                )}
                                {item.name}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default FileManager;
