
function handleConnection() {
	var titleElement = document.getElementById('status-title');
	if (navigator.onLine) {
		isReachable(getServerUrl()).then(function(online) {
			if (online) {
				titleElement.textContent = "IRS ONLINE :)";
				console.log('online');
			} else {
				titleElement.textContent = "IRS NO CONNECTION";
				console.log('no connectivity');
			}
		});
	} else {
		// handle offline status
		titleElement.textContent = "***IRS OFFLINE NOW***";
		console.log('offline');
	}
}

function isReachable(url) {
	/**
	 * Note: fetch() still "succeeds" for 404s on subdirectories,
	 * which is ok when only testing for domain reachability.
	 *
	 * Example:
	 *   https://google.com/noexist does not throw
	 *   https://noexist.com/noexist does throw
	 */
	return fetch(url, { method: 'HEAD', mode: 'no-cors' })
		.then(function(resp) {
			return resp && (resp.ok || resp.type === 'opaque');
		})
		.catch(function(err) {
			console.warn('[conn test failure]:', err);
		});
}

function getServerUrl() {
	return document.getElementById('serverUrl').value || window.location.origin;
}





window.onload = () => {
	'use strict';
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker
			.register('./sw.js', {
    type: 'module',
  });
	}
	console.log("handles");
	window.addEventListener('online', handleConnection);
	window.addEventListener('offline', handleConnection);

}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
	deferredPrompt = e;
});


const installApp = document.getElementById('installApp');

installApp.addEventListener('click', async () => {
	if (deferredPrompt !== null) {
		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === 'accepted') {
			deferredPrompt = null;
		}
	}
});


//*******************************************************************/
if ('Notification' in window && Notification.permission != 'granted') {
    console.log('Ask user permission')
    Notification.requestPermission(status => {  
        console.log('Status:'+status)
        displayNotification('Notification Enabled');
    });
}


const displayNotification = notificationTitle => {
    console.log('display notification')
    if (Notification.permission == 'granted') {
        navigator.serviceWorker.getRegistration().then(reg => {
            console.log(reg)
            const options = {
                    body: 'Thanks for allowing push notification !',
                    icon:  '/assets/icons/icon-512x512.png',
                    vibrate: [100, 50, 100],
                    data: {
                      dateOfArrival: Date.now(),
                      primaryKey: 0
                    }
                  };
    
            reg.showNotification(notificationTitle, options);
        });
    }
};

const updateSubscriptionOnYourServer = subscription => {
    console.log('Write your ajax code here to save the user subscription in your DB', subscription);
    // write your own ajax request method using fetch, jquery, axios to save the subscription in your server for later use.
};


function updateSubscriptionOnServer(token) {

    if (isSubscribed) {
        return database.ref('device_ids')
                .equalTo(token)
                .on('child_added', snapshot => snapshot.ref.remove())
    }

    database.ref('device_ids').once('value')
        .then(snapshots => {
            let deviceExists = false

            snapshots.forEach(childSnapshot => {
                if (childSnapshot.val() === token) {
                    deviceExists = true
                    return console.log('Device already registered.');
                }

            })

            if (!deviceExists) {
                console.log('Device subscribed');
                return database.ref('device_ids').push(token)
            }
        })
}

const subscribeUser = async () => {
    const swRegistration = await navigator.serviceWorker.getRegistration();
    const applicationServerPublicKey = 'BGbPmLZuugsyomafsSr8Lu2c_O6oPj_6YuxBpZxCPtoEvUnLggPqlNt8oofh4MFW08K28glYYiztmOexIN5Aw9I'; // paste your webpush certificate public key
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    })
    .then((subscription) => {
        console.log('User is subscribed newly:', subscription);
        updateSubscriptionOnServer(subscription);
    })
    .catch((err) => {
        if (Notification.permission === 'denied') {
          console.warn('Permission for notifications was denied')
        } else {
          console.error('Failed to subscribe the user: ', err)
        }
    });
};
const urlB64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/')

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};



const checkSubscription = async () => {
    const swRegistration = await navigator.serviceWorker.getRegistration();
    swRegistration.pushManager.getSubscription()
    .then(subscription => {
        if (!!subscription) {
            console.log('User IS Already subscribed.');
            updateSubscriptionOnYourServer(subscription);
        } else {
            console.log('User is NOT subscribed. Subscribe user newly');
            subscribeUser();
        }
    });
};



checkSubscription();

//*******************************************************************/

