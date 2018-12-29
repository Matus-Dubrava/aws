-   [Cloud Trail](#cloud-trail)
-   [Encryption](#encryption)
    -   [KMI](#kmi)
    -   [HSM](#hsm)

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
