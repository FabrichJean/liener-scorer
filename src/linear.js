const { LinearClient } = require("@linear/sdk");

const client = new LinearClient({
  apiKey: "lin_oauth_50b2b79a02fdec6c8f9ce4b4687f9cd3cdb65b4a188d4440134983df65425094" // mets ta clé API Linear ici
});

module.exports = client;
