-   [SWF](#swf)
    -   [SWF Starter](#swf-starter)
    -   [SWF Decider](#swf-decider)
    -   [Workers and Deciders](#workers-and-deciders)
    -   [Domains](#domains)

# SWF

Amazon Simple Wokrflow Service (Amazon SWF) is a web service that makes it easy to coordinate work across distributed application components. Amazon SWF enables applications for a range of use cases, including media processing, web application back-ends, business process workflow, and analytics pipelines, to be designed as a coordination of tasks.

Tasks represent invocations of various processing steps in an application which can be performaed by executable code, web service calls, human actions, and scripts.

-   Amazon SWF presents a task-oriented API, whereas Amazon SQS offers a message-oriented API.

-   Amazon SWF ensures that a task is assigned only once and is never duplicated. With Amazon SQS, you need to ensure that a message is processed only once.

-   Amazon SWF keeps track of all the tasks and events in an application. With Amazon SQS, you need to implement your own application-level tracking, especially if your application uses multiple queues.

## SWF Starter

An application that can initiate (start) a workflow. Could be your e-commerce website when placing an order or a mobile app searching for bus times.

## SWF Decider

The decider is a program that controls the coordination of tasks, i.e. the ordering, concurrency, and scheduling according to the application logic.

## Workers and Deciders

The workers and the decider can run on cloud infrastructure, such as Amazon EC2, or on machines behind firewalls. Amazon SWF brokers the interactions between workers and the decirer. It allows the decider to get consistent views into the progress of tasts and to initiate new tasks in an ongoing manner.

At the same time, Amazon SWF stores tasts, assigns them to workers when they are ready, and monitors their progress. It ensures that a task is assigned only once and is never duplicated. Since Amazon SWF maintains the application's state durably, workers and deciders don't have to keep track of execution state. They can run independently, and scale quickly.

## Domains

Your workflow and activity types and the workflow execution itself are all scoped to a domain. Domains isolate a set of types, executions, and task lists from others within the same account.

You can register a domain by using the AWS Management Console or by using the RegisterDomain action in the Amazon SWF API.

The parameters are specified in JavaScript Object Notation (JSON) format.

```javascript
// https://swf.us-east-1.amazonaws.com
RegisterDomain {
    "name": "12898147",
    "description": "music",
    "workflowExecutionRetentionPeriodInDays": "60"
}
```
