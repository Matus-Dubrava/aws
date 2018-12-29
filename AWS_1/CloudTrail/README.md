-   [Cloud Trail](#cloud-trail)
-   [Encryption](#encryption)
    -   [KMI](#kmi)
    -   [HSM](#hsm)
    -   [KMS](#kms)
    -   [CMK](#cmk)

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
