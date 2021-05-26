import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from 'n8n-core';

import {
	OptionsWithUri,
} from 'request';

import {
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';

/**
 * Make an API request to PlaySignage
 * API DOCS: https://api.playsignage.com/docs
 *
 * @param {IHookFunctions} this
 * @param {string} method
 * @param {string} url
 * @param {object} body
 * @returns {Promise<any>}
 */
 export async function playSignageApiRequest(this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions, method: string, endpoint: string, body: object, query?: object, uri?: string | undefined): Promise<any> { // tslint:disable-line:no-any
	const credentials = this.getCredentials('playSignageApi') || {};

	const options: OptionsWithUri = {
		headers: {'Accept': 'application/json', 'Authorization': credentials.apiKey},
		method,
		body: { data: body },
		qs: query,
		uri: uri || `https://api.playsignage.com/v1/${endpoint}`,
		json: true,
	};

	try {
		return await this.helpers.request!(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}