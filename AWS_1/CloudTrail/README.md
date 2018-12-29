-   [Cloud Trail](#cloud-trail)
-   [Encryption](#encryption)
    -   [KMI](#kmi)
    -   [HSM](#hsm)
    -   [KMS](#kms)
    -   [CMK](#cmk)
-   [SNS](#sns)

# Cloud Trail

-   AWS CloudTrail is an AWS service that helps you enable governance, compliance, and operational and risk auditing of your AWS account
-   actions taken by a user, role, or an AWS service are recorded as events in CloudTrail
    -   events include actions taken in the AWS Management console, AWS CLI, and AWS SDKs and APIs
-   CloudTrail is enabled on your AWS account when you create it (but not CloudTrail logging)
-   when activity occurs in your AWS account, that activity is recorded in a CloudTrail event

    -   you can easily view recent events in the CloudTrail console by going to Event history

-   you can identify

    -   who or what took which action
    -   what resources were acted upon
    -   when the event occured, and other details to help you analyze and respond to activity in your AWS account

-   **this can benefit in the following areas**

    -   security
        -   visibility into your account activity is a key aspect of security best practices
    -   tracking changes in an AWS environment
        -   you can use CloudTrail to view, search, download, archive, analyze, and respond to account activity across your AWS infrastructure
    -   compliance and auditing
    -   operational and troubleshooting support

-   event history allows you to view, search, and download the past 90 days of activity in your account
-   you can create a **CloudTrail trail** to archive, analyze, and repond to changes in your AWS resources
-   CloudTrail logging, which is basically, sending the CloudTrail events to a bucket **is not enabled by default**
    -   you need to create a Trail and define a bucket, then CloudTrail will send events to this bucket i.e will start logging the identified/selected events
-   a trail is a configuration that enables delivery of events to an Amazon S3 bucket that you specify
-   you can deliver and analyze events in a trail with Amazon CloudWatch Logs and CW events
-   you can create a trail with the CloudTrail console, the AWS CLI, or the CloudTrail API

you can create two types of trails

-   **a trail that applies to all regions (recommended by AWS)**

    -   when you create a trail that applies to all regions
        -   CloudTrail records events in each region and delivers the CloudTrail event log files to an S3 bucket that you specify
            -   this is effectively like creating the trail in each of these regions
        -   if a region is added after you create a trail that applies to all regions
            -   that new regions is automatically included, and events in that region are logged
        -   this is the **default option** when you create a trail in the **CloudTrail console**

-   a trail that applies to all regions has the following advantages

    -   the configuration settings of the trail apply consistently across all regions
    -   receiving CloudTrail events from all regions in a single S3 bucket and, optionally, in a CloudWatch Logs log group
    -   managing trail configuration for all regions from one location
    -   immediately receiving CloudTrail events from a new region when launched
    -   ability to create trails in regions that you don't use often to monitor for unusual activity
    -   if CloudTrail is configured to use an Amazon SNS topic for the trail, SNS notifications about log file deliveries in all regions are sent to that single SNS topic

-   **a trail that applies to one region**

    -   when you create a trail that applies to one region
        -   CloudTrail records the events in that region only
        -   it then delivers the CloudTrail event log files to an Amazon S3 bucket that you specify
        -   if you create additional single trails, you can have those trails deliver CloudTrail event log files to the same Amazon S3 bucket or to separate buckets
        -   this is the default option when you create a trail using the **AWS CLI and the CloudTrail API**

-   for both types of trails, you can specify an Amazon S3 bucket **from aby region**

## limits

multiple trails per region

-   if you have different but related user groups, such as developers, security personnel, and IT auditors, you can create multiple trails per region
    -   this allows each group to receive its own copy of the log files
-   CloudTrail supports five trails per region

    -   a trail that applies to all regions counts as one trail in every region

-   you can store your log files in your bucket for as long as you want
    -   you can also define Amazon S3 lifecycle rules to archive or delete log files automatically
-   CloudTrail typically delivers log files within 15 minutes of account activity
    -   in addition, CloudTrail publishes log files multiple times an hour, about every five minutes
    -   these log files contain API calls from services in the account that support CloudTrail

# Encryption

-   encryption on any system requires three components

    -   data to encrypt
    -   a method to encrypt the data using a cryptographic algorithm (ex. AES)
    -   encryption keys to be used

-   choosing the right algorithm invilves evaluating security, performance, and compliance requirements specific to your application
-   although the selection of an encryption algorithm is important, protecting the keys from unathorized access is critical

## KMI

-   managing the security of encryption keys is often performed using a key management infrastructure (MKI)
-   a KMI is composed of two subcomponents
    -   the storage layer that protects the plaintext keys
    -   the management layer that authorizes key usage
-   a common way to protect keys in a KMI is to use a hardware security module (HSM)

## HSM

-   an HSM is a dedicated storage and data processing device that performs crypthographic operations using keys on the device
    -   an HSM typically provides tamper evidence, or resistence, to protect keys from unauthorized use
    -   a software-based authorization layer controls who can administer the HSM and which users or applications can use which keys in the HSM
-   AWS CloudHSM provides a FIPS 140-2 level 3 validated single-tenant HSM cluster in your Amazon VPC to store and use your keys

    -   **FIPS** (Federal Information Processing Standards) are a set of standards that describe document processing, encryption algorithms and other information technology standards for use within non-military government agencies and by government contractors and vendors who work with the agencies

-   when you use AWS CloudHSM
    -   you have exclusive controls over how your keys are used via an authorized mechanism independent from AWS
    -   you interact with keys in your AWS CloudHSM cluster similar to the way you interact with your applications running in Amazon EC2
    -   you can use AWS CloudHSM to support a variety of use cases, such as
        -   digital rights management (DRM)
        -   public key infrastructure (PKI)
        -   documents signing
        -   crypthographic functions

## KMS

-   AWS Key Management Service (KMS) is a managed service that makes it easy for you to create and control the encryption keys used to encrypt your data
-   the master keys that you create in AWS KMS are protected by FIPS 140-2 validated cryptograpic modules (HSM)
-   AWS KMS is integrated with most other AWS services that encrypt your data with encryption keys that you manage
-   AWS KMS is integrated with AWS CloudTrail

    -   by using CloudTrail you can monitor and investigate how and when your master keys have been used and by whom
    -   this will provice encryption key usage logs to help meet your auditing, regulatory and compliance needs

-   by using AWS KMS, you gain more control over access to data you encrypt
-   you can use the key management and cryptographic features directly in your applications or through AWS services that are integrated with AWS KMS
-   whether you are writing applications for AWS or using AWS services
    -   AWS KMS enables you to maintain control over who can use your master keys and gain access to your encrypted data
-   KMS is a global service

    -   **keys are regional**
    -   AWS KMS keys are never transmitted outside of the AWS regions in which they were created

-   AWS KMS stores multiple copies of encrypted versions of your keys in systems that are designed for 99.999999999% durability to help assure you that keys will be available when you need to access them
-   AWS KMS is deployed in multiple AZs within a region to provide high availability for your encryption keys
-   if you import keys into KMS, you must securelymaintain a copy of your keys so that you can re-import them at any time
-   the master keys created on your behalf by AWS KMS or imported by you cannot be exported from the service

## CMK

-   the primary resources in AWS KMS are customer master keys (CMKs)
    -   you can use a CMK to encrypt and decrypt up to 4 kilobytes (4096 bytes) of data
-   typically, you use CMKs to generate, encrypt, and decrypt the data keys that you use outside of AWS KMS to encrypt your data; **this strategy is known as envelope encryption**
-   AWS KMS stores, tracks, and protects your CMKs

    -   when you want to use a CMK, you access it through AWS KMS

-   AWS KSM hepls you to protect your master keys by storing and managing them securely
    -   Master keys stored in AWS KMS, known as customer master keys (CMKs), never leave the AWS KMS FIPS validated hardware security modules unencrypted
    -   to use an AWS KMS CMK, you must call AWS KMS
    -   this strategy differs from data keys that AWS KMS returns to you, optionally in plaintext

**There are two types of CMKs in AWS account**

-   **customer managed CMKs**
    -   these are CMKs that you create, manage, and use
        -   this includes enabling and disabling the CMK
        -   rotating its cryptographic material
        -   establishing the IAM policies and key policies that govern access to the CMK
        -   as well as using the CMK in cryptographic operations
    -   you can allow an AWS service to ue a customer CMK on your behalf, but you retain control of the CMK
-   **AWS managed CMKs**

    -   these are CMKs in your account that are created, managed and used on your behalf by an AWS service that is integrated with AWS KMS
    -   this CMK is unique to your AWS account and **region**
    -   **only the service that created the AWS managed CMK can use it**
    -   you can recognize AWS managed CMKs because their aliases have the format aws/service-name, such as aws/redshift
    -   typically, a service creates its AWS managed CMK in your account when you set up the service or the first time you use the CMK

-   the AWS service that integrate with AWS KMS can use it in many different ways

    -   some services create AWS managed CMKs in you account
    -   other services require that you specify a customer managed CMK that you have created
    -   others supports both types of CMKs to allow you to ease of an AWS managed CMK or the control of a customer-managed CMK

-   you have the option of selecting a specific master key to use when you want an AWS service to encrypt data on your behalf

-   a **default master key (defailt CMK) specific to each service is created in your account** as a convenience the first time you try to create an encrypted resource
    -   this key is managed by AWS KMS but you can always audit its use in AWS CloudTrail
-   AWS will update the policies on default master keys as needed to enable new features in supported services automatically
-   you can alternately create a **custom master key** in AWS KMS that you can then use in your own applicaitons of from within a supported AWS service
-   AWS does not modify policies on keys you create

# SNS

-   SNS is a fast, flexible, fully managed push notification service
-   it is a web service that coordiantes and manages the delivery or sending of messages (from cloud) to subscribing endpoints or clients
-   it allows for sending individual messages or fan-out messages to a large number or recipients to other distributed AWS (or non-AWS) services
    -   messages published to an SNS topics will be delivered to the subscribers immediately
-   SNS allows you to

    -   send push messages (not poll messages like SQS)
    -   scale as your needs grow
    -   engage audience directly or all at once
    -   deliver messages worldwide and across multiple transport protocols
    -   easily connect with other AWS services such as Cloud Watch, SQS, Lambda, S3
    -   message delivery analysis
    -   usage based pricing

-   in Amazon SNS, there are two types of clients -- publishers and subscribers -- also referred to as producers and consumers

    -   publishers communicate asynchronously with subscribers by producing and sending a message to a topic
    -   subscribers (web servers, email addresses, SQS queues, AWS lambda functions) consume or receive the message or notification over one of the supported protocols (Amazon SQS, HTTP/S, email, SNS, Lambda, Application) when they are subscribed to the topic

-   SNS topic

    -   is a logical access point and communication channel
    -   each topic has a unique name

-   a topic name is limited to 256 alphanumeric characters
-   the topic name must be unique withing AWS account
-   each topic is assigned an AWS ARN (Amazon Resource Name) once it gets created
-   a topic can support subscribers and notification deliveries over multiple protocols

    -   messages/requests published to a single topic can be delivered over multiple protocols as configured when creating each subscriber

-   **delivery formats / transport protocols (end points)**

    -   SMS: notification sent to registered phone number of the topic subscriber endpoint
    -   Email: messages are sent as text email to registered email addresses (subscribed to the topic)
    -   Email - JSON: messages/notifications are sent as JSON object to registered email addresses
        -   it is meant for applications that can process emails
    -   HTTP/HTTPS: subscribers specify a URL as part of their registration process. SNS messages/notifications will be sent as POST to the URL
    -   SQS: SNS will en-queue messages in the specified SQS queue as the notification endpoint
    -   AWS Lambda

-   when using Amazon SNS, you (as the owner) create a topic and control access to it by defining access policies that determine which publishers and subscribers can communicate with the topic
-   instead of including a specific destination address in each message, a publisher sends a message to the topic; a publisher sends messages to topics that they have created or to topics they have permission to publish to

    -   Amazon SNS matches the topic to a list of subscribers who have subscribed to that topic, and delivers the message to each of thos subscribers
    -   each topic has a unique name that indentifies the Amazon SNS endpoint for publishers to post messages and subscribers to register for notifications
    -   subscribers receive all messages published to the topic to which they subscribe, and all subscribers to a topic receive the same message

-   Amazon SNS stores all topic and message information within Amazon's proven network infrastructure and datacenters

    -   at least three copies of the data are stored across multiple AZs
        -   this means that no single computer or network failure renders Amazon SNS inaccessible

-   securing messages to topics

    -   all API calls made to Amazon SNS are validate for user's AWS ID and the signature
    -   AWS recommends that users secure their data over the wire by connecting to the secure SSL end-points

-   authenticating API calls

    -   all API calls made to Amazon SNS will validate authenticity by requiring that
        -   requests be signed with the secret key of the AWS ID account
        -   and verifying the signature included in the requests

-   Amazon SNS requires publishers with AWS IDs to validate their messages by signing messages with their secret AWS key; the signature is then validated by Amazon SNS

-   by default, only the topic owner (who created it) can publish to the SNS topic
-   the owner can set/change permissions to one or more users (with valid AWS IDs) to publish to his topic
-   only the owner of the topic can grant/change permissions for the topic
-   subscribers can be those with/without AWS IDs
    -   only subscribers with AWS ID can request subscriptions
-   both publishers and subscribers can use SSL to help secure the channel to send and receive messages

## SNS mobile push notifictations

-   SNS mobile push lets you use simple notification service to deliver push notifications to Apple, Google, Fire OS, and Windows devices
-   with push notifications, an installed mobile application can notify its users immediately by popping a notification about an event, without opening the application
-   push notifications can only be sent to devices that have your app installed, and whose users have opted in to receive them
-   SNS mobile push does not require explicit opt-in for sending push notifications, but iOS, Androif and Kindle Fire operating systems do require it
-   in order to send push notifications with SNS, you must also register your app and each installed device with SNS

Supported push notification platforms: currently, the following push notifications platforms are supported

-   Amazon Device Messaging (ADM)
-   Apple Push Notification Service (APNS)
-   Google Cloud Messaging (GCM)
-   Windows Push Notification Service (WNS) for windows 8+ and Windows Phone 8.1+
-   Microsoft Push Notification Service (MPNS) for Windows Phone 7+
-   Baidu Cloud Push for Android devices in China

How does it work

-   SNS topics can have subscribers from any supported push notifications platform, as well as any other endpoint type such as SMS or email
-   when you publish a notification to a topic, SNS will send identical copies of that message to each endpoint subscribed to the topic

Direct Addressing

-   it allows you to deliver notifications directly to a single endpoint, rather than sending identical messages to all subscribers of a topic
-   this comes in handy when you want to deliver precisely targeted messages to each recipient

-   you can get the history for SNS API calls made to your account by enabling CloudTrail
    -   cloudtrail will deliver log files for your SNS API calls
-   Cloudtrail logs will provide
    -   SNS API caller
    -   source IP address
    -   time of the API call
    -   request parameters
    -   response elemets retuned by SNS
-   this would be handy for security analysis, auditing, and operational/troubleshooting purposes
-   CloudTrail logs for SNS are available for authenticated API calls only
