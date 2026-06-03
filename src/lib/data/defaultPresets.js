export const defaultPresets = {
	ccp_default: {
		globalSettings: {
			alwaysShowBroadcasts: true,
			columnOrder: ["icon", "distance", "name", "type", "velocity"],
			overviewColumns: ["icon", "distance", "name", "type", "velocity"],
		},
		tabs: [
			{
				id: 1,
				name: "General",
				overviewGroups: [25, 26, 27, 28, 419],
				bracketGroups: [25, 26, 27, 28, 419],
			},
			{
				id: 2,
				name: "Mining",
				overviewGroups: [9, 463],
				bracketGroups: [9],
			},
			{
				id: 3,
				name: "WarpTo",
				overviewGroups: [10, 31],
				bracketGroups: [10],
			},
		],
	},
	zs_core: {
		globalSettings: {
			alwaysShowBroadcasts: true,
			columnOrder: [
				"icon",
				"distance",
				"name",
				"type",
				"velocity",
				"transversalVelocity",
			],
			overviewColumns: [
				"icon",
				"distance",
				"name",
				"type",
				"velocity",
				"transversalVelocity",
			],
		},
		tabs: [
			{
				id: 1,
				name: "<color=0xff77f3ff>✈ Travel</color>",
				overviewGroups: [10, 31],
				bracketGroups: [10, 31],
			},
			{
				id: 2,
				name: "<color=0xffff3333>★ Combat</color>",
				overviewGroups: [25, 26, 419, 420],
				bracketGroups: [25, 26],
			},
			{
				id: 3,
				name: "⚓ Drones",
				overviewGroups: [100, 101],
				bracketGroups: [],
			},
		],
	},
};
