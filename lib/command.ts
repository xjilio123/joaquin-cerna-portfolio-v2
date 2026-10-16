/** Opens the command palette from anywhere (buttons, menus) without prop drilling. */
export const COMMAND_EVENT = "jcr:command";

export const openCommandPalette = () => window.dispatchEvent(new Event(COMMAND_EVENT));
