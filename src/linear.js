const { LinearClient } = require("@linear/sdk");

const client = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY // mets ta clé API Linear ici
});

async function getDoneIssuesByMonth(year, month) {
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  const allDone = [];
  let after = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const result = await client.issues({
      filter: {
        state: { name: { eq: "Done" } },
        completedAt: { gte: startDate, lte: endDate },
      },
      first: 250,
      after,
    });

    allDone.push(...result.nodes);
    hasNextPage = result.pageInfo.hasNextPage;
    after = result.pageInfo.endCursor;
  }
  

  return allDone;
}

module.exports = {
    client, getDoneIssuesByMonth
};
