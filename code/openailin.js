const defaultVersion = 'v1';

class OpenAI{
  constructor(apiKey,  version = defaultVersion) {
        this.headers = {
            'authorization': `Bearer ${apiKey}`,
            'content-type': 'application/json',
        };
        
        this.baseUrl = 'https://api.openai.com';
        this.defaultVersion = 'v1';
        this.url = this.baseUrl +'/' + version;
    
    }
    getEngines(successcallback, failcallback) {
        this.request('/engines', 'GET',null,successcallback, failcallback);
    }
    getEngine(engine,successcallback, failcallback) {
        this.request(`/engines/${engine}`, 'GET',null,successcallback, failcallback);
    }
    search(engine, message, successcallback,failcallback,completecallback) {
        var body = JSON.stringify({
            prompt: message,
            max_tokens: 100,
            n: 1,
            stop: '\n',
            stream: true
          });
      this.requestwithStream(`/engines/${engine}/search`, 'POST', body, successcallback,failcallback,completecallback);
    }
    classify(message, successcallback,failcallback,completecallback) {
        var body = JSON.stringify({
            prompt: message,
            max_tokens: 100,
            n: 1,
            stop: '\n',
            stream: true
          });
      this.requestwithStream(`/engines/${engine}/classifications`, 'POST', body, successcallback,failcallback,completecallback);
    }
    answer(message) {
      var body = JSON.stringify({
            prompt: message,
            max_tokens: 100,
            n: 1,
            stop: '\n',
            stream: true
          });
      this.requestwithStream(`/engines/${engine}/answers`, 'POST', body, successcallback,failcallback,completecallback);
    }
  
    complete(engine, body, successcallback, failcallback,completecallback) {
        this.requestwithStream(`/engines/${engine}/completions`, 'POST', body, successcallback,failcallback,completecallback);
    }
  
   getFiles() {
        return this.request('/files', 'GET').then((r) => r.data);
    }
  
    uploadFile(file, jsonlines, purpose) {
        const data = new FormData();
        let fileJsonlines;
        if (Array.isArray(jsonlines)) {
            if (typeof jsonlines[0] === 'object') {
                jsonlines = jsonlines.map((j) => JSON.stringify(j));
            }
            fileJsonlines = jsonlines.join('\n');
        }
        else {
            fileJsonlines = jsonlines;
        }
        data.append('file', fileJsonlines, file);
        data.append('purpose', purpose);
        return this.request('/files', 'POST', data);
    }
    getFile(fileId) {
        return this.request(`/files/${fileId}`, 'GET');
    }
    deleteFile(fileId) {
        return this.request(`/files/${fileId}`, 'DELETE');
    }

    finetune(body) {
        return this.request(`/fine-tunes`, 'POST', body);
    }
    getFinetunes() {
        return this.request('/fine-tunes', 'GET').then((r) => r.data);
    }
    getFinetune(finetuneId) {
        return this.request(`/fine-tunes/${finetuneId}`, 'GET');
    }
    cancelFinetune(finetuneId) {
        return this.request(`/fine-tunes/${finetuneId}/cancel`, 'POST');
    }
    getFinetuneEvents(finetuneId) {
        return this.request(`/fine-tunes/${finetuneId}/events`, 'GET').then((r) => r.data);
    }
    createEmbedding(engine, body) {
        return this.request(`/engines/${engine}/embeddings`, 'POST', body);
    }  
    async request(path, method, body,successcallback,failcallback){
      if(body)
        body.stream = false;
      
      await fetch(this.url+path, {
          method: method,
          headers: this.headers,
          body: body
        }).then(response => {
          if(!response.ok && typeof failcallback === 'function')
              failcallback(response);
        
          if(typeof successcallback === 'function'){}
          else
            return response.json();
        }).then(data => {
          if(typeof successcallback === 'function'){
            successcallback(data);
          }
          console.log(data);
        }).catch(error => {
          console.error(error);
        });
    }
    async requestwithStream(path, method, body,successcallback,failcallback, completecallback){
      var handleStream = function() {
        return new TransformStream({
          transform(chunk, controller) {
            controller.enqueue(chunk);
            
          },
        });
      };

      var handleStreamCallBack = function(){
          return new WritableStream({
             write(chunk){
              var chunkstring = chunk.toString().slice(5).trim();
               
              console.log(chunk,chunkstring);
              if(chunkstring == '[DONE]'){
                console.log('done')
                if(typeof completecallback == 'function')                
                  completecallback();
                  return;
              }
               
              else if(typeof successcallback == 'function' && chunkstring != ''){
                
                 try{
                      const obj = JSON.parse(chunkstring)
                      successcallback(obj.choices[0].text);
                 }
                 catch(e)
                 {
                   failcallback();
                   console.log(e)
                 }
                }
             }
            
          })
      }

      if(body)
        JSON.parse(body).stream = true;
      
      await fetch(this.url+path, {
          method: method,
          headers: this.headers,
          body: body
        }).then(response => {
          if(!response.ok && typeof failcallback === 'function'){
              failcallback(response);
          }
          else{
            response.body
              .pipeThrough(new TextDecoderStream())
              .pipeThrough(handleStream())
              .pipeTo(handleStreamCallBack())
          }
        });  
    }
}
