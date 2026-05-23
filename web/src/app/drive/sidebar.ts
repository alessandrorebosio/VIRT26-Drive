import { Home, Trash2 } from "lucide-react";

/**
 * The base URL path for all drive-related navigation items.
 * @type {string}
 */
export const baseUrl = "/drive";

/**
 * Shape of an individual navigation item.
 * * @typedef {Object} SidebarItem
 * @property {string} title - The display name of the navigation item.
 * @property {string} url - The destination URL path.
 * @property {React.ComponentType} icon - The Lucide icon component associated with the item.
 */

/**
 * Collection of navigation items categorized by their layout placement.
 * * @type {Object}
 * @property {SidebarItem[]} content - Main navigation items displayed in the body of the sidebar.
 * @property {SidebarItem[]} footer - Secondary navigation items displayed at the bottom of the sidebar.
 */
export const items = {
	content: [
		{
			title: "Home",
			url: `${baseUrl}/home`,
			icon: Home,
		}
	],
	footer: [
		{
			title: "Trash",
			url: `${baseUrl}/trash`,
			icon: Trash2,
		}
	]
};
