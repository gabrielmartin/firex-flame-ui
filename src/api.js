import _ from 'lodash';
import io from 'socket.io-client';

function socketRequestResponse(socket, requestEvent, successEventName, failedEventName, timeout) {
  const p = new Promise(
    (resolve, reject) => {
      // Track if we've received either a success or failure response, for timeout.
      let responseReceived = false;

      // Handle success socket response (success event name required).
      socket.on(successEventName, (data) => {
        responseReceived = true;
        resolve(data);
      });

      // Handle failure socket response, if event name supplied (optional).
      if (!_.isNil(failedEventName)) {
        socket.on(failedEventName, (data) => {
          responseReceived = true;
          reject(data);
        });
      }

      // Register timeout if supplied.
      if (!_.isNil(timeout)) {
        setTimeout(() => {
          if (!responseReceived) {
            // eslint-disable-next-line
            reject({ timeout: true });
          }
        }, timeout);
      }

      // Send request event.
      if (requestEvent.data !== undefined) {
        socket.emit(requestEvent.name, requestEvent.data);
      } else {
        socket.emit(requestEvent.name);
      }
    },
  );
  // Stop listening after resolved/rejected.
  p.finally(() => {
    socket.off(successEventName);
    if (!_.isNil(failedEventName)) {
      socket.off(failedEventName);
    }
  });
  return p;
}

function createSocketApiAccessor(url, options) {
  const socket = io(url);

  if (_.has(options, 'onConnect')) {
    socket.on('connect', options.onConnect);
  }
  if (_.has(options, 'onDisconnect')) {
    socket.on('disconnect', options.onDisconnect);
  }

  return {
    // TODO: add failure, timeout, or auto-handle elsewhere.
    getFireXRunMetadata: () => socketRequestResponse(
      socket, { name: 'send-run-metadata' }, 'run-metadata',
    ),

    // TODO: add failure, timeout, or auto-handle elsewhere.
    getTaskGraph: () => socketRequestResponse(
      socket, { name: 'send-graph-state' }, 'graph-state',
    ),

    // TODO: add failure, timeout, or auto-handle elsewhere.
    fetchTaskDetails: uuid => socketRequestResponse(
      socket, { name: 'send-task-details', data: uuid }, `task-details-${uuid}`,
    ),

    fetchTaskFields: fields => socketRequestResponse(
      socket, { name: 'send-graph-fields', data: fields }, 'graph-fields',
    ),

    startLiveUpdate(callback) {
      socket.on('tasks-update', callback);
    },

    stopLiveUpdate() {
      socket.off('tasks-update');
    },

    revoke: uuid => socketRequestResponse(
      socket, { name: 'revoke-task', data: uuid }, 'revoke-success',
      'revoke-failed', 10000,
    ),

    cleanup: () => socket.off(),

  };
}

let apiAccessor = null;

function setAccessor(apiType, url, options) {
  // Cleanup current accessor.
  if (!_.isNull(apiAccessor)) {
    apiAccessor.cleanup();
  }

  if (apiType === 'socketio') {
    apiAccessor = createSocketApiAccessor(url, options);
  } else {
    console.error(`Unknown API type: ${apiType}`);
  }
}

function getFireXRunMetadata() {
  return apiAccessor.getFireXRunMetadata();
}

function getTaskGraph() {
  return apiAccessor.getTaskGraph();
}

function fetchTaskDetails(uuid) {
  return apiAccessor.fetchTaskDetails(uuid);
}

function fetchTaskFields(fields) {
  return apiAccessor.fetchTaskFields(fields);
}

function startLiveUpdate(callback) {
  return apiAccessor.startLiveUpdate(callback);
}

function stopLiveUpdate() {
  return apiAccessor.stopLiveUpdate();
}

function revokeTask(uuid) {
  return apiAccessor.revoke(uuid);
}

export {
  setAccessor,
  getFireXRunMetadata,
  getTaskGraph,
  fetchTaskDetails,
  fetchTaskFields,
  startLiveUpdate,
  stopLiveUpdate,
  revokeTask,
};
