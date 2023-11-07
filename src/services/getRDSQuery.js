export const getRDSQuery = (question) => fetch(`https://5567-34-90-217-111.ngrok.io/query?question=${question}`
).then((data) => data.json());