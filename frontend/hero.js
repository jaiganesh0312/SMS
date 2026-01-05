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
                    "50": "#faf9f7",
                    "100": "#f5f3f0",
                    "200": "#ebe8e3",
                    "300": "#dcd8d1",
                    "400": "#c8c2b8",
                    "500": "#b5ada1",
                    "600": "#948b7d",
                    "700": "#736a5e",
                    "800": "#524a41",
                    "900": "#312c26",
                    "foreground": "#1a1814",
                    "DEFAULT": "#b5ada1"
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
        }
    },
});