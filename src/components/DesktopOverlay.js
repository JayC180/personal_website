import React from "react";
import { MdDriveFileMove, MdInsertDriveFile, MdFileOpen } from "react-icons/md";
import { fileSystem, resolveSymlink, getFileAtPath } from "./FileSystem";
import { useState } from "react";
import FileManager from "./FileManager";
import MarkdownViewer from "./MarkdownViewer";

const DesktopOverlay = ({ openWindowFromDesktop }) => {
    const desktopFolder = fileSystem["/home/guest/Desktop"];
    const desktopItems = desktopFolder.getChildren();

    const welcome_md = getFileAtPath("/home/guest/Desktop/welcome.md");
    const [selectedFile, setSelectedFile] = useState(welcome_md);
    const [selectedFolder, setSelectedFolder] = useState(null);

    const handleClick = (item) => {
        const resolvedItem = resolveSymlink(item, "/home/guest/Desktop");
        if (resolvedItem?.type === "folder") {
            // setSelectedFolder(resolvedItem);
            openWindowFromDesktop("files", resolvedItem);
        } else if (resolvedItem.name.endsWith(".md")) {
            setSelectedFile(resolvedItem);
            // console.log(selectedFile);
        } else {
            alert("Cannot open this file type.");
        }
    };

    const getDesktopIcon = (item) => {
        const resolved = resolveSymlink(item, "/home/guest/Desktop");
    
        if (item.type === "symlink" && resolved?.type === "folder") {
            // symbolic link to folder
            return <MdDriveFileMove size={50} color="#f9e2af" />; // yellow
        }
    
        if (item.type === "symlink") {
            // symbolic link to file
            return <MdFileOpen size={50} color="#89dceb" />; // sky
        }
    
        if (item.type === "folder") {
            return <MdDriveFileMove size={50} color="#f9e2af" />; // yellow
        }
    
        return <MdInsertDriveFile size={50} color="#89dceb" />; // sky
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
                        {getDesktopIcon(item)}
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
