async function fetchDataWithTimeout(url, timeoutDuration) {
  try {
    const signal = AbortSignal.timeout(timeoutDuration);

    const response = await fetch(url, { signal });
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'TimeoutError') {
      //console.error('Request timed out');
      return null; // Return null on timeout
    } else {
      //console.error('Fetch error:', error);
      throw error; // Rethrow other errors
    }
    throw error;
  }
}

(async function checkAndRedirect() {
    try {
        const currentPath = window.location.pathname + window.location.search + window.location.hash;

        const currentDomain = window.location.hostname;
        notifiedDifferent = false;
        if (currentDomain === 'glitch.ad') {
            setInterval(async () => {
                const response = await fetchDataWithTimeout('/api/ping', 2000);
                if (response == null) {
                    // Redirect to the last known host cookie
                    const host = document.cookie.split('; ').find(row => row.startsWith('host='));
                    if (host) {
                        const hostValue = host.split('=')[1];
                        window.location.href = `https://${hostValue}${currentPath}`;
                    }
                    return; // Exit the function if the request timed out
                }
            }, 5000);
        } else {
            setInterval(async () => {
                //const response = await fetch('https://ping.glitch.ad/api/ping', { method: 'GET', mode: 'no-cors' });
                const response = await fetchDataWithTimeout('https://ping.glitch.ad/api/ping', 2000);
                console.log(response);
                if (response != null) {
                    // Get 'host' field of the JSON response
                    const host = response.host;
                    console.log('Host from API:', host);
                    if (host != currentDomain && !notifiedDifferent) {
                        alert("This device is currently connected to a different Glitch range: " + host + ".\n\nPlease disconnect your previous VPN connection and connect to this range to continue.")
                        notifiedDifferent = true;
                    } else if (host == currentDomain) {
                        window.location.href = `https://glitch.ad${currentPath}`;
                    }
                }
            }, 5000);
        }

    } catch (error) {
        console.error('Error checking https://ping.glitch.ad/api/ping:', error);
    }
})();
