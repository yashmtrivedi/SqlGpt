const query = require('./sales.json');

const openai = require('./openai.json');

const getSqlQuery = require('./getSqlQuery.json');

module.exports = () => ({
    query: query,
    openai: openai,
    getSqlQuery: getSqlQuery,
});

