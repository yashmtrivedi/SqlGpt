export function getSales(question) {
    return fetch(`http://localhost:3333/query?question=${question}`)
      .then(data => data.json())
  }