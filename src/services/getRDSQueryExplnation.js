export function getRDSQueryExplanation(data) {
    return fetch('https://bduxwp2bmi.execute-api.ap-south-1.amazonaws.com/default/question', {
      mode: 'cors',
      method: 'POST',
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Request-Headers": "*",
        "Accept": "*/*",
      },
      body: data
    }).then(response => {
      if(response.status === 500) {
        throw new Error("Server responds with error!");
      }
      return response.json();
    })
  }