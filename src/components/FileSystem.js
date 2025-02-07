class File {
    constructor(name, type, owner = "guest", group = "guest", linkName = null) {
        this.name = name;
        this.type = type;
        this.permissions = type === "folder" ? "dr--r--r--" : "-r--r--r--";
        this.owner = owner;
        this.group = group;
        this.size = 1024;
        this.lastModified = "Jan 09 19:30";
        this.linkName = linkName || name;
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
        this.size = 4096;
        this.permissions = permissions;
    }

    addChild(file) {
        this.children[file.name] = file;
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

function resolveSymlink(file, basePath = "", visited = new Set()) {
    if (file.type === "symlink") {
        if (visited.has(file)) {
            console.log("circular symlink: ", file.name);
            return file;
        }
        visited.add(file);

        const targetPath = file.linkName.split(" -> ")[1].trim();

        const resolvedPath = targetPath.startsWith("/")
            ? targetPath // absolute path
            : `${basePath}/${targetPath}`; // relative path

        const target = getFileAtPath(resolvedPath);

        return target ? resolveSymlink(target, basePath, visited) : file;
    }
    return file;
}

const rootFolder = new Folder("root", null, {}, "root", "root", "drwxr-xr--");
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
        "about me.md -> ../Documents/about me.md"
    )
);
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
documentsFolder.addChild(new File("jay's resume.pdf", "file"));
documentsFolder.addChild(new File("test.md", "file"));
documentsFolder.addChild(new File("about me.md", "file"));

const projectsFolder = new Folder("Projects", guestFolder);
projectsFolder.addChild(new File("projects.md", "file"));

const blogFolder = new Folder("Blog");
blogFolder.addChild(new File("blog 1.md", "file"));

const wallpapersFolder = new Folder("Wallpapers");
wallpapersFolder.addChild(new File("wallpaper 1.jpg", "file"));

// add folders to guest
guestFolder.addChild(desktopFolder);
guestFolder.addChild(documentsFolder);
guestFolder.addChild(projectsFolder);
guestFolder.addChild(blogFolder);
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
    "/": rootFolder,
    "/home": homeFolder,
    "/home/guest": guestFolder,
    "/home/guest/Desktop": desktopFolder,
    "/home/guest/Documents": documentsFolder,
    "/home/guest/Projects": projectsFolder,
    "/home/guest/Blog": blogFolder,
    "/home/guest/Wallpapers": wallpapersFolder,
};

export { File, Folder, fileSystem, resolveSymlink, getFileAtPath };
