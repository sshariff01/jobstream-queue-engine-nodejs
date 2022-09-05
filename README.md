# Jobstream Queue Engine

## Overview

Jobstream Queue Engine is a wrapper around SQS. The goals of this project are to:
   1. Simplify the steps required for setting up asynchronous queue-based processing by abstracting away all of the boilerplate scaffolding and usage of the AWS SQS client SDK
   1. Provide an extremely simple interface for enqueueing and dequeueing messages to and from an AWS SQS queue, leaving your code clean and easy to reason about

## Installation

Using npm:
```bash
$> npm install -s jobstream-queue-engine
```

## Usage

In NodeJS:

1. Create a class for each asynchronous processing job. See the [async-workers](https://github.com/sshariff01/jobstream-nodejs-demo/tree/main/async-workers) folder of this repository for an example.

```js
// Import the Jobstream class
import Jobstream from "jobstream-queue-engine";

// Create a class that extends Jobstream. It must include 2 methods:
//   1. `static configFilePath()` - Path to a YAML config file that includes the following keys:
//      * sqs_queue_name
//      * aws_region
//      * aws_account_id
//   2. `async process({ message })` - Processing logic that the asynchronous job is intended to carry out.
class SampleAsyncJob extends Jobstream {
  static configFilePath() {
    /*
     * The following keys are required in the config file:
     *   - sqs_queue_name (example: 'SampleQueueFifo')
     *   - aws_region (example: 'us-east-1')
     *   - aws_account_id (example: '123456789012')
     */
    return '/path/to/config.yaml';
  }

  async process({ message }) {
    /*
     * Some set of steps to execute for processing the incoming message.
     *
     * --IMPORTANT--
     *  - A truthy return value will proceed to delete the message from SQS so that it is not re-enqueued.
     *  - A falsy return value will have SQS re-enqueue the message. AWS SQS will automatically re-enqueue
     *     messages up to the configured maxReceiveCount of the queue, or indefinitely if not configured.
     */
  }
}
```

2. Create an instance of the class you just created using the static "create" method that is exposed by `Jobstream`

```js
// The workerId argument is optional. When supplied, it appends the workerId to the job's logs. This is
// particularly useful in the likely scenario that you have multiple instances of the same type of job
// simultaenously processing messages.
const sampleRequestAsyncJob = await SampleRequestAsyncJob.create({ workerId: workerId });
```

3. Enqueue a message using any instance

```js
// Note: Messages are base64 encoded in transit. Encryption can be enabled on AWS for more stringent
//  security requirements.
const response = await sampleRequestAsyncJob.enqueue({
  message: {
    foo: 'bar',
  },
});
```

4. Dequeue a message using any instance

```js
// Note: The dequeue method will poll SQS for a message. If a message is received, it will then be base64 decoded
//  supplied as the 'message' parameter in your class's 'process({ message })' method.
const message = await sampleRequestAsyncJob.dequeue();
```

## More Examples

For a complete example end-to-end, see this [repo](https://github.com/sshariff01/jobstream-nodejs-demo).

## Future Development Plans

* JSON-formatted config files
* Support for message 'attributes' (different from the message 'body')
* SQS queue setup and configuration via AWS Cloudformation
* Integration with SNS and/or AWS Kinesis
