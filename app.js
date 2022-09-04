import express from 'express'; //Import the express dependency
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import SqsClient from './lib/sqsClient.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();              //Instantiate an express app, the main work horse of this server
const port = 3333;                  //Save the port number where your server will be listening

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sqsClient = new SqsClient({ queueName: 'Jobstream-v0' });

//Idiomatic expression in express to route and respond to a client request
app.get('/', (req, res) => {        //get requests to the root ("/") will route here
    res.sendFile('index.html', {root: __dirname});      //server responds by sending the index.html file to the client's browser
                                                        //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile
});

app.get('/get', async (req, res) => {
    const response = await sqsClient.readMessageFromQueue();
    res.status(200).send(response);
});

app.post('/post', async (req, res) => {
    const response = await sqsClient.writeToQueue({
        message: req.body,
    });
    res.status(202).send(response);
});

app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Now listening on port ${port}`);
});

setInterval(async () => { await sqsClient.readMessageFromQueue('Jobstream-v0'); }, 10000)