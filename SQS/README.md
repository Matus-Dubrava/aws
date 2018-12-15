-   [SQS](#sqs)

# SQS

Amazon SQS is a web service that gives you access to a message queue that can be used to store messages while waiting for computer to process them.

Amazon SQS is a distributed queue system that enables web service applications to quickly and realiably queue messages that one component in the application generates to be consumed by another component. A queue is a temporary repository for messages that are awaiting processing.

Using Amazon SQS, you can decouple the components of an application so they run independently, easing message management between components.

Any component of a distributed application can store messages in the queue. Messages can contain up to 256 KB of text in any format. Any component can later retrieve the messages programatically using the Amazon SQS API.

The queue acts as a buffer between the component producing and saving data, and the component receiving the data for processing. This means the queue resolves issues that arise if the producer is producing work faster than the consumer can process it, or if the producer or consumer are only intermittently connected to the network.

-   SQS is pull-based, not push-based
    -   consumers are pulling data from the SQS, not the other way around
-   messages are 256 KB in size
-   messages can be kept in queue from 1 minute to 14 days
-   default retention period is 4 days
-   SQS guarantees that your messages will be processed at least once
-   SQS is a distributed queueing system
-   allows you to decouple the components of an application so that they are independent

## Types

### Queues

-   **Standard Queues** - best-effort ordering; message delivered at least once
-   **FIFO Queues** - ordering strictly preserved, messages delivered once, no duplicates (e.g. good for banking transactions which need to happen in strict order)

### Polling

-   **short polling** - retured immediately even if no messages are in the queue
-   **long polling** - polls the queue periodically and only returns a response when a message is in the queue or the timeout is reached

## Standard Queues

Amazon SQS offer standard as the default queue type. A standard queue lets you have a nearly-unlimited number of transactions per second. Standard queue guarantee that a message is delivered at least once. However, occasionally (because of the highly-distributed architecture that allows high throughput), more than one copy of a message might be delivered out of order. Standard queues provide best-effort ordering which ensures that messages are generally delivered in the same order as they are sent.

## FIFO Queues

The FIFO queue complements the standard queue. The most important feature of this queue type are FIFO (first-in-first-out) delivery and exactly-once processing: The order in which messages are sent and received is strictly preserved and a message is delivered once and remains available until a consumer processes and deletes it; duplicates are not introduced into the queue. FIFO queues also support message groups that allow multiple ordered message groups within a single queue. FIFO queues are limited to 300 trnasactions per second (TPS), but have all the capabilities of standard queue.

## SQS Visibility Timeout

The visibility timeout is the amount of time that the message is invisible in the SQS queue after a reader picks up the message. Provided the job is processed before the visibility time out expires, the message will then be deleted from the queue. If the job is not processed within that time, the message will become visible again and another reader will process it. This could result in the same message being delivered twice.

-   default visibility timeout is 30 seconds
-   increase it if your task takes > 30 seconds
-   maximum 12 hours
