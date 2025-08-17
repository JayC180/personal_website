class File {
    constructor(name, type, owner = "guest", group = "guest", linkName = null) {
        this.name = name;
        this.type = type;
        this.permissions = type === "folder" ? "dr--r--r--" : type === "symlink" ? "lr--r--r--" : "-r--r--r--";
        this.owner = owner;
        this.group = group;
        this.size = 1024;
        this.lastModified = "Jan 09 19:30";
        this.linkName = linkName;
    }
    getLinkDisplay() {
        return this.type === "symlink" && this.linkName ? `${this.name} -> ${this.linkName}` : this.name;
    }
}

class Folder extends File {
    constructor(
        name,
        parent,
        children = {},
        owner = "guest",
        group = "guest",
        permissions = "dr--r--r--",
        linkName = name
    ) {
        super(name, "folder", owner, group, linkName);
        this.parent = parent;
        this.children = children;
        this.permissions = permissions;
        this.updateFolderSize();
    }

    addChild(file) {
        this.children[file.name] = file;
        file.parent = this;
        this.updateFolderSize();
        this.updateParent();
    }


    updateFolderSize() {
        // base folder size + sum of all children sizes
        let totalSize = 4096; // min folder size
        // for (const child of Object.values(this.children)) {
        //     totalSize += child.size;
        // }
        this.size = totalSize;
    }

    updateParent() {
        // update tree
        let current = this.parent;
        while (current) {
            current.updateFolderSize();
            current = current.parent;
        }
    }

    getChildren() {
        return Object.values(this.children);
    }
}

function getFileAtPath(path) {
    const parts = path.split("/").filter(Boolean);
    let current = fileSystem["/"];
    for (const part of parts) {
        if (!(current instanceof Folder) || !current.children[part]) {
            return null;
        }
        current = current.children[part];
    }
    return resolveSymlink(current);
}

export function normalizePath(path) {
    const parts = path.split("/").filter(Boolean);
    const resolved = [];

    for (const part of parts) {
        if (part === "..") resolved.pop();
        else if (part !== ".") resolved.push(part);
    }

    return "/" + resolved.join("/");
}

function resolveSymlink(file, basePath = "", visited = new Set()) {
    if (file.type !== "symlink") return file;

    if (visited.has(file)) {
        console.warn("Circular symlink detected:", file.name);
        return file;
    }
    visited.add(file);

    const targetPathRaw = file.linkName;
    if (!targetPathRaw) return file;

    const resolvedPath = targetPathRaw.startsWith("/")
        ? normalizePath(targetPathRaw)
        : normalizePath(basePath + "/" + targetPathRaw);

    const target = getFileAtPath(resolvedPath);
    if (!target) return file;

    return resolveSymlink(target, resolvedPath, visited);
}

function registerFolder(folder, basePath = "") {
    const folderPath = basePath === "/" ? `/${folder.name}` : `${basePath}/${folder.name}`;
    fileSystem[folderPath] = folder;

    for (const child of Object.values(folder.children)) {
        if (child.type === "folder") {
            registerFolder(child, folderPath);
        } else {
            const filePath = `${folderPath}/${child.name}`;
            fileSystem[filePath] = child;
        }
    }
}

function getFullPath(file) {
    const parts = [];
    let current = file;

    while (current && current.parent) {
        parts.unshift(current.name);
        current = current.parent;
    }

    return "/" + parts.join("/");
}

// dir struct

const rootFolder = new Folder("", null, {}, "root", "root", "drwxr-xr--");
const homeFolder = new Folder(
    "home",
    rootFolder,
    {},
    "root",
    "root",
    "drwxr-xr-x"
);
const guestFolder = new Folder(
    "guest",
    homeFolder,
    {},
    "guest",
    "guest",
    "dr-xr-xr-x"
);

// populate guest home files
const desktopFolder = new Folder("Desktop", guestFolder);
desktopFolder.addChild(new File("welcome.md", "file"));
desktopFolder.addChild(
    new File(
        "about me.md",
        "symlink",
        "guest",
        "guest",
        "../Documents/about me.md"
    )
);
desktopFolder.addChild(
    new File(
        "Blogs", 
        "symlink", 
        "guest", 
        "guest", 
        "/home/guest/Blogs"
    )
);

// for testing

