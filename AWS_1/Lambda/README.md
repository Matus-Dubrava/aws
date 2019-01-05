-   [Lambda](#lambda)
    -   [building blocks](#building-blocks)
    -   [configuration and invocation](#configuration-and-invocation)
    -   [invocation types](#invocation-types)
    -   [event source mapping](#event-source-mapping)
    -   [use cases](#use-cases)
    -   [scaling](#scaling)
    -   [versioning](#versioning)
    -   [monitoring](#monitoring)

# Lambda

-   AWS Lambda is a compute service that lets you run code without provisioning or managing servers
-   with AWS Lambda, you can run code for virtually any type of application or backend service - **all with zero administration**
-   AWS Lambda manages all the administration, it manages

    -   provisioning and capacity of the compute fleet that offers a balance of memory, CPU, network, and other resources
    -   server and OS maintenance
    -   high availability and automatic scaling
    -   monitoring fleet health
    -   applying security patches
    -   deploying your code
    -   monitoring and logging your Lambda functions

-   AWS Lambda runs your code **on a high-available compute infrastructure**
-   AWS Lambda executes your code only when needed and **scales automatically**, from a few requests per day to thousands per second
-   you **pay only for the compute time you consume** - no charge when your code is not running
-   all you need to do is supply your code in the form of one or more Lambda functions to AWS Lambda (a compute service), in one of the languages that AWS Lambda supports, and the service can run the code on your behalf
-   AWS Lambda takes care of provisioning and managning the servers to run the code upon invocation

-   typically, the lifecycle for an AWS Lambda-based application includes authoring code, deploying code to AWS Lambda, and then monitoring and troubleshooting

    -   this is in exchange for flexibility, which means you cannot log in to compute instances, or customize the operating system or language runtime
        -   if you do want to manage your own compute, you can use EC2 or Elastic Beanstalk

-   you can use AWS Lambda to run your code in response to
    -   events, such as changes to data in an S3 bucket or an Amazon DynamoDB table
    -   to run your code in response to HTTP requests using API gateway
    -   invoke your code using API calls made using AWS SDKs
-   with these capabilities, you can use Lambda to easily build data processing triggers for AWS services like Amazon S3, DynamoDB, processing streaming data stored in Kinesis, or create your own back end that operates at AWS scale, performance, and security

-   AWS Lambda is an ideal compute platform for many application scenarions, provided that you can

    -   write your application code in languages supported by AWS Lambda
    -   and run within the AWS Lambda standard runtime environment and resources provided by Lambda

-   a typical serverless application consists of one or more Lambda functions triggered by events such as object uploads to S3, SNS notification, and API action
-   those functions can stand alone or leverage other resources such as DynamoDB tables or S3 buckets
-   the most basic serverless application is simply a function

-   Lambda function can asscess

    -   AWS services or non-AWS services
    -   AWS services running in AWS VPC (ex. redshift, Elasticache, RDS instances)
    -   non-AWS services running on EC2 instances in an AWS VPC
        -   additional configuration will be required for VPC access (security group and subnet ID)

-   AWS Lambda runs your function code securely within a VPC by default
    -   however, to enable your Lambda function to access resources inside your private VPC, you must provide additional VPC-specific configuration information that includes VPC subnet IDs and security group IDs

**S3 trigger example**

-   the user creates an object in a bucket
-   S3 detects the object created event
-   S3 invokes your Lambda function using the permissions provided by the execution role
-   S3 knows which Lambda function to invoke based on the event source mapping that is stored in the bucket notification configuration
-   AWS Lambda executes the Lambda function, specifying the event as a parameter

**Kinesis trigger example**

-   the custom application writes records to Kinesis stream
-   Lambda continuously polls the stream, and invokes the Lambda function when the service detects new records on the stream
-   AWS Lambda knows which stream to poll and which Lambda function to invoke based on the event source mapping you create in Lambda
-   The Lambda function is invoked with the incoming event

## building blocks

### Lambda function

-   the foundation, it is comprised of your custom code and any dependent libraries

### Event source

-   AWS service, such as SNS, or a custom serivce, that triggers your function and executes its logic

### Downstream resources

-   AWS service, such as DynamoDB tables or S3 bucket, that your Lambda function calls once it is triggered

### Log streams

-   while Lambda automatically monitors your function invocations and reports metrics to CloudWatch, you can annotate your function code with custom logging statements that allow you to analyze the execution flow and performance of your Lambda function to ensure it's working properly

### AWS Serverless Application Model (AWS SAM)

-   A model to define serverless applications, AWS SAM is natively supported by AWS CloudFormation and defines simplified syntax for expressing serverless resources

## configuration and invocation

-   A Lambda function consists of code and any associated dependencies
-   in addition, a Lambda function also has configuration information associated with it
-   initially, you specify the configuration information when you create a Lambda function
-   Lambda provides an API for you to update some of the configuration data

### Lambda function configuration information includes the following key elements

-   **compute resources that you need**

    -   you only specify the amount of memory you want to allocate for your Lambda function
        -   AWS Lambda allocates CPU power proportinal to the memory by using the same ratio as a general purpose EC2 instance type, such as an M3 type
    -   you can update the configuration and request additional memory in 64MB increments from 128MB to 3008MB
    -   functions larger than 1536MB are allocated muliple CPU threads, and multi-threaded or multi-process code is needed to take advantage of the additional performance

-   **maximum execution time (timeout)**

    -   you pay for the AWS resources that are used to run your Lambda function
    -   to prevent your Lambda function from running indefinitely, you specify a timeout
    -   when the specified timeout is reached, AWS Lambda terminates your Lambda function
    -   default is 3 seconds, maximum is 300 seconds (5 minutes) => no Lambda function can run longer than 5 minutes => if you need your Lambda function to run more than that, you need to split it into more smaller Lambda functions and let each previous Lambda function trigger then next one

-   **IAM role (execution role)**

    -   this is role that AWS Lambda assumes when it executes the Lambda function on your behalf

-   **handler name**
    -   the handler refers to the method in your code where AWS Lambda begins execution

## invocation types

-   when building application on AWS lambda, including serverless applications, the core components are Lambda functions and event sources
-   an event source is the AWS service or custom application that publishes events
-   a Lambd function is the custom code that processes the events

-   the use case for AWS Lambda can be grouped into the following categories
    -   **using AWS Lambda with AWS services as event sources**
        -   event sources publish events that cause the Lambda function to be invoked
    -   **on-demand Lambda function invocation over HTTPS (Amazon API Gateway)**
        -   you can also invike your Lambda function over HTTPS
        -   you can do this by defining a custom REST API and endpoints using API gateway
    -   **on-demand Lambda function invocation** (build your own event sources using custom apps)
        -   user applications such as client, mobile, or web applications can publish events and invoke Lambda functions using the AWS SDKs or AWS Mobile SDKs, such as the AWS Mobile SDK for Android
    -   **scheduled events**
        -   you can also set up AWS Lambda to invoke your code on a regular, scheduled basis using the AWS Lambda console
        -   you can specify a fixed rate (number of hours, days, or weeks) or you can specify a cron expression

## event source mapping

-   in AWS Lambda, Lambda functions and event sources are the core components in AWS Lambda
-   an event source is the entity, that publishes events, and a Lambda function is the custom code that processes the events
-   supported event sources refer to those AWS services that can be preconfigured to work with AWS Lambda

    -   the configuration is reffered to as **event source mapping which maps an event source to a Lambda function**
        -   if enables automaic invocation of your Lambda function when events occur
        -   each event source mapping identifies the type of events to publish and the Lambda function to invoke when event occurs
        -   the specific Lambda function then receives the event information as a parameter, your Lambda function code can then process the event

-   AWS Lambda supports many AWS services as even soureces
-   when you configure these event sources to trigger a Lambda function, the Lambda function is invoked automatically when event occurs. You define event source mapping, which is how you identify what events to track and which Lambda funciton to invoke
-   **event sources** maintain the event source mapping, **except for the stream-based services** (_amazon kinesis streams_ and _amazon dynamoDB stream_)
    -   **for the stream-based services, AWS Lambda** maintains the event source mapping, and Lambda function performas polling

**supported event sources**

-   S3
-   DynamoDB
-   Kinesis Streams
-   Kinesis Firehose
-   SNS
-   SES
-   Congnito
-   CloudFromation
-   CloudWatch logs
-   CloudWatch events
-   CodeCommit
-   Scheduled Events (powered by CloudWatch events)
-   Config
-   Alexa
-   Lex
-   API gateway
-   IoT button
-   CloudFront
-   invoking a Lambda function on demand

**invoking a Lambda function on demand**

-   in addition to invoking Lambda functions using event sources, you can also invoke your Lambda function on demand
-   you don't need to preconfigure any event source mapping in this case, however, make sure that the custom application has the necessary permissions to invoke your Lambda function
    -   for example, user applications can also generate events (build your own custom event sources)

## use cases

-   you have a photo sharing application. People use your application to upload photos, and the application stores these under user photos in an S3 bucket
-   Then, your application creates a thumbnal version of each user's photo and displays them on the user's profile page. A lambda function is created which will create a thumbnail automatically.
-   S3 is one of the supported AWS event sources that can publish object-created events and invoke your Lambda function
-   Your Lambda function code can read the photo object from the S3 bucket, create a thumbnail version, and then save it in another S3 bucket

## scaling

-   AWS Lambda will dynamically scale capacity in response to increased traffic, subject to your account's Account Level Concurrent Execution Limit
-   to hande any burst in traffic, Lambda will immediately increase your concurrent execution functions by a predetermined amount, dependent on which region it's executed
-   Lambda depends on EC2 to provide Elastic Network Interfaces for VPC-enabled Lambda functions, these functions are also subject to EC2's rate limits as they scale

-   concurrent executions refers to the number of executions of your function code that are happening at any given time
-   **event sources that aren't stream-based**
    -   if you create a Lambda function to process events from event sources that aren't stream-based
        -   each published event is a unit of work, in parallel, up to your account limits
        -   **this means one Lambda function invocation per event**
        -   therefore, the number of events (or requests) these event sources publish influences the concurrency
-   **stream-based event sources**
    -   for Lambda functions that process Kinesis or DynamoDB streams the number of shards is the unit of concurrency
    -   if your stream has 100 active shards, there will be at most 100 Lambda function invocations running concurrently

## versioning

-   versioning allows you to better manage your in-production Lambda function conde by enabling you to publish one or more versions of your Lambda function
    -   you can work with different versions
-   use versioning of your Lambda function in your development workflow, such as development, beta and production
-   each Lambda function version has a unique ARN; after you publish version, it is immutable (that is, it can't be changed)

## monitoring

### CloudWatch

-   AWS lambda automatically monitors Lambda functions on your behalf, reporting metrics throug CloudWatch
-   to help you monitor your code as it executes, Lambda automatically tracks the number of requests, the latency per reequest, and the number of requests resulting in an error and publishes the assocaited CloudWatch metrics
-   you can leverage these metrics to set CloudWatch custom alarm
-   you can view request rates and error rates, for each of your Lambda functions by **using the AWS Console, the CloudWatch console,** and other AWS resources

### X-Ray

-   AWS X-Ray is an AWS service that allows you to detect, analyze, and optimize performance issues with your AWS Lambda applications
-   X-Ray collects metadata from the Lambda service and any upstream or downstream services that make up your application
-   X-Ray uses this metadata to generate a detailed service graph that illustrates performance bottlenecks, latency spikes, and other issues that impact the performance of your Lambda application

### CloudTrail

-   AWS lambda is integrates with AWS CloudTrail, a service that captures API calls made by or on behalf of AWS Lambda in your AWS account and delivers the log files to an S# bucket that your specify
-   CloudTrail captures API calls made from the AWS Lambda console or from the AWS Lambda API
-   using the information collected by CloudTrail, you can determine what request was made to Lambda, the source IP address from which the request was made, who made the request, when it was made, and so on.
