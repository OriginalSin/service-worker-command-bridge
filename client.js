module.exports = function (command, data) {
    
    // Wrap our postMessage in a promise to allow us to chain commands and
    // responses together.
   
    return new Promise((fulfill, reject) => {
        let messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
            let [err, data] = event.data;
            if (err) {
                return reject(err);
            }
            
            fulfill(data);
        };
        
        let dataAsString = JSON.stringify(data);
        
        navigator.serviceWorker.ready.then((reg) => {
            console.info(`Sending ${command} to service worker...`, data);
            reg.active.postMessage({
                action: "runCommand",
                command,
                dataAsString
            }, [messageChannel.port2]);
        })
        
    })
}