// const testsFolder = new Folder("Test", desktopFolder);
// testsFolder.addChild(new File("test.md", "file"));
// desktopFolder.addChild(testsFolder);

// desktopFolder.addChild(new File("welcome1.md", "file"));
// desktopFolder.addChild(new File("welcome2.md", "file"));
// desktopFolder.addChild(new File("welcome3.md", "file"));
// desktopFolder.addChild(new File("welcome4.md", "file"));
// desktopFolder.addChild(new File("welcome5.md", "file"));
// desktopFolder.addChild(new File("welcome6.md", "file"));
// desktopFolder.addChild(new File("welcome7.md", "file"));
// desktopFolder.addChild(new File("welcome8.md", "file"));
// desktopFolder.addChild(new File("welcome9.md", "file"));
// desktopFolder.addChild(new File("welcome0.md", "file"));
// desktopFolder.addChild(new File("welcome10.md", "file"));
// desktopFolder.addChild(new File("welcome11.md", "file"));
// desktopFolder.addChild(new File("welcome12.md", "file"));
// desktopFolder.addChild(new File("welcome13.md", "file"));
// desktopFolder.addChild(new File("welcome14.md", "file"));
// desktopFolder.addChild(new File("welcome15.md", "file"));
// desktopFolder.addChild(new File("welcome16.md", "file"));

const documentsFolder = new Folder("Documents", guestFolder);
documentsFolder.addChild(new File("resume.pdf", "file"));
documentsFolder.addChild(new File("test.md", "file"));
documentsFolder.addChild(new File("about me.md", "file"));

const projectsFolder = new Folder("Projects", guestFolder);
projectsFolder.addChild(new File("projects.md", "file"));

const blogsFolder = new Folder("Blogs");
blogsFolder.addChild(new File("Proxmox Installation Via WiFi.md"));
blogsFolder.addChild(new File("Switching Crackme Solution.md", "file"));
blogsFolder.addChild(new File("On the Universality of Rhythm.md", "file"));

const wallpapersFolder = new Folder("Wallpapers");
wallpapersFolder.addChild(new File("Evening Sky.jpg", "file"));
wallpapersFolder.addChild(new File("Shaded Landscape.jpg", "file"));
wallpapersFolder.addChild(new File("Arch.jpg", "file"));
wallpapersFolder.addChild(new File("Nix.jpg", "file"));
wallpapersFolder.addChild(new File("Pink Cat.jpg", "file"));
wallpapersFolder.addChild(new File("Lavender  Cat.jpg", "file"));

// add folders to guest
guestFolder.addChild(desktopFolder);
guestFolder.addChild(documentsFolder);
guestFolder.addChild(projectsFolder);
guestFolder.addChild(blogsFolder);
guestFolder.addChild(wallpapersFolder);

// add folders to home
homeFolder.addChild(guestFolder);
const jayFolder = new Folder("jay", homeFolder, {}, "jay", "jay", "drwx------");
homeFolder.addChild(jayFolder);

// add folders to root
rootFolder.addChild(homeFolder);
rootFolder.addChild(
    new Folder(
        "bin",
        rootFolder,
        {},
        "root",
        "root",
        "lrwxrwx---",
        "bin -> usr/bin"
    )
);
rootFolder.addChild(
    new Folder("boot", rootFolder, {}, "root", "root", "drwxr-x---")
);
rootFolder.addChild(
    new Folder("etc", rootFolder, {}, "root", "root", "drwxr-x---")
);
rootFolder.addChild(
    new Folder("opt", rootFolder, {}, "root", "root", "drwxr-x---")
);
rootFolder.addChild(
    new Folder("usr", rootFolder, {}, "root", "root", "drwxr-x---")
);

const fileSystem = {
    // "/": rootFolder,
    // "/home": homeFolder,
    // "/home/guest": guestFolder,
    // "/home/guest/Desktop": desktopFolder,
    // "/home/guest/Documents": documentsFolder,
    // "/home/guest/Projects": projectsFolder,
    // "/home/guest/Blog": blogFolder,
    // "/home/guest/Wallpapers": wallpapersFolder,
};
// recursivly get filesys
for (const key in fileSystem) {
    delete fileSystem[key];
}
registerFolder(rootFolder, "");

export { File, Folder, fileSystem, resolveSymlink, getFileAtPath, getFullPath };
