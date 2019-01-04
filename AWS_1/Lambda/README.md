-   [Lambda](#lambda)

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
