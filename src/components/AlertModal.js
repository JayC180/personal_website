import React from "react";

const AlertModal = ({ message, onClose }) => {
    if (!message) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "#313244",
                color: "#cdd6f4",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0px 4px 12px rgba(0,0,0,0.6)",
                zIndex: 10000,
                width: "300px",
                textAlign: "center",
            }}
        >
            <p style={{ marginBottom: "15px" }}>{message}</p>
            <button
                onClick={onClose}
                style={{
                    backgroundColor: "#f38ba8",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "8px 16px",
                    cursor: "pointer",
                }}
            >
                OK
            </button>
        </div>
    );
};

export default AlertModal;
