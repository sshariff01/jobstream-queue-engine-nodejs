import express from 'express'; //Import the express dependency
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import CustomerRequestAsyncJob from './async-workers/CustomerRequestAsyncJob.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();              //Instantiate an express app, the main work horse of this server
const port = 3333;                  //Save the port number where your server will be listening

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Idiomatic expression in express to route and respond to a client request
app.get('/', (req, res) => {        //get requests to the root ("/") will route here
    res.sendFile('index.html', {root: __dirname});      //server responds by sending the index.html file to the client's browser
                                                        //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile
});

app.get('/get', async (req, res) => {
    const customerRequestAsyncJob = new CustomerRequestAsyncJob();
    const response = await customerRequestAsyncJob.dequeue();
    res.status(200).send(response);
});

app.post('/post', async (req, res) => {
    const customerRequestAsyncJob = new CustomerRequestAsyncJob();
    const response = await customerRequestAsyncJob.enqueue({
        message: req.body,
    });
    res.status(202).send(response);
});

app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Main server listening on port ${port}`);
});

[
    "001", "002", "003"
].forEach((id, workerCount) => {
    const port = 1000 + workerCount;
    const workerId = `worker-${id}`;
    const pollingInterval = (workerCount + 1) * 2000;
    app.listen(port, () => {
        const customerRequestAsyncJob = new CustomerRequestAsyncJob({ workerId: workerId });
        setInterval(async () => { await customerRequestAsyncJob.dequeue(); }, pollingInterval)
        console.log(`Background CustomerRequestAsyncJob worker ${workerId} listening on port ${port}, polling queue every ${pollingInterval} ms`);
    });
});