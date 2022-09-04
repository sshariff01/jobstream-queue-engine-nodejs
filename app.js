import express from 'express'; //Import the express dependency
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import SampleRequestAsyncJob from './example-jobstream-workers/sample-request-async-job/sampleRequestAsyncJob.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();              //Instantiate an express app, the main work horse of this server
const port = 3333;                  //Save the port number where your server will be listening

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/post', async (req, res) => {
    const sampleRequestAsyncJob = await SampleRequestAsyncJob.create();
    const response = await sampleRequestAsyncJob.enqueue({
        message: req.body,
    });
    res.status(202).send(response);
});

app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Main server listening on port ${port}`);
});

const workerPort = 1000;
const workerId = `worker-001`;
const workerPollingInterval = 5000;

app.listen(workerPort, async () => {
    const sampleRequestAsyncJob = await SampleRequestAsyncJob.create({ workerId: workerId });

    setInterval(async () => { await sampleRequestAsyncJob.dequeue(); }, workerPollingInterval)
    console.log(`Background SampleRequestAsyncJob worker ${workerId} listening on port ${workerPort}, polling queue every ${workerPollingInterval} ms`);
});