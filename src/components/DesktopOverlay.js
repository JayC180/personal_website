import React from "react";
import { MdDriveFileMove, MdInsertDriveFile, MdFileOpen } from "react-icons/md";
import { fileSystem, Folder, resolveSymlink, getFileAtPath } from "./FileSystem";
import { useState } from "react";
import FileManager from "./FileManager";
import MarkdownViewer from "./MarkdownViewer";

const DesktopOverlay = () => {
    const desktopFolder = fileSystem["/home/guest/Desktop"];
    const desktopItems = desktopFolder.getChildren();

    const welcome_md = getFileAtPath("/home/guest/Desktop/welcome.md");
    const [selectedFile, setSelectedFile] = useState(welcome_md);
    const [selectedFolder, setSelectedFolder] = useState(null);

    const handleClick = (item) => {
        const resolvedItem = resolveSymlink(item, "/home/guest/Desktop");
        if (resolvedItem instanceof Folder) {
            setSelectedFolder(resolvedItem);
        } else if (resolvedItem.name.endsWith(".md")) {
            setSelectedFile(resolvedItem);
            // console.log(selectedFile);
        } else {
            alert("Cannot open this file type.");
        }
    };

    return (
        <div
            style={{
                position: "absolute",
                top: "40px", // below top bar
                left: "0",
                width: "100%",
                height: "calc(100% - 40px)", // minus top bar
                zIndex: 1,
                pointerEvents: "none",
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridAutoFlow: "column",
                    gridTemplateRows: "repeat(auto-fill, 80px)", // auto fill new columns
                    gap: "20px",
                    padding: "20px",
                    height: "calc(100% - 40px)", // leave space for dock and top bar
                    alignContent: "start", // start
                    justifyContent: "start", // alight left
                    pointerEvents: "auto",
                }}
            >
                {desktopItems.map((item) => (
                    <div
                        key={item.name}
                        onClick={() => handleClick(item)}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            cursor: "pointer",
                            color: "white",
                            textShadow: "1px 1px 3px black",
                        }}
                    >
                        {item.linkName !== item.name ? (
                            <MdFileOpen size={50} color="#87CEEB" />
                        ) : item instanceof Folder ? (
                            <MdDriveFileMove size={50} color="#FFD700" />
                        ) : (
                            <MdInsertDriveFile size={50} color="#ADD8E6" />
                        )}
                        <span>{item.name}</span>
                    </div>
                ))}

                {selectedFolder && (
                    <FileManager
                        initialPath={`/home/guest/Desktop/${selectedFolder.name}`}
                    />
                )}
                {selectedFile && (
                    <MarkdownViewer
                        filename={selectedFile.name}
                        onClose={() => setSelectedFile(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default DesktopOverlay;
