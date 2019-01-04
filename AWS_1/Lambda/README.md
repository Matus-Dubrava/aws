-   [Lambda](#lambda)
    -   [building blocks](#building-blocks)
    -   [configuration and invocation](#configuration-and-invocation)
    -   [invocation types](#invocation-types)

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
