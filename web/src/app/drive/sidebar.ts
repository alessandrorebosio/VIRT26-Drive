import { Home, Trash2, Users2 } from "lucide-react";

/**
 * The base URL path for all drive-related navigation items.
 * @type {string}
 */
export const baseUrl = "/drive";

/**
 * The account URL path for all drive-related navigation items.
 * @type {string}
 */
export const accountUrl = `${baseUrl}/account`

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
 * @property {SidebarItem[]} app - Main navigation items displayed in the body of the sidebar.
 * @property {SidebarItem[]} admin - Secondary navigation items displayed at the bottom of the sidebar.
 */
export const items = {
	app: [
		{
			title: "Home",
			url: `${baseUrl}/home`,
			icon: Home,
		},
		{
			title: "Trash",
			url: `${baseUrl}/trash`,
			icon: Trash2,
		}
	],
	admin: [
		{
			title: "Users",
			url: `${baseUrl}/users`,
			icon: Users2,
		}
	]
};
