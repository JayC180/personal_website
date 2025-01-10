// Updated Terminal with fixes and placeholders for new commands
import React, { useState } from "react";
import ReactTerminal from "react-console-emulator";

class File {
    constructor(name, type, owner = "guest", group = "guest") {
        this.name = name;
        this.type = type;
        this.permissions = type === "folder" ? "dr--r--r--" : "-r--r--r--";
        this.owner = owner;
        this.group = group;
        this.size = 1024;
        this.lastModified = "Jan 09 19:30";
        this.linkName = name
    }
}

class Folder extends File {
    constructor(name, parent, children = {}, owner = "guest", group = "guest", permissions="dr--r--r--", linkName=name) {
        super(name, "folder", owner, group);
        this.parent = parent;
        this.children = children;
        this.size = 4096;
        this.permissions = permissions;
        this.linkName = linkName;
    }

    addChild(file) {
        this.children[file.name] = file;
    }

    getChildren() {
        return Object.values(this.children);
    }
}

const rootFolder = new Folder("root", null, {}, "root", "root", );
const homeFolder = new Folder("home", rootFolder, {}, "root", "root");
const guestFolder = new Folder("guest", homeFolder);

// Populate file system
const desktopFolder = new Folder("Desktop", guestFolder);
const documentsFolder = new Folder("Documents", guestFolder);
documentsFolder.addChild(new File("resume.pdf", "file"));
documentsFolder.addChild(new File("notes.txt", "file"));
const projectsFolder = new Folder("Projects", guestFolder);
projectsFolder.addChild(new File("project1.zip", "file"));

// Add folders to guest
guestFolder.addChild(desktopFolder);
guestFolder.addChild(documentsFolder);
guestFolder.addChild(projectsFolder);

// Add folders to home
homeFolder.addChild(guestFolder);

// Add folders to root
rootFolder.addChild(homeFolder);
rootFolder.addChild(new Folder("bin", rootFolder, {}, "root", "root"));
rootFolder.addChild(new Folder("boot", rootFolder, {}, "root", "root"));
rootFolder.addChild(new Folder("etc", rootFolder, {}, "root", "root"));
rootFolder.addChild(new Folder("opt", rootFolder, {}, "root", "root"));
rootFolder.addChild(new Folder("usr", rootFolder, {}, "root", "root"));

const fileSystem = {
    "/": rootFolder,
    "/home": homeFolder,
    "/home/guest": guestFolder,
    "/home/guest/Desktop": desktopFolder,
    "/home/guest/Documents": documentsFolder,
    "/home/guest/Projects": projectsFolder,
};

function resolvePath(currentPath, targetPath) {
    if (targetPath.startsWith("/")) return targetPath; // absolute path

    // /home/guest
    if (targetPath.startsWith("~")) {
        const path = targetPath.slice(1)
        if (path === '/.') return "/home/guest"
        if (path === '/..') return "/home"
        return "/home/guest" + path;
    }

    const pathParts = currentPath.split("/").filter(Boolean);
    const targetParts = targetPath.split("/").filter(Boolean);

    for (const part of targetParts) {
        if (part === ".") continue;
        else if (part === "..") pathParts.pop();
        else pathParts.push(part);
    }

    return "/" + pathParts.join("/");
}

const Terminal = () => {
    const [currentPath, setCurrentPath] = useState("/home/guest");

    const commands = {
        echo: {
            description: "Echo a passed string.",
            usage: "echo <string>",
            fn: (...args) => args.join(" "),
        },

        pwd: {
            description: "Print the current directory.",
            usage: "pwd",
            fn: () => currentPath,
        },

        ls: {
            description: "List contents in the current directory.",
            usage: "ls [-a] [-l]",
            fn: (...args) => {
                const showHidden = args.includes("-a");
                const longFormat = args.includes("-l");
                const pathArg = args.find((arg) => !arg.startsWith("-")) || currentPath;

                const targetPath = resolvePath(currentPath, pathArg);
                const targetFolder = fileSystem[targetPath];

                if (!targetFolder || !(targetFolder instanceof Folder)) {
                    return `ls: cannot access '${pathArg}': No such file or directory`;
                }

                let children = targetFolder.getChildren();
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
                                `${child.permissions} ${child.type === "folder" ? 2 : 1} ${child.owner} ${child.group} ${
                                    child.size
                                } ${child.lastModified} ${child.linkName}`
                        )
                        .join("\n");
                }

                return children.map((child) => child.name).join(" ");
            },
        },

        cd: {
            description: "Change the current directory.",
            usage: "cd <dir>",
            fn: (dir) => {
                const targetPath = resolvePath(currentPath, dir);
                const targetFolder = fileSystem[targetPath];

                if (targetFolder && targetFolder instanceof Folder) {
                    setCurrentPath(targetPath);
                    return `Changed directory to ${targetPath}`;
                } else {
                    return `cd: ${dir}: No such file or directory. Or, please use canonical path.`;
                }
            },
        },

        whoami: {
            description: "Print your username.",
            usage: "whoami",
            fn: () => "guest",
        },

        cat: {
            description: "View file contents.",
            usage: "cat <file>",
            fn: () => "Function not implemented. But here's a cat ≽^•⩊•^≼",
        },

        touch: {
            description: "Create a new file.",
            usage: "touch <file>",
            fn: (filename) => `touch: cannot touch '${filename ? filename : ''}': Permission denied`,
        },

        mkdir: {
            description: "Create a new directory.",
            usage: "mkdir <directory>",
            fn: (dirname) => `mkdir: cannot create directory '${dirname ? dirname : ''}': Permission denied`,
        },

        sudo: {
            description: "Execute a command as root.",
            usage: "sudo <command>",
            fn: () => "User is not in the sudoers group. This incident will be reported.",
        },

        passwd: {
            description: "Change passwords for user accounts.",
            usage: "passwd [options] [LOGIN]",
            fn: () => "Haha. No.",
        }
    };

    return (
        <ReactTerminal
            commands={commands}
            welcomeMessage={"Welcome to Jay's Terminal!"}
            prompt="guest@jays-site:~$"
            style={{
                backgroundColor: "black",
                color: "white",
                width: "100%",
                height: "100%",
                opacity: 0.8,
            }}
        />
    );
};

export default Terminal;
