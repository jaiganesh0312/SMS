import { heroui } from "@heroui/react";

/**
 * Academy Prestige Theme
 * 
 * A sophisticated school management theme inspired by prestigious academic institutions.
 * Features a deep midnight blue foundation with warm amber accents, creating a 
 * scholarly atmosphere that's both professional and distinctive.
 * 
 * Color Philosophy:
 * - Primary (Midnight Navy): Deep academic blue - authority, trust, tradition
 * - Secondary (Amber Gold): Warm achievement gold - excellence, illumination, prestige
 * - Success (Emerald Green): Academic achievement - growth, progress, success
 * - Warning (Burnt Sienna): Vintage warning - attention without alarm
 * - Danger (Crimson Rose): Academic red - urgency, important notices
 */

export default heroui({
    "themes": {
        "light": {
            "colors": {
                "default": {
                    "50": "#ebeae9",
                    "100": "#ceccc9",
                    "200": "#b2aeaa",
                    "300": "#95918b",
                    "400": "#79736b",
                    "500": "#5c554c",
                    "600": "#4c463f",
                    "700": "#3c3731",
                    "800": "#2c2824",
                    "900": "#1c1a17",
                    "foreground": "#24282C",
                    "DEFAULT": "#5c554c"
                },
                "primary": {
                    "50": "#e8eef5",
                    "100": "#c7d5e8",
                    "200": "#a3badb",
                    "300": "#7e9fce",
                    "400": "#5984c1",
                    "500": "#1e3a5f",
                    "600": "#1a3254",
                    "700": "#162a48",
                    "800": "#11223c",
                    "900": "#0d1a2f",
                    "foreground": "#ffffff",
                    "DEFAULT": "#1e3a5f"
                },
                "secondary": {
                    "50": "#fef8eb",
                    "100": "#fcedcd",
                    "200": "#f9dea8",
                    "300": "#f6cf83",
                    "400": "#f3c05e",
                    "500": "#d4a03a",
                    "600": "#b38731",
                    "700": "#926d28",
                    "800": "#71541f",
                    "900": "#503b16",
                    "foreground": "#1a1814",
                    "DEFAULT": "#d4a03a"
                },
                "success": {
                    "50": "#e8f5ed",
                    "100": "#c7e7d3",
                    "200": "#a3d8b8",
                    "300": "#7ec99d",
                    "400": "#5ab982",
                    "500": "#2e8b57",
                    "600": "#27764a",
                    "700": "#20613d",
                    "800": "#194c30",
                    "900": "#123723",
                    "foreground": "#ffffff",
                    "DEFAULT": "#2e8b57"
                },
                "warning": {
                    "50": "#fdf3ed",
                    "100": "#fae3d4",
                    "200": "#f5c9ac",
                    "300": "#f0af84",
                    "400": "#eb955c",
                    "500": "#c86b3a",
                    "600": "#a85a31",
                    "700": "#884928",
                    "800": "#68381f",
                    "900": "#482716",
                    "foreground": "#ffffff",
                    "DEFAULT": "#c86b3a"
                },
                "danger": {
                    "50": "#fce8ec",
                    "100": "#f8c8d0",
                    "200": "#f2a3b1",
                    "300": "#ec7e93",
                    "400": "#e65974",
                    "500": "#b83a52",
                    "600": "#9a3145",
                    "700": "#7c2838",
                    "800": "#5e1f2b",
                    "900": "#40161e",
                    "foreground": "#ffffff",
                    "DEFAULT": "#b83a52"
                },
                "background": "#faf9f7",
                "foreground": "#1a1814",
                "content1": {
                    "DEFAULT": "#ffffff",
                    "foreground": "#1a1814"
                },
                "content2": {
                    "DEFAULT": "#f5f3f0",
                    "foreground": "#1a1814"
                },
                "content3": {
                    "DEFAULT": "#ebe8e3",
                    "foreground": "#1a1814"
                },
                "content4": {
                    "DEFAULT": "#dcd8d1",
                    "foreground": "#1a1814"
                },
                "focus": "#1e3a5f",
                "overlay": "#faf9f7"
            }
        },
        "dark": {
            "colors": {
                "default": {
                    "50": "#0f0e0d",
                    "100": "#1a1814",
                    "200": "#262320",
                    "300": "#332f2a",
                    "400": "#403b35",
                    "500": "#5c554c",
                    "600": "#7a7268",
                    "700": "#9a9085",
                    "800": "#bab0a3",
                    "900": "#dad2c6",
                    "foreground": "#faf9f7",
                    "DEFAULT": "#403b35"
                },
                "primary": {
                    "50": "#0d1a2f",
                    "100": "#11223c",
                    "200": "#162a48",
                    "300": "#1a3254",
                    "400": "#1e3a5f",
                    "500": "#3d6091",
                    "600": "#5c80ae",
                    "700": "#7ea0c7",
                    "800": "#a3c0dc",
                    "900": "#c9dfef",
                    "foreground": "#ffffff",
                    "DEFAULT": "#3d6091"
                },
                "secondary": {
                    "50": "#2a2011",
                    "100": "#3d2e18",
                    "200": "#503c20",
                    "300": "#6b5028",
                    "400": "#866430",
                    "500": "#d4a03a",
                    "600": "#e0b45c",
                    "700": "#e8c57a",
                    "800": "#f0d79a",
                    "900": "#f8e9bc",
                    "foreground": "#1a1814",
                    "DEFAULT": "#d4a03a"
                },
                "success": {
                    "50": "#0d241a",
                    "100": "#153626",
                    "200": "#1d4832",
                    "300": "#255a3e",
                    "400": "#2e6c4a",
                    "500": "#3fa06b",
                    "600": "#60b485",
                    "700": "#85c7a0",
                    "800": "#aadaba",
                    "900": "#d0edd5",
                    "foreground": "#1a1814",
                    "DEFAULT": "#3fa06b"
                },
                "warning": {
                    "50": "#241810",
                    "100": "#362418",
                    "200": "#483020",
                    "300": "#5a3c28",
                    "400": "#6c4830",
                    "500": "#c86b3a",
                    "600": "#d98558",
                    "700": "#e5a078",
                    "800": "#efba9a",
                    "900": "#f7d5bc",
                    "foreground": "#1a1814",
                    "DEFAULT": "#c86b3a"
                },
                "danger": {
                    "50": "#240f14",
                    "100": "#36171e",
                    "200": "#481f28",
                    "300": "#5a2732",
                    "400": "#6c2f3c",
                    "500": "#c54d66",
                    "600": "#d66e82",
                    "700": "#e08f9e",
                    "800": "#eab0ba",
                    "900": "#f4d1d7",
                    "foreground": "#ffffff",
                    "DEFAULT": "#c54d66"
                },
                "background": "#0f0e0d",
                "foreground": "#f5f3f0",
                "content1": {
                    "DEFAULT": "#1a1814",
                    "foreground": "#f5f3f0"
                },
                "content2": {
                    "DEFAULT": "#262320",
                    "foreground": "#f5f3f0"
                },
                "content3": {
                    "DEFAULT": "#332f2a",
                    "foreground": "#f5f3f0"
                },
                "content4": {
                    "DEFAULT": "#403b35",
                    "foreground": "#f5f3f0"
                },
                "focus": "#3d6091",
                "overlay": "#0f0e0d"
            }
        },

        "modern-light": {
            "colors": {
                "default": {
                    "50": "#f0eff8",
                    "100": "#dcd8ee",
                    "200": "#c7c1e3",
                    "300": "#b2aad9",
                    "400": "#9e93cf",
                    "500": "#897cc5",
                    "600": "#7166a3",
                    "700": "#595180",
                    "800": "#413b5e",
                    "900": "#29253b",
                    "foreground": "#000",
                    "DEFAULT": "#897cc5"
                },
                "primary": {
                    "50": "#eee4f8",
                    "100": "#d7bfef",
                    "200": "#bf99e5",
                    "300": "#a773db",
                    "400": "#904ed2",
                    "500": "#7828c8",
                    "600": "#6321a5",
                    "700": "#4e1a82",
                    "800": "#39135f",
                    "900": "#240c3c",
                    "foreground": "#fff",
                    "DEFAULT": "#7828c8"
                },
                "secondary": {
                    "50": "#e9edff",
                    "100": "#cbd4ff",
                    "200": "#adbcff",
                    "300": "#8fa3ff",
                    "400": "#708aff",
                    "500": "#5271ff",
                    "600": "#445dd2",
                    "700": "#3549a6",
                    "800": "#273679",
                    "900": "#19224d",
                    "foreground": "#000",
                    "DEFAULT": "#5271ff"
                },
                "success": {
                    "50": "#e3f8ef",
                    "100": "#bbedd8",
                    "200": "#93e3c1",
                    "300": "#6bd9ab",
                    "400": "#43ce94",
                    "500": "#1bc47d",
                    "600": "#16a267",
                    "700": "#127f51",
                    "800": "#0d5d3b",
                    "900": "#083b26",
                    "foreground": "#000",
                    "DEFAULT": "#1bc47d"
                },
                "warning": {
                    "50": "#fff5df",
                    "100": "#ffe8b3",
                    "200": "#ffda86",
                    "300": "#ffcc59",
                    "400": "#ffbf2d",
                    "500": "#ffb100",
                    "600": "#d29200",
                    "700": "#a67300",
                    "800": "#795400",
                    "900": "#4d3500",
                    "foreground": "#000",
                    "DEFAULT": "#ffb100"
                },
                "danger": {
                    "50": "#ffe9e9",
                    "100": "#ffcaca",
                    "200": "#ffabab",
                    "300": "#ff8d8d",
                    "400": "#ff6e6e",
                    "500": "#ff4f4f",
                    "600": "#d24141",
                    "700": "#a63333",
                    "800": "#792626",
                    "900": "#4d1818",
                    "foreground": "#000",
                    "DEFAULT": "#ff4f4f"
                },
                "background": "#f9f7fd",
                "foreground": "#4a3d77",
                "content1": {
                    "DEFAULT": "#f2e8ff",
                    "foreground": "#000"
                },
                "content2": {
                    "DEFAULT": "#e8daff",
                    "foreground": "#000"
                },
                "content3": {
                    "DEFAULT": "#dccbff",
                    "foreground": "#000"
                },
                "content4": {
                    "DEFAULT": "#cfbcff",
                    "foreground": "#000"
                },
                "focus": "#7828c8",
                "overlay": "#ffffff"
            }
        },
        "modern-dark": {
            "colors": {
                "default": {
                    "50": "#08070b",
                    "100": "#100d15",
                    "200": "#181420",
                    "300": "#201a2a",
                    "400": "#282135",
                    "500": "#534d5d",
                    "600": "#7e7a86",
                    "700": "#a9a6ae",
                    "800": "#d4d3d7",
                    "900": "#ffffff",
                    "foreground": "#fff",
                    "DEFAULT": "#282135"
                },
                "primary": {
                    "50": "#2c193f",
                    "100": "#462764",
                    "200": "#603689",
                    "300": "#7944ae",
                    "400": "#9353d3",
                    "500": "#a671db",
                    "600": "#b98fe2",
                    "700": "#ccadea",
                    "800": "#dfcbf2",
                    "900": "#f2eafa",
                    "foreground": "#fff",
                    "DEFAULT": "#9353d3"
                },
                "secondary": {
                    "50": "#1e254d",
                    "100": "#2f3a79",
                    "200": "#404fa6",
                    "300": "#5265d2",
                    "400": "#637aff",
                    "500": "#7e91ff",
                    "600": "#9aa9ff",
                    "700": "#b5c0ff",
                    "800": "#d0d7ff",
                    "900": "#eceeff",
                    "foreground": "#000",
                    "DEFAULT": "#637aff"
                },
                "success": {
                    "50": "#0b412a",
                    "100": "#116743",
                    "200": "#178d5c",
                    "300": "#1db374",
                    "400": "#23d98d",
                    "500": "#4ae0a1",
                    "600": "#70e6b5",
                    "700": "#97edc9",
                    "800": "#bdf4dd",
                    "900": "#e4faf1",
                    "foreground": "#000",
                    "DEFAULT": "#23d98d"
                },
                "warning": {
                    "50": "#4d3d11",
                    "100": "#79601c",
                    "200": "#a68326",
                    "300": "#d2a730",
                    "400": "#ffca3a",
                    "500": "#ffd35c",
                    "600": "#ffdd7f",
                    "700": "#ffe6a1",
                    "800": "#ffefc4",
                    "900": "#fff8e6",
                    "foreground": "#000",
                    "DEFAULT": "#ffca3a"
                },
                "danger": {
                    "50": "#4d2020",
                    "100": "#793333",
                    "200": "#a64646",
                    "300": "#d25858",
                    "400": "#ff6b6b",
                    "500": "#ff8585",
                    "600": "#ff9f9f",
                    "700": "#ffb9b9",
                    "800": "#ffd3d3",
                    "900": "#ffeded",
                    "foreground": "#000",
                    "DEFAULT": "#ff6b6b"
                },
                "background": "#1b1526",
                "foreground": "#d0aaff",
                "content1": {
                    "DEFAULT": "#392a4a",
                    "foreground": "#fff"
                },
                "content2": {
                    "DEFAULT": "#4c3560",
                    "foreground": "#fff"
                },
                "content3": {
                    "DEFAULT": "#5e4180",
                    "foreground": "#fff"
                },
                "content4": {
                    "DEFAULT": "#704ea0",
                    "foreground": "#fff"
                },
                "focus": "#9353d3",
                "overlay": "#000000"
            }
        },
    }



});

