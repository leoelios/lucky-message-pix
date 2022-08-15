let authContext = {};

function isAuthenticated() {

    if (!!authContext || !!authContext.data) {
        return false;
    }

    if (!!authContext.createdAt) {
        return false;
    }

    if (!!authContext.data.access_token) {
        return false;
    }

    return (new Date(authContext.createdAt.getTime() + authContext.data.expires_in * 1000)  > new Date()) 
}

function setContext(data) {
    authContext = {
        createdAt: new Date(),
        data
    }
}

function getContextData() {
    return authContext.data;
}

module.exports = {
    isAuthenticated,
    setContext,
    getContextData
}