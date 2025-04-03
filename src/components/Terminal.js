// Updated Terminal with fixes and placeholders for new commands
import React, { useState } from "react";
import ReactTerminal from "react-console-emulator";
import {
    fileSystem,
    File,
    Folder,
    getFileAtPath,
    resolveSymlink,
} from "./FileSystem";
import MarkdownViewer from "./MarkdownViewer";

function hasReadPermission(path) {
    const file = getFileAtPath(path);
    return file && file.permissions[7] === "r";
}

// function getFileAtPath(path) {
//     const parts = path.split("/").filter(Boolean);
//     let current = fileSystem["/"];
//     for (const part of parts) {
//         if (!(current instanceof Object) || !current.children[part]) {
//             return null;
//         }
//         current = current.children[part];
//     }
//     return current;
// }

function normalizePath(path) {
    // split and remove parts
    const parts = path.split("/").filter(Boolean);
    const resolvedParts = [];

    for (const part of parts) {
        if (part === ".") {
            continue;
        } else if (part === "..") {
            if (resolvedParts.length > 0) {
                resolvedParts.pop();
            }
        } else {
            // regular path
            resolvedParts.push(part);
        }
    }

    const resolvedPath = "/" + resolvedParts.join("/");
    return hasReadPermission(resolvedPath) ? resolvedPath : "Permission denied";
}

function resolvePath(currentPath, targetPath) {
    if (targetPath.startsWith("/")) {
        return hasReadPermission(targetPath) ? targetPath : "Permission denied"; // absolute path
    }

    // /home/guest
    if (targetPath.startsWith("~")) {
        const path = "/home/guest";
        const relativePath = targetPath.slice(1); // remove ~
        return normalizePath(path + relativePath);
    }

    // all other cases
    return normalizePath(currentPath + "/" + targetPath);
}

function parseArguments(args) {
    const parsedArgs = [];
    let currArg = null;

    for (const arg of args) {
        if (currArg === null) {
            // check if start with single or double quote
            if (arg.startsWith("'") || arg.startsWith('"')) {
                currArg = arg;
            } else {
                parsedArgs.push(arg);
            }
        } else {
            // append till find close quote
            currArg += " " + arg;
            if (
                (currArg.startsWith("'") && currArg.endsWith("'")) ||
                (currArg.startsWith('"') && currArg.endsWith('"'))
            ) {
                parsedArgs.push(currArg.slice(1, -1)); // remove quotes
                currArg = null;
            }
        }
    }

    if (currArg !== null) {
        parsedArgs.push(currArg); // doesn't end with quote
    }

    return parsedArgs;
}

const Terminal = () => {
    const [currentPath, setCurrentPath] = useState("/home/guest");
    const [selectedMarkdown, setSelectedMarkdown] = useState(null);

    const commands = {
        echo: {
            description: "Echo a passed string",
            usage: "echo <string>",
            fn: (...args) => args.join(" "),
        },

        pwd: {
            description: "Print the current directory",
            usage: "pwd",
            fn: () => currentPath,
        },

        ls: {
            description: "List contents in the current directory",
            usage: "ls [-a] [-l]",
            fn: (...args) => {
                const showHidden = args.includes("-a");
                const longFormat = args.includes("-l");
                const pathArg =
                    args.find((arg) => !arg.startsWith("-")) || currentPath;

                const targetPath = resolvePath(currentPath, pathArg);
                if (targetPath === "Permission denied") {
                    return "Permission denied, or path doesn't exist.";
                }

                const targetFolder = getFileAtPath(targetPath);

                if (!targetFolder || !(targetFolder instanceof Folder)) {
                    return `ls: cannot access '${pathArg}': No such file or directory`;
                }

                let children = targetFolder
                    .getChildren()
                    .map((child) => resolveSymlink(child, targetPath));
                if (showHidden) {
                    children = [
                        { name: ".", type: "folder" },
                        { name: "..", type: "folder" },
                        ...children,
                    ];
                }

                if (longFormat) {
                    return children
                        .map(
                            (child) =>
                                `${child.permissions} ${
                                    child.type === "folder" ? 2 : 1
                                } ${child.owner} ${child.group} ${child.size} ${
                                    child.lastModified
                                } ${child.linkName || child.name}`
                        )
                        .join("\n");
                }

                return children
                    .map((child) =>
                        child.name.includes(" ")
                            ? `'${child.name}'`
                            : child.name
                    )
                    .join(" ");
            },
        },

        cd: {
            description: "Change the current directory",
            usage: "cd <dir>",
            fn: (dir) => {
                const targetPath = resolvePath(currentPath, dir);
                if (targetPath === "Permission denied") {
                    return "Permission denied, or path doesn't exist.";
                }

                const targetFolder = getFileAtPath(targetPath);

                if (targetFolder && targetFolder instanceof Folder) {
                    setCurrentPath(targetPath);
                    return `Changed directory to ${targetPath}`;
                } else {
                    return `cd: ${dir}: No such file or directory. Or, please use canonical path.`;
                }
            },
        },

        whoami: {
            description: "Print your username",
            usage: "whoami",
            fn: () => "guest",
        },

        cat: {
            description: "View file contents",
            usage: "cat <file>",
            fn: () => "Function not implemented. But here's a cat ≽^•⩊•^≼",
        },

        touch: {
            description: "Create a new file",
            usage: "touch <file>",
            fn: (filename) =>
                `touch: cannot touch '${
                    filename ? filename : ""
                }': Permission denied`,
        },

        mkdir: {
            description: "Create a new directory",
            usage: "mkdir <directory>",
            fn: (dirname) =>
                `mkdir: cannot create directory '${
                    dirname ? dirname : ""
                }': Permission denied`,
        },

        sudo: {
            description: "Execute a command as root",
            usage: "sudo <command>",
            fn: () =>
                "User is not in the sudoers group. This incident will be reported.",
        },

        passwd: {
            description: "Change passwords for user accounts",
            usage: "passwd [options] [LOGIN]",
            fn: () => "Haha. No.",
        },

        mdview: {
            description: "For viewing Markdown files",
            usage: "mdview <filepath>",
            fn: (...args) => {
                const parsedArgs = parseArguments(args);
                if (parsedArgs.length === 0) {
                    return "Usage: mdview <filepath>";
                }

                const path = parsedArgs[0];

                const fullPath = resolvePath(currentPath, path);

                if (fullPath === "Permission denied") {
                    return `mdview: ${path}: Permission denied, or path doesn't exist.`;
                }

                const file = getFileAtPath(fullPath);

                if (!file) {
                    return `mdview: ${path}: No such file`;
                }

                if (!(file instanceof File) || !file.name.endsWith(".md")) {
                    return `mdview: ${path}: Not a markdown file`;
                }

                setSelectedMarkdown(file.name);
                return `Opening Markdown viewer for ${file.name}`;
            },
        },
    };

    return (
        <div
            style={{ display: "flex", flexDirection: "column", height: "96%" }}
        >
            <ReactTerminal
                commands={commands}
                welcomeMessage={
                    "Welcome to Jay's Terminal! Type 'help' for help."
                }
                prompt="guest@jays-site:~$"
                style={{
                    backgroundColor: "black",
                    color: "white",
                    flex: 1,
                    opacity: 0.8,
                }}
            />
            {selectedMarkdown && (
                <MarkdownViewer
                    filename={selectedMarkdown}
                    onClose={() => setSelectedMarkdown(null)}
                />
            )}
        </div>
    );
};

export default Terminal;
