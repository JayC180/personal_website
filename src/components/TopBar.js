import React, { useState, useEffect } from "react";
import { View, Text } from "react-desktop/macOs";
import '../styles.css';

function getCurrentDateTime() {
    const now = new Date();
    const options = {
        weekday: "short",
        // year: "numeric",
        month: "short",
        day: "numeric",
    };
    const date = now.toLocaleDateString("en-US", options);
    const time = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
    return { date, time };
}

const TopBar = () => {
    const [dateTime, setDateTime] = useState(getCurrentDateTime());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setDateTime(getCurrentDateTime());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <View
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                backgroundColor: "#1e1e2e", // base
                padding: "10px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                zIndex: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontFamily: "Consolas, monospace"
            }}
            verticalAlignment="center"
        >
            <Text color="#cdd6f4" /*text color */ size={16} weight="bold">
                Jay's Website
            </Text>
            <View
                style={{ display: "flex", flexDirection: "row", gap: "12px" }}
            >
                <Text color="#cdd6f4" /*text color */ size={16}>
                    {dateTime.date}
                </Text>
                <Text color="#cdd6f4" /*text color */ size={16}>
                    {dateTime.time}
                </Text>
            </View>
        </View>
    );
};

export default TopBar;
