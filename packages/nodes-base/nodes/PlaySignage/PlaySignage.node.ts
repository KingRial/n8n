import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	IDataObject,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
} from 'n8n-workflow';

import {
	playSignageApiRequest,
} from './GenericFunctions';

import * as _ from 'lodash';

export class PlaySignage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Play Signage',
		name: 'playSignage',
		icon: 'file:playSignage.png',
		group: ['transform'],
		version: 1,
		description: 'Consume Play Signage API',
		defaults: {
			name: 'PlaySignage',
			color: '#387fbd',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{
			name: 'playSignageApi',
			required: true,
		}],
		properties: [{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			options: [
				{
					name: 'Ping',
					value: 'ping',
					description: 'Test the API connectivity',
				},
				{
					name: 'Get all Tags',
					value: 'get-tags',
					description: 'Get a list of all available tags',
				},
				{
					name: 'Create Tag',
					value: 'create-tag',
					description: 'Create a Tag to bind screens with a playlist',
				},
				{
					name: 'Remove Tag',
					value: 'remove-tag',
					description: 'Remove Tag binding screens and playlist',
				},
				{
					name: 'Activate Tag',
					value: 'activate-tag',
					description: 'Activate a Tag',
				},
				{
					name: 'Deactivate Tag',
					value: 'deactivate-tag',
					description: 'Deactivate a Tag',
				},
			],
			default: 'activate-tag',
			description: 'The operation to perform.',
		}, {
			displayName: 'Tag UUID',
			name: 'tag-uuid',
			type: 'string',
			default: '',
			description: 'The Tag UUID to use within the operation.',
			displayOptions: {
				show: {
					operation: [
						'activate-tag',
						'deactivate-tag',
						'remove-tag',
					],
				},
			},
		}, {
			displayName: 'Duration',
			name: 'duration',
			type: 'number',
			default: 0,
			description: 'The duration of the assigned playlist (in milliseconds).',
			displayOptions: {
				show: {
					operation: [
						'activate-tag',
					],
				},
			},
		}, {
			displayName: 'Screens',
			name: 'screens',
			type: 'options',
			typeOptions: {
				loadOptionsMethod: 'getScreens',
			},
			default: '',
			description: 'The Screens to bind with the tag.',
			displayOptions: {
				show: {
					operation: [
						'create-tag',
					],
				},
			},
		}, {
			displayName: 'Playlist',
			name: 'playlist',
			type: 'options',
			typeOptions: {
				loadOptionsMethod: 'getPlaylists',
			},
			default: '',
			description: 'The Playlist to bind with the tag.',
			displayOptions: {
				show: {
					operation: [
						'create-tag',
					],
				},
			},
		}],
	};

	methods = {
		loadOptions: {
			// Get all the available screens for current API Key
			async getScreens(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const responseData = await playSignageApiRequest.call(this, 'GET', 'screens', {});
				if (responseData === undefined) {
					throw new NodeApiError(this.getNode(), responseData, { message: 'No data got returned' });
				}
				return _.map(responseData, (item) => ({
					name: item.name,
					value: item.id,
					description: item.name,
				}) as INodePropertyOptions);
			},
			// Get all the available playlists for current API Key
			async getPlaylists(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const responseData = await playSignageApiRequest.call(this, 'GET', 'playlists', {});
				if (responseData === undefined) {
					throw new NodeApiError(this.getNode(), responseData, { message: 'No data got returned' });
				}
				return _.map(responseData, (item) => ({
					name: item.name,
					value: item.id,
					description: item.name,
				}) as INodePropertyOptions);
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		let responseData;
		let tagUUID;
		const operations = this.getNodeParameter('operation', 0) as string;
		const credentials = this.getCredentials('playSignageApi') as IDataObject;
		const items = this.getInputData();
		for (let i = 0; i < items.length; i++) {
			switch (operations) {
				case 'ping':
					responseData = await playSignageApiRequest.call(this, 'GET', 'ping', {});
					break;
				case 'get-tags':
					responseData = await playSignageApiRequest.call(this, 'GET', 'tags', {});
					break;
				case 'remove-tag':
					tagUUID = this.getNodeParameter('tag-uuid', i) as string;
					responseData = await playSignageApiRequest.call(this, 'DELETE', `tags/${tagUUID}`, {});
					break;
				case 'activate-tag':
					tagUUID = this.getNodeParameter('tag-uuid', i) as string;
					const duration = this.getNodeParameter('duration', 0) as number;
					responseData = await playSignageApiRequest.call(this, 'POST', `tags/${tagUUID}/activate`, {duration});
					break;
				case 'deactivate-tag':
					tagUUID = this.getNodeParameter('tag-uuid', i) as string;
					responseData = await playSignageApiRequest.call(this, 'POST', `tags/${tagUUID}/deactivate`, {});
					break;
				default:
					responseData = [];
					break;
			}
		}
		return [this.helpers.returnJsonArray(responseData)];
	}
}
