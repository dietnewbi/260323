// js/auth.js
const CLIENT_ID = '299529945906-d7ijr6jq5sv89metl766jhj3k3aiu5qf.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive';
let tokenClient;

function gapiLoaded() {
    gapi.load('client', async () => {
        await gapi.client.init({ apiKey: '', discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'] });
    });
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({ client_id: CLIENT_ID, scope: SCOPES, callback: '' });
}

function handleAuthClick(onSuccessCallback) {
    tokenClient.callback = async (resp) => {
        if (!resp.error) {
            if(onSuccessCallback) onSuccessCallback();
        }
    };
    tokenClient.requestAccessToken({ prompt: 'consent' });
}
