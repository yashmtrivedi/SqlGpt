
export function getOpenai(data) {

  console.log(data);
  return fetch('https://2f4lzgyfkk.execute-api.ap-south-1.amazonaws.com/sendQuery', {
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