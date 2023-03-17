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
    getmodels(successcallback, failcallback) {
        //this.request('/engines', 'GET',null,successcallback, failcallback);
      this.request('/models', 'GET',null,successcallback, failcallback);
    }
    getmodel(engine,successcallback, failcallback) {
        this.request(`/models/${engine}`, 'GET',null,successcallback, failcallback);
    }
/* chat POST https://api.openai.com/v1/chat/completions 
    {
      "model": "gpt-3.5-turbo",
      "messages": [{"role": "user", "content": "Hello!"}]
    }
*/
  chat(model,body, successcallback, failcallback,completecallback){
    //   this.requestwithStream("/chat/completions", 'POST', body, successcallback,failcallback,completecallback);
  //  this.createapicall('chat',model, body, successcallback, failcallback,completecallback);

    if(body){
        if(typeof body === "string"){          
          body = JSON.parse(body);          
        }
        body.stream = true;
      //  body.model = model;
      }        

      
        this.requestwithStream(`/engines/${model}/chat/completions`, 'POST', body, successcallback,failcallback,completecallback);
    }

  complete(model, body, successcallback, failcallback,completecallback) {
      if(body){
        if(typeof body === "string"){          
          body = JSON.parse(body);          
        }
        body.stream = true;
      //  body.model = model;
      }        

      
        this.requestwithStream(`/engines/${model}/completions`, 'POST', body, successcallback,failcallback,completecallback);
    }  

  createcomplete(model, body, successcallback, failcallback,completecallback) {
      if(body){
        if(typeof body === "string"){          
          body = JSON.parse(body);          
        }
        body.stream = true;
        body.model = model;
      }        

      
        this.requestwithStream(`/completions`, 'POST', body, successcallback,failcallback,completecallback);
    }
  createEdit(model, body, successcallback, failcallback,completecallback){

    this.createapicall('edits',model, body, successcallback, failcallback,completecallback);
  }

  createcode(model, instruction, successcallback, failcallback,completecallback){

    var body ={
      prompt: `Generate a javascript function for the following instruction: ${instruction}`,
      max_tokens: 100,
      n: 1,
      stop: null,
      temperature: 0.5,
      stream : true
    }
     
    this.requestwithStream(`/engines/${model}/completions`, 'POST', body, successcallback,failcallback,completecallback);
    
  }
  
  createapicall(api, model, body, successcallback, failcallback,completecallback) {
      if(body){
        if(typeof body === "string"){          
          body = JSON.parse(body);          
        }
        body.stream = true;
   //     body.model = model;
      }        

      
        this.requestwithStream(`/engines/${model}/${api}`, 'POST', body, successcallback,failcallback,completecallback);
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
      this.requestwithStream(`/engines/${model}/classifications`, 'POST', body, successcallback,failcallback,completecallback);
    }
    answer(message) {
      var body = JSON.stringify({
            prompt: message,
            max_tokens: 100,
            n: 1,
            stop: '\n',
            stream: true
          });
      this.requestwithStream(`/engines/${model}/answers`, 'POST', body, successcallback,failcallback,completecallback);
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

    finetune(body,successcallback, failcallback,completecallback) {
        return this.requestwithStream(`/fine-tunes`, 'POST', body, successcallback, failcallback,completecallback);
    }
    getFinetunes() {
        return this.request('/fine-tunes', 'GET');
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
        return this.requestwithStream(`/engines/${engine}/embeddings`, 'POST', body, successcallback, failcallback,completecallback);
    }  
    async request(path, method, body,successcallback,failcallback){
      if(body){
        if(typeof body === "string"){          
          body = JSON.parse(body);          
        }
        body.stream = false;
        body = JSON.stringify(body);
      }
      console.log(body)
      await fetch(this.url+path, {
          method: method,
          headers: this.headers,
          body: body
        }).then(response => {
          console.log(response)
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
              
              if(chunk==='data: [DONE]' || chunkstring == '[DONE]'){
               // console.log('done')
                if(typeof completecallback == 'function')                
                  completecallback();
                  return;
              }               
              else if( this.isJson(chunkstring)){                
                 try{
                  // console.log(chunkstring)
                      const obj = JSON.parse(chunkstring)
                    //  console.log(obj.error, obj.error.message)
                      if(error in obj){
                        if(typeof failcallback ==='function')
                          failcallback(obj.error.message)
                      
                      }
                      else if(typeof successcallback ==='function')
                        successcallback(obj.choices[0].text);
                 }
                 catch(e)
                 {
                   if(typeof failcallback ==='function')
                        failcallback('');
                      console.log(e)
                 }
              }
            }
            
          })
      }
      
      if(body){
        if(typeof body === "string"){          
          body = JSON.parse(body);          
        }
        body.stream = true;
      }
      await fetch(this.url+path, {
          method: method,
          headers: this.headers,
          body: JSON.stringify(body)
        }).then(response => {
          console.log(response)
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

    isJson(str) {
      try {
      JSON.parse(str);
      } catch (e) {
      return false;
      }
      return true;
    }
}
