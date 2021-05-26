import {
	ICredentialType,
	NodePropertyTypes,
} from 'n8n-workflow';

export class PlaySignageApi implements ICredentialType {
	name = 'playSignageApi';
	displayName = 'API Key';
	properties = [{
		displayName: 'API Key',
		name: 'apiKey',
		type: 'string' as NodePropertyTypes,
		default: '',
	}];
}