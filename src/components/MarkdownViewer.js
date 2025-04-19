import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
} from "@mui/material";

const MarkdownViewer = ({ filename, onClose }) => {
    const [content, setContent] = useState("");
    const [error, setError] = useState(null);

    // console.log(filename);

    useEffect(() => {
        fetch(`/assets/${filename}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to load file");
                }
                return response.text();
            })
            .then(setContent)
            .catch((err) => setError(err.message));
    }, [filename]);

    const customStyles = {
        h1: {
            color: "#cba6f7", // mauve
            fontSize: "2.5em",
        },
        h2: {
            color: "#f38ba8", // red
            fontSize: "2em",
        },
        h3: {
            color: "#fab387", // peach
            fontSize: "1.75em",
        },
        h4: {
            color: "#74c7ec", // sapphire
            fontSize: "1.75em",
        },
        h5: {
            color: "#89b4fa", // blue
            fontSize: "1.75em",
        },
        h6: {
            color: "#b4befe", // lavender
            fontSize: "1.75em",
            marginBottom: "8px",
        },
        p: {
            color: "#1e1e2e", // base
            fontSize: "1em",
            lineHeight: "1.6",
        },
        code: {
            backgroundColor: "#313244", // surface 0
            padding: "5px",
            borderRadius: "3px",
            color: "#f5e0dc", // rosewater
            fontFamily: "monospace",
        },
        pre: {
            backgroundColor: "#313244", // surface 0
            color: "#f5e0dc", // rosewater
            padding: "20px",
            borderRadius: "5px",
            overflowX: "auto",
        },
        blockquote: {
            borderLeft: "4px solid #89b4fa", // blue
            paddingLeft: "15px",
            color: "#cdd6f4", // text
            fontStyle: "italic",
        },
        hr: {
            border: "none",
            color: "#f5c2e7",
            borderTop: "2px solid #f5c2e7", // pink
            marginTop: "20px",
            marginBottom: "20px",
        },
        a: {
            color: "#376FCE", // darker blue
        },
        img: {
            maxWidth: "100%",
            height: "auto",
            borderRadius: "8px",
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
        },
        table: {
            width: "100%",
            borderSpacing: "0px",
        },
        th: {
            padding: "10px",
            textAlign: "left",
            borderBottom: "2px solid #eba0ac", // maroon
            paddingLeft: "15px", 
            paddingRight: "15px",
        },
        td: {
            padding: "10px",
            borderBottom: "1px solid #ffcbaf", // lighter peach
            paddingLeft: "15px",
            paddingRight: "15px",
        },    
    };

    return (
        <Dialog open={true} onClose={onClose}>
            <DialogTitle
                style={{
                    backgroundColor: "#f5e0dc",
                    color: "#1e1e2e",
                    fontFamily: "monospace",
                    fontSize: "2rem",
                    marginBottom: "-1rem",
                }}
            >
                {filename}
            </DialogTitle>
            <DialogContent
                style={{
                    backgroundColor: "#f5e0dc",
                    color: "#1e1e2e",
                    /* scrollbar */
                    scrollbarWidth: "thin",
                    scrollbarColor: "#b4befe #f5e0dc",
                    /* WebKit fallbacks */
                    "&::WebkitScrollbar": {
                        width: "10px",
                    },
                    "&::WebkitScrollbarTrack": {
                        background: "#f5e0dc",
                    },
                    "&::WebkitScrollbarThumb": {
                        backgroundColor: "#b4befe",
                        borderRadius: "5px",
                        border: "2px solid #f5e0dc",
                    },
                    "&::WebkitScrollbarThumb:hover": {
                        backgroundColor: "#7f849c",
                    },
                }}
            >
                {error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        children={content}
                        components={{
                            h1: ({ node, ...props }) => (
                                <h1 style={customStyles.h1} {...props} />
                            ),
                            h2: ({ node, ...props }) => (
                                <h2 style={customStyles.h2} {...props} />
                            ),
                            h3: ({ node, ...props }) => (
                                <h3 style={customStyles.h3} {...props} />
                            ),
                            h4: ({ node, ...props }) => (
                                <h4 style={customStyles.h4} {...props} />
                            ),
                            h5: ({ node, ...props }) => (
                                <h5 style={customStyles.h5} {...props} />
                            ),
                            h6: ({ node, ...props }) => (
                                <h6 style={customStyles.h6} {...props} />
                            ),
                            p: ({ node, ...props }) => (
                                <p style={customStyles.p} {...props} />
                            ),
                            code: ({
                                node,
                                inline,
                                className,
                                children,
                                ...props
                            }) => {
                                const match = /language-(\w+)/.exec(
                                    className || ""
                                );
                                return match ? (
                                    <SyntaxHighlighter
                                        {...props}
                                        PreTag="div"
                                        children={String(children).replace(
                                            /\n$/,
                                            ""
                                        )}
                                        language={match[1]}
                                        style={dracula}
                                    />
                                ) : (
                                    <code {...props} className={className}>
                                        {children}
                                    </code>
                                );
                            },
                            blockquote: ({ node, ...props }) => (
                                <blockquote
                                    style={customStyles.blockquote}
                                    {...props}
                                />
                            ),
                            hr: ({ node, ...props }) => (
                                <hr style={customStyles.hr} {...props} />
                            ),
                            a: ({ node, ...props }) => (
                                <a style={customStyles.a} {...props} />
                            ),
                            img: ({ node, ...props }) => (
                                <img style={customStyles.img} {...props} />
                            ),
                            table: ({ node, ...props }) => (
                                <table style={customStyles.table} {...props} />
                            ),
                            th: ({ node, ...props }) => (
                                <th style={customStyles.th} {...props} />
                            ),
                            td: ({ node, ...props }) => (
                                <td style={customStyles.td} {...props} />
                            ),                    
                        }}
                    ></ReactMarkdown>
                )}
            </DialogContent>
            <DialogActions
                style={{
                    backgroundColor: "#f5e0dc",
                }}
            >
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MarkdownViewer;
